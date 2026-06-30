import type { LeverLoggingLevel } from "./configuration";

export interface LeverLogger {
  error(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export const silentLeverLogger: LeverLogger = {
  error() {},
  info() {},
  debug() {},
};

export function createConsoleLeverLogger(level: LeverLoggingLevel): LeverLogger {
  if (level === "silent") {
    return silentLeverLogger;
  }

  return {
    error(message, context) {
      if (["error", "info", "debug"].includes(level)) {
        console.error(message, context ?? {});
      }
    },
    info(message, context) {
      if (["info", "debug"].includes(level)) {
        console.info(message, context ?? {});
      }
    },
    debug(message, context) {
      if (level === "debug") {
        console.debug(message, context ?? {});
      }
    },
  };
}
