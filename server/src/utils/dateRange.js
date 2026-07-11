function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function startOfWeek(date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

function endOfWeek(date) {
  const value = startOfWeek(date);
  value.setDate(value.getDate() + 6);
  return endOfDay(value);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function parseDateRange(query = {}) {
  const now = new Date();
  const preset = query.preset || "thisMonth";
  let start;
  let end;

  if (preset === "today") {
    start = startOfDay(now);
    end = endOfDay(now);
  } else if (preset === "thisWeek") {
    start = startOfWeek(now);
    end = endOfWeek(now);
  } else if (preset === "lastMonth") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    start = startOfMonth(lastMonth);
    end = endOfMonth(lastMonth);
  } else if (preset === "thisYear") {
    start = new Date(now.getFullYear(), 0, 1);
    end = endOfDay(new Date(now.getFullYear(), 11, 31));
  } else if (preset === "custom" && query.startDate && query.endDate) {
    start = startOfDay(new Date(query.startDate));
    end = endOfDay(new Date(query.endDate));
  } else {
    start = startOfMonth(now);
    end = endOfMonth(now);
  }

  if (query.month && query.year) {
    const monthDate = new Date(Number(query.year), Number(query.month) - 1, 1);
    start = startOfMonth(monthDate);
    end = endOfMonth(monthDate);
  }

  if (query.year && !query.month && preset !== "custom" && preset !== "thisYear") {
    start = new Date(Number(query.year), 0, 1);
    end = endOfDay(new Date(Number(query.year), 11, 31));
  }

  return {
    preset,
    start,
    end,
  };
}

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

module.exports = {
  endOfDay,
  endOfMonth,
  endOfWeek,
  parseDateRange,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toMonthKey,
};
