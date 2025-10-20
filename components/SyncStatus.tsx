import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSync } from "../contexts/SyncContext";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export function SyncStatus() {
  const { isOnline, isSyncing, pendingOperations, syncStatus, retrySync } =
    useSync();

  if (syncStatus === "synced" && isOnline) {
    return null; // Não mostrar quando estiver tudo sincronizado
  }

  const getStatusConfig = () => {
    switch (syncStatus) {
      case "offline":
        return {
          icon: "wifi-off-outline",
          color: Colors.error,
          text: "Offline",
          description: `${pendingOperations} operações pendentes`,
        };
      case "syncing":
        return {
          icon: "refresh-outline",
          color: Colors.warning,
          text: "Sincronizando...",
          description: `${pendingOperations} operações`,
        };
      case "pending":
        return {
          icon: "refresh-outline",
          color: Colors.warning,
          text: "Sincronização pendente",
          description: `${pendingOperations} operações`,
        };
      default:
        return {
          icon: "checkmark-circle-outline",
          color: Colors.success,
          text: "Sincronizado",
          description: "",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <TouchableOpacity
      style={[styles.container, !isOnline && styles.offline]}
      onPress={retrySync}
      disabled={isSyncing}>
      <Ionicons name={config.icon as any} size={16} color={config.color} />
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </Text>
        {config.description && (
          <Text style={styles.descriptionText}>{config.description}</Text>
        )}
      </View>
      {isSyncing && (
        <Ionicons name="refresh-outline" size={14} color={Colors.warning} style={styles.spinner} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  offline: {
    backgroundColor: Colors.error + "20",
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  spinner: {
    animation: "spin 1s linear infinite",
  },
});
