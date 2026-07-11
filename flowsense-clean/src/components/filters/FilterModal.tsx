import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import AppButton from "../AppButton";
import AppInput from "../AppInput";
import Card from "../Card";
import { useFilters } from "../../context/FiltersContext";
import { useAppTheme } from "../../theme";
import { expenseCategories } from "../../screens/shared";

const paymentMethods = ["All", "Cash", "Card", "UPI", "Bank Transfer", "Wallet", "Other"];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function FilterModal({ visible, onClose }: Props) {
  const theme = useAppTheme();
  const { filters, updateFilters, resetFilters } = useFilters();

  const handleReset = async () => {
    await resetFilters();
    onClose();
  };

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
              maxHeight: "90%",
              paddingBottom: 0,
            }}
          >
            <View style={styles.headerRow}>
              <View style={{ gap: 4, flex: 1 }}>
                <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Expense Filters</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Refine the current period without leaving the screen.</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyContent}>
              <View style={{ gap: 8 }}>
                <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Category</Text>
                <Picker
                  selectedValue={filters.category}
                  onValueChange={(value) => {
                    void updateFilters({ category: value });
                  }}
                >
                  <Picker.Item label="All" value="All" />
                  {expenseCategories.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>

              <View style={{ gap: 8 }}>
                <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Payment Method</Text>
                <Picker
                  selectedValue={filters.paymentMethod}
                  onValueChange={(value) => {
                    void updateFilters({ paymentMethod: value });
                  }}
                >
                  {paymentMethods.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>

              <AppInput
                label="Merchant"
                placeholder="Search exact merchant text"
                value={filters.merchant}
                onChangeText={(value) => {
                  void updateFilters({ merchant: value });
                }}
              />

              <AppInput
                label="Minimum Amount"
                placeholder="0"
                keyboardType="numeric"
                value={filters.minAmount || ""}
                onChangeText={(value) => {
                  void updateFilters({ minAmount: value });
                }}
              />

              <AppInput
                label="Maximum Amount"
                placeholder="0"
                keyboardType="numeric"
                value={filters.maxAmount || ""}
                onChangeText={(value) => {
                  void updateFilters({ maxAmount: value });
                }}
              />

              <View style={styles.switchRow}>
                <Text style={[theme.typography.body, { color: theme.colors.text }]}>Favorites only</Text>
                <Switch
                  value={filters.favoriteOnly}
                  onValueChange={(value) => {
                    void updateFilters({ favoriteOnly: value });
                  }}
                />
              </View>
            </ScrollView>

            <View style={styles.actionsRow}>
              <View style={{ flex: 1 }}>
                <AppButton label="Reset" variant="ghost" onPress={handleReset} />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton label="Apply" onPress={onClose} />
              </View>
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
    gap: 16,
    paddingBottom: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
});
