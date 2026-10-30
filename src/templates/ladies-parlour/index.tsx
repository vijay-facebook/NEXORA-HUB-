import React from 'react';
import { SalonTemplateShowcase } from '@/src/templates/common/SalonTemplateShowcase';
import { TemplatePricingTable } from '@/src/templates/common/TemplatePricingTable';
import { HeroBanner } from '@/src/components/shared';
import { TEMPLATE_TOKENS } from '@/src/config/designTokens';
import { Calendar, Scissors } from 'lucide-react';

export default function LadiesParlourTemplate(props: { onBackToDashboard?: () => void; onNavigateToBuilder?: () => void }) {
  const tokens = TEMPLATE_TOKENS['ladies-parlour'];
  const pricingItems = [
    { name: 'Bridal Glow & Skin Polishing', price: 2999, duration: 90 },
    { name: 'Silk Touch Waxing & Threading', price: 750, duration: 45 },
    { name: 'Moroccan Oil Hair Spa', price: 1650, duration: 60 },
    { name: 'O3+ Whitening Facial', price: 1850, duration: 60 },
  ];

  return (
    <>
      <HeroBanner 
        headline="BEAUTY, BRIDAL & RADIANCE"
        subheadline="Exquisite bridal packages, restorative skincare rituals, and certified beauty therapies."
        bgImageUrl="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80"
        primaryCta={{ label: "Book Appointment", onClick: () => {} }}
        secondaryCta={{ label: "Explore Services", onClick: () => {}, icon: <Scissors className="w-4 h-4" /> }}
      />
      <SalonTemplateShowcase 
        businessType="Ladies Parlour"
        templateSlug="ladies-parlour"
        themeColor={tokens.themeColor}
        themeTokens={{ bg: tokens.bg, text: tokens.text, font: tokens.font }}
        customPricingSection={<TemplatePricingTable title="Our Beauty Menu" items={pricingItems} themeColor={tokens.themeColor} />}
        services={[
          {
            id: 'lp-1',
            name: 'Bridal Glow & Skin Polishing',
            description: 'Multi-layer pearl polish, micro-derma exfoliation, and 24K gold illumination mask.',
            price: 2999,
            duration: 90,
            category: 'Bridal',
            badge: 'Signature',
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'lp-2',
            name: 'Silk Touch Waxing & Threading',
            description: 'Gentle honey-infused cartridge waxing and precise eyebrow threading.',
            price: 750,
            duration: 45,
            category: 'Essentials',
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'lp-3',
            name: 'Moroccan Oil Hair Spa & Mask',
            description: 'Pure argan infusion to repair split ends and revitalize natural shine.',
            price: 1650,
            duration: 60,
            category: 'Hair Care',
            badge: 'Popular',
            image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'lp-4',
            name: 'O3+ Whitening & Brightening Facial',
            description: 'Clinical grade brightening treatment for clear, youthful, luminous skin.',
            price: 1850,
            duration: 60,
            category: 'Facial',
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
          }
        ]}
        {...props}
      />
    </>
  );
}
