/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BusinessTypeOption {
  label: string;
  value: string;
  templateSlug: string;
  templateRoute: string;
  industryType: string;
  description: string;
  badge?: string;
  popularServices: string[];
}

export const BUSINESS_TYPES: BusinessTypeOption[] = [
  {
    label: 'Barber Shop',
    value: 'Barber Shop',
    templateSlug: 'barber-shop',
    templateRoute: '/templates/barber-shop',
    industryType: "Barber & Men's Grooming",
    description: "Traditional fades, hot towel shaves, beard sculpting & classic razor cuts.",
    badge: 'Popular',
    popularServices: ['Skin Fade', 'Hot Towel Shave', 'Beard Trim & Styling', 'Haircut + Wash']
  },
  {
    label: 'Unisex Salon',
    value: 'Unisex Salon',
    templateSlug: 'unisex-salon',
    templateRoute: '/templates/unisex-salon',
    industryType: 'Unisex Hair & Styling',
    description: "Full-service hair styling, balayage, keratin treatments & beauty care for everyone.",
    popularServices: ['Hair Spa', 'Keratin Smoothening', 'Precision Cut', 'Global Hair Color']
  },
  {
    label: "Men's Salon",
    value: "Men's Salon",
    templateSlug: 'mens-salon',
    templateRoute: '/templates/mens-salon',
    industryType: "Men's Styling & Grooming",
    description: "Modern executive grooming, head massages, styling, beard work & facial detox.",
    popularServices: ['Executive Cut', 'De-Tan Facial', 'Beard Spa', 'Scalp Treatment']
  },
  {
    label: 'Ladies Parlour',
    value: 'Ladies Parlour',
    templateSlug: 'ladies-parlour',
    templateRoute: '/templates/ladies-parlour',
    industryType: "Women's Beauty & Bridal",
    description: "Bridal makeovers, skin rejuvenation, threading, waxing & luxury hair rituals.",
    badge: 'High Demand',
    popularServices: ['Bridal Makeover', 'Organic Facial', 'Hair Smoothening', 'Full Body Waxing']
  },
  {
    label: 'Spa & Grooming',
    value: 'Spa & Grooming',
    templateSlug: 'spa-grooming',
    templateRoute: '/templates/spa-grooming',
    industryType: 'Spa & Wellness',
    description: "Deep tissue massage, aroma steam therapies, body polishes & restorative detox.",
    popularServices: ['Aroma Oil Massage', 'Steam & Sauna', 'Foot Reflexology', 'Body Scrub']
  },
  {
    label: 'Hair Studio',
    value: 'Hair Studio',
    templateSlug: 'hair-studio',
    templateRoute: '/templates/hair-studio',
    industryType: 'Hair Design & Coloring',
    description: "Haute couture cutting, creative fashion colors, highlights & texture transformations.",
    popularServices: ['Creative Balayage', 'Hair Bottox', 'Custom Layered Cut', 'Root Touch-Up']
  },
  {
    label: 'Nails Studio',
    value: 'Nails Studio',
    templateSlug: 'nails-studio',
    templateRoute: '/templates/nails-studio',
    industryType: 'Nails & Nail Art',
    description: "Gel extensions, acrylic sets, luxury Russian manicures, pedicures & 3D nail art.",
    popularServices: ['Gel Extensions', 'French Manicure', 'Pedicure Spa', 'Nail Art Design']
  },
  {
    label: 'Beauty & Grooming',
    value: 'Beauty & Grooming',
    templateSlug: 'beauty-grooming',
    templateRoute: '/templates/beauty-grooming',
    industryType: 'Total Beauty & Aesthetic Care',
    description: "Integrated aesthetic skin therapies, glow facials, hair design & holistic wellness.",
    popularServices: ['Hydra Facial', 'Skin Polishing', 'Hair Treatment', 'Eyebrow Microblading']
  },
  {
    label: 'Other',
    value: 'Other',
    templateSlug: 'unisex-salon',
    templateRoute: '/templates/unisex-salon',
    industryType: 'General Salon & Grooming',
    description: "Flexible, versatile website template adaptable for any personalized salon specialty.",
    popularServices: ['Custom Haircut', 'Facial Care', 'Quick Wash & Style']
  }
];

export function getTemplateForBusinessType(businessType: string): BusinessTypeOption {
  if (!businessType) return BUSINESS_TYPES[0];
  const normalized = businessType.trim().toLowerCase();
  
  // Exact match on label or value or slug
  const directMatch = BUSINESS_TYPES.find(b => 
    b.value.toLowerCase() === normalized || 
    b.label.toLowerCase() === normalized ||
    b.templateSlug === normalized
  );
  if (directMatch) return directMatch;

  // Normalized alphanumeric match (handles snake_case e.g. barber_shop, mens_salon)
  const cleanNorm = normalized.replace(/[^a-z0-9]/g, '');
  const slugMatch = BUSINESS_TYPES.find(b => 
    b.templateSlug.replace(/[^a-z0-9]/g, '') === cleanNorm ||
    b.value.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanNorm
  );
  if (slugMatch) return slugMatch;

  return BUSINESS_TYPES[0]; // default to Barber Shop
}
