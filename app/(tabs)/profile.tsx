import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { StatsCard } from "../../components/StatsCard";
import { ProfileButton } from "../../components/ProfileButton";
import { ProductService } from "../../services/ProductService";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: ProductService.getProducts,
  });

  const handleSignOut = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const totalProducts = products?.length || 0;
  const uniqueProducts = new Set(products?.map((p) => p.barcode)).size;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.email || "Usuário"}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatsCard
          icon="cube-outline"
          value={totalProducts.toString()}
          label="Total de Scans"
        />
        <StatsCard
          icon="scan-outline"
          value={uniqueProducts.toString()}
          label="Produtos Únicos"
        />
      </View>

      <View style={styles.menu}>
        <ProfileButton
          icon="settings-outline"
          title="Configurações"
          onPress={() => Alert.alert("Configurações", "Em desenvolvimento")}
        />
        <ProfileButton
          icon="log-out-outline"
          title="Sair"
          color={Colors.error}
          onPress={handleSignOut}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.card,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  menu: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
});
