import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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

export default function DateSelector({ visible, onClose }: Props) {
  const theme = useAppTheme();
  const { filters, navigationLabel, setPreset, updateFilters } = useFilters();
  const isCustom = filters.preset === "custom";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={() => undefined} style={styles.sheetPressable}>
          <Card
            style={{
              marginHorizontal: 16,
              marginBottom: 12,
              marginTop: "auto",
              gap: theme.spacing.md,
              backgroundColor: theme.colors.surfaceStrong,
              maxHeight: "88%",
              paddingBottom: 0,
            }}
          >
            <View style={styles.headerRow}>
              <View style={{ gap: 4, flex: 1 }}>
                <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Select Period</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Current view: {navigationLabel}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyContent}>
              {presets.map((item) => {
                const active = filters.preset === item.key;

                return (
                  <Pressable
                    key={item.key}
                    onPress={async () => {
                      await setPreset(item.key as any);
                    }}
                    style={[
                      styles.item,
                      {
                        backgroundColor: active ? theme.colors.primary : theme.colors.surfaceStrong,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        theme.typography.body,
                        {
                          color: active ? "#fff" : theme.colors.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>

                    {active ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
                  </Pressable>
                );
              })}

              {isCustom ? (
                <Card style={{ gap: theme.spacing.md, backgroundColor: theme.colors.surfaceStrong }}>
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
            </ScrollView>

            <View style={styles.footer}>
              <AppButton label="Done" onPress={onClose} />
            </View>
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
  sheetPressable: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyContent: {
    gap: 12,
    paddingBottom: 4,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    paddingBottom: 12,
  },
});
