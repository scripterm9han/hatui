"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Check, Clipboard, Flame, Trash2, Upload, Save, RefreshCw, AlertCircle } from "lucide-react";

export default function ResumeRoaster() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roast, setRoast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [inputType, setInputType] = useState<"file" | "text">("file");

  // Playful loading texts to show during roasting
  const [loadingText, setLoadingText] = useState("Fueling the fire...");
  const loadingPhrases = [
    "Fueling the fire...",
    "Analyzing your visual atrocities...",
    "Calculating buzzword saturation...",
    "Finding spelling mistakes to laugh at...",
    "Judging your career choices...",
    "Consulting the senior developers...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % loadingPhrases.length;
        setLoadingText(loadingPhrases[idx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
      setError("Authentication required. Please sign in to roast your resume.");
      signIn();
      return;
    }

    if (inputType === "file" && !file) {
      setError("Please select a resume file.");
      return;
    }
    if (inputType === "text" && !text.trim()) {
      setError("Please paste your resume content.");
      return;
    }

    setLoading(true);
    setError(null);
    setRoast(null);
    setSaveStatus("idle");

    const formData = new FormData();
    if (inputType === "file" && file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    try {
      const res = await fetch("/api/tools/resume-roaster", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to roast your resume.");
      }

      setRoast(json.roast);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!roast) return;
    try {
      await navigator.clipboard.writeText(roast);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOutput = async () => {
    if (!session) return;
    if (!roast) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "resume-roaster",
          inputRef: JSON.stringify({
            fileName: file?.name || "pasted_text.txt",
            inputType,
            textExcerpt: text ? text.substring(0, 500) + "..." : "File Upload",
          }),
          outputRef: JSON.stringify({ roast }),
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
    setRoast(null);
    setError(null);
    setSaveStatus("idle");
  };

  // Safe and clean parser of markdown headings, bullets, and bold markers
  const parseRoastMarkdown = (md: string) => {
    const lines = md.split("\n");
    return lines.map((line, i) => {
      const clean = line.trim();
      if (clean.startsWith("# ")) {
        return (
          <h1 key={i} className="text-2xl font-bold text-neon-cyan mt-6 mb-3 font-sans border-b border-white/5 pb-2">
            {clean.slice(2)}
          </h1>
        );
      }
      if (clean.startsWith("## ")) {
        return (
          <h2 key={i} className="text-lg font-bold text-neon-violet mt-5 mb-2 font-sans">
            {clean.slice(3)}
          </h2>
        );
      }
      if (clean.startsWith("### ")) {
        return (
          <h3 key={i} className="text-base font-bold text-white mt-4 mb-2 font-sans">
            {clean.slice(4)}
          </h3>
        );
      }
      if (clean.startsWith("- ") || clean.startsWith("* ")) {
        const content = clean.slice(2);
        return (
          <li
            key={i}
            className="text-slate-300 text-xs ml-4 list-disc leading-relaxed my-1.5"
            dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-bold'>$1</strong>") }}
          />
        );
      }
      if (clean === "") {
        return <div key={i} className="h-2" />;
      }
      return (
        <p
          key={i}
          className="text-slate-300 text-xs leading-relaxed my-2"
          dangerouslySetInnerHTML={{ __html: clean.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-bold'>$1</strong>") }}
        />
      );
    });
  };

  return (
    <div className="space-y-6">
      {!roast ? (
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
              Upload Resume File
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
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {inputType === "file" ? (
            <div className="border-2 border-dashed border-slate-800 rounded-2xl hover:border-neon-violet/40 hover:bg-neon-violet/5 transition-all p-8 flex flex-col items-center justify-center cursor-pointer relative group">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Flame className="h-10 w-10 text-slate-500 group-hover:text-neon-violet transition-colors mb-3 animate-pulse" />
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
                placeholder="Paste your full resume text here to roast..."
                className="h-[300px] w-full p-4 rounded-xl mono-input text-sm resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-neon-violet text-white hover:bg-neon-violet/85 font-bold transition-all text-sm font-mono shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {loadingText}
              </>
            ) : (
              <>
                <Flame className="h-4 w-4 text-orange-400" />
                Roast My Resume!
              </>
            )}
          </button>
        </form>
      ) : (
        /* Roasted Output Display */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-semibold text-white font-sans flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500 animate-bounce" />
              Your Roasted Resume
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-violet/40 hover:bg-neon-violet/10 text-slate-400 hover:text-neon-violet transition-all text-xs font-mono"
              >
                Roast Another
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-violet/40 hover:bg-neon-violet/10 text-slate-400 hover:text-neon-violet transition-all text-xs font-mono"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                Copy Roast
              </button>
              <button
                onClick={handleSaveOutput}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-violet/10 border border-neon-violet/30 text-neon-violet hover:bg-neon-violet/20 transition-all text-xs font-mono"
              >
                <Save className="h-3.5 w-3.5" />
                {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Roast"}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-xl border border-red-500/10 bg-red-950/10 p-8 shadow-[0_0_30px_rgba(239,68,68,0.02)] max-h-[600px] overflow-y-auto pr-4">
            <div className="space-y-1">
              {parseRoastMarkdown(roast)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
