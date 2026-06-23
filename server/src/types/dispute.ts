export interface CreateDisputeRequest {
  customerId: number;
  paymentType: "Card Payment" | "EFT" | "Internal Transfer";
  issueCategory: string;
  transactionAmount: number;
  transactionDate: string;
  transactionStatus: "Completed" | "Failed" | "Pending";
}

export interface FiredRule {
  ruleName: string;
  description: string;
  triggeredBy: Record<string, string | number>;
}

export interface TriageInput {
  transactionAmount: number;
  transactionStatus: "Completed" | "Failed" | "Pending";
  issueCategory: string;
  disputeCreatedAt: Date;
}

export type RoutingAction =
  | "Resolve Immediately"
  | "Investigate Further"
  | "Escalate"
  | "Refer to Another Team";

export type PriorityLevel = "High" | "Medium" | "Low";

export interface TriageResult {
  routingAction: RoutingAction;
  priorityLevel: PriorityLevel;
  reasoning: FiredRule[];
}

export interface DisputeWithTriage {
  id: number;
  customer: {
    id: number;
    name: string;
    accountNumber: string;
  };
  paymentType: string;
  issueCategory: string;
  transaction: {
    amount: number;
    date: string;
    status: string;
    reference: string;
  };
  status: string;
  createdAt: string;
  triageRecommendation: {
    routingAction: string;
    priorityLevel: string;
    reasoning: FiredRule[];
  };
}

export interface PaymentTypeEntry {
  type: string;
  issueCategories: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
