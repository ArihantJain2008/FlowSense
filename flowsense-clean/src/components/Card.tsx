import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useAppTheme } from "../theme";

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export default function Card({
  children,
  style,
}: CardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor:
            theme.colors.surface,
          borderColor:
            theme.colors.border,
          borderRadius:
            theme.radius.lg,
        },
        theme.shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    overflow: "hidden",
  },
});
