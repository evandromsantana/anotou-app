import React from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "styled-components";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { SoundProvider } from "../contexts/SoundContext";
import theme from "./src/theme";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SoundProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </SoundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
