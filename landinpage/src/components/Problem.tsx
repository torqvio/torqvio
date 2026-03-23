const problems = [
  {
    icon: "💀",
    title: "Cron killed mid-run",
    desc: "Your nightly data pipeline fires, a deploy happens mid-run, and the process is killed. The database is half-updated. Nobody knows until morning — or next week.",
  },
  {
    icon: "🕳️",
    title: "Webhook dropped",
    desc: "A payment provider posts to your webhook endpoint. Your server was restarting. The event is lost. No retry, no record, no audit trail. Revenue just evaporated.",
  },
  {
    icon: "⚠️",
    title: "Workflow half-completed",
    desc: "Step 1 sent the email. Step 2 charged the card. Step 3 crashed. Did it commit? Do you rerun and double-charge? You don't know — and neither does your code.",
  },
];

export function Problem() {
  return (
    <section className="relative z-10 px-6 py-24" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-5xl">
        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.12em] text-purple-l">
          The problem
        </span>
        <h2
          id="problem-heading"
          className="mb-5 text-[clamp(30px,5vw,50px)] font-extrabold leading-[1.1] tracking-[-0.03em]"
        >
          Background jobs fail silently.
          <br />
          You never know.
        </h2>
        <p className="max-w-xl text-lg leading-relaxed text-txt2">
          You have three things running in the background. Any one of them can
          fail silently and take hours to notice.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {problems.map((p) => (
            <article
              key={p.title}
              className="relative overflow-hidden rounded-xl border border-border bg-surface p-7 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-red before:to-transparent"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red/10 text-xl">
                {p.icon}
              </div>
              <h3 className="mb-2.5 text-[15px] font-bold">{p.title}</h3>
              <p className="text-sm leading-relaxed text-txt2">{p.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
