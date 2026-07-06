"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeftRight, Check, Info, Loader, Save } from "lucide-react";

type Mode = "length" | "weight" | "temperature" | "currency";

const lengthUnits = {
  m: { name: "Meter (m)", value: 1 },
  km: { name: "Kilometer (km)", value: 1000 },
  cm: { name: "Centimeter (cm)", value: 0.01 },
  mm: { name: "Millimeter (mm)", value: 0.001 },
  mi: { name: "Mile (mi)", value: 1609.34 },
  yd: { name: "Yard (yd)", value: 0.9144 },
  ft: { name: "Foot (ft)", value: 0.3048 },
  in: { name: "Inch (in)", value: 0.0254 },
};

const weightUnits = {
  kg: { name: "Kilogram (kg)", value: 1 },
  g: { name: "Gram (g)", value: 0.001 },
  mg: { name: "Milligram (mg)", value: 0.000001 },
  lb: { name: "Pound (lb)", value: 0.45359237 },
  oz: { name: "Ounce (oz)", value: 0.028349523 },
};

const currencies = ["USD", "INR", "EUR", "GBP", "JPY", "CAD", "AUD", "SGD", "CHF", "CNY"];

export default function UnitConverter() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<Mode>("length");
  const [value, setValue] = useState<string>("1");
  const [result, setResult] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Converter States
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");

  // Currency States
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  // Set default units based on mode
  useEffect(() => {
    setSaveStatus("idle");
    if (mode === "length") {
      setFromUnit("m");
      setToUnit("ft");
    } else if (mode === "weight") {
      setFromUnit("kg");
      setToUnit("lb");
    } else if (mode === "temperature") {
      setFromUnit("C");
      setToUnit("F");
    } else if (mode === "currency") {
      setFromUnit("USD");
      setToUnit("INR");
      fetchRates("USD");
    }
  }, [mode]);

  const fetchRates = async (baseCurrency: string) => {
    setLoadingRates(true);
    setRateError(null);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
      if (!res.ok) throw new Error("Failed to fetch conversion rates.");
      const data = await res.json();
      setRates(data.rates || {});
    } catch (err: any) {
      setRateError(err.message || "Could not fetch exchange rates.");
    } finally {
      setLoadingRates(false);
    }
  };

  // Trigger rate fetch on base change
  useEffect(() => {
    if (mode === "currency" && fromUnit && currencies.includes(fromUnit)) {
      fetchRates(fromUnit);
    }
  }, [fromUnit, mode]);

  // Compute conversion result
  useEffect(() => {
    const val = parseFloat(value);
    if (isNaN(val)) {
      setResult("");
      return;
    }

    if (mode === "length") {
      const fromVal = lengthUnits[fromUnit as keyof typeof lengthUnits]?.value;
      const toVal = lengthUnits[toUnit as keyof typeof lengthUnits]?.value;
      if (fromVal && toVal) {
        setResult(((val * fromVal) / toVal).toFixed(6).replace(/\.?0+$/, ""));
      }
    } else if (mode === "weight") {
      const fromVal = weightUnits[fromUnit as keyof typeof weightUnits]?.value;
      const toVal = weightUnits[toUnit as keyof typeof weightUnits]?.value;
      if (fromVal && toVal) {
        setResult(((val * fromVal) / toVal).toFixed(6).replace(/\.?0+$/, ""));
      }
    } else if (mode === "temperature") {
      if (fromUnit === "C" && toUnit === "F") {
        setResult((val * 1.8 + 32).toFixed(2));
      } else if (fromUnit === "C" && toUnit === "K") {
        setResult((val + 273.15).toFixed(2));
      } else if (fromUnit === "F" && toUnit === "C") {
        setResult(((val - 32) / 1.8).toFixed(2));
      } else if (fromUnit === "F" && toUnit === "K") {
        setResult(((val - 32) / 1.8 + 273.15).toFixed(2));
      } else if (fromUnit === "K" && toUnit === "C") {
        setResult((val - 273.15).toFixed(2));
      } else if (fromUnit === "K" && toUnit === "F") {
        setResult(((val - 273.15) * 1.8 + 32).toFixed(2));
      } else {
        setResult(value);
      }
    } else if (mode === "currency") {
      if (fromUnit === toUnit) {
        setResult(value);
      } else {
        const rate = rates[toUnit];
        if (rate) {
          setResult((val * rate).toFixed(4));
        } else {
          setResult("");
        }
      }
    }
  }, [value, mode, fromUnit, toUnit, rates]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs to your dashboard.");
      return;
    }
    if (!value || !result) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "unit-converter",
          inputRef: JSON.stringify({ mode, value, fromUnit }),
          outputRef: JSON.stringify({ result, toUnit }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "unit-converter" }),
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
      {/* Mode Selector Tabs */}
      <div className="flex border-b border-white/5 pb-0.5">
        {(["length", "weight", "temperature", "currency"] as Mode[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMode(tab)}
            className={`px-4 py-2 border-b-2 font-mono text-xs uppercase tracking-wider transition-all ${
              mode === tab
                ? "border-neon-cyan text-neon-cyan font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 glass-card rounded-xl border border-border-card p-8">
        {/* Source Unit Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-mono mb-2 uppercase">From Unit</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full h-11 px-3 rounded-lg mono-input text-sm bg-black border-white/10"
            >
              {mode === "length" &&
                Object.entries(lengthUnits).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.name}
                  </option>
                ))}
              {mode === "weight" &&
                Object.entries(weightUnits).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.name}
                  </option>
                ))}
              {mode === "temperature" && (
                <>
                  <option value="C">Celsius (°C)</option>
                  <option value="F">Fahrenheit (°F)</option>
                  <option value="K">Kelvin (K)</option>
                </>
              )}
              {mode === "currency" &&
                currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-mono mb-2 uppercase">Amount / Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter numerical value..."
              className="w-full h-11 px-4 rounded-lg mono-input text-sm"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center md:pt-6">
          <button
            onClick={handleSwap}
            className="p-3.5 rounded-full bg-slate-800/80 border border-slate-700 hover:border-neon-cyan/40 text-slate-300 hover:text-neon-cyan transition-all hover:shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            title="Swap Units"
          >
            <ArrowLeftRight className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Destination Unit Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-mono mb-2 uppercase">To Unit</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full h-11 px-3 rounded-lg mono-input text-sm bg-black border-white/10"
            >
              {mode === "length" &&
                Object.entries(lengthUnits).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.name}
                  </option>
                ))}
              {mode === "weight" &&
                Object.entries(weightUnits).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.name}
                  </option>
                ))}
              {mode === "temperature" && (
                <>
                  <option value="C">Celsius (°C)</option>
                  <option value="F">Fahrenheit (°F)</option>
                  <option value="K">Kelvin (K)</option>
                </>
              )}
              {mode === "currency" &&
                currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-mono mb-2 uppercase">Result</label>
            <input
              type="text"
              readOnly
              value={result}
              placeholder="Conversion result..."
              className="w-full h-11 px-4 rounded-lg mono-input text-sm bg-black/40 border-white/5 text-neon-cyan font-bold"
            />
          </div>
        </div>
      </div>

      {mode === "currency" && loadingRates && (
        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-mono py-2">
          <Loader className="h-4.5 w-4.5 animate-spin text-neon-cyan" />
          Fetching live exchange rates...
        </div>
      )}

      {mode === "currency" && rateError && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>Error loading exchange rates: {rateError}. Live conversions may be static.</span>
        </div>
      )}

      {mode === "currency" && !loadingRates && !rateError && rates[toUnit] && (
        <div className="text-right text-[11px] font-mono text-slate-500">
          Exchange rate: 1 {fromUnit} = {rates[toUnit].toFixed(4)} {toUnit} (Provided by Open Exchange Rates)
        </div>
      )}

      {/* Save Button Container */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveOutput}
          disabled={!value || !result || saveStatus === "saving"}
          className="flex items-center gap-1.5 px-4 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
        </button>
      </div>
    </div>
  );
}
