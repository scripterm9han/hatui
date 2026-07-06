"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Trash2, Eye } from "lucide-react";

export default function HtmlPreview() {
  const { data: session } = useSession();
  const [html, setHtml] = useState(`<h2>Live HTML Preview Sandbox</h2>
<p>Write standard HTML or inline CSS style rules here!</p>
<button style="background: #00f0ff; color: black; border: 0; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer;">
  Click Me
</button>
`);
  const [srcDoc, setSrcDoc] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  useEffect(() => {
    const template = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              color: #f8fafc; 
              background-color: #0f172a; 
              margin: 16px; 
              line-height: 1.5;
            }
            h1, h2, h3 { color: #00f0ff; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
    setSrcDoc(template);
  }, [html]);

  const handleClear = () => {
    setHtml("");
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
          toolSlug: "html-preview",
          inputRef: JSON.stringify({ size: html.length }),
          outputRef: JSON.stringify({ isSaved: true }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "html-preview" }),
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Eye className="h-4 w-4 text-neon-cyan" />
            HTML Sandbox Editor
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!html.trim() || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Sandbox
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">HTML/CSS Code Editor</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="h-80 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Live Sandbox Frame</label>
          <div className="h-80 w-full rounded-xl border border-white/5 bg-slate-900 overflow-hidden shadow-inner relative">
            {srcDoc ? (
              <iframe
                title="HTML Preview Sandbox"
                srcDoc={srcDoc}
                className="w-full h-full border-0 bg-slate-950"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="text-slate-500 text-xs font-mono p-8 text-center">
                Sandbox viewport empty.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
