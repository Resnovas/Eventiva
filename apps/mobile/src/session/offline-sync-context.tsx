import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { PendingMutation, SyncState } from '../services/offlineSync';

interface OfflineSyncContextType extends SyncState {
  addPendingMutation: (mutation: Omit<PendingMutation, 'id' | 'timestamp' | 'retries'>) => Promise<void>;
  flushPendingMutations: (
    executor: (mutation: PendingMutation) => Promise<boolean>
  ) => Promise<{ succeeded: number; failed: number }>;
  clearAll: () => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | null>(null);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SyncState>({
    isOnline: true,
    pendingCount: 0,
    lastSyncAt: null,
    syncError: null,
  });

  const updateState = useCallback((partial: Partial<SyncState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    const handleOnline = () => updateState({ isOnline: true });
    const handleOffline = () => updateState({ isOnline: false });

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      updateState({ isOnline: window.navigator?.onLine ?? true });
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [updateState]);

  const mutationsRef = React.useRef<PendingMutation[]>([]);

  const addPendingMutation = useCallback(
    async (mutation: Omit<PendingMutation, 'id' | 'timestamp' | 'retries'>) => {
      const newMutation: PendingMutation = {
        ...mutation,
        id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        retries: 0,
      };
      mutationsRef.current = [...mutationsRef.current, newMutation];
      updateState({ pendingCount: mutationsRef.current.length });
    },
    [updateState]
  );

  const flushPendingMutations = useCallback(
    async (executor: (mutation: PendingMutation) => Promise<boolean>) => {
      let succeeded = 0;
      let failed = 0;
      const remaining: PendingMutation[] = [];

      for (const mutation of mutationsRef.current) {
        try {
          const ok = await executor(mutation);
          if (ok) {
            succeeded++;
          } else {
            mutation.retries++;
            if (mutation.retries < 3) {
              remaining.push(mutation);
            } else {
              failed++;
            }
          }
        } catch {
          mutation.retries++;
          if (mutation.retries < 3) {
            remaining.push(mutation);
          } else {
            failed++;
          }
        }
      }

      mutationsRef.current = remaining;
      setState((prev) => ({
        ...prev,
        pendingCount: remaining.length,
        lastSyncAt: Date.now(),
        syncError: failed > 0 ? `${failed} mutations failed after retries` : null,
      }));

      return { succeeded, failed };
    },
    []
  );

  const clearAll = useCallback(async () => {
    mutationsRef.current = [];
    setState({
      isOnline: true,
      pendingCount: 0,
      lastSyncAt: null,
      syncError: null,
    });
  }, []);

  return (
    <OfflineSyncContext.Provider
      value={{
        ...state,
        addPendingMutation,
        flushPendingMutations,
        clearAll,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = (): OfflineSyncContextType => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
};