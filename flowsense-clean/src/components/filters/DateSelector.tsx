import { Modal, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Card from "../Card";
import AppButton from "../AppButton";
import AppInput from "../AppInput";
import { useAppTheme } from "../../theme";
import { useFilters } from "../../context/FiltersContext";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const presets = [
  { key: "today", label: "Today" },
  { key: "thisWeek", label: "This Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisYear", label: "This Year" },
  { key: "custom", label: "Custom Range" },
];

export default function DateSelector({
  visible,
  onClose,
}: Props) {
  const theme = useAppTheme();
  const { filters, navigationLabel, setPreset, updateFilters } = useFilters();
  const isCustom = filters.preset === "custom";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable>
          <Card
            style={{
              margin: 20,
              marginTop: "auto",
              gap: 10,
            }}
          >
            <Text
              style={[
                theme.typography.h2,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Select Period
            </Text>

            <Text
              style={[
                theme.typography.caption,
                {
                  color: theme.colors.textMuted,
                },
              ]}
            >
              Current view: {navigationLabel}
            </Text>

            <ScrollView>

              {presets.map((item) => {

                const active =
                  filters.preset === item.key;

                return (
                  <Pressable
                    key={item.key}
                    onPress={async () => {
                      await setPreset(item.key as any);
                    }}
                    style={[
                      styles.item,
                      {
                        backgroundColor: active
                          ? theme.colors.primary
                          : theme.colors.surfaceStrong,
                      },
                    ]}
                  >

                    <Text
                      style={[
                        theme.typography.body,
                        {
                          color: active
                            ? "#fff"
                            : theme.colors.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>

                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color="#fff"
                      />
                    )}

                  </Pressable>
                );

              })}

              {isCustom ? (
                <Card
                  style={{
                    gap: theme.spacing.md,
                    backgroundColor: theme.colors.surfaceStrong,
                  }}
                >
                  <AppInput
                    label="Start Date"
                    placeholder="YYYY-MM-DD"
                    value={filters.startDate || ""}
                    onChangeText={(value) => {
                      void updateFilters({
                        startDate: value || undefined,
                      });
                    }}
                  />
                  <AppInput
                    label="End Date"
                    placeholder="YYYY-MM-DD"
                    value={filters.endDate || ""}
                    onChangeText={(value) => {
                      void updateFilters({
                        endDate: value || undefined,
                      });
                    }}
                  />
                </Card>
              ) : null}

              <AppButton label="Done" onPress={onClose} />
            </ScrollView>

          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  item: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

});
