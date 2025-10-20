import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../types/Product";
import { Colors } from "../constants/Colors";

interface ProductCardProps {
  product: Product;
  onDelete: () => void;
  onPress: () => void;
}

export function ProductCard({ product, onDelete, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="barcode-outline" size={24} color={Colors.gray} />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.barcode}>{product.barcode}</Text>
        {product.brand && <Text style={styles.brand}>{product.brand}</Text>}
        <Text style={styles.date}>
          Escaneado em {new Date(product.scannedAt).toLocaleDateString("pt-BR")}
        </Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  barcode: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
    marginBottom: 2,
  },
  brand: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
});
