import { Navbar } from "@/components/navbar";
import IntroAnimation from "@/components/ui/scroll-morph-hero";
import { FeaturesSection } from "@/components/sections/features-section";
import { FeaturesSection as AnimatedFeaturesSection } from "@/components/ui/feature";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CTASection } from "@/components/sections/cta-section";
import { FooterSection } from "@/components/sections/footer-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen h-full w-full bg-white dark:bg-zinc-950">
        <div className="w-full h-screen">
          <IntroAnimation />
        </div>
        <FeaturesSection />
        <AnimatedFeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
        <FooterSection />
      </main>
    </>
  );
}
