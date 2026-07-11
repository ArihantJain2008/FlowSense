import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import Card from "./Card";
import { useAppTheme } from "../theme";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";
import { formatDate } from "../utils/format";
import type { ExpenseItem } from "../screens/types";

type Props = {
  expense: ExpenseItem;
};

export default function ExpenseCard({ expense }: Props) {
  const theme = useAppTheme();
  const { formatMoney } = useCurrencyFormatter();

  return (
    <Card
      style={{
        backgroundColor: theme.colors.surfaceStrong,
        gap: theme.spacing.sm,
      }}
    >
      <View style={styles.rowBetween}>
        <Text
          style={[
            theme.typography.h3,
            { color: theme.colors.text, flex: 1 },
          ]}
        >
          {expense.title}
        </Text>

        <Text
          style={[
            theme.typography.bodyStrong,
            { color: theme.colors.danger },
          ]}
        >
          {formatMoney(expense.amount)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons
          name="storefront-outline"
          size={16}
          color={theme.colors.textMuted}
        />

        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, flex: 1 },
          ]}
        >
          {[expense.category, expense.merchant, expense.paymentMethod]
            .filter(Boolean)
            .join(" • ")}
        </Text>
      </View>

      {expense.note ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted },
          ]}
        >
          {expense.note}
        </Text>
      ) : null}

      <View style={styles.rowBetween}>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted },
          ]}
        >
          {formatDate(expense.date || expense.createdAt)}
        </Text>

        {expense.isFavorite ? (
          <Ionicons name="star" size={18} color={theme.colors.accent} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
