"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const steps = [
  { num: "01", title: "Install the SDK", desc: "One package. TypeScript, Python, or Go. Full type safety out of the box." },
  { num: "02", title: "Define your workflow", desc: "Write your workflow steps as normal functions. Torqvio will handle the durability layer." },
  { num: "03", title: "Deploy in one command", desc: "Push to Torqvio Cloud. Your workflow will be live, observable, and durable immediately." },
  { num: "04", title: "Watch it in real time", desc: "Open the dashboard. See every execution, step, log line, and retry live." },
];

const panels = [
  {
    label: "install",
    code: (
      <>
        <div><span className="text-txt3"># npm</span></div>
        <div><span className="text-purple-l">$</span> <span className="text-txt">npm install @torqvio/sdk</span></div>
        <div>&nbsp;</div>
        <div><span className="text-txt3"># Python</span></div>
        <div><span className="text-purple-l">$</span> <span className="text-txt">pip install torqvio</span></div>
        <div>&nbsp;</div>
        <div><span className="text-txt3"># Go</span></div>
        <div><span className="text-purple-l">$</span> <span className="text-txt">go get github.com/torqvio/go-sdk</span></div>
      </>
    ),
  },
  {
    label: "workflow.ts",
    code: (
      <>
        <div><span className="token-kw">import</span> {"{ "}<span className="token-ty">Workflow</span>, <span className="token-ty">Step</span>{" }"} <span className="token-kw">from</span> <span className="token-str">&apos;@torqvio/sdk&apos;</span>;</div>
        <div>&nbsp;</div>
        <div><span className="token-kw">export const</span> <span className="token-fn">chargeAndNotify</span> = <span className="token-kw">new</span> <span className="token-ty">Workflow</span>({"{"}</div>
        <div>&nbsp;&nbsp;<span className="token-str">name</span>: <span className="token-str">&apos;charge-and-notify&apos;</span>,</div>
        <div>&nbsp;&nbsp;<span className="token-str">steps</span>: [</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-kw">new</span> <span className="token-ty">Step</span>(<span className="token-str">&apos;validate-order&apos;</span>, <span className="token-kw">async</span> (ctx) =&gt; {"{"}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-kw">return await</span> <span className="token-fn">validateOrder</span>(ctx.input.orderId);</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}),</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-kw">new</span> <span className="token-ty">Step</span>(<span className="token-str">&apos;charge-card&apos;</span>, <span className="token-kw">async</span> (ctx) =&gt; {"{"}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-kw">return await</span> <span className="token-fn">stripe.charge</span>(ctx.steps[<span className="token-str">&apos;validate-order&apos;</span>]);</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}),</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-kw">new</span> <span className="token-ty">Step</span>(<span className="token-str">&apos;send-receipt&apos;</span>, <span className="token-kw">async</span> (ctx) =&gt; {"{"}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-kw">await</span> <span className="token-fn">email.send</span>(ctx.input.email, ctx.steps[<span className="token-str">&apos;charge-card&apos;</span>]);</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}),</div>
        <div>&nbsp;&nbsp;],</div>
        <div>&nbsp;&nbsp;<span className="token-cm">// if step 2 fails, resume from step 2 — not from the start</span></div>
        <div>{"}"});</div>
      </>
    ),
  },
  {
    label: "deploy",
    code: (
      <>
        <div><span className="text-purple-l">$</span> <span className="text-txt">torqvio deploy</span></div>
        <div>&nbsp;</div>
        <div><Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">Bundling workflow...</span></div>
        <div><Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">Validating steps...</span></div>
        <div><Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">Uploading to Torqvio Cloud...</span></div>
        <div><Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">charge-and-notify deployed</span></div>
        <div>&nbsp;</div>
        <div className="text-txt2">Dashboard:</div>
        <div className="text-txt2">&nbsp;&nbsp;https://app.torqvio.com/workflows/charge-and-notify</div>
      </>
    ),
  },
  {
    label: "dashboard",
    code: (
      <>
        <div className="text-txt3"># Live execution log</div>
        <div>&nbsp;</div>
        <div><span className="text-green">●</span> <span className="text-txt2">charge-and-notify &nbsp;run_a1b2c3</span></div>
        <div>&nbsp;&nbsp;<Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">validate-order &nbsp;&nbsp;&nbsp;12ms</span></div>
        <div>&nbsp;&nbsp;<Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">charge-card &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;341ms</span></div>
        <div>&nbsp;&nbsp;<Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">send-receipt &nbsp;&nbsp;&nbsp;&nbsp;88ms</span></div>
        <div>&nbsp;&nbsp;<Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">completed &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;441ms total</span></div>
        <div>&nbsp;</div>
        <div className="text-txt3"># Failed run — step-level resume</div>
        <div><span className="text-green">●</span> <span className="text-txt2">charge-and-notify &nbsp;run_d4e5f6</span></div>
        <div>&nbsp;&nbsp;<Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">validate-order &nbsp;&nbsp;&nbsp;11ms</span></div>
        <div>&nbsp;&nbsp;<Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">charge-card &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;290ms</span></div>
        <div>&nbsp;&nbsp;✗ <span className="text-red">send-receipt &nbsp;&nbsp;&nbsp;&nbsp;SMTP timeout (retry 1/3)</span></div>
        <div>&nbsp;&nbsp;<Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">send-receipt &nbsp;&nbsp;&nbsp;&nbsp;102ms <span className="text-txt3">← resumed here</span></span></div>
        <div>&nbsp;&nbsp;<Check className="inline h-3 w-3 text-green mr-1" /> <span className="text-txt2">completed &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;403ms total</span></div>
      </>
    ),
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section
      id="how-it-works"
      className="relative z-10 bg-bg2 px-6 py-24"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-5xl">
        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.12em] text-purple-l">
          How it works
        </span>
        <h2
          id="how-heading"
          className="mb-14 text-[clamp(30px,5vw,50px)] font-extrabold leading-[1.1] tracking-[-0.03em]"
        >
          From zero to durable
          <br />
          workflows in minutes.
        </h2>

        <div className="grid items-start gap-14 lg:grid-cols-2">
          {/* Steps list */}
          <div className="flex flex-col gap-3" role="tablist" aria-label="Steps">
            {steps.map((s, i) => (
              <button
                key={s.num}
                role="tab"
                aria-selected={active === i}
                aria-controls={`panel-${i}`}
                onClick={() => setActive(i)}
                className={`flex items-start gap-5 rounded-xl border p-5 text-left transition-all duration-200 ${
                  active === i
                    ? "border-purple/30 bg-surface"
                    : "border-transparent hover:bg-surface/50"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[13px] font-semibold transition-all duration-200 ${
                    active === i
                      ? "border-purple/40 bg-purple/15 text-purple-l"
                      : "border-border bg-surface2 text-txt3"
                  }`}
                >
                  {s.num}
                </span>
                <span>
                  <span className="block font-bold">{s.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-txt2">
                    {s.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Code panel */}
          <div
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
            id={`panel-${active}`}
            role="tabpanel"
          >
            {/* Tab bar */}
            <div className="flex overflow-x-auto border-b border-border bg-surface2" role="tablist">
              {panels.map((p, i) => (
                <button
                  key={p.label}
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => setActive(i)}
                  className={`whitespace-nowrap border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-all ${
                    active === i
                      ? "border-purple text-purple-l"
                      : "border-transparent text-txt3 hover:text-txt2"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Code */}
            <div className="p-6 font-mono text-[13px] leading-[1.8] text-txt2">
              {panels[active].code}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
