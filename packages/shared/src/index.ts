export const APP_NAME = "Job Agent";
export const APP_PHASE = "Phase 0B.2";

export type ServiceStatus = "ok";

export interface HealthPayload {
  service: string;
  status: ServiceStatus;
  version: string;
}
