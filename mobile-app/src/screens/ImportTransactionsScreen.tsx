import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import AppButton from "../components/AppButton";
import { useAppTheme } from "../theme";

export default function ImportTransactionsScreen() {
  const theme = useAppTheme();

  const [fileName, setFileName] =
    useState("");

  const [rows, setRows] =
    useState<any[]>([]);

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

      const file =
        result.assets[0];

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();

      setFileName(file.name);

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

        setRows(parsed.data as any[]);
      } else if (
        extension === "xlsx" ||
        extension === "xls"
      ) {
        const base64 =
  await FileSystem.readAsStringAsync(
    file.uri,
    {
      encoding: "base64" as any,
    }
  );

        const workbook =
          XLSX.read(base64, {
            type: "base64",
          });

        const firstSheet =
          workbook.SheetNames[0];

        const worksheet =
          workbook.Sheets[firstSheet];

        const data =
          XLSX.utils.sheet_to_json(
            worksheet
          );

        setRows(data as any[]);
      } else {
        Alert.alert(
          "Unsupported File",
          "Please choose a CSV or Excel file."
        );
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Unable to read file."
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
                    theme.colors.textMuted,
                }}
              >
                File: {fileName}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  color:
                    theme.colors.success,
                }}
              >
                {rows.length} rows detected
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
                    theme.colors.text,
                  marginBottom: 12,
                },
              ]}
            >
              Preview
            </Text>

            <FlatList
              data={rows.slice(0, 15)}
              keyExtractor={(_, index) =>
                index.toString()
              }
              renderItem={({ item }) => (
                <View
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor:
                      theme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme.colors.text,
                      fontWeight: "600",
                    }}
                  >
                    {item.Description ||
                      item.description ||
                      item.Remarks ||
                      item.Note ||
                      item.Narration ||
                      item.Transaction ||
                      "Transaction"}
                  </Text>

                  <Text
                    style={{
                      color:
                        theme.colors.textMuted,
                    }}
                  >
                    ₹
                    {item.Amount ||
                      item.amount ||
                      item.Value ||
                      item.Debit ||
                      item.Credit ||
                      "--"}
                  </Text>
                </View>
              )}
            />
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
}