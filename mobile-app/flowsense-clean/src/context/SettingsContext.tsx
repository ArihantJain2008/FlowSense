import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";

import { STORAGE_KEYS } from "../constants/storage";
import { colors } from "../theme/colors";
import { radius, shadows, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export type ThemePreference =
  | "system"
  | "light"
  | "dark";

export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP";

export type NotificationSettings = {
  budgetAlerts: boolean;
  goalReminders: boolean;
  recurringReminders: boolean;
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
  setThemePreference: (
    value: ThemePreference
  ) => Promise<void>;
  updateSettings: (
    updates: Partial<AppSettings>
  ) => Promise<void>;
  updateNotifications: (
    updates: Partial<NotificationSettings>
  ) => Promise<void>;
  resetLocalSettings: () => Promise<void>;
};

const SettingsContext =
  createContext<SettingsContextValue | null>(
    null
  );

export function SettingsProvider({
  children,
}: PropsWithChildren) {
  const [settings, setSettings] =
    useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] =
    useState(false);
  const [systemScheme, setSystemScheme] =
    useState<ColorSchemeName>(
      Appearance.getColorScheme()
    );

  useEffect(() => {
    const subscription =
      Appearance.addChangeListener(
        ({ colorScheme }) => {
          setSystemScheme(colorScheme);
        }
      );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            STORAGE_KEYS.settings
          );

        if (stored) {
          setSettings({
            ...defaultSettings,
            ...JSON.parse(stored),
            notifications: {
              ...defaultSettings.notifications,
              ...JSON.parse(stored)
                .notifications,
            },
          });
        }
      } finally {
        setLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const persistSettings = async (
    nextSettings: AppSettings
  ) => {
    setSettings(nextSettings);
    await AsyncStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify(nextSettings)
    );
  };

  const resolvedScheme =
    settings.themePreference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : settings.themePreference;

  const value = useMemo(() => {
    const theme = {
      scheme: resolvedScheme,
      colors: colors[resolvedScheme],
      spacing,
      radius,
      shadows,
      typography,
    };

    return {
      settings,
      loaded,
      resolvedScheme,
      theme,
      setThemePreference: async (
        themePreference: ThemePreference
      ) => {
        await persistSettings({
          ...settings,
          themePreference,
        });
      },
      updateSettings: async (
        updates: Partial<AppSettings>
      ) => {
        await persistSettings({
          ...settings,
          ...updates,
          notifications:
            updates.notifications
              ? {
                  ...settings.notifications,
                  ...updates.notifications,
                }
              : settings.notifications,
        });
      },
      updateNotifications: async (
        updates: Partial<NotificationSettings>
      ) => {
        await persistSettings({
          ...settings,
          notifications: {
            ...settings.notifications,
            ...updates,
          },
        });
      },
      resetLocalSettings: async () => {
        await persistSettings(
          defaultSettings
        );
      },
    };
  }, [loaded, resolvedScheme, settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context =
    useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used within SettingsProvider"
    );
  }

  return context;
}
