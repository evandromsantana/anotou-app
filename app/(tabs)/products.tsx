import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductCard } from "../../components/ProductCard";
import { FilterModal, ProductFilters } from "../../components/FilterModal";
import { ProductService } from "../../services/ProductService";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function ProductsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    brands: [],
    categories: [],
    sortBy: "scannedAt",
    sortOrder: "desc",
  });

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: ProductService.getProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const deleteMutation = useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Alert.alert("Sucesso", "Produto deletado com sucesso!");
    },
    onError: (error) => {
      Alert.alert("Erro", "Falha ao deletar produto");
      console.error("Delete error:", error);
    },
  });

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // Aplicar busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtros de marca
    if (filters.brands.length > 0) {
      filtered = filtered.filter(
        (product) => product.brand && filters.brands.includes(product.brand)
      );
    }

    // Aplicar filtros de categoria
    if (filters.categories.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.category && filters.categories.includes(product.category)
      );
    }

    // Aplicar ordenação
    filtered = [...filtered].sort((a, b) => {
      let aValue: any = a[filters.sortBy];
      let bValue: any = b[filters.sortBy];

      if (filters.sortBy === "scannedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue === undefined || aValue === null) aValue = "";
      if (bValue === undefined || bValue === null) bValue = "";

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, filters]);

  const handleDeleteProduct = (id: string, name: string) => {
    Alert.alert(
      "Deletar Produto",
      `Tem certeza que deseja deletar "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const activeFilterCount = filters.brands.length + filters.categories.length;

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearFilters = () => {
    setFilters({
      brands: [],
      categories: [],
      sortBy: "scannedAt",
      sortOrder: "desc",
    });
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Erro ao carregar produtos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com busca e filtros */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome, código, marca..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close" size={18} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilters(true)}>
            <Ionicons
              name="filter"
              size={24}
              color={activeFilterCount > 0 ? "#fff" : Colors.primary}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Estatísticas de busca */}
        {searchTerm.length > 0 && (
          <View style={styles.searchStats}>
            <Text style={styles.searchStatsText}>
              {filteredAndSortedProducts.length} produto(s) encontrado(s)
            </Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearSearchText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filtros ativos */}
        {(filters.brands.length > 0 || filters.categories.length > 0) && (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersText}>Filtros ativos:</Text>
            <View style={styles.filtersList}>
              {filters.brands.map((brand) => (
                <View key={brand} style={styles.filterTag}>
                  <Text style={styles.filterTagText}>Marca: {brand}</Text>
                </View>
              ))}
              {filters.categories.map((category) => (
                <View key={category} style={styles.filterTag}>
                  <Text style={styles.filterTagText}>
                    Categoria: {category}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Limpar filtros</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Lista de produtos */}
      <FlatList
        data={filteredAndSortedProducts}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onDelete={() => handleDeleteProduct(item.id!, item.name)}
            onPress={() => handleProductPress(item.id!)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>
              {isLoading
                ? "Carregando produtos..."
                : "Nenhum produto encontrado"}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchTerm || activeFilterCount > 0
                ? "Tente ajustar sua busca ou filtros"
                : "Comece escaneando um produto usando o scanner"}
            </Text>
            {(searchTerm || activeFilterCount > 0) && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => {
                  clearSearch();
                  clearFilters();
                }}>
                <Text style={styles.emptyStateButtonText}>
                  Limpar busca e filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          filteredAndSortedProducts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de filtros */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={setFilters}
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchStatsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clearSearchText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  activeFilters: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  activeFiltersText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  filtersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  filterTag: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  error: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
