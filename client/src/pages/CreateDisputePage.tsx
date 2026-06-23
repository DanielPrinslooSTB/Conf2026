import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchCustomers,
  fetchPaymentTypes,
  createDispute,
} from "../services/api";
import type {
  Customer,
  PaymentTypeEntry,
  ApiError,
} from "../types/index";

export function CreateDisputePage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Form state
  const [customerId, setCustomerId] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchPaymentTypes()])
      .then(([c, pt]) => {
        setCustomers(c);
        setPaymentTypes(pt);
      })
      .catch(() => setServerError("Failed to load form data."))
      .finally(() => setLoading(false));
  }, []);

  // Get valid issue categories for selected payment type
  const issueCategories =
    paymentTypes.find((pt) => pt.type === paymentType)?.issueCategories || [];

  // Reset issue category when payment type changes
  const handlePaymentTypeChange = (value: string) => {
    setPaymentType(value);
    setIssueCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSubmitting(true);

    try {
      const dispute = await createDispute({
        customerId: parseInt(customerId, 10),
        paymentType,
        issueCategory,
        transactionAmount: parseFloat(transactionAmount),
        transactionDate,
        transactionStatus,
      });

      navigate(`/disputes/${dispute.id}`);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr?.error?.details) {
        setErrors(apiErr.error.details);
      } else if (apiErr?.error?.message) {
        setServerError(apiErr.error.message);
      } else {
        setServerError("Failed to create dispute. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="text-brand-blue-800 hover:text-brand-blue-600 text-sm font-medium"
        >
          ← Back to Disputes
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Dispute
      </h1>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-5"
      >
        {/* Customer */}
        <div>
          <label
            htmlFor="customerId"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Customer
          </label>
          <select
            id="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-brand-blue-800 focus:ring-2 focus:ring-brand-blue-600/20 outline-none text-sm"
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.accountNumber})
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>
          )}
        </div>

        {/* Payment Type */}
        <div>
          <label
            htmlFor="paymentType"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Payment Type
          </label>
          <select
            id="paymentType"
            value={paymentType}
            onChange={(e) => handlePaymentTypeChange(e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-brand-blue-800 focus:ring-2 focus:ring-brand-blue-600/20 outline-none text-sm"
          >
            <option value="">Select payment type</option>
            {paymentTypes.map((pt) => (
              <option key={pt.type} value={pt.type}>
                {pt.type}
              </option>
            ))}
          </select>
          {errors.paymentType && (
            <p className="mt-1 text-xs text-red-600">{errors.paymentType}</p>
          )}
        </div>

        {/* Issue Category */}
        <div>
          <label
            htmlFor="issueCategory"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Issue Category
          </label>
          <select
            id="issueCategory"
            value={issueCategory}
            onChange={(e) => setIssueCategory(e.target.value)}
            disabled={!paymentType}
            className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-brand-blue-800 focus:ring-2 focus:ring-brand-blue-600/20 outline-none text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">
              {paymentType
                ? "Select issue category"
                : "Select a payment type first"}
            </option>
            {issueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.issueCategory && (
            <p className="mt-1 text-xs text-red-600">{errors.issueCategory}</p>
          )}
        </div>

        {/* Transaction Amount */}
        <div>
          <label
            htmlFor="transactionAmount"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Transaction Amount (ZAR)
          </label>
          <input
            id="transactionAmount"
            type="number"
            step="0.01"
            min="0.01"
            value={transactionAmount}
            onChange={(e) => setTransactionAmount(e.target.value)}
            placeholder="e.g. 1500.00"
            className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-brand-blue-800 focus:ring-2 focus:ring-brand-blue-600/20 outline-none text-sm"
          />
          {errors.transactionAmount && (
            <p className="mt-1 text-xs text-red-600">
              {errors.transactionAmount}
            </p>
          )}
        </div>

        {/* Transaction Date */}
        <div>
          <label
            htmlFor="transactionDate"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Transaction Date
          </label>
          <input
            id="transactionDate"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-brand-blue-800 focus:ring-2 focus:ring-brand-blue-600/20 outline-none text-sm"
          />
          {errors.transactionDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.transactionDate}
            </p>
          )}
        </div>

        {/* Transaction Status */}
        <div>
          <label
            htmlFor="transactionStatus"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Transaction Status
          </label>
          <select
            id="transactionStatus"
            value={transactionStatus}
            onChange={(e) => setTransactionStatus(e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-brand-blue-800 focus:ring-2 focus:ring-brand-blue-600/20 outline-none text-sm"
          >
            <option value="">Select status</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>
          {errors.transactionStatus && (
            <p className="mt-1 text-xs text-red-600">
              {errors.transactionStatus}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-blue-800 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-brand-blue-600 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Dispute"}
        </button>
      </form>
    </div>
  );
}
