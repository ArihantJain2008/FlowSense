import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import { useToast } from "../hooks/useToast";
import {
  createExpense,
  deleteExpense,
  getExpenses,
} from "../services/expenseService";
import { useAppTheme } from "../theme";
import { formatCurrency, formatDate } from "../utils/format";
import { expenseCategories } from "./shared";
import type { ExpenseItem } from "./types";

export default function ExpensesScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const [expenses, setExpenses] =
    useState<ExpenseItem[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState(expenseCategories[0]);
  const [search, setSearch] = useState("");
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
      const data = await getExpenses();
      setExpenses(data);
    } catch (loadError: any) {
      setError(
        loadError?.response?.data
          ?.message ||
          "Unable to load expenses."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAddExpense = async () => {
    if (!title || !amount) {
      toast.showError(
        "Title and amount are required."
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
      await createExpense(
        title,
        numericAmount,
        category
      );
      setTitle("");
      setAmount("");
      setCategory(expenseCategories[0]);
      toast.showSuccess(
        "Expense added."
      );
      await loadExpenses();
    } catch (createError: any) {
      toast.showError(
        createError?.response?.data
          ?.message ||
          "Unable to create expense."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    try {
      await deleteExpense(id);
      setExpenses((current) =>
        current.filter(
          (expense) => expense.id !== id
        )
      );
      toast.showSuccess(
        "Expense deleted."
      );
    } catch (deleteError: any) {
      toast.showError(
        deleteError?.response?.data
          ?.message ||
          "Unable to delete expense."
      );
    }
  };

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return expenses;
    }

    return expenses.filter((item) =>
      [item.title, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [expenses, search]);

  const renderDeleteAction = (
    id: string
  ) => (
    <View
      style={[
        styles.deleteAction,
        {
          backgroundColor:
            theme.colors.danger,
          borderRadius:
            theme.radius.md,
        },
      ]}
    >
      <AppButton
        label="Delete"
        onPress={() => handleDelete(id)}
        variant="danger"
      />
    </View>
  );

  return (
  <ScreenContainer scroll={false}>
    <FlatList
      data={loading ? [] : filteredExpenses}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingBottom: 32,
        gap: 12,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadExpenses(true)}
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
                  color: theme.colors.text,
                },
              ]}
            >
              Expenses
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
              Track spend, filter by
              category, and manage
              entries fast.
            </Text>
          </View>

          <Card
            style={{
              gap: theme.spacing.md,
              backgroundColor:
                theme.colors.surfaceStrong,
            }}
          >
            <AppInput
              label="Expense Title"
              placeholder="Lunch, fuel, rent..."
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
              style={{
                borderWidth: 1,
                borderColor:
                  theme.colors.border,
                borderRadius:
                  theme.radius.md,
                backgroundColor:
                  theme.colors.inputBackground,
                overflow: "hidden",
              }}
            >
              <Text
                style={[
                  theme.typography.caption,
                  {
                    color:
                      theme.colors.textMuted,
                    marginLeft: 16,
                    marginTop: 12,
                  },
                ]}
              >
                Category
              </Text>

              <Picker
                selectedValue={category}
                onValueChange={(value) =>
                  setCategory(value)
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

            <AppButton
              label="Add Expense"
              onPress={
                handleAddExpense
              }
              loading={saving}
            />
          </Card>

          <AppInput
            label="Search Expenses"
            placeholder="Search title or category"
            value={search}
            onChangeText={setSearch}
          />

          {error ? (
            <EmptyState
              title="Expenses unavailable"
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
              length: 3,
            }).map(
              (_, index) => (
                <Card
                  key={index}
                >
                  <SkeletonBlock
                    height={16}
                    width="40%"
                  />
                  <View
                    style={{
                      height:
                        theme.spacing.sm,
                    }}
                  />
                  <SkeletonBlock
                    height={24}
                    width="55%"
                  />
                  <View
                    style={{
                      height:
                        theme.spacing.sm,
                    }}
                  />
                  <SkeletonBlock
                    height={12}
                    width="65%"
                  />
                </Card>
              )
            )}
          </View>
        ) : (
          <EmptyState
            title="No expenses found"
            message="Add your first expense or adjust the search filter."
            actionLabel="Clear Search"
            onAction={() =>
              setSearch("")
            }
            icon="receipt-outline"
          />
        )
      }
      renderItem={({ item }) => (
        <Swipeable
          renderRightActions={() =>
            renderDeleteAction(
              item.id
            )
          }
        >
          <Card
            style={{
              backgroundColor:
                theme.colors
                  .surfaceStrong,
              gap:
                theme.spacing.sm,
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
                      theme.colors.text,
                    flex: 1,
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

            <View
              style={
                styles.rowBetween
              }
            >
              <View
                style={
                  styles.metaRow
                }
              >
                <Ionicons
                  name="pricetag-outline"
                  size={16}
                  color={
                    theme.colors
                      .textMuted
                  }
                />

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
                  {item.category}
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
                {formatDate(
                  item.createdAt
                )}
              </Text>
            </View>
          </Card>
        </Swipeable>
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteAction: {
    justifyContent: "center",
    paddingLeft: 12,
    marginBottom: 12,
  },
});
