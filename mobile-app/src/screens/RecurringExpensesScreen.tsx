import { Picker } from "@react-native-picker/picker";
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
import { useToast } from "../hooks/useToast";
import {
  createRecurringExpense,
  deleteRecurringExpense,
  getRecurringExpenses,
} from "../services/recurringExpenseService";
import { useAppTheme } from "../theme";
import { formatCurrency } from "../utils/format";
import {
  expenseCategories,
  recurringFrequencies,
} from "./shared";
import type { RecurringExpenseItem } from "./types";

export default function RecurringExpensesScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const [expenses, setExpenses] =
    useState<RecurringExpenseItem[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState(expenseCategories[0]);
  const [frequency, setFrequency] =
    useState(recurringFrequencies[1]);
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const loadExpenses = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data =
        await getRecurringExpenses();
      setExpenses(data);
    } catch (loadError: any) {
      setError(
        loadError?.response?.data
          ?.message ||
          "Unable to load recurring expenses."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleCreate = async () => {
    if (!title || !amount || !category) {
      toast.showError(
        "Please complete all fields."
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
      await createRecurringExpense(
        title,
        numericAmount,
        category,
        frequency
      );
      setTitle("");
      setAmount("");
      setCategory(expenseCategories[0]);
      setFrequency(
        recurringFrequencies[1]
      );
      toast.showSuccess(
        "Recurring expense added."
      );
      await loadExpenses();
    } catch (createError: any) {
      toast.showError(
        createError?.response?.data
          ?.message ||
          "Unable to create recurring expense."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    try {
      await deleteRecurringExpense(id);
      setExpenses((current) =>
        current.filter(
          (expense) => expense.id !== id
        )
      );
      toast.showSuccess(
        "Recurring expense deleted."
      );
    } catch (deleteError: any) {
      toast.showError(
        deleteError?.response?.data
          ?.message ||
          "Unable to delete recurring expense."
      );
    }
  };

  return (
  <ScreenContainer scroll={false}>
    <FlatList
      data={loading ? [] : expenses}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingBottom: 32,
        gap: 12,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() =>
            loadExpenses(true)
          }
          tintColor={theme.colors.primary}
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
              Recurring Expenses
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
              Keep subscriptions and monthly
              obligations organized in one
              place.
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
              label="Title"
              placeholder="Rent, Netflix..."
              value={title}
              onChangeText={setTitle}
            />

            <AppInput
              label="Amount"
              placeholder="0"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View
              style={styles.pickerWrap}
            >
              <Text
                style={[
                  theme.typography
                    .caption,
                  styles.pickerLabel,
                  {
                    color:
                      theme.colors
                        .textMuted,
                  },
                ]}
              >
                Category
              </Text>

              <Picker
                selectedValue={category}
                onValueChange={
                  setCategory
                }
                dropdownIconColor={
                  theme.colors.text
                }
                style={{
                  color:
                    theme.colors.text,
                }}
              >
                {expenseCategories.map(
                  (item) => (
                    <Picker.Item
                      key={item}
                      label={item}
                      value={item}
                    />
                  )
                )}
              </Picker>
            </View>

            <View
              style={styles.pickerWrap}
            >
              <Text
                style={[
                  theme.typography
                    .caption,
                  styles.pickerLabel,
                  {
                    color:
                      theme.colors
                        .textMuted,
                  },
                ]}
              >
                Frequency
              </Text>

              <Picker
                selectedValue={
                  frequency
                }
                onValueChange={
                  setFrequency
                }
                dropdownIconColor={
                  theme.colors.text
                }
                style={{
                  color:
                    theme.colors.text,
                }}
              >
                {recurringFrequencies.map(
                  (item) => (
                    <Picker.Item
                      key={item}
                      label={item}
                      value={item}
                    />
                  )
                )}
              </Picker>
            </View>

            <AppButton
              label="Add Recurring Expense"
              onPress={handleCreate}
              loading={saving}
            />
          </Card>

          {error ? (
            <EmptyState
              title="Recurring list unavailable"
              message={error}
              actionLabel="Reload"
              onAction={() =>
                loadExpenses()
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
              length: 2,
            }).map((_, index) => (
              <Card key={index}>
                <SkeletonBlock
                  height={14}
                  width="38%"
                />
                <View
                  style={{
                    height: 10,
                  }}
                />
                <SkeletonBlock
                  height={24}
                  width="52%"
                />
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState
            title="No recurring expenses"
            message="Add the bills and subscriptions you track every cycle."
            icon="repeat-outline"
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
                      .danger,
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
            {item.category} •{" "}
            {item.frequency}
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
  pickerWrap: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  pickerLabel: {
    marginLeft: 16,
    marginTop: 12,
  },
});
