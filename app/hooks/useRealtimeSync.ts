import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase, tables } from '../api/supabaseClient';
import { Database } from '../types/database.types';

type TableName = keyof typeof tables;
type SyncError = {
  tableName: TableName;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  error: Error;
  timestamp: Date;
  retryCount: number;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useRealtimeSync(userId: string | undefined) {
  const channelsRef = useRef<Record<TableName, RealtimeChannel>>({} as any);
  const tablesRef = useRef<Set<TableName>>(new Set());
  const errorsRef = useRef<SyncError[]>([]);

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
                await handleRealtimeChange(tableName, payload);
              } catch (error) {
                const syncError: SyncError = {
                  tableName,
                  operation: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                  error: error as Error,
                  timestamp: new Date(),
                  retryCount: 0
                };
                errorsRef.current.push(syncError);
                await retryOperation(tableName, payload, syncError);
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
    const handleRealtimeChange = async (tableName: TableName, payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
      switch (payload.eventType) {
        case 'INSERT': {
          const { data, error } = await tables[tableName.replace(/_/g, '') as keyof typeof tables]()
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (error) throw error;
          window.dispatchEvent(new CustomEvent(`${tableName}_updated`, {
            detail: { type: 'INSERT', data }
          }));
          break;
        }
        case 'UPDATE': {
          const { data, error } = await tables[tableName.replace(/_/g, '') as keyof typeof tables]()
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
          window.dispatchEvent(new CustomEvent(`${tableName}_updated`, {
            detail: { type: 'DELETE', id: payload.old.id }
          }));
          break;
        }
      }
    };

    const retryOperation = async (
      tableName: TableName,
      payload: RealtimePostgresChangesPayload<{ [key: string]: any }>,
      syncError: SyncError
    ) => {
      if (syncError.retryCount >= MAX_RETRIES) {
        console.error(`Max retries reached for ${tableName} sync:`, syncError);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (syncError.retryCount + 1)));
      
      try {
        await handleRealtimeChange(tableName, payload);
        // Remove error if retry succeeds
        errorsRef.current = errorsRef.current.filter(e => e !== syncError);
      } catch (error) {
        syncError.retryCount++;
        syncError.error = error as Error;
        syncError.timestamp = new Date();
        await retryOperation(tableName, payload, syncError);
      }
    };

    return () => {
      Object.values(channelsRef.current).forEach(channel => {
        channel.unsubscribe();
      });
      channelsRef.current = {} as any;
      tablesRef.current.clear();
      errorsRef.current = [];
    };
  }, [userId]);

  const getSyncErrors = useCallback(() => errorsRef.current, []);
  const clearSyncErrors = useCallback(() => {
    errorsRef.current = [];
  }, []);

  const triggerSync = async (tableName: TableName, action: 'INSERT' | 'UPDATE' | 'DELETE', data: any) => {
    try {
      let result;
      switch (action) {
        case 'INSERT': {
          const { data: inserted, error } = await tables[tableName.replace(/_/g, '') as keyof typeof tables]()
            .insert({ ...data, user_id: userId })
            .select()
            .single();
          if (error) throw error;
          result = inserted;
          break;
        }
        case 'UPDATE': {
          const { data: updated, error } = await tables[tableName.replace(/_/g, '') as keyof typeof tables]()
            .update(data)
            .eq('id', data.id)
            .select()
            .single();
          if (error) throw error;
          result = updated;
          break;
        }
        case 'DELETE': {
          const { error } = await tables[tableName.replace(/_/g, '') as keyof typeof tables]()
            .delete()
            .eq('id', data.id);
          if (error) throw error;
          result = data.id;
          break;
        }
      }

      // Dispatch event to notify UI
      window.dispatchEvent(new CustomEvent(`${tableName}_updated`, {
        detail: { type: action, data: result }
      }));

      return result;
    } catch (error) {
      const syncError: SyncError = {
        tableName,
        operation: action,
        error: error as Error,
        timestamp: new Date(),
        retryCount: 0
      };
      errorsRef.current.push(syncError);
      console.error(`Error triggering sync for ${tableName}:`, error);
      throw error;
    }
  };

  return {
    triggerSync,
    getSyncErrors,
    clearSyncErrors
  };
}
