import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Card from "../components/Card";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { useAppTheme } from "../theme";

const validateEmail = (value: string) =>
  /\S+@\S+\.\S+/.test(value);

export function LoginScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const emailError =
    email.length > 0 &&
    !validateEmail(email)
      ? "Enter a valid email address."
      : "";

  const passwordError =
    password.length > 0 &&
    password.length < 6
      ? "Password must be at least 6 characters."
      : "";

  const handleLogin = async () => {
    if (!email || !password) {
      toast.showError(
        "Fill in email and password."
      );
      return;
    }

    if (emailError || passwordError) {
      toast.showError(
        "Please fix the form errors."
      );
      return;
    }

    try {
      setSubmitting(true);
      await login(
        email,
        password
      );
      toast.showSuccess(
        "Welcome back."
      );
      router.replace("/dashboard");
    } catch (error: any) {
      toast.showError(
        error?.response?.data
          ?.message || "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      contentStyle={{
        justifyContent: "center",
      }}
    >
      <View style={{ gap: 8 }}>
        <Text
          style={[
            theme.typography.hero,
            { color: theme.colors.text },
          ]}
        >
          FlowSense
        </Text>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textMuted },
          ]}
        >
          Track every rupee with calm,
          clarity, and momentum.
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
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={emailError}
        />
        <AppInput
          label="Password"
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />
        <AppButton
          label="Login"
          onPress={handleLogin}
          loading={submitting}
        />
        <AppButton
          label="Create Account"
          onPress={() =>
            router.push("/register")
          }
          variant="ghost"
        />
      </Card>
    </ScreenContainer>
  );
}

export function RegisterScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const emailError =
    email.length > 0 &&
    !validateEmail(email)
      ? "Enter a valid email address."
      : "";

  const passwordError =
    password.length > 0 &&
    password.length < 6
      ? "Password must be at least 6 characters."
      : "";

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.showError(
        "Please complete every field."
      );
      return;
    }

    if (emailError || passwordError) {
      toast.showError(
        "Please fix the form errors."
      );
      return;
    }

    try {
      setSubmitting(true);
      await register(
        name,
        email,
        password
      );
      toast.showSuccess(
        "Account created successfully."
      );
      router.replace("/login");
    } catch (error: any) {
      toast.showError(
        error?.response?.data
          ?.message ||
          "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      contentStyle={{
        justifyContent: "center",
      }}
    >
      <View style={{ gap: 8 }}>
        <Text
          style={[
            theme.typography.hero,
            { color: theme.colors.text },
          ]}
        >
          Create your account
        </Text>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textMuted },
          ]}
        >
          Start with a polished money
          dashboard from day one.
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
          label="Name"
          placeholder="Your full name"
          value={name}
          onChangeText={setName}
        />
        <AppInput
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={emailError}
        />
        <AppInput
          label="Password"
          placeholder="Create password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />
        <AppButton
          label="Register"
          onPress={handleRegister}
          loading={submitting}
        />
        <AppButton
          label="Already have an account?"
          onPress={() =>
            router.push("/login")
          }
          variant="ghost"
        />
      </Card>
    </ScreenContainer>
  );
}
