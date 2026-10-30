/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Users, Star, Scissors } from 'lucide-react';

export interface StatItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export const DEFAULT_BARBER_STATS: StatItem[] = [
  { label: 'Years of Experience', value: '5+', icon: <Award className="w-5 h-5 text-[#C9A45C]" /> },
  { label: 'Happy Clients Served', value: '1,000+', icon: <Users className="w-5 h-5 text-[#C9A45C]" /> },
  { label: 'Client Satisfaction', value: '4.8 / 5', icon: <Star className="w-5 h-5 text-[#C9A45C]" /> },
  { label: 'Master Barbers', value: '5+', icon: <Scissors className="w-5 h-5 text-[#C9A45C]" /> },
];

export interface TrustStatsProps {
  stats?: StatItem[];
  className?: string;
}

export const TrustStats: React.FC<TrustStatsProps> = ({ stats = DEFAULT_BARBER_STATS, className = '' }) => (
  <section className={`bg-[#101010] py-20 border-t border-b border-[#39352E] ${className}`}>
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <span className="text-xs font-mono text-[#C9A45C] uppercase tracking-widest font-bold">Uncompromising Standards</span>
        <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#F7F4EE] mt-2">Trusted by Gentlemen Across the City</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-[#191919] border border-[#39352E] p-6 sm:p-8 rounded-2xl text-center shadow-lg group hover:border-[#C9A45C]/50 transition-all duration-300"
          >
            {stat.icon && <div className="flex justify-center mb-3">{stat.icon}</div>}
            <div className="text-3xl sm:text-4xl font-serif text-[#C9A45C] font-black mb-2 tracking-wide">{stat.value}</div>
            <div className="text-[#A7A7A7] text-xs uppercase tracking-widest font-mono font-bold">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustStats;
