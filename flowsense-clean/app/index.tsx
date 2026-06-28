import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import { useAppTheme } from "../src/theme";

export default function Index() {
  const theme = useAppTheme();
  const { loaded, token } = useAuth();

  useEffect(() => {
    if (!loaded) {
      return;
    }

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [loaded, token]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:
          theme.colors.background,
      }}
    >
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
      />
    </View>
  );
}
