import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";

import { STORAGE_KEYS } from "../constants/storage";
import { useAuth } from "./AuthContext";
import { colors } from "../theme/colors";
import { radius, shadows, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { updateProfileSettings } from "../services/profileService";

export type ThemePreference =
  | "system"
  | "light"
  | "dark"
  | "amoled"
  | "ocean"
  | "emerald"
  | "purple"
  | "cyber";

export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "AUD"
  | "AED";

export type NotificationSettings = {
  budgetAlerts: boolean;
  goalReminders: boolean;
  recurringReminders: boolean;
  salaryReminders: boolean;
  monthlySummary: boolean;
  customReminders: boolean;
};

export type AppSettings = {
  themePreference: ThemePreference;
  currency: CurrencyCode;
  firstDayOfWeek: "Sunday" | "Monday";
  defaultExpenseCategory: string;
  notifications: NotificationSettings;
};

const defaultSettings: AppSettings = {
  themePreference: "system",
  currency: "INR",
  firstDayOfWeek: "Monday",
  defaultExpenseCategory: "Food",
  notifications: {
    budgetAlerts: true,
    goalReminders: true,
    recurringReminders: true,
    salaryReminders: false,
    monthlySummary: true,
    customReminders: true,
  },
};

type SettingsContextValue = {
  settings: AppSettings;
  loaded: boolean;
  resolvedScheme: "light" | "dark";
  theme: {
    scheme: "light" | "dark";
    colors: (typeof colors)["light"];
    spacing: typeof spacing;
    radius: typeof radius;
    shadows: typeof shadows;
    typography: typeof typography;
  };
  setThemePreference: (value: ThemePreference) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationSettings>) => Promise<void>;
  resetLocalSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme() ?? "light");
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.settings);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({
            ...defaultSettings,
            ...parsed,
            notifications: {
              ...defaultSettings.notifications,
              ...parsed.notifications,
            },
          });
        }
      } finally {
        setLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const effectiveSettings = useMemo<AppSettings>(
    () => ({
      ...settings,
      themePreference: (user?.themePreference as ThemePreference) || settings.themePreference,
      currency: (user?.currency as CurrencyCode) || settings.currency,
      notifications: {
        ...settings.notifications,
        ...user?.notificationSettings,
      },
    }),
    [settings, user]
  );

  const persistSettings = useCallback(async (nextSettings: AppSettings) => {
    setSettings(nextSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(nextSettings));

    try {
      await updateProfileSettings({
        themePreference: nextSettings.themePreference,
        currency: nextSettings.currency,
        notificationSettings: nextSettings.notifications,
      });
      await refreshProfile();
    } catch {
      // Keep local settings available offline even if the profile sync fails.
    }
  }, [refreshProfile]);

  const paletteKey =
    effectiveSettings.themePreference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : ["dark", "amoled", "purple", "cyber"].includes(effectiveSettings.themePreference)
        ? "dark"
        : "light";

  const themeColors =
    effectiveSettings.themePreference === "system"
      ? colors[paletteKey]
      : colors[effectiveSettings.themePreference];

  const value = useMemo(() => {
    const theme = {
      scheme: (paletteKey === "dark" ? "dark" : "light") as "light" | "dark",
      colors: themeColors,
      spacing,
      radius,
      shadows,
      typography,
    };

    return {
      settings: effectiveSettings,
      loaded,
      resolvedScheme: theme.scheme,
      theme,
      setThemePreference: async (themePreference: ThemePreference) => {
        await persistSettings({
          ...effectiveSettings,
          themePreference,
        });
      },
      updateSettings: async (updates: Partial<AppSettings>) => {
        await persistSettings({
          ...effectiveSettings,
          ...updates,
          notifications: updates.notifications
            ? {
                ...effectiveSettings.notifications,
                ...updates.notifications,
              }
            : effectiveSettings.notifications,
        });
      },
      updateNotifications: async (updates: Partial<NotificationSettings>) => {
        await persistSettings({
          ...effectiveSettings,
          notifications: {
            ...effectiveSettings.notifications,
            ...updates,
          },
        });
      },
      resetLocalSettings: async () => {
        await persistSettings(defaultSettings);
      },
    };
  }, [effectiveSettings, loaded, paletteKey, persistSettings, themeColors]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }

  return context;
}
