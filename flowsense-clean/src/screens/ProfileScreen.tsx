import { router } from "expo-router";
import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import AppButton from "../components/AppButton";
import Card from "../components/Card";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import { useAuth } from "../context/AuthContext";
import { useSettings, type CurrencyCode } from "../context/SettingsContext";
import { useAppTheme } from "../theme";

const THEME_OPTIONS = [
  { value: "system", label: "System", description: "Follows your device mode." },
  { value: "light", label: "Light", description: "Warm, bright, and high contrast." },
  { value: "dark", label: "Dark", description: "Balanced dark surfaces and soft accents." },
  { value: "amoled", label: "AMOLED", description: "True black for OLED screens." },
  { value: "ocean", label: "Ocean", description: "Cool blue tones with a calm feel." },
  { value: "emerald", label: "Emerald", description: "Fresh green palette with a clean look." },
  { value: "purple", label: "Purple", description: "Vivid violet accents and contrast." },
  { value: "cyber", label: "Cyber", description: "Neon terminal styling with sharp highlights." },
] as const;

const CURRENCY_OPTIONS: Array<{ value: CurrencyCode; label: string; description: string }> = [
  { value: "INR", label: "INR", description: "Indian Rupee" },
  { value: "USD", label: "USD", description: "US Dollar" },
  { value: "EUR", label: "EUR", description: "Euro" },
  { value: "GBP", label: "GBP", description: "British Pound" },
  { value: "JPY", label: "JPY", description: "Japanese Yen" },
  { value: "CAD", label: "CAD", description: "Canadian Dollar" },
  { value: "AUD", label: "AUD", description: "Australian Dollar" },
] as const;

const NOTIFICATION_OPTIONS = [
  {
    key: "budgetAlerts",
    label: "Budget Alerts",
    description: "Notify when spending approaches a budget limit.",
  },
  {
    key: "goalReminders",
    label: "Goal Reminders",
    description: "Remind you when savings goals need attention.",
  },
  {
    key: "recurringReminders",
    label: "Recurring Reminders",
    description: "Surface upcoming recurring expenses.",
  },
  {
    key: "salaryReminders",
    label: "Salary Reminders",
    description: "Alert you when salary deposits are expected.",
  },
  {
    key: "monthlySummary",
    label: "Monthly Summary",
    description: "Send a monthly spending and savings summary.",
  },
  {
    key: "customReminders",
    label: "Custom Reminders",
    description: "Enable reminders you configure manually.",
  },
] as const;

