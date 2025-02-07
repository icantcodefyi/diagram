import { Hero } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features-section";
import { FeaturesSection2 } from "@/components/landing/features-section2";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta-section";
import { Pricing } from "@/components/landing/pricing";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturesSection />
      <FeaturesSection2 />
      <Faq />
      <Pricing />
      <CtaSection />
    </>
  );
} 