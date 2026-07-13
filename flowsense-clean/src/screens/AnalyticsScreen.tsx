import { useCallback, useMemo, useState } from "react";
import { Dimensions, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart, PieChart, ProgressChart } from "react-native-chart-kit";

import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import PeriodFilterBar from "../components/PeriodFilterBar";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import StatCard from "../components/StatCard";
import { useFilters } from "../context/FiltersContext";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { fetchAnalytics } from "../services/analyticsService";
import { useAppTheme } from "../theme";
import { clampPercentage, formatDate } from "../utils/format";
import type { AnalyticsResponse, AnalyticsSeriesPoint } from "./types";

const chartPalette = ["#1f6f5f", "#2b8a8f", "#d8a64f", "#cf6d56", "#6d8f5b", "#4a6fa5"];

function formatMonthLabel(label: string) {
  const [year, month] = label.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, 1);

  if (Number.isNaN(date.getTime())) {
    return label;
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function formatWeekLabel(label: string) {
  return formatDate(label).replace(/ /g, "\n");
}

function formatChange(value: number, suffix = "") {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}${suffix}`;
}

function takeRecentPoints(points: AnalyticsSeriesPoint[], limit = 6) {
  return points.slice(-limit);
}

export default function AnalyticsScreen() {
  const theme = useAppTheme();
  const { formatMoney } = useCurrencyFormatter();
  const { toQueryParams } = useFilters();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const data = await fetchAnalytics(toQueryParams());
      setAnalytics(data);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toQueryParams]);

  useRefreshOnFocus(loadAnalytics);

  const categories = useMemo(() => analytics?.categories ?? [], [analytics?.categories]);
  const monthlyTrend = useMemo(() => takeRecentPoints(analytics?.monthlyTrend ?? []), [analytics?.monthlyTrend]);
  const weeklyTrend = useMemo(() => takeRecentPoints(analytics?.weeklyTrend ?? []), [analytics?.weeklyTrend]);
  const chartWidth = Math.min(Dimensions.get("window").width - 56, 420);

  const categoryChartData = categories.map((item, index) => ({
    name: item.category,
    amount: Number(item.amount ?? 0),
    color: chartPalette[index % chartPalette.length],
    legendFontColor: theme.colors.textMuted,
    legendFontSize: 12,
  }));

  const monthlyChartData = {
    labels: monthlyTrend.map((item) => formatMonthLabel(item.label)),
    datasets: [
      {
        data: monthlyTrend.map((item) => Number(item.amount ?? 0)),
        color: () => theme.colors.primary,
        strokeWidth: 3,
      },
    ],
  };

  const weeklyChartData = {
    labels: weeklyTrend.map((item) => formatWeekLabel(item.label)),
    datasets: [
      {
        data: weeklyTrend.map((item) => Number(item.amount ?? 0)),
      },
    ],
  };

  const progressChartData = {
    labels: ["Budget Usage", "Savings Rate"],
    data: [
      clampPercentage((analytics?.budgetUsage ?? 0) / 100),
      clampPercentage(Math.max(analytics?.savingsRate ?? 0, 0) / 100),
    ],
  };

  const comparisonCards = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [
      {
        label: "Expenses",
        current: analytics.totalExpenses,
        previous: analytics.comparison.previousExpenses,
        delta: analytics.comparison.expenseChangePercent,
      },
      {
        label: "Income",
        current: analytics.totalIncome,
        previous: analytics.comparison.previousIncome,
        delta: analytics.comparison.incomeChangePercent,
      },
      {
        label: "Net Savings",
        current: analytics.summary.netSavings,
        previous: analytics.comparison.previousNetSavings,
        delta: analytics.comparison.savingsRateChange,
        deltaSuffix: " pts",
      },
    ];
  }, [analytics]);

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: theme.colors.surfaceStrong,
    backgroundGradientTo: theme.colors.surfaceStrong,
    decimalPlaces: 0,
    color: (opacity = 1) => `${theme.colors.primary}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
    labelColor: (opacity = 1) => `${theme.colors.text}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
    fillShadowGradient: theme.colors.primary,
    fillShadowGradientOpacity: 0.18,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.surfaceStrong,
    },
    propsForBackgroundLines: {
      stroke: theme.colors.border,
      strokeDasharray: "",
    },
  };

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        style={styles.list}
        data={loading ? [] : categories}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void loadAnalytics(true);
            }}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.screenGap}>
            <View style={styles.titleWrap}>
              <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Analytics</Text>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>See where your money goes and how it changes over time.</Text>
            </View>

            <PeriodFilterBar />

            {error ? (
              <EmptyState
                title="Analytics unavailable"
                message={error}
                actionLabel="Reload"
                onAction={() => {
                  void loadAnalytics();
                }}
                icon="warning-outline"
              />
            ) : null}

            {loading ? (
              <View style={{ gap: 12 }}>
                <View style={styles.statsGrid}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={`analytics-stat-${index}`} style={styles.statStub}>
                      <SkeletonBlock height={14} width="55%" />
                      <View style={{ height: 10 }} />
                      <SkeletonBlock height={24} width="70%" />
                    </Card>
                  ))}
                </View>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={`analytics-panel-${index}`} style={{ gap: 14 }}>
                    <SkeletonBlock height={14} width="40%" />
                    <SkeletonBlock height={220} width="100%" />
                  </Card>
                ))}
              </View>
            ) : categories.length === 0 ? (
              <EmptyState title="No analytics yet" message="No expenses were found in the selected period." icon="pie-chart-outline" />
            ) : (
              <View style={{ gap: 12 }}>
                <View style={styles.statsGrid}>
                  <StatCard label="Total Spending" value={formatMoney(analytics?.totalExpenses)} tone="secondary" />
                  <StatCard label="Top Category" value={analytics?.topCategory?.category || "None"} tone="accent" />
                  <StatCard label="Budget Usage" value={`${Math.round(analytics?.budgetUsage ?? 0)}%`} />
                  <StatCard label="Savings Rate" value={`${Math.round(analytics?.savingsRate ?? 0)}%`} tone="success" />
                </View>

                <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Monthly Spending Trend</Text>
                  <LineChart
                    data={monthlyChartData}
                    width={chartWidth}
                    height={220}
                    bezier
                    withInnerLines
                    withOuterLines={false}
                    chartConfig={chartConfig}
                    style={styles.chart}
                  />
                </Card>

                <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Weekly Spending Trend</Text>
                  <BarChart
                    data={weeklyChartData}
                    width={chartWidth}
                    height={240}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                    showValuesOnTopOfBars
                    chartConfig={chartConfig}
                    style={styles.chart}
                  />
                </Card>

                <Card style={{ alignItems: "center", gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Category Distribution</Text>
                  <PieChart
                    data={categoryChartData}
                    width={chartWidth}
                    height={220}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="12"
                    absolute
                    chartConfig={chartConfig}
                  />
                </Card>

                <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Budget Usage and Savings Rate</Text>
                  <ProgressChart
                    data={progressChartData}
                    width={chartWidth}
                    height={220}
                    strokeWidth={14}
                    radius={38}
                    hideLegend={false}
                    chartConfig={chartConfig}
                  />
                  <View style={styles.rowBetween}>
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                      Budget: {formatMoney(analytics?.summary.effectiveBudget)}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                      Net savings: {formatMoney(analytics?.summary.netSavings)}
                    </Text>
                  </View>
                </Card>

                <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Largest Expense</Text>
                  {analytics?.largestExpense ? (
                    <>
                      <View style={styles.rowBetween}>
                        <Text style={[theme.typography.bodyStrong, { color: theme.colors.text, flex: 1 }]}>{analytics.largestExpense.title}</Text>
                        <Text style={[theme.typography.bodyStrong, { color: theme.colors.danger }]}>{formatMoney(analytics.largestExpense.amount)}</Text>
                      </View>
                      <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                        {[analytics.largestExpense.category, analytics.largestExpense.merchant, analytics.largestExpense.paymentMethod].filter(Boolean).join(" • ")}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                        {formatDate(analytics.largestExpense.date || analytics.largestExpense.createdAt)}
                      </Text>
                    </>
                  ) : (
                    <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>No expense found in this period.</Text>
                  )}
                </Card>

                <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Month-over-Month Comparison</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                    {formatDate(analytics?.summary.startDate)} to {formatDate(analytics?.summary.endDate)} vs {formatDate(analytics?.comparison.previousStartDate)} to {formatDate(analytics?.comparison.previousEndDate)}
                  </Text>
                  <View style={styles.comparisonGrid}>
                    {comparisonCards.map((item) => (
                      <Card key={item.label} style={{ gap: 8, flex: 1, backgroundColor: theme.colors.surfaceMuted }}>
                        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{item.label}</Text>
                        <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{formatMoney(item.current)}</Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Prev: {formatMoney(item.previous)}</Text>
                        <Text style={[theme.typography.caption, { color: item.delta >= 0 ? theme.colors.success : theme.colors.danger }]}>
                          {formatChange(item.delta, item.deltaSuffix || "%")}
                        </Text>
                      </Card>
                    ))}
                  </View>
                </Card>

                <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Category Breakdown</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const percentage = analytics?.totalExpenses ? (Number(item.amount) / analytics.totalExpenses) * 100 : 0;

          return (
            <Card style={{ backgroundColor: theme.colors.surfaceStrong, gap: theme.spacing.sm }}>
              <View style={styles.rowBetween}>
                <View style={styles.metaRow}>
                  <View style={[styles.colorDot, { backgroundColor: chartPalette[index % chartPalette.length] }]} />
                  <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{item.category}</Text>
                </View>
                <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{formatMoney(item.amount)}</Text>
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                {percentage.toFixed(1)}% of spending
              </Text>
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenGap: {
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
    flexWrap: "wrap",
    gap: 12,
  },
  statStub: {
    flex: 1,
    minWidth: "47%",
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
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  chart: {
    borderRadius: 16,
  },
  comparisonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
