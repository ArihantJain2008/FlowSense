import { useEffect } from "react";
import { View, Text } from "react-native";

export default function Home() {
  useEffect(() => {
    console.log("Page Loaded");
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>FlowSense Mobile Works</Text>
    </View>
  );
}