import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import StatCard from "../components/StatCard";
import { fetchAnalytics } from "../services/analyticsService";
import { useAppTheme } from "../theme";
import { formatCurrency } from "../utils/format";
import type { AnalyticsItem } from "./types";

const chartPalette = [
  "#1f6f5f",
  "#2b8a8f",
  "#d8a64f",
  "#cf6d56",
  "#6d8f5b",
  "#4a6fa5",
];

export default function AnalyticsScreen() {
  const theme = useAppTheme();
  const [analytics, setAnalytics] =
    useState<AnalyticsItem[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const loadAnalytics = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (loadError: any) {
      setError(
        loadError?.response?.data
          ?.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalSpending = analytics.reduce(
    (sum, item) =>
      sum + Number(item.amount ?? 0),
    0
  );

  const largestCategory = useMemo(() => {
    return analytics.reduce<
      AnalyticsItem | null
    >((current, item) => {
      if (
        !current ||
        Number(item.amount) >
          Number(current.amount)
      ) {
        return item;
      }

      return current;
    }, null);
  }, [analytics]);

  const chartData = analytics.map(
    (item, index) => ({
      name: item.category,
      amount: Number(item.amount ?? 0),
      color:
        chartPalette[
          index % chartPalette.length
        ],
      legendFontColor:
        theme.colors.textMuted,
      legendFontSize: 12,
    })
  );

  const chartWidth = Math.min(
    Dimensions.get("window").width - 56,
    360
  );

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.screenGap}>
        <View style={styles.titleWrap}>
          <Text
            style={[
              theme.typography.h1,
              { color: theme.colors.text },
            ]}
          >
            Analytics
          </Text>
          <Text
            style={[
              theme.typography.body,
              {
                color:
                  theme.colors.textMuted,
              },
            ]}
          >
            See category trends and where
            your monthly spending is headed.
          </Text>
        </View>

        {error ? (
          <EmptyState
            title="Analytics unavailable"
            message={error}
            actionLabel="Reload"
            onAction={() =>
              loadAnalytics()
            }
            icon="warning-outline"
          />
        ) : null}

        <FlatList
          style={styles.list}
          data={loading ? [] : analytics}
          keyExtractor={(item) => item.category}
          contentContainerStyle={
            styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                loadAnalytics(true)
              }
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            loading ? (
              <View style={{ gap: 12 }}>
                <View
                  style={styles.statsGrid}
                >
                  <Card style={styles.statStub}>
                    <SkeletonBlock
                      height={14}
                      width="55%"
                    />
                    <View
                      style={{ height: 10 }}
                    />
                    <SkeletonBlock
                      height={24}
                      width="70%"
                    />
                  </Card>
                  <Card style={styles.statStub}>
                    <SkeletonBlock
                      height={14}
                      width="45%"
                    />
                    <View
                      style={{ height: 10 }}
                    />
                    <SkeletonBlock
                      height={24}
                      width="60%"
                    />
                  </Card>
                </View>
                <Card
                  style={{
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <SkeletonBlock
                    height={220}
                    width={220}
                    radius={220}
                  />
                </Card>
              </View>
            ) : analytics.length === 0 ? (
              <EmptyState
                title="No analytics yet"
                message="Add some expenses to unlock category breakdowns and monthly summaries."
                icon="pie-chart-outline"
              />
            ) : (
              <View style={{ gap: 12 }}>
                <View
                  style={styles.statsGrid}
                >
                  <StatCard
                    label="Total Spending"
                    value={formatCurrency(
                      totalSpending
                    )}
                    tone="secondary"
                  />
                  <StatCard
                    label="Largest Category"
                    value={
                      largestCategory
                        ?.category ||
                      "None"
                    }
                    tone="accent"
                  />
                </View>
                <Card
                  style={{
                    alignItems: "center",
                    gap: theme.spacing.md,
                    backgroundColor:
                      theme.colors.surfaceStrong,
                  }}
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
                    Expense by Category
                  </Text>
                  <PieChart
                    data={chartData}
                    width={chartWidth}
                    height={220}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="10"
                    absolute
                    chartConfig={{
                      color: () =>
                        theme.colors.text,
                      labelColor: () =>
                        theme.colors.text,
                    }}
                  />
                </Card>
                <Card
                  style={{
                    gap: theme.spacing.sm,
                    backgroundColor:
                      theme.colors.surfaceStrong,
                  }}
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
                    Monthly Spending Summary
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      {
                        color:
                          theme.colors.textMuted,
                      },
                    ]}
                  >
                    You have spent{" "}
                    {formatCurrency(
                      totalSpending
                    )}{" "}
                    across{" "}
                    {analytics.length}{" "}
                    categories this month.
                  </Text>
                </Card>
                <Text
                  style={[
                    theme.typography.h2,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  Category Breakdown
                </Text>
              </View>
            )
          }
          renderItem={({ item, index }) => (
            <Card
              style={{
                backgroundColor:
                  theme.colors.surfaceStrong,
              }}
            >
              <View
                style={styles.rowBetween}
              >
                <View style={styles.metaRow}>
                  <View
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor:
                          chartPalette[
                            index %
                              chartPalette.length
                          ],
                      },
                    ]}
                  />
                  <Text
                    style={[
                      theme.typography.bodyStrong,
                      {
                        color:
                          theme.colors.text,
                      },
                    ]}
                  >
                    {item.category}
                  </Text>
                </View>
                <Text
                  style={[
                    theme.typography.bodyStrong,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {formatCurrency(
                    item.amount
                  )}
                </Text>
              </View>
            </Card>
          )}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenGap: {
    flex: 1,
    gap: 16,
  },
  titleWrap: {
    gap: 6,
  },
  listContent: {
    gap: 12,
    paddingBottom: 32,
  },
  list: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statStub: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
});
