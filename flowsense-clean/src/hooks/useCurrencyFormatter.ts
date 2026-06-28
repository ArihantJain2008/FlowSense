import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/format";

export function useCurrencyFormatter() {
  const { settings } = useSettings();

  return {
    currency: settings.currency,
    formatMoney: (
      value: number | null | undefined
    ) =>
      formatCurrency(
        value,
        settings.currency
      ),
  };
}
