"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How is Torqvio different from cron jobs?",
    answer: "Traditional cron jobs run once and disappear if they fail. Torqvio tracks every execution, provides automatic retries with exponential backoff, and offers step-level resume for multi-step workflows. You get full observability and failure handling out of the box.",
  },
  {
    question: "Can I self-host Torqvio?",
    answer: "Torqvio Cloud is our managed solution with 99.9% uptime SLA. For Enterprise customers, we offer self-hosted options with full support. Contact our sales team for more information.",
  },
  {
    question: "What programming languages are supported?",
    answer: "We provide official SDKs for TypeScript/JavaScript, Python, and Go. All SDKs are fully type-safe and support the same feature set including workflows, retries, and real-time observability.",
  },
  {
    question: "How does pricing work?",
    answer: "The open-source core is free forever. Torqvio Cloud Pro starts at $49/month for teams and includes additional features like advanced monitoring, custom domains, and priority support. Enterprise pricing is available for large deployments.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We're SOC 2 compliant, encrypt all data in transit and at rest, and never access your workflow code or execution data. You can also use our self-hosted option for complete data control.",
  },
  {
    question: "Can I migrate my existing cron jobs?",
    answer: "Absolutely. Most cron jobs can be migrated in minutes. Our SDKs provide drop-in replacements for common patterns, and our team has migration guides for popular frameworks.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative z-10 bg-bg2 px-6 py-24"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.12em] text-purple-l">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="text-[clamp(30px,5vw,50px)] font-extrabold leading-[1.1] tracking-[-0.03em]"
          >
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <article
              key={index}
              className="rounded-xl border border-border bg-surface overflow-hidden transition-all duration-300 hover:border-purple/50"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full px-7 py-5 text-left flex items-center justify-between gap-4 transition-colors hover:bg-surface/50"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-txt">{faq.question}</span>
                <span
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                    openIndex === index
                      ? "border-purple/40 bg-purple/15 text-purple-l"
                      : "border-border bg-surface2 text-txt3"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${
                      openIndex === index ? "rotate-45" : ""
                    }`}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>
              {openIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-7 pb-5 text-[15px] leading-relaxed text-txt2"
                >
                  {faq.answer}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
