import { useSettings } from "../context/SettingsContext";
import { colors } from "./colors";
import { radius, shadows, spacing } from "./spacing";
import { typography } from "./typography";

export const useAppTheme = () => {
  const { theme } = useSettings();
  return theme;
};

export { colors, radius, shadows, spacing, typography };
