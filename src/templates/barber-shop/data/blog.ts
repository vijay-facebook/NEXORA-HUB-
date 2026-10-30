export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  publishDate: string;
  readTime: string;
  author: string;
  authorRole: string;
  featuredImage: string;
  excerpt: string;
  contentParagraphs: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'how-to-choose-the-right-fade',
    title: 'How to Choose the Right Fade for Your Head Shape',
    category: 'Haircut Guide',
    publishDate: 'October 21, 2026',
    readTime: '4 min read',
    author: 'Vikram "Blade"',
    authorRole: 'Master Barber',
    featuredImage: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Low, mid, high, or taper? Understand bone structure, occipital lines, and hairline density before sitting in the barber chair.',
    contentParagraphs: [
      'The modern fade is not a one-size-fits-all haircut. The angle of your jaw, the flatness of your crown, and how your neckline recedes all dictate where the contrast line should begin.',
      'Low fades best complement oblong and oval face shapes by preserving weight above the temples. High skin fades elongate rounder profiles and create a sharp, military-precision baseline.'
    ]
  },
  {
    id: 'post-2',
    slug: 'five-beard-styles-for-different-face-shapes',
    title: 'Five Beard Styles for Different Face Shapes',
    category: 'Beard Craft',
    publishDate: 'October 16, 2026',
    readTime: '5 min read',
    author: 'Kabir Singhania',
    authorRole: 'Beard Architect',
    featuredImage: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Whether your face is square, round, or diamond, discover how calculated cheekline angles and chin taper balance your proportions.',
    contentParagraphs: [
      'A great beard is optical illusion at its finest. By tapering the sideburns tight and maintaining bulk along the lower chin, a round face instantly gains masculine angularity.',
      'For sharp square jaws, softer rounded edges on the goatee balance heavy bone structure without sacrificing rugged character.'
    ]
  },
  {
    id: 'post-3',
    slug: 'how-to-maintain-your-haircut',
    title: 'How to Maintain Your Haircut Between Barber Visits',
    category: 'Grooming Habits',
    publishDate: 'October 11, 2026',
    readTime: '3 min read',
    author: 'Marcus D\'Souza',
    authorRole: 'Senior Stylist',
    featuredImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Simple daily habits—from blow-dry angling to neck cleanup limits—that stretch your fresh 3-week silhouette effortlessly.',
    contentParagraphs: [
      'Never attempt to redraw your own hairline with a bathroom clipper. Instead, focus on moisturizing the scalp and applying styling clay only to bone-dry hair.',
      'Wash hair with lukewarm water rather than scalding hot showers, which strip natural sebum and cause frizz around your fade line.'
    ]
  },
  {
    id: 'post-4',
    slug: 'best-products-for-mens-hair',
    title: 'Pomade vs. Clay vs. Paste: Best Products for Men’s Hair',
    category: 'Product Breakdown',
    publishDate: 'October 5, 2026',
    readTime: '4 min read',
    author: 'Arjun Mehra',
    authorRole: 'Texture Specialist',
    featuredImage: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Decipher hold levels and shine finishes. Learn why bentonite clay outperforms petroleum pomades for modern textured styling.',
    contentParagraphs: [
      'Clays absorb excess sebum and provide a matte finish that makes thin hair look up to 25% denser in photographic light.',
      'Water-based pomades provide the mirror gloss and firm hold mandatory for classic retro side parts, without clogging pores or staining pillowcases.'
    ]
  },
  {
    id: 'post-5',
    slug: 'pre-wedding-grooming-checklist',
    title: 'The Ultimate 30-Day Pre-Wedding Grooming Checklist',
    category: 'Groom Special',
    publishDate: 'September 28, 2026',
    readTime: '6 min read',
    author: 'Vikram "Blade"',
    authorRole: 'Master Barber',
    featuredImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Do not cut your hair the morning of your wedding! Follow our timeline for test cuts, skin exfoliation, and the golden 48-hour shave.',
    contentParagraphs: [
      'Schedule your final haircut 3 to 4 days prior to the wedding festivities. This allows the fade line to soften naturally into an organic, effortless silhouette for photography.',
      'The hot towel razor shave should take place 24 to 36 hours prior to the main ceremony to ensure zero skin redness or micro-irritation under bright flash bulbs.'
    ]
  }
];
