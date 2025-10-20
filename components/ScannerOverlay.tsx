import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

export function ScannerOverlay() {
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.row}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={styles.middle} />
          <View style={[styles.corner, styles.topRight]} />
        </View>

        <View style={styles.row}>
          <View style={styles.middle} />
          <View style={styles.scanArea} />
          <View style={styles.middle} />
        </View>

        <View style={styles.row}>
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={styles.middle} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    width: "80%",
    aspectRatio: 1,
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  corner: {
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  topLeft: {
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  middle: {
    flex: 1,
  },
  scanArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
