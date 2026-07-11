import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import AppButton from "./AppButton";
import { useAppTheme } from "../theme";

type Props = PropsWithChildren<{
  visible: boolean;
  title: string;
  submitLabel: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}>;

export default function FormSheetModal({
  visible,
  title,
  submitLabel,
  saving = false,
  onClose,
  onSubmit,
  children,
}: Props) {
  const theme = useAppTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                borderTopColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <View style={styles.footerButton}>
              <AppButton label="Cancel" variant="ghost" onPress={onClose} disabled={saving} />
            </View>
            <View style={styles.footerButton}>
              <AppButton label={submitLabel} onPress={onSubmit} loading={saving} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    maxHeight: "82%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: 18,
    paddingBottom: 22,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
