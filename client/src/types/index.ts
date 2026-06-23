export interface Customer {
  id: number;
  name: string;
  accountNumber: string;
}

export interface FiredRule {
  ruleName: string;
  description: string;
  triggeredBy: Record<string, string | number>;
}

export interface TriageRecommendation {
  routingAction: string;
  priorityLevel: string;
  reasoning: FiredRule[];
}

export interface DisputeWithTriage {
  id: number;
  customer: Customer;
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
  triageRecommendation: TriageRecommendation;
}

export interface PaymentTypeEntry {
  type: string;
  issueCategories: string[];
}

export interface CreateDisputeRequest {
  customerId: number;
  paymentType: string;
  issueCategory: string;
  transactionAmount: number;
  transactionDate: string;
  transactionStatus: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, string>;
  };
}
