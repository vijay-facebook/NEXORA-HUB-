export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  reviewText: string;
  serviceReceived: string;
  barberName: string;
  date: string;
  verified: boolean;
  avatarUrl?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Devendra Shekhawat',
    rating: 5,
    reviewText: 'Hands down the best grooming establishment in town. Vikram’s precision with the straight razor is reminiscent of old-school London barbering. The hot eucalyptus towel ritual before the shave is worth every rupee.',
    serviceReceived: 'Groom\'s Premium Grooming Package',
    barberName: 'Vikram "Blade"',
    date: 'October 24, 2026',
    verified: true
  },
  {
    id: 'test-2',
    name: 'Rohan Mathur',
    rating: 5,
    reviewText: 'Finding someone who understands texture on stubborn thick hair is rare. Marcus delivered the cleanest skin fade with effortless textured volume on top. The bespoke amber and bourbon scent in the shop is intoxicating.',
    serviceReceived: 'Skin Fade + Beard Sculpt',
    barberName: 'Marcus D\'Souza',
    date: 'October 19, 2026',
    verified: true
  },
  {
    id: 'test-3',
    name: 'Amanpreet Singh',
    rating: 5,
    reviewText: 'Kabir is a true beard architect. He balanced my jawline symmetry with absolute surgical precision. Walked in feeling scruffy and walked out feeling like a million bucks.',
    serviceReceived: 'Beard Trim & Botanical Styling',
    barberName: 'Kabir Singhania',
    date: 'October 14, 2026',
    verified: true
  },
  {
    id: 'test-4',
    name: 'Siddharth Varma',
    rating: 5,
    reviewText: 'The Gentleman Membership pays for itself in two visits. Priority booking means zero waiting on busy weekends. Complimentary espresso and leather armchairs make it a sanctuary.',
    serviceReceived: 'Haircut + Scalp Detox Spa',
    barberName: 'Arjun Mehra',
    date: 'October 8, 2026',
    verified: true
  }
];
