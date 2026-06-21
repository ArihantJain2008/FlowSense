import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      const token =
        await AsyncStorage.getItem(
          "token"
        );

      if (token) {
        router.replace(
          "/dashboard"
        );
      } else {
        router.replace(
          "/login"
        );
      }
    };

    checkAuth();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator
        size="large"
      />
    </View>
  );
}