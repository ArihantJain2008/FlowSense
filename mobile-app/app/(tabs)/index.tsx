import { useEffect } from "react";
import { View, Text } from "react-native";

import { registerUser } from "../../src/services/authService";

export default function Home() {
  useEffect(() => {
    const test = async () => {
      try {
        const data = await registerUser(
          "Mobile User",
          `mobile${Date.now()}@test.com`,
          "123456"
        );

        console.log("SUCCESS:", data);
      } catch (error) {
        console.log("ERROR:", error);
      }
    };

    test();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>FlowSense Mobile</Text>
    </View>
  );
}