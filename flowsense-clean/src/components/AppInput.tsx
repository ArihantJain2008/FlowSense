import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { useAppTheme } from "../theme";

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export default function AppInput({
  label,
  error,
  style,
  ...props
}: AppInputProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          theme.typography.caption,
          styles.label,
          { color: theme.colors.textMuted },
        ]}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={
          theme.colors.textMuted
        }
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor:
              theme.colors.inputBackground,
            borderColor: error
              ? theme.colors.danger
              : theme.colors.border,
            borderRadius:
              theme.radius.md,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.danger },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    marginLeft: 2,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
