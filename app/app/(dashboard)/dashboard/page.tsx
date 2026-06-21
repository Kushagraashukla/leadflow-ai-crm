// Dashboard page — route: /dashboard
// Server Component: fetches live lead counts and pipeline data from Supabase.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, type LeadStatus } from "@/src/features/leads/types/lead.types";

export const metadata: Metadata = {
  title: "Dashboard | LeadFlow AI CRM",
  description: "Your sales pipeline overview",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Single query — fetch status + deal_value for all aggregations.
  const { data: leads } = await supabase
    .from("leads")
    .select("status, deal_value")
    .eq("user_id", user.id);

  const safeLeads = leads ?? [];

  // ── Aggregate KPIs ────────────────────────────────────────────────────────
  const total      = safeLeads.length;
  const newLeads   = safeLeads.filter((l) => l.status === "new").length;
  const qualified  = safeLeads.filter((l) => l.status === "qualified").length;
  const won        = safeLeads.filter((l) => l.status === "won").length;
  const lost       = safeLeads.filter((l) => l.status === "lost").length;

  // Pipeline value = sum of deal_value for all non-won, non-lost leads
  const pipelineValue = safeLeads
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((sum, l) => sum + (l.deal_value ?? 0), 0);

  // ── Per-status breakdown for the analytics table ──────────────────────────
  const allStatuses: LeadStatus[] = [
    "new", "contacted", "qualified", "proposal_sent", "won", "lost",
  ];

  const statusBreakdown = allStatuses.map((status) => {
    const statusLeads = safeLeads.filter((l) => l.status === status);
    const count = statusLeads.length;
    const value = statusLeads.reduce((sum, l) => sum + (l.deal_value ?? 0), 0);
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { status, count, value, pct };
  });

  const kpis = [
    { label: "Total Leads",    value: total },
    { label: "New Leads",      value: newLeads },
    { label: "Qualified",      value: qualified },
    { label: "Won Deals",      value: won },
    { label: "Lost Deals",     value: lost },
    { label: "Pipeline Value", value: formatCurrency(pipelineValue), isWide: true },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Your sales pipeline overview</p>
      </div>

      {/* KPI cards — 3 columns on md, 3+3 layout */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-4">
        {kpis.slice(0, 5).map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{kpi.label}</p>
            <p className="mt-1.5 text-3xl font-semibold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline value — full width card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Active Pipeline Value</p>
        <p className="mt-1.5 text-3xl font-semibold text-gray-900">
          {formatCurrency(pipelineValue)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Excludes won and lost deals</p>
      </div>

      {/* Pipeline breakdown table */}
      {total > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-800">Pipeline Breakdown</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Status", "Leads", "% of Total", "Deal Value"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statusBreakdown.map(({ status, count, value, pct }) => (
                <tr key={status} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LEAD_STATUS_COLORS[status]}`}
                    >
                      {LEAD_STATUS_LABELS[status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">{count}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">
                    {value > 0 ? formatCurrency(value) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state + quick actions */}
      {total === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center mb-6">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-lg font-medium text-gray-900 mb-1">No data yet</h2>
          <p className="text-sm text-gray-500 mb-4">
            Add your first lead to see pipeline analytics.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/leads"
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          View All Leads
        </Link>
        <Link
          href="/leads/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          + Add Lead
        </Link>
      </div>
    </div>
  );
}
