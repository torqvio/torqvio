import { ComingSoonHero } from "@/app/components/coming-soon/ComingSoonHero";
import { ComingSoonCTA } from "@/app/components/coming-soon/ComingSoonCTA";
import { ComingSoonInfo } from "@/app/components/coming-soon/ComingSoonInfo";
import { ComingSoonFooter } from "@/app/components/coming-soon/ComingSoonFooter";
import AnimatedBackground from "@/app/components/AnimatedBackground";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-bg text-txt relative">
      <AnimatedBackground />
      <ComingSoonHero />
      <ComingSoonInfo />
      <ComingSoonCTA />
      <ComingSoonFooter />
    </div>
  );
}
