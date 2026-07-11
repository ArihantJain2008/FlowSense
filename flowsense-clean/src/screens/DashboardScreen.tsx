import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import PeriodFilterBar from "../components/PeriodFilterBar";
import ProgressBar from "../components/ProgressBar";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import StatCard from "../components/StatCard";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { useFilters } from "../context/FiltersContext";
import { getOverview } from "../services/dashboardService";
import { useAppTheme } from "../theme";
import { formatDate } from "../utils/format";
import type { AppTransaction, DashboardSummary } from "./types";

const quickActions = [
  { label: "Add Expense", route: "/expenses", icon: "remove-circle-outline" },
  { label: "Add Income", route: "/income", icon: "add-circle-outline" },
  { label: "Goals", route: "/savings-goals", icon: "flag-outline" },
  { label: "Analytics", route: "/analytics", icon: "pie-chart-outline" },
] as const;

export default function DashboardScreen() {
  const theme = useAppTheme();
  const { formatMoney } = useCurrencyFormatter();
  const { toQueryParams } = useFilters();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<AppTransaction[]>([]);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const data = await getOverview(toQueryParams());
      setSummary(data.summary);
      setTransactions(data.recentTransactions || []);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toQueryParams]);

  useRefreshOnFocus(loadDashboard);

  const spent = Number(summary?.spent ?? 0);
  const budget = Number(summary?.budget ?? 0);
  const budgetUsed = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <ScreenContainer
      header={
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
            <Text style={[theme.typography.h3, { color: theme.colors.surfaceStrong }]}>F</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Historical overview</Text>
            <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Financial Overview</Text>
          </View>
        </View>
      }
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} tintColor={theme.colors.primary} />
        ),
      }}
    >
      <PeriodFilterBar />

      {loading ? (
        <View style={styles.skeletonPage}>
          <View style={styles.headerSkeleton}>
            <SkeletonBlock height={56} width={56} radius={18} />
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonBlock height={12} width="35%" />
              <SkeletonBlock height={24} width="72%" />
            </View>
          </View>

          <View style={styles.grid}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`stat-${index}`} style={styles.skeletonCard}>
                <SkeletonBlock height={12} width="45%" />
                <SkeletonBlock height={24} width="70%" />
              </Card>
            ))}
          </View>

          <Card style={styles.skeletonPanel}>
            <SkeletonBlock height={14} width="35%" />
            <SkeletonBlock height={14} width="100%" />
            <SkeletonBlock height={14} width="80%" />
          </Card>

          <Card style={styles.skeletonPanel}>
            <SkeletonBlock height={14} width="40%" />
            <View style={styles.skeletonRows}>
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.skeletonRow}>
                  <SkeletonBlock height={12} width="60%" />
                  <SkeletonBlock height={12} width="24%" />
                </View>
              ))}
            </View>
          </Card>
        </View>
      ) : (
        <View style={styles.grid}>
          <StatCard label="Budget" value={formatMoney(summary?.budget)} />
          <StatCard label="Income" value={formatMoney(summary?.income)} tone="success" />
          <StatCard label="Expenses" value={formatMoney(summary?.spent)} tone="secondary" />
          <StatCard label="Remaining" value={formatMoney(summary?.remaining)} tone="accent" />
        </View>
      )}

      {error ? (
        <EmptyState title="Dashboard unavailable" message={error} actionLabel="Try Again" onAction={() => loadDashboard()} icon="warning-outline" />
      ) : null}

      {!loading && summary ? (
        <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
          <View style={styles.rowBetween}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Budget Progress</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{Math.round(budgetUsed)}% used</Text>
          </View>
          <ProgressBar progress={budgetUsed} valueLabel={`${formatMoney(spent)} / ${formatMoney(budget)}`} />
        </Card>
      ) : null}

      <View style={[styles.sectionHeader, styles.rowBetween]}>
        <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Quick Actions</Text>
        <AppButton label="Recurring" onPress={() => router.push("/recurring-expenses")} variant="ghost" />
      </View>

      <View style={styles.quickGrid}>
        {quickActions.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route)}
            style={[
              styles.quickCard,
              {
                backgroundColor: theme.colors.surfaceStrong,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.sectionHeader, styles.rowBetween]}>
        <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Recent Transactions</Text>
        <AppButton label="Allocate Savings" onPress={() => router.push("/allocate-savings")} variant="ghost" />
      </View>

      {!loading && transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Your selected period has no activity yet. Try a broader date range or add a transaction."
          actionLabel="Add Expense"
          onAction={() => router.push("/expenses")}
          icon="receipt-outline"
        />
      ) : null}

      {transactions.map((item) => (
        <Card key={`${item.type}-${item.id}`} style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong }}>
          <View style={styles.rowBetween}>
            <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>{item.title}</Text>
            <Text
              style={[
                theme.typography.bodyStrong,
                {
                  color: item.type === "expense" ? theme.colors.danger : theme.colors.success,
                },
              ]}
            >
              {formatMoney(item.amount)}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
              {item.type === "income" ? item.source || "Income" : item.category}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{formatDate(item.date)}</Text>
          </View>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  skeletonPage: {
    gap: 12,
  },
  headerSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 4,
  },
  skeletonCard: {
    flex: 1,
    minWidth: "47%",
    gap: 12,
  },
  skeletonPanel: {
    gap: 12,
  },
  skeletonRows: {
    gap: 10,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionHeader: {
    marginTop: 4,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
});
