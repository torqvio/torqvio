import Link from "next/link";
import { LogoFull } from "./Logo";
import { Check } from "lucide-react";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden px-6 pb-24 pt-40 text-center"
      aria-label="Hero"
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-200px] h-[700px] w-[900px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(108,92,231,0.18) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <LogoFull className="text-purple" iconSize={40} />
        </div>

        {/* Badge */}
        <div
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-3.5 py-1.5 text-[13px] font-semibold text-purple-l"
          role="status"
        >
          <span
            className="h-2 w-2 rounded-full bg-yellow animate-pulse-dot"
            style={{ boxShadow: "0 0 8px #FBBF24" }}
          />
          Coming soon · Early access available
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-[clamp(42px,7vw,76px)] font-black leading-[1.05] tracking-[-0.04em]">
          Never lose a
          <br />
          <span className="gradient-text">workflow again.</span>
        </h1>

        {/* Sub */}
        <p className="mx-auto mb-10 max-w-[580px] text-[clamp(17px,2.5vw,21px)] leading-relaxed text-txt2">
          The durable execution engine for serverless workflows.
          Get early access to automatic retries, step-level resume, and real-time observability.
        </p>

        {/* CTAs */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="#waitlist"
            className="flex items-center gap-2 rounded-xl bg-purple px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-purple-l hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(108,92,231,0.4)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12h18m-9-9v18" />
            </svg>
            Get early access
          </Link>
          <Link
            href="#features"
            className="rounded-xl border border-border bg-transparent px-7 py-3.5 text-base font-semibold text-txt2 transition-all hover:bg-surface hover:text-txt"
          >
            Learn more →
          </Link>
        </div>

        <p className="text-[13px] text-txt3">
          <Check className="inline h-3 w-3 text-green mr-1" /> No credit card &nbsp;·&nbsp;
          <Check className="inline h-3 w-3 text-green mr-1" /> SOC 2 compliant &nbsp;·&nbsp;
          <Check className="inline h-3 w-3 text-green mr-1" /> 99.9% uptime SLA
        </p>

        {/* Terminal */}
        <div
          className="mx-auto mt-14 max-w-[660px] overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(108,92,231,0.1)]"
          role="region"
          aria-label="Coming soon demo"
        >
          <div className="flex items-center gap-2 border-b border-border bg-surface2 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="mx-auto font-mono text-xs text-txt3">
              bash — coming soon
            </span>
          </div>
          <div className="p-6 font-mono text-sm leading-[1.85]">
            <div className="text-txt3"># Get early access to Torqvio</div>
            <div>
              <span className="text-purple-l">$</span>{" "}
              <span className="text-txt">npm install @torqvio/sdk</span>
            </div>
            <div>
              <Check className="inline h-3 w-3 text-green mr-1" />{" "}
              <span className="text-txt2">SDK installed</span>
            </div>
            <div>
              <span className="text-purple-l">$</span>{" "}
              <span className="text-txt">torqvio request-early-access</span>
            </div>
            <div>
              <Check className="inline h-3 w-3 text-green mr-1" />{" "}
              <span className="text-txt2">Scaffolded workflow project</span>
            </div>
            <div>
              <Check className="inline h-3 w-3 text-green mr-1" />{" "}
              <span className="text-txt2">
                We'll notify you when Torqvio is ready
              </span>
            </div>
            <div>&nbsp;</div>
            <div className="text-txt3">
              # Be the first to build durable workflows
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
