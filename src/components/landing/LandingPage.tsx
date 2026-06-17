'use client';

import dynamic from 'next/dynamic';
import LandingNav from './LandingNav';
import HeroSection from './sections/HeroSection';

const ProblemSection = dynamic(() => import('./sections/ProblemSection'));
const HowItWorksSection = dynamic(() => import('./sections/HowItWorksSection'));
const FeaturesSection = dynamic(() => import('./sections/FeaturesSection'));
const DashboardPreview = dynamic(() => import('./sections/DashboardPreview'));
const IndustriesSection = dynamic(() => import('./sections/IndustriesSection'));
const SecuritySection = dynamic(() => import('./sections/SecuritySection'));
const CollaborationSection = dynamic(() => import('./sections/CollaborationSection'));
const AnalyticsSection = dynamic(() => import('./sections/AnalyticsSection'));
const TestimonialsSection = dynamic(() => import('./sections/TestimonialsSection'));
const PricingSection = dynamic(() => import('./sections/PricingSection'));
const FAQSection = dynamic(() => import('./sections/FAQSection'));
const CTASection = dynamic(() => import('./sections/CTASection'));
const FooterSection = dynamic(() => import('./sections/FooterSection'));

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DashboardPreview />
        <IndustriesSection />
        <SecuritySection />
        <CollaborationSection />
        <AnalyticsSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
