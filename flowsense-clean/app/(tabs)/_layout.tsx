import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useAppTheme } from "../../src/theme";

export default function TabsLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:
          theme.colors.primary,
        tabBarInactiveTintColor:
          theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor:
            theme.colors.surfaceStrong,
          borderTopColor:
            theme.colors.border,
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="grid-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="receipt-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: "Income",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="cash-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="savings-goals"
        options={{
          title: "Savings",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="flag-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="pie-chart-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
  name="profile"
  options={{
    title: "Profile",
    tabBarIcon: ({ color, size }) => (
      <Ionicons
        name="person-circle"
        size={size}
        color={color}
      />
    ),
  }}
/>
    </Tabs>
  );
}
