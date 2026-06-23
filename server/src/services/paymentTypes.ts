export const PAYMENT_TYPE_CATEGORIES: Record<string, string[]> = {
  "Card Payment": [
    "Duplicate Debit",
    "Unauthorized Transaction",
    "Failed Transaction",
    "Incorrect Amount",
  ],
  EFT: ["Failed Transfer", "Duplicate Debit", "Missing Payment"],
  "Internal Transfer": [
    "Failed Transfer",
    "Duplicate Debit",
    "Missing Payment",
    "Unauthorized Transaction",
  ],
};

export const VALID_PAYMENT_TYPES = Object.keys(PAYMENT_TYPE_CATEGORIES);

export function getValidIssueCategories(
  paymentType: string
): string[] | undefined {
  return PAYMENT_TYPE_CATEGORIES[paymentType];
}

export function isValidPaymentType(paymentType: string): boolean {
  return paymentType in PAYMENT_TYPE_CATEGORIES;
}

export function isValidIssueCategory(
  paymentType: string,
  issueCategory: string
): boolean {
  const categories = PAYMENT_TYPE_CATEGORIES[paymentType];
  if (!categories) return false;
  return categories.includes(issueCategory);
}
