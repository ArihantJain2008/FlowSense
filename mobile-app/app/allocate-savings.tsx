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
  getAllocationSummary,
  allocateSavings,
} from "../src/services/savingsAllocationService";

export default function AllocateSavings() {
  const [summary, setSummary] =
    useState<any>(null);

  const [selectedGoalId,
    setSelectedGoalId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const loadData = async () => {
    try {
      const data =
        await getAllocationSummary();

      setSummary(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate =
    async () => {
      try {
        if (
          !selectedGoalId ||
          !amount
        ) {
          Alert.alert(
            "Select goal and amount"
          );
          return;
        }

        await allocateSavings(
          selectedGoalId,
          Number(amount)
        );

        Alert.alert(
          "Success",
          "Savings allocated"
        );

        setAmount("");

        loadData();
      } catch (error: any) {
        Alert.alert(
          "Error",
          error?.response?.data
            ?.message ||
            "Allocation failed"
        );
      }
    };

  if (!summary) {
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
        <Text>
          Loading...
        </Text>
      </View>
    );
  }

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
        Allocate Savings
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 15,
          marginBottom: 20,
        }}
      >
        <Text>
          Budget: ₹
          {summary.budget}
        </Text>

        <Text>
          Spent: ₹
          {summary.spent}
        </Text>

        <Text>
          Remaining: ₹
          {summary.remaining}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 10,
        }}
      >
        Select Goal
      </Text>

      <FlatList
        data={summary.goals}
        keyExtractor={(item) =>
          item.id
        }
        style={{
          maxHeight: 250,
        }}
        renderItem={({
          item,
        }) => (
          <TouchableOpacity
            onPress={() =>
              setSelectedGoalId(
                item.id
              )
            }
            style={{
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              backgroundColor:
                selectedGoalId ===
                item.id
                  ? "#dbeafe"
                  : "white",
            }}
          >
            <Text>
              {item.title}
            </Text>

            <Text>
              Saved: ₹
              {item.saved}
            </Text>

            <Text>
              Target: ₹
              {item.target}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={
          setAmount
        }
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginTop: 15,
          marginBottom: 15,
        }}
      />

      <TouchableOpacity
        onPress={
          handleAllocate
        }
        style={{
          backgroundColor:
            "#16a34a",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Allocate Savings
        </Text>
      </TouchableOpacity>
    </View>
  );
}