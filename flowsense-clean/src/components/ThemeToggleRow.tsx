import { Pressable, StyleSheet, Text, View } from "react-native";

import { useSettings, type ThemePreference } from "../context/SettingsContext";

type ThemeOption = ThemePreference;

const themeLabels: Record<ThemeOption, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
  amoled: "AMOLED",
  ocean: "Ocean",
  emerald: "Emerald",
  purple: "Purple",
  cyber: "Cyber",
};

type ThemeToggleRowProps = {
  options: readonly ThemeOption[];
};

export default function ThemeToggleRow({
  options,
}: ThemeToggleRowProps) {
  const { settings, setThemePreference, theme } =
    useSettings();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor:
            theme.colors.surfaceMuted,
          borderRadius:
            theme.radius.pill,
        },
      ]}
    >
      {options.map((option) => {
        const active =
          settings.themePreference ===
          option;

        return (
          <Pressable
            key={option}
            onPress={() =>
              setThemePreference(option)
            }
            style={[
              styles.option,
              {
                backgroundColor: active
                  ? theme.colors.primary
                  : "transparent",
                borderRadius:
                  theme.radius.pill,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.caption,
                {
                  color: active
                    ? theme.colors.surfaceStrong
                    : theme.colors.text,
                },
              ]}
            >
              {themeLabels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 4,
  },
  option: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
});
