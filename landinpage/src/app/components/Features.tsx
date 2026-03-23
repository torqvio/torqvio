const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
    title: "Serverless Durable Crons",
    desc: "Schedule jobs with standard cron syntax and full timezone support. Every run lives inside the execution engine — tracked, retried, and logged automatically. Survives deploys and restarts.",
    tags: ["Cron syntax", "Timezone support", "Auto retry", "Full run history"],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    title: "Reliable Webhook Processing",
    desc: "Receive, queue, and process webhooks with guaranteed delivery. HMAC-SHA256 signing, automatic retries, and complete delivery history. If your server is down, it gets redelivered.",
    tags: ["Guaranteed delivery", "HMAC-SHA256", "Delivery history", "Exponential backoff"],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
      </svg>
    ),
    title: "Multi-Step Durable Workflows",
    desc: "Define workflows as code. Each step is tracked individually — if step 3 fails, it resumes from step 3. Branching, conditionals, parallel execution, and sleep/delay built in.",
    tags: ["Step-level resume", "Branching & parallel", "Sleep / delay", "Code-defined"],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: "Real-Time Observability",
    desc: "Live dashboard showing every execution, every step, every failure in real time. Structured logs, automated failure detection, and execution metrics with 24h/7d/30d filters.",
    tags: ["Live dashboard", "Structured logs", "Failure detection", "Execution metrics"],
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative z-10 px-6 py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.12em] text-purple-l">
            Features
          </span>
          <h2
            id="features-heading"
            className="text-[clamp(30px,5vw,50px)] font-extrabold leading-[1.1] tracking-[-0.03em]"
          >
            Everything your background
            <br />
            jobs need to never fail.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <article
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface p-9 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple/50 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-purple before:to-transparent"
            >
              <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-xl border border-purple/20 bg-purple/10">
                {f.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight">{f.title}</h3>
              <p className="mb-5 text-[15px] leading-relaxed text-txt2">{f.desc}</p>
              <div className="flex flex-wrap gap-2">
                {f.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-purple/20 bg-purple/10 px-2.5 py-1 text-xs font-semibold text-purple-l"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}

          {/* Retries — full width */}
          <article className="relative col-span-full overflow-hidden rounded-xl border border-border bg-surface p-9 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple/50 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-purple before:to-transparent">
            <div className="grid items-center gap-10 sm:grid-cols-2">
              <div>
                <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-xl border border-purple/20 bg-purple/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold tracking-tight">
                  Intelligent Retries &amp; Circuit Breakers
                </h3>
                <p className="mb-5 text-[15px] leading-relaxed text-txt2">
                  Exponential backoff, jitter, circuit breakers, and configurable retry
                  policies per workflow — all built in. Stop writing boilerplate retry
                  logic.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Exponential backoff", "Circuit breakers", "Per-workflow policies", "Jitter", "Max attempts"].map((t) => (
                    <span key={t} className="rounded-md border border-purple/20 bg-purple/10 px-2.5 py-1 text-xs font-semibold text-purple-l">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface2 p-6 font-mono text-sm leading-[1.8]">
                <div className="mb-3 text-txt3">{"// workflow.config.ts"}</div>
                <div><span className="token-kw">export const</span> <span className="token-fn">config</span> = {"{"}</div>
                <div>&nbsp;&nbsp;<span className="token-str">retries</span>: {"{"}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-str">maxAttempts</span>: <span className="token-num">5</span>,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-str">backoff</span>: <span className="token-str">&apos;exponential&apos;</span>,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-str">initialDelay</span>: <span className="token-num">1000</span>,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-str">jitter</span>: <span className="token-kw">true</span>,</div>
                <div>&nbsp;&nbsp;{"}"},</div>
                <div>&nbsp;&nbsp;<span className="token-str">circuitBreaker</span>: {"{"}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-str">threshold</span>: <span className="token-num">0.5</span>,</div>
                <div>&nbsp;&nbsp;{"}"}</div>
                <div>{"}"}</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
