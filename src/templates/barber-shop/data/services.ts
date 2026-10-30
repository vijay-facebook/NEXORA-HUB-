export type ServiceCategory = 'Haircuts' | 'Beard Services' | 'Hair & Scalp' | 'Combos';

export interface ServiceAddOn {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export interface BarberService {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  shortDesc: string;
  detailedDesc: string;
  price: number;
  discountedPrice?: number | null;
  duration: number; // in minutes
  image: string;
  status: 'available' | 'unavailable' | 'hidden';
  assignedBarbers: string[]; // barber IDs or names
  addOns: ServiceAddOn[];
  bookingEligibility: string;
  featured: boolean;
  taxSettings: string;
  order: number;
}

export const SAMPLE_PRICE_DISCLAIMER = "*Sample indicative pricing in ₹ (INR) for demonstration. All rates are editable placeholders and do not represent actual market or standard salon tariffs.";

export const defaultBarberServices: BarberService[] = [
  // ================= HAIRCUTS (11) =================
  {
    id: 'srv-cut-01',
    name: 'Classic Haircut',
    slug: 'classic-haircut',
    category: 'Haircuts',
    shortDesc: 'Timeless scissor and clipper cut tailored to your facial structure and hair growth pattern.',
    detailedDesc: 'Includes in-depth consultation, precision shears and clipper shaping, neck taper, energizing hair rinse, hot towel finish, and light pomade or matte paste styling.',
    price: 850,
    discountedPrice: 750,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-marcus', 'barber-arjun'],
    addOns: [
      { id: 'ao-scalp-tonic', name: 'Cooling Menthol Scalp Tonic', price: 199, duration: 5 },
      { id: 'ao-neck-shave', name: 'Straight-Razor Warm Cream Neck Shave', price: 249, duration: 10 }
    ],
    bookingEligibility: 'All Clients',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 1
  },
  {
    id: 'srv-cut-02',
    name: 'Premium Haircut',
    slug: 'premium-haircut',
    category: 'Haircuts',
    shortDesc: 'Executive grooming ritual including bespoke consultation, double wash, and scalp rejuvenation.',
    detailedDesc: 'Our flagship hair styling experience. Begins with an espresso or beverage of choice, hair texture analysis, custom hand-shears precision haircut, clarifying double wash, five-minute acupressure head relaxation, cold towel finish, and luxury styling product application.',
    price: 1200,
    discountedPrice: null,
    duration: 55,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-marcus'],
    addOns: [
      { id: 'ao-collagen-eye', name: 'Bio-Cellulose Eye Contour Patch', price: 299, duration: 10 },
      { id: 'ao-charcoal-nose', name: 'Black Charcoal Pore Purifying Strip', price: 199, duration: 10 }
    ],
    bookingEligibility: 'Adults Only (16+)',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 2
  },
  {
    id: 'srv-cut-03',
    name: 'Skin Fade',
    slug: 'skin-fade',
    category: 'Haircuts',
    shortDesc: 'Ultra-crisp zero-gap bald fade blended seamlessly from the skin into scissor-textured top length.',
    detailedDesc: 'Executed using foil shavers, zero-gapped clippers, and ergonomic shears. Choice of low, mid, or high drop fade with sharp foil razor alignment, soothing tea-tree astringent, and textured powder finish.',
    price: 1050,
    discountedPrice: 950,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-arjun', 'barber-marcus'],
    addOns: [
      { id: 'ao-zero-foil', name: 'Double-Foil Micro Finish', price: 149, duration: 5 },
      { id: 'ao-matte-clay', name: 'Sea Salt Spray & Matte Clay Setup', price: 199, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 3
  },
  {
    id: 'srv-cut-04',
    name: 'Taper Fade',
    slug: 'taper-fade',
    category: 'Haircuts',
    shortDesc: 'Subtle graduation on temple sideburns and neckline while retaining natural ear line density.',
    detailedDesc: 'A gentleman’s low-profile fade that preserves fullness above the ear and crown. Perfect for professionals in corporate environments seeking sharp grooming without extreme exposure.',
    price: 950,
    discountedPrice: null,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3395907?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-arjun'],
    addOns: [
      { id: 'ao-temple-razor', name: 'Temple Precision Razor Line', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 4
  },
  {
    id: 'srv-cut-05',
    name: 'Buzz Cut',
    slug: 'buzz-cut',
    category: 'Haircuts',
    shortDesc: 'Uniform all-over military clipper cut with crisp edging, neck taper, and antiseptic rinse.',
    detailedDesc: 'Single or dual guard cut across crown with zero-trim neck taper. Fast, minimalist, impeccably balanced, followed by invigorating tea-tree head towel wipe and skin moisturizer.',
    price: 550,
    discountedPrice: 499,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-arjun', 'barber-marcus'],
    addOns: [
      { id: 'ao-scalp-scrub', name: 'Detoxifying Salt Scalp Scrub', price: 299, duration: 10 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 5
  },
  {
    id: 'srv-cut-06',
    name: 'Crew Cut',
    slug: 'crew-cut',
    category: 'Haircuts',
    shortDesc: 'Short tapered sides with slightly longer, textured horizontal top designed for effortless daily styling.',
    detailedDesc: 'An all-time collegiate classic. Clipped short on the back and sides with custom hand-feathered scissor work on top. Easy to maintain with lightweight wax or cream.',
    price: 750,
    discountedPrice: null,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-marcus', 'barber-vikram'],
    addOns: [
      { id: 'ao-fiber-paste', name: 'High-Hold Fiber Finishing Application', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 6
  },
  {
    id: 'srv-cut-07',
    name: 'Textured Crop',
    slug: 'textured-crop',
    category: 'Haircuts',
    shortDesc: 'Contemporary European blunt or broken fringe with jagged top layering and high skin fade.',
    detailedDesc: 'Forward-flowing French crop with deep point-cutting to build natural volume and separation. Finished with blow dry styling, sea-salt mist, and matte styling dust.',
    price: 1100,
    discountedPrice: 999,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-marcus'],
    addOns: [
      { id: 'ao-matte-dust', name: 'Volume Boost Dust Powder Styling', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 7
  },
  {
    id: 'srv-cut-08',
    name: 'Pompadour Styling',
    slug: 'pompadour-styling',
    category: 'Haircuts',
    shortDesc: 'Voluminous upward and swept-back vintage profile with slick graduated sides.',
    detailedDesc: 'Sculpted for maximum lift and contour. Combines clipper graduation on sides with precision scissor tapering on crown, blow-out round brush volumizing, and high-shine water-based pomade.',
    price: 1250,
    discountedPrice: null,
    duration: 55,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-marcus'],
    addOns: [
      { id: 'ao-shine-pomade', name: 'Organic Argan Lustre Pomade Upgrade', price: 199, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 8
  },
  {
    id: 'srv-cut-09',
    name: 'Scissor Cut',
    slug: 'scissor-cut',
    category: 'Haircuts',
    shortDesc: '100% hand-crafted shears-only styling for softer transitions and natural movement without clippers.',
    detailedDesc: 'Ideal for medium to long hair, wavy, or curly hair types where machines can leave harsh edges. Includes sectioning, slice texturing, botanical shampoo rinse, and leave-in moisture tonic.',
    price: 1150,
    discountedPrice: null,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-marcus', 'barber-vikram'],
    addOns: [
      { id: 'ao-curl-cream', name: 'Hydrating Curl Lock Serum', price: 249, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 9
  },
  {
    id: 'srv-cut-10',
    name: 'Long Hair Trim',
    slug: 'long-hair-trim',
    category: 'Haircuts',
    shortDesc: 'Split-end removal, weight distribution, and perimeter re-balancing for mid-to-long men’s locks.',
    detailedDesc: 'Maintains length while removing dry split ends and reducing bulk. Includes deep conditioning wash, wet sectioning cut, detangling comb-out, and blow dry finish with heat protectant.',
    price: 1300,
    discountedPrice: 1150,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-marcus'],
    addOns: [
      { id: 'ao-deep-mask', name: 'Moroccan Argan Hair Mask Therapy', price: 399, duration: 15 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 10
  },
  {
    id: 'srv-cut-11',
    name: 'Kids\' Haircut',
    slug: 'kids-haircut',
    category: 'Haircuts',
    shortDesc: 'Gentle, patient, and stylish haircut experience designed for young gentlemen under 12.',
    detailedDesc: 'Conducted in our relaxed seating with kid-friendly neck capes, quiet clippers, engaging conversation, gentle scissor work, and a complimentary styling comb plus organic fruit lollipop.',
    price: 650,
    discountedPrice: 550,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-arjun', 'barber-marcus'],
    addOns: [
      { id: 'ao-hair-art', name: 'Side Parting Lightning Razor Line', price: 199, duration: 5 }
    ],
    bookingEligibility: 'Kids Under 12 Years',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 11
  },

  // ================= BEARD SERVICES (8) =================
  {
    id: 'srv-beard-01',
    name: 'Beard Trim',
    slug: 'beard-trim',
    category: 'Beard Services',
    shortDesc: 'Fast length reduction, stray flyaway pruning, and lip line clearing using clippers and shears.',
    detailedDesc: 'Rebalances facial hair volume with guarded clippers, clips unruly hairs, cleans upper lip line, and conditions with premium jojoba and sandalwood beard oil.',
    price: 450,
    discountedPrice: null,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-kabir', 'barber-vikram'],
    addOns: [
      { id: 'ao-beard-balm', name: 'Warm Shea Butter Balm Massage', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 12
  },
  {
    id: 'srv-beard-02',
    name: 'Beard Shaping',
    slug: 'beard-shaping',
    category: 'Beard Services',
    shortDesc: 'Architectural sculpting to enhance jawline symmetry, chin prominence, and cheek line taper.',
    detailedDesc: 'Our beard specialist inspects face geometry, tapering cheek growth into dense chin fullness. Includes hot foam lather, straight razor cheek sharpening, and cold stone soothe.',
    price: 650,
    discountedPrice: 550,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-kabir'],
    addOns: [
      { id: 'ao-hot-towel', name: 'Extra Eucalyptus Steamed Towel Wrap', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 13
  },
  {
    id: 'srv-beard-03',
    name: 'Beard Line-Up',
    slug: 'beard-line-up',
    category: 'Beard Services',
    shortDesc: 'Laser-sharp cheek, mustache, and neckline razor definition without trimming interior bulk.',
    detailedDesc: 'Maintains your established beard mass while sharpening boundaries. Uses transparent shaving gel, surgical Japanese blade, and calming witch hazel compress.',
    price: 350,
    discountedPrice: null,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-kabir', 'barber-arjun'],
    addOns: [
      { id: 'ao-alum-block', name: 'Potassium Alum Antiseptic Seal', price: 99, duration: 3 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 14
  },
  {
    id: 'srv-beard-04',
    name: 'Beard Fade',
    slug: 'beard-fade',
    category: 'Beard Services',
    shortDesc: 'Seamless gradient blending from sideburns into the fullness of your beard for an integrated finish.',
    detailedDesc: 'Connects your haircut fade or sideburn line directly into the beard. Eliminates clumsy disconnects with micro-guard transitions, scissor blending, and matte beard oil.',
    price: 600,
    discountedPrice: null,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-kabir', 'barber-arjun'],
    addOns: [
      { id: 'ao-beard-butter', name: 'Cedarwood Beard Butter Softener', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 15
  },
  {
    id: 'srv-beard-05',
    name: 'Beard Styling',
    slug: 'beard-styling',
    category: 'Beard Services',
    shortDesc: 'Blowout drying, round-brush straightening, conditioning balms, and firm mustache hold wax.',
    detailedDesc: 'Tailored for medium to long, stubborn, or coarse beards. Includes hot oil steam application, boar-bristle brush heat alignment, leave-in conditioner, and mustache twirling.',
    price: 550,
    discountedPrice: 499,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-kabir'],
    addOns: [
      { id: 'ao-wax-pack', name: 'Take-Home Mini Mustache Wax Tin', price: 249, duration: 2 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 16
  },
  {
    id: 'srv-beard-06',
    name: 'Mustache Trim',
    slug: 'mustache-trim',
    category: 'Beard Services',
    shortDesc: 'Focused shear work, lip perimeter clearance, center divide symmetry, and handlebar wax setting.',
    detailedDesc: 'Meticulous detailing of the upper lip. Removes stray hairs, shapes the natural curve (Chevron, Handlebar, Pencil, or Natural), and coats with beeswax styling paste.',
    price: 250,
    discountedPrice: null,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3395907?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-kabir', 'barber-vikram'],
    addOns: [
      { id: 'ao-lip-balm', name: 'Organic Peppermint Lip Salve', price: 129, duration: 2 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 17
  },
  {
    id: 'srv-beard-07',
    name: 'Hot Towel Shave',
    slug: 'hot-towel-shave',
    category: 'Beard Services',
    shortDesc: 'Traditional multi-step barber ritual with botanical oils, steam towels, warm lather, and shave.',
    detailedDesc: 'Experience our signature 7-step relaxation shave: pre-shave aromatic oil rub, two steaming eucalyptus towels to open pores, rich badger-brush warm lather, close razor pass, ice towel pore close, and bay rum splash.',
    price: 750,
    discountedPrice: 650,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-kabir'],
    addOns: [
      { id: 'ao-aloe-mask', name: 'Post-Shave Calming Cucumber Aloe Gel', price: 199, duration: 5 }
    ],
    bookingEligibility: 'Adults Only (16+)',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 18
  },
  {
    id: 'srv-beard-08',
    name: 'Traditional Straight-Razor Shave',
    slug: 'traditional-straight-razor-shave',
    category: 'Beard Services',
    shortDesc: 'The zenith of barbering: two-pass master cut-throat shave with artisanal lather and cold compress.',
    detailedDesc: 'A ritual untouched by time. The master barber prepares the skin with warm sandalwood oil and hot steam. Two passes (with and across grain) yield impossibly smooth skin, followed by alum block tone and luxury aftershave balm.',
    price: 950,
    discountedPrice: null,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram'],
    addOns: [
      { id: 'ao-face-massage', name: '5-Minute Facial Muscle Acupressure', price: 299, duration: 5 }
    ],
    bookingEligibility: 'Adults Only (16+)',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 19
  },

  // ================= HAIR & SCALP (7) =================
  {
    id: 'srv-scalp-01',
    name: 'Hair Wash',
    slug: 'hair-wash',
    category: 'Hair & Scalp',
    shortDesc: 'Clarifying wash with organic tea-tree shampoo, revitalizing conditioner, and scalp rub.',
    detailedDesc: 'Removes styling product residues and environmental pollutants. Includes dual shampoo massage in ergonomic recliner basins, followed by cool scalp water rinse.',
    price: 350,
    discountedPrice: null,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-arjun', 'barber-marcus'],
    addOns: [
      { id: 'ao-cooling-mask', name: 'Mint Scalp Conditioner Infusion', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 20
  },
  {
    id: 'srv-scalp-02',
    name: 'Blow Dry & Styling',
    slug: 'blow-dry-and-styling',
    category: 'Hair & Scalp',
    shortDesc: 'Ionic thermal drying and brush control with bespoke pomades, clays, or matte texture creams.',
    detailedDesc: 'Transforms unmanageable or limp hair into a structured, all-day silhouette. Combines heat-shield spray, ceramic round brush technique, and choice of matte or lustrous hold.',
    price: 450,
    discountedPrice: 399,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-marcus', 'barber-vikram'],
    addOns: [
      { id: 'ao-volume-boost', name: 'Root Lift Powder Application', price: 129, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 21
  },
  {
    id: 'srv-scalp-03',
    name: 'Hair Colouring',
    slug: 'hair-colouring',
    category: 'Hair & Scalp',
    shortDesc: 'Full head uniform coverage or bespoke fashion tones using ammonia-free Italian dyes.',
    detailedDesc: 'Includes patch test consultation, custom shade formulation (Natural Black, Dark Espresso, Chestnut, or Platinum Blonde), even application, color-lock shampoo, and moisture seal.',
    price: 1800,
    discountedPrice: 1599,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-arjun'],
    addOns: [
      { id: 'ao-color-protect', name: 'Keratin Color Protect Treatment', price: 499, duration: 15 }
    ],
    bookingEligibility: 'Adults Only (16+)',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 22
  },
  {
    id: 'srv-scalp-04',
    name: 'Grey Blending',
    slug: 'grey-blending',
    category: 'Hair & Scalp',
    shortDesc: 'Subtle 10-minute tone-down that softens salt-and-pepper hair naturally without harsh dye lines.',
    detailedDesc: 'Formulated for men who desire a youthful touch without an obvious dyed look. Fades gradually over 4–6 weeks without brassy undertones. Applied seamlessly at the wash basin.',
    price: 1200,
    discountedPrice: null,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-arjun', 'barber-vikram'],
    addOns: [
      { id: 'ao-beard-blend', name: 'Add Beard Grey Touchup', price: 599, duration: 15 }
    ],
    bookingEligibility: 'Adults Only (16+)',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 23
  },
  {
    id: 'srv-scalp-05',
    name: 'Hair Spa',
    slug: 'hair-spa',
    category: 'Hair & Scalp',
    shortDesc: 'Deep moisture replenishment, steam hydration, and hair cuticle repair for lifeless hair.',
    detailedDesc: 'Begins with purifying scalp shampoo, followed by rich Moroccan argan butter emulsion, gentle warm ozone steam cap to open cuticles, and 15-minute tension-relief neck and shoulder massage.',
    price: 1400,
    discountedPrice: 1250,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-arjun', 'barber-kabir'],
    addOns: [
      { id: 'ao-ampoule', name: 'Anti-Hairfall Biotin Active Ampoule', price: 449, duration: 10 }
    ],
    bookingEligibility: 'All Clients',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 24
  },
  {
    id: 'srv-scalp-06',
    name: 'Scalp Cleansing',
    slug: 'scalp-cleansing',
    category: 'Hair & Scalp',
    shortDesc: 'Exfoliating salicylic acid and sea salt scrub to eradicate dandruff, excess sebum, and buildup.',
    detailedDesc: 'Targets itchy flaking and congested pores. Features micro-scrub physical exfoliation, clarifying botanical wash, tea tree astringent mist, and high-frequency oxygen scalp stimulation.',
    price: 1100,
    discountedPrice: null,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-arjun'],
    addOns: [
      { id: 'ao-hf-wand', name: 'High Frequency Antibacterial Wand Therapy', price: 299, duration: 10 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 25
  },
  {
    id: 'srv-scalp-07',
    name: 'Head Massage',
    slug: 'head-massage',
    category: 'Hair & Scalp',
    shortDesc: 'Traditional Ayurvedic acupressure massage with warm brahmi and almond oils to alleviate stress.',
    detailedDesc: 'Relieves cranial tension, eye strain, and mental fatigue. Includes warm herbal oil blend, deep acupressure circular strokes on head, temples, back of neck, and upper traps, finished with hot towel compress.',
    price: 650,
    discountedPrice: 550,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-kabir', 'barber-arjun'],
    addOns: [
      { id: 'ao-cold-stone', name: 'Chilled Marble Temple Press', price: 199, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 26
  },

  // ================= COMBOS (6) =================
  {
    id: 'srv-combo-01',
    name: 'Haircut + Beard Trim',
    slug: 'haircut-plus-beard-trim',
    category: 'Combos',
    shortDesc: 'Our most popular everyday combo: full haircut styling with tidy clipper beard grooming.',
    detailedDesc: 'Includes full haircut of your choice (classic, taper, or fade), clipper beard clean-up, hot towel freshener, and premium pomade and beard serum application.',
    price: 1200,
    discountedPrice: 1050,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-marcus', 'barber-kabir', 'barber-arjun'],
    addOns: [
      { id: 'ao-neck-blade', name: 'Razor Sharp Neck Finish', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 27
  },
  {
    id: 'srv-combo-02',
    name: 'Haircut + Beard Styling',
    slug: 'haircut-plus-beard-styling',
    category: 'Combos',
    shortDesc: 'Complete hair redesign combined with precision razor-sharp beard sculpting and blowout.',
    detailedDesc: 'Comprehensive head and facial hair restructuring. Includes precision shear/clipper cut, straight razor beard line-up, steam towel treatment, mustache shaping, and dual finish products.',
    price: 1500,
    discountedPrice: 1350,
    duration: 70,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-kabir'],
    addOns: [
      { id: 'ao-eye-patches', name: 'Hydrogel Eye Refresh Patches', price: 249, duration: 10 }
    ],
    bookingEligibility: 'All Clients',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 28
  },
  {
    id: 'srv-combo-03',
    name: 'Haircut + Wash',
    slug: 'haircut-plus-wash',
    category: 'Combos',
    shortDesc: 'Precision haircut preceded and followed by detoxifying shampoo, scalp rub, and blowout.',
    detailedDesc: 'Guarantees you leave the den sharp and 100% free of loose hair clippings. Includes initial clarifying wash, tailored haircut, second refreshing rinse, and thermal blow-dry styling.',
    price: 1100,
    discountedPrice: 999,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3395907?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-marcus', 'barber-arjun'],
    addOns: [
      { id: 'ao-tea-tree', name: 'Tea Tree Invigorating Scalp Oil', price: 149, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 29
  },
  {
    id: 'srv-combo-04',
    name: 'Premium Grooming Combo',
    slug: 'premium-grooming-combo',
    category: 'Combos',
    shortDesc: 'The Gentleman’s Executive suite: haircut, hot towel straight razor shave, and 15-min head massage.',
    detailedDesc: 'Our signature restorative package. Includes custom haircut styling, complete 7-step hot towel straight razor shave, double shampoo wash, and deep Indian head massage to relieve tension.',
    price: 2200,
    discountedPrice: 1899,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-kabir'],
    addOns: [
      { id: 'ao-face-scrub', name: 'Volcanic Ash Facial Exfoliation', price: 349, duration: 10 }
    ],
    bookingEligibility: 'Adults Only (16+)',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 30
  },
  {
    id: 'srv-combo-05',
    name: 'Special Occasion Grooming',
    slug: 'special-occasion-grooming',
    category: 'Combos',
    shortDesc: 'Designed for black-tie galas, anniversaries, award nights, and high-stakes media appearances.',
    detailedDesc: 'Includes signature haircut, subtle grey blending or color gloss, beard detailing, express charcoal face clean-up, eye revive patches, and long-lasting photo-ready hold spray.',
    price: 2800,
    discountedPrice: 2499,
    duration: 105,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-marcus'],
    addOns: [
      { id: 'ao-fragrance', name: 'Artisan Cologne Spritz & Pocket Comb', price: 299, duration: 5 }
    ],
    bookingEligibility: 'All Clients',
    featured: false,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 31
  },
  {
    id: 'srv-combo-06',
    name: 'Groom\'s Package',
    slug: 'grooms-package',
    category: 'Combos',
    shortDesc: 'The ultimate royal groom preparation: bespoke hair design, beard architecture, facial, and spa.',
    detailedDesc: 'An opulent 2.5-hour private chair ritual tailored for wedding days. Includes bespoke haircut, master straight-razor shave or beard sculpting, deep nourishing hair spa, brightening botanical facial scrub, hand paraffin soften, and complimentary groom styling kit.',
    price: 4500,
    discountedPrice: 3899,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    assignedBarbers: ['barber-vikram', 'barber-kabir'],
    addOns: [
      { id: 'ao-groomsman-pass', name: 'Add Groomsman Haircut Pass (Per Person)', price: 999, duration: 40 }
    ],
    bookingEligibility: 'Grooms & Wedding Parties',
    featured: true,
    taxSettings: '18% GST Applicable (Included in display price)',
    order: 32
  }
];

export const barberServices = defaultBarberServices;
