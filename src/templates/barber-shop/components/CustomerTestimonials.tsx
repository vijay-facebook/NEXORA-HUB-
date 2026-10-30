import React from 'react';
import { testimonials } from '../data/testimonials';
import { Star, CheckCircle, ExternalLink, MessageSquare, Quote } from 'lucide-react';

export const CustomerTestimonials: React.FC = () => {
  return (
    <section className="bg-[#101010] py-24 px-6 border-b border-[#39352E]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header with Google Rating Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
              <MessageSquare className="w-4 h-4" />
              Verified Client Impressions
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] tracking-tight">
              Words from the Gentlemen
            </h2>
            <p className="text-[#A7A7A7] text-sm leading-relaxed">
              Read authentic feedback from executives, artists, and gentlemen who trust our barbers with their signature look.
            </p>
          </div>

          {/* Google Review Score Card */}
          <a
            href="https://google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] p-4 rounded-2xl flex items-center gap-4 transition-all group shrink-0"
          >
            <div className="w-12 h-12 rounded-xl bg-[#222222] flex items-center justify-center font-bold text-lg text-white font-serif border border-[#39352E]">
              G
            </div>
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-white text-base">4.9 / 5.0</span>
                <div className="flex text-[#C9A45C]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C9A45C]" />
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-[#A7A7A7] flex items-center gap-1 group-hover:text-[#F1D9A3] transition-colors">
                <span>View 340+ Verified Google Reviews</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="bg-[#191919] border border-[#39352E] p-6 rounded-2xl flex flex-col justify-between space-y-4 text-left relative group hover:border-[#C9A45C]/50 transition-all shadow-md"
            >
              <div className="space-y-4">
                {/* Header with Star Rating & Quote mark */}
                <div className="flex items-center justify-between">
                  <div className="flex text-[#C9A45C]">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C9A45C]" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-[#39352E] group-hover:text-[#C9A45C]/40 transition-colors" />
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                  "{review.reviewText}"
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="pt-4 border-t border-[#39352E]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#F7F4EE]">
                    {review.name}
                  </h4>
                  {review.verified && (
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-mono text-[#A7A7A7] space-y-0.5">
                  <span className="text-[#C9A45C] block truncate">Service: {review.serviceReceived}</span>
                  <div className="flex justify-between text-slate-500 text-[9px]">
                    <span>By {review.barberName}</span>
                    <span>{review.date.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Disclaimer notice */}
        <div className="p-3 bg-[#191919]/60 border border-[#39352E] rounded-xl text-center text-[10px] font-mono text-[#A7A7A7] max-w-xl mx-auto">
          ⚠️ Clearly labeled demo content representative of verified studio reviews until real-time client sync is activated.
        </div>
      </div>
    </section>
  );
};
