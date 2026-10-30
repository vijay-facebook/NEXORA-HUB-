/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Sparkles, HeartHandshake, Clock, Scissors, Award } from 'lucide-react';

export interface ReasonItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const DEFAULT_BARBER_REASONS: ReasonItem[] = [
  {
    title: 'Master Artisans',
    description: 'Skilled and experienced barbers trained in precision fading, hot towel shaves, and royal grooming techniques.',
    icon: <Scissors className="w-5 h-5 text-[#C9A45C]" />
  },
  {
    title: 'Bespoke Consultations',
    description: 'Tailored hair analysis and face-shape assessments before every cut to ensure a look that is uniquely yours.',
    icon: <Sparkles className="w-5 h-5 text-[#C9A45C]" />
  },
  {
    title: 'Clinical Sterilization',
    description: 'Hospital-grade autoclave sterilization for all metal blades, shears, and combs with single-use cape hygiene.',
    icon: <ShieldCheck className="w-5 h-5 text-[#C9A45C]" />
  },
  {
    title: 'Organic Grooming Formulations',
    description: 'Handcrafted essential oils, organic beard balms, and sulfate-free shampoos sourced from botanical extracts.',
    icon: <HeartHandshake className="w-5 h-5 text-[#C9A45C]" />
  },
  {
    title: 'Sanctuary Ambiance',
    description: 'Leather vintage chairs, complimentary single-malt or espresso refreshments, and an atmosphere of calm refinement.',
    icon: <Award className="w-5 h-5 text-[#C9A45C]" />
  },
  {
    title: 'Seamless Digital Booking',
    description: 'Instant online reservations, appointment reminders, and digital client grooming history accessible anywhere.',
    icon: <Clock className="w-5 h-5 text-[#C9A45C]" />
  }
];

export interface WhyChooseUsProps {
  reasons?: ReasonItem[];
  className?: string;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ reasons = DEFAULT_BARBER_REASONS, className = '' }) => (
  <section className={`bg-[#191919] py-24 border-t border-[#39352E] ${className}`}>
    <div className="max-w-6xl mx-auto px-6 text-center">
      <span className="text-xs font-mono text-[#C9A45C] uppercase tracking-widest font-bold mb-3 block">The Gent's Den Difference</span>
      <h3 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] mb-16">Why Choose Our Atelier</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {reasons.map((reason, index) => (
          <div 
            key={index} 
            className="bg-[#101010] border border-[#39352E] p-8 rounded-3xl hover:border-[#C9A45C]/60 transition-all duration-300 group shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#191919] border border-[#39352E] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow">
                {reason.icon}
              </div>
              <h4 className="text-lg font-serif font-bold text-[#F7F4EE] mb-2">{reason.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{reason.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
