import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Ionicons } from "@expo/vector-icons";

const ACTION_WIDTH = 88;

type ExpenseSwipeableProps = {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ExpenseSwipeable({
  children,
  onEdit,
  onDelete,
}: ExpenseSwipeableProps) {
  const swipeableRef = useRef<React.ElementRef<typeof Swipeable>>(null);

  const handleAction = (callback: () => void) => {
    swipeableRef.current?.close();
    callback();
  };

  const renderRightActions = () => (
    <View style={styles.actionsContainer}>
      <Pressable
        onPress={() => handleAction(onEdit)}
        style={styles.editAction}
      >
        <View style={[styles.iconBubble, { backgroundColor: "rgba(255,255,255,0.16)" }]}>
          <Ionicons name="create-outline" size={18} color="white" />
        </View>
        <Text style={styles.actionLabel}>Edit</Text>
      </Pressable>

      <Pressable
        onPress={() => handleAction(onDelete)}
        style={styles.deleteAction}
      >
        <View style={[styles.iconBubble, { backgroundColor: "rgba(255,255,255,0.16)" }]}>
          <Ionicons name="trash-outline" size={18} color="white" />
        </View>
        <Text style={styles.actionLabel}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    width: ACTION_WIDTH * 2 + 12,
    marginRight: 12,
    marginVertical: 8,
    gap: 8,
  },
  editAction: {
    width: ACTION_WIDTH,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    backgroundColor: "#2563EB",
  },
  deleteAction: {
    width: ACTION_WIDTH,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    backgroundColor: "#DC2626",
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
