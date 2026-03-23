const testimonials = [
  {
    quote: "The step-level resume feature in the beta is exactly what we need. Our payment workflows will finally be reliable and debuggable.",
    author: "Alex Thompson",
    role: "Engineering Lead",
    company: "Fintech Startup",
    avatar: "AT",
  },
  {
    quote: "The observability dashboard in early access is incredible. We can already see exactly what's happening with our background jobs in real-time.",
    author: "Jordan Lee",
    role: "Senior Developer", 
    company: "SaaS Company",
    avatar: "JL",
  },
  {
    quote: "The beta demo showed us how seamless migrating from cron jobs will be. Torqvio will handle all the complexity we currently manage ourselves.",
    author: "Casey Morgan",
    role: "DevOps Engineer",
    company: "E-commerce Platform",
    avatar: "CM",
  },
];

export function Testimonials() {
  return (
    <section className="relative z-10 px-6 py-24" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.12em] text-purple-l">
            Testimonials
          </span>
          <h2
            id="testimonials-heading"
            className="text-[clamp(30px,5vw,50px)] font-extrabold leading-[1.1] tracking-[-0.03em]"
          >
            Trusted by beta testers
            <br />
          and early access users.
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <blockquote
              key={index}
              className="relative rounded-xl border border-border bg-surface p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple/50 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-purple before:to-transparent"
            >
              <div className="mb-6 text-lg leading-relaxed text-txt2">
                "{testimonial.quote}"
              </div>
              <footer className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple/15 text-sm font-bold text-purple-l">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-txt">{testimonial.author}</div>
                  <div className="text-sm text-txt3">{testimonial.role} at {testimonial.company}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
