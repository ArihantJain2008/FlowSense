import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "../src/context/AuthContext";
import { FiltersProvider } from "../src/context/FiltersContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import { useAppTheme } from "../src/theme";

function RootNavigator() {
  const theme = useAppTheme();

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
    >
      <StatusBar
        style={
          theme.scheme === "dark"
            ? "light"
            : "dark"
        }
      />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="allocate-savings"
        />
        <Stack.Screen
          name="recurring-expenses"
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <FiltersProvider>
          <RootNavigator />
        </FiltersProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
