"use client";

import { Clock3, PanelRightClose, PanelRightOpen, Trash2 } from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  clearActivityEntries,
  getActivityEntries,
  subscribeToActivityLog,
  type ActivityEntry,
} from "./activity-log-store";

const SERVER_ACTIVITY_ENTRIES: ActivityEntry[] = [];

export function ActivityLogPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const entries = useSyncExternalStore(
    subscribeToActivityLog,
    getActivityEntries,
    getServerActivityEntries,
  );

  return (
    <aside
      className={`app-panel sticky top-6 h-[calc(100vh-4rem)] overflow-hidden transition-all duration-300 ${
        isOpen ? "w-full max-w-sm" : "w-auto"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/70 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-full bg-slate-900/90 p-2 text-white shadow-sm">
              <Clock3 aria-hidden="true" className="h-4 w-4" />
            </div>
            {isOpen ? (
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-950">Activity Log</h2>
                <p className="truncate text-xs text-slate-500">Client-side actions and API steps</p>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {isOpen ? (
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600"
                onClick={clearActivityEntries}
                type="button"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Clear activity log</span>
              </button>
            ) : null}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600"
              onClick={onToggle}
              type="button"
            >
              {isOpen ? (
                <PanelRightClose aria-hidden="true" className="h-4 w-4" />
              ) : (
                <PanelRightOpen aria-hidden="true" className="h-4 w-4" />
              )}
              <span className="sr-only">{isOpen ? "Hide activity log" : "Show activity log"}</span>
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {entries.length === 0 ? (
              <p className="text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {[...entries].reverse().map((entry) => (
                  <li
                    className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm"
                    key={entry.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${levelClassName(
                          entry,
                        )}`}
                      >
                        {entry.area}
                      </span>
                      <time className="text-[11px] text-slate-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </time>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900">{entry.message}</p>
                    {entry.detail ? (
                      <p className="mt-1 text-xs leading-5 text-slate-500">{entry.detail}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function getServerActivityEntries(): ActivityEntry[] {
  return SERVER_ACTIVITY_ENTRIES;
}

function levelClassName(entry: ActivityEntry): string {
  if (entry.level === "success") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (entry.level === "error") {
    return "bg-red-100 text-red-700";
  }
  return "bg-slate-100 text-slate-700";
}
