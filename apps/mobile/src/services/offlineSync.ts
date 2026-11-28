export interface PendingMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'event' | 'contact' | 'venue' | 'vendor' | 'schedule';
  entityId?: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

export interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  lastSyncAt: number | null;
  syncError: string | null;
}

const MAX_RETRIES = 3;

function generateId(): string {
  return `mut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class OfflineSyncService {
  private pendingMutations: PendingMutation[] = [];
  private listeners: Array<() => void> = [];
  private syncState: SyncState = {
    isOnline: true,
    pendingCount: 0,
    lastSyncAt: null,
    syncError: null,
  };

  async getPendingMutations(): Promise<PendingMutation[]> {
    return [...this.pendingMutations];
  }

  async addPendingMutation(
    mutation: Omit<PendingMutation, 'id' | 'timestamp' | 'retries'>
  ): Promise<void> {
    const newMutation: PendingMutation = {
      ...mutation,
      id: generateId(),
      timestamp: Date.now(),
      retries: 0,
    };
    this.pendingMutations.push(newMutation);
    this.syncState.pendingCount = this.pendingMutations.length;
    this.notifyListeners();
  }

  async removePendingMutation(id: string): Promise<void> {
    this.pendingMutations = this.pendingMutations.filter((m) => m.id !== id);
    this.syncState.pendingCount = this.pendingMutations.length;
    this.notifyListeners();
  }

  async flushPendingMutations(
    executor: (mutation: PendingMutation) => Promise<boolean>
  ): Promise<{ succeeded: number; failed: number }> {
    let succeeded = 0;
    let failed = 0;
    const remaining: PendingMutation[] = [];

    for (const mutation of this.pendingMutations) {
      try {
        const ok = await executor(mutation);
        if (ok) {
          succeeded++;
        } else {
          mutation.retries++;
          if (mutation.retries < MAX_RETRIES) {
            remaining.push(mutation);
          } else {
            failed++;
          }
        }
      } catch {
        mutation.retries++;
        if (mutation.retries < MAX_RETRIES) {
          remaining.push(mutation);
        } else {
          failed++;
        }
      }
    }

    this.pendingMutations = remaining;
    this.syncState.pendingCount = remaining.length;
    this.syncState.lastSyncAt = Date.now();
    this.syncState.syncError = failed > 0 ? `${failed} mutations failed after retries` : null;
    this.notifyListeners();

    return { succeeded, failed };
  }

  async getSyncState(): Promise<SyncState> {
    return { ...this.syncState };
  }

  setOnlineStatus(isOnline: boolean): void {
    this.syncState.isOnline = isOnline;
    this.notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l());
  }

  async clearAll(): Promise<void> {
    this.pendingMutations = [];
    this.syncState = {
      isOnline: true,
      pendingCount: 0,
      lastSyncAt: null,
      syncError: null,
    };
    this.notifyListeners();
  }
}

export const offlineSync = new OfflineSyncService();