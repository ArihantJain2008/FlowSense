import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import PeriodFilterBar from "../components/PeriodFilterBar";
import ProgressBar from "../components/ProgressBar";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import { useFilters } from "../context/FiltersContext";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { useToast } from "../hooks/useToast";
import { clampPercentage, formatDate } from "../utils/format";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../services/savingsGoalService";
import { useAppTheme } from "../theme";
import type { SavingsGoalItem } from "./types";

const formatMonthLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function SavingsGoalsScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const { formatMoney } = useCurrencyFormatter();
  const { navigationLabel, resolvedRange } = useFilters();
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoalItem | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTarget, setEditingTarget] = useState("");
  const [editingSaved, setEditingSaved] = useState("");
  const [editingMonthlyContribution, setEditingMonthlyContribution] = useState("");
  const [editingTargetDate, setEditingTargetDate] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const loadGoals = useCallback(async (isRefresh = false) => {
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
      setError(loadError?.response?.data?.message || "Unable to load savings goals.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useRefreshOnFocus(loadGoals);

  const handleCreateGoal = async () => {
    const numericTarget = Number(target);
    const numericMonthlyContribution = Number(monthlyContribution || 0);

    if (!title || Number.isNaN(numericTarget) || numericTarget <= 0) {
      toast.showError("Goal name and valid target are required.");
      return;
    }

    try {
      setSaving(true);
      await createGoal(title, numericTarget, numericMonthlyContribution, targetDate || undefined);
      setTitle("");
      setTarget("");
      setMonthlyContribution("");
      setTargetDate("");
      toast.showSuccess("Savings goal created.");
      await loadGoals();
    } catch (createError: any) {
      toast.showError(createError?.response?.data?.message || "Unable to create goal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
      setGoals((current) => current.filter((goal) => goal.id !== id));
      toast.showSuccess("Goal deleted.");
    } catch (deleteError: any) {
      toast.showError(deleteError?.response?.data?.message || "Unable to delete goal.");
    }
  };

  const openEditModal = (goal: SavingsGoalItem) => {
    setEditingGoal(goal);
    setEditingTitle(goal.title || "");
    setEditingTarget(String(goal.target ?? ""));
    setEditingSaved(String(goal.saved ?? 0));
    setEditingMonthlyContribution(String(goal.monthlyContribution ?? 0));
    setEditingTargetDate(goal.targetDate ?? "");
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingGoal(null);
    setEditingTitle("");
    setEditingTarget("");
    setEditingSaved("");
    setEditingMonthlyContribution("");
    setEditingTargetDate("");
    setEditError(null);
  };

  const handleSaveGoal = async () => {
    if (!editingGoal) {
      return;
    }

    const numericTarget = Number(editingTarget);
    const numericSaved = Number(editingSaved);
    const numericMonthlyContribution = Number(editingMonthlyContribution || 0);

    if (
      !editingTitle ||
      Number.isNaN(numericTarget) ||
      numericTarget <= 0 ||
      Number.isNaN(numericSaved) ||
      numericSaved < 0 ||
      Number.isNaN(numericMonthlyContribution) ||
      numericMonthlyContribution < 0
    ) {
      setEditError("Please provide valid goal values.");
      return;
    }

    try {
      setEditSaving(true);
      const updatedGoal = await updateGoal(editingGoal.id, {
        title: editingTitle,
        target: numericTarget,
        saved: numericSaved,
        monthlyContribution: numericMonthlyContribution,
        targetDate: editingTargetDate || null,
      });
      setGoals((current) => current.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)));
      toast.showSuccess("Savings goal updated.");
      closeEditModal();
    } catch (updateError: any) {
      setEditError(updateError?.response?.data?.message || "Unable to update goal.");
    } finally {
      setEditSaving(false);
    }
  };

  const selectedStart = useMemo(
    () => new Date(`${resolvedRange.startDate}T00:00:00`),
    [resolvedRange.startDate]
  );
  const selectedEnd = useMemo(
    () => new Date(`${resolvedRange.endDate}T23:59:59.999`),
    [resolvedRange.endDate]
  );

  const periodAllocationTotal = useMemo(
    () =>
      goals.reduce((sum, goal) => {
        const amount = goal.timeline?.reduce((timelineSum, entry) => {
          const createdAt = new Date(entry.createdAt);
          if (createdAt < selectedStart || createdAt > selectedEnd) {
            return timelineSum;
          }

          return timelineSum + Number(entry.amount || 0);
        }, 0) ?? 0;

        return sum + amount;
      }, 0),
    [goals, selectedEnd, selectedStart]
  );

  const { activeGoals, completedGoals } = useMemo(() => {
    const active: SavingsGoalItem[] = [];
    const completed: SavingsGoalItem[] = [];

    goals.forEach((goal) => {
      if (Number(goal.saved) >= Number(goal.target)) {
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

  const renderGoalCard = (item: SavingsGoalItem) => {
    const progress = item.percentage ?? (Number(item.target) > 0 ? clampPercentage((Number(item.saved) / Number(item.target)) * 100) : 0);
    const isCompleted = Number(item.saved) >= Number(item.target);
    const periodTimeline = item.timeline?.filter((entry) => {
      const createdAt = new Date(entry.createdAt);
      return createdAt >= selectedStart && createdAt <= selectedEnd;
    }) ?? [];
    const periodAllocated = periodTimeline.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const monthlyContributions = item.timeline?.reduce<Record<string, number>>((acc, entry) => {
      const monthLabel = formatMonthLabel(entry.createdAt);
      acc[monthLabel] = (acc[monthLabel] || 0) + Number(entry.amount || 0);
      return acc;
    }, {}) ?? {};

    return (
      <Card key={item.id} style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
        <View style={styles.rowBetween}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: isCompleted ? theme.colors.success : theme.colors.surfaceMuted }]}>
            <Text style={[theme.typography.caption, { color: isCompleted ? theme.colors.surfaceStrong : theme.colors.text }]}>
              {isCompleted ? "Completed" : `${Math.round(progress)}%`}
            </Text>
          </View>
        </View>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>Goal Progress</Text>
        <View style={styles.rowBetween}>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Target: {formatMoney(item.target)}</Text>
          <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>Saved: {formatMoney(item.saved)}</Text>
        </View>
        <ProgressBar progress={progress} valueLabel={`${formatMoney(item.saved)} / ${formatMoney(item.target)}`} />
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          Monthly contribution: {formatMoney(item.monthlyContribution || 0)} • Remaining: {formatMoney(item.remainingAmount || 0)}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          {navigationLabel}: {formatMoney(periodAllocated)} allocated
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          Estimated completion: {item.estimatedCompletionDate ? formatDate(item.estimatedCompletionDate) : "Not enough contribution data"}
        </Text>
        <Text style={[theme.typography.caption, styles.sectionLabel, { color: theme.colors.textMuted }]}>Month-by-month contribution</Text>
        {Object.keys(monthlyContributions).length ? (
          Object.entries(monthlyContributions).map(([month, amount]) => (
            <Text key={month} style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{month}: {formatMoney(amount)}</Text>
          ))
        ) : (
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>No contributions yet.</Text>
        )}
        {item.timeline?.length ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
            Timeline activity: {periodTimeline.length} allocation{periodTimeline.length === 1 ? "" : "s"} in selected period
          </Text>
        ) : null}
        <View style={styles.actionsRow}>
          <AppButton label="Allocate" onPress={() => router.push("/allocate-savings")} variant="secondary" />
          <AppButton label="Edit" onPress={() => openEditModal(item)} variant="secondary" />
          <AppButton label="Delete" onPress={() => handleDeleteGoal(item.id)} variant="ghost" />
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={loading ? [] : activeGoals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadGoals(true)} tintColor={theme.colors.primary} />
        }
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            {loading ? (
              <View style={{ gap: 16 }}>
                <View style={styles.titleWrap}>
                  <SkeletonBlock height={28} width="55%" />
                  <SkeletonBlock height={14} width="90%" />
                </View>

                <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                  <SkeletonBlock height={14} width="35%" />
                  <SkeletonBlock height={14} width="100%" />
                  <SkeletonBlock height={14} width="100%" />
                  <SkeletonBlock height={14} width="100%" />
                  <SkeletonBlock height={40} width="100%" />
                </Card>

                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={`goal-skeleton-${index}`} style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                    <SkeletonBlock height={14} width="45%" />
                    <SkeletonBlock height={12} width="70%" />
                    <SkeletonBlock height={12} width="100%" />
                    <SkeletonBlock height={12} width="90%" />
                  </Card>
                ))}
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                <View style={styles.titleWrap}>
                  <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Savings Goals</Text>
                  <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Goal timelines now include projected completion, contribution pacing, and historical allocations.</Text>
                </View>

                <PeriodFilterBar />

                <Card style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Selected Period Allocations</Text>
                  <Text style={[theme.typography.h2, { color: theme.colors.primary }]}>{formatMoney(periodAllocationTotal)}</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{navigationLabel}</Text>
                </Card>

                <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
                  <AppInput label="Goal Name" placeholder="Emergency fund" value={title} onChangeText={setTitle} />
                  <AppInput label="Target Amount" placeholder="0" keyboardType="numeric" value={target} onChangeText={setTarget} />
                  <AppInput
                    label="Monthly Contribution"
                    placeholder="0"
                    keyboardType="numeric"
                    value={monthlyContribution}
                    onChangeText={setMonthlyContribution}
                  />
                  <AppInput
                    label="Target Date"
                    placeholder="YYYY-MM-DD"
                    value={targetDate}
                    onChangeText={setTargetDate}
                  />
                  <AppButton label="Create Goal" onPress={handleCreateGoal} loading={saving} />
                </Card>

                {error ? (
                  <EmptyState title="Goals unavailable" message={error} actionLabel="Reload" onAction={() => loadGoals()} icon="warning-outline" />
                ) : null}

                {completedGoals.length > 0 && !loading ? (
                  <View style={{ gap: theme.spacing.md }}>
                    <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Completed Goals</Text>
                    {completedGoals.map(renderGoalCard)}
                    <Text style={[theme.typography.h2, { color: theme.colors.text }]}>In Progress</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading || completedGoals.length > 0 ? null : (
            <EmptyState title="No savings goals yet" message="Create your first goal to start tracking progress." icon="flag-outline" />
          )
        }
        renderItem={({ item }) => renderGoalCard(item)}
      />
      <Modal visible={Boolean(editingGoal)} animationType="slide" transparent onRequestClose={closeEditModal}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}> 
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h2, styles.modalTitle, { color: theme.colors.text }]}>Edit Goal</Text>
              <Pressable onPress={closeEditModal} style={styles.closeButton} disabled={editSaving}>
                <Text style={[theme.typography.bodyStrong, { color: theme.colors.primary }]}>Close</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
              <AppInput label="Goal Name" placeholder="Emergency fund" value={editingTitle} onChangeText={setEditingTitle} />
              <AppInput label="Target Amount" placeholder="0" keyboardType="numeric" value={editingTarget} onChangeText={setEditingTarget} />
              <AppInput label="Saved Amount" placeholder="0" keyboardType="numeric" value={editingSaved} onChangeText={setEditingSaved} />
              <AppInput
                label="Monthly Contribution"
                placeholder="0"
                keyboardType="numeric"
                value={editingMonthlyContribution}
                onChangeText={setEditingMonthlyContribution}
              />
              <AppInput
                label="Target Date"
                placeholder="YYYY-MM-DD"
                value={editingTargetDate}
                onChangeText={setEditingTargetDate}
              />
              {editError ? (
                <Text style={[theme.typography.caption, { color: theme.colors.danger }]}>{editError}</Text>
              ) : null}
            </ScrollView>
            <View style={styles.modalFooter}>
              <AppButton label="Save changes" onPress={handleSaveGoal} loading={editSaving} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleWrap: {
    gap: 6,
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  sectionLabel: {
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "85%",
    paddingBottom: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    flex: 1,
  },
  closeButton: {
    padding: 10,
  },
  modalBody: {
    maxHeight: 380,
  },
  modalBodyContent: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
