import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useFilters } from "../context/FiltersContext";
import { useAppTheme } from "../theme";
import AppInput from "./AppInput";
import FilterButton from "./filters/FilterButton";
import FilterModal from "./filters/FilterModal";
import DateSelector from "./filters/DateSelector";

const presetLabels: Record<string, string> = {
  today: "Today",
  thisWeek: "This Week",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisYear: "This Year",
  custom: "Custom Range",
};

export default function PeriodFilterBar() {
  const [showSelector, setShowSelector] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const theme = useAppTheme();
  const { filters, navigationLabel, shiftPeriod, updateFilters } = useFilters();
  const activeFilterCount = useMemo(
    () =>
      [
        filters.category !== "All",
        filters.paymentMethod !== "All",
        Boolean(filters.merchant),
        Boolean(filters.minAmount),
        Boolean(filters.maxAmount),
        filters.favoriteOnly,
      ].filter(Boolean).length,
    [filters]
  );

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Pressable
        onPress={() => setShowSelector(true)}
        style={{
          borderRadius: theme.radius.pill,
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: theme.colors.surfaceStrong,
          borderWidth: 1,
          borderColor: theme.colors.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={[
            theme.typography.body,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {presetLabels[filters.preset] ?? "Select Period"}
        </Text>

        <Ionicons name="chevron-down" size={18} color={theme.colors.text} />
      </Pressable>

      <View
        style={{
          borderRadius: 22,
          paddingHorizontal: 10,
          paddingVertical: 8,
          backgroundColor: theme.colors.surfaceStrong,
          borderWidth: 1,
          borderColor: theme.colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Pressable
          accessibilityLabel="Previous year"
          onPress={() => {
            void shiftPeriod(-1, "year");
          }}
          style={styles.iconButton}
        >
          <Ionicons name="play-skip-back-outline" size={18} color={theme.colors.text} />
        </Pressable>

        <Pressable
          accessibilityLabel="Previous month"
          onPress={() => {
            void shiftPeriod(-1, "month");
          }}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
        </Pressable>

        <View style={styles.labelWrap}>
          <Text
            numberOfLines={1}
            style={[
              theme.typography.bodyStrong,
              {
                color: theme.colors.text,
                textAlign: "center",
              },
            ]}
          >
            {navigationLabel}
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Next month"
          onPress={() => {
            void shiftPeriod(1, "month");
          }}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-forward" size={18} color={theme.colors.text} />
        </Pressable>

        <Pressable
          accessibilityLabel="Next year"
          onPress={() => {
            void shiftPeriod(1, "year");
          }}
          style={styles.iconButton}
        >
          <Ionicons name="play-skip-forward-outline" size={18} color={theme.colors.text} />
        </Pressable>
      </View>

      <DateSelector visible={showSelector} onClose={() => setShowSelector(false)} />

      <AppInput
        label="Search"
        placeholder="Merchant, note, category, amount..."
        value={filters.search}
        onChangeText={(value) => {
          void updateFilters({ search: value });
        }}
      />

      <FilterButton activeCount={activeFilterCount} onPress={() => setShowFilters(true)} />
      <FilterModal visible={showFilters} onClose={() => setShowFilters(false)} />
    </View>
  );
}

const styles = {
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  labelWrap: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
  },
};
