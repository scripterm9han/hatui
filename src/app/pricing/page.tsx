"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Check, HelpCircle, Star, Zap, Terminal, ShieldAlert, Sparkles, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!session) {
      signIn(undefined, { callbackUrl: "/pricing" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/cashfree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: billingCycle }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to initialize checkout.");
      }

      if (json.paymentLink) {
        // Redirect to Cashfree checkout link (works for sandbox, production, and mock modes)
        window.location.href = json.paymentLink;
      } else {
        alert("Payment gateway session created, but payment link is missing.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error upgrading account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark grid-bg pt-28 pb-20 px-4">
      {/* Decorative glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-neon-cyan/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-sans">
            Arsenal <span className="text-neon-cyan font-mono">Pricing Plans</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Upgrade to Pro for unlimited AI-powered Resume scoring, roasts, and unlimited database storage.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <div className="bg-bg-darker border border-border-card rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                billingCycle === "monthly"
                  ? "bg-neon-cyan text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-neon-cyan text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Annual
              <span className="px-1.5 py-0.2 rounded bg-black text-neon-cyan text-[8px] font-bold">
                Save 30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          
          {/* Free Tier */}
          <div className="glass-card rounded-2xl border border-border-card p-8 flex flex-col justify-between space-y-8 relative">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Starter Pack</span>
                <h3 className="text-xl font-bold text-white font-sans mt-1">Free Tier</h3>
              </div>
              <div className="flex items-baseline text-white">
                <span className="text-4xl font-extrabold font-mono">₹0</span>
                <span className="text-slate-500 text-xs ml-1 font-mono">/ lifetime</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Perfect for quick, ad-hoc developer formatting, regex testing, or basic ATS analysis.
              </p>
            </div>

            <div className="space-y-3.5 border-t border-slate-800/80 pt-6">
              {[
                "Full access to all 110+ client-side tools",
                "10 AI Resume Score checks / day",
                "5 AI Resume Roasts / day",
                "Saves last 20 outputs per tool",
                "Ad-supported experience",
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="h-4 w-4 text-neon-cyan shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/tools")}
              className="w-full h-11 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-all text-xs font-mono"
            >
              Start Free Tools
            </button>
          </div>

          {/* Pro Tier */}
          <div className="glass-card rounded-2xl border-2 border-neon-cyan p-8 flex flex-col justify-between space-y-8 relative shadow-[0_0_30px_rgba(0,240,255,0.08)] bg-bg-card/90">
            {/* Best value tag */}
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-neon-cyan text-black text-[9px] font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-neon-cyan uppercase tracking-wider block">Arsenal Pro</span>
                <h3 className="text-xl font-bold text-white font-sans mt-1">Premium Member</h3>
              </div>
              <div className="flex items-baseline text-white">
                <span className="text-4xl font-extrabold font-mono">
                  {billingCycle === "monthly" ? "₹299" : "₹2,499"}
                </span>
                <span className="text-slate-500 text-xs ml-1 font-mono">
                  / {billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Designed for power-users, active job-seekers, and engineers looking to maximize speed.
              </p>
            </div>

            <div className="space-y-3.5 border-t border-slate-800/80 pt-6">
              {[
                "Unlimited AI Resume Checks (ATS)",
                "Unlimited AI Resume Roasts",
                "Unlimited Saved History in Database",
                "No Ads or Popups",
                "Priority Server Processing (SLA)",
                "Early access to new tools",
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="h-4 w-4 text-neon-cyan shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading || (session?.user as any)?.plan === "pro"}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-neon-cyan text-black hover:bg-neon-cyan/85 font-bold transition-all text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (session?.user as any)?.plan === "pro" ? (
                "You are already Pro!"
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-black" />
                  Upgrade to Pro
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
