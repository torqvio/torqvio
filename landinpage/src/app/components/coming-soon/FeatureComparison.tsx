"use client";

import { Check, X, Zap } from "lucide-react";

export function FeatureComparison() {
  const features = [
    {
      category: "Core Features",
      items: [
        { name: "Step-level Resume", torqvio: true, traditional: false, serverless: false },
        { name: "Auto-retry Logic", torqvio: true, traditional: false, serverless: false },
        { name: "Real-time Dashboard", torqvio: true, traditional: false, serverless: false },
        { name: "Dead Letter Handling", torqvio: true, traditional: true, serverless: false }
      ]
    },
    {
      category: "Infrastructure",
      items: [
        { name: "Zero Setup", torqvio: true, traditional: false, serverless: true },
        { name: "No Servers to Manage", torqvio: true, traditional: false, serverless: true },
        { name: "Auto-scaling", torqvio: true, traditional: false, serverless: true },
        { name: "Built-in Monitoring", torqvio: true, traditional: false, serverless: false }
      ]
    },
    {
      category: "Developer Experience",
      items: [
        { name: "TypeScript SDK", torqvio: true, traditional: false, serverless: false },
        { name: "Python SDK", torqvio: true, traditional: false, serverless: false },
        { name: "Go SDK", torqvio: true, traditional: false, serverless: false },
        { name: "Visual Workflow Builder", torqvio: true, traditional: false, serverless: false }
      ]
    },
    {
      category: "Reliability",
      items: [
        { name: "99.9% Uptime SLA", torqvio: true, traditional: false, serverless: true },
        { name: "SOC 2 Compliant", torqvio: true, traditional: false, serverless: true },
        { name: "End-to-end Encryption", torqvio: true, traditional: false, serverless: true },
        { name: "Audit Logs", torqvio: true, traditional: false, serverless: false }
      ]
    }
  ];

  const CheckIcon = () => <Check className="h-5 w-5 text-green mx-auto" />;
  const XIcon = () => <X className="h-5 w-5 text-red mx-auto" />;
  const LightningIcon = () => <Zap className="h-5 w-5 text-purple mx-auto" />;

  return (
    <section className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-[clamp(28px,4vw,48px)] font-bold leading-[1.2]">
            Why Torqvio Wins
          </h2>
          <p className="text-lg text-txt2 max-w-2xl mx-auto">
            See how Torqvio compares to traditional queue systems and serverless functions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-sm font-semibold text-txt3 uppercase tracking-wider">
                Features
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-3 py-1">
                  <LightningIcon />
                  <span className="font-semibold text-purple-l">Torqvio</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-txt2">Traditional Queues</div>
                <div className="text-xs text-txt3">(Redis, RabbitMQ)</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-txt2">Serverless Functions</div>
                <div className="text-xs text-txt3">(AWS Lambda, Cloud Functions)</div>
              </div>
            </div>

            {/* Feature Rows */}
            {features.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                <div className="col-span-4 mb-4">
                  <h3 className="font-semibold text-purple-l">{category.category}</h3>
                </div>
                
                {category.items.map((feature, featureIndex) => (
                  <div key={featureIndex} className="grid grid-cols-4 gap-4 mb-3">
                    <div className="text-sm font-medium text-txt">
                      {feature.name}
                    </div>
                    <div className="flex items-center justify-center">
                      {feature.torqvio ? <CheckIcon /> : <XIcon />}
                    </div>
                    <div className="flex items-center justify-center">
                      {feature.traditional ? <CheckIcon /> : <XIcon />}
                    </div>
                    <div className="flex items-center justify-center">
                      {feature.serverless ? <CheckIcon /> : <XIcon />}
                    </div>
                  </div>
                ))}
                
                {categoryIndex < features.length - 1 && (
                  <div className="col-span-4 border-b border-border my-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">Reliable</div>
            <div className="text-sm text-txt2">Workflow Durability</div>
            <div className="text-xs text-txt3 mt-1">
              Never lose progress again
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">Serverless</div>
            <div className="text-sm text-txt2">Infrastructure Management</div>
            <div className="text-xs text-txt3 mt-1">
              Focus on code, not servers
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">Productive</div>
            <div className="text-sm text-txt2">Faster Development</div>
            <div className="text-xs text-txt3 mt-1">
              Built-in retry & monitoring
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-txt3 mb-4">
            Ready to build reliable workflows without the headache?
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-2 text-sm font-semibold text-green-l">
            <span className="h-2 w-2 rounded-full bg-green animate-pulse-dot" />
            Join the beta waitlist today
          </div>
        </div>
      </div>
    </section>
  );
}
