import Link from "next/link";

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
        {/* Badge */}
        <div
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-3.5 py-1.5 text-[13px] font-semibold text-purple-l"
          role="status"
        >
          <span
            className="h-2 w-2 rounded-full bg-green animate-pulse-dot"
            style={{ boxShadow: "0 0 8px #00C896" }}
          />
          Open source core · No credit card required
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-[clamp(42px,7vw,76px)] font-black leading-[1.05] tracking-[-0.04em]">
          Never lose a
          <br />
          <span className="gradient-text">workflow again.</span>
        </h1>

        {/* Sub */}
        <p className="mx-auto mb-10 max-w-[580px] text-[clamp(17px,2.5vw,21px)] leading-relaxed text-txt2">
          Durable serverless crons, webhooks, and multi-step workflows.
          Automatic retries, step-level resume, real-time observability.
          Zero infrastructure to manage.
        </p>

        {/* CTAs */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="https://app.torqvio.com/signup"
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
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Start building free
          </Link>
          <Link
            href="https://docs.torqvio.com"
            className="rounded-xl border border-border bg-transparent px-7 py-3.5 text-base font-semibold text-txt2 transition-all hover:bg-surface hover:text-txt"
          >
            Read the docs →
          </Link>
        </div>

        <p className="text-[13px] text-txt3">
          <span className="text-green">✓</span> No credit card &nbsp;·&nbsp;
          <span className="text-green">✓</span> SOC 2 compliant &nbsp;·&nbsp;
          <span className="text-green">✓</span> 99.9% uptime SLA
        </p>

        {/* Terminal */}
        <div
          className="mx-auto mt-14 max-w-[660px] overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(108,92,231,0.1)]"
          role="region"
          aria-label="Quick start demo"
        >
          <div className="flex items-center gap-2 border-b border-border bg-surface2 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="mx-auto font-mono text-xs text-txt3">
              bash — torqvio quickstart
            </span>
          </div>
          <div className="p-6 font-mono text-sm leading-[1.85]">
            <div className="text-txt3"># Create your first workflow in 60 seconds</div>
            <div>
              <span className="text-purple-l">$</span>{" "}
              <span className="text-txt">npm create torqvio@latest my-workflow</span>
            </div>
            <div>
              <span className="text-green">✓</span>{" "}
              <span className="text-txt2">Scaffolded workflow project</span>
            </div>
            <div>
              <span className="text-purple-l">$</span>{" "}
              <span className="text-txt">cd my-workflow &amp;&amp; torqvio deploy</span>
            </div>
            <div>
              <span className="text-green">✓</span>{" "}
              <span className="text-txt2">Deployed to Torqvio Cloud</span>
            </div>
            <div>
              <span className="text-green">✓</span>{" "}
              <span className="text-txt2">
                Dashboard: https://app.torqvio.com/workflows/my-workflow
              </span>
            </div>
            <div>&nbsp;</div>
            <div className="text-txt3">
              # Your workflow is live. Every run tracked. Every failure caught.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
