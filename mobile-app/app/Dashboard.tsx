import {
  View,
  Text,
  Button,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

export default function Dashboard() {
  const handleLogout =
    async () => {
      await AsyncStorage.removeItem(
        "token"
      );

      router.replace(
        "/login"
      );
    };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          marginBottom: 20,
        }}
      >
        FlowSense Dashboard
      </Text>

      <Text
        style={{
          marginBottom: 20,
        }}
      >
        Logged In Successfully
      </Text>

      <Button
        title="Logout"
        onPress={
          handleLogout
        }
      />
    </View>
  );
}