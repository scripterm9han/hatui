"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, RefreshCw, Save } from "lucide-react";

type MockToolType = "profile" | "card" | "address" | "phone" | "user-agent";

export default function MockGenerators() {
  const { data: session } = useSession();
  const [activeTool, setActiveTool] = useState<MockToolType>("profile");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const names = ["Aarav Sharma", "Aditi Patel", "Vihaan Gupta", "Ananya Singh", "Kabir Kumar", "Zara Malik"];
  const emails = ["aarav@domain.com", "aditi.patel@web.org", "vihaan.g@mail.net", "ananya.singh@service.io"];
  const cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai"];
  const streets = ["MG Road", "Park Street", "Linking Road", "Nehru Nagar", "Brigade Road"];
  const carriers = ["98765", "91234", "99887", "93456"];
  const uas = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/605.1.15"
  ];

  const generateData = () => {
    let res = "";
    const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    
    switch (activeTool) {
      case "profile": {
        const name = rand(names);
        const email = name.toLowerCase().replace(" ", ".") + "@example.com";
        const city = rand(cities);
        res = `Full Name: ${name}\nEmail Address: ${email}\nHome City: ${city}\nMock UID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        break;
      }
      case "card": {
        const network = Math.random() > 0.5 ? "Visa" : "MasterCard";
        const prefix = network === "Visa" ? "4111" : "5500";
        let digits = "";
        for (let i = 0; i < 12; i++) digits += Math.floor(Math.random() * 10);
        res = `Card Network: ${network}\nCard Number: ${prefix} ${digits.substring(0, 4)} ${digits.substring(4, 8)} ${digits.substring(8, 12)}\nExpiry Date: 12/${Math.floor(Math.random() * 5) + 26}\nCVV Security: ${Math.floor(Math.random() * 900) + 100}`;
        break;
      }
      case "address": {
        res = `Street Address: ${Math.floor(Math.random() * 500) + 1}, ${rand(streets)}\nCity: ${rand(cities)}\nPostal ZIP Code: ${Math.floor(Math.random() * 900000) + 100000}\nCountry: India`;
        break;
      }
      case "phone": {
        let suffix = "";
        for (let i = 0; i < 5; i++) suffix += Math.floor(Math.random() * 10);
        res = `Mobile Number: +91 ${rand(carriers)} ${suffix}`;
        break;
      }
      case "user-agent": {
        res = rand(uas);
        break;
      }
    }
    setOutput(res);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs.");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: `mock-${activeTool}`,
          inputRef: JSON.stringify({ activeTool }),
          outputRef: JSON.stringify({ outputExcerpt: output.substring(0, 100) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: `mock-${activeTool}` }),
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
      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: "profile", label: "User Profile" },
          { id: "card", label: "Credit Card" },
          { id: "address", label: "Postal Address" },
          { id: "phone", label: "Phone Number" },
          { id: "user-agent", label: "User Agent String" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as MockToolType);
              setSaveStatus("idle");
              setOutput("");
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              activeTool === t.id
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={generateData}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generate Mock Data
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Mock Data"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!output || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      {output && (
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Generated Output Schema</label>
          <textarea
            value={output}
            readOnly
            className="h-36 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-bold font-mono"
          />
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
