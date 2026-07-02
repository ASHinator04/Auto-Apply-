import { WorkMode } from "@job-agent/contracts";

import type { BrowserJob } from "./job-browser-types";

export function formatLocations(job: BrowserJob): string {
  const locations = job.locations.map((location) => location.label).filter(Boolean);
  return locations.length > 0 ? locations.join(", ") : "Not listed";
}

export function formatDate(value: string | undefined): string {
  if (!value) {
    return "Not listed";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not listed";
  }
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export function formatOptional(value: string | undefined): string {
  return value ? value : "Not listed";
}

export function formatWorkMode(job: BrowserJob): string {
  if (job.workMode === WorkMode.Remote || job.locations.some((location) => location.remote)) {
    return "Remote";
  }
  if (job.workMode === WorkMode.Hybrid) {
    return "Hybrid";
  }
  if (job.workMode === WorkMode.Onsite) {
    return "On-site";
  }
  return "Not listed";
}

export function formatCompensation(job: BrowserJob): string {
  const compensation = job.compensation;
  if (!compensation) {
    return "Not listed";
  }
  if (compensation.summary) {
    return compensation.summary;
  }
  if (compensation.minAmount !== undefined && compensation.maxAmount !== undefined) {
    const currency = compensation.currency ? `${compensation.currency} ` : "";
    const interval = compensation.interval ? ` / ${compensation.interval}` : "";
    return `${currency}${compensation.minAmount} - ${compensation.maxAmount}${interval}`;
  }
  if (compensation.minAmount !== undefined) {
    const currency = compensation.currency ? `${compensation.currency} ` : "";
    const interval = compensation.interval ? ` / ${compensation.interval}` : "";
    return `${currency}${compensation.minAmount}+${interval}`;
  }
  if (compensation.maxAmount !== undefined) {
    const currency = compensation.currency ? `${compensation.currency} ` : "";
    const interval = compensation.interval ? ` / ${compensation.interval}` : "";
    return `Up to ${currency}${compensation.maxAmount}${interval}`;
  }
  return "Not listed";
}
