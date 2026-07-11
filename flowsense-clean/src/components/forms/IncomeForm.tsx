import { Picker } from "@react-native-picker/picker";
import { Switch, Text, View } from "react-native";

import AppInput from "../AppInput";
import { useAppTheme } from "../../theme";

const paymentMethods = [
  "Cash",
  "Card",
  "UPI",
  "Bank Transfer",
  "Wallet",
  "Other",
] as const;

export type IncomeFormState = {
  title: string;
  amount: string;
  source: string;
  merchant: string;
  note: string;
  paymentMethod: string;
  isFavorite: boolean;
  date: string;
};

type Props = {
  draft: IncomeFormState;
  setDraft: React.Dispatch<React.SetStateAction<IncomeFormState>>;
};

export const defaultIncomeFormState: IncomeFormState = {
  title: "",
  amount: "",
  source: "",
  merchant: "",
  note: "",
  paymentMethod: "Bank Transfer",
  isFavorite: false,
  date: new Date().toISOString().slice(0, 10),
};

export default function IncomeForm({ draft, setDraft }: Props) {
  const theme = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppInput
        label="Income Title"
        placeholder="Salary, freelance..."
        value={draft.title}
        onChangeText={(value) =>
          setDraft((current) => ({
            ...current,
            title: value,
          }))
        }
      />

      <AppInput
        label="Amount"
        placeholder="0"
        keyboardType="numeric"
        value={draft.amount}
        onChangeText={(value) =>
          setDraft((current) => ({
            ...current,
            amount: value,
          }))
        }
      />

      <AppInput
        label="Date"
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        value={draft.date}
        onChangeText={(value) =>
          setDraft((current) => ({
            ...current,
            date: value,
          }))
        }
      />

      <AppInput
        label="Source"
        placeholder="Employer, client..."
        value={draft.source}
        onChangeText={(value) =>
          setDraft((current) => ({
            ...current,
            source: value,
          }))
        }
      />

      <AppInput
        label="Merchant / Account"
        placeholder="HDFC, Stripe..."
        value={draft.merchant}
        onChangeText={(value) =>
          setDraft((current) => ({
            ...current,
            merchant: value,
          }))
        }
      />

      <AppInput
        label="Notes"
        placeholder="Optional note"
        value={draft.note}
        onChangeText={(value) =>
          setDraft((current) => ({
            ...current,
            note: value,
          }))
        }
      />

      <View>
        <Text
          style={[
            theme.typography.caption,
            {
              color: theme.colors.textMuted,
              marginBottom: 8,
            },
          ]}
        >
          Payment Method
        </Text>

        <Picker
          selectedValue={draft.paymentMethod}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              paymentMethod: value,
            }))
          }
        >
          {paymentMethods.map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>Save as favorite</Text>
        <Switch
          value={draft.isFavorite}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              isFavorite: value,
            }))
          }
        />
      </View>
    </View>
  );
}
