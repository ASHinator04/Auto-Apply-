"use client";

import { BookOpenText, FileText, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ActivityLogPanel } from "./activity-log-panel";
import { recordActivity } from "./activity-log-store";
import { KnowledgeBaseDashboard } from "./knowledge-base-dashboard";
import { ResumeDashboard } from "./resume-dashboard";

type DashboardTab = "knowledge" | "resumes";

export function AppDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("knowledge");
  const [isLogOpen, setIsLogOpen] = useState(true);
  const didRecordReady = useRef(false);

  useEffect(() => {
    if (didRecordReady.current) {
      return;
    }
    didRecordReady.current = true;
    recordActivity({
      area: "app",
      level: "info",
      message: "Dashboard ready.",
      detail: "Client-side activity logger is active.",
    });
  }, []);

  function selectTab(nextTab: DashboardTab) {
    setActiveTab(nextTab);
    recordActivity({
      area: "app",
      level: "info",
      message: `Switched to ${nextTab === "knowledge" ? "Knowledge Base" : "Resumes"}.`,
    });
  }

  return (
    <main className="app-shell min-h-screen px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1480px] gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <section className="app-panel overflow-hidden">
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                  <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                  Development Workspace
                </p>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Job Agent
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    A local-first workspace for candidate information, reusable application answers,
                    and resume management while the product is still being shaped.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <TabButton
                  active={activeTab === "knowledge"}
                  icon={<BookOpenText aria-hidden="true" className="h-4 w-4" />}
                  label="Knowledge Base"
                  onClick={() => selectTab("knowledge")}
                />
                <TabButton
                  active={activeTab === "resumes"}
                  icon={<FileText aria-hidden="true" className="h-4 w-4" />}
                  label="Resumes"
                  onClick={() => selectTab("resumes")}
                />
              </div>
            </div>
          </section>

          <section className="app-panel px-6 py-6">
            {activeTab === "knowledge" ? <KnowledgeBaseDashboard /> : <ResumeDashboard />}
          </section>
        </div>

        <ActivityLogPanel
          isOpen={isLogOpen}
          onToggle={() => {
            const nextOpen = !isLogOpen;
            setIsLogOpen(nextOpen);
            recordActivity({
              area: "app",
              level: "info",
              message: `${nextOpen ? "Opened" : "Collapsed"} activity log.`,
            });
          }}
        />
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
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-white/80 bg-white/90 text-slate-700"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
