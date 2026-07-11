import { useEffect, useMemo } from "react";
import {
  Animated,
  DimensionValue,
  StyleSheet,
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
  const opacity = useMemo(() => new Animated.Value(0.55), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          height,
          width,
          backgroundColor: theme.colors.skeleton,
          borderRadius: radius ?? theme.radius.md,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 0,
  },
});
