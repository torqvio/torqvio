"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function CTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("You're on the list! We'll keep you updated.");
        setEmail("");
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="relative z-10 bg-bg2 px-6 py-24" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-4xl text-center">
        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.12em] text-purple-l">
          Get early access
        </span>
        <h2
          id="cta-heading"
          className="mb-6 text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em]"
        >
          Ready to never lose a workflow again?
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-txt2">
          Be the first to experience durable workflows. Join our exclusive early access program 
          and help shape the future of reliable serverless execution.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-xl border border-border bg-surface px-5 py-3.5 text-base text-txt placeholder-txt3 transition-all focus:border-purple/50 focus:outline-none focus:ring-2 focus:ring-purple/20"
              disabled={status === "loading"}
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl bg-purple px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-purple-l hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(108,92,231,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Joining...
                </span>
              ) : (
                "Join waitlist"
              )}
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                status === "success"
                  ? "bg-green/10 text-green border border-green/20"
                  : "bg-red/10 text-red border border-red/20"
              }`}
            >
              {message}
            </div>
          )}
        </form>

        <p className="mt-8 text-[13px] text-txt3">
          <Check className="inline h-3 w-3 text-green mr-1" /> No spam ever &nbsp;·&nbsp;
          <Check className="inline h-3 w-3 text-green mr-1" /> Unsubscribe anytime &nbsp;·&nbsp;
          <Check className="inline h-3 w-3 text-green mr-1" /> We respect your privacy
        </p>
      </div>
    </section>
  );
}
