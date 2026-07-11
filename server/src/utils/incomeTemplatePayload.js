const normalizeIncomeTemplatePayload = (body = {}) => {
  const title = String(body.title || "").trim();
  const name = String(body.name || title || "Untitled template").trim();
  const amount = Number(body.amount);
  const rawDate = String(body.date || "").trim();
  const date = rawDate ? new Date(rawDate) : new Date();

  return {
    name: name || "Untitled template",
    title: title || name || "Untitled template",
    amount: Number.isFinite(amount) ? amount : 0,
    date: Number.isNaN(date.getTime()) ? new Date() : date,
    source: body.source ? String(body.source).trim() : null,
    merchant: body.merchant ? String(body.merchant).trim() : null,
    note: body.note ? String(body.note).trim() : null,
    paymentMethod: body.paymentMethod ? String(body.paymentMethod).trim() : null,
  };
};

module.exports = {
  normalizeIncomeTemplatePayload,
};
