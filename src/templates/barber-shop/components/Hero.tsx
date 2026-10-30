/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Scissors, Award, Sparkles, ShieldCheck, UserCheck, Star } from 'lucide-react';

interface BarberHeroProps {
  onNavigate?: (page: any) => void;
}

export const BarberHero: React.FC<BarberHeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-[#101010] text-center px-6 overflow-hidden py-16">
      
      {/* Background Hero Image with Dark Luxury Vignette Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 opacity-40"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1800')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/90 via-[#101010]/80 to-[#101010]"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Headline & CTA */}
        <div className="lg:col-span-7 text-left space-y-8">
          
          {/* Emblem Top Label */}
          <div className="inline-flex items-center gap-2.5 bg-[#191919]/90 border border-[#C9A45C]/40 px-4 py-1.5 rounded-full text-[#F1D9A3] text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>Jaipur's Premier Men's Grooming Atelier</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black text-[#F7F4EE] tracking-tight leading-[1.1]">
            LOOK SHARP.{' '}
            <span className="text-[#C9A45C] block">FEEL UNSTOPPABLE.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#A7A7A7] text-base sm:text-lg max-w-xl font-sans leading-relaxed">
            Expert haircuts, precision fades, hot towel shaves, and luxury beard sculpting delivered by master craftsmen in Jaipur.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate && onNavigate('booking')}
              className="px-8 py-4 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#C9A45C]/20 hover:scale-105 cursor-pointer flex items-center justify-center gap-2 font-sans"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Your Appointment</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('services')}
              className="px-8 py-4 bg-[#191919]/90 hover:bg-[#222222] text-[#F7F4EE] border border-[#39352E] hover:border-[#C9A45C] rounded-full font-bold uppercase tracking-widest text-xs transition-all cursor-pointer flex items-center justify-center gap-2 font-sans backdrop-blur-md"
            >
              <Scissors className="w-4 h-4 text-[#C9A45C]" />
              <span>Explore Services</span>
            </button>
          </div>

          {/* Trust Indicators Bar */}
          <div className="pt-6 border-t border-[#39352E]/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-[#A7A7A7]">
            <div className="flex items-center gap-2 bg-[#191919]/80 border border-[#39352E] p-3 rounded-xl backdrop-blur-sm">
              <Award className="w-4 h-4 text-[#C9A45C] shrink-0" />
              <span className="text-white font-semibold text-[11px]">Master Barbers</span>
            </div>

            <div className="flex items-center gap-2 bg-[#191919]/80 border border-[#39352E] p-3 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#C9A45C] shrink-0" />
              <span className="text-white font-semibold text-[11px]">Luxury Products</span>
            </div>

            <div className="flex items-center gap-2 bg-[#191919]/80 border border-[#39352E] p-3 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white font-semibold text-[11px]">Autoclave Clean</span>
            </div>

            <div className="flex items-center gap-2 bg-[#191919]/80 border border-[#39352E] p-3 rounded-xl backdrop-blur-sm">
              <UserCheck className="w-4 h-4 text-[#C9A45C] shrink-0" />
              <span className="text-white font-semibold text-[11px]">VIP Experience</span>
            </div>
          </div>

        </div>

        {/* Right Column: Stunning Hero Feature Image Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            
            {/* Glow / Backdrop Effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#C9A45C] to-amber-700 rounded-3xl blur-xl opacity-30 animate-pulse"></div>

            <div className="relative bg-[#191919] border border-[#39352E] rounded-3xl overflow-hidden shadow-2xl p-3">
              <div className="relative h-[380px] sm:h-[440px] rounded-2xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1000" 
                  alt="Master Barber Styling Client" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                {/* Floating Badge 1 */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-[#C9A45C]/40 px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span>Chairs Open Today</span>
                </div>

                {/* Floating Rating Badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 (1,450+ Reviews)</span>
                </div>

                {/* Bottom Card Info Overlay */}
                <div className="absolute bottom-4 inset-x-4 bg-black/80 backdrop-blur-md border border-[#39352E] rounded-2xl p-4 text-left">
                  <span className="text-[10px] text-[#C9A45C] font-mono uppercase tracking-wider block font-bold">Featured Masterwork</span>
                  <h3 className="font-serif text-white font-bold text-sm mt-0.5">The Royal Hot Towel Shave & Skin Fade</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Experience precision Japanese steel craftsmanship and organic soothing oils.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
