import React from "react";
import { BookOpenText } from "lucide-react";

export function EmptyKnowledgeState() {
  return (
    <section className="border border-slate-200 bg-white p-6 text-sm text-slate-600">
      <div className="flex items-start gap-3">
        <BookOpenText aria-hidden="true" className="mt-1 h-5 w-5 text-sky-700" />
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Add your first profile detail</h2>
          <p className="mt-1 max-w-2xl leading-6">
            Store short details and reusable long-form answers in organized sections. Everything is
            saved locally through the API.
          </p>
        </div>
      </div>
    </section>
  );
}
