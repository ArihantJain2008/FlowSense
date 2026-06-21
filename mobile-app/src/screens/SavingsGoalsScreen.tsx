import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import ProgressBar from "../components/ProgressBar";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import { useToast } from "../hooks/useToast";
import {
  createGoal,
  deleteGoal,
  getGoals,
} from "../services/savingsGoalService";
import { useAppTheme } from "../theme";
import { clampPercentage, formatCurrency } from "../utils/format";
import type { SavingsGoalItem } from "./types";

export default function SavingsGoalsScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const [goals, setGoals] =
    useState<SavingsGoalItem[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const loadGoals = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await getGoals();
      setGoals(data);
    } catch (loadError: any) {
      setError(
        loadError?.response?.data
          ?.message ||
          "Unable to load savings goals."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!title || !target) {
      toast.showError(
        "Goal name and target are required."
      );
      return;
    }

    const numericTarget = Number(target);

    if (
      Number.isNaN(numericTarget) ||
      numericTarget <= 0
    ) {
      toast.showError(
        "Enter a valid target amount."
      );
      return;
    }

    try {
      setSaving(true);
      await createGoal(title, numericTarget);
      setTitle("");
      setTarget("");
      toast.showSuccess(
        "Savings goal created."
      );
      await loadGoals();
    } catch (createError: any) {
      toast.showError(
        createError?.response?.data
          ?.message ||
          "Unable to create goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (
    id: string
  ) => {
    try {
      await deleteGoal(id);
      setGoals((current) =>
        current.filter(
          (goal) => goal.id !== id
        )
      );
      toast.showSuccess(
        "Goal deleted."
      );
    } catch (deleteError: any) {
      toast.showError(
        deleteError?.response?.data
          ?.message ||
          "Unable to delete goal."
      );
    }
  };

  const { activeGoals, completedGoals } =
    useMemo(() => {
      const active: SavingsGoalItem[] = [];
      const completed: SavingsGoalItem[] = [];

      goals.forEach((goal) => {
        if (
          Number(goal.saved) >=
          Number(goal.target)
        ) {
          completed.push(goal);
        } else {
          active.push(goal);
        }
      });

      return {
        activeGoals: active,
        completedGoals: completed,
      };
    }, [goals]);

  const renderGoalCard = (
    item: SavingsGoalItem
  ) => {
    const progress =
      Number(item.target) > 0
        ? clampPercentage(
            (Number(item.saved) /
              Number(item.target)) *
              100
          )
        : 0;
    const isCompleted =
      Number(item.saved) >=
      Number(item.target);

    return (
      <Card
        key={item.id}
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
            {item.title}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  isCompleted
                    ? theme.colors.success
                    : theme.colors.surfaceMuted,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.caption,
                {
                  color: isCompleted
                    ? theme.colors.surfaceStrong
                    : theme.colors.text,
                },
              ]}
            >
              {isCompleted
                ? "Completed"
                : `${Math.round(
                    progress
                  )}%`}
            </Text>
          </View>
        </View>
        <View style={styles.rowBetween}>
          <Text
            style={[
              theme.typography.body,
              {
                color:
                  theme.colors.textMuted,
              },
            ]}
          >
            Target:{" "}
            {formatCurrency(item.target)}
          </Text>
          <Text
            style={[
              theme.typography.bodyStrong,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Saved:{" "}
            {formatCurrency(item.saved)}
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          valueLabel={`${formatCurrency(
            item.saved
          )} / ${formatCurrency(
            item.target
          )}`}
        />
        <View style={styles.rowBetween}>
          <AppButton
            label="Allocate"
            onPress={() =>
              router.push(
                "/allocate-savings"
              )
            }
            variant="secondary"
          />
          <AppButton
            label="Delete"
            onPress={() =>
              handleDeleteGoal(item.id)
            }
            variant="ghost"
          />
        </View>
      </Card>
    );
  };

  return (
  <ScreenContainer scroll={false}>
    <FlatList
      data={loading ? [] : activeGoals}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingBottom: 32,
        gap: 12,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() =>
            loadGoals(true)
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
              Savings Goals
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
              Build goals with visible
              progress and a clear
              completion state.
            </Text>
          </View>

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
              label="Goal Name"
              placeholder="Emergency fund"
              value={title}
              onChangeText={
                setTitle
              }
            />

            <AppInput
              label="Target Amount"
              placeholder="0"
              keyboardType="numeric"
              value={target}
              onChangeText={
                setTarget
              }
            />

            <AppButton
              label="Create Goal"
              onPress={
                handleCreateGoal
              }
              loading={saving}
            />
          </Card>

          {error ? (
            <EmptyState
              title="Goals unavailable"
              message={error}
              actionLabel="Reload"
              onAction={() =>
                loadGoals()
              }
              icon="warning-outline"
            />
          ) : null}

          {completedGoals.length >
            0 && !loading && (
            <View
              style={{
                gap:
                  theme.spacing
                    .md,
              }}
            >
              <Text
                style={[
                  theme.typography
                    .h2,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                Completed Goals
              </Text>

              {completedGoals.map(
                renderGoalCard
              )}

              <Text
                style={[
                  theme.typography
                    .h2,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                In Progress
              </Text>
            </View>
          )}
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
                    width="40%"
                  />
                  <View
                    style={{
                      height: 10,
                    }}
                  />
                  <SkeletonBlock
                    height={18}
                    width="62%"
                  />
                  <View
                    style={{
                      height: 10,
                    }}
                  />
                  <SkeletonBlock
                    height={12}
                    width="100%"
                  />
                </Card>
              )
            )}
          </View>
        ) : (
          <EmptyState
            title="No savings goals yet"
            message="Create your first goal to start tracking progress."
            icon="flag-outline"
          />
        )
      }
      renderItem={({ item }) =>
        renderGoalCard(item)
      }
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
