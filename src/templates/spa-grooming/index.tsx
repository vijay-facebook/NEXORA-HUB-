import React from 'react';
import { SalonTemplateShowcase } from '@/src/templates/common/SalonTemplateShowcase';
import { TemplatePricingTable } from '@/src/templates/common/TemplatePricingTable';
import { HeroBanner } from '@/src/components/shared';
import { TEMPLATE_TOKENS } from '@/src/config/designTokens';
import { Calendar, Scissors } from 'lucide-react';

export default function SpaGroomingTemplate(props: { onBackToDashboard?: () => void; onNavigateToBuilder?: () => void }) {
  const tokens = TEMPLATE_TOKENS['spa-grooming'];
  const pricingItems = [
    { name: 'Swedish Aromatherapy', price: 2200, duration: 60 },
    { name: 'Hot Stone Therapy', price: 2800, duration: 75 },
    { name: 'Dead Sea Body Polish', price: 1950, duration: 50 },
    { name: 'Acupressure Reflexology', price: 1100, duration: 45 },
  ];

  return (
    <>
      <HeroBanner 
        headline="TRANQUILITY, WELLNESS & HARMONY"
        subheadline="Therapeutic massages, hot stone stress relief, and holistic botanical skin treatments."
        bgImageUrl="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80"
        primaryCta={{ label: "Book Appointment", onClick: () => {} }}
        secondaryCta={{ label: "Explore Services", onClick: () => {}, icon: <Scissors className="w-4 h-4" /> }}
      />
      <SalonTemplateShowcase 
        businessType="Spa & Grooming"
        templateSlug="spa-grooming"
        themeColor={tokens.themeColor}
        themeTokens={{ bg: tokens.bg, text: tokens.text, font: tokens.font }}
        customPricingSection={<TemplatePricingTable title="Our Spa Menu" items={pricingItems} themeColor={tokens.themeColor} />}
        services={[
          {
            id: 'spa-1',
            name: 'Swedish Aromatherapy Massage',
            description: 'Full-body soothing rhythmic massage with organic lavender and eucalyptus oils.',
            price: 2200,
            duration: 60,
            category: 'Massages',
            badge: 'Most Relaxing',
            image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'spa-2',
            name: 'Volcanic Hot Stone Therapy',
            description: 'Heated mineral stones placed along energy points to release deep muscle tension.',
            price: 2800,
            duration: 75,
            category: 'Therapy',
            badge: 'Signature',
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'spa-3',
            name: 'Dead Sea Salt Body Polish',
            description: 'Full body exfoliation with mineral-rich mud wrap and aromatic shower.',
            price: 1950,
            duration: 50,
            category: 'Body Care',
            image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'spa-4',
            name: 'Head & Foot Acupressure Reflexology',
            description: 'Focused pressure stimulation to relieve headaches, stress, and fatigue.',
            price: 1100,
            duration: 45,
            category: 'Reflexology',
            image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
          }
        ]}
        {...props}
      />
    </>
  );
}
