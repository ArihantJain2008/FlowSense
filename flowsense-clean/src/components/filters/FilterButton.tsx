import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { useAppTheme } from "../../theme";

type Props = {
  activeCount?: number;
  onPress: () => void;
};

export default function FilterButton({
  activeCount = 0,
  onPress,
}: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 52,
        paddingHorizontal: 16,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceStrong,
      }}
    >
      <Ionicons name="options-outline" size={18} color={theme.colors.text} />
      <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </Text>
    </Pressable>
  );
}
