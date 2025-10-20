import React, { createContext, useContext, useEffect } from "react";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { enableOfflinePersistence } from "../services/firebase";

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  syncStatus: string;
  retrySync: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, isSyncing, syncQueue, processSyncQueue } = useOfflineSync();

  useEffect(() => {
    // Habilitar persistência offline do Firestore
    enableOfflinePersistence();
  }, []);

  useEffect(() => {
    // Tentar sincronizar quando voltar online
    if (isOnline && syncQueue.length > 0) {
      processSyncQueue();
    }
  }, [isOnline, syncQueue.length]);

  const retrySync = () => {
    if (isOnline) {
      processSyncQueue();
    }
  };

  const syncStatus = React.useMemo(() => {
    if (!isOnline) return "offline";
    if (isSyncing) return "syncing";
    if (syncQueue.length > 0) return "pending";
    return "synced";
  }, [isOnline, isSyncing, syncQueue.length]);

  const value = {
    isOnline,
    isSyncing,
    pendingOperations: syncQueue.length,
    syncStatus,
    retrySync,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
