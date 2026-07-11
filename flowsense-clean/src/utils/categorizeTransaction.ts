export const categorizeTransaction = (
  title: string
): string => {
  const text = title.toLowerCase();

  const includesPattern = (pattern: string) => {
    const normalizedPattern = pattern.toLowerCase();

    if (normalizedPattern.includes(" ")) {
      return text.includes(normalizedPattern);
    }

    if (normalizedPattern.length <= 3) {
      return text.split(/[^a-z0-9]+/).includes(normalizedPattern);
    }

    return text.includes(normalizedPattern);
  };

  if (
    includesPattern("zepto") ||
    includesPattern("blinkit") ||
    includesPattern("instamart") ||
    includesPattern("bigbasket")
  ) {
    return "Groceries";
  }

  if (
    includesPattern("spotify") ||
    includesPattern("netflix") ||
    includesPattern("youtube") ||
    includesPattern("prime video")
  ) {
    return "Entertainment";
  }

  if (
    includesPattern("valve") ||
    includesPattern("steam") ||
    includesPattern("epic games")
  ) {
    return "Gaming";
  }

  if (
    includesPattern("airtel") ||
    includesPattern("jio") ||
    includesPattern("vi")
  ) {
    return "Recharge";
  }

  if (
    includesPattern("uber") ||
    includesPattern("ola")
  ) {
    return "Transport";
  }

  if (
    includesPattern("swiggy") ||
    includesPattern("zomato") ||
    includesPattern("dominos") ||
    includesPattern("pizza hut")
  ) {
    return "Food";
  }

  if (
    includesPattern("amazon") ||
    includesPattern("flipkart") ||
    includesPattern("myntra")
  ) {
    return "Shopping";
  }

  if (
    includesPattern("electricity") ||
    includesPattern("electricity board") ||
    includesPattern("power board") ||
    includesPattern("utility bill") ||
    includesPattern("tneb") ||
    includesPattern("bescom") ||
    includesPattern("mseb") ||
    includesPattern("discom")
  ) {
    return "Bills";
  }

  if (
    includesPattern("paytm") ||
    includesPattern("phonepe") ||
    includesPattern("gpay")
  ) {
    return "Transfer";
  }

  return "Other";
};