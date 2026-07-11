import { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../theme";

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  header?: ReactNode;
  scrollProps?: ScrollViewProps;
}>;

export default function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
  header,
  scrollProps,
}: ScreenContainerProps) {
  const theme = useAppTheme();

  const body = (
    <View
      style={[
        styles.contentShell,
        {
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
          gap: theme.spacing.lg,
        },
        contentStyle,
      ]}
    >
      {header}
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View
          style={[
            styles.backdropTop,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        />
        <View
          style={[
            styles.backdropCircle,
            {
              backgroundColor:
                theme.colors.accent,
            },
          ]}
        />
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={
              styles.scrollContent
            }
            showsVerticalScrollIndicator={
              false
            }
            {...scrollProps}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  contentShell: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "center",
    maxWidth: 720,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backdropTop: {
    position: "absolute",
    top: -90,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 220,
    opacity: 0.1,
  },
  backdropCircle: {
    position: "absolute",
    top: 120,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 180,
    opacity: 0.08,
  },
});
