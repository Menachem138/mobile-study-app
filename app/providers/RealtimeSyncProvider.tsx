import React, { createContext, useContext, useEffect } from 'react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { supabase } from '../api/supabaseClient';
import { Database } from '../types/database.types';

type TableName = keyof Database['public']['Tables'];
type SyncContextType = {
  triggerSync: (tableName: TableName, action: 'INSERT' | 'UPDATE' | 'DELETE', data: any) => Promise<any>;
  getSyncErrors: () => any[];
  clearSyncErrors: () => void;
};

const RealtimeSyncContext = createContext<SyncContextType | null>(null);

export function useRealtimeSyncContext() {
  const context = useContext(RealtimeSyncContext);
  if (!context) {
    throw new Error('useRealtimeSyncContext must be used within a RealtimeSyncProvider');
  }
  return context;
}

export function RealtimeSyncProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = React.useState<string>();
  const { triggerSync, getSyncErrors, clearSyncErrors } = useRealtimeSync(userId);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        setUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUserId(undefined);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <RealtimeSyncContext.Provider value={{
      triggerSync: triggerSync as any,
      getSyncErrors,
      clearSyncErrors
    }}>
      {children}
    </RealtimeSyncContext.Provider>
  );
}
