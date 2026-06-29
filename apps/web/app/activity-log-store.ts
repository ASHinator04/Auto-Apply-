export type ActivityLevel = "info" | "success" | "error";

export interface ActivityEntry {
  id: string;
  area: "app" | "knowledge" | "resume" | "api";
  detail?: string;
  level: ActivityLevel;
  message: string;
  timestamp: string;
}

const MAX_ENTRIES = 200;

let entries: ActivityEntry[] = [
  {
    id: crypto.randomUUID(),
    area: "app",
    level: "info",
    message: "Dashboard ready.",
    detail: "Client-side activity logger is active.",
    timestamp: new Date().toISOString(),
  },
];

const listeners = new Set<() => void>();

export function subscribeToActivityLog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActivityEntries(): ActivityEntry[] {
  return entries;
}

export function recordActivity(input: Omit<ActivityEntry, "id" | "timestamp">): ActivityEntry {
  const entry: ActivityEntry = {
    ...input,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  entries = [...entries, entry].slice(-MAX_ENTRIES);
  emitChange();
  return entry;
}

export function clearActivityEntries(): void {
  entries = [];
  emitChange();
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}
