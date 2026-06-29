"use client";

import { BookOpenText, FileText } from "lucide-react";
import { useState } from "react";

import { KnowledgeBaseDashboard } from "./knowledge-base-dashboard";
import { ResumeDashboard } from "./resume-dashboard";

type DashboardTab = "knowledge" | "resumes";

export function AppDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("knowledge");

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3" aria-label="Dashboard">
          <TabButton
            active={activeTab === "knowledge"}
            icon={<BookOpenText aria-hidden="true" className="h-4 w-4" />}
            label="Knowledge Base"
            onClick={() => setActiveTab("knowledge")}
          />
          <TabButton
            active={activeTab === "resumes"}
            icon={<FileText aria-hidden="true" className="h-4 w-4" />}
            label="Resumes"
            onClick={() => setActiveTab("resumes")}
          />
        </nav>
        {activeTab === "knowledge" ? <KnowledgeBaseDashboard /> : <ResumeDashboard />}
      </div>
    </main>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold ${
        active ? "border-sky-700 bg-sky-700 text-white" : "border-slate-300 bg-white text-slate-700"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