function ThemeOption({
  label,
  description,
  selected,
  onPress,
  theme,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.themeOption,
        {
          backgroundColor: selected ? theme.colors.surfaceStrong : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <View style={styles.themeOptionRow}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{label}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{description}</Text>
        </View>
        <View
          style={[
            styles.themeRadio,
            {
              borderColor: selected ? theme.colors.primary : theme.colors.border,
              backgroundColor: selected ? theme.colors.primary : "transparent",
            },
          ]}
        >
          {selected ? <Text style={{ color: theme.colors.surfaceStrong, fontWeight: "700" }}>✓</Text> : null}
        </View>
      </View>
      <View style={styles.themeSwatchRow}>
        <View style={[styles.themeSwatch, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.themeSwatch, { backgroundColor: theme.colors.secondary }]} />
        <View style={[styles.themeSwatch, { backgroundColor: theme.colors.accent }]} />
      </View>
    </Pressable>
  );
}

function NotificationRow({
  label,
  description,
  value,
  onValueChange,
  theme,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (nextValue: boolean) => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={styles.notificationRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const { user, logout, loaded } = useAuth();
  const { settings, setThemePreference, updateNotifications, updateSettings } = useSettings();

  const initials =
    user?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const themeSummary = useMemo(() => {
    if (settings.themePreference === "system") {
      return "System";
    }

    return THEME_OPTIONS.find((option) => option.value === settings.themePreference)?.label || settings.themePreference;
  }, [settings.themePreference]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Account and personalization</Text>
            <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Profile</Text>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
              Manage your appearance, notification behavior, and import tools from one place.
            </Text>
          </View>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {!loaded ? (
          <View style={styles.skeletonStack}>
            <Card style={{ gap: 12 }}>
              <SkeletonBlock height={16} width="48%" />
              <SkeletonBlock height={72} width="100%" />
              <SkeletonBlock height={72} width="100%" />
            </Card>
            <Card style={{ gap: 12 }}>
              <SkeletonBlock height={16} width="42%" />
              <SkeletonBlock height={52} width="100%" />
              <SkeletonBlock height={52} width="100%" />
              <SkeletonBlock height={52} width="100%" />
            </Card>
            <Card style={{ gap: 12 }}>
              <SkeletonBlock height={16} width="44%" />
              <SkeletonBlock height={54} width="100%" />
              <SkeletonBlock height={54} width="100%" />
            </Card>
          </View>
        ) : (
          <>
            <Card style={{ gap: 14, backgroundColor: theme.colors.surfaceStrong }}>
              <View style={styles.identityRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{user?.name || "User"}</Text>
                  <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{user?.email || ""}</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <Text style={[theme.typography.caption, { color: theme.colors.text }]}>{themeSummary}</Text>
                </View>
              </View>
              <View style={styles.profileMetaRow}>
                <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceMuted }]}> 
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Currency</Text>
                  <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{settings.currency}</Text>
                </View>
                <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceMuted }]}> 
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Notifications</Text>
                  <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>On device and profile sync</Text>
                </View>
              </View>
            </Card>

            <Card style={{ gap: 14, backgroundColor: theme.colors.surfaceStrong }}>
              <View style={styles.sectionHeader}>
                <View style={{ gap: 4 }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Appearance</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Expose every supported theme mode.</Text>
                </View>
              </View>

              <View style={styles.themeGrid}>
                {THEME_OPTIONS.map((option) => (
                  <ThemeOption
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    selected={settings.themePreference === option.value}
                    onPress={() => setThemePreference(option.value)}
                    theme={theme}
                  />
                ))}
              </View>
            </Card>

            <Card style={{ gap: 14, backgroundColor: theme.colors.surfaceStrong }}>
              <View style={styles.sectionHeader}>
                <View style={{ gap: 4 }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Currency</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Formatting updates instantly across the app.</Text>
                </View>
              </View>

              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={settings.currency}
                  onValueChange={(value) => {
                    void updateSettings({ currency: value as CurrencyCode });
                  }}
                  dropdownIconColor={theme.colors.text}
                  style={{ color: theme.colors.text }}
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <Picker.Item key={option.value} label={`${option.label} • ${option.description}`} value={option.value} />
                  ))}
                </Picker>
              </View>
            </Card>

            <Card style={{ gap: 14, backgroundColor: theme.colors.surfaceStrong }}>
              <View style={styles.sectionHeader}>
                <View style={{ gap: 4 }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Notifications</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>All notification settings remain backed by the same profile payload.</Text>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                {NOTIFICATION_OPTIONS.map((option) => (
                  <NotificationRow
                    key={option.key}
                    label={option.label}
                    description={option.description}
                    value={settings.notifications[option.key]}
                    onValueChange={(value) => updateNotifications({ [option.key]: value } as any)}
                    theme={theme}
                  />
                ))}
              </View>
            </Card>

            <Card style={{ gap: 12, backgroundColor: theme.colors.surfaceStrong }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Quick Actions</Text>
              <AppButton label="Import Transactions" onPress={() => router.push("/import-transactions")} />
              <AppButton label="Logout" onPress={handleLogout} variant="secondary" />
            </Card>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 30,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  skeletonStack: {
    gap: 16,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileMetaRow: {
    gap: 10,
  },
  metaChip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  themeGrid: {
    gap: 12,
  },
  themeOption: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  themeOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  themeRadio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  themeSwatchRow: {
    flexDirection: "row",
    gap: 8,
  },
  themeSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 2,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    borderRadius: 18,
    overflow: "hidden",
  },
});
