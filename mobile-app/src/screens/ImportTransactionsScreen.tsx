import { useState } from "react";
import {
  View,
  Text,
  Alert,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import AppButton from "../components/AppButton";
import { useAppTheme } from "../theme";

import { createExpense } from "../services/expenseService";
import { createIncome } from "../services/incomeService";
import { categorizeTransaction } from "../utils/categorizeTransaction";

type ImportedTransaction = {
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: string;
};

export default function ImportTransactionsScreen() {
  const theme = useAppTheme();

  const [fileName, setFileName] =
    useState("");

  const [rows, setRows] = useState<
    ImportedTransaction[]
  >([]);

  const handleImport = async () => {
  try {
    let importedCount = 0;
    let skippedCount = 0;

    for (const transaction of rows) {
      console.log(
        "SENDING:",
        transaction
      );

      try {
        if (
          transaction.type ===
          "income"
        ) {
          await createIncome(
            transaction.title,
            transaction.amount,
            "Imported",
            transaction.date
          );
        } else {
          await createExpense(
            transaction.title,
            transaction.amount,
            transaction.category,
            transaction.date
          );
        }

        importedCount++;

      } catch (error: any) {

        if (
          error?.response?.status ===
          409
        ) {
          skippedCount++;
          continue;
        }

        throw error;
      }
    }

    Alert.alert(
      "Import Complete",
      `Imported: ${importedCount}\nSkipped: ${skippedCount}`
    );

    setRows([]);
    setFileName("");

  } catch (error: any) {

    console.log(
      "BACKEND RESPONSE:",
      error?.response?.data
    );

    console.log(
      "STATUS:",
      error?.response?.status
    );

    console.log(
      "REQUEST BODY:",
      error?.config?.data
    );

    Alert.alert(
      "Import Failed",
      JSON.stringify(
        error?.response?.data
      )
    );
  }
};

  const pickFile = async () => {
  try {
    const result =
      await DocumentPicker.getDocumentAsync({
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

    setFileName(file.name);

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    // CSV IMPORT
    if (extension === "csv") {
      const csv =
        await FileSystem.readAsStringAsync(
          file.uri
        );

      const parsed =
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
        });

      const imported: ImportedTransaction[] =
        (parsed.data as any[]).map(
          (
            item
          ): ImportedTransaction => ({
            title:
              item.description ||
              item.Description ||
              "Transaction",

            amount: Number(
              item.amount ||
                item.Amount ||
                0
            ),

            type: "expense",

            date:
              item.date ||
              item.Date ||
              "",

            category:
              "Imported",
          })
        );

      setRows(imported);
      return;
    }

    // EXCEL IMPORT
    if (
      extension === "xlsx" ||
      extension === "xls"
    ) {
      const base64 =
        await FileSystem.readAsStringAsync(
          file.uri,
          {
            encoding:
              "base64" as any,
          }
        );

      const workbook =
        XLSX.read(base64, {
          type: "base64",
        });

      const worksheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const rawData =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            header: 1,
            defval: "",
          }
        ) as any[];

      const headerIndex =
        rawData.findIndex(
          (row: any[]) =>
            row.includes(
              "Transaction Remarks"
            )
        );

      if (headerIndex === -1) {
        Alert.alert(
          "Error",
          "Could not find transaction table."
        );
        return;
      }

      const imported: ImportedTransaction[] =
        rawData
          .slice(headerIndex + 1)
          .filter(
            (row: any[]) =>
              row[5] &&
              row[5] !== ""
          )
          .map(
  (
    row: any[]
  ): ImportedTransaction => {

    const rawDate =
      String(row[3]);

    const parts =
      rawDate.split("/");

    const formattedDate =
      parts.length === 3
        ? `${parts[2]}-${parts[1]}-${parts[0]}`
        : rawDate;

    return {
      title: String(
        row[5]
      ),

      amount:
        Number(row[7]) > 0
          ? Number(row[7])
          : Number(row[6]),

      type:
        Number(row[7]) > 0
          ? "income"
          : "expense",

      date:
        formattedDate,

      category: categorizeTransaction(
  String(row[5])
),
    };
  }
);

      console.log(
        "TRANSACTIONS:",
        imported
      );

      setRows(imported);
      return;
    }

    Alert.alert(
      "Unsupported File",
      "Please select a CSV or Excel file."
    );
  } catch (error: any) {
  console.log(
    "BACKEND RESPONSE:",
    error?.response?.data
  );

  console.log(
    "STATUS:",
    error?.response?.status
  );

  console.log(
    "FULL:",
    error
  );

  Alert.alert(
    "Import Failed",
    JSON.stringify(
      error?.response?.data
    )
  );
}
};

  return (
    <ScreenContainer>
      <View
        style={{
          gap: 16,
          paddingBottom: 30,
        }}
      >
        <Text
          style={[
            theme.typography.h1,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Import Transactions
        </Text>

        <Card>
          <AppButton
            label="Choose Excel / CSV File"
            onPress={pickFile}
          />

          {fileName ? (
            <>
              <Text
                style={{
                  marginTop: 12,
                  color:
                    theme.colors
                      .textMuted,
                }}
              >
                File: {fileName}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  color:
                    theme.colors
                      .success,
                }}
              >
                {rows.length} rows
                detected
              </Text>
            </>
          ) : null}
        </Card>

        {rows.length > 0 && (
          <Card>
            <Text
              style={[
                theme.typography.h3,
                {
                  color:
                    theme.colors
                      .text,
                  marginBottom: 12,
                },
              ]}
            >
              Preview
            </Text>

            <AppButton
              label={`Import ${rows.length} Transactions`}
              onPress={
                handleImport
              }
            />

            {rows
              .slice(0, 15)
              .map(
                (
                  item,
                  index
                ) => (
                  <View
                    key={index}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        theme
                          .colors
                          .border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          theme
                            .colors
                            .text,
                        fontWeight:
                          "600",
                      }}
                    >
                      {
                        item.title
                      }
                    </Text>

                    <Text
                      style={{
                        color:
                          item.type ===
                          "income"
                            ? "#22c55e"
                            : "#ef4444",
                        marginTop: 4,
                      }}
                    >
                      ₹
                      {
                        item.amount
                      }
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
    color:
      theme.colors
        .textMuted,
    fontSize: 12,
    marginTop: 2,
  }}
>
  {item.date}
</Text>
                  </View>
                )
              )}
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
}