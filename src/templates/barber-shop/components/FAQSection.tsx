import React, { useState } from 'react';
import { barberFAQItems, FAQItem } from '../data/faq';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle, ShieldCheck } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Booking & Visits', 'Services & Barbers', 'Pricing & Membership', 'Hygiene & Retail'];

  const filteredFAQs = barberFAQItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="bg-[#101010] py-24 px-6 border-b border-[#39352E]">
      <div className="max-w-4xl mx-auto space-y-12 text-left">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
            <HelpCircle className="w-4 h-4" />
            Client Clarity & Protocols
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[#A7A7A7] text-sm leading-relaxed">
            Everything you need to know regarding chair reservations, sanitation standards, membership packages, and studio policies.
          </p>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A7A7A7] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic (e.g. walk-ins, refunds, sanitation, payments)..."
              className="w-full bg-[#191919] border border-[#39352E] focus:border-[#C9A45C] rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-500 outline-none transition-colors font-mono"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#A7A7A7] hover:text-white uppercase font-mono"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C9A45C] text-[#101010]'
                    : 'bg-[#191919] text-[#A7A7A7] border border-[#39352E] hover:border-[#C9A45C] hover:text-[#F7F4EE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="bg-[#191919] border border-[#39352E] rounded-2xl p-10 text-center space-y-2">
              <p className="text-sm font-serif text-white">No questions matched your search "{searchQuery}"</p>
              <p className="text-xs text-[#A7A7A7]">Please try different keywords or contact our concierge directly below.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-[#191919] border transition-all rounded-2xl overflow-hidden ${
                    isOpen ? 'border-[#C9A45C]/60 shadow-lg' : 'border-[#39352E] hover:border-[#C9A45C]/30'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-serif font-bold text-base sm:text-lg text-[#F7F4EE]">
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full bg-[#222222] border border-[#39352E] flex items-center justify-center text-[#C9A45C] shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#C9A45C] text-[#101010]' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#A7A7A7] leading-relaxed border-t border-[#39352E]/40 pt-4 font-sans space-y-3 animate-fadeIn">
                      <p>{faq.answer}</p>
                      <span className="inline-block text-[10px] font-mono text-[#C9A45C] uppercase tracking-wider bg-[#222222] px-2.5 py-0.5 rounded">
                        Category: {faq.category}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-[#191919] border border-[#39352E] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-white">Have a specific question not covered here?</h4>
            <p className="text-xs text-[#A7A7A7]">Our Civil Lines desk concierge is ready to assist with scheduling, bespoke packages, or group bookings.</p>
          </div>
          <a
            href="https://wa.me/919829012345"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#222222] hover:bg-[#C9A45C] text-[#F7F4EE] hover:text-[#101010] border border-[#39352E] hover:border-[#C9A45C] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with Concierge</span>
          </a>
        </div>

      </div>
    </section>
  );
};
