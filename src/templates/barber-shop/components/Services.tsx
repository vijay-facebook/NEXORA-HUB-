import React from 'react';
import { Clock, Scissors, ArrowRight, Sparkles } from 'lucide-react';
import { defaultBarberServices, BarberService } from '../data/services';

interface BarberServicesProps {
  onNavigate?: (page: string, params?: any) => void;
  onBookService?: (service: BarberService) => void;
}

export const BarberServices: React.FC<BarberServicesProps> = ({ onNavigate, onBookService }) => {
  // Curate top 6 highlight services for homepage
  const featuredServices = defaultBarberServices.filter(s => s.featured).slice(0, 6);

  const handleBook = (service: BarberService) => {
    if (onBookService) {
      onBookService(service);
    } else if (onNavigate) {
      onNavigate('booking', { serviceId: service.id, serviceName: service.name });
    }
  };

  return (
    <section id="services" className="bg-[#191919] py-24 relative overflow-hidden border-t border-b border-[#39352E]">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C9A45C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#39352E] text-xs font-mono text-[#C9A45C] uppercase tracking-widest">
            <Scissors className="w-3.5 h-3.5" />
            Signature Treatments
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] tracking-tight">
            Crafted for the Modern Gentleman
          </h2>
          <p className="text-[#A7A7A7] text-xs sm:text-sm">
            Discover our curated lineup of classic scissor work, skin fades, beard architecture, and restorative grooming combos.
          </p>
        </div>

        {/* Featured Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredServices.map(service => {
            const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;
            const effectivePrice = hasDiscount ? service.discountedPrice : service.price;

            return (
              <div 
                key={service.id} 
                className="bg-[#222222] border border-[#39352E] rounded-2xl overflow-hidden flex flex-col group hover:border-[#C9A45C]/70 transition-all duration-300 shadow-xl"
              >
                {/* Photo & Badges */}
                <div className="relative h-52 overflow-hidden bg-[#101010]">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#222222]/30 to-transparent" />

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-[#101010]/90 backdrop-blur-md border border-[#39352E] text-[#C9A45C] text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md">
                    {service.category}
                  </span>

                  {/* Popular Flag */}
                  {service.featured && (
                    <span className="absolute top-3 right-3 bg-[#C9A45C] text-[#101010] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Sparkles className="w-2.5 h-2.5 fill-[#101010]" />
                      Popular
                    </span>
                  )}

                  {/* Duration Pill */}
                  <span className="absolute bottom-3 right-3 bg-[#101010]/80 backdrop-blur-md text-[#F7F4EE] text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#39352E]">
                    <Clock className="w-3 h-3 text-[#C9A45C]" />
                    {service.duration} min
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-[#F7F4EE] group-hover:text-[#C9A45C] transition">
                      {service.name}
                    </h3>
                    <p className="text-[#A7A7A7] text-xs leading-relaxed line-clamp-2">
                      {service.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#39352E]/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-mono font-bold text-[#C9A45C]">
                          ₹{effectivePrice}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs font-mono text-[#A7A7A7] line-through">
                            ₹{service.price}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-[#A7A7A7] block">
                        *Indicative sample tariff
                      </span>
                    </div>

                    <button
                      onClick={() => handleBook(service)}
                      className="bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-md"
                    >
                      Book Chair
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Services Callout */}
        <div className="mt-16 text-center space-y-4">
          <button 
            onClick={() => onNavigate && onNavigate('services')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#101010] hover:bg-[#222222] border-2 border-[#C9A45C] text-[#C9A45C] hover:text-[#F1D9A3] rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl group"
          >
            <span>Explore All 32 Grooming Services & Packages</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[11px] font-mono text-[#A7A7A7]">
            Includes 11 Haircuts • 8 Beard Services • 7 Hair & Scalp Treatments • 6 Combos
          </p>
        </div>
      </div>
    </section>
  );
};
