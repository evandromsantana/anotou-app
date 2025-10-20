import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

interface ProfileButtonProps {
  icon: string;
  title: string;
  onPress: () => void;
  color?: string;
}

export function ProfileButton({
  icon,
  title,
  onPress,
  color = Colors.text,
}: ProfileButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={[styles.title, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
});
