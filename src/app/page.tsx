'use client';

import { Navbar, Footer } from '@/components/Layout';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { LiveDataPhone } from '@/components/LiveDataPhone';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { Clarity } from '@/components/Clarity';
import { Trust } from '@/components/Trust';
import { Satisfaction } from '@/components/Satisfaction';
import { Waitlist } from '@/components/Waitlist';
import { SocialProof } from '@/components/SocialProof';
import { WhatsAppFloating } from '@/components/WhatsAppFloating';
import { BlogSection } from '@/components/BlogSection';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <LiveDataPhone />
      <SubscriptionPlans />
      <Clarity />
      <Trust />
      <Waitlist />
      <BlogSection />
      <Satisfaction />
      <Footer />
      <SocialProof />
      <WhatsAppFloating />
    </main>
  );
}
