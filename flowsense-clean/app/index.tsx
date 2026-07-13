import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import Card from "../src/components/Card";
import SkeletonBlock from "../src/components/SkeletonBlock";
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
        backgroundColor:
          theme.colors.background,
        paddingHorizontal: 24,
      }}
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 10 }}>
          <SkeletonBlock height={16} width="32%" />
          <SkeletonBlock height={34} width="62%" />
          <SkeletonBlock height={14} width="90%" />
        </View>
        <Card style={{ gap: 14, backgroundColor: theme.colors.surfaceStrong }}>
          <SkeletonBlock height={14} width="40%" />
          <SkeletonBlock height={48} width="100%" />
          <SkeletonBlock height={48} width="100%" />
          <SkeletonBlock height={48} width="100%" />
        </Card>
      </View>
    </View>
  );
}
