import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import { SyncProvider, SyncStatus } from "../contexts/SyncContext";
import { Colors } from "../constants/Colors";
import { ThemeProvider } from "styled-components";
import { SoundProvider } from "../contexts/SoundContext";
import theme from "../src/theme";

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
      <Stack>
        {/* ... existing Stack content ... */}
      </Stack>
    </SyncProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <SoundProvider>
            <RootLayoutNav />
          </SoundProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
