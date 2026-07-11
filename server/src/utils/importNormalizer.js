const MERCHANT_RULES = [
  { patterns: ["swiggy", "swiggy india", "upi swiggy blr"], merchant: "Swiggy", category: "Food" },
  { patterns: ["zomato"], merchant: "Zomato", category: "Food" },
  { patterns: ["uber", "uber india"], merchant: "Uber", category: "Transport" },
  { patterns: ["ola"], merchant: "Ola", category: "Transport" },
  { patterns: ["netflix", "netflix.com"], merchant: "Netflix", category: "Entertainment" },
  { patterns: ["spotify"], merchant: "Spotify", category: "Entertainment" },
  { patterns: ["amazon seller services", "amazon pay", "amazon"], merchant: "Amazon", category: "Shopping" },
  { patterns: ["flipkart"], merchant: "Flipkart", category: "Shopping" },
  { patterns: ["myntra"], merchant: "Myntra", category: "Shopping" },
  { patterns: ["blinkit"], merchant: "Blinkit", category: "Groceries" },
  { patterns: ["zepto"], merchant: "Zepto", category: "Groceries" },
  { patterns: ["instamart"], merchant: "Instamart", category: "Groceries" },
  { patterns: ["bigbasket"], merchant: "BigBasket", category: "Groceries" },
  { patterns: ["dominos", "pizza hut"], merchant: "Domino's", category: "Food" },
  { patterns: ["airtel"], merchant: "Airtel", category: "Recharge" },
  { patterns: ["jio"], merchant: "Jio", category: "Recharge" },
  { patterns: ["vi"], merchant: "Vi", category: "Recharge" },
  { patterns: ["paytm"], merchant: "Paytm", category: "Transfer" },
  { patterns: ["phonepe"], merchant: "PhonePe", category: "Transfer" },
  { patterns: ["gpay", "g-pay"], merchant: "GPay", category: "Transfer" },
  { patterns: ["electricity board", "electricity bill", "power board", "utility bill", "tneb", "bescom", "mseb", "discom"], merchant: "Electricity Board", category: "Bills" },
];

const PAYMENT_METHOD_MAP = [
  { patterns: ["upi"], label: "UPI" },
  { patterns: ["phonepe"], label: "PhonePe" },
  { patterns: ["paytm"], label: "Paytm" },
  { patterns: ["gpay", "g-pay"], label: "GPay" },
  { patterns: ["visa"], label: "Visa" },
  { patterns: ["mastercard"], label: "Mastercard" },
  { patterns: ["amex", "american express"], label: "Amex" },
  { patterns: ["netbanking", "bank transfer", "imps", "neft"], label: "Netbanking" },
  { patterns: ["debit"], label: "Debit" },
  { patterns: ["credit"], label: "Credit" },
];

const CATEGORY_RULES = [
  { patterns: ["zepto", "blinkit", "instamart", "bigbasket"], category: "Groceries" },
  { patterns: ["spotify", "netflix", "youtube", "prime video"], category: "Entertainment" },
  { patterns: ["valve", "steam", "epic games"], category: "Gaming" },
  { patterns: ["airtel", "jio", "vi"], category: "Recharge" },
  { patterns: ["uber", "ola"], category: "Transport" },
  { patterns: ["swiggy", "zomato", "dominos", "pizza hut"], category: "Food" },
  { patterns: ["amazon", "flipkart", "myntra"], category: "Shopping" },
  { patterns: ["paytm", "phonepe", "gpay"], category: "Transfer" },
  { patterns: ["electricity board", "electricity bill", "power board", "utility bill", "tneb", "bescom", "mseb", "discom"], category: "Bills" },
];

function normalizePattern(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

function includesPattern(text, pattern) {
  const normalizedPattern = normalizePattern(pattern);

  if (!normalizedPattern) {
    return false;
  }

  if (normalizedPattern.includes(" ")) {
    return text.includes(normalizedPattern);
  }

  if (normalizedPattern.length <= 3) {
    return text.split(" ").includes(normalizedPattern);
  }

  return text.includes(normalizedPattern);
}

function matchMerchantRule(rawTitle) {
  const normalizedTitle = normalizePattern(rawTitle);

  return MERCHANT_RULES.find((rule) =>
    rule.patterns.some((pattern) => includesPattern(normalizedTitle, pattern))
  );
}

function inferPaymentMethod(rawTitle) {
  const cleaned = normalizePattern(rawTitle);

  for (const method of PAYMENT_METHOD_MAP) {
    if (method.patterns.some((pattern) => includesPattern(cleaned, pattern))) {
      return method.label;
    }
  }

  return null;
}

function inferMerchant(rawTitle) {
  const rule = matchMerchantRule(rawTitle);

  if (rule) {
    return rule.merchant;
  }

  const original = String(rawTitle || "").trim();
  let cleaned = original
    .replace(/\.[a-z]{2,}$/i, "")
    .replace(/[\(\)\[\]\{\},:]/g, " ")
    .replace(/\b(upi|phonepe|paytm|gpay|g-pay|netbanking|bank transfer|visa|mastercard|amex|american express|debit|credit|txn|transaction|purchase|payment|online|at|by|india|blr|bengaluru|bangalore)\b/gi, " ")
    .replace(/\b(inr|rs|rupees?)\b/gi, " ")
    .replace(/\d+[.,]?\d*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleaned.split(" ").filter(Boolean);

  if (!tokens.length) {
    return titleCase(original);
  }

  const knownMerchant = tokens.find((token) =>
    ["swiggy", "zomato", "dominos", "pizza", "amazon", "flipkart", "myntra", "uber", "ola", "airtel", "jio", "vi", "paytm", "phonepe", "gpay", "spotify", "netflix", "steam", "blinkit", "zepto", "instamart", "bigbasket"].includes(token.toLowerCase())
  );

  if (knownMerchant) {
    return titleCase(knownMerchant);
  }

  const merchantTokens = tokens.slice(0, 2);

  return titleCase(merchantTokens.join(" "));
}

function classifyTransaction(rawValue) {
  const text = normalizePattern(rawValue);

  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => includesPattern(text, pattern))) {
      return rule.category;
    }
  }

  const merchantRule = matchMerchantRule(rawValue);

  if (merchantRule) {
    return merchantRule.category;
  }

  return "Other";
}

function getConfidenceLabel(rawTitle, merchant, category) {
  const merchantRule = matchMerchantRule(rawTitle);

  if (merchantRule && normalizePattern(merchantRule.merchant) === normalizePattern(merchant)) {
    return {
      label: "High",
      score: 0.95,
    };
  }

  if (merchantRule || category !== "Other") {
    return {
      label: "Medium",
      score: 0.7,
    };
  }

  return {
    label: "Low",
    score: 0.4,
  };
}

function normalizeImportedTransaction(rawTitle) {
  const merchantRule = matchMerchantRule(rawTitle);
  const merchant = inferMerchant(rawTitle);
  const category = merchantRule?.category || classifyTransaction(rawTitle || merchant);
  const paymentMethod = inferPaymentMethod(rawTitle);
  const confidence = getConfidenceLabel(rawTitle, merchant, category);

  return {
    title: merchant || String(rawTitle || "").trim() || "Imported Transaction",
    merchant: merchant || null,
    category,
    paymentMethod,
    confidenceLabel: confidence.label,
    confidenceScore: confidence.score,
  };
}

module.exports = {
  normalizePattern,
  inferPaymentMethod,
  inferMerchant,
  classifyTransaction,
  normalizeImportedTransaction,
  getConfidenceLabel,
};
