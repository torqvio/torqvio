"use client";

import { useState } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

export function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      content: "Torqvio completely transformed how we handle background jobs. We went from spending 10+ hours per week on workflow maintenance to essentially zero. The step-level resume feature alone has saved us from countless duplicate payments.",
      author: "Sarah Chen",
      role: "CTO",
      company: "FinTech Startup",
      avatar: "👩‍💼",
      rating: 5
    },
    {
      id: 2,
      content: "The real-time observability is a game-changer. We can now see exactly where our workflows are failing, and the intelligent retries handle transient issues automatically. Our SLA compliance went from 87% to 99.8%.",
      author: "Marcus Rodriguez",
      role: "Senior Engineer",
      company: "E-commerce Platform",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      id: 3,
      content: "As a solo founder, I don't have time to manage infrastructure. Torqvio lets me focus on building features instead of maintaining queues and retry logic. It's like having a dedicated infrastructure team for free.",
      author: "Emily Watson",
      role: "Founder",
      company: "SaaS Tool",
      avatar: "👩‍🎨",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-[clamp(28px,4vw,48px)] font-bold leading-[1.2]">
            Loved by Developers
          </h2>
          <p className="text-lg text-txt2 max-w-2xl mx-auto">
            See what our beta testers have to say about building with Torqvio.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative rounded-2xl border border-border bg-surface p-8 shadow-[0_8px_32px_rgba(108,92,231,0.1)]">
          <div className="absolute -top-4 left-8">
            <div className="rounded-full bg-purple p-2">
              <Quote className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-1 mb-4">
              {[...Array(testimonials[currentTestimonial].rating || 5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow text-yellow" />
              ))}
            </div>
            
            <p className="text-lg leading-relaxed text-txt">
              {testimonials[currentTestimonial].content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">
                {testimonials[currentTestimonial].avatar}
              </div>
              <div>
                <div className="font-semibold">{testimonials[currentTestimonial].author}</div>
                <div className="text-sm text-txt2">
                  {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={prevTestimonial}
                className="rounded-lg border border-border bg-surface2 p-2 text-purple hover:bg-purple/10 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextTestimonial}
                className="rounded-lg border border-border bg-surface2 p-2 text-purple hover:bg-purple/10 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Testimonial Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentTestimonial
                  ? "bg-purple w-8"
                  : "bg-border hover:bg-purple/50"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">Beta Program</div>
            <div className="text-sm text-txt2">Now accepting applications</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">Durable</div>
            <div className="text-sm text-txt2">Workflow execution</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">Developer First</div>
            <div className="text-sm text-txt2">Built for reliability</div>
          </div>
        </div>

      </div>
    </section>
  );
}
