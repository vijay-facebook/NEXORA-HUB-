export interface TransformationItem {
  id: string;
  title: string;
  category: 'Skin Fades' | 'Classic Cuts' | 'Beard Styling' | 'Textured Hair' | 'Full Makeovers';
  barberName: string;
  beforeImage: string;
  afterImage: string;
  duration: string;
  description: string;
}

export const transformations: TransformationItem[] = [
  {
    id: 'trans-1',
    title: 'High Drop Fade & Textured Crop',
    category: 'Skin Fades',
    barberName: 'Vikram "Blade"',
    beforeImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=700',
    afterImage: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=700',
    duration: '45 mins',
    description: 'Transitioned an overgrown mop into a razor-sharp mid-to-high skin fade with matte clay textured fringe.'
  },
  {
    id: 'trans-2',
    title: 'Executive Side Part & Beard Contouring',
    category: 'Classic Cuts',
    barberName: 'Kabir Singhania',
    beforeImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=700',
    afterImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=700',
    duration: '60 mins',
    description: 'Refined side part haircut paired with precise razor line-up on the cheekbones and sandalwood beard oil conditioning.'
  },
  {
    id: 'trans-3',
    title: 'Spartan Full Beard Sculpt & Hot Towel Taper',
    category: 'Beard Styling',
    barberName: 'Kabir Singhania',
    beforeImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=700',
    afterImage: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=700',
    duration: '40 mins',
    description: 'Tamed rogue growth, shaped square jawline baseline, and hydrated with cold-pressed cedarwood balm.'
  },
  {
    id: 'trans-4',
    title: 'Natural Curly Taper Fade & Edge-up',
    category: 'Textured Hair',
    barberName: 'Marcus D\'Souza',
    beforeImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=700',
    afterImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700',
    duration: '50 mins',
    description: 'Cleaned bulk around ears with low temple taper while defining natural ringlet curls with leave-in sea salt mist.'
  },
  {
    id: 'trans-5',
    title: 'Complete Groom Wedding Makeover',
    category: 'Full Makeovers',
    barberName: 'Vikram "Blade"',
    beforeImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=700',
    afterImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=700',
    duration: '90 mins',
    description: 'Full detox scalp wash, scissor work, straight razor finish, facial pressure-point massage, and bespoke styling.'
  },
  {
    id: 'trans-6',
    title: 'Zero Low Fade & Matte Quiff Flow',
    category: 'Skin Fades',
    barberName: 'Arjun Mehra',
    beforeImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=700',
    afterImage: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&q=80&w=700',
    duration: '45 mins',
    description: 'Seamless low fade blended into dense top length, blow-dried back with organic styling paste.'
  }
];
