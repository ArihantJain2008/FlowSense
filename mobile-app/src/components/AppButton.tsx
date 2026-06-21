import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import { useAppTheme } from "../theme";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
};

export default function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const theme = useAppTheme();

  const backgroundMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    ghost: "transparent",
    danger: theme.colors.danger,
  };

  const textColor =
    variant === "ghost"
      ? theme.colors.text
      : theme.colors.surfaceStrong;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            backgroundMap[variant],
          borderColor:
            variant === "ghost"
              ? theme.colors.border
              : "transparent",
          borderRadius:
            theme.radius.pill,
          opacity:
            disabled || loading
              ? 0.6
              : pressed
                ? 0.88
                : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={textColor}
        />
      ) : (
        <Text
          style={[
            theme.typography.button,
            { color: textColor },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
  },
});
