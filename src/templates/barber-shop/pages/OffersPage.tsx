import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Tag, Scissors, Search, Filter, ShieldCheck, 
  ArrowRight, CheckCircle2, Clock, Gift, Flame, Percent
} from 'lucide-react';
import { initialBarberPromotions } from '../data/promotions';
import { PromotionCampaign } from '../types/promotions';
import { CouponCard } from '../components/promotions/CouponCard';
import { TermsModal } from '../components/promotions/TermsModal';
import { CouponTesterPlayground } from '../components/promotions/CouponTesterPlayground';
import { CountdownTimer } from '../components/promotions/CountdownTimer';

interface OffersPageProps {
  onNavigate: (page: any, params?: any) => void;
  onSelectCouponForBooking?: (code: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ 
  onNavigate,
  onSelectCouponForBooking
}) => {
  const [promotions, setPromotions] = useState<PromotionCampaign[]>(initialBarberPromotions);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTermsCampaign, setActiveTermsCampaign] = useState<PromotionCampaign | null>(null);

  // Fetch promotions from server if available, fallback to seed
  useEffect(() => {
    fetch('/api/barber-booking/promotions')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setPromotions(data);
        }
      })
      .catch(() => {
        // use initial seed
      });
  }, []);

  // Filter Categories
  const categories = [
    { id: 'all', label: 'All 10 Offers', count: promotions.length },
    { id: 'first_visit', label: 'First Visit', count: promotions.filter(p => p.category === 'first_visit').length },
    { id: 'combo', label: 'Combos & Duos', count: promotions.filter(p => p.category === 'combo' || p.category === 'grooming_package').length },
    { id: 'time_limited', label: 'Time-Limited Flash', count: promotions.filter(p => p.isGenuineTimeLimited).length },
    { id: 'student_referral', label: 'Student & Referral', count: promotions.filter(p => p.category === 'student' || p.category === 'referral').length },
    { id: 'memberships', label: 'VIP & Membership', count: promotions.filter(p => p.category === 'membership' || p.category === 'birthday').length },
    { id: 'product_sale', label: 'Apothecary Products', count: promotions.filter(p => p.category === 'product_sale').length }
  ];

  const filteredPromotions = useMemo(() => {
    return promotions.filter(item => {
      // Category match
      let matchCat = true;
      if (selectedCategory === 'all') matchCat = true;
      else if (selectedCategory === 'time_limited') matchCat = !!item.isGenuineTimeLimited;
      else if (selectedCategory === 'combo') matchCat = item.category === 'combo' || item.category === 'grooming_package';
      else if (selectedCategory === 'student_referral') matchCat = item.category === 'student' || item.category === 'referral';
      else if (selectedCategory === 'memberships') matchCat = item.category === 'membership' || item.category === 'birthday';
      else matchCat = item.category === selectedCategory;

      // Search match
      let matchQuery = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchQuery = 
          item.campaignName.toLowerCase().includes(q) ||
          item.couponCode.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.applicableItems.some(ai => ai.toLowerCase().includes(q));
      }

      return matchCat && matchQuery && item.isActive;
    });
  }, [promotions, selectedCategory, searchQuery]);

  // Featured Hero Campaign (Genuine festival campaign)
  const featuredCampaign = useMemo(() => {
    return promotions.find(p => p.couponCode === 'FESTIVAL30') || promotions[0];
  }, [promotions]);

  const handleApplyAndBook = (campaign: PromotionCampaign) => {
    if (onSelectCouponForBooking) {
      onSelectCouponForBooking(campaign.couponCode);
    }
    // Navigate straight to booking step with coupon preloaded
    onNavigate('booking', { couponCode: campaign.couponCode });
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 animate-fadeIn text-left">
      
      {/* 1. Header Banner & Context */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#F1D9A3] text-xs font-mono font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
          Atelier Privileges & Courtesies
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] leading-tight">
          SPECIAL OFFERS, PACKAGES & VOUCHERS
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
          Explore certified courtesy tariffs, welcome perks, combo pairings, and limited-time festive protocols. Every voucher code is verified directly against our server database.
        </p>
      </div>

      {/* 2. Top Spotlight Banner with Genuine Countdown Timer */}
      {featuredCampaign && featuredCampaign.countdownEndsAt && (
        <div className="relative bg-gradient-to-r from-[#20180F] via-[#2D2111] to-[#17130E] border border-[#C9A45C]/50 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Subtle gold spotlight */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A45C]/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#C9A45C] text-[#101010] font-mono text-[11px] font-black uppercase tracking-wider">
                  Spotlight Privilege
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 border border-[#C9A45C]/30 text-[#F1D9A3] font-mono text-[11px]">
                  Genuine Limited-Time Campaign
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#F7F4EE] leading-tight">
                {featuredCampaign.campaignName} &bull;{' '}
                <span className="text-[#C9A45C]">30% OFF</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {featuredCampaign.description} Valid across luxury combi suites, scalp treatments, and master scissor work until the celebration concludes.
              </p>

              {/* Genuine Countdown */}
              <div className="pt-2">
                <CountdownTimer 
                  targetDate={featuredCampaign.countdownEndsAt} 
                  label="Campaign Strictly Terminates In"
                />
              </div>
            </div>

            {/* Voucher Box */}
            <div className="bg-[#12110E] border border-[#C9A45C]/60 p-6 rounded-2xl shrink-0 w-full lg:w-80 space-y-4 text-center sm:text-left shadow-2xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                Exclusive Coupon Key
              </span>
              <div className="bg-[#1D1912] border border-[#3A3222] p-3 rounded-xl flex items-center justify-between">
                <span className="font-mono text-xl font-black text-[#F1D9A3] tracking-widest">
                  {featuredCampaign.couponCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(featuredCampaign.couponCode);
                    alert(`Copied ${featuredCampaign.couponCode} to clipboard!`);
                  }}
                  className="text-xs font-mono text-[#C9A45C] hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>

              <button
                onClick={() => handleApplyAndBook(featuredCampaign)}
                className="w-full bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] text-xs font-mono font-bold uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Claim & Book Chair</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTermsCampaign(featuredCampaign)}
                className="text-[11px] font-mono text-slate-400 hover:text-[#C9A45C] underline w-full text-center block cursor-pointer transition-colors"
              >
                View Applicable Terms & Limits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Bar & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#C9A45C] text-[#101010] border-[#C9A45C] font-bold shadow-md shadow-[#C9A45C]/20'
                    : 'bg-[#181818] text-slate-300 border-[#2D2A24] hover:border-[#C9A45C]/60 hover:text-white'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, service, or perk..."
              className="w-full bg-[#161616] border border-[#2D2A24] focus:border-[#C9A45C] text-[#F7F4EE] placeholder:text-slate-500 text-xs pl-9 pr-3 py-2 rounded-xl outline-none transition-colors"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
          <span>Showing {filteredPromotions.length} active promotion campaigns</span>
          <span>Server Verified &bull; Real Time</span>
        </div>
      </div>

      {/* 4. Promotional Cards Grid */}
      {filteredPromotions.length === 0 ? (
        <div className="bg-[#141414] border border-[#2D2A24] rounded-3xl p-12 text-center space-y-3">
          <Tag className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-lg font-serif font-bold text-[#F7F4EE]">No Active Promotions Match</h3>
          <p className="text-xs text-slate-400 font-sans">
            Try choosing another filter tab or resetting your search keywords.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-xs font-mono text-[#C9A45C] underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map(promo => (
            <CouponCard
              key={promo.id}
              campaign={promo}
              onApplyAndBook={handleApplyAndBook}
              onViewTerms={(c) => setActiveTermsCampaign(c)}
            />
          ))}
        </div>
      )}

      {/* 5. Live Verification Sandbox Widget */}
      <CouponTesterPlayground />

      {/* 6. Transparency & Protocol Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="bg-[#141414] border border-[#2D2A24] p-6 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#C9A45C]/15 flex items-center justify-center text-[#C9A45C]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-serif font-bold text-[#F7F4EE]">Zero Artificial Urgency</h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            All countdown clocks strictly reflect verified dates and genuine festival durations. Timers never secretly reset upon page refresh.
          </p>
        </div>

        <div className="bg-[#141414] border border-[#2D2A24] p-6 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#C9A45C]/15 flex items-center justify-center text-[#C9A45C]">
            <Percent className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-serif font-bold text-[#F7F4EE]">Instant Server Authorization</h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Discounts are calculated server-side, preventing expired vouchers, ineligible amounts, or exceeded per-customer quotas from causing checkout friction.
          </p>
        </div>

        <div className="bg-[#141414] border border-[#2D2A24] p-6 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#C9A45C]/15 flex items-center justify-center text-[#C9A45C]">
            <Scissors className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-serif font-bold text-[#F7F4EE]">Uncompromising Quality</h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Discounted visits receive the exact same master attention, sterile single-use blades, autoclave tools, and Japanese styling products as regular tariffs.
          </p>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsModal
        campaign={activeTermsCampaign}
        onClose={() => setActiveTermsCampaign(null)}
        onApplyAndBook={handleApplyAndBook}
      />
    </div>
  );
};
