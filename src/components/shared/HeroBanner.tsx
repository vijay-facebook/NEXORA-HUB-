/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export interface HeroCtaButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export interface HeroBannerProps {
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  headline: React.ReactNode;
  subheadline: string;
  bgImageUrl?: string;
  overlayGradient?: string;
  primaryCta?: HeroCtaButton;
  secondaryCta?: HeroCtaButton;
  extraContent?: React.ReactNode;
  align?: 'center' | 'left';
  minHeight?: string;
  className?: string;
  accentColor?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  badgeText,
  badgeIcon = <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />,
  headline,
  subheadline,
  bgImageUrl = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1800',
  overlayGradient = 'bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950',
  primaryCta,
  secondaryCta,
  extraContent,
  align = 'center',
  minHeight = 'min-h-[80vh]',
  className = '',
  accentColor = '#C9A45C'
}) => {
  const isCentered = align === 'center';

  return (
    <section className={`relative ${minHeight} flex items-center justify-center bg-slate-950 text-${align} px-6 overflow-hidden py-20 ${className}`}>
      
      {/* Background Image with Overlay */}
      {bgImageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 opacity-40"
          style={{ backgroundImage: `url('${bgImageUrl}')` }}
        >
          <div className={`absolute inset-0 ${overlayGradient}`}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]"></div>
        </div>
      )}

      <div className={`max-w-5xl mx-auto relative z-10 space-y-8 w-full ${isCentered ? 'text-center items-center' : 'text-left items-start'} flex flex-col`}>
        
        {/* Badge */}
        {badgeText && (
          <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-300 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md shadow-xl">
            {badgeIcon}
            <span>{badgeText}</span>
          </div>
        )}

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black text-white tracking-tight leading-[1.1]">
          {headline}
        </h1>

        {/* Subheadline */}
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-sans leading-relaxed">
          {subheadline}
        </p>

        {/* CTA Buttons */}
        {(primaryCta || secondaryCta) && (
          <div className={`flex flex-col sm:flex-row items-center gap-4 pt-2 ${isCentered ? 'justify-center' : 'justify-start'}`}>
            {primaryCta && (
              <button
                onClick={primaryCta.onClick}
                className="w-full sm:w-auto px-8 py-4 bg-[#C9A45C] hover:bg-amber-300 text-slate-950 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/20 hover:scale-105 cursor-pointer flex items-center justify-center gap-2 font-sans"
              >
                {primaryCta.icon}
                <span>{primaryCta.label}</span>
              </button>
            )}

            {secondaryCta && (
              <button
                onClick={secondaryCta.onClick}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-500/40 rounded-full font-bold uppercase tracking-widest text-xs transition-all cursor-pointer flex items-center justify-center gap-2 font-sans backdrop-blur-md"
              >
                {secondaryCta.icon}
                <span>{secondaryCta.label}</span>
              </button>
            )}
          </div>
        )}

        {/* Extra Content Slot */}
        {extraContent && (
          <div className="pt-6 w-full">
            {extraContent}
          </div>
        )}

      </div>
    </section>
  );
};

export default HeroBanner;
