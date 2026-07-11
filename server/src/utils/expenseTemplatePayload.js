const normalizeTemplatePayload = (body = {}) => {
  const title = String(body.title || "").trim();
  const name = String(body.name || title || "Untitled template").trim();
  const amount = Number(body.amount);

  return {
    name: name || "Untitled template",
    title: title || name || "Untitled template",
    amount: Number.isFinite(amount) ? amount : 0,
    category: String(body.category || "Other").trim() || "Other",
    merchant: body.merchant ? String(body.merchant).trim() : null,
    note: body.note ? String(body.note).trim() : null,
    paymentMethod: body.paymentMethod ? String(body.paymentMethod).trim() : null,
  };
};

module.exports = {
  normalizeTemplatePayload,
};
