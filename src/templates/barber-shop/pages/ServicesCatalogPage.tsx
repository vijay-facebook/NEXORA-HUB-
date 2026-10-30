import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Clock, CheckCircle2, Star, Sparkles, 
  ArrowUpDown, ShieldCheck, Plus, Edit2, EyeOff, Eye, 
  Trash2, ChevronUp, ChevronDown, X, Info, Check, 
  UserCheck, Scissors, AlertCircle, RotateCcw
} from 'lucide-react';
import { BarberService, ServiceCategory, ServiceAddOn, SAMPLE_PRICE_DISCLAIMER } from '../data/services';
import { useBarberServices } from '../data/useBarberServices';
import { masterBarbers } from '../data/barbers';

interface ServicesCatalogPageProps {
  onNavigate?: (page: any, params?: any) => void;
  onBookService?: (service: BarberService, selectedAddOns?: ServiceAddOn[]) => void;
}

const CATEGORIES: ('All' | ServiceCategory)[] = [
  'All',
  'Haircuts',
  'Beard Services',
  'Hair & Scalp',
  'Combos'
];

export const ServicesCatalogPage: React.FC<ServicesCatalogPageProps> = ({
  onNavigate,
  onBookService
}) => {
  const {
    services,
    addService,
    updateService,
    toggleHideService,
    deleteService,
    reorderService,
    resetToDefaults
  } = useBarberServices();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ServiceCategory>('All');
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'quick' | 'standard' | 'luxury'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'price-low' | 'price-high' | 'duration'>('order');
  const [popularOnly, setPopularOnly] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);

  // Modal states
  const [inspectingService, setInspectingService] = useState<BarberService | null>(null);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  
  // Admin Edit/Add modal state
  const [editingService, setEditingService] = useState<BarberService | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<Partial<BarberService>>({});
  const [tempAddOnName, setTempAddOnName] = useState('');
  const [tempAddOnPrice, setTempAddOnPrice] = useState(199);
  const [tempAddOnDuration, setTempAddOnDuration] = useState(10);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtered and sorted services
  const filteredServices = useMemo(() => {
    return services
      .filter(service => {
        // Hide hidden services unless in Admin Mode
        if (!showAdminControls && service.status === 'hidden') {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && service.category !== selectedCategory) {
          return false;
        }

        // Popular filter
        if (popularOnly && !service.featured) {
          return false;
        }

        // Barber filter
        if (selectedBarberFilter !== 'all') {
          if (!service.assignedBarbers.includes(selectedBarberFilter)) {
            return false;
          }
        }

        // Duration filter
        if (durationFilter === 'quick' && service.duration > 30) return false;
        if (durationFilter === 'standard' && (service.duration <= 30 || service.duration > 60)) return false;
        if (durationFilter === 'luxury' && service.duration <= 60) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = service.name.toLowerCase().includes(q);
          const matchShort = service.shortDesc.toLowerCase().includes(q);
          const matchDetailed = service.detailedDesc.toLowerCase().includes(q);
          const matchCategory = service.category.toLowerCase().includes(q);
          if (!matchName && !matchShort && !matchDetailed && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          const pA = a.discountedPrice ?? a.price;
          const pB = b.discountedPrice ?? b.price;
          return pA - pB;
        }
        if (sortBy === 'price-high') {
          const pA = a.discountedPrice ?? a.price;
          const pB = b.discountedPrice ?? b.price;
          return pB - pA;
        }
        if (sortBy === 'duration') {
          return a.duration - b.duration;
        }
        // default by order
        return a.order - b.order;
      });
  }, [services, selectedCategory, searchQuery, selectedBarberFilter, durationFilter, sortBy, popularOnly, showAdminControls]);

  // Handle open inspection modal
  const handleOpenInspect = (service: BarberService) => {
    setInspectingService(service);
    setSelectedAddOnIds([]);
  };

  // Toggle add-on selection
  const handleToggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds(prev => 
      prev.includes(addOnId) ? prev.filter(id => id !== addOnId) : [...prev, addOnId]
    );
  };

  // Compute active modal totals
  const modalTotals = useMemo(() => {
    if (!inspectingService) return { price: 0, duration: 0 };
    const basePrice = inspectingService.discountedPrice ?? inspectingService.price;
    const addOnsTotal = inspectingService.addOns
      .filter(ao => selectedAddOnIds.includes(ao.id))
      .reduce((sum, ao) => sum + ao.price, 0);
    const addOnsDuration = inspectingService.addOns
      .filter(ao => selectedAddOnIds.includes(ao.id))
      .reduce((sum, ao) => sum + ao.duration, 0);

    return {
      price: basePrice + addOnsTotal,
      duration: inspectingService.duration + addOnsDuration
    };
  }, [inspectingService, selectedAddOnIds]);

  // Direct Book Handler
  const handleBookDirect = (service: BarberService, addOns?: ServiceAddOn[]) => {
    if (onBookService) {
      onBookService(service, addOns);
    } else if (onNavigate) {
      onNavigate('booking', { serviceId: service.id, serviceName: service.name });
    }
  };

  // Admin form open
  const handleStartEdit = (service: BarberService) => {
    setEditingService(service);
    setIsCreatingNew(false);
    setServiceFormData({ ...service });
  };

  const handleStartCreate = () => {
    setEditingService(null);
    setIsCreatingNew(true);
    setServiceFormData({
      name: '',
      slug: '',
      category: 'Haircuts',
      shortDesc: '',
      detailedDesc: '',
      price: 900,
      discountedPrice: null,
      duration: 45,
      image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800',
      status: 'available',
      assignedBarbers: ['barber-vikram', 'barber-marcus'],
      addOns: [],
      bookingEligibility: 'All Clients',
      featured: false,
      taxSettings: '18% GST Applicable (Included in display price)'
    });
  };

  const handleSaveServiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name || !serviceFormData.price || !serviceFormData.duration) {
      alert('Please fill out service name, price, and duration.');
      return;
    }

    const slug = serviceFormData.slug || serviceFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (isCreatingNew) {
      addService({
        name: serviceFormData.name,
        slug,
        category: serviceFormData.category as ServiceCategory || 'Haircuts',
        shortDesc: serviceFormData.shortDesc || '',
        detailedDesc: serviceFormData.detailedDesc || serviceFormData.shortDesc || '',
        price: Number(serviceFormData.price),
        discountedPrice: serviceFormData.discountedPrice ? Number(serviceFormData.discountedPrice) : null,
        duration: Number(serviceFormData.duration),
        image: serviceFormData.image || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800',
        status: (serviceFormData.status as any) || 'available',
        assignedBarbers: serviceFormData.assignedBarbers || ['barber-vikram'],
        addOns: serviceFormData.addOns || [],
        bookingEligibility: serviceFormData.bookingEligibility || 'All Clients',
        featured: !!serviceFormData.featured,
        taxSettings: serviceFormData.taxSettings || '18% GST Applicable (Included in display price)'
      });
    } else if (editingService) {
      updateService(editingService.id, {
        ...serviceFormData,
        slug,
        price: Number(serviceFormData.price),
        discountedPrice: serviceFormData.discountedPrice ? Number(serviceFormData.discountedPrice) : null,
        duration: Number(serviceFormData.duration)
      });
    }

    setEditingService(null);
    setIsCreatingNew(false);
  };

  // Add custom add-on to editing form
  const handleAddCustomAddOnToForm = () => {
    if (!tempAddOnName.trim()) return;
    const newAddOn: ServiceAddOn = {
      id: `ao-custom-${Date.now()}`,
      name: tempAddOnName.trim(),
      price: Number(tempAddOnPrice),
      duration: Number(tempAddOnDuration)
    };
    setServiceFormData(prev => ({
      ...prev,
      addOns: [...(prev.addOns || []), newAddOn]
    }));
    setTempAddOnName('');
  };

  const handleRemoveAddOnFromForm = (id: string) => {
    setServiceFormData(prev => ({
      ...prev,
      addOns: (prev.addOns || []).filter(a => a.id !== id)
    }));
  };

  return (
    <div className="bg-[#101010] min-h-screen text-[#F7F4EE] pt-8 pb-28">
      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191919] border border-[#39352E] text-xs font-mono text-[#C9A45C] uppercase tracking-widest">
          <Scissors className="w-3.5 h-3.5" />
          The Gent's Den Treatment Menu
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-[#F7F4EE]">
          Complete Services Catalog
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#A7A7A7] font-light">
          Master barbering crafted for gentlemen who demand immaculate detail. From vintage straight-razor shaves to bespoke fades and restorative scalp therapies.
        </p>

        {/* Sample Pricing Disclaimer Banner */}
        <div className="bg-[#191919] border border-[#39352E] rounded-xl p-3 max-w-3xl mx-auto flex items-start gap-3 text-left">
          <Info className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
          <div className="text-xs text-[#A7A7A7] leading-relaxed">
            <span className="text-[#C9A45C] font-semibold">Indicative Pricing Notice: </span>
            {SAMPLE_PRICE_DISCLAIMER}
          </div>
        </div>

        {/* Administrator Mode Switch */}
        <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={() => setShowAdminControls(!showAdminControls)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border ${
              showAdminControls 
                ? 'bg-[#C9A45C] text-[#101010] border-[#C9A45C]' 
                : 'bg-[#191919] text-[#A7A7A7] border-[#39352E] hover:text-[#F7F4EE] hover:border-[#C9A45C]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {showAdminControls ? 'Admin Management Mode Active' : 'Enable Admin Service Manager'}
          </button>

          {showAdminControls && (
            <>
              <button
                onClick={handleStartCreate}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#2E9D67] text-white hover:bg-emerald-600 transition flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Service
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset services to default initial catalog? Any custom added services will be restored.')) {
                    resetToDefaults();
                  }
                }}
                className="px-3 py-2 rounded-lg text-xs font-mono text-[#A7A7A7] hover:text-[#E05252] border border-[#39352E] hover:border-[#E05252] transition flex items-center gap-1.5"
                title="Reset to initial 32 services"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 space-y-6">
        {/* Search & Select Row */}
        <div className="bg-[#191919] border border-[#39352E] p-4 sm:p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#A7A7A7] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search cuts, fades, beard line-up, spa treatments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#101010] border border-[#39352E] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F7F4EE] placeholder-[#A7A7A7] focus:outline-none focus:border-[#C9A45C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7A7A7] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Barber Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedBarberFilter}
                onChange={e => setSelectedBarberFilter(e.target.value)}
                className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2.5 text-xs text-[#F7F4EE] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="all">All Master Barbers</option>
                {masterBarbers.map(barber => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name} ({barber.designation})
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div className="md:col-span-2">
              <select
                value={durationFilter}
                onChange={e => setDurationFilter(e.target.value as any)}
                className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2.5 text-xs text-[#F7F4EE] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="all">Any Duration</option>
                <option value="quick">Quick (&le; 30 min)</option>
                <option value="standard">Standard (35-60 min)</option>
                <option value="luxury">Signature (60+ min)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2.5 text-xs text-[#F7F4EE] focus:outline-none focus:border-[#C9A45C]"
              >
                <option value="order">Curated Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration: Short to Long</option>
              </select>
            </div>
          </div>

          {/* Category Tabs & Quick Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#39352E]/60">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => {
                const count = category === 'All' 
                  ? services.filter(s => showAdminControls || s.status !== 'hidden').length 
                  : services.filter(s => s.category === category && (showAdminControls || s.status !== 'hidden')).length;

                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-[#C9A45C] text-[#101010] font-bold shadow-md' 
                        : 'bg-[#101010] text-[#A7A7A7] border border-[#39352E] hover:border-[#C9A45C]/50 hover:text-[#F7F4EE]'
                    }`}
                  >
                    <span>{category}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#101010]/30 text-[#101010]' : 'bg-[#222222] text-[#A7A7A7]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Popular toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#A7A7A7] hover:text-[#F7F4EE] select-none">
              <input
                type="checkbox"
                checked={popularOnly}
                onChange={e => setPopularOnly(e.target.checked)}
                className="rounded border-[#39352E] text-[#C9A45C] focus:ring-0 bg-[#101010] w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#C9A45C] fill-[#C9A45C]" />
                Featured / Popular Only
              </span>
            </label>
          </div>
        </div>

        {/* Results Counter & Active Filters indicator */}
        <div className="flex items-center justify-between text-xs text-[#A7A7A7] px-1">
          <div>
            Showing <span className="text-[#C9A45C] font-mono font-bold">{filteredServices.length}</span> of {services.length} services
            {selectedCategory !== 'All' && <span> in <strong className="text-white">{selectedCategory}</strong></span>}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </div>
          {(selectedCategory !== 'All' || searchQuery || selectedBarberFilter !== 'all' || durationFilter !== 'all' || popularOnly) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSelectedBarberFilter('all');
                setDurationFilter('all');
                setPopularOnly(false);
              }}
              className="text-[#C9A45C] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredServices.length === 0 ? (
          <div className="bg-[#191919] border border-[#39352E] rounded-2xl p-16 text-center space-y-4 max-w-xl mx-auto">
            <Scissors className="w-10 h-10 text-[#C9A45C] mx-auto opacity-40" />
            <h3 className="text-lg font-serif font-bold text-white">No Grooming Services Found</h3>
            <p className="text-xs text-[#A7A7A7]">
              No services matched your active search term or filter criteria. Try adjusting your search query or reset the filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSelectedBarberFilter('all');
                setDurationFilter('all');
                setPopularOnly(false);
              }}
              className="px-4 py-2 bg-[#C9A45C] text-[#101010] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#F1D9A3] transition"
            >
              View Full 32 Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => {
              const basePrice = service.price;
              const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;
              const effectivePrice = hasDiscount ? service.discountedPrice! : basePrice;

              return (
                <div
                  key={service.id}
                  className={`bg-[#222222] border rounded-2xl overflow-hidden flex flex-col transition hover:border-[#C9A45C]/60 group relative ${
                    service.status === 'hidden' ? 'opacity-60 border-amber-600/50 bg-[#1e1b18]' : 'border-[#39352E]'
                  }`}
                >
                  {/* Status Banner in Admin Mode */}
                  {showAdminControls && (
                    <div className="bg-[#101010] border-b border-[#39352E] px-3 py-1.5 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#A7A7A7]">Order #{service.order}</span>
                      <div className="flex items-center gap-1">
                        {service.status === 'hidden' ? (
                          <span className="text-amber-400 flex items-center gap-1 font-sans text-[10px] uppercase font-bold">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1 font-sans text-[10px] uppercase font-bold">
                            <Eye className="w-3 h-3" /> Visible
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Service Photo with Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#101010]">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#222222]/40 to-transparent" />

                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 bg-[#101010]/90 backdrop-blur-md border border-[#39352E] text-[#C9A45C] text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md">
                      {service.category}
                    </span>

                    {/* Popular / Featured Badge */}
                    {service.featured && (
                      <span className="absolute top-3 right-3 bg-[#C9A45C] text-[#101010] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Sparkles className="w-2.5 h-2.5 fill-[#101010]" />
                        Featured
                      </span>
                    )}

                    {/* Duration pill */}
                    <span className="absolute bottom-3 right-3 bg-[#101010]/80 backdrop-blur-md text-[#F7F4EE] text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#39352E]">
                      <Clock className="w-3 h-3 text-[#C9A45C]" />
                      {service.duration} min
                    </span>

                    {/* Eligibility Pill */}
                    <span className="absolute bottom-3 left-3 text-[10px] text-[#A7A7A7] bg-[#101010]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#39352E]">
                      {service.bookingEligibility}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-serif font-bold text-[#F7F4EE] group-hover:text-[#C9A45C] transition">
                          {service.name}
                        </h3>
                      </div>

                      <p className="text-xs text-[#A7A7A7] line-clamp-2 leading-relaxed">
                        {service.shortDesc}
                      </p>

                      {/* Add-ons Available hint */}
                      {service.addOns && service.addOns.length > 0 && (
                        <div className="text-[11px] text-[#C9A45C]/80 flex items-center gap-1 font-mono">
                          <span>+{service.addOns.length} Bespoke Add-ons Available</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Tax Information */}
                    <div className="pt-3 border-t border-[#39352E]/70 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-mono font-bold text-[#C9A45C]">
                            ₹{effectivePrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs font-mono text-[#A7A7A7] line-through">
                              ₹{basePrice}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#A7A7A7] block">
                          *Indicative sample price
                        </span>
                      </div>

                      {/* Barbers count */}
                      <div className="text-right">
                        <div className="flex -space-x-1.5 overflow-hidden justify-end">
                          {service.assignedBarbers.map(barberId => {
                            const barber = masterBarbers.find(b => b.id === barberId);
                            return (
                              <img
                                key={barberId}
                                src={barber?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                                alt={barber?.name || 'Barber'}
                                title={barber?.name || 'Master Barber'}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#222222] object-cover"
                              />
                            );
                          })}
                        </div>
                        <span className="text-[9px] text-[#A7A7A7] block mt-0.5">
                          {service.assignedBarbers.length} Master {service.assignedBarbers.length > 1 ? 'Barbers' : 'Barber'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleOpenInspect(service)}
                        className="w-full bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] text-[#F7F4EE] hover:text-[#C9A45C] text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleBookDirect(service)}
                        className="w-full bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition shadow-md"
                      >
                        Book Now
                      </button>
                    </div>

                    {/* Admin Service Toolbar */}
                    {showAdminControls && (
                      <div className="pt-2 border-t border-[#39352E] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => reorderService(service.id, 'up')}
                            className="p-1.5 rounded hover:bg-[#39352E] text-[#A7A7A7] hover:text-white"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => reorderService(service.id, 'down')}
                            className="p-1.5 rounded hover:bg-[#39352E] text-[#A7A7A7] hover:text-white"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleHideService(service.id)}
                            className="p-1.5 rounded hover:bg-[#39352E] text-[#A7A7A7] hover:text-[#C9A45C]"
                            title={service.status === 'hidden' ? 'Show Service' : 'Hide Service'}
                          >
                            {service.status === 'hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleStartEdit(service)}
                            className="p-1.5 rounded hover:bg-[#39352E] text-[#A7A7A7] hover:text-[#C9A45C]"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(service.id)}
                            className="p-1.5 rounded hover:bg-[#39352E] text-[#A7A7A7] hover:text-[#E05252]"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SERVICE DETAIL & ADD-ON INSPECTION MODAL */}
      {inspectingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#191919] border border-[#39352E] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-[#F7F4EE] shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setInspectingService(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#101010]/80 text-[#A7A7A7] hover:text-white border border-[#39352E]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Image */}
            <div className="relative h-60 w-full overflow-hidden rounded-t-3xl bg-[#101010]">
              <img
                src={inspectingService.image}
                alt={inspectingService.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#191919] via-transparent to-black/30" />
              <div className="absolute bottom-4 left-6">
                <span className="text-[10px] font-mono text-[#C9A45C] uppercase tracking-widest font-bold px-2 py-0.5 bg-[#101010]/80 rounded border border-[#39352E]">
                  {inspectingService.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                  {inspectingService.name}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Meta stats bar */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#101010] border border-[#39352E] rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-[#A7A7A7] uppercase font-mono block">Base Duration</span>
                  <span className="text-xs font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#C9A45C]" /> {inspectingService.duration} Minutes
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A7A7A7] uppercase font-mono block">Eligibility</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {inspectingService.bookingEligibility}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A7A7A7] uppercase font-mono block">Indicative Rate</span>
                  <span className="text-xs font-mono font-bold text-[#C9A45C] block mt-0.5">
                    ₹{inspectingService.discountedPrice ?? inspectingService.price}
                  </span>
                </div>
              </div>

              {/* In-depth Detailed Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A45C] font-bold">
                  The Treatment Protocol
                </h4>
                <p className="text-xs sm:text-sm text-[#A7A7A7] leading-relaxed">
                  {inspectingService.detailedDesc}
                </p>
              </div>

              {/* Tax & GST Note */}
              <div className="p-3 bg-[#101010] border border-[#39352E] rounded-xl text-xs text-[#A7A7A7] flex items-center justify-between">
                <span>Tax Compliance:</span>
                <span className="text-[#C9A45C] font-mono">{inspectingService.taxSettings}</span>
              </div>

              {/* Assigned Barbers */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A45C] font-bold">
                  Available Master Barbers for this Service
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inspectingService.assignedBarbers.map(barberId => {
                    const barber = masterBarbers.find(b => b.id === barberId);
                    if (!barber) return null;
                    return (
                      <div key={barber.id} className="flex items-center gap-3 p-2 rounded-xl bg-[#101010] border border-[#39352E]">
                        <img
                          src={barber.photoUrl}
                          alt={barber.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#C9A45C]/40"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{barber.name}</p>
                          <p className="text-[10px] text-[#A7A7A7]">{barber.designation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Add-ons Section */}
              {inspectingService.addOns && inspectingService.addOns.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#39352E]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A45C] font-bold">
                      Customize with Bespoke Add-ons
                    </h4>
                    <span className="text-[11px] text-[#A7A7A7]">Optional Enhancements</span>
                  </div>

                  <div className="space-y-2">
                    {inspectingService.addOns.map(addon => {
                      const isSelected = selectedAddOnIds.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => handleToggleAddOn(addon.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                            isSelected 
                              ? 'bg-[#C9A45C]/10 border-[#C9A45C]' 
                              : 'bg-[#101010] border-[#39352E] hover:border-[#A7A7A7]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                              isSelected ? 'bg-[#C9A45C] border-[#C9A45C] text-[#101010]' : 'border-[#39352E] bg-[#222222]'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{addon.name}</p>
                              <p className="text-[10px] text-[#A7A7A7] flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-[#C9A45C]" /> +{addon.duration} minutes
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#C9A45C]">
                            +₹{addon.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Bar inside Modal */}
              <div className="pt-4 border-t border-[#39352E] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono text-[#A7A7A7] uppercase">Total Estimated Tariff</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold text-[#C9A45C]">
                      ₹{modalTotals.price}
                    </span>
                    <span className="text-xs font-mono text-[#A7A7A7]">
                      ({modalTotals.duration} total mins)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setInspectingService(null)}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-[#39352E] text-xs font-bold uppercase tracking-wider text-[#A7A7A7] hover:text-white transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const selectedAddOnObjects = inspectingService.addOns.filter(ao => selectedAddOnIds.includes(ao.id));
                      handleBookDirect(inspectingService, selectedAddOnObjects);
                      setInspectingService(null);
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                  >
                    Proceed to Reserve Chair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD / EDIT SERVICE MODAL */}
      {(isCreatingNew || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#191919] border border-[#39352E] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-[#F7F4EE] shadow-2xl relative p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#39352E] pb-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#C9A45C]" />
                <h3 className="text-xl font-serif font-bold text-white">
                  {isCreatingNew ? 'Add New Barber Service' : `Edit: ${editingService?.name}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingService(null);
                  setIsCreatingNew(false);
                }}
                className="p-1 rounded-lg text-[#A7A7A7] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveServiceForm} className="space-y-4 text-xs">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.name || ''}
                    onChange={e => setServiceFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Royal Beard Sculpting"
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div>
                  <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Category *</label>
                  <select
                    value={serviceFormData.category || 'Haircuts'}
                    onChange={e => setServiceFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  >
                    <option value="Haircuts">Haircuts</option>
                    <option value="Beard Services">Beard Services</option>
                    <option value="Hair & Scalp">Hair & Scalp</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>
              </div>

              {/* Price, Discounted Price, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Indicative Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={serviceFormData.price ?? ''}
                    onChange={e => setServiceFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div>
                  <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Discounted Price (₹, optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={serviceFormData.discountedPrice ?? ''}
                    onChange={e => setServiceFormData(prev => ({ ...prev, discountedPrice: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Leave empty if none"
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div>
                  <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    min={5}
                    step={5}
                    value={serviceFormData.duration ?? ''}
                    onChange={e => setServiceFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
              </div>

              {/* Image URL & Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Image URL</label>
                  <input
                    type="url"
                    value={serviceFormData.image || ''}
                    onChange={e => setServiceFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div>
                  <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Booking Eligibility</label>
                  <input
                    type="text"
                    value={serviceFormData.bookingEligibility || ''}
                    onChange={e => setServiceFormData(prev => ({ ...prev, bookingEligibility: e.target.value }))}
                    placeholder="e.g. All Clients, Adults Only (16+)"
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Short Description (for card)</label>
                <input
                  type="text"
                  value={serviceFormData.shortDesc || ''}
                  onChange={e => setServiceFormData(prev => ({ ...prev, shortDesc: e.target.value }))}
                  placeholder="One sentence summary of the treatment"
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block uppercase font-mono text-[10px] text-[#A7A7A7] mb-1">Detailed Description (Protocol ritual)</label>
                <textarea
                  rows={3}
                  value={serviceFormData.detailedDesc || ''}
                  onChange={e => setServiceFormData(prev => ({ ...prev, detailedDesc: e.target.value }))}
                  placeholder="Step-by-step barber ritual, products used, scalp therapy, and finish"
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                />
              </div>

              {/* Flags: Featured, Availability status */}
              <div className="flex flex-wrap gap-6 p-3 bg-[#101010] border border-[#39352E] rounded-xl">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!serviceFormData.featured}
                    onChange={e => setServiceFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-[#39352E] text-[#C9A45C] focus:ring-0 bg-[#222222]"
                  />
                  <span>Mark as Featured / Popular</span>
                </label>

                <div className="flex items-center gap-3">
                  <span className="text-[#A7A7A7]">Status:</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={serviceFormData.status !== 'hidden'}
                      onChange={() => setServiceFormData(prev => ({ ...prev, status: 'available' }))}
                      className="text-[#C9A45C] focus:ring-0 bg-[#222222]"
                    />
                    <span>Available</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={serviceFormData.status === 'hidden'}
                      onChange={() => setServiceFormData(prev => ({ ...prev, status: 'hidden' }))}
                      className="text-[#C9A45C] focus:ring-0 bg-[#222222]"
                    />
                    <span>Hidden</span>
                  </label>
                </div>
              </div>

              {/* Add-ons Builder in Form */}
              <div className="space-y-2 p-3 bg-[#101010] border border-[#39352E] rounded-xl">
                <span className="block font-mono uppercase text-[10px] text-[#C9A45C]">Bespoke Add-ons for this Service</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add-on title (e.g. Argan Beard Serum)"
                    value={tempAddOnName}
                    onChange={e => setTempAddOnName(e.target.value)}
                    className="flex-1 bg-[#191919] border border-[#39352E] rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="number"
                    placeholder="₹ Price"
                    value={tempAddOnPrice}
                    onChange={e => setTempAddOnPrice(Number(e.target.value))}
                    className="w-20 bg-[#191919] border border-[#39352E] rounded-lg px-2 py-1.5 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Mins"
                    value={tempAddOnDuration}
                    onChange={e => setTempAddOnDuration(Number(e.target.value))}
                    className="w-16 bg-[#191919] border border-[#39352E] rounded-lg px-2 py-1.5 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAddOnToForm}
                    className="px-3 py-1.5 bg-[#C9A45C] text-[#101010] font-bold rounded-lg hover:bg-[#F1D9A3]"
                  >
                    + Add
                  </button>
                </div>

                {serviceFormData.addOns && serviceFormData.addOns.length > 0 && (
                  <div className="space-y-1 pt-2">
                    {serviceFormData.addOns.map(ao => (
                      <div key={ao.id} className="flex items-center justify-between p-1.5 rounded bg-[#191919] border border-[#39352E] text-[11px]">
                        <span>{ao.name} (+₹{ao.price}, +{ao.duration}m)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAddOnFromForm(ao.id)}
                          className="text-[#E05252] hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-[#39352E] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingService(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#39352E] text-xs uppercase font-bold text-[#A7A7A7] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] text-xs uppercase font-bold transition shadow-md"
                >
                  {isCreatingNew ? 'Save New Service' : 'Update Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#191919] border border-[#E05252] rounded-2xl max-w-md w-full p-6 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-[#E05252] mx-auto" />
            <h3 className="text-lg font-serif font-bold text-white">Delete Service?</h3>
            <p className="text-xs text-[#A7A7A7]">
              Are you sure you want to permanently delete this service from the catalog? You can restore default services at any time using the "Reset Defaults" action.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-[#39352E] text-xs font-bold text-[#A7A7A7] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteService(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#E05252] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesCatalogPage;
