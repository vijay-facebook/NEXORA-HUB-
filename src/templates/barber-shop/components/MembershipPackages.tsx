import React from 'react';
import { membershipPackages, MembershipPackage } from '../data/memberships';
import { Crown, Check, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface MembershipPackagesProps {
  onSelectPackage?: (pkg: MembershipPackage) => void;
}

export const MembershipPackages: React.FC<MembershipPackagesProps> = ({ onSelectPackage }) => {
  return (
    <section id="memberships" className="bg-[#191919] py-24 px-6 border-b border-[#39352E]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
            <Crown className="w-4 h-4" />
            Gentlemen's Privilege
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] tracking-tight">
            Memberships & Grooming Tiers
          </h2>
          <p className="text-[#A7A7A7] text-sm leading-relaxed">
            Curated monthly passes engineered for gentlemen who demand consistent sharpness, priority bookings, and private suite privileges.
          </p>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {membershipPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-[#222222] rounded-3xl p-8 flex flex-col justify-between border relative transition-all duration-300 shadow-xl ${
                pkg.isPopular 
                  ? 'border-[#C9A45C] ring-1 ring-[#C9A45C]/50 md:-translate-y-2' 
                  : 'border-[#39352E] hover:border-[#C9A45C]/50'
              }`}
            >
              {/* Popular Tag */}
              {pkg.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9A45C] text-[#101010] text-[10px] font-mono font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                  ★ Most Recommended Tier
                </div>
              )}

              <div className="space-y-6 text-left">
                {/* Header Meta */}
                <div className="space-y-2 border-b border-[#39352E] pb-6">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block ${pkg.badgeColor}`}>
                    {pkg.tierTag}
                  </span>
                  <h3 className="text-2xl font-serif font-black text-[#F7F4EE]">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#A7A7A7] leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 text-left">
                  <span className="text-xs font-mono text-[#A7A7A7]">₹</span>
                  <span className="text-4xl font-serif font-black text-[#F1D9A3]">
                    {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-[#A7A7A7]">{pkg.cadence}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {pkg.validity}
                </div>

                {/* Inclusions List */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white font-bold block">
                    What’s Included:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {pkg.inclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {pkg.limitations.length > 0 && (
                  <div className="pt-3 border-t border-[#39352E]/40 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-[#A7A7A7] block">Terms:</span>
                    {pkg.limitations.map((lim, idx) => (
                      <div key={idx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#A7A7A7]"></span>
                        <span>{lim}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  onClick={() => onSelectPackage && onSelectPackage(pkg)}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 font-sans ${
                    pkg.isPopular
                      ? 'bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010]'
                      : 'bg-[#101010] hover:bg-[#C9A45C] text-[#F7F4EE] hover:text-[#101010] border border-[#39352E]'
                  }`}
                >
                  <span>Select {pkg.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Policy Notice */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#A7A7A7] bg-[#101010] p-4 rounded-2xl border border-[#39352E] max-w-2xl mx-auto text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Manual monthly passes. No automatic recurring card deductions without your explicit consent.</span>
        </div>
      </div>
    </section>
  );
};
