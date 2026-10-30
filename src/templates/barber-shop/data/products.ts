export interface GroomingProduct {
  id: string;
  name: string;
  category: 'Styling' | 'Beard Care' | 'Hair Care' | 'Tools & Kits';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  size: string;
  inStock: boolean;
  stockCount: number;
  imageUrl: string;
  tagline: string;
  description: string;
}

export const groomingProducts: GroomingProduct[] = [
  {
    id: 'prod-matte-clay',
    name: 'Obsidian Matte Clay',
    category: 'Styling',
    price: 950,
    originalPrice: 1150,
    rating: 4.9,
    reviewsCount: 142,
    size: '100g / 3.5 oz',
    inStock: true,
    stockCount: 24,
    imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=80&w=600',
    tagline: 'High hold, dry matte finish with bentonite clay',
    description: 'Formulated with organic beeswax, bentonite clay, and cedarwood oil. Provides textured all-day control without stiffness or greasy residue.'
  },
  {
    id: 'prod-hair-wax',
    name: 'Sovereign Pomade & Wax',
    category: 'Styling',
    price: 850,
    rating: 4.8,
    reviewsCount: 98,
    size: '100g / 3.5 oz',
    inStock: true,
    stockCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    tagline: 'Medium hold with refined natural satin luster',
    description: 'Water-soluble formula engineered for classic slick-backs, executive side parts, and pompadours. Rinses effortlessly with warm water.'
  },
  {
    id: 'prod-beard-oil',
    name: 'Royal Cedar & Bourbon Beard Oil',
    category: 'Beard Care',
    price: 750,
    originalPrice: 900,
    rating: 5.0,
    reviewsCount: 210,
    size: '50ml / 1.7 fl oz',
    inStock: true,
    stockCount: 35,
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-524f74d081b8?auto=format&fit=crop&q=80&w=600',
    tagline: 'Cold-pressed Moroccan Argan & Golden Jojoba',
    description: 'Softens coarse facial bristles, prevents dry beard itch, and scents the whiskers with warm bourbon, aged oak, and subtle smoke.'
  },
  {
    id: 'prod-beard-balm',
    name: 'Artisan Sandalwood Beard Balm',
    category: 'Beard Care',
    price: 800,
    rating: 4.9,
    reviewsCount: 114,
    size: '60g / 2.1 oz',
    inStock: true,
    stockCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
    tagline: 'Shea butter lock with taming hold',
    description: 'A conditioning leave-in sculpting balm enriched with wild shea butter and pure Mysore sandalwood extract to discipline flyaways.'
  },
  {
    id: 'prod-shampoo',
    name: 'Menthol & Tea Tree Clarifying Shampoo',
    category: 'Hair Care',
    price: 650,
    rating: 4.7,
    reviewsCount: 86,
    size: '250ml / 8.5 fl oz',
    inStock: true,
    stockCount: 20,
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=600',
    tagline: 'Sulfate-free invigorating scalp stimulant',
    description: 'Deeply removes stubborn product buildup and excess sebum while peppermint and tea tree oils awaken micro-circulation in hair follicles.'
  },
  {
    id: 'prod-conditioner',
    name: 'Keratin Fortifying Scalp Conditioner',
    category: 'Hair Care',
    price: 700,
    rating: 4.8,
    reviewsCount: 65,
    size: '250ml / 8.5 fl oz',
    inStock: true,
    stockCount: 16,
    imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=600',
    tagline: 'Weightless protein hydration for thick hair',
    description: 'Infused with hydrolyzed silk proteins and vitamin E to restore hair elasticity, eliminate split ends, and leave strands touchably soft.'
  },
  {
    id: 'prod-comb',
    name: 'Handcrafted Sandalwood Pocket Comb',
    category: 'Tools & Kits',
    price: 450,
    originalPrice: 600,
    rating: 5.0,
    reviewsCount: 175,
    size: '14cm Pocket Size',
    inStock: true,
    stockCount: 40,
    imageUrl: 'https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?auto=format&fit=crop&q=80&w=600',
    tagline: 'Anti-static seamless dual-density teeth',
    description: 'Carved from single-block aromatic green sandalwood. Glides through hair and dense beards without snagging or generating static electricity.'
  },
  {
    id: 'prod-grooming-kit',
    name: 'The Gent\'s Master Grooming Box',
    category: 'Tools & Kits',
    price: 2800,
    originalPrice: 3450,
    rating: 5.0,
    reviewsCount: 89,
    size: 'Complete 5-Piece Atelier Set',
    inStock: true,
    stockCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
    tagline: 'Clay, Beard Oil, Wooden Comb & Boar Bristle Brush',
    description: 'Presented in a solid matte black wooden keepsake box. Includes our signature clay, bourbon oil, pocket comb, horsehair brush, and leather travel pouch.'
  }
];
