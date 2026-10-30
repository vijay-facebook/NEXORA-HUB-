export interface MembershipPackage {
  id: string;
  name: string;
  tierTag: string;
  price: number;
  cadence: string;
  validity: string;
  description: string;
  isPopular?: boolean;
  inclusions: string[];
  limitations: string[];
  badgeColor: string;
}

export const membershipPackages: MembershipPackage[] = [
  {
    id: 'pack-essential',
    name: 'The Essential',
    tierTag: 'Foundational Grooming',
    price: 1800,
    cadence: '/ month',
    validity: '30-day billing cycle (manual renewal)',
    description: 'Perfect for the gentleman who maintains a crisp, sharp hairline and immaculate contours every two weeks.',
    badgeColor: 'border-[#39352E] text-slate-300',
    inclusions: [
      '2 Precision Haircuts per month',
      'Complimentary hair wash & blow-dry styling',
      'Priority weekend booking slots',
      '10% discount on all take-home grooming products'
    ],
    limitations: [
      'Non-transferable between clients',
      'Beard sculpting billed separately'
    ]
  },
  {
    id: 'pack-gentleman',
    name: 'The Gentleman',
    tierTag: 'Most Popular',
    price: 3200,
    cadence: '/ month',
    validity: '30-day billing cycle (manual renewal)',
    description: 'Complete grooming protocol balancing head hair precision and tailored beard sculpting with executive perks.',
    isPopular: true,
    badgeColor: 'border-[#C9A45C] text-[#C9A45C]',
    inclusions: [
      '2 Precision Haircuts per month',
      '2 Beard Trim & Sculpting rituals per month',
      '1 Complimentary botanical hot-towel steam shave upgrade',
      'Priority express chair booking (guaranteed within 2 hrs)',
      '15% discount on all styling clay and pomade products',
      'Complimentary artisanal espresso or craft beverage'
    ],
    limitations: [
      'Unused appointments do not roll over to next month'
    ]
  },
  {
    id: 'pack-elite',
    name: 'The Elite Club',
    tierTag: 'VIP Private Atelier',
    price: 5500,
    cadence: '/ month',
    validity: '30-day billing cycle (manual renewal)',
    description: 'Uncompromising luxury for the discerning executive. Full access to our private master barber suite with unlimited maintenance.',
    badgeColor: 'border-[#F1D9A3] text-[#F1D9A3]',
    inclusions: [
      'Unlimited haircut touch-ups and neckline cleanups',
      '4 Full haircut & straight razor beard treatments',
      '1 Monthly Ayurvedic scalp massage & hair spa detox',
      'Exclusive access to the VIP Private Chair room',
      '1 Complimentary guest grooming pass each month',
      'Special Birthday luxury hamper + 20% retail discount',
      'Dedicated direct concierge WhatsApp booking'
    ],
    limitations: [
      'Maximum 1 full treatment session per 48 hours'
    ]
  }
];
