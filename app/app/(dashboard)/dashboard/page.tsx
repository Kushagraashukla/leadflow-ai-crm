// Dashboard page — route: /dashboard
// Server Component: fetches live lead counts from Supabase for KPI cards.

import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | LeadFlow AI CRM",
  description: "Your sales pipeline overview",
};

interface KPIStat {
  label: string;
  value: number | string;
  sub?: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all leads for aggregate stats — single query, computed in JS.
  const { data: leads } = await supabase
    .from("leads")
    .select("status, deal_value")
    .eq("user_id", user.id);

  const safeLeads = leads ?? [];

  const total = safeLeads.length;
  const newLeads = safeLeads.filter((l) => l.status === "new").length;
  const qualified = safeLeads.filter((l) => l.status === "qualified").length;
  const won = safeLeads.filter((l) => l.status === "won").length;

  const pipelineValue = safeLeads
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((sum, l) => sum + (l.deal_value ?? 0), 0);

  const kpis: KPIStat[] = [
    { label: "Total Leads", value: total },
    { label: "New Leads", value: newLeads },
    { label: "Qualified", value: qualified },
    { label: "Won Deals", value: won },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your sales pipeline overview
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Pipeline value summary */}
      {total > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <p className="text-sm text-gray-500">Active Pipeline Value</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(pipelineValue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Excludes won and lost deals
          </p>
        </div>
      )}

      {/* Quick actions */}
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
