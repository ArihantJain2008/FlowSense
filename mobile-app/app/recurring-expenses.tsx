import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  getRecurringExpenses,
  createRecurringExpense,
  deleteRecurringExpense,
} from "../src/services/recurringExpenseService";

export default function RecurringExpenses() {
  const [expenses, setExpenses] =
    useState<any[]>([]);

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [frequency,
    setFrequency] =
    useState("Monthly");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses =
    async () => {
      try {
        const data =
          await getRecurringExpenses();

        setExpenses(data);
      } catch (error) {
        console.log(error);
      }
    };

  const handleCreate =
    async () => {
      if (
        !title ||
        !amount ||
        !category
      ) {
        Alert.alert(
          "Fill all fields"
        );
        return;
      }

      try {
        await createRecurringExpense(
          title,
          Number(amount),
          category,
          frequency
        );

        setTitle("");
        setAmount("");
        setCategory("");

        loadExpenses();
      } catch (error) {
        console.log(error);
      }
    };

  const handleDelete =
    async (id: string) => {
      try {
        await deleteRecurringExpense(
          id
        );

        loadExpenses();
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Recurring Expenses
      </Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Frequency"
        value={frequency}
        onChangeText={
          setFrequency
        }
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 10,
          marginBottom: 15,
        }}
      />

      <TouchableOpacity
        onPress={handleCreate}
        style={{
          backgroundColor:
            "#2563eb",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Add Recurring Expense
        </Text>
      </TouchableOpacity>

      <FlatList
        data={expenses}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderRadius: 10,
              padding: 15,
              marginBottom: 10,
            }}
          >
            <Text>
              {item.title}
            </Text>

            <Text>
              ₹{item.amount}
            </Text>

            <Text>
              {item.category}
            </Text>

            <Text>
              {item.frequency}
            </Text>

            <TouchableOpacity
              onPress={() =>
                handleDelete(
                  item.id
                )
              }
            >
              <Text
                style={{
                  color: "red",
                  marginTop: 8,
                }}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}