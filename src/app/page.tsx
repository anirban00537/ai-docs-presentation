import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/blocks/hero-section-1";
import IntroAnimation from "@/components/ui/scroll-morph-hero";
import { FeaturesSection } from "@/components/sections/features-section";
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
        <HeroSection />
        <div className="w-full h-screen">
          <IntroAnimation />
        </div>
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
        <FooterSection />
      </main>
    </>
  );
}
