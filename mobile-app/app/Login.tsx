import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from "react-native";

import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { loginUser } from "../src/services/authService";

export default function Login() {
  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const handleLogin =
    async () => {
      try {
        const data =
          await loginUser(
            email,
            password
          );

        await AsyncStorage.setItem(
          "token",
          data.token
        );

        router.replace(
          "/dashboard"
        );
      } catch (error: any) {
        Alert.alert(
          "Error",
          error?.response?.data
            ?.message ||
            "Login Failed"
        );
      }
    };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          marginBottom: 20,
        }}
      >
        Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={
          setPassword
        }
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 20,
        }}
      />

      <Button
        title="Login"
        onPress={
          handleLogin
        }
      />

      <View
        style={{
          marginTop: 20,
        }}
      >
        <Button
          title="Create Account"
          onPress={() =>
            router.push(
              "/register"
            )
          }
        />
      </View>
    </View>
  );
}