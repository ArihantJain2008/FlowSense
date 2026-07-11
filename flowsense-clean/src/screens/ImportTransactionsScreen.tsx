import { useState } from "react";
import { Alert, Text, View } from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Card from "../components/Card";
import ScreenContainer from "../components/ScreenContainer";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";
import { importExpenses } from "../services/expenseService";
import { createIncome } from "../services/incomeService";
import { useAppTheme } from "../theme";
import { normalizeImportedTransaction } from "../utils/smartImport";

type ImportedTransaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  merchant: string;
  predictedMerchant: string;
  category: string;
  predictedCategory: string;
  confidenceLabel: "High" | "Medium" | "Low";
  correctedCategory?: string;
  correctedMerchant?: string;
};

function normalizeDate(value: string) {
  const parts = String(value).split("/");

  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return String(value);
}

export default function ImportTransactionsScreen() {
  const theme = useAppTheme();
  const { formatMoney } = useCurrencyFormatter();
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportedTransaction[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const confidenceStyles = {
    High: { backgroundColor: theme.colors.success, color: theme.colors.surfaceStrong },
    Medium: { backgroundColor: theme.colors.accent, color: theme.colors.surfaceStrong },
    Low: { backgroundColor: theme.colors.danger, color: theme.colors.surfaceStrong },
  } as const;

  const handleImport = async () => {
    try {
      setIsImporting(true);

      const incomeRows = rows.filter((transaction) => transaction.type === "income");
      const expenseRows = rows.filter((transaction) => transaction.type === "expense");

      let importedCount = 0;
      let skippedCount = 0;

      for (const transaction of incomeRows) {
        try {
          await createIncome({
            title: transaction.title,
            amount: transaction.amount,
            source: "Imported",
            date: transaction.date,
          });

          importedCount += 1;
        } catch (error: any) {
          if (error?.response?.status === 409) {
            skippedCount += 1;
            continue;
          }

          throw error;
        }
      }

      if (expenseRows.length > 0) {
        const expenseImport = await importExpenses(
          expenseRows.map((transaction) => ({
            title: transaction.title,
            amount: transaction.amount,
            category: transaction.category,
            merchant: transaction.merchant,
            date: transaction.date,
            correctedMerchant:
              transaction.correctedMerchant && transaction.correctedMerchant.trim() !== transaction.predictedMerchant.trim()
                ? transaction.correctedMerchant
                : undefined,
            correctedCategory:
              transaction.correctedCategory && transaction.correctedCategory.trim() !== transaction.predictedCategory.trim()
                ? transaction.correctedCategory
                : undefined,
          }))
        );

        importedCount += Number(expenseImport?.created || 0);
        skippedCount += Number(expenseImport?.skipped || 0);
      }

      Alert.alert("Import Complete", `Imported: ${importedCount}\nSkipped: ${skippedCount}`);
      setRows([]);
      setFileName("");
    } catch (error: any) {
      Alert.alert("Import Failed", JSON.stringify(error?.response?.data || error?.message || "Unknown error"));
    } finally {
      setIsImporting(false);
    }
  };

  const parseCsv = async (uri: string) => {
    const csv = await FileSystem.readAsStringAsync(uri);
    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
    });

    const imported = (parsed.data as any[]).map(
      (item, index): ImportedTransaction => ({
        id: `${String(item.description || item.Description || "transaction")}-${index}`,
        ...(() => {
          const normalized = normalizeImportedTransaction(String(item.description || item.Description || "Transaction"));

          return {
            title: normalized.title,
            merchant: normalized.merchant || "",
            predictedMerchant: normalized.merchant || "",
            category: normalized.category,
            predictedCategory: normalized.category,
            confidenceLabel: normalized.confidenceLabel,
          };
        })(),
        amount: Number(item.amount || item.Amount || 0),
        type: "expense",
        date: item.date || item.Date || "",
      })
    );

    setRows(imported);
  };

  const parseSpreadsheet = async (uri: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64" as never,
    });

    const workbook = XLSX.read(base64, {
      type: "base64",
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    }) as any[];

    const headerIndex = rawData.findIndex((row: any[]) => row.includes("Transaction Remarks"));

    if (headerIndex === -1) {
      Alert.alert("Error", "Could not find transaction table.");
      return;
    }

    const imported = rawData
      .slice(headerIndex + 1)
      .filter((row: any[]) => row[5] && row[5] !== "")
      .map(
        (row: any[], index: number): ImportedTransaction => ({
          id: `${String(row[5])}-${index}`,
          ...(() => {
            const normalized = normalizeImportedTransaction(String(row[5]));

            return {
              title: normalized.title,
              merchant: normalized.merchant || "",
              predictedMerchant: normalized.merchant || "",
              category: normalized.category,
              predictedCategory: normalized.category,
              confidenceLabel: normalized.confidenceLabel,
            };
          })(),
          amount: Number(row[7]) > 0 ? Number(row[7]) : Number(row[6]),
          type: Number(row[7]) > 0 ? "income" : "expense",
          date: normalizeDate(String(row[3])),
        })
      );

    setRows(imported);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      const extension = file.name.split(".").pop()?.toLowerCase();

      setFileName(file.name);

      if (extension === "csv") {
        await parseCsv(file.uri);
        return;
      }

      if (extension === "xlsx" || extension === "xls") {
        await parseSpreadsheet(file.uri);
        return;
      }

      Alert.alert("Unsupported File", "Please select a CSV or Excel file.");
    } catch (error: any) {
      Alert.alert("Import Failed", JSON.stringify(error?.response?.data || error?.message || "Unknown error"));
    }
  };

  return (
    <ScreenContainer>
      <View style={{ gap: 16, paddingBottom: 30 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Import Transactions</Text>

        <Card>
          <AppButton label="Choose Excel / CSV File" onPress={pickFile} />

          {fileName ? (
            <>
              <Text style={{ marginTop: 12, color: theme.colors.textMuted }}>File: {fileName}</Text>
              <Text style={{ marginTop: 4, color: theme.colors.success }}>{rows.length} rows detected</Text>
            </>
          ) : null}
        </Card>

        {rows.length > 0 ? (
          <Card>
            <Text
              style={[
                theme.typography.h3,
                {
                  color: theme.colors.text,
                  marginBottom: 12,
                },
              ]}
            >
              Preview
            </Text>

            <AppButton
              label={isImporting ? "Importing..." : `Import ${rows.length} Transactions`}
              onPress={handleImport}
            />

            {rows.slice(0, 15).map((item) => (
              <View
                key={item.id}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "600" }}>{item.title}</Text>
                {item.type === "expense" ? (
                  <View
                    style={{
                      marginTop: 6,
                      alignSelf: "flex-start",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: confidenceStyles[item.confidenceLabel].backgroundColor,
                    }}
                  >
                    <Text style={{ color: confidenceStyles[item.confidenceLabel].color, fontSize: 11, fontWeight: "700" }}>
                      {item.confidenceLabel} Confidence
                    </Text>
                  </View>
                ) : null}
                <Text
                  style={{
                    color: item.type === "income" ? "#22c55e" : "#ef4444",
                    marginTop: 4,
                  }}
                >
                  {formatMoney(item.amount)}
                </Text>
                <Text
                  style={{
                    color: "#3b82f6",
                    fontSize: 12,
                    marginTop: 4,
                    fontWeight: "600",
                  }}
                >
                  {item.category}
                </Text>
                <Text
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {item.date}
                </Text>
                {item.type === "expense" ? (
                  <View style={{ gap: 10, marginTop: 10 }}>
                    <AppInput
                      label="Merchant"
                      value={item.correctedMerchant ?? item.merchant}
                      onChangeText={(value) => {
                        setRows((currentRows) =>
                          currentRows.map((row) =>
                            row.id === item.id
                              ? {
                                  ...row,
                                  correctedMerchant: value,
                                }
                              : row
                          )
                        );
                      }}
                      autoCapitalize="words"
                    />
                    <AppInput
                      label="Category"
                      value={item.correctedCategory ?? item.category}
                      onChangeText={(value) => {
                        setRows((currentRows) =>
                          currentRows.map((row) =>
                            row.id === item.id
                              ? {
                                  ...row,
                                  correctedCategory: value,
                                }
                              : row
                          )
                        );
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                ) : null}
              </View>
            ))}
          </Card>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
