import React, { createContext, useContext, useCallback } from 'react';
import { useRealtimeSubscriptions } from '../hooks/useRealtimeSubscriptions';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type RealtimeContextType = {
  addCallback: (table: string, callback: (payload: RealtimePostgresChangesPayload<any>) => void) => void;
  removeCallback: (table: string) => void;
};

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const callbacks = React.useRef<Record<string, (payload: RealtimePostgresChangesPayload<any>) => void>>({});

  const addCallback = useCallback((table: string, callback: (payload: RealtimePostgresChangesPayload<any>) => void) => {
    callbacks.current[table] = callback;
  }, []);

  const removeCallback = useCallback((table: string) => {
    delete callbacks.current[table];
  }, []);

  useRealtimeSubscriptions(callbacks.current);

  return (
    <RealtimeContext.Provider value={{ addCallback, removeCallback }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
