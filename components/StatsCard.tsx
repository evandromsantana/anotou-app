import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

interface StatsCardProps {
  icon: string;
  value: string;
  label: string;
}

export function StatsCard({ icon, value, label }: StatsCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
