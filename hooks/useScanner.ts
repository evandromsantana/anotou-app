import { useState } from 'react';
import { Vibration } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSound } from './useSound';
import { ProductService } from '../services/ProductService';

export function useScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const { playSound } = useSound();
  const queryClient = useQueryClient();

  const scanMutation = useMutation({
    mutationFn: ProductService.scanProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleBarcodeScanned = async (data: string) => {
    if (isScanning) return;

    setIsScanning(true);
    Vibration.vibrate(100);
    
    try {
      await playSound();
      await scanMutation.mutateAsync(data);
    } catch (error) {
      console.error('Scan error:', error);
    }

    setTimeout(() => setIsScanning(false), 2000);
  };

  return {
    isScanning,
    handleBarcodeScanned,
    isLoading: scanMutation.isPending,
    error: scanMutation.error,
  };
}