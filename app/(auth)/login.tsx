import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/Colors";
import { Scan } from "lucide-react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert("Sucesso", "Conta criada com sucesso!");
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Scan size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>OffList</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "Crie sua conta" : "Faça login em sua conta"}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchText}>
            {isSignUp
              ? "Já tem uma conta? Entrar"
              : "Não tem uma conta? Criar conta"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    alignItems: "center",
    padding: 16,
  },
  switchText: {
    color: Colors.primary,
    fontSize: 16,
  },
});
