import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import StatCard from "../components/StatCard";
import { useToast } from "../hooks/useToast";
import {
  createIncome,
  deleteIncome,
  getIncome,
} from "../services/incomeService";
import { useAppTheme } from "../theme";
import { formatCurrency, formatDate } from "../utils/format";
import type { IncomeItem } from "./types";

export default function IncomeScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [income, setIncome] =
    useState<IncomeItem[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const loadIncome = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await getIncome();
      setIncome(data);
    } catch (loadError: any) {
      setError(
        loadError?.response?.data
          ?.message ||
          "Unable to load income."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncome();
  }, []);

  const handleAddIncome = async () => {
    if (!title || !amount || !source) {
      toast.showError(
        "Fill in title, amount, and source."
      );
      return;
    }

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      toast.showError(
        "Enter a valid amount."
      );
      return;
    }

    try {
      setSaving(true);
      await createIncome(
        title,
        numericAmount,
        source
      );
      setTitle("");
      setAmount("");
      setSource("");
      toast.showSuccess(
        "Income added."
      );
      await loadIncome();
    } catch (createError: any) {
      toast.showError(
        createError?.response?.data
          ?.message ||
          "Unable to create income."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    try {
      await deleteIncome(id);
      setIncome((current) =>
        current.filter(
          (entry) => entry.id !== id
        )
      );
      toast.showSuccess(
        "Income deleted."
      );
    } catch (deleteError: any) {
      toast.showError(
        deleteError?.response?.data
          ?.message ||
          "Unable to delete income."
      );
    }
  };

  const totalIncome = income.reduce(
    (sum, item) =>
      sum + Number(item.amount ?? 0),
    0
  );

  return (
  <ScreenContainer scroll={false}>
    <FlatList
      data={loading ? [] : income}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingBottom: 32,
        gap: 12,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() =>
            loadIncome(true)
          }
          tintColor={
            theme.colors.primary
          }
        />
      }
      ListHeaderComponent={
        <View style={{ gap: 16 }}>
          <View style={styles.titleWrap}>
            <Text
              style={[
                theme.typography.h1,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Income
            </Text>

            <Text
              style={[
                theme.typography.body,
                {
                  color:
                    theme.colors
                      .textMuted,
                },
              ]}
            >
              Capture every salary,
              transfer, and side
              income stream.
            </Text>
          </View>

          <StatCard
            label="Total Income"
            value={formatCurrency(
              totalIncome
            )}
            tone="success"
          />

          <Card
            style={{
              gap:
                theme.spacing.md,
              backgroundColor:
                theme.colors
                  .surfaceStrong,
            }}
          >
            <AppInput
              label="Title"
              placeholder="Salary, freelance..."
              value={title}
              onChangeText={
                setTitle
              }
            />

            <AppInput
              label="Amount"
              placeholder="0"
              keyboardType="numeric"
              value={amount}
              onChangeText={
                setAmount
              }
            />

            <AppInput
              label="Source"
              placeholder="Bank transfer, client..."
              value={source}
              onChangeText={
                setSource
              }
            />

            <AppButton
              label="Add Income"
              onPress={
                handleAddIncome
              }
              loading={saving}
            />
          </Card>

          {error ? (
            <EmptyState
              title="Income unavailable"
              message={error}
              actionLabel="Reload"
              onAction={() =>
                loadIncome()
              }
              icon="warning-outline"
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <View
            style={{
              gap:
                theme.spacing.md,
            }}
          >
            {Array.from({
              length: 3,
            }).map(
              (_, index) => (
                <Card
                  key={index}
                >
                  <SkeletonBlock
                    height={14}
                    width="45%"
                  />
                  <View
                    style={{
                      height: 10,
                    }}
                  />
                  <SkeletonBlock
                    height={26}
                    width="58%"
                  />
                </Card>
              )
            )}
          </View>
        ) : (
          <EmptyState
            title="No income yet"
            message="Add your first income source to see it listed here."
            icon="cash-outline"
          />
        )
      }
      renderItem={({ item }) => (
        <Card
          style={{
            gap:
              theme.spacing.sm,
            backgroundColor:
              theme.colors
                .surfaceStrong,
          }}
        >
          <View
            style={
              styles.rowBetween
            }
          >
            <Text
              style={[
                theme.typography.h3,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              {item.title}
            </Text>

            <Text
              style={[
                theme.typography
                  .bodyStrong,
                {
                  color:
                    theme.colors
                      .success,
                },
              ]}
            >
              {formatCurrency(
                item.amount
              )}
            </Text>
          </View>

          <Text
            style={[
              theme.typography
                .caption,
              {
                color:
                  theme.colors
                    .textMuted,
              },
            ]}
          >
            {item.source}
          </Text>

          <View
            style={
              styles.rowBetween
            }
          >
            <Text
              style={[
                theme.typography
                  .caption,
                {
                  color:
                    theme.colors
                      .textMuted,
                },
              ]}
            >
              {formatDate(
                item.createdAt
              )}
            </Text>

            <AppButton
              label="Delete"
              onPress={() =>
                handleDelete(
                  item.id
                )
              }
              variant="ghost"
            />
          </View>
        </Card>
      )}
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
});
