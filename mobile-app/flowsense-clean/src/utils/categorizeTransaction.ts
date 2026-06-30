export const categorizeTransaction = (
  title: string
): string => {
  const text = title.toLowerCase();

  if (
    text.includes("zepto") ||
    text.includes("blinkit") ||
    text.includes("instamart") ||
    text.includes("bigbasket")
  ) {
    return "Groceries";
  }

  if (
    text.includes("spotify") ||
    text.includes("netflix") ||
    text.includes("youtube") ||
    text.includes("prime video")
  ) {
    return "Entertainment";
  }

  if (
    text.includes("valve") ||
    text.includes("steam") ||
    text.includes("epic games")
  ) {
    return "Gaming";
  }

  if (
    text.includes("airtel") ||
    text.includes("jio") ||
    text.includes("vi")
  ) {
    return "Recharge";
  }

  if (
    text.includes("uber") ||
    text.includes("ola")
  ) {
    return "Transport";
  }

  if (
    text.includes("swiggy") ||
    text.includes("zomato") ||
    text.includes("dominos") ||
    text.includes("pizza hut")
  ) {
    return "Food";
  }

  if (
    text.includes("amazon") ||
    text.includes("flipkart") ||
    text.includes("myntra")
  ) {
    return "Shopping";
  }

  if (
    text.includes("paytm") ||
    text.includes("phonepe") ||
    text.includes("gpay")
  ) {
    return "Transfer";
  }

  return "Other";
};