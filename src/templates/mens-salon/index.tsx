import React from 'react';
import { SalonTemplateShowcase } from '@/src/templates/common/SalonTemplateShowcase';
import { MensPricingTable } from '@/src/templates/mens-salon/MensPricingTable';
import { HeroBanner } from '@/src/components/shared';
import { TEMPLATE_TOKENS } from '@/src/config/designTokens';
import { Calendar, Scissors } from 'lucide-react';

export default function MensSalonTemplate(props: { onBackToDashboard?: () => void; onNavigateToBuilder?: () => void }) {
  const tokens = TEMPLATE_TOKENS['mens-salon'];
  return (
    <>
      <HeroBanner 
        headline="MASTERY IN MEN'S GROOMING"
        subheadline="Executive haircuts, precision modern fades, royal hot towel shaves, and restorative scalp treatments crafted for the distinguished gentleman."
        bgImageUrl="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80"
        primaryCta={{ label: "Book Appointment", onClick: () => {} }}
        secondaryCta={{ label: "Explore Services", onClick: () => {}, icon: <Scissors className="w-4 h-4" /> }}
      />
      <SalonTemplateShowcase 
        businessType="Men's Luxury Salon & Barbershop"
        templateSlug="mens-salon"
        themeColor={tokens.themeColor}
        themeTokens={{ bg: tokens.bg, text: tokens.text, font: tokens.font }}
        customPricingSection={<MensPricingTable />}
        services={[
          {
            id: 'ms-1',
            name: 'Modern Skin Fade & Styling',
            description: 'Immaculate zero-fade taper, precision scissor work on top, styled with matte pomade.',
            price: 650,
            duration: 40,
            category: 'Haircuts',
            badge: 'Signature',
            image: 'https://images.unsplash.com/photo-1622607865463-42485f54374c?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'ms-2',
            name: 'Executive Precision Haircut',
            description: 'Consultation, tailored scissor/clipper cut, stimulating shampoo wash, and hot neck shave.',
            price: 850,
            duration: 45,
            category: 'Haircuts',
            badge: 'Most Popular',
            image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'ms-3',
            name: 'Beard Sculpting & Contouring',
            description: 'Razor line-up, cheek contouring, length balancing, and organic argan beard oil massage.',
            price: 450,
            duration: 30,
            category: 'Beard',
            badge: 'Essential',
            image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'ms-4',
            name: 'Royal Hot Towel Shave',
            description: 'Pre-shave botanical oil, steaming eucalyptus hot towels, straight razor glide, and cold alum finish.',
            price: 550,
            duration: 35,
            category: 'Shave',
            badge: 'Classic Luxury',
            image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'ms-5',
            name: 'Revitalizing Scalp Treatment',
            description: 'Deep follicle detox with tea tree oil, micro-steam therapy, and 20-minute tension-relief head massage.',
            price: 1100,
            duration: 50,
            category: 'Treatments',
            badge: 'Recommended',
            image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'ms-6',
            name: 'Gentleman’s Royal Overhaul Combo',
            description: 'Executive Haircut + Beard Sculpting + Hot Towel Shave + Charcoal Face Scrub & Scalp Massage.',
            price: 2200,
            duration: 90,
            category: 'Packages',
            badge: 'Best Value',
            image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80'
          }
        ]}
        {...props}
      />
    </>
  );
}
