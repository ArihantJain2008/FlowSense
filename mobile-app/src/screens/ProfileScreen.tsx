import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
} from "react-native";
import { router } from "expo-router";

import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import AppButton from "../components/AppButton";
import { useAppTheme } from "../theme";
import { useSettings, } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";

function ThemeOption({
  label,
  selected,
  onPress,
  theme,
}: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.colors.primary,
          fontSize: 20,
        }}
      >
        {selected ? "●" : "○"}
      </Text>
    </Pressable>
  );
}

export default function ProfileScreen() {

    
  const theme = useAppTheme();

  const { user, logout } = useAuth();

    const {
  settings,
  setThemePreference,
  updateNotifications
} = useSettings();

const initials =
  user?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const handleLogout = async () => {
  await logout();
  router.replace("/login");
};

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text
          style={[
            theme.typography.h1,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Profile
        </Text>

        <Card>
  <View
    style={{
      alignItems: "center",
      paddingVertical: 10,
    }}
  >
    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor:
          theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 26,
          fontWeight: "700",
        }}
      >
        {initials}
      </Text>
    </View>

    <Text
      style={[
        theme.typography.h3,
        {
          color:
            theme.colors.text,
        },
      ]}
    >
      {user?.name || "User"}
    </Text>

    <Text
      style={{
        color:
          theme.colors.textMuted,
        marginTop: 4,
      }}
    >
      {user?.email || ""}
    </Text>
  </View>
</Card>

        <Card>
  <Text
    style={{
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 16,
    }}
  >
    Appearance
  </Text>

  <ThemeOption
    label="System Theme"
    selected={
      settings.themePreference ===
      "system"
    }
    onPress={() =>
      setThemePreference("system")
    }
    theme={theme}
  />

  <ThemeOption
    label="Light Theme"
    selected={
      settings.themePreference ===
      "light"
    }
    onPress={() =>
      setThemePreference("light")
    }
    theme={theme}
  />

  <ThemeOption
    label="Dark Theme"
    selected={
      settings.themePreference ===
      "dark"
    }
    onPress={() =>
      setThemePreference("dark")
    }
    theme={theme}
  />
</Card>

        <Card>
          <Text
            style={[
              theme.typography.h3,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Notifications
          </Text>

          <View
            style={styles.row}
          >
            <Text
  style={{
    color: theme.colors.text,
    fontSize: 16,
  }}
>
  Budget Alerts
</Text>

            <Switch
  value={settings.notifications.budgetAlerts}
  onValueChange={(value) =>
    updateNotifications({
      budgetAlerts: value,
    })
  }
/>  
          </View>

          <View
            style={styles.row}
          >
            <Text
  style={{
    color: theme.colors.text,
    fontSize: 16,
  }}
>
  Goal Reminders
</Text>

           <Switch
  value={settings.notifications.goalReminders}
  onValueChange={(value) =>
    updateNotifications({
      goalReminders: value,
    })
  }
/>
          </View>

          <View
            style={styles.row}
          >
            <Text
  style={{
    color: theme.colors.text,
    fontSize: 16,
  }}
>
  Recurring Reminders
</Text>

            <Switch
  value={settings.notifications.recurringReminders}
  onValueChange={(value) =>
    updateNotifications({
      recurringReminders: value,
    })
  }
/>
          </View>

          <Card>
  <AppButton
    label="Import Transactions"
    onPress={() =>
      router.push(
        "/import-transactions"
      )
    }
  />
</Card>

        </Card>

        <Card>
          <AppButton
            label="Logout"
            onPress={
              handleLogout
            }
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 30,
  },

  row: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 12,
  },
});