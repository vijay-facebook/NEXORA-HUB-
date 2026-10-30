import React from 'react';
import { X, ShieldCheck, Tag, Calendar, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PromotionCampaign } from '../../types/promotions';

interface TermsModalProps {
  campaign: PromotionCampaign | null;
  onClose: () => void;
  onApplyAndBook?: (campaign: PromotionCampaign) => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ campaign, onClose, onApplyAndBook }) => {
  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#141414] border border-[#39352E] max-w-xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#F1D9A3] text-[11px] font-mono uppercase tracking-wider font-semibold">
            <Tag className="w-3 h-3 text-[#C9A45C]" />
            Official Campaign Protocol
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#F7F4EE]">
            {campaign.campaignName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Voucher Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1A1A1A] p-4 rounded-xl border border-[#2D2A24] font-mono text-xs">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Coupon Code</span>
            <span className="text-[#F1D9A3] font-bold text-sm tracking-wider">{campaign.couponCode}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Benefit</span>
            <span className="text-emerald-400 font-bold text-sm">
              {campaign.discountType === 'percentage' ? `${campaign.discountValue}% OFF` : `₹${campaign.discountValue} FLAT OFF`}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Min Spend</span>
            <span className="text-[#F7F4EE] font-bold text-sm">₹{campaign.minPurchase}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Valid Until</span>
            <span className="text-slate-300 font-bold text-xs">{campaign.expiryDate}</span>
          </div>
        </div>

        {/* Applicable Items */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-[#C9A45C] tracking-wider font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Applicable Services & Treatments
          </span>
          <div className="flex flex-wrap gap-1.5">
            {campaign.applicableItems.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-[#222] border border-[#333] text-[11px] font-sans text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Terms & Conditions List */}
        <div className="space-y-2.5">
          <span className="text-xs font-mono uppercase text-[#C9A45C] tracking-wider font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Terms, Conditions & Usage Limits
          </span>
          <ul className="space-y-2 text-xs font-sans text-slate-300 leading-relaxed">
            {campaign.termsAndConditions.map((term, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A45C] shrink-0 mt-0.5" />
                <span>{term}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500/80 shrink-0 mt-0.5" />
              <span>Customer redemption limit: Max {campaign.perCustomerLimit} redemption{campaign.perCustomerLimit > 1 ? 's' : ''} per client account.</span>
            </li>
            {campaign.maxDiscount && (
              <li className="flex items-start gap-2 text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500/80 shrink-0 mt-0.5" />
                <span>Maximum concession capped at ₹{campaign.maxDiscount}.</span>
              </li>
            )}
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#2D2A24] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#39352E] text-slate-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
          {onApplyAndBook && (
            <button
              onClick={() => {
                onApplyAndBook(campaign);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] text-xs font-mono uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Apply & Book Chair</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
