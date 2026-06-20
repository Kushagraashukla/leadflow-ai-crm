// Create lead page — route: /leads/new
// Server Component shell — the LeadForm is a Client Component.

import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/src/features/leads/components/LeadForm";
import { createLead } from "@/src/features/leads/actions/lead.actions";

export const metadata: Metadata = {
  title: "New Lead | LeadFlow AI CRM",
  description: "Add a new lead to your pipeline",
};

export default function NewLeadPage() {
  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/leads" className="hover:text-gray-700">
          Leads
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">New Lead</span>
      </nav>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add Lead</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/*
          createLead is passed directly — no .bind() needed for create mode
          because there is no pre-existing leadId to bind.
        */}
        <LeadForm action={createLead} submitLabel="Create Lead" />
      </div>
    </div>
  );
}
