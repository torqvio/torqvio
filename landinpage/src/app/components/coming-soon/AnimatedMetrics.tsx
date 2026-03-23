"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle, Shield, Zap, Clock } from "lucide-react";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function AnimatedMetrics() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const benefits: Benefit[] = [
    {
      icon: <Shield className="h-6 w-6 text-green" />,
      title: "Cost Savings",
      description: "Eliminate infrastructure maintenance costs",
    },
    {
      icon: <Clock className="h-6 w-6 text-amber" />,
      title: "Time Recovery",
      description: "Reduce debugging and maintenance time",
    },
    {
      icon: <Zap className="h-6 w-6 text-purple" />,
      title: "High Reliability",
      description: "Built for mission-critical workflows",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-purple-l" />,
      title: "Early Access",
      description: "Join the beta program today",
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref.current]);

  return (
    <section ref={ref} className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-[clamp(28px,4vw,48px)] font-bold leading-[1.2]">
            Built for Developers
          </h2>
          <p className="text-lg text-txt2 max-w-2xl mx-auto">
            Focus on building features instead of managing infrastructure. 
            Torqvio handles the complexity so you can ship faster.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`group relative rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-purple/30 hover:bg-surface2 hover:shadow-[0_8px_32px_rgba(108,92,231,0.1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle at center, rgba(108,92,231,0.05) 0%, transparent 70%)"
                }}
              />
              
              <div className="relative z-10">
                <div className="mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                
                <div className="text-center">
                  <div className="mb-2 font-semibold text-sm">
                    {benefit.title}
                  </div>
                  <div className="text-xs text-txt3">
                    {benefit.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-4 py-2 text-sm font-semibold text-purple-l">
            <span className="h-2 w-2 rounded-full bg-purple animate-pulse-dot" />
            Start building reliable workflows today
          </div>
        </div>
      </div>
    </section>
  );
}
