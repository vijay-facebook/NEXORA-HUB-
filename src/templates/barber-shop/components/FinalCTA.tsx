import React from 'react';
import { Calendar, Phone, Sparkles, Scissors, Clock, MapPin, ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onNavigate?: (page: any) => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onNavigate }) => {
  return (
    <section className="relative bg-[#0F0F0F] py-24 px-6 border-b border-[#39352E] overflow-hidden text-center">
      
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A45C_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#C9A45C]/15 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Emblem Badge */}
        <div className="inline-flex items-center gap-2 bg-[#191919] border border-[#C9A45C]/40 px-4 py-1.5 rounded-full text-[#F1D9A3] text-xs font-mono font-bold uppercase tracking-widest shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
          <span>The Sovereign Standard</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-6xl font-serif font-black text-[#F7F4EE] tracking-tight leading-tight">
          YOUR NEXT GREAT LOOK{' '}
          <span className="text-[#C9A45C] block sm:inline">STARTS HERE.</span>
        </h2>

        {/* Subtitle */}
        <p className="text-[#A7A7A7] text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
          Step inside our Civil Lines sanctuary. Sit back with a single-malt or fresh espresso, and let our master barbers sculpt your signature silhouette.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate && onNavigate('booking')}
            className="w-full sm:w-auto px-9 py-4 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#C9A45C]/25 hover:scale-105 cursor-pointer flex items-center justify-center gap-2 font-sans"
          >
            <Calendar className="w-4 h-4" />
            <span>Book an Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate && onNavigate('contact')}
            className="w-full sm:w-auto px-8 py-4 bg-[#191919] hover:bg-[#222222] text-[#F7F4EE] border border-[#39352E] hover:border-[#C9A45C] rounded-full font-bold uppercase tracking-widest text-xs transition-all cursor-pointer flex items-center justify-center gap-2 font-sans"
          >
            <Phone className="w-4 h-4 text-[#C9A45C]" />
            <span>Contact Our Team</span>
          </button>
        </div>

        {/* Micro Details */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#A7A7A7]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C9A45C]" />
            Open 7 Days (9AM - 9PM)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
            Civil Lines, Jaipur
          </span>
          <span>•</span>
          <span className="text-emerald-400">● 100% Autoclave Sanitized</span>
        </div>

      </div>
    </section>
  );
};
