import React, { useState } from 'react';
import { transformations, TransformationItem } from '../data/transformations';
import { Camera, X, ArrowLeft, ArrowRight, Sparkles, SlidersHorizontal, Check } from 'lucide-react';

export const TransformationGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<TransformationItem | null>(null);
  const [viewMode, setViewMode] = useState<'after' | 'before' | 'split'>('after');

  const categories = ['All', 'Skin Fades', 'Classic Cuts', 'Beard Styling', 'Textured Hair', 'Full Makeovers'];

  const filteredItems = selectedCategory === 'All'
    ? transformations
    : transformations.filter(item => item.category === selectedCategory);

  return (
    <section id="gallery" className="bg-[#191919] py-24 px-6 border-b border-[#39352E]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
            <Camera className="w-4 h-4" />
            Proof of Precision
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] tracking-tight">
            Before & After Transformations
          </h2>
          <p className="text-[#A7A7A7] text-sm leading-relaxed">
            Witness the transformative power of razor precision, tailored bone-structure fades, and master beard architecture.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C9A45C] text-[#101010] shadow-md shadow-[#C9A45C]/20'
                  : 'bg-[#222222] text-[#A7A7A7] border border-[#39352E] hover:border-[#C9A45C] hover:text-[#F7F4EE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Transformations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveItem(item);
                setViewMode('after');
              }}
              className="bg-[#222222] border border-[#39352E] hover:border-[#C9A45C] rounded-2xl overflow-hidden cursor-pointer group shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Comparison Box with Overlay Hint */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#101010]">
                  <img
                    src={item.afterImage}
                    alt={`${item.title} - After Transformation`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-[#101010]/80 backdrop-blur-md border border-[#39352E] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-[#F1D9A3] uppercase">
                    {item.category}
                  </div>

                  {/* Click to compare hint */}
                  <div className="absolute inset-0 bg-[#101010]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-mono text-xs font-bold">
                    <SlidersHorizontal className="w-4 h-4 text-[#C9A45C]" />
                    <span>Click to Inspect Before & After</span>
                  </div>

                  {/* Mini thumbnail badge of Before */}
                  <div className="absolute bottom-3 right-3 w-12 h-12 rounded-lg border-2 border-white/60 overflow-hidden shadow-md">
                    <img src={item.beforeImage} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/80 text-[7px] text-center text-white uppercase font-mono">Before</span>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-5 text-left space-y-2">
                  <h3 className="font-serif font-bold text-lg text-[#F7F4EE] group-hover:text-[#F1D9A3] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#A7A7A7] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-[#39352E]/40 flex items-center justify-between text-xs font-mono text-[#A7A7A7]">
                <span>Artisan: <strong className="text-[#F1D9A3]">{item.barberName}</strong></span>
                <span>{item.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox / Comparison Modal */}
        {activeItem && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#191919] border border-[#C9A45C]/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 text-left relative max-h-[95vh] overflow-y-auto">
              
              {/* Close Button */}
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#222222] hover:bg-[#39352E] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 pr-12">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C9A45C] font-bold">
                  {activeItem.category} &bull; Handcrafted by {activeItem.barberName}
                </span>
                <h3 className="text-2xl font-serif font-black text-[#F7F4EE]">
                  {activeItem.title}
                </h3>
              </div>

              {/* View Switcher Toggle */}
              <div className="flex items-center gap-2 bg-[#101010] p-1.5 rounded-xl border border-[#39352E] w-max font-mono text-xs">
                <button
                  onClick={() => setViewMode('after')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'after' ? 'bg-[#C9A45C] text-[#101010]' : 'text-[#A7A7A7] hover:text-white'
                  }`}
                >
                  Final Result (After)
                </button>
                <button
                  onClick={() => setViewMode('before')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'before' ? 'bg-[#C9A45C] text-[#101010]' : 'text-[#A7A7A7] hover:text-white'
                  }`}
                >
                  Initial State (Before)
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'split' ? 'bg-[#C9A45C] text-[#101010]' : 'text-[#A7A7A7] hover:text-white'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>

              {/* Image Preview Box */}
              {viewMode === 'split' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#A7A7A7]">Before Consultation</span>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#39352E]">
                      <img src={activeItem.beforeImage} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#C9A45C]">After Grooming</span>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#C9A45C]">
                      <img src={activeItem.afterImage} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-[#39352E]">
                  <img
                    src={viewMode === 'after' ? activeItem.afterImage : activeItem.beforeImage}
                    alt={viewMode === 'after' ? 'After haircut' : 'Before haircut'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold uppercase text-white">
                    {viewMode === 'after' ? '✨ Final Tailored Style' : '⚠️ Initial Arrival Condition'}
                  </div>
                </div>
              )}

              {/* Description & Technical Notes */}
              <div className="bg-[#101010] p-4 rounded-xl border border-[#39352E] space-y-2 text-xs">
                <span className="font-mono text-[#C9A45C] font-bold uppercase tracking-wider block">Barber Protocol Log</span>
                <p className="text-[#A7A7A7] leading-relaxed">
                  {activeItem.description} Execution took approximately <strong className="text-white">{activeItem.duration}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
