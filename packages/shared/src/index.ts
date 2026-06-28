export const APP_NAME = "Job Agent";
export const APP_PHASE = "Phase 0 Complete";

export type ServiceStatus = "ok";

export interface HealthPayload {
  service: string;
  status: ServiceStatus;
  version: string;
}
