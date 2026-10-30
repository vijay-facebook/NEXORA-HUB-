import React from 'react';
import { SalonTemplateShowcase } from '@/src/templates/common/SalonTemplateShowcase';
import { TemplatePricingTable } from '@/src/templates/common/TemplatePricingTable';
import { HeroBanner } from '@/src/components/shared';
import { TEMPLATE_TOKENS } from '@/src/config/designTokens';
import { Calendar, Scissors } from 'lucide-react';

export default function BeautyGroomingTemplate(props: { onBackToDashboard?: () => void; onNavigateToBuilder?: () => void }) {
  const tokens = TEMPLATE_TOKENS['beauty-grooming'];
  const pricingItems = [
    { name: '7-Step Hydra Glow Facial', price: 2499, duration: 60 },
    { name: 'Laser Carbon Peel', price: 3200, duration: 50 },
    { name: 'Full Body Micro-Polish', price: 2600, duration: 70 },
    { name: 'Complete Makeover Session', price: 3500, duration: 90 },
  ];

  return (
    <>
      <HeroBanner 
        headline="TOTAL BEAUTY & ADVANCED AESTHETICS"
        subheadline="Integrated aesthetic skin therapies, glow facials, hair design, and holistic wellness."
        bgImageUrl="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80"
        primaryCta={{ label: "Book Appointment", onClick: () => {} }}
        secondaryCta={{ label: "Explore Services", onClick: () => {}, icon: <Scissors className="w-4 h-4" /> }}
      />
      <SalonTemplateShowcase 
        businessType="Beauty & Grooming"
        templateSlug="beauty-grooming"
        themeColor={tokens.themeColor}
        themeTokens={{ bg: tokens.bg, text: tokens.text, font: tokens.font }}
        customPricingSection={<TemplatePricingTable title="Our Aesthetic Menu" items={pricingItems} themeColor={tokens.themeColor} />}
        services={[
          {
            id: 'bg-1',
            name: '7-Step Hydra Glow Facial',
            description: 'Deep vortex pore extraction, hyaluronic infusion, peptide boost, and cold hammer firming.',
            price: 2499,
            duration: 60,
            category: 'Aesthetics',
            badge: 'High Demand',
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'bg-2',
            name: 'Laser Carbon Peel & Skin Polishing',
            description: 'Non-invasive laser therapy targeting enlarged pores, dullness, and fine expression lines.',
            price: 3200,
            duration: 50,
            category: 'Skin',
            badge: 'Clinical Grade',
            image: 'https://images.unsplash.com/photo-1512290900672-1f02e64f0288?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'bg-3',
            name: 'Full Body Micro-Polish & Hydration',
            description: 'Gentle fruit enzyme exfoliation followed by rich shea butter moisture locking massage.',
            price: 2600,
            duration: 70,
            category: 'Body',
            image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'bg-4',
            name: 'Complete Makeover & Styling Session',
            description: 'Personalized hair cut, organic mask treatment, eyebrow shaping, and express radiance glow.',
            price: 3500,
            duration: 90,
            category: 'Packages',
            badge: 'Best Value',
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
          }
        ]}
        {...props}
      />
    </>
  );
}
