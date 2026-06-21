import {
  DimensionValue,
  StyleSheet,
  View,
} from "react-native";

import { useAppTheme } from "../theme";

type SkeletonBlockProps = {
  height: number;
  width?: DimensionValue;
  radius?: number;
};

export default function SkeletonBlock({
  height,
  width = "100%",
  radius,
}: SkeletonBlockProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.base,
        {
          height,
          width,
          backgroundColor:
            theme.colors.skeleton,
          borderRadius:
            radius ?? theme.radius.sm,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});
