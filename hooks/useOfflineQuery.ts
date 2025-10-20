import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ProductService } from '../services/ProductService';
import { useSync } from '../contexts/SyncContext';

export function useOfflineQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: any
) {
  const { isOnline } = useSync();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // Não tentar novamente se estiver offline
      if (!isOnline) return false;
      return failureCount < 3;
    },
    ...options,
  });

  // Atualizar dados quando voltar online
  useEffect(() => {
    if (isOnline && query.data) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [isOnline]);

  return {
    ...query,
    isOffline: !isOnline,
    isOnline,
  };
}