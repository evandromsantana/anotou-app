import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onSnapshot } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_QUEUE_KEY = 'offline_sync_queue';
const LAST_SYNC_KEY = 'last_sync_timestamp';

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: string;
  data: any;
  timestamp: number;
  retries: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean | null>(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncOperation[]>([]);
  const queryClient = useQueryClient();

  // Monitorar estado da conexão
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      
      if (online) {
        processSyncQueue();
      }
    });

    return unsubscribe;
  }, []);

  // Carregar fila de sincronização do AsyncStorage
  useEffect(() => {
    loadSyncQueue();
  }, []);

  const loadSyncQueue = async () => {
    try {
      const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (queueData) {
        const queue = JSON.parse(queueData);
        setSyncQueue(queue);
      }
    } catch (error) {
      console.error('Erro ao carregar fila de sincronização:', error);
    }
  };

  const saveSyncQueue = async (queue: SyncOperation[]) => {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setSyncQueue(queue);
    } catch (error) {
      console.error('Erro ao salvar fila de sincronização:', error);
    }
  };

  const addToSyncQueue = async (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>) => {
    const newOperation: SyncOperation = {
      ...operation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retries: 0
    };

    const newQueue = [...syncQueue, newOperation];
    await saveSyncQueue(newQueue);
    
    // Se estiver online, tentar sincronizar imediatamente
    if (isOnline) {
      processSyncQueue();
    }
  };

  const processSyncQueue = async () => {
    if (isSyncing || syncQueue.length === 0 || !isOnline) return;

    setIsSyncing(true);
    const queue = [...syncQueue];
    
    for (const operation of queue) {
      try {
        await processSyncOperation(operation);
        
        // Remover operação bem-sucedida da fila
        const updatedQueue = queue.filter(op => op.id !== operation.id);
        await saveSyncQueue(updatedQueue);
        
      } catch (error) {
        console.error(`Erro ao processar operação ${operation.id}:`, error);
        
        // Incrementar contador de tentativas
        operation.retries += 1;
        
        // Se excedeu o número máximo de tentativas, remover da fila
        if (operation.retries >= 3) {
          console.warn(`Operação ${operation.id} excedeu número máximo de tentativas`);
          const updatedQueue = queue.filter(op => op.id !== operation.id);
          await saveSyncQueue(updatedQueue);
        } else {
          // Atualizar fila com nova tentativa
          const updatedQueue = queue.map(op => 
            op.id === operation.id ? operation : op
          );
          await saveSyncQueue(updatedQueue);
        }
      }
    }
    
    setIsSyncing(false);
    
    // Invalidar queries do React Query para atualizar a UI
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const processSyncOperation = async (operation: SyncOperation) => {
    // Esta função será implementada no serviço de sincronização
    const { syncOperation } = await import('@/services/SyncService');
    return await syncOperation(operation);
  };

  const clearSyncQueue = async () => {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    setSyncQueue([]);
  };

  const getSyncStatus = () => {
    return {
      isOnline,
      isSyncing,
      pendingOperations: syncQueue.length,
      lastSync: AsyncStorage.getItem(LAST_SYNC_KEY)
    };
  };

  return {
    isOnline,
    isSyncing,
    syncQueue,
    addToSyncQueue,
    processSyncQueue,
    clearSyncQueue,
    getSyncStatus
  };
}