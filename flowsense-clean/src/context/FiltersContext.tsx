import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { STORAGE_KEYS } from "../constants/storage";
import type { DateRangePreset } from "../screens/types";

type NavigationUnit = "month" | "year";

export type FiltersState = {
  preset: DateRangePreset;
  focusDate: string;
  startDate?: string;
  endDate?: string;
  search: string;
  category: string;
  type: "all" | "income" | "expense";
  paymentMethod: string;
  merchant: string;
  minAmount?: string;
  maxAmount?: string;
  favoriteOnly: boolean;
};

type ResolvedDateRange = {
  startDate: string;
  endDate: string;
};

type FiltersContextValue = {
  filters: FiltersState;
  loaded: boolean;
  resolvedRange: ResolvedDateRange;
  navigationLabel: string;
  updateFilters: (updates: Partial<FiltersState>) => Promise<void>;
  setPreset: (preset: DateRangePreset) => Promise<void>;
  shiftPeriod: (direction: -1 | 1, unit: NavigationUnit) => Promise<void>;
  resetFilters: () => Promise<void>;
  toQueryParams: () => Record<string, string | undefined>;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseIsoDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return startOfDay(value);
}

function endOfWeek(date: Date) {
  const value = startOfWeek(date);
  value.setDate(value.getDate() + 6);
  return endOfDay(value);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, date.getDate());
}

function addYears(date: Date, count: number) {
  return new Date(date.getFullYear() + count, date.getMonth(), date.getDate());
}

