import { useCallback, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import EmptyState from "../components/EmptyState";
import ExpenseCard from "../components/ExpenseCard";
import ExpenseSwipeable from "../components/ExpenseSwipeable";
import FloatingActionButton from "../components/FloatingActionButton";
import PeriodFilterBar from "../components/PeriodFilterBar";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import Card from "../components/Card";
import ExpenseForm, {
  defaultExpenseFormState,
  type ExpenseFormState,
} from "../components/forms/ExpenseForm";
import { useFilters } from "../context/FiltersContext";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { useToast } from "../hooks/useToast";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../services/expenseService";
import {
  createExpenseTemplate,
  deleteExpenseTemplate,
  getExpenseTemplates,
  updateExpenseTemplate,
  type ExpenseTemplateItem,
} from "../services/expenseTemplateService";
import { useAppTheme } from "../theme";
import { expenseCategories } from "./shared";
import type { ExpenseItem } from "./types";

function toExpenseDraft(expense?: ExpenseItem | null): ExpenseFormState {
  if (!expense) {
    return {
      ...defaultExpenseFormState,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    title: expense.title || "",
    amount: String(expense.amount ?? ""),
    category: expense.category || defaultExpenseFormState.category,
    merchant: expense.merchant || "",
    note: expense.note || "",
    paymentMethod: expense.paymentMethod || defaultExpenseFormState.paymentMethod,
    isFavorite: Boolean(expense.isFavorite),
    date: (expense.date || expense.createdAt || new Date().toISOString()).slice(0, 10),
  };
}

function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

const paymentMethods = ["Cash", "Card", "UPI", "Bank Transfer", "Wallet", "Other"] as const;

type ExpenseTemplateFormState = {
  name: string;
  title: string;
  amount: string;
  category: string;
  merchant: string;
  note: string;
  paymentMethod: string;
};

const defaultExpenseTemplateFormState: ExpenseTemplateFormState = {
  name: "",
  title: "",
  amount: "",
  category: expenseCategories[0],
  merchant: "",
  note: "",
  paymentMethod: "UPI",
};

export default function ExpensesScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const { formatMoney } = useCurrencyFormatter();
  const { toQueryParams } = useFilters();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [draft, setDraft] = useState<ExpenseFormState>(defaultExpenseFormState);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [editingDraft, setEditingDraft] = useState<ExpenseFormState>(defaultExpenseFormState);
  const [templates, setTemplates] = useState<ExpenseTemplateItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExpenseTemplateItem | null>(null);
  const [editingTemplateDraft, setEditingTemplateDraft] = useState<ExpenseTemplateFormState>(defaultExpenseTemplateFormState);

  const queryParams = useMemo(() => toQueryParams(), [toQueryParams]);

  const loadExpenses = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);
        const data = await getExpenses(queryParams);
        setExpenses(data);
      } catch (loadError: any) {
        setError(loadError?.response?.data?.message || "Unable to load expenses.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [queryParams]
  );

  useRefreshOnFocus(loadExpenses);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [expenses]
  );

  const loadTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const data = await getExpenseTemplates();
      setTemplates(data);
    } catch {
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const openAddModal = () => {
    setDraft({
      ...defaultExpenseFormState,
      date: new Date().toISOString().slice(0, 10),
    });
    setShowAddExpense(true);
    void loadTemplates();
  };

  const openEditModal = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setEditingDraft(toExpenseDraft(expense));
  };

  const closeAddModal = () => {
    if (!saving) {
      setShowAddExpense(false);
      setShowTemplateManager(false);
    }
  };

  const closeEditModal = () => {
    if (!saving) {
      setEditingExpense(null);
    }
  };

  const applyTemplateToDraft = (template: ExpenseTemplateItem) => {
    setDraft((current) => ({
      ...current,
      title: template.title,
      amount: String(template.amount ?? ""),
      category: template.category || current.category,
      merchant: template.merchant || "",
      note: template.note || "",
      paymentMethod: template.paymentMethod || current.paymentMethod || defaultExpenseFormState.paymentMethod,
      isFavorite: true,
    }));
  };

  const openTemplateEditor = (template: ExpenseTemplateItem) => {
    setEditingTemplate(template);
    setEditingTemplateDraft({
      name: template.name || "",
      title: template.title || "",
      amount: String(template.amount ?? ""),
      category: template.category || expenseCategories[0],
      merchant: template.merchant || "",
      note: template.note || "",
      paymentMethod: template.paymentMethod || "UPI",
    });
  };

  const closeTemplateEditor = () => {
    setEditingTemplate(null);
    setEditingTemplateDraft(defaultExpenseTemplateFormState);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) {
      return;
    }

    try {
      await updateExpenseTemplate(editingTemplate.id, {
        name: editingTemplateDraft.name.trim() || editingTemplate.title,
        title: editingTemplateDraft.title.trim() || editingTemplate.title,
        amount: Number(editingTemplateDraft.amount),
        category: editingTemplateDraft.category,
        merchant: editingTemplateDraft.merchant.trim() || undefined,
        note: editingTemplateDraft.note.trim() || undefined,
        paymentMethod: editingTemplateDraft.paymentMethod || undefined,
      });
      await loadTemplates();
      closeTemplateEditor();
    } catch {
      toast.showError("Unable to update template.");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteExpenseTemplate(id);
      await loadTemplates();
      if (editingTemplate?.id === id) {
        closeTemplateEditor();
      }
    } catch {
      toast.showError("Unable to delete template.");
    }
  };

  const validateExpenseForm = (value: ExpenseFormState) => {
    const numericAmount = Number(value.amount);

    if (!value.title.trim()) {
      return "Title is required.";
    }

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return "Enter a valid amount.";
    }

    if (!isValidIsoDate(value.date)) {
      return "Date must be in YYYY-MM-DD format.";
    }

    return null;
  };

  const handleCreateExpense = async () => {
    const validationError = validateExpenseForm(draft);

    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      setSaving(true);

      await createExpense({
        title: draft.title.trim(),
        amount: Number(draft.amount),
        category: draft.category,
        merchant: draft.merchant.trim() || undefined,
        note: draft.note.trim() || undefined,
        paymentMethod: draft.paymentMethod || undefined,
        isFavorite: draft.isFavorite,
        date: draft.date,
      });

      toast.showSuccess("Expense added.");
      if (draft.isFavorite) {
        try {
          await createExpenseTemplate({
            name: draft.title.trim(),
            title: draft.title.trim(),
            amount: Number(draft.amount),
            category: draft.category,
            merchant: draft.merchant.trim() || undefined,
            note: draft.note.trim() || undefined,
            paymentMethod: draft.paymentMethod || undefined,
          });
          await loadTemplates();
        } catch {
          toast.showError("Expense saved, but the template could not be stored.");
        }
      }
      setDraft(defaultExpenseFormState);
      setShowAddExpense(false);
      await loadExpenses();
    } catch (createError: any) {
      toast.showError(createError?.response?.data?.message || "Unable to create expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) {
      return;
    }

    const validationError = validateExpenseForm(editingDraft);

    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      setSaving(true);

      await updateExpense(editingExpense.id, {
        title: editingDraft.title.trim(),
        amount: Number(editingDraft.amount),
        category: editingDraft.category,
        merchant: editingDraft.merchant.trim() || undefined,
        note: editingDraft.note.trim() || undefined,
        paymentMethod: editingDraft.paymentMethod || undefined,
        isFavorite: editingDraft.isFavorite,
        date: editingDraft.date,
      });

      toast.showSuccess("Expense updated.");
      setEditingExpense(null);
      setEditingDraft(defaultExpenseFormState);
      await loadExpenses();
    } catch (updateError: any) {
      toast.showError(updateError?.response?.data?.message || "Unable to update expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      toast.showSuccess("Expense deleted.");
    } catch (deleteError: any) {
      toast.showError(deleteError?.response?.data?.message || "Unable to delete expense.");
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={loading ? [] : expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void loadExpenses(true);
            }}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            {loading ? (
              <View style={{ gap: 16 }}>
                <View style={styles.titleWrap}>
                  <SkeletonBlock height={28} width="42%" />
                  <SkeletonBlock height={14} width="90%" />
                </View>

                <PeriodFilterBar />

                <Card style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong }}>
                  <SkeletonBlock height={14} width="45%" />
                  <SkeletonBlock height={26} width="60%" />
                </Card>

                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={`expense-skeleton-${index}`} style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong }}>
                    <SkeletonBlock height={14} width="45%" />
                    <SkeletonBlock height={12} width="90%" />
                    <SkeletonBlock height={12} width="70%" />
                    <View style={styles.skeletonRow}>
                      <SkeletonBlock height={12} width="35%" />
                      <SkeletonBlock height={12} width="30%" />
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                <View style={styles.titleWrap}>
                  <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Expenses</Text>
                  <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Track spending, merchants, notes, and favorites in one place.</Text>
                </View>

                <PeriodFilterBar />

                <Card style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Selected Period Spend</Text>
                  <Text style={[theme.typography.h2, { color: theme.colors.danger }]}>{formatMoney(totalExpenses)}</Text>
                </Card>

                {error ? (
                  <EmptyState
                    title="Expenses unavailable"
                    message={error}
                    actionLabel="Reload"
                    onAction={() => {
                      void loadExpenses();
                    }}
                    icon="warning-outline"
                  />
                ) : null}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              title="No expenses found"
              message="Your active search and filters returned nothing. Try widening the date range or add a new expense."
              icon="receipt-outline"
            />
          )
        }
        renderItem={({ item }) => (
          <ExpenseSwipeable onEdit={() => openEditModal(item)} onDelete={() => void handleDeleteExpense(item.id)}>
            <ExpenseCard expense={item} />
          </ExpenseSwipeable>
        )}
      />

      <Modal visible={Boolean(editingExpense)} animationType="slide" transparent onRequestClose={closeEditModal}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSpacer} />
              <Text style={[theme.typography.h2, styles.modalTitle, { color: theme.colors.text }]}>Edit Expense</Text>
              <Pressable style={styles.closeButton} onPress={closeEditModal} disabled={saving}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <ExpenseForm draft={editingDraft} setDraft={setEditingDraft} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton label="Save" onPress={handleUpdateExpense} loading={saving} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddExpense} animationType="slide" transparent onRequestClose={closeAddModal}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSpacer} />
              <Text style={[theme.typography.h2, styles.modalTitle, { color: theme.colors.text }]}>Add Expense</Text>
              <Pressable style={styles.closeButton} onPress={closeAddModal} disabled={saving}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {templatesLoading ? (
                <View style={styles.templateSection}>
                  <View style={styles.templateHeaderRow}>
                    <SkeletonBlock height={18} width="42%" />
                    <SkeletonBlock height={34} width={92} radius={999} />
                  </View>
                  <View style={styles.templateList}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <View key={`expense-template-skeleton-${index}`} style={styles.templateChip}>
                        <SkeletonBlock height={14} width="66%" />
                        <SkeletonBlock height={12} width="84%" />
                        <SkeletonBlock height={12} width="42%" />
                      </View>
                    ))}
                  </View>
                </View>
              ) : templates.length > 0 ? (
                <View style={styles.templateSection}>
                  <View style={styles.templateHeaderRow}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Favorite Templates</Text>
                    <AppButton label="Manage" variant="ghost" onPress={() => setShowTemplateManager(true)} />
                  </View>
                  <View style={styles.templateList}>
                    {templates.map((template) => (
                      <Pressable key={template.id} style={styles.templateChip} onPress={() => applyTemplateToDraft(template)}>
                        <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{template.name}</Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{template.title}</Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>{formatMoney(template.amount)}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
              <ExpenseForm draft={draft} setDraft={setDraft} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton label="Save" onPress={handleCreateExpense} loading={saving} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showTemplateManager} animationType="slide" transparent onRequestClose={() => setShowTemplateManager(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSpacer} />
              <Text style={[theme.typography.h2, styles.modalTitle, { color: theme.colors.text }]}>Manage Templates</Text>
              <Pressable style={styles.closeButton} onPress={() => setShowTemplateManager(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {templatesLoading ? (
                <View style={{ gap: theme.spacing.md }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <View key={`expense-template-editor-skeleton-${index}`} style={{ gap: 8 }}>
                      <SkeletonBlock height={12} width="34%" />
                      <SkeletonBlock height={48} width="100%" />
                    </View>
                  ))}
                </View>
              ) : editingTemplate ? (
                <View style={{ gap: theme.spacing.md }}>
                  <AppInput
                    label="Template Name"
                    value={editingTemplateDraft.name}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, name: value }))}
                  />
                  <AppInput
                    label="Expense Title"
                    value={editingTemplateDraft.title}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, title: value }))}
                  />
                  <AppInput
                    label="Amount"
                    placeholder="0"
                    keyboardType="numeric"
                    value={editingTemplateDraft.amount}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, amount: value }))}
                  />
                  <AppInput
                    label="Merchant"
                    value={editingTemplateDraft.merchant}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, merchant: value }))}
                  />
                  <AppInput
                    label="Notes"
                    value={editingTemplateDraft.note}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, note: value }))}
                  />
                  <View>
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginBottom: 8 }]}>Category</Text>
                    <Picker
                      selectedValue={editingTemplateDraft.category}
                      onValueChange={(value) => setEditingTemplateDraft((current) => ({ ...current, category: value }))}
                    >
                      {expenseCategories.map((item) => (
                        <Picker.Item key={item} label={item} value={item} />
                      ))}
                    </Picker>
                  </View>
                  <View>
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginBottom: 8 }]}>Payment Method</Text>
                    <Picker
                      selectedValue={editingTemplateDraft.paymentMethod}
                      onValueChange={(value) => setEditingTemplateDraft((current) => ({ ...current, paymentMethod: value }))}
                    >
                      {paymentMethods.map((item) => (
                        <Picker.Item key={item} label={item} value={item} />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.modalFooterActions}>
                    <AppButton label="Cancel" variant="ghost" onPress={closeTemplateEditor} />
                    <AppButton label="Save" onPress={() => { void handleUpdateTemplate(); }} />
                  </View>
                </View>
              ) : (
                templates.map((template) => (
                  <Card key={template.id} style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong, marginBottom: theme.spacing.sm }}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{template.name}</Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{template.title}</Text>
                      </View>
                      <Text style={[theme.typography.bodyStrong, { color: theme.colors.primary }]}>{formatMoney(template.amount)}</Text>
                    </View>
                    <View style={styles.templateActionsRow}>
                      <AppButton label="Use" variant="ghost" onPress={() => {
                        applyTemplateToDraft(template);
                        setShowTemplateManager(false);
                      }} />
                      <AppButton label="Edit" variant="ghost" onPress={() => openTemplateEditor(template)} />
                      <AppButton label="Delete" variant="ghost" onPress={() => { void handleDeleteTemplate(template.id); }} />
                    </View>
                  </Card>
                ))
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton label="Close" variant="ghost" onPress={() => setShowTemplateManager(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <FloatingActionButton onPress={openAddModal} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleWrap: {
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    width: "100%",
    maxHeight: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    paddingBottom: 0,
    paddingTop: 0,
    marginTop: "auto",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  headerSpacer: {
    width: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "600",
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalBody: {
    flexGrow: 0,
    maxHeight: "100%",
  },
  modalBodyContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  templateSection: {
    gap: 10,
    marginBottom: 8,
  },
  templateHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  templateList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  templateChip: {
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    minWidth: "48%",
  },
  templateActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalFooterActions: {
    flexDirection: "row",
    gap: 12,
  },
});
