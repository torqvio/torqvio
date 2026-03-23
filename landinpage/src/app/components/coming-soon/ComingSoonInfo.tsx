import { Skull, Search, Building } from "lucide-react";

export function ComingSoonInfo() {
  return (
    <section className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-8 text-[clamp(28px,4vw,48px)] font-bold leading-[1.2]">
          Your background jobs are failing.
        </h2>
        
        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6 text-left">
            <div className="mb-4 flex justify-center">
              <Skull className="h-8 w-8 text-red" />
            </div>
            <h3 className="mb-2 font-bold">Silent Failures</h3>
            <p className="text-sm text-txt2">
              Cron jobs die mid-run. Webhooks get dropped. Workflows crash halfway. 
              You don't know until customers complain.
            </p>
          </div>
          
          <div className="rounded-xl border border-border bg-surface p-6 text-left">
            <div className="mb-4 flex justify-center">
              <Search className="h-8 w-8 text-purple" />
            </div>
            <h3 className="mb-2 font-bold">No Visibility</h3>
            <p className="text-sm text-txt2">
              Scattered logs. No retry history. Zero insight into what's happening. 
              Each failure becomes a detective story.
            </p>
          </div>
          
          <div className="rounded-xl border border-border bg-surface p-6 text-left">
            <div className="mb-4 flex justify-center">
              <Building className="h-8 w-8 text-purple" />
            </div>
            <h3 className="mb-2 font-bold">Infrastructure Hell</h3>
            <p className="text-sm text-txt2">
              Managing queues, databases, retry logic, monitoring systems. 
              You're building infrastructure instead of products.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-purple/30 bg-purple/10 p-8">
          <h3 className="mb-4 text-xl font-bold">Torqvio fixes this.</h3>
          <p className="mb-6 text-lg leading-relaxed text-txt2">
            Durable execution engine that guarantees your workflows complete. 
            We handle retries, logging, and observability. You focus on your code.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-purple/30 bg-purple/20 px-3 py-1 text-sm font-semibold text-purple-l">
              Step-Level Resume
            </span>
            <span className="rounded-full border border-purple/30 bg-purple/20 px-3 py-1 text-sm font-semibold text-purple-l">
              Real-Time Dashboard
            </span>
            <span className="rounded-full border border-purple/30 bg-purple/20 px-3 py-1 text-sm font-semibold text-purple-l">
              Intelligent Retries
            </span>
            <span className="rounded-full border border-purple/30 bg-purple/20 px-3 py-1 text-sm font-semibold text-purple-l">
              Zero Infrastructure
            </span>
            <span className="rounded-full border border-purple/30 bg-purple/20 px-3 py-1 text-sm font-semibold text-purple-l">
              TypeScript SDK
            </span>
            <span className="rounded-full border border-purple/30 bg-purple/20 px-3 py-1 text-sm font-semibold text-purple-l">
              Python SDK
            </span>
            <span className="rounded-full border border-purple/30 bg-purple/20 px-3 py-1 text-sm font-semibold text-purple-l">
              Go SDK
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