function formatDateLabel(value: string) {
  const date = parseIsoDate(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMonthYear(value: string) {
  const date = parseIsoDate(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDefaultFocusDate(preset: DateRangePreset) {
  const today = startOfDay(new Date());

  if (preset === "lastMonth") {
    return toIsoDate(addMonths(today, -1));
  }

  return toIsoDate(today);
}

function createDefaultFilters(): FiltersState {
  return {
    preset: "thisMonth",
    focusDate: getDefaultFocusDate("thisMonth"),
    search: "",
    category: "All",
    type: "all",
    paymentMethod: "All",
    merchant: "",
    minAmount: "",
    maxAmount: "",
    favoriteOnly: false,
  };
}

function resolveRange(filters: FiltersState): ResolvedDateRange {
  const focusDate = parseIsoDate(filters.focusDate) ?? startOfDay(new Date());

  if (filters.preset === "custom") {
    const parsedStart = parseIsoDate(filters.startDate);
    const parsedEnd = parseIsoDate(filters.endDate);

    if (parsedStart && parsedEnd) {
      const start = parsedStart <= parsedEnd ? parsedStart : parsedEnd;
      const end = parsedStart <= parsedEnd ? parsedEnd : parsedStart;

      return {
        startDate: toIsoDate(start),
        endDate: toIsoDate(end),
      };
    }
  }

  if (filters.preset === "today") {
    return {
      startDate: toIsoDate(startOfDay(focusDate)),
      endDate: toIsoDate(endOfDay(focusDate)),
    };
  }

  if (filters.preset === "thisWeek") {
    return {
      startDate: toIsoDate(startOfWeek(focusDate)),
      endDate: toIsoDate(endOfWeek(focusDate)),
    };
  }

  if (filters.preset === "thisYear") {
    return {
      startDate: toIsoDate(startOfYear(focusDate)),
      endDate: toIsoDate(endOfYear(focusDate)),
    };
  }

  return {
    startDate: toIsoDate(startOfMonth(focusDate)),
    endDate: toIsoDate(endOfMonth(focusDate)),
  };
}

function getNavigationLabel(filters: FiltersState, range: ResolvedDateRange) {
  if (filters.preset === "thisYear") {
    const year = parseIsoDate(range.startDate)?.getFullYear();
    return year ? String(year) : range.startDate;
  }

  if (filters.preset === "thisMonth" || filters.preset === "lastMonth") {
    return formatMonthYear(range.startDate);
  }

  if (filters.preset === "custom") {
    if (range.startDate === range.endDate) {
      return formatDateLabel(range.startDate);
    }

    return `${formatDateLabel(range.startDate)} - ${formatDateLabel(range.endDate)}`;
  }

  if (filters.preset === "today") {
    return formatDateLabel(range.startDate);
  }

  return `${formatDateLabel(range.startDate)} - ${formatDateLabel(range.endDate)}`;
}

function normalizeFilters(filters: FiltersState) {
  return {
    ...filters,
    focusDate: parseIsoDate(filters.focusDate)
      ? filters.focusDate
      : getDefaultFocusDate(filters.preset),
  };
}

export function FiltersProvider({ children }: PropsWithChildren) {
  const [filters, setFilters] = useState<FiltersState>(createDefaultFilters);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.filters);
        if (stored) {
          setFilters(normalizeFilters({
            ...createDefaultFilters(),
            ...JSON.parse(stored),
          }));
        }
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  const persist = async (next: FiltersState) => {
    setFilters(next);
    await AsyncStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(next));
  };

  const resolvedRange = useMemo(() => resolveRange(filters), [filters]);
  const navigationLabel = useMemo(
    () => getNavigationLabel(filters, resolvedRange),
    [filters, resolvedRange]
  );

  const value = useMemo(
    () => ({
      filters,
      loaded,
      resolvedRange,
      navigationLabel,
      updateFilters: async (updates: Partial<FiltersState>) => {
        await persist(normalizeFilters({
          ...filters,
          ...updates,
        }));
      },
      setPreset: async (preset: DateRangePreset) => {
        if (preset === "custom") {
          const currentRange = resolveRange(filters);
          await persist(normalizeFilters({
            ...filters,
            preset,
            startDate: currentRange.startDate,
            endDate: currentRange.endDate,
            focusDate: currentRange.startDate,
          }));
          return;
        }

        await persist(normalizeFilters({
          ...filters,
          preset,
          focusDate: getDefaultFocusDate(preset),
        }));
      },
      shiftPeriod: async (direction: -1 | 1, unit: NavigationUnit) => {
        if (filters.preset === "custom") {
          const start = parseIsoDate(resolvedRange.startDate) ?? startOfDay(new Date());
          const end = parseIsoDate(resolvedRange.endDate) ?? startOfDay(new Date());
          const shift = unit === "month" ? addMonths : addYears;
          const nextStart = shift(start, direction);
          const nextEnd = shift(end, direction);

          await persist(normalizeFilters({
            ...filters,
            startDate: toIsoDate(nextStart),
            endDate: toIsoDate(nextEnd),
            focusDate: toIsoDate(nextStart),
          }));
          return;
        }

        const focusDate = parseIsoDate(filters.focusDate) ?? startOfDay(new Date());
        const nextFocusDate =
          unit === "month"
            ? addMonths(focusDate, direction)
            : addYears(focusDate, direction);

        await persist(normalizeFilters({
          ...filters,
          focusDate: toIsoDate(nextFocusDate),
        }));
      },
      resetFilters: async () => {
        await persist(createDefaultFilters());
      },
      toQueryParams: () => ({
        preset: "custom",
        startDate: resolvedRange.startDate,
        endDate: resolvedRange.endDate,
        search: filters.search || undefined,
        category: filters.category !== "All" ? filters.category : undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        paymentMethod: filters.paymentMethod !== "All" ? filters.paymentMethod : undefined,
        merchant: filters.merchant || undefined,
        minAmount: filters.minAmount || undefined,
        maxAmount: filters.maxAmount || undefined,
        favorite: filters.favoriteOnly ? "true" : undefined,
      }),
    }),
    [filters, loaded, navigationLabel, resolvedRange]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const context = useContext(FiltersContext);

  if (!context) {
    throw new Error("useFilters must be used within FiltersProvider");
  }

  return context;
}
