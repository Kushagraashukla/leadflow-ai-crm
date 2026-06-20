// Lead detail page — route: /leads/[id]
// Server Component: fetches lead data server-side, renders a read-only detail view.
// Includes edit + delete actions.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById } from "@/src/features/leads/actions/lead.actions";
import LeadStatusBadge from "@/src/features/leads/components/LeadStatusBadge";
import DeleteLeadButton from "@/src/features/leads/components/DeleteLeadButton";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LeadDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLeadById(id);
  return {
    title: lead ? `${lead.name} | LeadFlow AI CRM` : "Lead Not Found",
  };
}

function formatCurrency(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  // Triggers Next.js 404 page if lead doesn't exist or belongs to another user.
  if (!lead) notFound();

  const fields = [
    { label: "Email", value: lead.email ?? "—" },
    { label: "Phone", value: lead.phone ?? "—" },
    { label: "Company", value: lead.company ?? "—" },
    { label: "Deal Value", value: formatCurrency(lead.deal_value) },
    { label: "Created", value: formatDate(lead.created_at) },
    { label: "Last Updated", value: formatDate(lead.updated_at) },
  ];

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/leads" className="hover:text-gray-700">
          Leads
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{lead.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{lead.name}</h1>
          <div className="mt-2">
            <LeadStatusBadge status={lead.status} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/leads/${lead.id}/edit`}
            className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
        </div>
      </div>

      {/* Detail card */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {fields.map(({ label, value }) => (
          <div key={label} className="px-5 py-3.5 flex items-center gap-4">
            <dt className="text-sm font-medium text-gray-500 w-32 shrink-0">
              {label}
            </dt>
            <dd className="text-sm text-gray-900 break-all">{value}</dd>
          </div>
        ))}
      </div>

      {/* Placeholder for future Notes section */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-1">Notes</h2>
        <p className="text-sm text-gray-400">
          Notes management will be added in the next milestone.
        </p>
      </div>
    </div>
  );
}
