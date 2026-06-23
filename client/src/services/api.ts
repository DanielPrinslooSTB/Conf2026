import type {
  DisputeWithTriage,
  PaymentTypeEntry,
  Customer,
  CreateDisputeRequest,
  ApiError,
} from "../types/index.js";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json()) as ApiError;
    throw errorBody;
  }
  return response.json() as Promise<T>;
}

export async function fetchDisputes(): Promise<DisputeWithTriage[]> {
  const response = await fetch(`${API_BASE}/disputes`);
  return handleResponse<DisputeWithTriage[]>(response);
}

export async function fetchDispute(id: number): Promise<DisputeWithTriage> {
  const response = await fetch(`${API_BASE}/disputes/${id}`);
  return handleResponse<DisputeWithTriage>(response);
}

export async function createDispute(
  data: CreateDisputeRequest
): Promise<DisputeWithTriage> {
  const response = await fetch(`${API_BASE}/disputes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<DisputeWithTriage>(response);
}

export async function fetchPaymentTypes(): Promise<PaymentTypeEntry[]> {
  const response = await fetch(`${API_BASE}/payment-types`);
  return handleResponse<PaymentTypeEntry[]>(response);
}

export async function fetchCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_BASE}/customers`);
  return handleResponse<Customer[]>(response);
}
