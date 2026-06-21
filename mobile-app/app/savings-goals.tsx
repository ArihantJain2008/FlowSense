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
  getGoals,
  createGoal,
  deleteGoal,
} from "../src/services/savingsGoalService";

export default function SavingsGoals() {
  const [goals, setGoals] =
    useState<any[]>([]);

  const [title, setTitle] =
    useState("");

  const [target, setTarget] =
    useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals =
    async () => {
      try {
        const data =
          await getGoals();

        setGoals(data);
      } catch (error) {
        console.log(error);
      }
    };

  const handleCreateGoal =
    async () => {
      if (
        !title ||
        !target
      ) {
        Alert.alert(
          "Fill all fields"
        );
        return;
      }

      try {
        await createGoal(
          title,
          Number(target)
        );

        setTitle("");
        setTarget("");

        loadGoals();
      } catch (error) {
        console.log(error);
      }
    };

  const handleDeleteGoal =
    async (id: string) => {
      try {
        await deleteGoal(id);

        loadGoals();
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
        Savings Goals
      </Text>

      <TextInput
        placeholder="Goal Title"
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
        placeholder="Target Amount"
        value={target}
        keyboardType="numeric"
        onChangeText={setTarget}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 10,
          borderRadius: 10,
        }}
      />

      <TouchableOpacity
        onPress={
          handleCreateGoal
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
          Create Goal
        </Text>
      </TouchableOpacity>

      <FlatList
        data={goals}
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
              Target: ₹
              {item.target}
            </Text>

            <Text>
              Saved: ₹
              {item.saved}
            </Text>

            <TouchableOpacity
              onPress={() =>
                handleDeleteGoal(
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