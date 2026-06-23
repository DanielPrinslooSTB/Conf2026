import type { ValidationResult } from "../types/dispute.js";
import {
  isValidPaymentType,
  isValidIssueCategory,
} from "../services/paymentTypes.js";

const VALID_STATUSES = ["Completed", "Failed", "Pending"];

export function validateCreateDispute(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body || typeof body !== "object") {
    return { valid: false, errors: { body: "Request body is required" } };
  }

  const data = body as Record<string, unknown>;

  // customerId
  if (data.customerId === undefined || data.customerId === null) {
    errors.customerId = "customerId is required";
  } else if (
    typeof data.customerId !== "number" ||
    !Number.isInteger(data.customerId) ||
    data.customerId <= 0
  ) {
    errors.customerId = "customerId must be a positive integer";
  }

  // paymentType
  if (!data.paymentType) {
    errors.paymentType = "paymentType is required";
  } else if (
    typeof data.paymentType !== "string" ||
    !isValidPaymentType(data.paymentType)
  ) {
    errors.paymentType =
      'paymentType must be one of "Card Payment", "EFT", "Internal Transfer"';
  }

  // issueCategory
  if (!data.issueCategory) {
    errors.issueCategory = "issueCategory is required";
  } else if (typeof data.issueCategory !== "string") {
    errors.issueCategory = "issueCategory must be a string";
  } else if (
    typeof data.paymentType === "string" &&
    isValidPaymentType(data.paymentType) &&
    !isValidIssueCategory(data.paymentType, data.issueCategory)
  ) {
    errors.issueCategory =
      "issueCategory is not valid for the selected paymentType";
  }

  // transactionAmount
  if (data.transactionAmount === undefined || data.transactionAmount === null) {
    errors.transactionAmount = "transactionAmount is required";
  } else if (
    typeof data.transactionAmount !== "number" ||
    !Number.isFinite(data.transactionAmount) ||
    data.transactionAmount <= 0
  ) {
    errors.transactionAmount = "transactionAmount must be a positive number";
  }

  // transactionDate
  if (!data.transactionDate) {
    errors.transactionDate = "transactionDate is required";
  } else if (typeof data.transactionDate !== "string") {
    errors.transactionDate = "transactionDate must be a valid ISO date string";
  } else {
    const parsed = new Date(data.transactionDate);
    if (isNaN(parsed.getTime())) {
      errors.transactionDate =
        "transactionDate must be a valid ISO date string";
    }
  }

  // transactionStatus
  if (!data.transactionStatus) {
    errors.transactionStatus = "transactionStatus is required";
  } else if (
    typeof data.transactionStatus !== "string" ||
    !VALID_STATUSES.includes(data.transactionStatus)
  ) {
    errors.transactionStatus =
      'transactionStatus must be one of "Completed", "Failed", "Pending"';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
