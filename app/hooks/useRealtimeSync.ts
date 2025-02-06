import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, tables } from '../api/supabaseClient';
import { Database } from '../types/database.types';

type TableName = keyof Database['public']['Tables'];

export function useRealtimeSync(userId: string | undefined) {
  const channelsRef = useRef<Record<TableName, RealtimeChannel>>({} as any);
  const tablesRef = useRef<Set<TableName>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const setupRealtimeSync = async () => {
      // Get list of all tables
      const tableNames = Object.keys(tables) as TableName[];

      // Set up realtime subscription for each table
      tableNames.forEach((tableName) => {
        if (tablesRef.current.has(tableName)) return;
        tablesRef.current.add(tableName);

        const channel = supabase.channel(`sync_${tableName}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName,
              filter: `user_id=eq.${userId}`
            },
            async (payload) => {
              console.log(`Realtime update for ${tableName}:`, payload);

              try {
                switch (payload.eventType) {
                  case 'INSERT': {
                    // Handle new record
                    const { data, error } = await tables[tableName]()
                      .select('*')
                      .eq('id', payload.new.id)
                      .single();

                    if (error) throw error;
                    // Emit event for UI updates
                    window.dispatchEvent(new CustomEvent(`${tableName}_updated`, {
                      detail: { type: 'INSERT', data }
                    }));
                    break;
                  }
                  case 'UPDATE': {
                    // Handle updated record
                    const { data, error } = await tables[tableName]()
                      .select('*')
                      .eq('id', payload.new.id)
                      .single();

                    if (error) throw error;
                    window.dispatchEvent(new CustomEvent(`${tableName}_updated`, {
                      detail: { type: 'UPDATE', data }
                    }));
                    break;
                  }
                  case 'DELETE': {
                    // Handle deleted record
                    window.dispatchEvent(new CustomEvent(`${tableName}_updated`, {
                      detail: { type: 'DELETE', id: payload.old.id }
                    }));
                    break;
                  }
                }
              } catch (error) {
                console.error(`Error handling ${tableName} sync:`, error);
                // Retry logic could be implemented here
              }
            }
          )
          .subscribe((status) => {
            console.log(`${tableName} subscription status:`, status);
            if (status === 'SUBSCRIBED') {
              console.log(`Successfully subscribed to ${tableName}`);
            }
          });

        channelsRef.current[tableName] = channel;
      });
    };

    setupRealtimeSync();

    // Cleanup function
    return () => {
      Object.values(channelsRef.current).forEach(channel => {
        channel.unsubscribe();
      });
      channelsRef.current = {} as any;
      tablesRef.current.clear();
    };
  }, [userId]);

  return {
    // Helper function to manually trigger sync
    triggerSync: async (tableName: TableName, action: 'INSERT' | 'UPDATE' | 'DELETE', data: any) => {
      try {
        switch (action) {
          case 'INSERT': {
            const { data: inserted, error } = await tables[tableName]()
              .insert(data)
              .select()
              .single();
            if (error) throw error;
            return inserted;
          }
          case 'UPDATE': {
            const { data: updated, error } = await tables[tableName]()
              .update(data)
              .eq('id', data.id)
              .select()
              .single();
            if (error) throw error;
            return updated;
          }
          case 'DELETE': {
            const { error } = await tables[tableName]()
              .delete()
              .eq('id', data.id);
            if (error) throw error;
            return data.id;
          }
        }
      } catch (error) {
        console.error(`Error triggering sync for ${tableName}:`, error);
        throw error;
      }
    }
  };
}
