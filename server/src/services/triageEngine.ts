import type {
  TriageInput,
  TriageResult,
  RoutingAction,
  PriorityLevel,
  FiredRule,
} from "../types/dispute.js";

export function determineBasePriority(amount: number): PriorityLevel {
  if (amount > 10000) return "High";
  if (amount >= 1000) return "Medium";
  return "Low";
}

export function applyAgeEscalation(
  basePriority: PriorityLevel,
  createdAt: Date
): { priority: PriorityLevel; escalated: boolean; ageInDays: number } {
  const ageInDays = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (ageInDays <= 7) {
    return { priority: basePriority, escalated: false, ageInDays };
  }

  // Escalate one tier
  if (basePriority === "Low") {
    return { priority: "Medium", escalated: true, ageInDays };
  }
  if (basePriority === "Medium") {
    return { priority: "High", escalated: true, ageInDays };
  }
  // High remains High
  return { priority: "High", escalated: false, ageInDays };
}

export function determineRoutingAction(input: {
  transactionAmount: number;
  transactionStatus: string;
  issueCategory: string;
  disputeCreatedAt: Date;
}): {
  action: RoutingAction;
  rule: FiredRule;
} {
  // Rule 1: Unauthorized Transaction → Escalate (highest priority)
  if (input.issueCategory === "Unauthorized Transaction") {
    return {
      action: "Escalate",
      rule: {
        ruleName: "Unauthorized Transaction Rule",
        description: "Unauthorized transactions are always escalated",
        triggeredBy: { issueCategory: "Unauthorized Transaction" },
      },
    };
  }

  // Rule 2: Failed status (non-Unauthorized) → Investigate Further
  if (input.transactionStatus === "Failed") {
    return {
      action: "Investigate Further",
      rule: {
        ruleName: "Failed Transaction Rule",
        description: "Failed transactions require investigation",
        triggeredBy: {
          transactionStatus: "Failed",
          issueCategory: input.issueCategory,
        },
      },
    };
  }

  // Rule 3: amount < 500 + Duplicate Debit + status ≠ Failed → Resolve Immediately
  if (
    input.transactionAmount < 500 &&
    input.issueCategory === "Duplicate Debit" &&
    input.transactionStatus !== "Failed"
  ) {
    return {
      action: "Resolve Immediately",
      rule: {
        ruleName: "Low-Value Duplicate Rule",
        description: "Low-value duplicate debits can be resolved immediately",
        triggeredBy: {
          amount: input.transactionAmount,
          issueCategory: "Duplicate Debit",
          transactionStatus: input.transactionStatus,
        },
      },
    };
  }

  // Rule 4: Default → Refer to Another Team
  return {
    action: "Refer to Another Team",
    rule: {
      ruleName: "Default Routing Rule",
      description:
        "No specific rule matched; referring to another team for handling",
      triggeredBy: {
        amount: input.transactionAmount,
        issueCategory: input.issueCategory,
        transactionStatus: input.transactionStatus,
      },
    },
  };
}

export function evaluateDispute(input: TriageInput): TriageResult {
  const reasoning: FiredRule[] = [];

  // Step 1: Determine base priority from amount
  const basePriority = determineBasePriority(input.transactionAmount);
  reasoning.push({
    ruleName: "Amount Priority Rule",
    description: "Transaction amount determines base priority",
    triggeredBy: { amount: input.transactionAmount, result: basePriority },
  });

  // Step 2: Apply age escalation
  const { priority: finalPriority, escalated, ageInDays } =
    applyAgeEscalation(basePriority, input.disputeCreatedAt);

  if (escalated) {
    reasoning.push({
      ruleName: "Age Escalation Rule",
      description:
        "Dispute older than 7 days escalates priority by one tier",
      triggeredBy: {
        ageInDays,
        basePriority,
        escalatedTo: finalPriority,
      },
    });
  }

  // Step 3: Determine routing action (first match wins)
  const { action: routingAction, rule: routingRule } =
    determineRoutingAction(input);
  reasoning.push(routingRule);

  return {
    routingAction,
    priorityLevel: finalPriority,
    reasoning,
  };
}
