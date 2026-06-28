import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";
import ScreenContainer from "../components/ScreenContainer";
import { useToast } from "../hooks/useToast";
import {
  allocateSavings,
  getAllocationSummary,
} from "../services/savingsAllocationService";
import { useAppTheme } from "../theme";
import { clampPercentage, formatCurrency } from "../utils/format";
import type { AllocationSummary } from "./types";

export default function AllocateSavingsScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const [summary, setSummary] =
    useState<AllocationSummary | null>(
      null
    );
  const [selectedGoalId, setSelectedGoalId] =
    useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data =
        await getAllocationSummary();
      setSummary(data);
    } catch (loadError: any) {
      setError(
        loadError?.response?.data
          ?.message ||
          "Unable to load allocation summary."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate = async () => {
    if (!selectedGoalId || !amount) {
      toast.showError(
        "Select a goal and enter an amount."
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
      await allocateSavings(
        selectedGoalId,
        numericAmount
      );
      setAmount("");
      toast.showSuccess(
        "Savings allocated."
      );
      await loadData();
    } catch (allocateError: any) {
      toast.showError(
        allocateError?.response?.data
          ?.message ||
          "Allocation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
  <ScreenContainer scroll={false}>
    <FlatList
      data={
        loading || !summary
          ? []
          : summary.goals
      }
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingBottom: 32,
        gap: 12,
      }}
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
              Allocate Savings
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
              Move available balance
              into the goals that
              matter most.
            </Text>
          </View>

          {error ? (
            <EmptyState
              title="Allocation unavailable"
              message={error}
              actionLabel="Reload"
              onAction={loadData}
              icon="warning-outline"
            />
          ) : null}

          {summary ? (
            <>
              <Card
                style={{
                  gap:
                    theme.spacing.md,
                  backgroundColor:
                    theme.colors
                      .surfaceStrong,
                }}
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
                  Available Summary
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
                  Budget:{" "}
                  {formatCurrency(
                    summary.budget
                  )}
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
                  Spent:{" "}
                  {formatCurrency(
                    summary.spent
                  )}
                </Text>

                <Text
                  style={[
                    theme.typography
                      .bodyStrong,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  Remaining:{" "}
                  {formatCurrency(
                    summary.remaining
                  )}
                </Text>
              </Card>

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
                  label="Allocation Amount"
                  placeholder="0"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={
                    setAmount
                  }
                />

                <AppButton
                  label="Allocate Savings"
                  onPress={
                    handleAllocate
                  }
                  loading={saving}
                />
              </Card>
            </>
          ) : loading ? (
            <Card>
              <Text
                style={[
                  theme.typography
                    .body,
                  {
                    color:
                      theme.colors
                        .textMuted,
                  },
                ]}
              >
                Loading allocation
                details...
              </Text>
            </Card>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !loading ? (
          <EmptyState
            title="No goals to fund"
            message="Create a savings goal first, then come back to allocate."
            icon="wallet-outline"
          />
        ) : null
      }
      renderItem={({ item }) => {
        const progress =
          Number(item.target) > 0
            ? clampPercentage(
                (Number(item.saved) /
                  Number(
                    item.target
                  )) *
                  100
              )
            : 0;

        return (
          <TouchableOpacity
            onPress={() =>
              setSelectedGoalId(
                item.id
              )
            }
            style={[
              styles.goalTouch,
              {
                borderColor:
                  selectedGoalId ===
                  item.id
                    ? theme.colors
                        .primary
                    : "transparent",
              },
            ]}
          >
            <Card
              style={{
                gap:
                  theme.spacing.md,
                backgroundColor:
                  theme.colors
                    .surfaceStrong,
              }}
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

              <ProgressBar
                progress={progress}
                valueLabel={`${formatCurrency(
                  item.saved
                )} / ${formatCurrency(
                  item.target
                )}`}
              />
            </Card>
          </TouchableOpacity>
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
    paddingBottom: 12,
  },
  goalTouch: {
    borderWidth: 1,
    borderRadius: 20,
  },
});
