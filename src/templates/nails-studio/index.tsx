import React from 'react';
import { SalonTemplateShowcase } from '@/src/templates/common/SalonTemplateShowcase';
import { TemplatePricingTable } from '@/src/templates/common/TemplatePricingTable';
import { HeroBanner } from '@/src/components/shared';
import { TEMPLATE_TOKENS } from '@/src/config/designTokens';
import { Calendar, Scissors } from 'lucide-react';

export default function NailsStudioTemplate(props: { onBackToDashboard?: () => void; onNavigateToBuilder?: () => void }) {
  const tokens = TEMPLATE_TOKENS['nails-studio'];
  const pricingItems = [
    { name: 'Russian Gel Manicure', price: 1100, duration: 60 },
    { name: 'Sculpted Acrylics', price: 2400, duration: 90 },
    { name: 'Herbal Jelly Pedicure', price: 1350, duration: 50 },
    { name: 'Custom 3D Nail Art', price: 600, duration: 30 },
  ];

  return (
    <>
      <HeroBanner 
        headline="FLAWLESS NAIL COUTURE & ART"
        subheadline="Premium gel extensions, Russian precision manicures, custom 3D art, and luxury spa pedicures."
        bgImageUrl="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80"
        primaryCta={{ label: "Book Appointment", onClick: () => {} }}
        secondaryCta={{ label: "Explore Services", onClick: () => {}, icon: <Scissors className="w-4 h-4" /> }}
      />
      <SalonTemplateShowcase 
        businessType="Nails Studio"
        templateSlug="nails-studio"
        themeColor={tokens.themeColor}
        themeTokens={{ bg: tokens.bg, text: tokens.text, font: tokens.font }}
        customPricingSection={<TemplatePricingTable title="Our Nail Menu" items={pricingItems} themeColor={tokens.themeColor} />}
        services={[
          {
            id: 'ns-1',
            name: 'Luxury Russian Gel Manicure',
            description: 'Dry hardware cuticle cleaning with long-lasting gel overlay and glossy topcoat.',
            price: 1100,
            duration: 60,
            category: 'Manicure',
            badge: 'Most Booked',
            image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'ns-2',
            name: 'Sculpted Acrylic Nail Extensions',
            description: 'Custom sculpted extensions with chrome, ombré, or French tip finish.',
            price: 2400,
            duration: 90,
            category: 'Extensions',
            badge: 'Premium',
            image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'ns-3',
            name: 'Herbal Rose Jelly Pedicure',
            description: 'Deep exfoliating jelly soak, dead skin removal, heel buff, and soothing massage.',
            price: 1350,
            duration: 50,
            category: 'Pedicure',
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'ns-4',
            name: 'Custom 3D Hand-Painted Nail Art',
            description: 'Artistic embellishments, crystals, foils, and bespoke miniature painting per set.',
            price: 600,
            duration: 30,
            category: 'Art',
            image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80'
          }
        ]}
        {...props}
      />
    </>
  );
}
