import { describe, it, expect } from "vitest";
import { validateCreateDispute } from "./disputeValidator.js";

function validBody() {
  return {
    customerId: 1,
    paymentType: "Card Payment",
    issueCategory: "Duplicate Debit",
    transactionAmount: 500,
    transactionDate: "2026-01-15",
    transactionStatus: "Completed",
  };
}

describe("validateCreateDispute", () => {
  describe("valid inputs", () => {
    it("accepts a fully valid body", () => {
      const result = validateCreateDispute(validBody());
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("accepts all valid payment types", () => {
      for (const type of ["Card Payment", "EFT", "Internal Transfer"]) {
        const body = { ...validBody(), paymentType: type, issueCategory: "Duplicate Debit" };
        const result = validateCreateDispute(body);
        expect(result.valid).toBe(true);
      }
    });

    it("accepts all valid transaction statuses", () => {
      for (const status of ["Completed", "Failed", "Pending"]) {
        const body = { ...validBody(), transactionStatus: status };
        const result = validateCreateDispute(body);
        expect(result.valid).toBe(true);
      }
    });

    it("accepts minimal valid decimal amount", () => {
      const body = { ...validBody(), transactionAmount: 0.01 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(true);
    });

    it("accepts large transaction amounts", () => {
      const body = { ...validBody(), transactionAmount: 1_000_000 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(true);
    });
  });

  describe("missing fields", () => {
    it("rejects null body", () => {
      const result = validateCreateDispute(null);
      expect(result.valid).toBe(false);
      expect(result.errors.body).toBeDefined();
    });

    it("rejects undefined body", () => {
      const result = validateCreateDispute(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors.body).toBeDefined();
    });

    it("rejects non-object body (string)", () => {
      const result = validateCreateDispute("hello");
      expect(result.valid).toBe(false);
    });

    it("rejects empty object with all field errors", () => {
      const result = validateCreateDispute({});
      expect(result.valid).toBe(false);
      expect(result.errors.customerId).toBeDefined();
      expect(result.errors.paymentType).toBeDefined();
      expect(result.errors.issueCategory).toBeDefined();
      expect(result.errors.transactionAmount).toBeDefined();
      expect(result.errors.transactionDate).toBeDefined();
      expect(result.errors.transactionStatus).toBeDefined();
    });

    it("reports error for missing customerId", () => {
      const body = { ...validBody() };
      delete (body as Record<string, unknown>).customerId;
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.customerId).toBeDefined();
    });

    it("reports error for missing paymentType", () => {
      const body = { ...validBody() };
      delete (body as Record<string, unknown>).paymentType;
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.paymentType).toBeDefined();
    });

    it("reports error for missing transactionAmount", () => {
      const body = { ...validBody() };
      delete (body as Record<string, unknown>).transactionAmount;
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionAmount).toBeDefined();
    });
  });

  describe("customerId edge cases", () => {
    it("rejects customerId of 0", () => {
      const body = { ...validBody(), customerId: 0 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.customerId).toBeDefined();
    });

    it("rejects negative customerId", () => {
      const body = { ...validBody(), customerId: -5 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.customerId).toBeDefined();
    });

    it("rejects floating point customerId", () => {
      const body = { ...validBody(), customerId: 1.5 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.customerId).toBeDefined();
    });

    it("rejects string customerId", () => {
      const body = { ...validBody(), customerId: "abc" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.customerId).toBeDefined();
    });

    it("rejects null customerId", () => {
      const body = { ...validBody(), customerId: null };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.customerId).toBeDefined();
    });
  });

  describe("paymentType edge cases", () => {
    it("rejects unknown payment type", () => {
      const body = { ...validBody(), paymentType: "Bitcoin" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.paymentType).toBeDefined();
    });

    it("rejects payment type with wrong casing", () => {
      const body = { ...validBody(), paymentType: "card payment" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.paymentType).toBeDefined();
    });

    it("rejects empty string payment type", () => {
      const body = { ...validBody(), paymentType: "" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.paymentType).toBeDefined();
    });

    it("rejects numeric payment type", () => {
      const body = { ...validBody(), paymentType: 123 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.paymentType).toBeDefined();
    });
  });

  describe("issueCategory edge cases", () => {
    it("rejects issue category not valid for the payment type", () => {
      // "Incorrect Amount" is valid for Card Payment but not for EFT
      const body = {
        ...validBody(),
        paymentType: "EFT",
        issueCategory: "Incorrect Amount",
      };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.issueCategory).toBeDefined();
    });

    it("rejects completely invalid issue category", () => {
      const body = { ...validBody(), issueCategory: "Aliens Stole My Money" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.issueCategory).toBeDefined();
    });

    it("accepts valid issue category for each payment type", () => {
      const combos = [
        { paymentType: "Card Payment", issueCategory: "Unauthorized Transaction" },
        { paymentType: "EFT", issueCategory: "Failed Transfer" },
        { paymentType: "Internal Transfer", issueCategory: "Missing Payment" },
      ];
      for (const combo of combos) {
        const body = { ...validBody(), ...combo };
        const result = validateCreateDispute(body);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe("transactionAmount edge cases", () => {
    it("rejects zero amount", () => {
      const body = { ...validBody(), transactionAmount: 0 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionAmount).toBeDefined();
    });

    it("rejects negative amount", () => {
      const body = { ...validBody(), transactionAmount: -100 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionAmount).toBeDefined();
    });

    it("rejects string amount", () => {
      const body = { ...validBody(), transactionAmount: "five hundred" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionAmount).toBeDefined();
    });

    it("rejects NaN amount", () => {
      const body = { ...validBody(), transactionAmount: NaN };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
    });
  });

  describe("transactionDate edge cases", () => {
    it("accepts ISO date string", () => {
      const body = { ...validBody(), transactionDate: "2026-06-15T10:30:00Z" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(true);
    });

    it("rejects malformed date", () => {
      const body = { ...validBody(), transactionDate: "15/06/2026" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionDate).toBeDefined();
    });

    it("rejects completely invalid date string", () => {
      const body = { ...validBody(), transactionDate: "not-a-date" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionDate).toBeDefined();
    });

    it("rejects numeric date", () => {
      const body = { ...validBody(), transactionDate: 1234567890 };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionDate).toBeDefined();
    });

    it("rejects empty string date", () => {
      const body = { ...validBody(), transactionDate: "" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionDate).toBeDefined();
    });
  });

  describe("transactionStatus edge cases", () => {
    it("rejects invalid status", () => {
      const body = { ...validBody(), transactionStatus: "Cancelled" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionStatus).toBeDefined();
    });

    it("rejects status with wrong casing", () => {
      const body = { ...validBody(), transactionStatus: "completed" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionStatus).toBeDefined();
    });

    it("rejects empty string status", () => {
      const body = { ...validBody(), transactionStatus: "" };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(result.errors.transactionStatus).toBeDefined();
    });
  });

  describe("multiple validation errors", () => {
    it("reports all errors at once for multiple invalid fields", () => {
      const body = {
        customerId: -1,
        paymentType: "Invalid",
        issueCategory: "",
        transactionAmount: -50,
        transactionDate: "bad",
        transactionStatus: "bad",
      };
      const result = validateCreateDispute(body);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(4);
    });
  });
});
