import { StyleSheet, Text, View } from "react-native";

import Card from "./Card";
import { useAppTheme } from "../theme";

type StatCardProps = {
  label: string;
  value: string;
  tone?: "primary" | "secondary" | "accent" | "success";
};

export default function StatCard({
  label,
  value,
  tone = "primary",
}: StatCardProps) {
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
          styles.dot,
          {
            backgroundColor:
              theme.colors[tone],
          },
        ]}
      />
      <Text
        style={[
          theme.typography.caption,
          { color: theme.colors.textMuted },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          theme.typography.h3,
          styles.value,
          { color: theme.colors.text },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "47%",
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  value: {
    marginTop: 4,
  },
});
