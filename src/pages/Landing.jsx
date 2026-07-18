import { useState } from 'react';
import './Landing.css';

import IntroLoader from '../components/landing/IntroLoader';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import FeatureGrid from '../components/landing/FeatureGrid';
import HowItWorks from '../components/landing/HowItWorks';
import StatsRibbon from '../components/landing/StatsRibbon';
import ProductShowcase from '../components/landing/ProductShowcase';
import CommunityTypes from '../components/landing/CommunityTypes';
import Testimonials from '../components/landing/Testimonials';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

export default function Landing() {
  const [introDone, setIntroDone] = useState(
    sessionStorage.getItem('neighbourhub-intro-loaded') === 'true'
  );

  return (
    <main className="font-sans antialiased text-[#20261F] bg-[#F6F5EF] selection:bg-[#E4EBE1] selection:text-[#20261F] min-h-screen">
      {!introDone && (
        <IntroLoader onComplete={() => setIntroDone(true)} />
      )}

      {/* Main Content (Hidden until intro finishes if first visit) */}
      <div className={`transition-opacity duration-1000 ${introDone ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}>
        <Navbar />
        <div className="flex flex-col gap-0 w-full pt-2">
          <Hero />
          <FeatureGrid />
          <HowItWorks />
          <StatsRibbon />
          <ProductShowcase />
          <CommunityTypes />
          <Testimonials />
          <CTA />
        </div>
        <Footer />
      </div>
    </main>
  );
}
