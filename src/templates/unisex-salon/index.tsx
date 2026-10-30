import React from 'react';
import { SalonTemplateShowcase } from '../common/SalonTemplateShowcase';

export default function UnisexSalonTemplate(props: { onBackToDashboard?: () => void; onNavigateToBuilder?: () => void }) {
  return (
    <SalonTemplateShowcase 
      businessType="Unisex Salon"
      templateSlug="unisex-salon"
      headline="ELEGANCE & STYLE FOR EVERYONE"
      subheadline="Contemporary unisex hair artistry, rejuvenating rituals, and bespoke personal care."
      bannerImage="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"
      services={[
        {
          id: 'uni-1',
          name: 'Precision Haircut & Blow Dry',
          description: 'Customized consultation, balancing wash, precision cut, and salon blow dry.',
          price: 750,
          duration: 45,
          category: 'Hair',
          badge: 'Most Popular',
          image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'uni-2',
          name: 'Keratin Smoothing Therapy',
          description: 'Anti-frizz protein infusion for silky, manageable hair lasting up to 12 weeks.',
          price: 3499,
          duration: 120,
          category: 'Treatments',
          badge: 'Premium',
          image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'uni-3',
          name: 'Balayage & Color Gloss',
          description: 'Hand-painted dimensional highlights paired with a toner finish for luminous depth.',
          price: 4200,
          duration: 150,
          category: 'Color',
          image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'uni-4',
          name: 'Revitalizing Herbal Scalp Spa',
          description: 'Deep pore scalp cleansing with organic botanical oils, steam, and massage.',
          price: 1100,
          duration: 50,
          category: 'Care',
          image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
        }
      ]}
      {...props}
    />
  );
}
