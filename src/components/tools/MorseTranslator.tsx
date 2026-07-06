"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, RefreshCw, Save, Trash2 } from "lucide-react";

const MORSE_MAP: Record<string, string> = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....",
  i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.",
  q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-",
  y: "-.--", z: "--..", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----",
  " ": "/"
};

const REVERSE_MAP: Record<string, string> = Object.entries(MORSE_MAP).reduce(
  (acc, [key, val]) => {
    acc[val] = key;
    return acc;
  },
  {} as Record<string, string>
);

export default function MorseTranslator() {
  const { data: session } = useSession();
  const [input, setInput] = useState("hello world");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"text2morse" | "morse2text">("text2morse");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const translateTextToMorse = (text: string) => {
    return text
      .toLowerCase()
      .split("")
      .map((char) => MORSE_MAP[char] || "")
      .filter((char) => char !== "")
      .join(" ");
  };

  const translateMorseToText = (morse: string) => {
    return morse
      .split(" ")
      .map((code) => REVERSE_MAP[code] || "")
      .join("");
  };

  const handleConvert = () => {
    if (!input.trim()) return;
    if (mode === "text2morse") {
      setOutput(translateTextToMorse(input));
    } else {
      setOutput(translateMorseToText(input));
    }
  };

  const handleSwap = () => {
    setMode(mode === "text2morse" ? "morse2text" : "text2morse");
    setInput(output);
    setOutput(input);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs to your dashboard.");
      return;
    }
    if (!input.trim()) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "morse-translator",
          inputRef: JSON.stringify({ mode, excerpt: input.substring(0, 100) }),
          outputRef: JSON.stringify({ excerpt: (output || input).substring(0, 500) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "morse-translator" }),
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
        <div className="flex gap-2">
          <button
            onClick={() => setMode("text2morse")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              mode === "text2morse"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Text to Morse
          </button>
          <button
            onClick={() => setMode("morse2text")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              mode === "morse2text"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Morse to Text
          </button>
          <button
            onClick={handleSwap}
            disabled={!output && !input}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-neon-cyan text-xs font-mono transition-all disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" />
            Swap
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleConvert}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
          >
            Translate
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!output && !input}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Result"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!input || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">
            {mode === "text2morse" ? "Alphanumeric Text Input" : "Morse Code Input (Dots/Dashes)"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "text2morse" ? "Enter text here..." : "Enter morse code (e.g. .... . .-.. .-.. --- / .-- --- .-. .-.. -..)..."}
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Translated Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Translation will appear here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
