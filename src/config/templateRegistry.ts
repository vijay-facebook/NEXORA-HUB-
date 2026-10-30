import { TemplateConfig, TemplateStatus } from './templateTypes';

export const templateRegistry: TemplateConfig[] = [
  {
    id: 'barber-shop',
    name: 'Barber Shop',
    slug: 'barber-shop',
    status: TemplateStatus.READY,
    industryType: "Barber & Men's Grooming"
  },
  {
    id: 'unisex-salon',
    name: 'Unisex Salon',
    slug: 'unisex-salon',
    status: TemplateStatus.PLANNED,
    industryType: 'Unisex Hair & Styling'
  },
  {
    id: 'mens-salon',
    name: "Men's Salon",
    slug: 'mens-salon',
    status: TemplateStatus.PLANNED,
    industryType: "Men's Styling & Grooming"
  },
  {
    id: 'ladies-parlour',
    name: 'Ladies Parlour',
    slug: 'ladies-parlour',
    status: TemplateStatus.PLANNED,
    industryType: "Women's Beauty & Bridal"
  },
  {
    id: 'spa-grooming',
    name: 'Spa & Grooming',
    slug: 'spa-grooming',
    status: TemplateStatus.PLANNED,
    industryType: 'Spa & Wellness'
  },
  {
    id: 'hair-studio',
    name: 'Hair Studio',
    slug: 'hair-studio',
    status: TemplateStatus.PLANNED,
    industryType: 'Hair Design & Coloring'
  },
  {
    id: 'nails-studio',
    name: 'Nails Studio',
    slug: 'nails-studio',
    status: TemplateStatus.PLANNED,
    industryType: 'Nails & Nail Art'
  },
  {
    id: 'beauty-grooming',
    name: 'Beauty & Grooming',
    slug: 'beauty-grooming',
    status: TemplateStatus.PLANNED,
    industryType: 'Total Beauty & Aesthetic Care'
  }
];

export const templateRegistryMap: Record<string, TemplateConfig> = templateRegistry.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, TemplateConfig>);
