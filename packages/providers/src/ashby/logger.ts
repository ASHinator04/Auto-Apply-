import type { AshbyLoggingLevel } from "./configuration";

export interface AshbyLogger {
  error(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export const silentAshbyLogger: AshbyLogger = {
  error() {},
  info() {},
  debug() {},
};

export function createConsoleAshbyLogger(level: AshbyLoggingLevel): AshbyLogger {
  if (level === "silent") {
    return silentAshbyLogger;
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
