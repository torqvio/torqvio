const stats = [
  { val: "99.9%", label: "Uptime SLA (Pro + Enterprise)" },
  { val: "3",     label: "Official SDKs — TS · Python · Go" },
  { val: "∞",     label: "Retries with exponential backoff" },
  { val: "$0",    label: "To start — no credit card ever" },
];

export function Stats() {
  return (
    <section className="relative z-10 px-6 py-20" aria-label="Platform statistics">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-surface p-8 text-center"
            >
              <div
                className="mb-1 text-5xl font-black leading-none tracking-[-0.04em]"
                style={{
                  background:
                    "linear-gradient(135deg, #fff, #8B7CF8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.val}
              </div>
              <div className="mt-1.5 text-xs font-medium text-txt3">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
