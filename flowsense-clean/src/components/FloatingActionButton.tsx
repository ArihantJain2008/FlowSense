import { Pressable, StyleSheet, Text } from "react-native";

import { useAppTheme } from "../theme";

type FloatingActionButtonProps = {
  onPress: () => void;
};

export default function FloatingActionButton({
  onPress,
}: FloatingActionButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.primary,
          opacity: pressed ? 0.85 : 1,
          shadowColor: "#000",
          transform: [
            { translateY: pressed ? 2 : 0 },
            { scale: pressed ? 0.97 : 1 },
          ],
        },
      ]}
    >
      <Text
        style={[
          theme.typography.h1,
          {
            color: "white",
            marginTop: -2,
          },
        ]}
      >
        +
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 20,
    bottom: 20,

    width: 60,
    height: 60,

    borderRadius: 30,

    justifyContent: "center",
    alignItems: "center",

    elevation: 12,
  },
});