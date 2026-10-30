export interface Barber {
  id: string;
  name: string;
  designation: string;
  specialization: string;
  experience: string;
  bio: string;
  photoUrl: string;
  rating: number;
  reviewsCount: number;
  instagram: string;
  schedule: string;
}

export const masterBarbers: Barber[] = [
  {
    id: 'barber-vikram',
    name: 'Vikram "Blade" Rathore',
    designation: 'Master Barber & Founder',
    specialization: 'Traditional Razor Shaves & Executive Fades',
    experience: '12+ Years Experience',
    bio: 'Trained in Mayfair, London and heritage barber salons. Specializes in custom head-shape faded contours and bespoke hot-towel royal shave rituals.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 382,
    instagram: '@blade.vikram',
    schedule: 'Tue - Sun | 10:00 AM - 7:30 PM'
  },
  {
    id: 'barber-marcus',
    name: 'Marcus D\'Souza',
    designation: 'Senior Stylist & Texture Specialist',
    specialization: 'Crop Fades, Mullets & Textured Quiffs',
    experience: '8 Years Experience',
    bio: 'Precision shears artist with an eye for modern runway textures, volume control, and pomade styling for contemporary gentlemen.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 245,
    instagram: '@marcuscuts',
    schedule: 'Wed - Mon | 11:00 AM - 8:30 PM'
  },
  {
    id: 'barber-kabir',
    name: 'Kabir Singhania',
    designation: 'Beard Architect & Grooming Director',
    specialization: 'Full Beard Sculpting, Line-up & Skin Therapy',
    experience: '9 Years Experience',
    bio: 'Master of facial geometry. Uses natural botanical oils and vintage Japanese steel straight razors to chisel pristine jawline definitions.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    reviewsCount: 290,
    instagram: '@kabir_thebearddoc',
    schedule: 'Thu - Tue | 10:30 AM - 8:00 PM'
  },
  {
    id: 'barber-arjun',
    name: 'Arjun Mehra',
    designation: 'Fade Artisan & Colorist',
    specialization: 'Low Skin Tapers, Grey Blending & Scalp Detox',
    experience: '6 Years Experience',
    bio: 'Passionate about crisp zero-gap outlines and subtle natural hair blending for busy executives seeking low-maintenance perfection.',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 178,
    instagram: '@arjun.craftcuts',
    schedule: 'Mon - Sat | 9:30 AM - 6:30 PM'
  }
];
