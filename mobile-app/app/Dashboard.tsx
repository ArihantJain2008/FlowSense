import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  getBudgetSummary,
  getExpenses,
} from "../src/services/dashboardService";

import { router } from "expo-router";

export default function Dashboard() {
  const [loading, setLoading] =
    useState(true);

  const [summary, setSummary] =
    useState<any>(null);

  const [expenseCount,
    setExpenseCount] =
    useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
  try {
    console.log("Loading dashboard...");

    const budgetData =
      await getBudgetSummary();

    console.log(
      "Budget Data:",
      budgetData
    );

    const expenses =
      await getExpenses();

    console.log(
      "Expenses:",
      expenses
    );

    setSummary(budgetData);

    setExpenseCount(
      expenses.length
    );
  } catch (error) {
    console.log(
      "Dashboard Error:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            "center",
          alignItems:
            "center",
        }}
      >
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        gap: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
        }}
      >
        FlowSense
      </Text>

      <Text>
        Budget:
        ₹{summary?.budget}
      </Text>

      <Text>
        Spent:
        ₹{summary?.spent}
      </Text>

      <Text>
        Remaining:
        ₹{summary?.remaining}
      </Text>

      <Text>
        Total Expenses:
        {expenseCount}
      </Text>

      <TouchableOpacity
  onPress={() =>
    router.push("/expenses")
  }
>
  <Text>
    Open Expenses
  </Text>
</TouchableOpacity>
    </View>
  );
}