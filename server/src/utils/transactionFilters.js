const { parseDateRange } = require("./dateRange");

function buildTextSearch(query, options = {}) {
  const text = query.search?.trim();
  if (!text) {
    return [];
  }

  const { includeCategory = true, includeSource = false } = options;
  const search = [
    { title: { contains: text, mode: "insensitive" } },
    ...(includeCategory ? [{ category: { contains: text, mode: "insensitive" } }] : []),
    { note: { contains: text, mode: "insensitive" } },
    { merchant: { contains: text, mode: "insensitive" } },
  ];

  if (includeSource) {
    search.push({
      source: { contains: text, mode: "insensitive" },
    });
  }

  return search;
}

function buildAmountFilter(query) {
  const amount = {};

  if (query.minAmount !== undefined && query.minAmount !== "") {
    amount.gte = Number(query.minAmount);
  }

  if (query.maxAmount !== undefined && query.maxAmount !== "") {
    amount.lte = Number(query.maxAmount);
  }

  return Object.keys(amount).length > 0 ? amount : undefined;
}

function buildExpenseWhere(userId, query = {}) {
  const { start, end } = parseDateRange(query);
  const search = buildTextSearch(query);
  const amount = buildAmountFilter(query);

  return {
    userId,
    date: {
      gte: start,
      lte: end,
    },
    ...(query.category && query.category !== "All" ? { category: query.category } : {}),
    ...(query.paymentMethod && query.paymentMethod !== "All" ? { paymentMethod: query.paymentMethod } : {}),
    ...(query.merchant ? { merchant: { contains: query.merchant, mode: "insensitive" } } : {}),
    ...(query.favorite === "true" ? { isFavorite: true } : {}),
    ...(amount ? { amount } : {}),
    ...(search.length > 0 ? { OR: search } : {}),
  };
}

function buildIncomeWhere(userId, query = {}) {
  const { start, end } = parseDateRange(query);
  const search = buildTextSearch(query, { includeCategory: false, includeSource: true });
  const amount = buildAmountFilter(query);

  return {
    userId,
    date: {
      gte: start,
      lte: end,
    },
    ...(query.source && query.source !== "All" ? { source: query.source } : {}),
    ...(query.paymentMethod && query.paymentMethod !== "All" ? { paymentMethod: query.paymentMethod } : {}),
    ...(query.merchant ? { merchant: { contains: query.merchant, mode: "insensitive" } } : {}),
    ...(query.favorite === "true" ? { isFavorite: true } : {}),
    ...(amount ? { amount } : {}),
    ...(search.length > 0 ? { OR: search } : {}),
  };
}

module.exports = {
  buildExpenseWhere,
  buildIncomeWhere,
};
