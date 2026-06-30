import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Card from "./Card";
import AppButton from "./AppButton";
import { useAppTheme } from "../theme";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon = "sparkles-outline",
}: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor:
            theme.colors.surfaceStrong,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor:
              theme.colors.surfaceMuted,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={theme.colors.primary}
        />
      </View>
      <Text
        style={[
          theme.typography.h3,
          { color: theme.colors.text },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          theme.typography.body,
          styles.message,
          { color: theme.colors.textMuted },
        ]}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 28,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
  },
});
