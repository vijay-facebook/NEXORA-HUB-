/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, Scissors, Clock, Calendar, CheckCircle2, 
  Star, Phone, MapPin, ChevronRight, ShieldCheck, 
  ArrowRight, Heart, Award, Users, RefreshCw
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  badge?: string;
  image?: string;
}

export interface SalonTemplateProps {
  businessType: string;
  templateSlug: string;
  themeColor?: string;
  headline?: string;
  subheadline?: string;
  services?: ServiceItem[];
  bannerImage?: string;
  customPricingSection?: React.ReactNode;
  themeTokens?: { bg: string; text: string; font: string };
  onBackToDashboard?: () => void;
  onNavigateToBuilder?: () => void;
}

export function SalonTemplateShowcase({
  businessType,
  templateSlug,
  themeColor = 'indigo',
  headline,
  subheadline,
  services,
  bannerImage,
  customPricingSection,
  themeTokens,
  onBackToDashboard,
  onNavigateToBuilder
}: SalonTemplateProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-10-30');
  const [bookingSlot, setBookingSlot] = useState('11:00 AM');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Retrieve active tenant or business profile if stored in localStorage
  let savedProfile: any = null;
  try {
    const raw = localStorage.getItem('nexora_active_business_profile');
    if (raw) savedProfile = JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  const businessName = savedProfile?.tenant?.name || `${businessType} Experience`;
  const businessCity = savedProfile?.tenant?.city || 'Jaipur';
  const businessArea = savedProfile?.tenant?.area || 'C-Scheme';
  const businessPhone = savedProfile?.tenant?.phone || '+91 98290 12345';

  const defaultServices: ServiceItem[] = services || [
    {
      id: 'srv-1',
      name: 'Signature Style Cut & Finish',
      description: 'Precision customized styling consultation, cleanse, and blow-dry finish.',
      price: 650,
      duration: 45,
      category: 'Styling',
      badge: 'Popular',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'srv-2',
      name: 'Deep Conditioning Hair Spa',
      description: 'Intense micro-nourishing hair spa with steamed towel ritual and scalp pressure points.',
      price: 1200,
      duration: 60,
      category: 'Care',
      badge: 'Client Favorite',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'srv-3',
      name: 'Executive Grooming Package',
      description: 'Complete overhaul including haircut, revitalizing facial detox, and hand care.',
      price: 1850,
      duration: 75,
      category: 'Combos',
      badge: 'Best Value',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'srv-4',
      name: 'Express Glow Facial & Detan',
      description: 'Rapid refreshing facial targeting pollution buildup and uneven skin tone.',
      price: 950,
      duration: 40,
      category: 'Skin',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const categories = ['All', ...Array.from(new Set(defaultServices.map(s => s.category)))];
  const filteredServices = activeCategory === 'All' 
    ? defaultServices 
    : defaultServices.filter(s => s.category === activeCategory);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedService) return;
    const ref = 'NX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setBookingSuccess(`Booking Confirmed! Reference ID: #${ref} for ${selectedService.name} on ${bookingDate} at ${bookingSlot}.`);
    setTimeout(() => {
      setSelectedService(null);
      setBookingSuccess(null);
    }, 4000);
  };

  return (
    <div className={`min-h-screen ${themeTokens?.bg || 'bg-slate-950'} ${themeTokens?.text || 'text-slate-100'} ${themeTokens?.font || 'font-sans'} selection:bg-indigo-500 selection:text-white`}>
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white text-xs px-4 py-2.5 flex items-center justify-between border-b border-indigo-700/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="font-semibold">
            NEW LAUNCH SPECIAL: Welcome to {businessName} • 15% OFF your first appointment
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button 
              onClick={onBackToDashboard}
              className="text-[11px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded font-medium transition cursor-pointer"
            >
              ← Back to SalonOS Dashboard
            </button>
          )}
          {onNavigateToBuilder && (
            <button 
              onClick={onNavigateToBuilder}
              className="text-[11px] bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded font-medium transition cursor-pointer shadow"
            >
              🎨 Customize in Builder
            </button>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white">{businessName}</h1>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-indigo-400" />
                <span>{businessArea}, {businessCity} • {businessType}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`tel:${businessPhone}`}
              className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>{businessPhone}</span>
            </a>
            <button 
              onClick={() => setSelectedService(defaultServices[0])}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 cursor-pointer active:scale-95"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </header>

      {headline && (
      <section className="relative py-20 px-6 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src={bannerImage || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80"}
            alt="Ambience" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium {businessType} Experience</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-none">
            {headline}
          </h2>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            {subheadline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button 
              onClick={() => {
                const el = document.getElementById('catalog-services');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xl shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
            >
              <span>Explore Our Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setSelectedService(defaultServices[0])}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Instant Slot Booking
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 text-left">
            {[
              { icon: Award, title: "Master Stylists", desc: "Certified specialists" },
              { icon: ShieldCheck, title: "100% Sanitized", desc: "Hospital-grade safety" },
              { icon: Star, title: "4.9/5 Rating", desc: "Verified customer reviews" },
              { icon: Users, title: "Personalized Care", desc: "Bespoke consultation" }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-indigo-400 mb-2" />
                  <div className="text-xs font-bold text-white">{stat.title}</div>
                  <div className="text-[11px] text-slate-400">{stat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {customPricingSection}

      {/* Services Catalog */}
      <section id="catalog-services" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase">Menu & Pricing</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Our Featured Services</h3>
            <p className="text-xs text-slate-400 mt-1">Transparent pricing in INR. All treatments include consultation.</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  activeCategory === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map(srv => (
            <div 
              key={srv.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
            >
              {srv.image && (
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={srv.image} 
                    alt={srv.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {srv.badge && (
                    <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                      {srv.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-sm text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{srv.duration} mins</span>
                  </span>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {srv.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Price</span>
                    <span className="text-base font-extrabold text-white">₹{srv.price}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedService(srv)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left relative shadow-2xl animate-fadeIn">
            <button 
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-indigo-400 text-[10px] font-mono uppercase tracking-wider font-bold">Booking Step</span>
                <h4 className="text-lg font-bold text-white">{selectedService.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">₹{selectedService.price} • {selectedService.duration} minutes</p>
              </div>

              {bookingSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Appointment Requested</span>
                  </div>
                  <p>{bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px] font-semibold">Your Name *</label>
                    <input 
                      type="text" 
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px] font-semibold">Mobile Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9829012345"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px] font-semibold">Select Date</label>
                      <input 
                        type="date" 
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px] font-semibold">Time Slot</label>
                      <select 
                        value={bookingSlot}
                        onChange={(e) => setBookingSlot(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="03:30 PM">03:30 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:30 PM">06:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer mt-2"
                  >
                    Confirm & Reserve Slot
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-6 text-center text-xs text-slate-500">
        <p>© 2026 {businessName}. All rights reserved.</p>
        <p className="mt-1">Powered by Nexora SalonOS Multi-Tenant Architecture</p>
      </footer>
    </div>
  );
}
