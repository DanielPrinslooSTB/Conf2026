import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchDispute } from "../services/api";
import { PriorityBadge } from "../components/PriorityBadge";
import { RoutingActionBadge } from "../components/RoutingActionBadge";
import type { DisputeWithTriage } from "../types/index";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dispute, setDispute] = useState<DisputeWithTriage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchDispute(parseInt(id, 10))
      .then(setDispute)
      .catch((err) => {
        if (err?.error?.code === "NOT_FOUND") {
          setError(
            "Dispute not found. It may have been deleted."
          );
        } else {
          setError("Unable to load dispute details. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg h-64 animate-pulse" />
          <div className="bg-white border border-gray-200 rounded-lg h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          {error || "Dispute not found."}
        </p>
        <Link
          to="/"
          className="text-brand-blue-800 hover:text-brand-blue-600 text-sm font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-brand-blue-800 hover:text-brand-blue-600 text-sm font-medium"
        >
          ← Back to Disputes
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-800">
        Dispute #{dispute.id}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispute Info Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Dispute Details
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Customer</dt>
              <dd className="text-sm text-gray-800 font-medium">
                {dispute.customer.name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Payment Type</dt>
              <dd className="text-sm text-gray-800">{dispute.paymentType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Issue Category</dt>
              <dd className="text-sm text-gray-800">
                {dispute.issueCategory}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Transaction Amount</dt>
              <dd className="text-sm text-gray-800 font-medium">
                {formatCurrency(dispute.transaction.amount)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Transaction Date</dt>
              <dd className="text-sm text-gray-800">
                {formatDate(dispute.transaction.date)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Transaction Status</dt>
              <dd className="text-sm text-gray-800">
                {dispute.transaction.status}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Dispute Created</dt>
              <dd className="text-sm text-gray-800">
                {formatDate(dispute.createdAt)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Triage Recommendation Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Triage Recommendation
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RoutingActionBadge
                action={dispute.triageRecommendation.routingAction}
              />
              <PriorityBadge
                level={dispute.triageRecommendation.priorityLevel}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                Reasoning
              </h3>
              <ul className="space-y-3">
                {dispute.triageRecommendation.reasoning.map((rule, index) => (
                  <li
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-md p-3"
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {rule.ruleName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {rule.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(rule.triggeredBy).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-xs text-gray-700"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
