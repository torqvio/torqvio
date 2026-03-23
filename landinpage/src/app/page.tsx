import { ComingSoonHero } from "@/app/components/coming-soon/ComingSoonHero";
import { AnimatedMetrics } from "@/app/components/coming-soon/AnimatedMetrics";
import { ComingSoonInfo } from "@/app/components/coming-soon/ComingSoonInfo";
import { Testimonials } from "@/app/components/coming-soon/Testimonials";
import { FeatureComparison } from "@/app/components/coming-soon/FeatureComparison";
import { FAQ } from "@/app/components/coming-soon/FAQ";
import { ComingSoonCTA } from "@/app/components/coming-soon/ComingSoonCTA";
import { ComingSoonFooter } from "@/app/components/coming-soon/ComingSoonFooter";
import { Navigation } from "@/app/components/Navigation";
import AnimatedBackground from "@/app/components/AnimatedBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-txt relative">
      <AnimatedBackground />
      <Navigation />
      <main>
        <ComingSoonHero />
        <section id="metrics">
          <AnimatedMetrics />
        </section>
        <section id="info">
          <ComingSoonInfo />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="features">
          <FeatureComparison />
        </section>
        <section id="faq">
          <FAQ />
        </section>
        <section id="cta">
          <ComingSoonCTA />
        </section>
      </main>
      <footer>
        <ComingSoonFooter />
      </footer>
    </div>
  );
}
