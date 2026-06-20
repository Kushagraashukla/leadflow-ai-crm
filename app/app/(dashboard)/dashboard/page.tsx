// Dashboard page — route: /dashboard
// Server Component.
//
// Current state: static placeholder — confirms the route renders correctly.
// Next milestones will add:
//   - Real KPI cards (total leads, won, lost, pipeline value)
//   - Lead activity feed
//   - Server-side data fetching via Supabase

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | LeadFlow AI CRM",
  description: "Your sales pipeline overview",
};

export default function DashboardPage() {
  return (
    <div>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your sales pipeline overview
        </p>
      </div>

      {/*
        KPI card placeholders — replaced with real data components
        in the Dashboard milestone.
      */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Total Leads", value: "—" },
          { label: "New Leads", value: "—" },
          { label: "Qualified", value: "—" },
          { label: "Won Deals", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Route confirmation banner — remove once real content is added */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          ✅ Dashboard route is working. Authentication and real data will be
          connected in the next milestone.
        </p>
      </div>
    </div>
  );
}
