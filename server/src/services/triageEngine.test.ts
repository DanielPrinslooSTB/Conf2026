import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  evaluateDispute,
  determineBasePriority,
  applyAgeEscalation,
  determineRoutingAction,
} from "./triageEngine.js";
import type { TriageInput } from "../types/dispute.js";

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Property 6: Amount-based priority assignment
describe("Property 6: Amount-based priority assignment", () => {
  it("assigns High when amount > 10000", () => {
    fc.assert(
      fc.property(fc.double({ min: 10001, max: 1_000_000, noNaN: true }), (amount) => {
        expect(determineBasePriority(amount)).toBe("High");
      })
    );
  });

  it("assigns Medium when 1000 <= amount <= 10000", () => {
    fc.assert(
      fc.property(fc.double({ min: 1000, max: 10000, noNaN: true }), (amount) => {
        expect(determineBasePriority(amount)).toBe("Medium");
      })
    );
  });

  it("assigns Low when amount < 1000", () => {
    fc.assert(
      fc.property(fc.double({ min: 0.01, max: 999.99, noNaN: true }), (amount) => {
        expect(determineBasePriority(amount)).toBe("Low");
      })
    );
  });
});

// Property 7: Age-based priority escalation
describe("Property 7: Age-based priority escalation", () => {
  it("escalates Low to Medium when age > 7 days", () => {
    fc.assert(
      fc.property(fc.integer({ min: 8, max: 365 }), (age) => {
        const result = applyAgeEscalation("Low", daysAgo(age));
        expect(result.priority).toBe("Medium");
      })
    );
  });

  it("escalates Medium to High when age > 7 days", () => {
    fc.assert(
      fc.property(fc.integer({ min: 8, max: 365 }), (age) => {
        const result = applyAgeEscalation("Medium", daysAgo(age));
        expect(result.priority).toBe("High");
      })
    );
  });

  it("keeps High as High when age > 7 days", () => {
    fc.assert(
      fc.property(fc.integer({ min: 8, max: 365 }), (age) => {
        const result = applyAgeEscalation("High", daysAgo(age));
        expect(result.priority).toBe("High");
      })
    );
  });

  it("does not escalate when age <= 7 days", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 7 }),
        fc.constantFrom("Low" as const, "Medium" as const, "High" as const),
        (age, priority) => {
          const result = applyAgeEscalation(priority, daysAgo(age));
          expect(result.priority).toBe(priority);
        }
      )
    );
  });
});

// Property 8: Unauthorized transaction always escalates
describe("Property 8: Unauthorized transaction always escalates", () => {
  it("routes to Escalate regardless of other attributes", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1_000_000, noNaN: true }),
        fc.constantFrom("Completed" as const, "Failed" as const, "Pending" as const),
        fc.integer({ min: 0, max: 365 }),
        (amount, status, age) => {
          const input: TriageInput = {
            transactionAmount: amount,
            transactionStatus: status,
            issueCategory: "Unauthorized Transaction",
            disputeCreatedAt: daysAgo(age),
          };
          const result = evaluateDispute(input);
          expect(result.routingAction).toBe("Escalate");
        }
      )
    );
  });
});

// Property 9: Failed status routes to investigation
describe("Property 9: Failed status routes to investigation", () => {
  it("routes to Investigate Further when Failed and not Unauthorized", () => {
    const nonUnauthorizedCategories = [
      "Duplicate Debit",
      "Failed Transaction",
      "Failed Transfer",
      "Missing Payment",
      "Incorrect Amount",
    ];

    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1_000_000, noNaN: true }),
        fc.constantFrom(...nonUnauthorizedCategories),
        fc.integer({ min: 0, max: 365 }),
        (amount, category, age) => {
          const input: TriageInput = {
            transactionAmount: amount,
            transactionStatus: "Failed",
            issueCategory: category,
            disputeCreatedAt: daysAgo(age),
          };
          const result = evaluateDispute(input);
          expect(result.routingAction).toBe("Investigate Further");
        }
      )
    );
  });
});

// Property 10: Low-value duplicate resolves immediately
describe("Property 10: Low-value duplicate resolves immediately", () => {
  it("routes to Resolve Immediately when amount < 500, Duplicate Debit, not Failed", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 499.99, noNaN: true }),
        fc.constantFrom("Completed" as const, "Pending" as const),
        fc.integer({ min: 0, max: 365 }),
        (amount, status, age) => {
          const input: TriageInput = {
            transactionAmount: amount,
            transactionStatus: status,
            issueCategory: "Duplicate Debit",
            disputeCreatedAt: daysAgo(age),
          };
          const result = evaluateDispute(input);
          expect(result.routingAction).toBe("Resolve Immediately");
        }
      )
    );
  });
});

