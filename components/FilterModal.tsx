import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ProductService } from "../services/ProductService";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ProductFilters) => void;
  currentFilters: ProductFilters;
}

export interface ProductFilters {
  brands: string[];
  categories: string[];
  sortBy: "scannedAt" | "name" | "scannedCount";
  sortOrder: "asc" | "desc";
}

export function FilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
}: FilterModalProps) {
  const [selectedFilters, setSelectedFilters] =
    useState<ProductFilters>(currentFilters);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: ProductService.getProducts,
  });

  const brands = useMemo(() => {
    if (!products) return [];
    return Array.from(
      new Set(products.map((p) => p.brand).filter(Boolean))
    ) as string[];
  }, [products]);

  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ) as string[];
  }, [products]);

  const handleApply = () => {
    onApply(selectedFilters);
    onClose();
  };

  const toggleBrand = (brand: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const toggleCategory = (category: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filtros</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ordenar por</Text>
            <View style={styles.sortOptions}>
              {[
                { value: "scannedAt", label: "Data do Scan" },
                { value: "name", label: "Nome" },
                { value: "scannedCount", label: "Número de Scans" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    selectedFilters.sortBy === option.value &&
                      styles.sortOptionSelected,
                  ]}
                  onPress={() =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      sortBy: option.value as any,
                    }))
                  }>
                  <Text
                    style={[
                      styles.sortOptionText,
                      selectedFilters.sortBy === option.value &&
                        styles.sortOptionTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                  {selectedFilters.sortBy === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.orderOptions}>
              <TouchableOpacity
                style={[
                  styles.orderOption,
                  selectedFilters.sortOrder === "asc" &&
                    styles.orderOptionSelected,
                ]}
                onPress={() =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    sortOrder: "asc",
                  }))
                }>
                <Text
                  style={[
                    styles.orderOptionText,
                    selectedFilters.sortOrder === "asc" &&
                      styles.orderOptionTextSelected,
                  ]}>
                  Crescente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.orderOption,
                  selectedFilters.sortOrder === "desc" &&
                    styles.orderOptionSelected,
                ]}
                onPress={() =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    sortOrder: "desc",
                  }))
                }>
                <Text
                  style={[
                    styles.orderOptionText,
                    selectedFilters.sortOrder === "desc" &&
                      styles.orderOptionTextSelected,
                  ]}>
                  Decrescente
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {brands.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Marcas</Text>
              <View style={styles.filterList}>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.filterItem,
                      selectedFilters.brands.includes(brand) &&
                        styles.filterItemSelected,
                    ]}
                    onPress={() => toggleBrand(brand)}>
                    <Text
                      style={[
                        styles.filterItemText,
                        selectedFilters.brands.includes(brand) &&
                          styles.filterItemTextSelected,
                      ]}>
                      {brand}
                    </Text>
                    {selectedFilters.brands.includes(brand) && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorias</Text>
              <View style={styles.filterList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterItem,
                      selectedFilters.categories.includes(category) &&
                        styles.filterItemSelected,
                    ]}
                    onPress={() => toggleCategory(category)}>
                    <Text
                      style={[
                        styles.filterItemText,
                        selectedFilters.categories.includes(category) &&
                          styles.filterItemTextSelected,
                      ]}>
                      {category}
                    </Text>
                    {selectedFilters.categories.includes(category) && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() =>
              setSelectedFilters({
                brands: [],
                categories: [],
                sortBy: "scannedAt",
                sortOrder: "desc",
              })
            }>
            <Text style={styles.resetButtonText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  sortOptions: {
    gap: 8,
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  sortOptionSelected: {
    backgroundColor: Colors.primary + "20",
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  sortOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "500",
  },
  orderOptions: {
    flexDirection: "row",
    gap: 8,
  },
  orderOption: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    alignItems: "center",
  },
  orderOptionSelected: {
    backgroundColor: Colors.primary + "20",
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  orderOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  orderOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "500",
  },
  filterList: {
    gap: 8,
  },
  filterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  filterItemSelected: {
    backgroundColor: Colors.primary + "20",
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  filterItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterItemTextSelected: {
    color: Colors.primary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});
