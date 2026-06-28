export const APP_NAME = "Job Agent";
export const APP_PHASE = "Phase 1";

export type ServiceStatus = "ok";

export interface HealthPayload {
  service: string;
  status: ServiceStatus;
  version: string;
}
