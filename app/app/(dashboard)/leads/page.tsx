// Leads list page — route: /leads
// Server Component: fetches all leads server-side, no client bundle cost.

import type { Metadata } from "next";
import Link from "next/link";
import { getLeads } from "@/src/features/leads/actions/lead.actions";
import LeadStatusBadge from "@/src/features/leads/components/LeadStatusBadge";
import { LEAD_STATUS_LABELS } from "@/src/features/leads/types/lead.types";

export const metadata: Metadata = {
  title: "Leads | LeadFlow AI CRM",
  description: "Manage your sales leads",
};

// Format a number as USD currency.
function formatCurrency(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// Format an ISO date string to a readable short date.
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function LeadsPage() {
  // Server-side data fetch — no useEffect, no loading spinner needed.
  const leads = await getLeads();

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            {leads.length} {leads.length === 1 ? "lead" : "leads"} total
          </p>
        </div>
        <Link
          href="/leads/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          + Add Lead
        </Link>
      </div>

      {/* Empty state */}
      {leads.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-medium text-gray-900 mb-1">No leads yet</h2>
          <p className="text-sm text-gray-500 mb-4">
            Get started by adding your first lead.
          </p>
          <Link
            href="/leads/new"
            className="inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Add First Lead
          </Link>
        </div>
      ) : (
        /* Leads table */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Company", "Status", "Deal Value", "Created", ""].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Name + email */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                      {lead.email && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {lead.email}
                        </div>
                      )}
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {lead.company ?? "—"}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>

                    {/* Deal value */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCurrency(lead.deal_value)}
                    </td>

                    {/* Created date */}
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(lead.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
