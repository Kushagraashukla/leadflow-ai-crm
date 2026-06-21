"use client";

import { useState, useTransition } from "react";
import { generateAISummary } from "@/src/features/ai-summary/actions/ai-summary.actions";
import type { AISummary } from "@/src/features/ai-summary/types/ai-summary.types";

interface AISummaryPanelProps {
  leadId: string;
  initialSummary: AISummary | null;
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

export default function AISummaryPanel({
  leadId,
  initialSummary,
}: AISummaryPanelProps) {
  const [summary, setSummary] = useState<AISummary | null>(initialSummary);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateAISummary(leadId);
      if (result.success) {
        setSummary(result.data);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <h2 className="text-sm font-medium text-gray-800">AI Summary</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            Llama 3.2 · Local
          </span>
        </div>

        {summary && !isPending && (
          <button
            onClick={handleGenerate}
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
          >
            Regenerate
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Loading */}
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="animate-spin h-4 w-4 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Generating summary… (may take 30–60s on first run)
          </div>
        )}

        {/* Error */}
        {!isPending && error && (
          <div className="space-y-2">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={handleGenerate}
              className="text-xs text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary */}
        {!isPending && !error && summary && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {summary.summary}
            </p>

            {summary.next_actions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Suggested Next Actions
                </p>
                <ol className="space-y-1.5">
                  {summary.next_actions.map((action, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-600">
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="text-xs text-gray-400 pt-1 border-t border-gray-50">
              Generated {formatDate(summary.generated_at)} ·{" "}
              {summary.model_version}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isPending && !error && !summary && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">
              Generate an AI-powered summary of this lead based on their notes.
            </p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              ✨ Generate Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
