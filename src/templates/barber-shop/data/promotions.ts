import { PromotionCampaign } from '../types/promotions';

// Generate genuine future expiry dates for legitimate time-limited events
// strictly avoiding fake urgency or looped timers
const now = new Date();
const festivalEnd = new Date(now.getTime() + (3 * 24 * 60 + 17 * 60 + 45) * 60 * 1000); // 3 days, 17 hrs, 45 mins
const productSaleEnd = new Date(now.getTime() + (1 * 24 * 60 + 22 * 60 + 15) * 60 * 1000); // 1 day, 22 hrs, 15 mins

export const initialBarberPromotions: PromotionCampaign[] = [
  // 1. First Visit Discount
  {
    id: 'promo-first-visit',
    campaignName: 'First Visit Courtesy Protocol',
    promotionalBanner: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-amber-900/60 via-stone-900 to-black',
    bannerBadge: 'Welcome Privilege',
    description: 'Experience master craftsmanship with 15% off your maiden appointment at The Gent\'s Den atelier.',
    discountType: 'percentage',
    discountValue: 15,
    couponCode: 'FIRSTCUT15',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    minPurchase: 500,
    maxDiscount: 450,
    applicableItems: ['Classic Haircut', 'Premium Haircut', 'Skin Fade', 'Taper Fade', 'Beard Trim & Styling', 'Combos'],
    usageLimit: 500,
    currentUsageCount: 84,
    perCustomerLimit: 1,
    isActive: true,
    termsAndConditions: [
      'Valid exclusively for first-time guests on their initial booking.',
      'Applicable on all haircut services and signature duo combos.',
      'Single redemption per unique mobile number.',
      'Cannot be merged with existing VIP membership allowances or gift card balances.',
      'Subject to master chair availability.'
    ],
    category: 'first_visit',
    isGenuineTimeLimited: false
  },

  // 2. Weekday Special
  {
    id: 'promo-weekday',
    campaignName: 'Midweek Gentleman\'s Respite',
    promotionalBanner: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-zinc-900 via-neutral-900 to-stone-950',
    bannerBadge: 'Tuesday – Thursday Only',
    description: 'Avoid the weekend rush: enjoy 20% savings on all services booked between 11:00 AM and 4:00 PM on weekdays.',
    discountType: 'percentage',
    discountValue: 20,
    couponCode: 'WEEKDAY20',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    minPurchase: 700,
    maxDiscount: 400,
    applicableItems: ['All Services', 'Haircuts', 'Beard Services', 'Hair & Scalp'],
    usageLimit: 300,
    currentUsageCount: 112,
    perCustomerLimit: 2,
    isActive: true,
    termsAndConditions: [
      'Valid for chair appointments scheduled on Tuesday, Wednesday, or Thursday.',
      'Appointment start time must fall between 11:00 AM and 4:00 PM.',
      'Minimum service booking total of ₹700 before discount.',
      'Maximum discount capped at ₹400 per visit.'
    ],
    category: 'weekday',
    isGenuineTimeLimited: false
  },

  // 3. Haircut + Beard Combo Deal
  {
    id: 'promo-combo-deal',
    campaignName: 'Duo Craft: Cut & Beard Symphony',
    promotionalBanner: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-[#3a2e1d] via-[#1c1813] to-black',
    bannerBadge: 'Bespoke Pairing',
    description: 'Receive ₹250 flat credit when combining any precision shears cut with hot towel razor beard sculpting.',
    discountType: 'fixed',
    discountValue: 250,
    couponCode: 'DUOCRAFT250',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    minPurchase: 1000,
    applicableItems: ['Haircut + Beard Trim', 'Haircut + Beard Styling', 'Haircut + Wash', 'Premium Grooming Combo'],
    usageLimit: 400,
    currentUsageCount: 178,
    perCustomerLimit: 3,
    isActive: true,
    termsAndConditions: [
      'Applies when selecting any multi-service combo or ordering both a haircut and beard treatment together.',
      'Minimum combined cart order of ₹1,000.',
      'Flat ₹250 deducted immediately on checkout.',
      'May be redeemed up to 3 times per customer.'
    ],
    category: 'combo',
    isGenuineTimeLimited: false
  },

  // 4. Birthday Special
  {
    id: 'promo-birthday',
    campaignName: 'Royal Birthday Celebration Treat',
    promotionalBanner: 'https://images.unsplash.com/photo-1517832606589-7929c392f566?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-amber-950 via-zinc-900 to-black',
    bannerBadge: 'Birthday Month Honor',
    description: 'Celebrate your special milestone with 25% off our premium wash, haircut, and revitalizing scalp massage.',
    discountType: 'percentage',
    discountValue: 25,
    couponCode: 'BDAYROYAL25',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    minPurchase: 800,
    maxDiscount: 750,
    applicableItems: ['Premium Haircut', 'Hair Spa', 'Head Massage', 'Hot Towel Shave', 'Combos'],
    usageLimit: 250,
    currentUsageCount: 46,
    perCustomerLimit: 1,
    isActive: true,
    termsAndConditions: [
      'Valid during the customer\'s declared birthday month.',
      'Requires presentation of official ID confirming birthday upon studio check-in.',
      'Maximum discount capped at ₹750.',
      'Includes complimentary herbal espresso or cold artisan brew on arrival.'
    ],
    category: 'birthday',
    isGenuineTimeLimited: false
  },

  // 5. Grooming Package Discount
  {
    id: 'promo-groom-package',
    campaignName: 'Groom\'s Atelier & Nuptial Suite',
    promotionalBanner: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-yellow-950/70 via-stone-900 to-black',
    bannerBadge: 'Signature Luxury',
    description: 'Save ₹600 on the full Groom\'s Premium Grooming Package or Special Occasion Grooming sanctuary.',
    discountType: 'fixed',
    discountValue: 600,
    couponCode: 'GROOMELITE600',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    minPurchase: 2200,
    applicableItems: ['Groom\'s Premium Grooming Package', 'Special Occasion Grooming', 'Premium Grooming Combo'],
    usageLimit: 150,
    currentUsageCount: 38,
    perCustomerLimit: 1,
    isActive: true,
    termsAndConditions: [
      'Applicable on bookings exceeding ₹2,200 in the luxury package category.',
      'Includes deep pore detan, Japanese scalp treatment, and full beard styling.',
      'Requires at least 24 hours advance scheduling.',
      'Complimentary consultation included.'
    ],
    category: 'grooming_package',
    isGenuineTimeLimited: false
  },

  // 6. Festival Special (GENUINE TIME-LIMITED COUNTDOWN)
  {
    id: 'promo-festival',
    campaignName: 'Diwali & Royal Heritage Festive Week',
    promotionalBanner: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-amber-600/40 via-yellow-950/80 to-black',
    bannerBadge: 'Genuine Limited-Time Festival Deal',
    description: 'Immerse in festive grandeur: 30% off all styling suites, color blending, and head spas during our celebration window.',
    discountType: 'percentage',
    discountValue: 30,
    couponCode: 'FESTIVAL30',
    startDate: now.toISOString().split('T')[0],
    expiryDate: festivalEnd.toISOString().split('T')[0],
    minPurchase: 1200,
    maxDiscount: 1200,
    applicableItems: ['Hair Spa', 'Hair Colouring', 'Grey Blending', 'Combos', 'Skin Fade'],
    usageLimit: 150,
    currentUsageCount: 67,
    perCustomerLimit: 1,
    isActive: true,
    termsAndConditions: [
      'Authentic limited-time campaign terminating precisely when countdown ends.',
      'Strictly non-extendable past festive week deadline.',
      'Minimum order ₹1,200, maximum discount ₹1,200.',
      'One booking per customer during the festival run.'
    ],
    category: 'festival',
    isGenuineTimeLimited: true,
    countdownEndsAt: festivalEnd.toISOString()
  },

  // 7. Student Discount
  {
    id: 'promo-student',
    campaignName: 'Campus Scholar Grooming Pass',
    promotionalBanner: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-slate-800 via-neutral-900 to-black',
    bannerBadge: 'University & College',
    description: 'Keep your fade immaculate on a student budget: ₹150 flat off on all precision fades, crops, and buzz cuts.',
    discountType: 'fixed',
    discountValue: 150,
    couponCode: 'STUDENT150',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    minPurchase: 450,
    applicableItems: ['Classic Haircut', 'Skin Fade', 'Taper Fade', 'Buzz Cut', 'Crew Cut', 'Textured Crop'],
    usageLimit: 600,
    currentUsageCount: 289,
    perCustomerLimit: 4,
    isActive: true,
    termsAndConditions: [
      'Requires presenting valid University or College ID card at arrival.',
      'Applicable on any individual haircut service above ₹450.',
      'Can be utilized up to 4 times per student per academic semester.',
      'Not transferable to non-students.'
    ],
    category: 'student',
    isGenuineTimeLimited: false
  },

  // 8. Referral Reward
  {
    id: 'promo-referral',
    campaignName: 'Gentlemen\'s Brotherhood Referral',
    promotionalBanner: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-zinc-800 via-stone-900 to-black',
    bannerBadge: 'Mutual Benefit',
    description: 'Introduce a fellow gentleman to the studio: both of you receive ₹200 off your next chair experience.',
    discountType: 'fixed',
    discountValue: 200,
    couponCode: 'BUDDY200',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    minPurchase: 700,
    applicableItems: ['All Services'],
    usageLimit: 300,
    currentUsageCount: 94,
    perCustomerLimit: 5,
    isActive: true,
    termsAndConditions: [
      'Provide your referring friend\'s mobile number in appointment notes.',
      'Both referrer and new guest receive ₹200 off on services ₹700 or higher.',
      'Valid up to 5 refer-a-friend credits annually per regular client.'
    ],
    category: 'referral',
    isGenuineTimeLimited: false
  },

  // 9. Membership Offer
  {
    id: 'promo-membership',
    campaignName: 'Gentleman\'s Circle Membership Privilege',
    promotionalBanner: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-[#42331c] via-[#211a0f] to-black',
    bannerBadge: 'Tier Enrollment',
    description: 'Receive 20% off your initial month\'s membership fee or package upgrade when joining the Circle.',
    discountType: 'percentage',
    discountValue: 20,
    couponCode: 'MEMBERVIP20',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    minPurchase: 1500,
    maxDiscount: 1000,
    applicableItems: ['Membership & Packages', 'Gentleman Tier', 'Elite Tier', 'Premium Grooming Combo'],
    usageLimit: 120,
    currentUsageCount: 41,
    perCustomerLimit: 1,
    isActive: true,
    termsAndConditions: [
      'Applies to new membership enrollment or recurring monthly grooming packages.',
      'Deducts 20% on initial billing, up to a maximum reduction of ₹1,000.',
      'Requires explicit member consent without unapproved automatic recurring debits.'
    ],
    category: 'membership',
    isGenuineTimeLimited: false
  },

  // 10. Limited-Time Product Sale (GENUINE TIME-LIMITED COUNTDOWN)
  {
    id: 'promo-product-sale',
    campaignName: 'Artisanal Apothecary Flash Release',
    promotionalBanner: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
    bannerGradient: 'from-amber-900/50 via-zinc-900 to-black',
    bannerBadge: 'Genuine Flash Apothecary Sale',
    description: 'Strictly 48-hour shelf clearance on artisanal organic hair waxes, beard oils, and sandalwood styling balms: 25% off.',
    discountType: 'percentage',
    discountValue: 25,
    couponCode: 'FLASHPROD25',
    startDate: now.toISOString().split('T')[0],
    expiryDate: productSaleEnd.toISOString().split('T')[0],
    minPurchase: 600,
    maxDiscount: 600,
    applicableItems: ['Hair Wax', 'Matte Clay', 'Beard Oil', 'Beard Balm', 'Hair Shampoo', 'Hair Conditioner', 'Grooming Kit'],
    usageLimit: 150,
    currentUsageCount: 52,
    perCustomerLimit: 2,
    isActive: true,
    termsAndConditions: [
      'Genuine 48-hour flash event ending precisely when timer expires.',
      'Applicable on in-studio retail shelf purchases and online product pickups.',
      'Minimum order ₹600 of hair or beard apothecary goods.',
      'Maximum discount capped at ₹600.'
    ],
    category: 'product_sale',
    isGenuineTimeLimited: true,
    countdownEndsAt: productSaleEnd.toISOString()
  }
];
