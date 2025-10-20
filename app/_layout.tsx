import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import { SyncProvider, SyncStatus } from "../contexts/SyncContext";
import { Colors } from "../constants/Colors";

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
        {user ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                title: "Detalhes",
                headerStyle: {
                  backgroundColor: Colors.primary,
                },
                headerTintColor: "#fff",
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack>
    </SyncProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}
