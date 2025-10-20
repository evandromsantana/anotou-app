import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import { SyncProvider } from "../contexts/SyncContext";
import { SyncStatus } from "../components/SyncStatus";
import { Colors } from "../constants/Colors";
import { ThemeProvider } from "styled-components";
import { SoundProvider } from "../contexts/SoundContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

function RootLayoutNav() {
  return (
    <SyncProvider>
      <SyncStatus />
      <Stack>{/* ... existing Stack content ... */}</Stack>
    </SyncProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SoundProvider>
          <RootLayoutNav />
        </SoundProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
