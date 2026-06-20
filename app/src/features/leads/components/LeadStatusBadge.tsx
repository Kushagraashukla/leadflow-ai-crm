// LeadStatusBadge — displays a coloured pill for each lead status.
// Pure presentational component — no state, no data fetching.

import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  type LeadStatus,
} from "@/src/features/leads/types/lead.types";

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export default function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LEAD_STATUS_COLORS[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
