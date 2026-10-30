/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, Instagram, Youtube, Award, Sparkles, 
  ExternalLink, Image as ImageIcon, UserCheck, Quote, ChevronRight, X, Eye 
} from 'lucide-react';
import { BrandedButton } from './BrandedButton';
import { ResponsiveCard } from './ResponsiveCard';

/* -------------------------------------------------------------------------- */
/* 1. Owner Founder Section                                                   */
/* -------------------------------------------------------------------------- */
export interface OwnerFounderProps {
  name?: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
  welcomeMessage?: string;
  yearsExperience?: string | number;
  accentColor?: string; // e.g. '#C9A45C' or 'indigo'
  onBookWithOwner?: () => void;
  className?: string;
}

export const OwnerFounderSection: React.FC<OwnerFounderProps> = ({
  name = "Sanjay Singhal",
  role = "Founder & Creative Master Director",
  photoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
  bio = "With over 14 years of mastery in international hair art and aesthetic grooming, Sanjay envisioned a sanctuary where precision technique meets royal Rajasthani hospitality.",
  welcomeMessage = "Welcome to our studio. We treat every service not just as a haircut or treatment, but as a signature transformation tailored exclusively for you.",
  yearsExperience = "14+ Years",
  accentColor = "#C9A45C",
  onBookWithOwner,
  className = ""
}) => {
  return (
    <section className={`py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto font-sans text-left ${className}`}>
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Owner Headshot Image */}
          <div className="lg:col-span-5 relative group">
            <div className="relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
              <img 
                src={photoUrl} 
                alt={name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                  Experience & Heritage
                </span>
                <span className="text-xl font-extrabold text-white font-serif">
                  {yearsExperience} Mastery
                </span>
              </div>
            </div>
          </div>

          {/* Bio Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span 
                className="text-xs font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full border inline-block"
                style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}
              >
                Meet The Founder
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white tracking-tight leading-tight">
                {name}
              </h2>
              <p className="text-sm font-semibold text-slate-400 font-mono">
                {role}
              </p>
            </div>

            {/* Quote Box */}
            <div className="p-4 sm:p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl relative space-y-2">
              <Quote className="w-8 h-8 text-slate-700 absolute top-3 right-4 opacity-30" />
              <p className="text-xs sm:text-sm text-slate-200 italic font-serif leading-relaxed">
                "{welcomeMessage}"
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {bio}
            </p>

            {onBookWithOwner && (
              <div className="pt-2">
                <BrandedButton
                  variant="gold"
                  size="md"
                  onClick={onBookWithOwner}
                  leftIcon={<Sparkles className="w-4 h-4 text-slate-950" />}
                >
                  Consultation with {name.split(' ')[0]}
                </BrandedButton>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. Video Showcase Section (YouTube & Instagram)                            */
/* -------------------------------------------------------------------------- */
export interface VideoShowcaseProps {
  title?: string;
  subtitle?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  accentColor?: string;
  className?: string;
}

export const VideoShowcaseSection: React.FC<VideoShowcaseProps> = ({
  title = "Studio Walkthrough & Reel Highlights",
  subtitle = "Experience our ambiance, expert treatments, and masterclass reels",
  youtubeUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  instagramUrl = "https://www.instagram.com",
  accentColor = "#C9A45C",
  className = ""
}) => {
  // Convert standard watch URL to embed format if needed
  const getEmbedUrl = (url: string) => {
    if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ";
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(youtubeUrl);

  return (
    <section className={`py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto font-sans text-left ${className}`}>
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span 
            className="text-xs font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full border inline-block"
            style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}
          >
            Video & Social Studio
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Responsive YouTube Player */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="aspect-video w-full relative bg-slate-950">
              <iframe 
                src={embedUrl}
                title="Salon Video Walkthrough"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2 font-mono">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>HD Virtual Salon & Treatment Reel</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">4K Studio Tour</span>
            </div>
          </div>

          {/* Instagram Highlights Card */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-xl min-h-[320px]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Instagram className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white">Instagram Reels & Stories</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Follow our daily client transformations, behind-the-scenes masterclasses, and trending beauty styles live.
                </p>
              </div>
            </div>

            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <span>Follow On Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. Industry Gallery Section (10 High-Res Photos with Lightbox)              */
/* -------------------------------------------------------------------------- */
export interface IndustryGalleryProps {
  title?: string;
  subtitle?: string;
  images?: string[];
  accentColor?: string;
  className?: string;
}

export const IndustryGallerySection: React.FC<IndustryGalleryProps> = ({
  title = "Studio Portfolio & Gallery",
  subtitle = "A curated showcase of our recent artistry and studio space",
  images = [],
  accentColor = "#C9A45C",
  className = ""
}) => {
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  const defaultGallery = [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1605497746444-051d2b6da38e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&q=80&w=800"
  ];

  const galleryList = images.length > 0 ? images.slice(0, 10) : defaultGallery;

  return (
    <section className={`py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto font-sans text-left ${className}`}>
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span 
            className="text-xs font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full border inline-block"
            style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}
          >
            Visual Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Responsive Grid - 10 Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {galleryList.map((imgUrl, index) => (
            <div 
              key={index}
              onClick={() => setActiveModalImage(imgUrl)}
              className="relative aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group cursor-pointer shadow-md hover:border-slate-600 transition-all duration-300"
            >
              <img 
                src={imgUrl} 
                alt={`Studio Portfolio ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Eye className="w-6 h-6 text-white drop-shadow-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeModalImage && (
        <div 
          onClick={() => setActiveModalImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <button
              onClick={() => setActiveModalImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 z-10 cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={activeModalImage} 
              alt="Enlarged Portfolio View"
              className="w-full h-full object-contain max-h-[85vh] bg-slate-950"
            />
          </div>
        </div>
      )}
    </section>
  );
};
