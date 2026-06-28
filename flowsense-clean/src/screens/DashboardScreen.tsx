import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
} from "expo-router";
import {
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import StatCard from "../components/StatCard";
import { getBudgetSummary, getExpenses } from "../services/dashboardService";
import { useAppTheme } from "../theme";
import { formatCurrency, formatDate } from "../utils/format";
import type {
  DashboardSummary,
  ExpenseItem,
} from "./types";

const quickActions = [
  {
    label: "Add Expense",
    route: "/expenses",
    icon: "remove-circle-outline",
  },
  {
    label: "Add Income",
    route: "/income",
    icon: "add-circle-outline",
  },
  {
    label: "Savings Goals",
    route: "/savings-goals",
    icon: "flag-outline",
  },
  {
    label: "Analytics",
    route: "/analytics",
    icon: "pie-chart-outline",
  },
] as const;

export default function DashboardScreen() {
  const theme = useAppTheme();
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [summary, setSummary] =
    useState<DashboardSummary | null>(
      null
    );
  const [expenses, setExpenses] =
    useState<ExpenseItem[]>([]);

  const loadDashboard = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [budgetData, expenseData] =
        await Promise.all([
          getBudgetSummary(),
          getExpenses(),
        ]);

      setSummary(budgetData);
      setExpenses(expenseData);
    } catch (loadError: any) {
      setError(
        loadError?.response?.data
          ?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);  

  useFocusEffect(
  useCallback(() => {
    loadDashboard();
  }, [])
);

  const spent = Number(
    summary?.spent ?? 0
  );
  const budget = Number(
    summary?.budget ?? 0
  );
  const budgetUsed =
    budget > 0 ? (spent / budget) * 100 : 0;
  const recentExpenses = expenses
    .slice()
    .sort((a, b) => {
      const left = new Date(
        b.createdAt ?? 0
      ).getTime();
      const right = new Date(
        a.createdAt ?? 0
      ).getTime();

      return left - right;
    })
    .slice(0, 5);

  const header = (
    <View style={styles.header}>
      <View
        style={[
          styles.logo,
          {
            backgroundColor:
              theme.colors.primary,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.h3,
            { color: theme.colors.surfaceStrong },
          ]}
        >
          F
        </Text>
      </View>
      <View style={styles.headerText}>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted },
          ]}
        >
          Welcome Back
        </Text>
        <Text
          style={[
            theme.typography.h1,
            { color: theme.colors.text },
          ]}
        >
           Financial Overview
        </Text>
      </View>
    </View>
  );

  const summaryGrid = loading ? (
    <View style={styles.grid}>
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <Card
            key={index}
            style={styles.skeletonCard}
          >
            <SkeletonBlock
              height={12}
              width="30%"
            />
            <SkeletonBlock
              height={28}
              width="75%"
            />
          </Card>
        )
      )}
    </View>
  ) : (
    <View style={styles.grid}>
      <StatCard
        label="Monthly Budget"
        value={formatCurrency(
          summary?.budget
        )}
      />
      <StatCard
        label="Total Income"
        value={formatCurrency(
          summary?.income
        )}
        tone="success"
      />
      <StatCard
        label="Total Expenses"
        value={formatCurrency(
          summary?.spent
        )}
        tone="secondary"
      />
      <StatCard
        label="Remaining Balance"
        value={formatCurrency(
          summary?.remaining
        )}
        tone="accent"
      />
    </View>
  );

  return (
    <ScreenContainer
      header={header}
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadDashboard(true)
            }
            tintColor={theme.colors.primary}
          />
        ),
      }}
    >
      {summaryGrid}

      {error ? (
        <EmptyState
          title="Dashboard unavailable"
          message={error}
          actionLabel="Try Again"
          onAction={() =>
            loadDashboard()
          }
          icon="warning-outline"
        />
      ) : null}

      {!loading && summary ? (
        <Card
          style={{
            gap: theme.spacing.md,
            backgroundColor:
              theme.colors.surfaceStrong,
          }}
        >
          <View style={styles.rowBetween}>
            <Text
              style={[
                theme.typography.h3,
                { color: theme.colors.text },
              ]}
            >
              Budget Progress
            </Text>
            <Text
              style={[
                theme.typography.caption,
                {
                  color:
                    theme.colors.textMuted,
                },
              ]}
            >
              {Math.round(budgetUsed)}% used
            </Text>
          </View>
          <ProgressBar
            progress={budgetUsed}
            valueLabel={`${formatCurrency(
              spent
            )} / ${formatCurrency(
              budget
            )}`}
          />
        </Card>
      ) : null}

      <View
        style={[
          styles.sectionHeader,
          styles.rowBetween,
        ]}
      >
        <Text
          style={[
            theme.typography.h2,
            { color: theme.colors.text },
          ]}
        >
          Quick Actions
        </Text>
        <AppButton
          label="Recurring"
          onPress={() =>
            router.push(
              "/recurring-expenses"
            )
          }
          variant="ghost"
        />
      </View>

      <View style={styles.quickGrid}>
        {quickActions.map((item) => (
          <Pressable
            key={item.label}
            onPress={() =>
              router.push(item.route)
            }
            style={[
              styles.quickCard,
              {
                backgroundColor:
                  theme.colors.surfaceStrong,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={theme.colors.primary}
            />
            <Text
              style={[
                theme.typography.bodyStrong,
                { color: theme.colors.text },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={[
          styles.sectionHeader,
          styles.rowBetween,
        ]}
      >
        <Text
          style={[
            theme.typography.h2,
            { color: theme.colors.text },
          ]}
        >
          Recent Expenses
        </Text>
        <AppButton
          label="Allocate Savings"
          onPress={() =>
            router.push(
              "/allocate-savings"
            )
          }
          variant="ghost"
        />
      </View>

      {!loading && recentExpenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          message="Start tracking your latest spending to see it appear here."
          actionLabel="Add Expense"
          onAction={() =>
            router.push("/expenses")
          }
          icon="receipt-outline"
        />
      ) : null}

      {loading
        ? Array.from({ length: 3 }).map(
            (_, index) => (
              <Card
                key={index}
                style={{
                  gap: theme.spacing.sm,
                }}
              >
                <SkeletonBlock
                  height={14}
                  width="42%"
                />
                <SkeletonBlock
                  height={18}
                  width="65%"
                />
              </Card>
            )
          )
        : recentExpenses.map((item) => (
            <Card
              key={item.id}
              style={{
                gap: theme.spacing.sm,
                backgroundColor:
                  theme.colors.surfaceStrong,
              }}
            >
              <View
                style={styles.rowBetween}
              >
                <Text
                  style={[
                    theme.typography.h3,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    theme.typography.bodyStrong,
                    {
                      color:
                        theme.colors.danger,
                    },
                  ]}
                >
                  {formatCurrency(
                    item.amount
                  )}
                </Text>
              </View>
              <View
                style={styles.rowBetween}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    {
                      color:
                        theme.colors.textMuted,
                    },
                  ]}
                >
                  {item.category}
                </Text>
                <Text
                  style={[
                    theme.typography.caption,
                    {
                      color:
                        theme.colors.textMuted,
                    },
                  ]}
                >
                  {formatDate(
                    item.createdAt
                  )}
                </Text>
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
  skeletonCard: {
    flex: 1,
    minWidth: "47%",
    gap: 12,
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
