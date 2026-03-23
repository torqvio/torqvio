"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqItems = [
    {
      question: "What is a durable execution engine?",
      answer: "A durable execution engine ensures your workflows complete successfully even if failures occur. Torqvio automatically saves progress after each step, retries failed operations with intelligent backoff, and provides real-time visibility into execution state. Think of it as insurance for your background jobs."
    },
    {
      question: "How is Torqvio different from existing queue systems?",
      answer: "Traditional queue systems only handle message delivery. Torqvio provides complete workflow orchestration with step-level resume, automatic retries, dead letter handling, and real-time observability. Unlike Redis queues or RabbitMQ, Torqvio is serverless and requires zero infrastructure management."
    },
    {
      question: "What programming languages are supported?",
      answer: "Torqvio provides SDKs for TypeScript/JavaScript, Python, and Go. Our REST API also allows integration with any language. We're actively adding more language support based on beta tester feedback."
    },
    {
      question: "Can I migrate my existing workflows?",
      answer: "Yes! Torqvio is designed for easy migration. We provide migration tools and guides for popular frameworks like Celery, Bull Queue, and Sidekiq. Most users can migrate their workflows in under a day with minimal code changes."
    },
    {
      question: "How does pricing work?",
      answer: "Torqvio offers usage-based pricing with a generous free tier. You pay only for what you use - no monthly fees or hidden costs. Pricing is based on workflow executions and storage. Beta testers receive special pricing discounts."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. Torqvio is SOC 2 Type II compliant with end-to-end encryption. Your workflow data is encrypted at rest and in transit. We never access your business logic or data, and provide comprehensive audit logs."
    },
    {
      question: "What kind of workflows can I build?",
      answer: "Torqvio excels at any multi-step process: payment processing, data pipelines, user onboarding, content moderation, scheduled tasks, API orchestration, and more. If it involves multiple steps that need to complete reliably, Torqvio is perfect for it."
    },
    {
      question: "How fast is Torqvio?",
      answer: "Torqvio adds minimal overhead - typically under 10ms per step. Our distributed architecture ensures high throughput and low latency, even for complex workflows. Real-time dashboard updates happen in under 100ms."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-[clamp(28px,4vw,48px)] font-bold leading-[1.2]">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-txt2 max-w-2xl mx-auto">
            Got questions? We've got answers. If you don't see your question here, 
            feel free to reach out to our team.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-surface overflow-hidden transition-all duration-300 hover:border-purple/30"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-surface2 transition-colors"
              >
                <h3 className="font-semibold text-lg pr-4">
                  {item.question}
                </h3>
                <div className="flex-shrink-0">
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-purple transition-transform duration-300" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-purple transition-transform duration-300" />
                  )}
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openItems.includes(index) 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-4 text-txt2 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 text-center">
          <div className="rounded-2xl border border-purple/30 bg-purple/10 p-8">
            <h3 className="mb-4 text-xl font-bold">Still have questions?</h3>
            <p className="mb-6 text-txt2">
              Our team is here to help. Whether you're evaluating Torqvio or need 
              technical guidance, we're just an email away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@torqvio.com"
                className="inline-flex items-center justify-center rounded-xl bg-purple px-6 py-3 text-base font-semibold text-white transition-all hover:bg-purple-l hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(108,92,231,0.4)]"
              >
                Email Support
              </a>
              <a
                href="https://discord.gg/torqvio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 text-base font-semibold text-txt transition-all hover:border-purple/50 hover:bg-purple/10"
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
