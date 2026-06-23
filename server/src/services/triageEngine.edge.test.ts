import { describe, it, expect } from "vitest";
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

describe("determineBasePriority - boundary values", () => {
  it("returns Medium at exactly 1000", () => {
    expect(determineBasePriority(1000)).toBe("Medium");
  });

  it("returns Low at 999.99", () => {
    expect(determineBasePriority(999.99)).toBe("Low");
  });

  it("returns Medium at exactly 10000", () => {
    expect(determineBasePriority(10000)).toBe("Medium");
  });

  it("returns High at 10000.01", () => {
    expect(determineBasePriority(10000.01)).toBe("High");
  });

  it("returns Low for very small amounts (0.01)", () => {
    expect(determineBasePriority(0.01)).toBe("Low");
  });

  it("returns High for very large amounts (1 million)", () => {
    expect(determineBasePriority(1_000_000)).toBe("High");
  });
});

describe("applyAgeEscalation - boundary values", () => {
  it("does not escalate at exactly 7 days", () => {
    const result = applyAgeEscalation("Low", daysAgo(7));
    expect(result.priority).toBe("Low");
    expect(result.escalated).toBe(false);
  });

  it("escalates at exactly 8 days", () => {
    const result = applyAgeEscalation("Low", daysAgo(8));
    expect(result.priority).toBe("Medium");
    expect(result.escalated).toBe(true);
  });

  it("does not escalate at 0 days", () => {
    const result = applyAgeEscalation("Medium", daysAgo(0));
    expect(result.priority).toBe("Medium");
    expect(result.escalated).toBe(false);
  });

  it("High priority at 8+ days returns escalated=false (already max)", () => {
    const result = applyAgeEscalation("High", daysAgo(30));
    expect(result.priority).toBe("High");
    expect(result.escalated).toBe(false);
  });

  it("correctly calculates age in days", () => {
    const result = applyAgeEscalation("Low", daysAgo(14));
    expect(result.ageInDays).toBe(14);
  });

  it("handles very old disputes (1 year)", () => {
    const result = applyAgeEscalation("Low", daysAgo(365));
    expect(result.priority).toBe("Medium");
    expect(result.escalated).toBe(true);
  });
});

describe("determineRoutingAction - rule precedence", () => {
  it("Unauthorized Transaction takes precedence over Failed status", () => {
    const result = determineRoutingAction({
      transactionAmount: 100,
      transactionStatus: "Failed",
      issueCategory: "Unauthorized Transaction",
      disputeCreatedAt: daysAgo(0),
    });
    expect(result.action).toBe("Escalate");
  });

  it("Failed status takes precedence over low-value Duplicate Debit", () => {
    const result = determineRoutingAction({
      transactionAmount: 200, // Would match Rule 3 if not Failed
      transactionStatus: "Failed",
      issueCategory: "Duplicate Debit",
      disputeCreatedAt: daysAgo(0),
    });
    expect(result.action).toBe("Investigate Further");
  });

  it("Resolve Immediately only when amount < 500 AND Duplicate Debit AND not Failed", () => {
    const result = determineRoutingAction({
      transactionAmount: 499.99,
      transactionStatus: "Completed",
      issueCategory: "Duplicate Debit",
      disputeCreatedAt: daysAgo(0),
    });
    expect(result.action).toBe("Resolve Immediately");
  });

  it("Duplicate Debit at exactly 500 does NOT resolve immediately", () => {
    const result = determineRoutingAction({
      transactionAmount: 500,
      transactionStatus: "Completed",
      issueCategory: "Duplicate Debit",
      disputeCreatedAt: daysAgo(0),
    });
    expect(result.action).toBe("Refer to Another Team");
  });

  it("Pending Duplicate Debit at 499 resolves immediately", () => {
    const result = determineRoutingAction({
      transactionAmount: 499,
      transactionStatus: "Pending",
      issueCategory: "Duplicate Debit",
      disputeCreatedAt: daysAgo(0),
    });
    expect(result.action).toBe("Resolve Immediately");
  });

  it("default rule triggers for non-special categories with Completed status", () => {
    const result = determineRoutingAction({
      transactionAmount: 5000,
      transactionStatus: "Completed",
      issueCategory: "Incorrect Amount",
      disputeCreatedAt: daysAgo(0),
    });
    expect(result.action).toBe("Refer to Another Team");
  });
});

