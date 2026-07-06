"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2, Play, Image as ImageIcon } from "lucide-react";

export default function Base64Image() {
  const { data: session } = useSession();
  const [input, setInput] = useState("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%2300f0ff'/></svg>");
  const [previewUrl, setPreviewUrl] = useState("");
  const [sizeInfo, setSizeInfo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const decodeImage = () => {
    setError(null);
    if (!input.trim()) return;

    try {
      let src = input.trim();
      // If it doesn't start with data:, assume it's raw base64 and append png prefix
      if (!src.startsWith("data:")) {
        src = `data:image/png;base64,${src}`;
      }

      setPreviewUrl(src);
      
      // Estimate size
      const bytes = Math.round((src.length * 3) / 4);
      setSizeInfo(`${(bytes / 1024).toFixed(2)} KB`);
    } catch (err: any) {
      setError("Failed to resolve base64 image data.");
      setPreviewUrl("");
    }
  };

  const handleClear = () => {
    setInput("");
    setPreviewUrl("");
    setSizeInfo("");
    setError(null);
    setSaveStatus("idle");
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs to your dashboard.");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "base64-image",
          inputRef: JSON.stringify({ size: input.length }),
          outputRef: JSON.stringify({ sizeInfo }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "base64-image" }),
        });
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <button
          onClick={decodeImage}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          <Play className="h-3.5 w-3.5" />
          Decode Base64 to Image
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Clear
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!previewUrl || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Base64 Code String</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw Base64 string or data:image/png;base64,... URI"
            className="h-64 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Visual Image Preview</label>
          <div className="h-64 w-full rounded-xl border border-white/5 bg-slate-900/60 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {previewUrl ? (
              <div className="flex flex-col items-center space-y-3">
                <img
                  src={previewUrl}
                  alt="Decoded output"
                  className="max-h-40 max-w-full rounded-lg border border-white/10 shadow-lg object-contain bg-black/40"
                />
                <span className="text-[10px] font-mono text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded">
                  Estimated size: {sizeInfo}
                </span>
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <ImageIcon className="h-8 w-8 mx-auto text-slate-600" />
                <span className="text-[10px] font-mono block">Image preview will render here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
