import React from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';

interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  tag: string;
}

const instagramPosts: InstagramPost[] = [
  {
    id: 'ig-1',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
    likes: 428,
    comments: 32,
    tag: '#BarberChair #Atelier'
  },
  {
    id: 'ig-2',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600',
    likes: 652,
    comments: 48,
    tag: '#MidFade #MatteClay'
  },
  {
    id: 'ig-3',
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
    likes: 310,
    comments: 19,
    tag: '#VintageBarbering'
  },
  {
    id: 'ig-4',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
    likes: 540,
    comments: 41,
    tag: '#BeardArchitect'
  },
  {
    id: 'ig-5',
    imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=80&w=600',
    likes: 388,
    comments: 26,
    tag: '#ObsidianClay #Apothecary'
  },
  {
    id: 'ig-6',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    likes: 719,
    comments: 54,
    tag: '#ExecutiveGrooming'
  }
];

export const SocialGallery: React.FC = () => {
  return (
    <section className="bg-[#191919] py-20 px-6 border-b border-[#39352E]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
              <Instagram className="w-4 h-4" />
              Follow The Lifestyle
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#F7F4EE]">
              @thegentsden.barber
            </h2>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#222222] hover:bg-[#C9A45C] text-[#F7F4EE] hover:text-[#101010] border border-[#39352E] hover:border-[#C9A45C] rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer w-max font-sans"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 6-Item Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-2xl overflow-hidden bg-[#222222] group border border-[#39352E] block"
            >
              <img
                src={post.imageUrl}
                alt="Instagram post from The Gent's Den"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              {/* Dark Hover Overlay with Stats */}
              <div className="absolute inset-0 bg-[#101010]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-3 text-center">
                <span className="text-[10px] font-mono text-[#F1D9A3]">{post.tag}</span>
                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    {post.comments}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
