import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  getBudgetSummary,
  getExpenses,
} from "../src/services/dashboardService";

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

  const loadDashboard =
    async () => {
      try {
        const budgetData =
          await getBudgetSummary();

        const expenses =
          await getExpenses();

        setSummary(
          budgetData
        );

        setExpenseCount(
          expenses.length
        );
      } catch (error) {
        console.log(error);
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
    </View>
  );
}