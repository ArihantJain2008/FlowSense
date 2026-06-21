import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

import {
  getExpenses,
  createExpense,
  deleteExpense,
} from "../src/services/expenseService";

export default function Expenses() {
  const [expenses, setExpenses] =
    useState<any[]>([]);

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses =
    async () => {
      try {
        const data =
          await getExpenses();

        setExpenses(data);
      } catch (error) {
        console.log(error);
      }
    };

  const handleAddExpense =
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
        await createExpense(
          title,
          Number(amount),
          category
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
        await deleteExpense(id);

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
        Expenses
      </Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 10,
          borderRadius: 10,
        }}
      />

      <TextInput
        placeholder="Amount"
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 10,
          borderRadius: 10,
        }}
      />

      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 10,
          borderRadius: 10,
        }}
      />

      <TouchableOpacity
        onPress={
          handleAddExpense
        }
        style={{
          backgroundColor:
            "#0f766e",
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
          Add Expense
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