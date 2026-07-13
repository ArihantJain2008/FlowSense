import { useCallback, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ExpenseSwipeable from "../components/ExpenseSwipeable";
import FloatingActionButton from "../components/FloatingActionButton";
import PeriodFilterBar from "../components/PeriodFilterBar";
import ScreenContainer from "../components/ScreenContainer";
import SkeletonBlock from "../components/SkeletonBlock";
import StatCard from "../components/StatCard";
import IncomeForm, {
  defaultIncomeFormState,
  type IncomeFormState,
} from "../components/forms/IncomeForm";
import { useFilters } from "../context/FiltersContext";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { useToast } from "../hooks/useToast";
import { createIncome, deleteIncome, getIncome, updateIncome } from "../services/incomeService";
import {
  createIncomeTemplate,
  deleteIncomeTemplate,
  getIncomeTemplates,
  updateIncomeTemplate,
  type IncomeTemplateItem,
} from "../services/incomeTemplateService";
import { useAppTheme } from "../theme";
import { formatDate } from "../utils/format";
import type { IncomeItem } from "./types";

function toIncomeDraft(income?: IncomeItem | null): IncomeFormState {
  if (!income) {
    return {
      ...defaultIncomeFormState,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    title: income.title || "",
    amount: String(income.amount ?? ""),
    date: (income.date || income.createdAt || new Date().toISOString()).slice(0, 10),
    source: income.source || "",
    merchant: income.merchant || "",
    note: income.note || "",
    paymentMethod: income.paymentMethod || defaultIncomeFormState.paymentMethod,
    isFavorite: Boolean(income.isFavorite),
  };
}

function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

const paymentMethods = ["Cash", "Card", "UPI", "Bank Transfer", "Wallet", "Other"] as const;

type IncomeTemplateFormState = {
  name: string;
  title: string;
  amount: string;
  date: string;
  source: string;
  merchant: string;
  note: string;
  paymentMethod: string;
};

const defaultIncomeTemplateFormState: IncomeTemplateFormState = {
  name: "",
  title: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  source: "",
  merchant: "",
  note: "",
  paymentMethod: "Bank Transfer",
};

export default function IncomeScreen() {
  const theme = useAppTheme();
  const toast = useToast();
  const { formatMoney } = useCurrencyFormatter();
  const { toQueryParams } = useFilters();
  const [income, setIncome] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [draft, setDraft] = useState<IncomeFormState>(defaultIncomeFormState);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [editingDraft, setEditingDraft] = useState<IncomeFormState>(defaultIncomeFormState);
  const [templates, setTemplates] = useState<IncomeTemplateItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IncomeTemplateItem | null>(null);
  const [editingTemplateDraft, setEditingTemplateDraft] = useState<IncomeTemplateFormState>(defaultIncomeTemplateFormState);

  const queryParams = useMemo(() => toQueryParams(), [toQueryParams]);

  const loadIncome = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const data = await getIncome(queryParams);
      setIncome(data);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || "Unable to load income.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [queryParams]);

  useRefreshOnFocus(loadIncome);

  const totalIncome = useMemo(
    () => income.reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [income]
  );

  const loadTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const data = await getIncomeTemplates();
      setTemplates(data);
    } catch {
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const openAddModal = () => {
    setDraft({
      ...defaultIncomeFormState,
      date: new Date().toISOString().slice(0, 10),
    });
    setShowAddIncome(true);
    void loadTemplates();
  };

  const openEditModal = (incomeItem: IncomeItem) => {
    setEditingIncome(incomeItem);
    setEditingDraft(toIncomeDraft(incomeItem));
  };

  const closeAddModal = () => {
    if (!saving) {
      setShowAddIncome(false);
      setShowTemplateManager(false);
    }
  };

  const closeEditModal = () => {
    if (!saving) {
      setEditingIncome(null);
    }
  };

  const applyTemplateToDraft = (template: IncomeTemplateItem) => {
    setDraft({
      title: template.title,
      amount: String(template.amount ?? ""),
      date: (template.date || new Date().toISOString()).slice(0, 10),
      source: template.source || "",
      merchant: template.merchant || "",
      note: template.note || "",
      paymentMethod: template.paymentMethod || defaultIncomeFormState.paymentMethod,
      isFavorite: true,
    });
  };

  const openTemplateEditor = (template: IncomeTemplateItem) => {
    setEditingTemplate(template);
    setEditingTemplateDraft({
      name: template.name || "",
      title: template.title || "",
      amount: String(template.amount ?? ""),
      date: (template.date || new Date().toISOString()).slice(0, 10),
      source: template.source || "",
      merchant: template.merchant || "",
      note: template.note || "",
      paymentMethod: template.paymentMethod || defaultIncomeTemplateFormState.paymentMethod,
    });
  };

  const closeTemplateEditor = () => {
    setEditingTemplate(null);
    setEditingTemplateDraft(defaultIncomeTemplateFormState);
  };

  const validateIncomeForm = (value: IncomeFormState) => {
    const numericAmount = Number(value.amount);

    if (!value.title.trim()) {
      return "Title is required.";
    }

    if (!value.source.trim()) {
      return "Source is required.";
    }

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return "Enter a valid amount.";
    }

    if (!isValidIsoDate(value.date)) {
      return "Date must be in YYYY-MM-DD format.";
    }

    return null;
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) {
      return;
    }

    if (!editingTemplateDraft.title.trim()) {
      toast.showError("Template title is required.");
      return;
    }

    if (!editingTemplateDraft.source.trim()) {
      toast.showError("Template source is required.");
      return;
    }

    if (!isValidIsoDate(editingTemplateDraft.date)) {
      toast.showError("Template date must be in YYYY-MM-DD format.");
      return;
    }

    try {
      await updateIncomeTemplate(editingTemplate.id, {
        name: editingTemplateDraft.name.trim() || editingTemplateDraft.title.trim(),
        title: editingTemplateDraft.title.trim(),
        amount: Number(editingTemplateDraft.amount),
        date: editingTemplateDraft.date,
        source: editingTemplateDraft.source.trim(),
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
      await deleteIncomeTemplate(id);
      await loadTemplates();
      if (editingTemplate?.id === id) {
        closeTemplateEditor();
      }
    } catch {
      toast.showError("Unable to delete template.");
    }
  };

  const handleCreateIncome = async () => {
    const validationError = validateIncomeForm(draft);

    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      setSaving(true);

      await createIncome({
        title: draft.title.trim(),
        amount: Number(draft.amount),
        date: draft.date,
        source: draft.source.trim(),
        merchant: draft.merchant.trim() || undefined,
        note: draft.note.trim() || undefined,
        paymentMethod: draft.paymentMethod || undefined,
        isFavorite: draft.isFavorite,
      });

      toast.showSuccess("Income added.");
      if (draft.isFavorite) {
        try {
          await createIncomeTemplate({
            name: draft.title.trim(),
            title: draft.title.trim(),
            amount: Number(draft.amount),
            date: draft.date,
            source: draft.source.trim(),
            merchant: draft.merchant.trim() || undefined,
            note: draft.note.trim() || undefined,
            paymentMethod: draft.paymentMethod || undefined,
          });
          await loadTemplates();
        } catch {
          toast.showError("Income saved, but the template could not be stored.");
        }
      }

      setDraft(defaultIncomeFormState);
      setShowAddIncome(false);
      await loadIncome();
    } catch (createError: any) {
      toast.showError(createError?.response?.data?.message || "Unable to create income.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateIncome = async () => {
    if (!editingIncome) {
      return;
    }

    const validationError = validateIncomeForm(editingDraft);

    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      setSaving(true);

      await updateIncome(editingIncome.id, {
        title: editingDraft.title.trim(),
        amount: Number(editingDraft.amount),
        date: editingDraft.date,
        source: editingDraft.source.trim(),
        merchant: editingDraft.merchant.trim() || undefined,
        note: editingDraft.note.trim() || undefined,
        paymentMethod: editingDraft.paymentMethod || undefined,
        isFavorite: editingDraft.isFavorite,
      });

      toast.showSuccess("Income updated.");
      setEditingIncome(null);
      setEditingDraft(defaultIncomeFormState);
      await loadIncome();
    } catch (updateError: any) {
      toast.showError(updateError?.response?.data?.message || "Unable to update income.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome(id);
      setIncome((current) => current.filter((entry) => entry.id !== id));
      toast.showSuccess("Income deleted.");
    } catch (deleteError: any) {
      toast.showError(deleteError?.response?.data?.message || "Unable to delete income.");
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={loading ? [] : income}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void loadIncome(true);
            }}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            {loading ? (
              <View style={{ gap: 16 }}>
                <View style={styles.titleWrap}>
                  <SkeletonBlock height={28} width="36%" />
                  <SkeletonBlock height={14} width="90%" />
                </View>

                <PeriodFilterBar />

                <Card style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong }}>
                  <SkeletonBlock height={14} width="45%" />
                  <SkeletonBlock height={24} width="65%" />
                </Card>

                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={`income-skeleton-${index}`} style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong }}>
                    <SkeletonBlock height={14} width="40%" />
                    <SkeletonBlock height={12} width="85%" />
                    <SkeletonBlock height={12} width="60%" />
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
                  <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Income</Text>
                  <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Follow income sources, payments, and favorites with the same flow.</Text>
                </View>

                <PeriodFilterBar />

                <StatCard label="Selected Period Income" value={formatMoney(totalIncome)} tone="success" />

                {error ? (
                  <EmptyState title="Income unavailable" message={error} actionLabel="Reload" onAction={() => {
                    void loadIncome();
                  }} icon="warning-outline" />
                ) : null}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState title="No income yet" message="No income matches the selected period and search." icon="cash-outline" />
          )
        }
        renderItem={({ item }) => (
          <ExpenseSwipeable onEdit={() => openEditModal(item)} onDelete={() => void handleDeleteIncome(item.id)}>
            <Card style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.surfaceStrong }}>
              <View style={styles.rowBetween}>
                <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>{item.title}</Text>
                <Text style={[theme.typography.bodyStrong, { color: theme.colors.success }]}>{formatMoney(item.amount)}</Text>
              </View>

              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                {[item.source, item.merchant, item.paymentMethod].filter(Boolean).join(" • ")}
              </Text>

              {item.note ? <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{item.note}</Text> : null}

              <View style={styles.rowBetween}>
                <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{formatDate(item.date || item.createdAt)}</Text>
                {item.isFavorite ? <Text style={{ color: theme.colors.accent }}>★</Text> : null}
              </View>
            </Card>
          </ExpenseSwipeable>
        )}
      />

      <Modal visible={Boolean(editingIncome)} animationType="slide" transparent onRequestClose={closeEditModal}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSpacer} />
              <Text style={[theme.typography.h2, styles.modalTitle, { color: theme.colors.text }]}>Edit Income</Text>
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
              <IncomeForm draft={editingDraft} setDraft={setEditingDraft} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton label="Save" onPress={handleUpdateIncome} loading={saving} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddIncome} animationType="slide" transparent onRequestClose={closeAddModal}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSpacer} />
              <Text style={[theme.typography.h2, styles.modalTitle, { color: theme.colors.text }]}>Add Income</Text>
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
                      <View key={`income-template-skeleton-${index}`} style={styles.templateChip}>
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
              <IncomeForm draft={draft} setDraft={setDraft} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton label="Save" onPress={handleCreateIncome} loading={saving} disabled={saving} />
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
                  {Array.from({ length: 6 }).map((_, index) => (
                    <View key={`income-template-editor-skeleton-${index}`} style={{ gap: 8 }}>
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
                    label="Income Title"
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
                    label="Date"
                    placeholder="YYYY-MM-DD"
                    value={editingTemplateDraft.date}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, date: value }))}
                  />
                  <AppInput
                    label="Source"
                    value={editingTemplateDraft.source}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, source: value }))}
                  />
                  <AppInput
                    label="Merchant / Account"
                    value={editingTemplateDraft.merchant}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, merchant: value }))}
                  />
                  <AppInput
                    label="Notes"
                    value={editingTemplateDraft.note}
                    onChangeText={(value) => setEditingTemplateDraft((current) => ({ ...current, note: value }))}
                  />
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
                    <AppButton label="Save" onPress={() => {
                      void handleUpdateTemplate();
                    }} />
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
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{template.source || "No source"}</Text>
                    <View style={styles.templateActionsRow}>
                      <AppButton label="Use" variant="ghost" onPress={() => {
                        applyTemplateToDraft(template);
                        setShowTemplateManager(false);
                      }} />
                      <AppButton label="Edit" variant="ghost" onPress={() => openTemplateEditor(template)} />
                      <AppButton label="Delete" variant="ghost" onPress={() => {
                        void handleDeleteTemplate(template.id);
                      }} />
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
