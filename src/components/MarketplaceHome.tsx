/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Sparkles, Filter, ShieldCheck, 
  Flame, Award, ShoppingBag, Eye, Volume2, VolumeX, ArrowRight,
  TrendingUp, Check, Star, Navigation, Clock, Gift,
  Compass, Mic, Copy, Smartphone, Building, Users,
  CheckCircle, Truck, Info, Globe, Activity, Wifi, Play, X, ChevronRight, Briefcase, ShieldAlert
} from 'lucide-react';
import { Tenant, Service } from '../types';
import GlobalSearch from './GlobalSearch';
import { SponsoredVideoAds } from './SponsoredVideoAds';
import { supabase } from '../lib/supabase';
import { useDebounce } from '../hooks/useDebounce';

interface MarketplaceHomeProps {
  tenants: Tenant[];
  services: Service[];
  onSelectShop: (slug: string) => void;
  onNavigateToRole: (role: string) => void;
}

export default function MarketplaceHome({ 
  tenants, 
  services, 
  onSelectShop,
  onNavigateToRole 
}: MarketplaceHomeProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [dropdownResults, setDropdownResults] = useState<{ shops: any[], services: any[], areas: any[] }>({ shops: [], services: [], areas: [] });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState<'All' | 'Budget' | 'Mid-Range' | 'Premium'>('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeAISearchMode, setActiveAISearchMode] = useState(false);
  const [aiAppliedFilterDesc, setAIAppliedFilterDesc] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // GPS Location states
  const [gpsStatus, setGpsStatus] = useState<'inactive' | 'detecting' | 'active'>('inactive');
  const [detectedArea, setDetectedArea] = useState('');
  const [simulatedDistances, setSimulatedDistances] = useState<Record<string, { distance: string; driveTime: string }>>({});

  // Voice Search states
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceQuerySimulated, setVoiceQuerySimulated] = useState('');

  // Video Player Modal state
  const [activeVideoUrl, setActiveVideoUrl] = useState<{ title: string; salonName: string; videoSrc: string } | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // AI query animated placeholder ticker
  const placeholders = [
    "Luxury Spa in Malviya Nagar...",
    "Unisex salon with highest reviews in C-Scheme...",
    "Bridal Makeup Artist with discount...",
    "Gentlemen's hair coloring near me...",
    "Premium Nail Art C-Scheme under 1000 INR..."
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.trim().length < 2) {
      setDropdownResults({ shops: [], services: [], areas: [] });
      setIsDropdownOpen(false);
      setIsDropdownLoading(false);
      return;
    }

    const performSearch = async () => {
      setIsDropdownLoading(true);
      setIsDropdownOpen(true);
      if (!supabase) {
        setIsDropdownLoading(false);
        return;
      }

      try {
        const [shopsData, servicesData] = await Promise.all([
          supabase.from('tenants').select('id, name, city, area, slug').or(`name.ilike.%${debouncedSearchQuery}%,city.ilike.%${debouncedSearchQuery}%,area.ilike.%${debouncedSearchQuery}%`).limit(3),
          supabase.from('services').select('id, name, category_name, tenant_id, tenants(slug)').ilike('name', `%${debouncedSearchQuery}%`).limit(4)
        ]);

        const POPULAR_AREAS = ['Malviya Nagar', 'C-Scheme', 'Raja Park', 'Vaishali Nagar', 'Mansarovar'];
        const areaResults = POPULAR_AREAS
          .filter(a => a.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
          .map(area => ({ type: 'area' as const, id: area, name: area, subtitle: 'Jaipur, Rajasthan', actionText: 'Explore Area' }));

        const shopResults = (shopsData.data || []).map(s => ({ 
          type: 'shop' as const,
          id: s.slug || s.id,
          name: s.name,
          subtitle: `${s.area}, ${s.city}`,
          actionText: 'Book Now'
        }));
        
        const serviceResults = (servicesData.data || []).map((s: any) => ({ 
          type: 'service' as const,
          id: s.tenants?.slug || s.tenant_id,
          name: s.name,
          subtitle: s.category_name,
          actionText: 'Find Salons'
        }));

        setDropdownResults({ shops: shopResults, services: serviceResults, areas: areaResults });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsDropdownLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Filter approved & active shops
  const approvedSalons = tenants.filter(t => t.approval_status === 'approved' && t.is_active);

  // Location GPS Trigger simulation
  const handleDetectLocation = () => {
    setGpsStatus('detecting');
    setTimeout(() => {
      setGpsStatus('active');
      setDetectedArea('Malviya Nagar, Jaipur');
      setSelectedLocation('Malviya Nagar');
      
      // Calculate realistic unique distances for approved salons
      const distances: Record<string, { distance: string; driveTime: string }> = {};
      approvedSalons.forEach((salon, index) => {
        const dist = (0.5 + index * 1.2).toFixed(1);
        const mins = Math.round(parseFloat(dist) * 3 + 2);
        distances[salon.id] = {
          distance: `${dist} km`,
          driveTime: `${mins} min drive`
        };
      });
      setSimulatedDistances(distances);
    }, 1500);
  };

  // AI Query suggestion parser
  const handleApplyAIQuery = (queryText: string, location: string, category: string, budget: 'All' | 'Budget' | 'Mid-Range' | 'Premium', verified: boolean) => {
    setSearchQuery(queryText);
    setSelectedLocation(location);
    setSelectedCategory(category);
    setBudgetFilter(budget);
    setVerifiedOnly(verified);
    setActiveAISearchMode(true);
    setAIAppliedFilterDesc(`AI Search Match: ${category !== 'All' ? category : 'Venues'} in ${location === 'All' ? 'Jaipur' : location}${budget !== 'All' ? ` with ${budget} pricing` : ''}${verified ? ' + Certified Audited' : ''}`);
    
    // Smooth scroll down to search results/listings if needed
    const element = document.getElementById('marketplace-search-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset AI smart search
  const handleResetAISearch = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedCategory('All');
    setBudgetFilter('All');
    setVerifiedOnly(false);
    setActiveAISearchMode(false);
    setAIAppliedFilterDesc('');
  };

  // Voice search simulation
  const handleTriggerVoice = () => {
    setIsVoiceListening(true);
    setVoiceQuerySimulated('Listening...');
    
    setTimeout(() => {
      setVoiceQuerySimulated('Analyzing voice: "Wella Color salon C-Scheme"');
    }, 1000);

    setTimeout(() => {
      setIsVoiceListening(false);
      handleApplyAIQuery('Wella Color', 'C-Scheme', 'Salons', 'All', true);
    }, 2800);
  };

  // Copy offer code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Filter salons based on user criteria
  const filteredSalons = approvedSalons.filter(salon => {
    const query = searchQuery.toLowerCase();
    
    // Match queries in Name, Address, Area, Description or Business Type
    const matchesSearch = !searchQuery || 
      salon.name.toLowerCase().includes(query) ||
      salon.address.toLowerCase().includes(query) ||
      salon.area.toLowerCase().includes(query) ||
      salon.business_type.toLowerCase().includes(query) ||
      salon.description.toLowerCase().includes(query);

    // District / Area Match
    const matchesLocation = selectedLocation === 'All' || 
      salon.area.toLowerCase().trim() === selectedLocation.toLowerCase().trim() ||
      salon.city.toLowerCase().trim() === selectedLocation.toLowerCase().trim();

    // Category Match
    const matchesCategory = selectedCategory === 'All' || 
      (selectedCategory === 'Salons' && (salon.business_type.toLowerCase().includes('salon') || salon.business_type.toLowerCase().includes('styling'))) ||
      (selectedCategory === 'Spas' && (salon.business_type.toLowerCase().includes('spa') || salon.business_type.toLowerCase().includes('wellness'))) ||
      (selectedCategory === 'Clinical' && (salon.business_type.toLowerCase().includes('clinical') || salon.business_type.toLowerCase().includes('skin'))) ||
      (selectedCategory === 'Barber Shops' && (salon.business_type.toLowerCase().includes('barber') || salon.business_type.toLowerCase().includes('grooming')));

    // Gender suitability Filter
    const matchesGender = selectedGenderFilter === 'All' ||
      (selectedGenderFilter === 'Unisex' && salon.description.toLowerCase().includes('unisex')) ||
      (selectedGenderFilter === 'Men Only' && (salon.description.toLowerCase().includes('men') || salon.name.toLowerCase().includes('royal') || salon.business_type.toLowerCase().includes('barber'))) ||
      (selectedGenderFilter === 'Women Only' && (salon.description.toLowerCase().includes('women') || salon.description.toLowerCase().includes('bridal')));

    // Pricing Budget match
    let matchesBudget = true;
    const price = salon.starting_price || 0;
    if (budgetFilter === 'Budget') matchesBudget = price <= 300;
    else if (budgetFilter === 'Mid-Range') matchesBudget = price > 300 && price <= 800;
    else if (budgetFilter === 'Premium') matchesBudget = price > 800;

    // Verified check
    const matchesVerified = !verifiedOnly || salon.is_verified;

    return matchesSearch && matchesLocation && matchesCategory && matchesGender && matchesBudget && matchesVerified;
  });

  // Top Rated Shops criteria: rating >= 4.7
  const topRatedShops = approvedSalons.filter(s => (s.rating || 5.0) >= 4.7);

  // Recommended Shops (Shops with high reviews_count or marked as verified)
  const recommendedShops = approvedSalons.filter(s => s.is_verified || (s.reviews_count || 0) > 10);

  // Trending Leaderboard ranks
  const trendingLeaderboard = [...approvedSalons]
    .sort((a, b) => ((b.rating || 5.0) * (b.reviews_count || 0)) - ((a.rating || 5.0) * (a.reviews_count || 0)))
    .slice(0, 5);

  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen font-sans antialiased text-left selection:bg-indigo-500 selection:text-white">
      
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleResetAISearch}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold shadow-indigo-500/20 shadow-md">
                N
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-950 flex items-center gap-1.5">
                Nexora <span className="text-indigo-600 font-bold text-xs bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">Marketplace</span>
              </span>
            </div>

            {/* Sticky Header Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <GlobalSearch onSelect={(res) => {
                if (res.type === 'shop' || res.type === 'service') {
                  onSelectShop(res.id);
                } else if (res.type === 'area') {
                  setSelectedLocation(res.name);
                }
              }} />
              <button onClick={() => { setSelectedCategory('All'); handleResetAISearch(); }} className="hover:text-indigo-600 transition-all cursor-pointer">Explore All</button>
              <button onClick={() => { setSelectedCategory('Spas'); }} className="hover:text-indigo-600 transition-all cursor-pointer">Therapy Spas</button>
              <button onClick={() => { setSelectedCategory('Barber Shops'); }} className="hover:text-indigo-600 transition-all cursor-pointer">Men's Grooming</button>
              <button onClick={() => onNavigateToRole('partner')} className="hover:text-emerald-600 transition-all cursor-pointer flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Growth Partner</span>
              </button>
              <button onClick={() => onNavigateToRole('brand')} className="hover:text-purple-600 transition-all cursor-pointer flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />
                <span>Wholesale Hub</span>
              </button>
            </nav>
          </div>

          {/* Interactive Location Detection & CTA */}
          <div className="flex items-center gap-3">
            
            {/* GPS Location Pill */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 gap-2 text-xs">
              <MapPin className={`w-3.5 h-3.5 ${gpsStatus === 'active' ? 'text-emerald-500 animate-bounce' : 'text-slate-400'}`} />
              <div className="text-left leading-none">
                <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">Active Zone</span>
                <span className="text-[10px] font-bold text-slate-700">
                  {gpsStatus === 'active' ? detectedArea : 'Jaipur Zone'}
                </span>
              </div>

              {gpsStatus === 'inactive' && (
                <button 
                  onClick={handleDetectLocation}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-200 transition-all cursor-pointer animate-pulse"
                >
                  Detect GPS
                </button>
              )}
              {gpsStatus === 'detecting' && (
                <span className="text-[9px] font-mono font-bold text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                  Pinging...
                </span>
              )}
              {gpsStatus === 'active' && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
              )}
            </div>

            <button 
              onClick={() => onNavigateToRole('owner')}
              className="hidden sm:inline-block bg-slate-950 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer uppercase tracking-wider"
            >
              Salon Register
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative bg-[#0F172A] text-white overflow-hidden py-24 sm:py-28 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 opacity-95 z-0"></div>
        <div className="absolute -top-12 left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 right-20 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        
        {/* Continuous decorative ribbon */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-emerald-500"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Jaipur beauty & wellness marketplace network</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-white leading-none">
            Salon Ja Rahe Ho?<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent font-extrabold">
              Nexora Kiya Kya?
            </span>
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Search 100% verified beauty studios, compare live service catalog rates, read rigorous audit reviews, and book professional stylist slots instantly. 
          </p>

          <div className="flex justify-center gap-3">
            <a 
              href="#marketplace-search-anchor"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              Explore Jaipur Venues
            </a>
            <button 
              onClick={() => onNavigateToRole('owner')}
              className="bg-white/10 hover:bg-white/15 border border-white/25 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all cursor-pointer"
            >
              List Your Salon (Free)
            </button>
          </div>
        </div>
      </section>

      {/* 3. SMART SEARCH SECTION */}
      <section id="marketplace-search-anchor" className="relative -mt-10 z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Main search inputs container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input block */}
            <div ref={searchWrapperRef} className="md:col-span-6 relative">
              <div className="flex items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl gap-3 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500 transition-all h-full">
                <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Search Salon or Treatment</label>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (debouncedSearchQuery.trim().length >= 2) setIsDropdownOpen(true);
                    }}
                    placeholder={placeholders[placeholderIdx]}
                    className="bg-transparent text-slate-900 font-bold border-none w-full outline-none text-xs p-0 mt-0.5 placeholder-slate-400 focus:ring-0"
                  />
                </div>
                
                {/* Interactive Voice Search Trigger */}
                <button 
                  onClick={handleTriggerVoice}
                  className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-all cursor-pointer"
                  title="Voice Search Activation"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              
              <DropdownSearchResults 
                isOpen={isDropdownOpen}
                isLoading={isDropdownLoading}
                results={dropdownResults}
                onSelect={(res: any) => {
                  if (res.type === 'shop' || res.type === 'service') {
                    onSelectShop(res.id);
                  } else if (res.type === 'area') {
                    setSelectedLocation(res.name);
                    setSearchQuery('');
                  }
                  setIsDropdownOpen(false);
                }}
              />
            </div>

            {/* Area Filter block */}
            <div className="md:col-span-3 flex items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl gap-3 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500 transition-all">
              <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1 text-left">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">District / Area</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-slate-950 font-bold border-none w-full outline-none text-xs p-0 mt-0.5 focus:ring-0 cursor-pointer"
                >
                  <option value="All">Jaipur (All Areas)</option>
                  <option value="Malviya Nagar">Malviya Nagar</option>
                  <option value="C-Scheme">C-Scheme</option>
                  <option value="Raja Park">Raja Park</option>
                  <option value="Vaishali Nagar">Vaishali Nagar</option>
                  <option value="Mansarovar">Mansarovar</option>
                </select>
              </div>
            </div>

            {/* Smart Filters button */}
            <div className="md:col-span-3 flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 py-3.5 px-4 border rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  showFilters || selectedGenderFilter !== 'All' || budgetFilter !== 'All' || verifiedOnly || onlyAvailableToday
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-1 ring-indigo-500' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4 shrink-0" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* GPS Alert when location is active */}
          {gpsStatus === 'active' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Live GPS location loaded. Showing closest Jaipur partners.</span>
              </div>
              <button 
                onClick={() => { setGpsStatus('inactive'); setSelectedLocation('All'); }}
                className="text-[10px] font-bold text-emerald-600 hover:underline"
              >
                Reset GPS
              </button>
            </div>
          )}

          {/* Interactive Voice Modal Overlay */}
          {isVoiceListening && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">Nexora Smart-Voice</span>
                  <button onClick={() => setIsVoiceListening(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                
                <div className="py-4 flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 animate-bounce">
                    <Mic className="w-8 h-8" />
                  </div>
                  
                  {/* Waveform graphic loops */}
                  <div className="flex items-center gap-1 h-8 justify-center">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-8 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-4 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                    <span className="w-1.5 h-7 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    <span className="w-1.5 h-5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                  </div>
                  
                  <p className="text-sm font-extrabold text-slate-800 tracking-tight mt-2">{voiceQuerySimulated}</p>
                </div>
                
                <p className="text-xs text-slate-400 leading-normal">
                  Speak a location, salon title, or service name to trigger automatic matching.
                </p>
              </div>
            </div>
          )}

          {/* AI Search Match Mode banner */}
          {activeAISearchMode && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2.5 font-bold text-indigo-800">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                <span>{aiAppliedFilterDesc}</span>
              </div>
              <button 
                onClick={handleResetAISearch}
                className="text-[10px] bg-indigo-600 text-white font-extrabold px-3 py-1 rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-wider"
              >
                Clear AI Filter
              </button>
            </div>
          )}

          {/* Smart Filters Panel Drawer */}
          {showFilters && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn">
              {/* Pricing Budget chips */}
              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Price Target</label>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Budget', 'Mid-Range', 'Premium'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudgetFilter(b as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        budgetFilter === b 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {b === 'All' ? 'All Rates' : b === 'Budget' ? 'Budget (≤₹300)' : b === 'Mid-Range' ? 'Mid (₹301-₹800)' : 'Luxury (₹800+)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salon Target suitability */}
              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Venue Suitability</label>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Unisex', 'Men Only', 'Women Only'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGenderFilter(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        selectedGenderFilter === g 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Trust & Slots</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Verified Audited Only</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={onlyAvailableToday}
                      onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Has Slots Today</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* AI-Style Query Prompts Assistant */}
          <div className="pt-2 text-left border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Try smart AI-style discovery filters:</span>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleApplyAIQuery('Premium Unisex Glow', 'C-Scheme', 'Salons', 'Premium', true)}
                className="bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>"Elite Unisex Hair C-Scheme"</span>
              </button>
              <button 
                onClick={() => handleApplyAIQuery('Luxury Spa Therapy', 'Malviya Nagar', 'Spas', 'Premium', true)}
                className="bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>"Stress Relief Spa in Malviya"</span>
              </button>
              <button 
                onClick={() => handleApplyAIQuery('Royal Barber Men Grooming', 'Raja Park', 'Barber Shops', 'Budget', false)}
                className="bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>"Budget Grooming in Raja Park"</span>
              </button>
            </div>
          </div>

          {/* Popular Services Section & Service Chips */}
          <div className="pt-2 text-left border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Popular Services In Jaipur:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Haircut & Styling', val: 'Haircut' },
                { name: 'Hair Coloring', val: 'Color' },
                { name: 'Facial & Glow', val: 'Facial' },
                { name: 'Swedish Massage', val: 'Massage' },
                { name: 'Bridal Makeover', val: 'Bridal' },
                { name: 'Nail extensions', val: 'Nail' }
              ].map((serv, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(serv.val)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    searchQuery === serv.val 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-indigo-50/40 text-indigo-700 border-indigo-100 hover:bg-indigo-50'
                  }`}
                >
                  {serv.name}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Areas Section Links */}
          <div className="pt-2 text-left border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Explore Popular Areas:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['Malviya Nagar', 'C-Scheme', 'Raja Park', 'Vaishali Nagar', 'Mansarovar'].map((area, idx) => {
                const count = approvedSalons.filter(s => s.area === area).length;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedLocation(area)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLocation === area 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold leading-tight truncate">{area}</span>
                    <span className={`text-[9px] block mt-0.5 font-bold ${selectedLocation === area ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {count} {count === 1 ? 'Venue' : 'Venues'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 4. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Operational Portals</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Browse By Wellness Category</h2>
          <p className="text-slate-500 text-xs mt-1">Select standard treatment groups to instantly filter available operating centers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'Salons', title: 'Salons & Styling', subtitle: 'Haircuts, blowout & keratin treatments', icon: Sparkles, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', hover: 'hover:border-indigo-300' },
            { id: 'Spas', title: 'Therapy Spas & Health', subtitle: 'Swedish body massage & acupressure', icon: Compass, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', hover: 'hover:border-emerald-300' },
            { id: 'Clinical', title: 'Clinical Skincare', subtitle: 'Hydrafacials, peeling & expert consultations', icon: ShieldCheck, bg: 'bg-purple-50 text-purple-600 border-purple-100', hover: 'hover:border-purple-300' },
            { id: 'Barber Shops', title: 'Traditional Barbershops', subtitle: 'Shaves, facial trims & gentlemen’s style', icon: Flame, bg: 'bg-amber-50 text-amber-600 border-amber-100', hover: 'hover:border-amber-300' }
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = approvedSalons.filter(s => {
              if (cat.id === 'Salons') return s.business_type.toLowerCase().includes('salon') || s.business_type.toLowerCase().includes('styling');
              if (cat.id === 'Spas') return s.business_type.toLowerCase().includes('spa') || s.business_type.toLowerCase().includes('wellness');
              if (cat.id === 'Clinical') return s.business_type.toLowerCase().includes('clinical') || s.business_type.toLowerCase().includes('skin');
              if (cat.id === 'Barber Shops') return s.business_type.toLowerCase().includes('barber') || s.business_type.toLowerCase().includes('grooming');
              return false;
            }).length;

            return (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-4 ${cat.hover} ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/10' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : cat.bg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">{cat.title}</h3>
                  <p className={`text-[11px] leading-snug mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{cat.subtitle}</p>
                  <span className={`inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count} {count === 1 ? 'Studio' : 'Studios'} Live
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search results banner and details */}
      {searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-indigo-900">
              Filtered Result Set: "{searchQuery}" matching in area "{selectedLocation === 'All' ? 'Jaipur (All)' : selectedLocation}" - found {filteredSalons.length} results.
            </span>
            <button 
              onClick={() => { setSearchQuery(''); handleResetAISearch(); }}
              className="text-indigo-700 hover:underline font-extrabold uppercase tracking-wider"
            >
              Reset Search Query
            </button>
          </div>
        </div>
      )}

      {/* 5. TOP RATED SHOPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Jaipur's Top-Rated Aesthetic Studios</span>
            </h2>
            <p className="text-slate-500 text-xs">Aesthetic partners holding a consistent 4.7+ audit rating on Nexora ledger.</p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Verified Audits Active
          </span>
        </div>

        {topRatedShops.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Award className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Top-Rated Partners Available</h3>
            <p className="text-xs text-slate-500 mt-1">We couldn't find any approved shops with rating &ge; 4.7 yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedShops.map((salon) => (
              <div 
                key={salon.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:border-indigo-400 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={salon.banner_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} 
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-slate-800 uppercase tracking-wider border border-slate-200">
                      {salon.business_type}
                    </div>
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 shadow">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Shop</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 text-left">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        {salon.area}, {salon.city}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        15% QR Cash
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                      {salon.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {salon.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase font-mono font-bold tracking-widest">Starts From</span>
                      <span className="text-sm font-extrabold text-slate-900">₹{salon.starting_price || 250}</span>
                    </div>
                    <div className="text-right">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-900 justify-end">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {salon.rating || '5.0'}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-bold">({salon.reviews_count || '0'} audits)</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onSelectShop(salon.id)}
                    className="mt-4 w-full bg-slate-950 hover:bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm group-hover:shadow"
                  >
                    <span>View Catalog & Book</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
   
      {/* 6. RECOMMENDED FOR YOU */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 text-left">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Recommended For You</span>
              </h2>
              <p className="text-slate-500 text-xs">Curated recommendations based on treatment specialty, high ratings, and customer satisfaction.</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Smart Personalization
            </span>
          </div>

          {recommendedShops.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-sm mx-auto">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold">No custom recommendations found in database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedShops.map((salon) => (
                <div 
                  key={salon.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-indigo-400 transition-all duration-300 group flex flex-col sm:flex-row gap-5 text-left"
                >
                  <div className="w-full sm:w-44 h-36 rounded-2xl bg-slate-100 overflow-hidden shrink-0 relative">
                    <img 
                      src={salon.banner_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400"} 
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[8px] font-extrabold px-2 py-0.5 rounded uppercase">
                      {salon.business_type}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{salon.area}, JP</span>
                        <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded">
                          Highly Recommended
                        </span>
                      </div>
                      
                      <h3 className="text-base font-extrabold text-slate-900 mt-1.5 group-hover:text-indigo-600 transition-colors leading-tight">
                        {salon.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {salon.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-4 mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Rates From:</span>
                        <span className="text-xs font-black text-slate-900">₹{salon.starting_price || 199}</span>
                      </div>

                      <button 
                        onClick={() => onSelectShop(salon.id)}
                        className="bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Quick Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. SPONSORED BRANDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-indigo-600 font-semibold text-sm tracking-tight mb-2 block">Brand Partnerships</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Professional-grade products.</h2>
            <p className="text-base text-slate-500 mt-3 leading-relaxed">
              Explore premium treatments and direct supply partnerships from the world's most trusted beauty and grooming brands.
            </p>
          </div>
          <button className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors group flex items-center gap-1">
            View All Partners <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Wella Professionals", desc: "Discover industry-leading color technology and care for transformative results.", color: "from-amber-500/10 to-orange-500/5", image: "https://images.unsplash.com/photo-1562322140-8baeecece3df?auto=format&fit=crop&q=80&w=600" },
            { name: "L'Oréal Professionnel", desc: "Expert formulas empowering salons to create iconic hair across the globe.", color: "from-indigo-500/10 to-blue-500/5", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=600" },
            { name: "Olaplex", desc: "The gold standard in bond repair science, securing hair health from within.", color: "from-slate-500/10 to-slate-400/5", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600" },
            { name: "Kérastase Paris", desc: "Tailored luxury haircare rituals designed for every salon client's unique needs.", color: "from-emerald-500/10 to-teal-500/5", image: "https://images.unsplash.com/photo-1631730359585-38cf72f0d143?auto=format&fit=crop&q=80&w=600" }
          ].map((brand, idx) => (
            <div key={idx} className="group flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-slate-300 transition-all duration-300">
              <div className={`h-48 bg-gradient-to-br ${brand.color} relative overflow-hidden`}>
                <img src={brand.image} alt={brand.name} className="w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-700 uppercase tracking-widest shadow-sm">
                  Sponsored
                </div>
                {/* Logo Box */}
                <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center font-bold text-xl text-slate-900 z-10">
                  {brand.name[0]}
                </div>
              </div>
              <div className="pt-10 pb-6 px-6 flex flex-col flex-grow relative z-0">
                <h3 className="font-bold text-lg text-slate-900 tracking-tight">{brand.name}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-grow">{brand.desc}</p>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <button className="w-full bg-slate-50 text-slate-900 font-semibold text-sm py-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-colors cursor-pointer">
                    Explore Brand
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SPONSORED VIDEO ADS */}
      <SponsoredVideoAds onSelectShop={onSelectShop} />

      {/* 9. OFFERS & DISCOUNTS */}
      <section className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-xl mb-8">
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Voucher Hub</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Active Promos & Vouchers</h2>
            <p className="text-slate-500 text-xs mt-1">Get up to 35% seasonal package benefits. Claim code to automatically load deal details at checkout.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Promo 1 */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden text-left">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="space-y-3 relative z-10">
                <span className="bg-white/10 text-white border border-white/20 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Bridal Festive Glow
                </span>
                <h3 className="text-lg font-black leading-tight">Bridal Season Grand Glow</h3>
                <p className="text-slate-300 text-xs max-w-xs">Enjoy a flat 25% discount on Royal HD makeup packages at certified Jaipur studios.</p>
                
                <div className="flex items-center gap-2 pt-2">
                  <span className="bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-1.5 rounded-lg font-bold tracking-widest select-all">BRIDAL2026</span>
                  <button 
                    onClick={() => handleCopyCode('BRIDAL2026')}
                    className="bg-white text-slate-950 hover:bg-slate-100 p-1.5 rounded-lg transition-all cursor-pointer"
                    title="Copy code"
                  >
                    {copiedCode === 'BRIDAL2026' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button 
                onClick={() => onSelectShop("ten_aura")} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-2xl shadow-md shrink-0 cursor-pointer self-end"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Promo 2 */}
            <div className="bg-gradient-to-r from-indigo-950 to-violet-950 rounded-3xl p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden text-left">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-600/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="space-y-3 relative z-10">
                <span className="bg-white/10 text-white border border-white/20 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Monsoon Relax Deal
                </span>
                <h3 className="text-lg font-black leading-tight">Aromatherapy Spa Relax Bundle</h3>
                <p className="text-slate-300 text-xs max-w-xs">Free calming aromatherapy facial service with deep stress relief Swedish massage.</p>
                
                <div className="flex items-center gap-2 pt-2">
                  <span className="bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-1.5 rounded-lg font-bold tracking-widest select-all">MONSOONSPA</span>
                  <button 
                    onClick={() => handleCopyCode('MONSOONSPA')}
                    className="bg-white text-slate-950 hover:bg-slate-100 p-1.5 rounded-lg transition-all cursor-pointer"
                    title="Copy code"
                  >
                    {copiedCode === 'MONSOONSPA' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button 
                onClick={() => onSelectShop("ten_zen")} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-2xl shadow-md shrink-0 cursor-pointer self-end"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 10. NEARBY SHOPS */}
      <section className="bg-slate-50 py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span>Nearby Partners & GPS Map Markers</span>
              </h2>
              <p className="text-slate-500 text-xs">Locate closest operating beauty hubs. Distance estimates require simulated GPS radar access.</p>
            </div>
            
            {gpsStatus !== 'active' && (
              <button 
                onClick={handleDetectLocation}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow cursor-pointer uppercase tracking-wider"
              >
                Detect My Live GPS location
              </button>
            )}
          </div>

          {gpsStatus !== 'active' ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Proximity Tracking Inactive</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Please trigger GPS location detection to unlock accurate physical distance ratings, drive travel estimates, and neighborhood navigation tags.
                </p>
              </div>
              <button 
                onClick={handleDetectLocation}
                className="bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Trigger Location Detection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedSalons.map((salon) => {
                const distanceData = simulatedDistances[salon.id] || { distance: '1.2 km', driveTime: '5 min drive' };
                return (
                  <div 
                    key={salon.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-indigo-400 transition-all duration-300 group flex flex-col justify-between text-left"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-emerald-600 animate-ping" />
                          <span>{distanceData.distance} away</span>
                        </span>
                        
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          {distanceData.driveTime}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {salon.name}
                        </h3>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {salon.area}, {salon.city}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {salon.address}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Starting</span>
                        <span className="text-sm font-extrabold text-slate-900">₹{salon.starting_price || 250}</span>
                      </div>

                      <button 
                        onClick={() => onSelectShop(salon.id)}
                        className="bg-slate-950 hover:bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Navigate & Book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 12. NEXORA BEAUTY CLUB */}

      {/* 12. NEXORA BEAUTY CLUB */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto mb-10 text-center">
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Nexora Beauty Club</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">One Membership. Every Beauty Service.</h2>
            <p className="text-slate-500 text-xs mt-1">
              Participating shops choose their own offers. Nexora does not force discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {[
              { 
                title: "Silver", 
                price: "₹99", 
                period: "month", 
                savings: "Up to 5%", 
                features: ["Priority booking", "Birthday offer", "Exclusive member deals", "Reward points multiplier 1.2X"], 
                border: "border-slate-300" 
              },
              { 
                title: "Gold", 
                price: "₹299", 
                period: "month", 
                savings: "Up to 10%", 
                features: ["Faster booking priority", "Festival offers", "Reward points multiplier 1.5X", "Early access offers", "Premium support"], 
                border: "border-indigo-400 ring-2 ring-indigo-500/10", 
                popular: true 
              },
              { 
                title: "Platinum", 
                price: "₹699", 
                period: "month", 
                savings: "Up to 15%", 
                features: ["VIP booking access", "Premium partner benefits", "Reward points multiplier 2X", "Special surprise rewards", "Priority support", "Platinum badge"], 
                border: "border-slate-800" 
              }
            ].map((p, idx) => (
              <div 
                key={idx}
                className={`bg-white rounded-3xl border ${p.border} p-6 flex flex-col justify-between h-[450px] hover:shadow-xl transition-all relative overflow-hidden`}
              >
                {p.popular && (
                  <span className="absolute top-4 right-4 text-[8px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-900">{p.title}</h3>
                  <div className="py-2">
                    <span className="text-3xl font-black text-slate-900">{p.price}</span>
                    <span className="text-xs text-slate-400">/{p.period}</span>
                  </div>

                  <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg mb-4">
                    {p.savings} member savings
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 font-medium">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center cursor-pointer transition-opacity hover:opacity-90 ${p.popular ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}
                >
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. APP DOWNLOAD CALL-TO-ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-[32px] p-8 sm:p-12 relative overflow-hidden text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="max-w-2xl mx-auto relative z-10 space-y-6">
            <span className="bg-white/10 text-indigo-300 border border-white/10 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block">
              Nexora Customer App
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none">Download Nexora Customer App / PWA</h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              Scan personalized beauty checkout QR codes, monitor your cash back ledger, browse neighborhood salon vacancies, and manage club subscriptions on the go.
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button 
                onClick={() => alert('Simulating iOS Web Progressive Web App (PWA) installation. Simply add to home screen to launch.')}
                className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow"
              >
                <Smartphone className="w-4 h-4 text-slate-950" />
                <span>Launch iOS Web PWA</span>
              </button>
              <button 
                onClick={() => alert('Simulating Android Native PWA bundle build. Play Store compatibility verified.')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow"
              >
                <Smartphone className="w-4 h-4 text-indigo-100" />
                <span>Launch Android PWA</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 14. FOOTER & MULTI-ROLE BUSINESS CTAS */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-500 text-xs mt-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Multi-role Business CTA Cards Grid inside Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8 border-b border-slate-100">
            
            {/* Customer CTA */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[8px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">Customer Portal</span>
                <h4 className="font-extrabold text-slate-950 mt-2 text-sm">Book Jaipur Salons</h4>
                <p className="text-slate-400 text-[11px] leading-snug mt-1">Book hair styling, skin clinical therapies & deep luxury massages near you.</p>
              </div>
              <button 
                onClick={handleResetAISearch}
                className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors mt-4 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Start Discovery</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Owner CTA */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[8px] bg-purple-50 text-purple-700 border border-purple-100 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">Salon Owner</span>
                <h4 className="font-extrabold text-slate-950 mt-2 text-sm">Unlock Website Builder</h4>
                <p className="text-slate-400 text-[11px] leading-snug mt-1">Deploy white-label domain websites, handle cash registers & instant settlement ledger.</p>
              </div>
              <button 
                onClick={() => onNavigateToRole('owner')}
                className="text-[10px] font-extrabold text-purple-600 hover:text-purple-700 transition-colors mt-4 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Deploy SalonOS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Growth Partner CTA */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">Growth Partner</span>
                <h4 className="font-extrabold text-slate-950 mt-2 text-sm">Earn 2% Commission</h4>
                <p className="text-slate-400 text-[11px] leading-snug mt-1">Refer physical studios in your Jaipur neighborhood & secure lifetime recurring revenue.</p>
              </div>
              <button 
                onClick={() => onNavigateToRole('partner')}
                className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 transition-colors mt-4 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Claim Referral Link</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Distributor CTA */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-100 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">Brand Sponsor</span>
                <h4 className="font-extrabold text-slate-950 mt-2 text-sm">Direct Retail Supply</h4>
                <p className="text-slate-400 text-[11px] leading-snug mt-1">Connect directly with over 450+ beauty centers and cosmetic retailers in Rajasthan.</p>
              </div>
              <button 
                onClick={() => onNavigateToRole('brand')}
                className="text-[10px] font-extrabold text-amber-700 hover:text-amber-800 transition-colors mt-4 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Access Distributor B2B</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Standard Footer metadata and links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-black text-[11px]">
                N
              </div>
              <span className="font-black text-slate-900 text-sm tracking-tight">Nexora SalonOS</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 font-bold text-slate-600">
              <button onClick={() => onNavigateToRole('marketplace')} className="hover:text-indigo-600 cursor-pointer">Marketplace Home</button>
              <button onClick={() => onNavigateToRole('owner')} className="hover:text-indigo-600 cursor-pointer">Register Salon</button>
              <button onClick={() => onNavigateToRole('partner')} className="hover:text-indigo-600 cursor-pointer">Growth Partner</button>
              <button onClick={() => onNavigateToRole('brand')} className="hover:text-indigo-600 cursor-pointer">B2B Wholesale</button>
              <button onClick={() => onNavigateToRole('jobs')} className="hover:text-indigo-600 cursor-pointer">Talent Jobs Platform</button>
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
              Powered by Nexora SalonOS. 10% booking commission model applied. Jaipur Ledger Nodes active.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}

const DropdownSearchResults: React.FC<{ isOpen: boolean, isLoading: boolean, results: { shops: any[], services: any[], areas: any[] }, onSelect: (res: any) => void }> = ({ isOpen, isLoading, results, onSelect }) => {
  if (!isOpen) return null;
  const hasResults = results.shops.length > 0 || results.services.length > 0 || results.areas.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 md:w-[480px] bg-white border border-slate-200 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] mt-2 p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden text-left">
      <div className="max-h-[60vh] overflow-y-auto hide-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Searching Network</p>
          </div>
        ) : !hasResults ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-900">No matches found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {results.shops.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-3 mb-2">
                  <Building className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salons & Spas</h4>
                </div>
                <div className="space-y-1">
                  {results.shops.map((res: any) => (
                    <MarketplaceResultItem key={`shop-${res.id}`} result={res} onSelect={onSelect} icon={<Building className="w-4 h-4 text-slate-400" />} />
                  ))}
                </div>
              </div>
            )}
            {results.services.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-3 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatments & Services</h4>
                </div>
                <div className="space-y-1">
                  {results.services.map((res: any) => (
                    <MarketplaceResultItem key={`svc-${res.id}`} result={res} onSelect={onSelect} icon={<Sparkles className="w-4 h-4 text-slate-400" />} />
                  ))}
                </div>
              </div>
            )}
            {results.areas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-3 mb-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locations</h4>
                </div>
                <div className="space-y-1">
                  {results.areas.map((res: any) => (
                    <MarketplaceResultItem key={`area-${res.id}`} result={res} onSelect={onSelect} icon={<MapPin className="w-4 h-4 text-slate-400" />} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

const MarketplaceResultItem: React.FC<{ result: any, onSelect: (r: any) => void, icon: React.ReactNode }> = ({ result, onSelect, icon }) => {
  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl group flex items-center justify-between transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center shrink-0 border border-transparent group-hover:border-slate-200 transition-colors">
          {icon}
        </div>
        <div>
          <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{result.name}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">{result.subtitle}</div>
        </div>
      </div>
      <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
        <span>{result.actionText}</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}