// Property 11: Default routing fallback
describe("Property 11: Default routing fallback", () => {
  it("routes to Refer to Another Team when no specific rule matches", () => {
    // Cases that don't match rules 8/9/10:
    // - Not Unauthorized Transaction
    // - Not Failed status
    // - Not (amount < 500 AND Duplicate Debit AND status != Failed)
    const categoriesNotDuplicateOrUnauthorized = [
      "Failed Transaction",
      "Failed Transfer",
      "Missing Payment",
      "Incorrect Amount",
    ];

    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1_000_000, noNaN: true }),
        fc.constantFrom(...categoriesNotDuplicateOrUnauthorized),
        fc.constantFrom("Completed" as const, "Pending" as const),
        fc.integer({ min: 0, max: 365 }),
        (amount, category, status, age) => {
          const input: TriageInput = {
            transactionAmount: amount,
            transactionStatus: status,
            issueCategory: category,
            disputeCreatedAt: daysAgo(age),
          };
          const result = evaluateDispute(input);
          expect(result.routingAction).toBe("Refer to Another Team");
        }
      )
    );
  });

  it("routes to Refer when Duplicate Debit but amount >= 500 and not Failed", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 500, max: 1_000_000, noNaN: true }),
        fc.constantFrom("Completed" as const, "Pending" as const),
        fc.integer({ min: 0, max: 365 }),
        (amount, status, age) => {
          const input: TriageInput = {
            transactionAmount: amount,
            transactionStatus: status,
            issueCategory: "Duplicate Debit",
            disputeCreatedAt: daysAgo(age),
          };
          const result = evaluateDispute(input);
          expect(result.routingAction).toBe("Refer to Another Team");
        }
      )
    );
  });
});

// Property 5: Triage output structural completeness
describe("Property 5: Triage output structural completeness", () => {
  const validRoutingActions = [
    "Resolve Immediately",
    "Investigate Further",
    "Escalate",
    "Refer to Another Team",
  ];
  const validPriorityLevels = ["High", "Medium", "Low"];
  const allCategories = [
    "Duplicate Debit",
    "Unauthorized Transaction",
    "Failed Transaction",
    "Incorrect Amount",
    "Failed Transfer",
    "Missing Payment",
  ];

  it("always produces a valid routing action, priority level, and non-empty reasoning", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1_000_000, noNaN: true }),
        fc.constantFrom("Completed" as const, "Failed" as const, "Pending" as const),
        fc.constantFrom(...allCategories),
        fc.integer({ min: 0, max: 365 }),
        (amount, status, category, age) => {
          const input: TriageInput = {
            transactionAmount: amount,
            transactionStatus: status,
            issueCategory: category,
            disputeCreatedAt: daysAgo(age),
          };
          const result = evaluateDispute(input);

          expect(validRoutingActions).toContain(result.routingAction);
          expect(validPriorityLevels).toContain(result.priorityLevel);
          expect(result.reasoning.length).toBeGreaterThan(0);
        }
      )
    );
  });
});

// Property 12: Reasoning transparency
describe("Property 12: Reasoning transparency", () => {
  const allCategories = [
    "Duplicate Debit",
    "Unauthorized Transaction",
    "Failed Transaction",
    "Incorrect Amount",
    "Failed Transfer",
    "Missing Payment",
  ];

  it("includes at least one rule with non-empty ruleName and triggeredBy", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1_000_000, noNaN: true }),
        fc.constantFrom("Completed" as const, "Failed" as const, "Pending" as const),
        fc.constantFrom(...allCategories),
        fc.integer({ min: 0, max: 365 }),
        (amount, status, category, age) => {
          const input: TriageInput = {
            transactionAmount: amount,
            transactionStatus: status,
            issueCategory: category,
            disputeCreatedAt: daysAgo(age),
          };
          const result = evaluateDispute(input);

          for (const rule of result.reasoning) {
            expect(rule.ruleName).toBeTruthy();
            expect(Object.keys(rule.triggeredBy).length).toBeGreaterThan(0);
          }
        }
      )
    );
  });
});