describe("evaluateDispute - full pipeline edge cases", () => {
  it("combines age escalation with routing correctly", () => {
    const input: TriageInput = {
      transactionAmount: 800, // Low base priority
      transactionStatus: "Completed",
      issueCategory: "Missing Payment",
      disputeCreatedAt: daysAgo(10), // Should escalate Low → Medium
    };
    const result = evaluateDispute(input);
    expect(result.priorityLevel).toBe("Medium");
    expect(result.routingAction).toBe("Refer to Another Team");
  });

  it("Unauthorized + high amount + old dispute = High priority + Escalate", () => {
    const input: TriageInput = {
      transactionAmount: 50000,
      transactionStatus: "Completed",
      issueCategory: "Unauthorized Transaction",
      disputeCreatedAt: daysAgo(30),
    };
    const result = evaluateDispute(input);
    expect(result.priorityLevel).toBe("High");
    expect(result.routingAction).toBe("Escalate");
  });

  it("low-value recent Duplicate Debit resolves immediately with Low priority", () => {
    const input: TriageInput = {
      transactionAmount: 50,
      transactionStatus: "Completed",
      issueCategory: "Duplicate Debit",
      disputeCreatedAt: daysAgo(1),
    };
    const result = evaluateDispute(input);
    expect(result.priorityLevel).toBe("Low");
    expect(result.routingAction).toBe("Resolve Immediately");
  });

  it("old low-value Duplicate Debit escalates priority but still resolves immediately", () => {
    const input: TriageInput = {
      transactionAmount: 50,
      transactionStatus: "Completed",
      issueCategory: "Duplicate Debit",
      disputeCreatedAt: daysAgo(15),
    };
    const result = evaluateDispute(input);
    expect(result.priorityLevel).toBe("Medium"); // Low → Medium (escalated)
    expect(result.routingAction).toBe("Resolve Immediately");
  });

  it("reasoning array always starts with Amount Priority Rule", () => {
    const input: TriageInput = {
      transactionAmount: 5000,
      transactionStatus: "Completed",
      issueCategory: "Missing Payment",
      disputeCreatedAt: daysAgo(0),
    };
    const result = evaluateDispute(input);
    expect(result.reasoning[0].ruleName).toBe("Amount Priority Rule");
  });

  it("reasoning includes Age Escalation Rule when escalated", () => {
    const input: TriageInput = {
      transactionAmount: 500,
      transactionStatus: "Completed",
      issueCategory: "Missing Payment",
      disputeCreatedAt: daysAgo(10),
    };
    const result = evaluateDispute(input);
    const ageRule = result.reasoning.find(
      (r) => r.ruleName === "Age Escalation Rule"
    );
    expect(ageRule).toBeDefined();
    expect(ageRule!.triggeredBy.basePriority).toBe("Low");
    expect(ageRule!.triggeredBy.escalatedTo).toBe("Medium");
  });

  it("reasoning does NOT include Age Escalation Rule when not escalated", () => {
    const input: TriageInput = {
      transactionAmount: 500,
      transactionStatus: "Completed",
      issueCategory: "Missing Payment",
      disputeCreatedAt: daysAgo(3),
    };
    const result = evaluateDispute(input);
    const ageRule = result.reasoning.find(
      (r) => r.ruleName === "Age Escalation Rule"
    );
    expect(ageRule).toBeUndefined();
  });

  it("reasoning has exactly 2 rules when no escalation (amount + routing)", () => {
    const input: TriageInput = {
      transactionAmount: 500,
      transactionStatus: "Completed",
      issueCategory: "Missing Payment",
      disputeCreatedAt: daysAgo(3),
    };
    const result = evaluateDispute(input);
    expect(result.reasoning).toHaveLength(2);
  });

  it("reasoning has exactly 3 rules when escalated (amount + age + routing)", () => {
    const input: TriageInput = {
      transactionAmount: 500,
      transactionStatus: "Completed",
      issueCategory: "Missing Payment",
      disputeCreatedAt: daysAgo(10),
    };
    const result = evaluateDispute(input);
    expect(result.reasoning).toHaveLength(3);
  });
});

describe("evaluateDispute - all payment type / category combinations", () => {
  const categories = [
    "Duplicate Debit",
    "Unauthorized Transaction",
    "Failed Transaction",
    "Incorrect Amount",
    "Failed Transfer",
    "Missing Payment",
  ];

  const statuses = ["Completed", "Failed", "Pending"] as const;

  it("never crashes for any valid input combination", () => {
    for (const category of categories) {
      for (const status of statuses) {
        for (const amount of [50, 500, 5000, 15000]) {
          for (const age of [0, 7, 8, 30]) {
            const input: TriageInput = {
              transactionAmount: amount,
              transactionStatus: status,
              issueCategory: category,
              disputeCreatedAt: daysAgo(age),
            };
            const result = evaluateDispute(input);
            expect(result.routingAction).toBeTruthy();
            expect(result.priorityLevel).toBeTruthy();
            expect(result.reasoning.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});
