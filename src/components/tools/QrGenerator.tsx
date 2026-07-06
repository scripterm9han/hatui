"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import QRCode from "qrcode";
import { Check, Clipboard, Download, Save, Sparkles, Trash2 } from "lucide-react";

export default function QrGenerator() {
  const { data: session } = useSession();
  const [text, setText] = useState("https://hatiyar.in");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("H");
  const [size, setSize] = useState<number>(512);
  const [darkColor, setDarkColor] = useState<string>("#000000");
  const [lightColor, setLightColor] = useState<string>("#ffffff");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const generateQr = async () => {
    if (!text.trim()) {
      setQrUrl("");
      return;
    }
    
    // Validate hex format (3, 4, 6, or 8 hex digits) before passing to QRCode generator to prevent crashes while typing
    const hexRegex = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    if (!hexRegex.test(darkColor) || !hexRegex.test(lightColor)) {
      return;
    }

    try {
      const url = await QRCode.toDataURL(text, {
        errorCorrectionLevel: errorCorrection,
        width: size,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrUrl(url);
    } catch (err) {
      console.error("Failed to generate QR Code", err);
    }
  };

  useEffect(() => {
    generateQr();
  }, [text, errorCorrection, size, darkColor, lightColor]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClear = () => {
    setText("");
    setQrUrl("");
    setSaveStatus("idle");
  };

  const handleCopyLink = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
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
    if (!text || !qrUrl) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "qr-generator",
          inputRef: JSON.stringify({ text, errorCorrection, size, darkColor, lightColor }),
          // Store shortened base64 or reference
          outputRef: JSON.stringify({ qrUrlLength: qrUrl.length, preview: qrUrl.substring(0, 500) + "..." }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "qr-generator" }),
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
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
        {/* Configurations Area */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-5">
          <h3 className="text-lg font-semibold text-white font-sans flex items-center gap-2 mb-2">
            <Sparkles className="h-4.5 w-4.5 text-neon-cyan" />
            Configure QR Settings
          </h3>

          <div>
            <label className="block text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
              QR Code Payload (Text or URL)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. https://hatiyar.in"
              className="w-full h-24 p-3 rounded-lg mono-input text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
                Error Correction
              </label>
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg mono-input text-xs bg-black"
              >
                <option value="L">Low (7% recovery)</option>
                <option value="M">Medium (15% recovery)</option>
                <option value="Q">Quartile (25% recovery)</option>
                <option value="H">High (30% recovery)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
                Image Size (Resolution)
              </label>
              <select
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full h-10 px-3 rounded-lg mono-input text-xs bg-black"
              >
                <option value="256">256 x 256 px</option>
                <option value="512">512 x 512 px</option>
                <option value="1024">1024 x 1024 px</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
                Foreground Color (Dark)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg mono-input text-xs text-center"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
                Background Color (Light)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg mono-input text-xs text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3.5 h-10 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                disabled={!text}
                className="flex items-center gap-1.5 px-3.5 h-10 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Content"}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="glass-card rounded-xl border border-border-card p-6 flex flex-col items-center justify-center space-y-6">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider text-center block w-full">
            QR Code Preview
          </label>
          
          <div className="relative p-4 rounded-2xl bg-white/95 border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)] w-48 h-48 sm:w-56 sm:h-56">
            {qrUrl ? (
              <img src={qrUrl} alt="Generated QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="text-slate-400 text-xs font-mono text-center">Enter payload to generate</div>
            )}
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleDownload}
              disabled={!qrUrl}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-neon-cyan text-black hover:bg-neon-cyan/85 font-bold transition-all text-xs font-mono disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            
            <button
              onClick={handleSaveOutput}
              disabled={!text || !qrUrl || saveStatus === "saving"}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved to Dashboard!" : "Save Output"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
