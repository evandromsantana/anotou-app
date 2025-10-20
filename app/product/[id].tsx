import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductService } from "../../services/ProductService";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => ProductService.getProductById(id as string),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.back();
    },
    onError: (error) => {
      Alert.alert("Erro", "Falha ao deletar produto");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Deletar Produto",
      "Tem certeza que deseja deletar este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id as string),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Produto não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do Produto</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/product/edit/${id}`)}>
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageSection}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="cube-outline" size={64} color={Colors.gray} />
            </View>
          )}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.detailRow}>
            <Ionicons
              name="barcode-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.detailLabel}>Código de Barras:</Text>
            <Text style={styles.detailValue}>{product.barcode}</Text>
          </View>

          {product.brand && (
            <View style={styles.detailRow}>
              <Ionicons
                name="cube-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Marca:</Text>
              <Text style={styles.detailValue}>{product.brand}</Text>
            </View>
          )}

          {product.category && (
            <View style={styles.detailRow}>
              <Ionicons
                name="cube-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Categoria:</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data do Scan:</Text>
            <Text style={styles.detailValue}>
              {new Date(product.scannedAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Número de Scans:</Text>
            <Text style={styles.detailValue}>{product.scannedCount}</Text>
          </View>

          {product.price && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preço:</Text>
              <Text style={styles.detailValue}>
                R$ {product.price.toFixed(2)}
              </Text>
            </View>
          )}

          {product.quantity && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantidade:</Text>
              <Text style={styles.detailValue}>{product.quantity}</Text>
            </View>
          )}

          {product.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Observações:</Text>
              <Text style={styles.notesText}>{product.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.card,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsSection: {
    padding: 24,
    gap: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    minWidth: 120,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
    flex: 1,
  },
  notesSection: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
});
