import React, { useState } from 'react';
import { Copy, Check, Scissors, Calendar, Sparkles, Tag, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { PromotionCampaign } from '../../types/promotions';
import { CountdownTimer } from './CountdownTimer';

interface CouponCardProps {
  campaign: PromotionCampaign;
  onApplyAndBook?: (campaign: PromotionCampaign) => void;
  onViewTerms?: (campaign: PromotionCampaign) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({ 
  campaign, 
  onApplyAndBook, 
  onViewTerms 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(campaign.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const isPercent = campaign.discountType === 'percentage';

  return (
    <div className="relative bg-[#141414] border border-[#2D2A24] rounded-2xl overflow-hidden hover:border-[#C9A45C]/60 transition-all duration-300 group shadow-lg flex flex-col justify-between text-left">
      
      {/* Top Banner & Perforated Header */}
      <div className="relative p-5 pb-4 space-y-3">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A45C]/5 blur-2xl pointer-events-none group-hover:bg-[#C9A45C]/10 transition-colors"></div>

        {/* Badge and Tag */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#F1D9A3] font-bold">
            <Sparkles className="w-3 h-3 text-[#C9A45C]" />
            {campaign.bannerBadge || 'Exclusive Privilege'}
          </span>

          {campaign.isGenuineTimeLimited && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 animate-pulse" />
              Time-Limited
            </span>
          )}
        </div>

        {/* Discount Headline */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-serif font-black text-[#F7F4EE] tracking-tight">
              {isPercent ? `${campaign.discountValue}%` : `₹${campaign.discountValue}`}
            </span>
            <span className="text-sm font-mono text-[#C9A45C] font-black uppercase tracking-wider">
              {isPercent ? 'OFF' : 'FLAT OFF'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#F7F4EE] mt-1 group-hover:text-[#F1D9A3] transition-colors line-clamp-1">
            {campaign.campaignName}
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed line-clamp-2">
            {campaign.description}
          </p>
        </div>

        {/* Genuine Countdown (Only when legitimate time-limited offer) */}
        {campaign.isGenuineTimeLimited && campaign.countdownEndsAt && (
          <div className="pt-2 border-t border-[#262420]">
            <CountdownTimer targetDate={campaign.countdownEndsAt} label="Offer Concludes In" compact />
          </div>
        )}
      </div>

      {/* Perforated Tear-off Divider with Cutout Notches */}
      <div className="relative flex items-center justify-between px-4 my-1">
        {/* Left Cutout */}
        <div className="w-4 h-6 bg-[#101010] rounded-r-full -ml-4 border-r border-y border-[#2D2A24]"></div>
        {/* Dashed Line */}
        <div className="flex-1 border-b border-dashed border-[#39352E] mx-2"></div>
        {/* Scissors Indicator */}
        <div className="text-[#C9A45C]/50 rotate-90 px-1">
          <Scissors className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 border-b border-dashed border-[#39352E] mx-2"></div>
        {/* Right Cutout */}
        <div className="w-4 h-6 bg-[#101010] rounded-l-full -mr-4 border-l border-y border-[#2D2A24]"></div>
      </div>

      {/* Voucher Bottom Action Box */}
      <div className="p-5 pt-3 space-y-4 bg-[#111111]/90 rounded-b-2xl flex-1 flex flex-col justify-between">
        
        {/* Min spend & applicable items summary */}
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Min Spend:</span>
            <span className="text-[#F7F4EE] font-bold">₹{campaign.minPurchase}</span>
          </div>
          {campaign.maxDiscount && (
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Max Discount:</span>
              <span className="text-[#F1D9A3] font-bold">₹{campaign.maxDiscount}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Expiry Date:</span>
            <span className="text-slate-300">{campaign.expiryDate}</span>
          </div>
        </div>

        {/* Coupon Code Pill with Copy Action */}
        <div 
          onClick={handleCopy}
          className="flex items-center justify-between bg-[#1A1A1A] border border-[#3A362D] hover:border-[#C9A45C] px-3.5 py-2.5 rounded-xl cursor-pointer transition-all group/code select-none shadow-sm"
          title="Click to copy voucher code"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span className="font-mono font-black text-sm tracking-wider text-[#F1D9A3] group-hover/code:text-white transition-colors">
              {campaign.couponCode}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#C9A45C] group-hover/code:text-[#F1D9A3]">
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </div>
        </div>

        {/* Actions: Apply & Book + Terms */}
        <div className="space-y-2 pt-1">
          {onApplyAndBook && (
            <button
              onClick={() => onApplyAndBook(campaign)}
              className="w-full bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] text-xs font-mono uppercase tracking-widest font-bold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply & Book Chair</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>Limit: {campaign.perCustomerLimit} use{campaign.perCustomerLimit > 1 ? 's' : ''}/guest</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onViewTerms) onViewTerms(campaign);
              }}
              className="text-slate-400 hover:text-[#C9A45C] underline cursor-pointer transition-colors"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
