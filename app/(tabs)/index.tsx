import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Vibration, Text, Button } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSound } from "../../contexts/SoundContext";
import { ScannerOverlay } from "../../components/ScannerOverlay";
import { ProductService } from "../../services/ProductService";
import { ProductSchema } from "../../types/Product";
import { Colors } from "../../constants/Colors";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();
  const { playScanSound } = useSound();

  const scanMutation = useMutation({
    mutationFn: ProductService.scanProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Alert.alert(
        "Produto Escaneado!",
        `Código: ${product.barcode}\n${
          product.name || "Produto não encontrado"
        }`
      );
    },
    onError: (error) => {
      Alert.alert("Erro", "Falha ao escanear produto");
      console.error("Scan error:", error);
    },
  });

  

  

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (isScanning) return;

    setIsScanning(true);
    Vibration.vibrate(100);
    await playScanSound();

    try {
      scanMutation.mutate(data);
    } catch (error) {
      console.error("Scan error:", error);
    }

    setTimeout(() => setIsScanning(false), 2000);
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Precisamos de permissão para acessar a câmera
        </Text>
        <Button onPress={requestPermission} title="Conceder Permissão" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={isScanning ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
        }}>
        <ScannerOverlay />
        
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
});
