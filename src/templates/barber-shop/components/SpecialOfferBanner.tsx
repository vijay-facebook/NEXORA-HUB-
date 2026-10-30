import React, { useState } from 'react';
import { Sparkles, Copy, Check, Calendar, Tag, ShieldCheck, ArrowRight } from 'lucide-react';

interface SpecialOfferBannerProps {
  onClaimOffer?: () => void;
}

export const SpecialOfferBanner: React.FC<SpecialOfferBannerProps> = ({ onClaimOffer }) => {
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const promoCode = 'GENTS15';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="bg-gradient-to-r from-[#171511] via-[#221C12] to-[#171511] border-y border-[#C9A45C]/30 py-16 px-6 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C9A45C]/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-[#C9A45C]/15 border border-[#C9A45C]/30 px-3 py-1 rounded-full text-[#F1D9A3] text-xs font-mono font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
            Exclusive Welcome Protocol
          </div>

          <h3 className="text-2xl sm:text-4xl font-serif font-black text-[#F7F4EE] leading-tight">
            YOUR FIRST CUT, ON US? NOT QUITE.{' '}
            <span className="text-[#C9A45C] block sm:inline">BUT IT’S 15% OFF.</span>
          </h3>

          <p className="text-[#A7A7A7] text-sm sm:text-base leading-relaxed font-sans">
            Experience premium grooming with a special welcome offer crafted for first-time gentlemen visiting our studio.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A7A7A7] pt-1">
            <span className="flex items-center gap-1.5 text-[#F1D9A3]">
              <Calendar className="w-3.5 h-3.5 text-[#C9A45C]" />
              Valid until Nov 30, 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#C9A45C]" />
              Applicable on All Haircuts & Combos
            </span>
          </div>

          <div>
            <button 
              onClick={() => setShowTerms(!showTerms)}
              className="text-[11px] text-[#A7A7A7] hover:text-[#C9A45C] underline cursor-pointer transition-colors"
            >
              {showTerms ? 'Hide Offer Terms' : 'View Offer Terms & Conditions'}
            </button>
            {showTerms && (
              <div className="mt-3 p-4 bg-[#101010]/80 border border-[#39352E] rounded-xl text-xs text-[#A7A7A7] space-y-1.5 font-sans animate-fadeIn">
                <p>• One redemption per customer upon initial online booking confirmation or studio desk arrival.</p>
                <p>• Cannot be combined with active monthly membership discounts or wedding party packages.</p>
                <p>• Valid with any Master or Senior Barber subject to chair availability.</p>
              </div>
            )}
          </div>
        </div>

        {/* Promo Code & Action Box */}
        <div className="w-full md:w-auto bg-[#101010] border border-[#C9A45C]/40 p-6 rounded-2xl shadow-2xl space-y-4 shrink-0 text-center sm:text-left min-w-[280px]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#A7A7A7] block text-center">
            Your Secret Invite Code
          </span>

          <div 
            onClick={handleCopyCode}
            className="flex items-center justify-between gap-3 bg-[#191919] border border-[#39352E] px-4 py-3 rounded-xl cursor-pointer hover:border-[#C9A45C] transition-all group"
            title="Click to copy voucher code"
          >
            <span className="font-mono text-xl font-black text-[#F1D9A3] tracking-wider">{promoCode}</span>
            <div className="flex items-center gap-1.5 text-xs text-[#C9A45C] font-bold group-hover:text-white transition-colors">
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClaimOffer}
            className="w-full bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>Claim Your Offer</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Instant 15% discount deducted at desk
          </span>
        </div>
      </div>
    </section>
  );
};
