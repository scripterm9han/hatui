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
    <div className="min-h-screen pt-28 pb-20">
      <div className="shell space-y-12 relative z-10">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Arsenal <span className="text-[var(--color-accent)] font-mono">Pricing Plans</span>
          </h1>
          <p className="text-[var(--color-fg-muted)] text-sm max-w-md mx-auto">
            Upgrade to Pro for unlimited AI-powered Resume scoring, roasts, and unlimited database storage.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                billingCycle === "monthly"
                  ? "bg-[var(--color-accent)] text-white font-bold"
                  : "text-[var(--color-fg-muted)] hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-[var(--color-accent)] text-white font-bold"
                  : "text-[var(--color-fg-muted)] hover:text-white"
              }`}
            >
              Annual
              <span className="px-1.5 py-0.2 rounded bg-black text-[var(--color-accent)] text-[8px] font-bold">
                Save 30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="surface rounded-2xl p-8 flex flex-col justify-between space-y-8 relative">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-[var(--color-fg-subtle)] uppercase tracking-wider block">Starter Pack</span>
                <h3 className="text-xl font-bold text-white mt-1">Free Tier</h3>
              </div>
              <div className="flex items-baseline text-white">
                <span className="text-4xl font-extrabold font-mono">₹0</span>
                <span className="text-[var(--color-fg-subtle)] text-xs ml-1 font-mono">/ lifetime</span>
              </div>
              <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed">
                Perfect for quick, ad-hoc developer formatting, regex testing, or basic ATS analysis.
              </p>
            </div>

            <div className="space-y-3.5 border-t border-[var(--color-border)] pt-6">
              {[
                "Full access to all 110+ client-side tools",
                "10 AI Resume Score checks / day",
                "5 AI Resume Roasts / day",
                "Saves last 20 outputs per tool",
                "Ad-supported experience",
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-fg-muted)]">
                  <Check className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/tools")}
              className="btn btn-ghost btn-md w-full"
            >
              Start Free Tools
            </button>
          </div>

          {/* Pro Tier */}
          <div className="surface-accent rounded-2xl p-8 flex flex-col justify-between space-y-8 relative md:scale-[1.03]">
            {/* Best value tag */}
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-[var(--color-accent)] text-white text-[9px] font-mono font-bold uppercase tracking-wider">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider block">Arsenal Pro</span>
                <h3 className="text-xl font-bold text-white mt-1">Premium Member</h3>
              </div>
              <div className="flex items-baseline text-white">
                <span className="text-4xl font-extrabold font-mono">
                  {billingCycle === "monthly" ? "₹299" : "₹2,499"}
                </span>
                <span className="text-[var(--color-fg-subtle)] text-xs ml-1 font-mono">
                  / {billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed">
                Designed for power-users, active job-seekers, and engineers looking to maximize speed.
              </p>
            </div>

            <div className="space-y-3.5 border-t border-[var(--color-border)] pt-6">
              {[
                "Unlimited AI Resume Checks (ATS)",
                "Unlimited AI Resume Roasts",
                "Unlimited Saved History in Database",
                "No Ads or Popups",
                "Priority Server Processing (SLA)",
                "Early access to new tools",
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-fg-muted)]">
                  <Check className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading || (session?.user as any)?.plan === "pro"}
              className="btn btn-primary btn-md w-full disabled:opacity-50"
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
                  <Zap className="h-4 w-4" />
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
