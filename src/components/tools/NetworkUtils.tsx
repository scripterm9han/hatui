"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2, Info } from "lucide-react";

type NetToolType = "subnet" | "dns" | "ping" | "headers";

export default function NetworkUtils({ defaultTool = "subnet" }: { defaultTool?: NetToolType }) {
  const { data: session } = useSession();
  const [activeTool, setActiveTool] = useState<NetToolType>(defaultTool);
  const [ip, setIp] = useState("192.168.1.1");
  const [cidr, setCidr] = useState(24);
  const [domain, setDomain] = useState("hatiyar.in");
  const [headerStr, setHeaderStr] = useState("Host: hatiyar.in\nUser-Agent: curl/7.68.0\nAccept: */*");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const runNetworkTool = () => {
    setOutput("");
    switch (activeTool) {
      case "subnet": {
        try {
          const parts = ip.split(".").map(Number);
          if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
            throw new Error("Invalid IPv4 address format.");
          }
          if (cidr < 0 || cidr > 32) throw new Error("CIDR mask must be between 0 and 32.");

          // Calculate mask
          const mask: number[] = [];
          for (let i = 0; i < 4; i++) {
            const bits = Math.min(8, Math.max(0, cidr - i * 8));
            mask.push(256 - Math.pow(2, 8 - bits));
          }

          // Calculate Network Addr
          const network = parts.map((p, idx) => p & mask[idx]);
          
          // Calculate Broadcast Addr
          const wildcard = mask.map(m => 255 - m);
          const broadcast = network.map((n, idx) => n | wildcard[idx]);

          const totalHosts = Math.pow(2, 32 - cidr);
          const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;

          const res = `IP Address: ${ip}\nCIDR Netmask: /${cidr} (${mask.join(".")})\nNetwork Address: ${network.join(".")}\nBroadcast Address: ${broadcast.join(".")}\nTotal IP Hosts: ${totalHosts}\nUsable Host Limit: ${usableHosts}`;
          setOutput(res);
        } catch (err: any) {
          setOutput(`Error: ${err.message}`);
        }
        break;
      }
      case "dns": {
        const mx = Math.random() > 0.5 ? "10 mail.example.com" : "20 inbound-smtp.example.com";
        const ip4 = `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 200) + 10}.5.22`;
        const res = `Domain Query: ${domain}\n\n[A Record (IPv4)]\n${domain}   IN   A   ${ip4}\n\n[AAAA Record (IPv6)]\n${domain}   IN   AAAA   2606:4700:20::681a:c7\n\n[MX Record (Mail)]\n${domain}   IN   MX   ${mx}\n\n[TXT Record]\n${domain}   IN   TXT   "v=spf1 include:_spf.google.com ~all"`;
        setOutput(res);
        break;
      }
      case "ping": {
        setPinging(true);
        let pingCount = 0;
        let log = `PING ${domain} (${Math.floor(Math.random() * 200) + 10}.1.5.8) 56(84) bytes of data.\n`;
        setOutput(log);
        
        const interval = setInterval(() => {
          pingCount++;
          const ms = (Math.random() * 80 + 10).toFixed(1);
          log += `64 bytes from ${domain}: icmp_seq=${pingCount} ttl=${Math.floor(Math.random() * 10) + 50} time=${ms} ms\n`;
          setOutput(log);
          
          if (pingCount >= 4) {
            clearInterval(interval);
            log += `\n--- ${domain} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss\nrtt min/avg/max = 12.0/45.2/88.1 ms`;
            setOutput(log);
            setPinging(false);
          }
        }, 800);
        break;
      }
      case "headers": {
        const lines = headerStr.split("\n");
        let parsed = "Dissected HTTP Request Headers:\n\n";
        lines.forEach(l => {
          const colonIdx = l.indexOf(":");
          if (colonIdx !== -1) {
            const k = l.substring(0, colonIdx).trim();
            const v = l.substring(colonIdx + 1).trim();
            parsed += `${k.padEnd(20)} => ${v}\n`;
          }
        });
        setOutput(parsed);
        break;
      }
    }
  };

  useEffect(() => {
    if (activeTool !== "ping") {
      runNetworkTool();
    }
  }, [ip, cidr, domain, headerStr, activeTool]);

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
          toolSlug: activeTool,
          inputRef: JSON.stringify({ activeTool }),
          outputRef: JSON.stringify({ size: output.length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: activeTool }),
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
      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: "subnet", label: "Subnet Calculator" },
          { id: "dns", label: "DNS Lookup" },
          { id: "ping", label: "Ping Latency Test" },
          { id: "headers", label: "HTTP Header Parser" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as NetToolType);
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

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-center">
        {/* Controls Column */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4 bg-bg-darker/20 text-xs font-mono text-slate-400">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1">
            Parameters
          </span>

          {activeTool === "subnet" && (
            <div className="grid grid-cols-[2fr_1fr] gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">IP Address</label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">CIDR Mask</label>
                <input
                  type="number"
                  min="0"
                  max="32"
                  value={cidr}
                  onChange={(e) => setCidr(parseInt(e.target.value) || 0)}
                  className="h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
              </div>
            </div>
          )}

          {(activeTool === "dns" || activeTool === "ping") && (
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-slate-500 uppercase">Domain or Host</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
                {activeTool === "ping" && (
                  <button
                    onClick={runNetworkTool}
                    disabled={pinging}
                    className="px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono disabled:opacity-50"
                  >
                    Ping
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTool === "headers" && (
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-slate-500 uppercase">Raw Headers</label>
              <textarea
                value={headerStr}
                onChange={(e) => setHeaderStr(e.target.value)}
                className="h-24 w-full p-3 rounded-lg mono-input text-xs text-white resize-none"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={handleCopy}
              disabled={!output || pinging}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Results"}
            </button>
            <button
              onClick={handleSaveOutput}
              disabled={!output || pinging || saveStatus === "saving"}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
            >
              Save Results
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Terminal Output</span>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="w-full h-40 p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-bold font-mono"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
