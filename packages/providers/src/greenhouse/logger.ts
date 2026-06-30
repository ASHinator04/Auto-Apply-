import type { GreenhouseLoggingLevel } from "./configuration";

export interface GreenhouseLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export const silentGreenhouseLogger: GreenhouseLogger = {
  debug() {},
  info() {},
  error() {},
};

export function createConsoleGreenhouseLogger(level: GreenhouseLoggingLevel): GreenhouseLogger {
  if (level === "silent") {
    return silentGreenhouseLogger;
  }

  return {
    debug(message, context) {
      if (level === "debug") {
        console.debug(message, context);
      }
    },
    info(message, context) {
      if (level === "debug" || level === "info") {
        console.info(message, context);
      }
    },
    error(message, context) {
      console.error(message, context);
    },
  };
}
