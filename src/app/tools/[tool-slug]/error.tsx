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
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 font-sans min-h-[300px]">
      <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <AlertOctagon className="h-6 w-6 text-red-500 animate-pulse" />
      </div>
      <h3 className="text-lg font-bold text-white">Something went wrong in this tool</h3>
      <p className="text-slate-400 text-xs max-w-md leading-relaxed font-mono">
        {error.message || "An unexpected runtime error occurred inside this tool's environment."}
      </p>
      
      <button
        onClick={() => reset()}
        className="flex items-center gap-1.5 px-4 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Restart Tool
      </button>
    </div>
  );
}
