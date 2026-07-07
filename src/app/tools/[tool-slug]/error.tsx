"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function ToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error reporter
    console.error("Tool execution failed:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[300px]">
      <div className="h-12 w-12 rounded-full bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 flex items-center justify-center">
        <AlertOctagon className="h-6 w-6 text-[var(--color-danger)] animate-pulse" />
      </div>
      <h3 className="text-lg font-bold text-white">Something went wrong in this tool</h3>
      <p className="text-[var(--color-fg-muted)] text-xs max-w-md leading-relaxed font-mono">
        {error.message || "An unexpected runtime error occurred inside this tool's environment."}
      </p>

      <button
        onClick={() => reset()}
        className="btn btn-accent-soft btn-md"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Restart Tool
      </button>
    </div>
  );
}
