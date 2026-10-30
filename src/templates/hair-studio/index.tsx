import React from 'react';
import { SalonTemplateShowcase } from '@/src/templates/common/SalonTemplateShowcase';
import { TemplatePricingTable } from '@/src/templates/common/TemplatePricingTable';
import { HeroBanner } from '@/src/components/shared';
import { TEMPLATE_TOKENS } from '@/src/config/designTokens';
import { Calendar, Scissors } from 'lucide-react';

export default function HairStudioTemplate(props: { onBackToDashboard?: () => void; onNavigateToBuilder?: () => void }) {
  const tokens = TEMPLATE_TOKENS['hair-studio'];
  const pricingItems = [
    { name: 'French Balayage', price: 4500, duration: 180 },
    { name: 'Nanoplastia Straightening', price: 5200, duration: 150 },
    { name: 'Editorial Texture Cut', price: 900, duration: 50 },
    { name: 'Olaplex Reconstruction', price: 1800, duration: 45 },
  ];

  return (
    <>
      <HeroBanner 
        headline="CREATIVE HAIR DESIGN & COLOR"
        subheadline="Avant-garde styling, high-fashion coloring, balayage, and structural hair reconstruction."
        bgImageUrl="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1600&q=80"
        primaryCta={{ label: "Book Appointment", onClick: () => {} }}
        secondaryCta={{ label: "Explore Services", onClick: () => {}, icon: <Scissors className="w-4 h-4" /> }}
      />
      <SalonTemplateShowcase 
        businessType="Hair Studio"
        templateSlug="hair-studio"
        themeColor={tokens.themeColor}
        themeTokens={{ bg: tokens.bg, text: tokens.text, font: tokens.font }}
        customPricingSection={<TemplatePricingTable title="Our Styling Menu" items={pricingItems} themeColor={tokens.themeColor} />}
        services={[
          {
            id: 'hs-1',
            name: 'French Balayage & Gloss Finish',
            description: 'Sun-kissed seamless color blending with organic bond-protecting Olaplex.',
            price: 4500,
            duration: 180,
            category: 'Coloring',
            badge: 'Studio Signature',
            image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'hs-2',
            name: 'Nanoplastia Hair Straightening',
            description: 'Formaldehyde-free organic straightening and gloss sealing treatment.',
            price: 5200,
            duration: 150,
            category: 'Treatments',
            badge: 'Trending',
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'hs-3',
            name: 'Editorial Texture Cut & Styling',
            description: 'Bespoke layered cut tailored to face shape, hair density, and everyday lifestyle.',
            price: 900,
            duration: 50,
            category: 'Cuts',
            image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'hs-4',
            name: 'Olaplex Bond Reconstruction',
            description: 'Intense rebuilding of broken disulfide bonds caused by heat and chemical treatments.',
            price: 1800,
            duration: 45,
            category: 'Repair',
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
          }
        ]}
        {...props}
      />
    </>
  );
}
