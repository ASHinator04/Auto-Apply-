import { RotateCcw } from "lucide-react";
import React from "react";

export function SearchErrorState({
  message,
  onRetry,
  panelRef,
}: {
  message: string;
  onRetry: () => void;
  panelRef?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      aria-live="polite"
      className="flex flex-col gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
      data-testid="search-error-state"
      ref={panelRef}
      tabIndex={-1}
    >
      <span>{message}</span>
      <button
        className="inline-flex items-center justify-center gap-2 border border-red-200 bg-white px-3 py-2 font-semibold text-red-700"
        data-testid="search-retry"
        onClick={onRetry}
        type="button"
      >
        <RotateCcw aria-hidden="true" className="h-4 w-4" />
        Retry
      </button>
    </section>
  );
}
