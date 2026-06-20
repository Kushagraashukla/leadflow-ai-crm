// Edit lead page — route: /leads/[id]/edit
// Server Component: fetches existing lead data, pre-fills LeadForm.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById, updateLead } from "@/src/features/leads/actions/lead.actions";
import LeadForm from "@/src/features/leads/components/LeadForm";

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditLeadPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLeadById(id);
  return {
    title: lead ? `Edit ${lead.name} | LeadFlow AI CRM` : "Lead Not Found",
  };
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) notFound();

  // Bind the leadId into the updateLead Server Action.
  // updateLead's signature is: (leadId, prevState, formData)
  // .bind(null, lead.id) produces: (prevState, formData) — matching LeadForm's expected signature.
  const updateLeadWithId = updateLead.bind(null, lead.id);

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/leads" className="hover:text-gray-700">
          Leads
        </Link>
        <span className="mx-2">›</span>
        <Link href={`/leads/${lead.id}`} className="hover:text-gray-700">
          {lead.name}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Edit</span>
      </nav>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Edit Lead
      </h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <LeadForm
          action={updateLeadWithId}
          defaultValues={{
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            status: lead.status,
            deal_value: lead.deal_value,
          }}
          submitLabel="Save Changes"
          cancelHref={`/leads/${lead.id}`}
        />
      </div>
    </div>
  );
}
