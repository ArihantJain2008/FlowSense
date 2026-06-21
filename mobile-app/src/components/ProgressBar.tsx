import { StyleSheet, Text, View } from "react-native";

import { clampPercentage } from "../utils/format";
import { useAppTheme } from "../theme";

type ProgressBarProps = {
  progress: number;
  valueLabel?: string;
};

export default function ProgressBar({
  progress,
  valueLabel,
}: ProgressBarProps) {
  const theme = useAppTheme();
  const safeProgress =
    clampPercentage(progress);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.track,
          {
            backgroundColor:
              theme.colors.surfaceMuted,
            borderRadius:
              theme.radius.pill,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${safeProgress}%`,
              backgroundColor:
                theme.colors.primary,
              borderRadius:
                theme.radius.pill,
            },
          ]}
        />
      </View>
      {valueLabel ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted },
          ]}
        >
          {valueLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  track: {
    height: 12,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
