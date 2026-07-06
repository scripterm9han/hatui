"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Check, Clipboard, AlertTriangle, FileText, Upload, Save, HelpCircle, RefreshCw, FileCheck } from "lucide-react";
import { AtsAnalysisResult } from "@/lib/ai";

export default function ResumeChecker() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [inputType, setInputType] = useState<"file" | "text">("file");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 4 * 1024 * 1024) {
        setError("File size exceeds 4MB limit.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("Please sign in first to analyze your resume.");
      signIn();
      return;
    }

    if (inputType === "file" && !file) {
      setError("Please select a file to upload.");
      return;
    }
    if (inputType === "text" && !text.trim()) {
      setError("Please paste your resume text.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveStatus("idle");

    const formData = new FormData();
    if (inputType === "file" && file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    try {
      const res = await fetch("/api/tools/resume-checker", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze resume.");
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOutput = async () => {
    if (!session) return;
    if (!result) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "resume-checker",
          inputRef: JSON.stringify({
            fileName: file?.name || "pasted_text.txt",
            inputType,
            textExcerpt: text ? text.substring(0, 500) + "..." : "File Upload",
          }),
          outputRef: JSON.stringify(result),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setText("");
    setResult(null);
    setError(null);
    setSaveStatus("idle");
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Type Selector */}
          <div className="flex border-b border-white/5 pb-0.5">
            <button
              type="button"
              onClick={() => setInputType("file")}
              className={`px-4 py-2 border-b-2 font-mono text-xs uppercase tracking-wider transition-all ${
                inputType === "file"
                  ? "border-neon-cyan text-neon-cyan font-bold"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Upload PDF/DOCX
            </button>
            <button
              type="button"
              onClick={() => setInputType("text")}
              className={`px-4 py-2 border-b-2 font-mono text-xs uppercase tracking-wider transition-all ${
                inputType === "text"
                  ? "border-neon-cyan text-neon-cyan font-bold"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Paste Resume Text
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          {inputType === "file" ? (
            <div className="border-2 border-dashed border-slate-800 rounded-2xl hover:border-neon-cyan/40 hover:bg-neon-cyan/5 transition-all p-8 flex flex-col items-center justify-center cursor-pointer relative group">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-10 w-10 text-slate-500 group-hover:text-neon-cyan transition-colors mb-3" />
              <p className="text-white font-medium text-sm text-center">
                {file ? file.name : "Drag & drop your resume, or browse"}
              </p>
              <p className="text-slate-500 text-xs mt-1 text-center">
                Supports PDF, DOCX, or TXT (Max 4MB)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Paste Resume Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full text of your resume here..."
                className="h-[300px] w-full p-4 rounded-xl mono-input text-sm resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-neon-cyan text-black hover:bg-neon-cyan/85 font-bold transition-all text-sm font-mono shadow-[0_0_20px_rgba(0,240,255,0.2)] disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing ATS Compatibility...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                Analyze Resume Score
              </>
            )}
          </button>
        </form>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-semibold text-white font-sans flex items-center gap-2">
              <FileText className="h-5 w-5 text-neon-cyan" />
              ATS Scorecard Results
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono"
              >
                Scan Another
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                Copy Report
              </button>
              <button
                onClick={handleSaveOutput}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
              >
                <Save className="h-3.5 w-3.5" />
                {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Report"}
              </button>
            </div>
          </div>

          {/* Scores Overview Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl border border-border-card p-6 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#00f0ff"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * result.score) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xl font-bold font-mono text-white">{result.score}%</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-300">Overall ATS Score</h4>
            </div>

            <div className="glass-card rounded-xl border border-border-card p-6 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#8b5cf6"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * result.formatScore) / 100}
                  />
                </svg>
                <span className="absolute text-xl font-bold font-mono text-white">{result.formatScore}%</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-300">Layout & Format</h4>
            </div>

            <div className="glass-card rounded-xl border border-border-card p-6 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * result.keywordScore) / 100}
                  />
                </svg>
                <span className="absolute text-xl font-bold font-mono text-white">{result.keywordScore}%</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-300">Keyword Density</h4>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="glass-card rounded-xl border border-border-card p-6 space-y-4">
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-green-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {result.analysis.strengths.map((str, i) => (
                  <li key={i} className="text-slate-300 text-xs leading-relaxed flex items-start gap-2">
                    <span className="text-green-500 font-bold mt-0.5">•</span>
                    {str}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="glass-card rounded-xl border border-border-card p-6 space-y-4">
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Weaknesses
              </h4>
              <ul className="space-y-2">
                {result.analysis.weaknesses.map((weak, i) => (
                  <li key={i} className="text-slate-300 text-xs leading-relaxed flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    {weak}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="glass-card rounded-xl border border-border-card p-6 space-y-4">
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-neon-cyan flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Action Items
              </h4>
              <ul className="space-y-2">
                {result.analysis.improvements.map((imp, i) => (
                  <li key={i} className="text-slate-300 text-xs leading-relaxed flex items-start gap-2">
                    <span className="text-neon-cyan font-bold mt-0.5">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
