import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../services/ProductService';
import { Product } from '../types/Product';

export function useProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getProducts,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    if (!debouncedSearch) return products;

    return products.filter(product =>
      product.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.barcode?.includes(debouncedSearch) ||
      product.brand?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  const searchStats = useMemo(() => {
    const total = products?.length || 0;
    const filtered = filteredProducts.length;
    
    return {
      total,
      filtered,
      isFiltered: debouncedSearch.length > 0,
    };
  }, [products, filteredProducts, debouncedSearch]);

  return {
    products: filteredProducts,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    searchStats,
  };
}