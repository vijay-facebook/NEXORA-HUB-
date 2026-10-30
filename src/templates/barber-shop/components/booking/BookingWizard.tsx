import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, Clock, Calendar, User, Phone, Mail, 
  Tag, Check, ChevronRight, ChevronLeft, AlertCircle, 
  Sparkles, CheckCircle2, ShieldCheck, Copy, 
  ExternalLink, RotateCcw, CalendarDays, RefreshCw
} from 'lucide-react';
import { BarberService, ServiceAddOn, defaultBarberServices, SAMPLE_PRICE_DISCLAIMER } from '../../data/services';
import { masterBarbers, Barber } from '../../data/barbers';
import { BarberBooking, SelectedServiceItem } from '../../types/booking';

interface BookingWizardProps {
  initialServiceId?: string;
  onNavigateHome?: () => void;
  onOpenMyBookings?: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialServiceId,
  onNavigateHome,
  onOpenMyBookings
}) => {
  // Current Step: 1 to 8
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Services Selection (Supports Multi-Service)
  const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>(() => {
    if (initialServiceId) {
      const match = defaultBarberServices.find(s => s.id === initialServiceId);
      if (match) {
        return [{
          serviceId: match.id,
          name: match.name,
          price: match.discountedPrice ?? match.price,
          duration: match.duration,
          addOns: []
        }];
      }
    }
    // Default to Classic Haircut
    const def = defaultBarberServices[0];
    return [{
      serviceId: def.id,
      name: def.name,
      price: def.discountedPrice ?? def.price,
      duration: def.duration,
      addOns: []
    }];
  });

  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('All');

  // STEP 2: Preferred Barber
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any');

  // STEP 3: Date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to tomorrow or today if early
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });

  // STEP 4: Time Slot (Server-Authoritative Real-Time Availability)
  const [availableSlots, setAvailableSlots] = useState<{ time: string; endTime: string; barberId: string; barberName: string }[]>([]);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('');
  const [assignedBarberName, setAssignedBarberName] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // STEP 5: Customer Details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [policyAccepted, setPolicyAccepted] = useState<boolean>(true);

  // STEP 6: Coupon
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);

  // STEP 7: Review & Pre-validation
  const [isPrevalidating, setIsPrevalidating] = useState<boolean>(false);
  const [prevalidateError, setPrevalidateError] = useState<string | null>(null);

  // STEP 8: Confirmation Result
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BarberBooking | null>(null);
  const [bookingFailedError, setBookingFailedError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Computed Totals
  const { totalDuration, subtotalAmount } = useMemo(() => {
    let dur = 0;
    let price = 0;
    selectedServices.forEach(item => {
      dur += item.duration;
      price += item.price;
      if (item.addOns) {
        item.addOns.forEach(ao => {
          dur += ao.duration;
          price += ao.price;
        });
      }
    });
    return { totalDuration: dur, subtotalAmount: price };
  }, [selectedServices]);

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const netTotal = Math.max(0, subtotalAmount - discountAmount);
  const taxAmount = Math.round(netTotal * 0.18 * 100) / 100;

  // Fetch available slots from server when Step 4 is reached or Date / Barber changes
  const fetchAvailableSlots = async (date: string, barberId: string, duration: number) => {
    setIsLoadingSlots(true);
    setSlotError(null);
    setSelectedSlotTime('');
    try {
      const res = await fetch(`/api/barber-booking/available-slots?date=${date}&barberId=${barberId}&totalDuration=${duration}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to query server for time slots');
      }
      const data = await res.json();
      setAvailableSlots(data.slots || []);
      if (!data.slots || data.slots.length === 0) {
        setSlotError('No available appointments for this date. All chairs are either fully booked or outside operating hours.');
      }
    } catch (err: any) {
      setSlotError(err.message || 'Error checking live availability');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (currentStep === 4) {
      fetchAvailableSlots(selectedDate, selectedBarberId, totalDuration);
    }
  }, [currentStep, selectedDate, selectedBarberId, totalDuration]);

  // Handle Multi-Service toggle
  const handleToggleService = (service: BarberService) => {
    const effectivePrice = service.discountedPrice ?? service.price;
    const exists = selectedServices.some(s => s.serviceId === service.id);

    if (exists) {
      if (selectedServices.length === 1) {
        // Must have at least 1 service
        return;
      }
      setSelectedServices(prev => prev.filter(s => s.serviceId !== service.id));
    } else {
      setSelectedServices(prev => [
        ...prev,
        {
          serviceId: service.id,
          name: service.name,
          price: effectivePrice,
          duration: service.duration,
          addOns: []
        }
      ]);
    }
  };

  // Handle Add-on toggle for a specific service in selection
  const handleToggleAddOn = (serviceId: string, addOn: ServiceAddOn) => {
    setSelectedServices(prev =>
      prev.map(item => {
        if (item.serviceId !== serviceId) return item;
        const currentAddOns = item.addOns || [];
        const hasAddOn = currentAddOns.some(a => a.id === addOn.id);
        const updated = hasAddOn
          ? currentAddOns.filter(a => a.id !== addOn.id)
          : [...currentAddOns, addOn];
        return { ...item, addOns: updated };
      })
    );
  };

  // Validate coupon
  const handleApplyCoupon = async (codeToTry?: string) => {
    const code = (codeToTry || couponCodeInput).trim();
    if (!code) return;

    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/barber-booking/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: subtotalAmount })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid promotional code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          description: data.description
        });
        setCouponCodeInput(data.code);
        setCouponError(null);
      }
    } catch (e: any) {
      setCouponError('Network error validating coupon. Please retry.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Step 7 Pre-validation
  const handlePrevalidateSlot = async () => {
    setIsPrevalidating(true);
    setPrevalidateError(null);
    try {
      const res = await fetch('/api/barber-booking/validate-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: selectedDate,
          startTime: selectedSlotTime,
          totalDuration,
          barberId: selectedBarberId
        })
      });
      const data = await res.json();
      if (!res.ok || !data.available) {
        setPrevalidateError(data.error || 'This slot was just claimed. Please choose another time.');
        return false;
      }
      if (data.assignedBarberName) {
        setAssignedBarberName(data.assignedBarberName);
      }
      return true;
    } catch (e: any) {
      setPrevalidateError('Failed to verify slot with database server.');
      return false;
    } finally {
      setIsPrevalidating(false);
    }
  };

  // Step 8: Confirm and Save to Database (Atomic Double-Booking Guard)
  const handleFinalSubmitBooking = async () => {
    setIsSubmittingBooking(true);
    setBookingFailedError(null);

    try {
      const res = await fetch('/api/barber-booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: selectedServices,
          barberId: selectedBarberId,
          appointmentDate: selectedDate,
          startTime: selectedSlotTime,
          customerName,
          customerPhone,
          customerEmail,
          notes,
          couponCode: appliedCoupon?.code
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Database rejected double booking or validation failed
        setBookingFailedError(data.error || 'Server rejected booking. The slot may have been reserved simultaneously.');
        return;
      }

      // Success! Database has saved the booking!
      setConfirmedBooking(data.booking);
      setCurrentStep(8);
    } catch (e: any) {
      setBookingFailedError('Connection failure while persisting appointment. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Next Step Navigation
  const handleNext = async () => {
    if (currentStep === 1) {
      if (selectedServices.length === 0) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedDate) return;
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!selectedSlotTime) return;
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!customerName.trim() || !customerPhone.trim() || !policyAccepted) {
        alert('Please enter your Name, Phone Number, and accept the cancellation policy.');
        return;
      }
      setCurrentStep(6);
    } else if (currentStep === 6) {
      // Prevalidate before moving to review
      const ok = await handlePrevalidateSlot();
      if (ok) setCurrentStep(7);
    } else if (currentStep === 7) {
      await handleFinalSubmitBooking();
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 8) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Generate 30 date options for Step 3
  const dateOptions = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today.getTime() + i * 86400000);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      list.push({ iso, dayName, monthName, dayNum, isToday: i === 0 });
    }
    return list;
  }, []);

  return (
    <div className="bg-[#101010] min-h-screen text-[#F7F4EE] pt-8 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191919] border border-[#39352E] text-xs font-mono text-[#C9A45C] uppercase tracking-widest">
            <Scissors className="w-3.5 h-3.5" />
            Concierge Priority Chair Reservation
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-[#F7F4EE]">
            Bespoke Grooming Appointment
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A7A7] max-w-xl mx-auto font-light">
            Real-time server synchronization • Zero double-booking guarantee • Complimentary 2-hour rescheduling policy
          </p>
        </div>

        {/* Multi-Step Progress Tracker */}
        {currentStep < 8 && (
          <div className="bg-[#191919] border border-[#39352E] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A7A7A7] mb-3">
              <span className="text-[#C9A45C] font-bold">
                Step {currentStep} of 7: {
                  currentStep === 1 ? 'Select Services' :
                  currentStep === 2 ? 'Master Barber' :
                  currentStep === 3 ? 'Choose Date' :
                  currentStep === 4 ? 'Available Slot' :
                  currentStep === 5 ? 'Client Details' :
                  currentStep === 6 ? 'Apply Coupon' : 'Review & Confirm'
                }
              </span>
              <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden border border-[#39352E]/50">
              <div 
                className="bg-gradient-to-r from-[#C9A45C] to-[#F1D9A3] h-full transition-all duration-300"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>

            {/* Quick Summary Pill inside progress bar */}
            {selectedServices.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-[#39352E]/60 text-xs text-[#A7A7A7]">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">Selected:</span>
                  <span className="text-[#C9A45C]">{selectedServices.map(s => s.name).join(' + ')}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C9A45C]" /> {totalDuration} min
                  </span>
                  <span className="text-white font-bold">₹{netTotal}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 1: SELECT SERVICES ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Step 1: Choose Grooming Services</h2>
                <p className="text-xs text-[#A7A7A7]">Select single or multiple treatments for a combined session.</p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Haircuts', 'Beard Services', 'Hair & Scalp', 'Combos'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setServiceCategoryFilter(cat)}
                    className={`px-3 py-1 text-xs rounded-lg uppercase tracking-wider font-semibold transition ${
                      serviceCategoryFilter === cat
                        ? 'bg-[#C9A45C] text-[#101010] font-bold'
                        : 'bg-[#191919] text-[#A7A7A7] border border-[#39352E] hover:border-[#C9A45C]/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultBarberServices
                .filter(s => serviceCategoryFilter === 'All' || s.category === serviceCategoryFilter)
                .map(service => {
                  const effectivePrice = service.discountedPrice ?? service.price;
                  const isSelected = selectedServices.some(s => s.serviceId === service.id);
                  const selectedItem = selectedServices.find(s => s.serviceId === service.id);

                  return (
                    <div
                      key={service.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-[#C9A45C]/10 border-[#C9A45C] shadow-lg shadow-[#C9A45C]/5' 
                          : 'bg-[#191919] border-[#39352E] hover:border-[#A7A7A7]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-12 h-12 rounded-xl object-cover border border-[#39352E] shrink-0"
                            />
                            <div>
                              <span className="text-[10px] font-mono text-[#C9A45C] uppercase tracking-wider block">
                                {service.category}
                              </span>
                              <h3 className="text-sm font-bold text-white">{service.name}</h3>
                              <span className="text-[11px] text-[#A7A7A7] flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-[#C9A45C]" /> {service.duration} mins
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-mono font-bold text-[#C9A45C] block">₹{effectivePrice}</span>
                            {service.discountedPrice && (
                              <span className="text-[10px] font-mono text-[#A7A7A7] line-through block">₹{service.price}</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#A7A7A7] line-clamp-2 leading-relaxed">
                          {service.shortDesc}
                        </p>

                        {/* Optional Add-ons if service is selected */}
                        {isSelected && service.addOns && service.addOns.length > 0 && (
                          <div className="pt-2 border-t border-[#39352E]/60 space-y-2">
                            <span className="text-[10px] font-mono uppercase text-[#C9A45C] block">Optional Enhancements:</span>
                            <div className="space-y-1.5">
                              {service.addOns.map(addon => {
                                const hasAddon = selectedItem?.addOns?.some(a => a.id === addon.id);
                                return (
                                  <div
                                    key={addon.id}
                                    onClick={() => handleToggleAddOn(service.id, addon)}
                                    className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer select-none transition ${
                                      hasAddon ? 'bg-[#C9A45C] text-[#101010] border-[#C9A45C] font-semibold' : 'bg-[#101010] text-[#A7A7A7] border-[#39352E]'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <Check className={`w-3 h-3 ${hasAddon ? 'opacity-100' : 'opacity-0'}`} />
                                      {addon.name} (+{addon.duration}m)
                                    </span>
                                    <span className="font-mono">+₹{addon.price}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Select / Deselect Button */}
                      <button
                        onClick={() => handleToggleService(service)}
                        className={`w-full mt-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                          isSelected 
                            ? 'bg-[#C9A45C] text-[#101010]' 
                            : 'bg-[#101010] text-[#F7F4EE] border border-[#39352E] hover:border-[#C9A45C]'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Selected in Chair Session
                          </>
                        ) : (
                          '+ Add to Booking'
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================= STEP 2: SELECT BARBER ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Step 2: Select Your Master Barber</h2>
              <p className="text-xs text-[#A7A7A7]">Choose your preferred grooming artisan or let us pair you with the first available chair.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option: Any Available Barber */}
              <div
                onClick={() => setSelectedBarberId('any')}
                className={`p-5 rounded-2xl border cursor-pointer transition flex items-center gap-4 ${
                  selectedBarberId === 'any'
                    ? 'bg-[#C9A45C]/10 border-[#C9A45C] shadow-lg'
                    : 'bg-[#191919] border-[#39352E] hover:border-[#A7A7A7]'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-[#101010] border border-[#39352E] flex items-center justify-center text-[#C9A45C] shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Any Available Master Barber</h3>
                    <span className="text-[10px] bg-[#C9A45C] text-[#101010] px-1.5 py-0.2 rounded font-bold uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[#A7A7A7] mt-1">
                    Maximum time-slot flexibility. We will assign the highest-rated available specialist.
                  </p>
                </div>
              </div>

              {/* Master Barbers Cards */}
              {masterBarbers.map(barber => {
                const isSelected = selectedBarberId === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarberId(barber.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition flex items-center gap-4 ${
                      isSelected
                        ? 'bg-[#C9A45C]/10 border-[#C9A45C] shadow-lg'
                        : 'bg-[#191919] border-[#39352E] hover:border-[#A7A7A7]'
                    }`}
                  >
                    <img
                      src={barber.photoUrl}
                      alt={barber.name}
                      className="w-14 h-14 rounded-full object-cover border border-[#C9A45C]/40 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">{barber.name}</h3>
                        <span className="text-xs font-mono text-[#C9A45C]">★ {barber.rating}</span>
                      </div>
                      <p className="text-[11px] text-[#A7A7A7]">{barber.designation}</p>
                      <p className="text-[10px] text-[#C9A45C]/80 mt-1 line-clamp-1">{barber.specialization}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: SELECT DATE ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Step 3: Choose Reservation Date</h2>
              <p className="text-xs text-[#A7A7A7]">Browse availability across the upcoming 30-day booking window.</p>
            </div>

            {/* Horizontal Date Picker Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {dateOptions.slice(0, 18).map(item => {
                const isSelected = selectedDate === item.iso;
                return (
                  <button
                    key={item.iso}
                    onClick={() => setSelectedDate(item.iso)}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-[#C9A45C] text-[#101010] border-[#C9A45C] font-bold shadow-lg scale-105'
                        : 'bg-[#191919] border-[#39352E] text-[#A7A7A7] hover:border-[#C9A45C] hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono tracking-wider">
                      {item.isToday ? 'Today' : item.dayName}
                    </span>
                    <span className="text-xl font-bold font-serif">{item.dayNum}</span>
                    <span className="text-[10px] opacity-75">{item.monthName}</span>
                  </button>
                );
              })}
            </div>

            {/* Manual Date Input */}
            <div className="bg-[#191919] border border-[#39352E] p-4 rounded-xl flex items-center justify-between text-xs text-[#A7A7A7]">
              <span>Or select any specific date:</span>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-[#101010] border border-[#39352E] rounded-lg px-3 py-1.5 text-white outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 4: SELECT AVAILABLE TIME SLOT ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Step 4: Real-Time Available Time Slots</h2>
                <p className="text-xs text-[#A7A7A7]">
                  Verified live against shop database for <strong className="text-white">{selectedDate}</strong> ({totalDuration} mins treatment).
                </p>
              </div>

              <button
                onClick={() => fetchAvailableSlots(selectedDate, selectedBarberId, totalDuration)}
                disabled={isLoadingSlots}
                className="inline-flex items-center gap-1.5 text-xs text-[#C9A45C] hover:underline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSlots ? 'animate-spin' : ''}`} />
                Refresh Live Availability
              </button>
            </div>

            {isLoadingSlots ? (
              <div className="bg-[#191919] border border-[#39352E] rounded-2xl p-16 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-[#C9A45C] animate-spin mx-auto" />
                <p className="text-xs font-mono text-[#A7A7A7]">Querying Master Barber schedules & database constraints...</p>
              </div>
            ) : slotError ? (
              <div className="bg-[#191919] border border-amber-600/40 rounded-2xl p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Slots Available for this Selection</h3>
                <p className="text-xs text-[#A7A7A7] max-w-md mx-auto">{slotError}</p>
                <button
                  onClick={() => {
                    const nextDay = new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split('T')[0];
                    setSelectedDate(nextDay);
                    fetchAvailableSlots(nextDay, selectedBarberId, totalDuration);
                  }}
                  className="px-4 py-2 bg-[#C9A45C] text-[#101010] text-xs font-bold uppercase rounded-lg hover:bg-[#F1D9A3] transition"
                >
                  Check Next Day
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableSlots.map(slot => {
                    const isSelected = selectedSlotTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        onClick={() => {
                          setSelectedSlotTime(slot.time);
                          setAssignedBarberName(slot.barberName);
                        }}
                        className={`p-3.5 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-[#C9A45C] text-[#101010] border-[#C9A45C] font-bold shadow-lg scale-105'
                            : 'bg-[#191919] border-[#39352E] text-[#F7F4EE] hover:border-[#C9A45C]'
                        }`}
                      >
                        <span className="text-sm font-mono font-bold">{slot.time}</span>
                        <span className="text-[10px] opacity-75">until {slot.endTime}</span>
                        {selectedBarberId === 'any' && (
                          <span className="text-[9px] truncate max-w-full opacity-90 mt-0.5">
                            {slot.barberName.split(' ')[0]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] font-mono text-[#A7A7A7] text-center pt-2">
                  * 10-minute chair sanitation & blade sterilization buffer automatically reserved after every appointment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 5: CUSTOMER DETAILS ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Step 5: Client Contact Details</h2>
              <p className="text-xs text-[#A7A7A7]">Please enter your details for reservation verification and WhatsApp appointment slip.</p>
            </div>

            <div className="bg-[#191919] border border-[#39352E] rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A7A7A7] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Rathore"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A7A7A7] mb-1.5">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98290 12345"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A7A7A7] mb-1.5">Email Address (Optional for Calendar Pass)</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A7A7A7] mb-1.5">Special Grooming Instructions / Allergies (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sensitive skin, skin fade #0.5 guard on temples, prefer organic tea tree tonic"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-[#A7A7A7]">
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={e => setPolicyAccepted(e.target.checked)}
                    className="rounded border-[#39352E] text-[#C9A45C] focus:ring-0 bg-[#101010] w-4 h-4 mt-0.5"
                  />
                  <span>
                    I agree to the appointment terms: Rescheduling and cancellations are complimentary up to 2 hours prior to scheduled chair time.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: APPLY COUPON ================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Step 6: Promotional Privilege Code</h2>
              <p className="text-xs text-[#A7A7A7]">Apply valid welcome vouchers or seasonal privilege passes.</p>
            </div>

            <div className="bg-[#191919] border border-[#39352E] rounded-2xl p-6 space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. GENTS15)"
                  value={couponCodeInput}
                  onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#101010] border border-[#39352E] rounded-xl px-4 py-3 text-xs font-mono uppercase text-white outline-none focus:border-[#C9A45C]"
                />
                <button
                  type="button"
                  disabled={isValidatingCoupon || !couponCodeInput.trim()}
                  onClick={() => handleApplyCoupon()}
                  className="px-6 py-3 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50"
                >
                  {isValidatingCoupon ? 'Validating...' : 'Apply Code'}
                </button>
              </div>

              {couponError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-bold">Code {appliedCoupon.code} Applied Successfully!</p>
                      <p className="text-[11px] text-emerald-400/80">{appliedCoupon.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400">-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}

              {/* Quick Click Offers */}
              <div className="space-y-2 pt-2 border-t border-[#39352E]/60">
                <span className="text-[10px] font-mono uppercase text-[#A7A7A7]">Available Privilege Offers:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => handleApplyCoupon('GENTS15')}
                    className="p-3 rounded-xl border border-[#39352E] hover:border-[#C9A45C] bg-[#101010] cursor-pointer text-xs flex justify-between items-center transition"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#C9A45C]">GENTS15</span>
                      <p className="text-[10px] text-[#A7A7A7]">15% off first haircut</p>
                    </div>
                    <span className="text-[11px] text-[#C9A45C] font-mono">Apply &rarr;</span>
                  </div>

                  <div 
                    onClick={() => handleApplyCoupon('ROYAL100')}
                    className="p-3 rounded-xl border border-[#39352E] hover:border-[#C9A45C] bg-[#101010] cursor-pointer text-xs flex justify-between items-center transition"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#C9A45C]">ROYAL100</span>
                      <p className="text-[10px] text-[#A7A7A7]">₹100 off courtesy pass</p>
                    </div>
                    <span className="text-[11px] text-[#C9A45C] font-mono">Apply &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 7: REVIEW BOOKING & PRE-VALIDATION ================= */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Step 7: Review Appointment Details</h2>
              <p className="text-xs text-[#A7A7A7]">Verify service itinerary and indicative tariff before database chair lock.</p>
            </div>

            {prevalidateError && (
              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-xs text-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Slot Conflict Detected</p>
                  <p className="mt-0.5">{prevalidateError}</p>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="mt-2 px-3 py-1 bg-amber-500 text-black font-bold text-[11px] rounded"
                  >
                    Select Another Time Slot
                  </button>
                </div>
              </div>
            )}

            {bookingFailedError && (
              <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-xs text-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Reservation Not Confirmed</p>
                  <p className="mt-0.5">{bookingFailedError}</p>
                </div>
              </div>
            )}

            <div className="bg-[#191919] border border-[#39352E] rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Session Meta Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#101010] border border-[#39352E] rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A7A7A7]">Date & Time</span>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedDate}</p>
                  <p className="text-xs font-mono text-[#C9A45C]">{selectedSlotTime} ({totalDuration} mins)</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A7A7A7]">Artisan Barber</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {assignedBarberName || (selectedBarberId === 'any' ? 'First Available Master Barber' : masterBarbers.find(b => b.id === selectedBarberId)?.name)}
                  </p>
                  <p className="text-[10px] text-[#A7A7A7]">Civil Lines Atelier Chair</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A7A7A7]">Client Details</span>
                  <p className="text-sm font-bold text-white mt-0.5">{customerName}</p>
                  <p className="text-xs font-mono text-[#A7A7A7]">{customerPhone}</p>
                </div>
              </div>

              {/* Service Line Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A45C]">Selected Services</h4>
                <div className="divide-y divide-[#39352E]/60 border border-[#39352E] rounded-xl overflow-hidden bg-[#101010]">
                  {selectedServices.map(item => (
                    <div key={item.serviceId} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-[#A7A7A7]">{item.duration} minutes</p>
                        {item.addOns && item.addOns.length > 0 && (
                          <p className="text-[10px] text-[#C9A45C] mt-0.5">
                            + {item.addOns.map(a => `${a.name} (₹${a.price})`).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#F7F4EE]">
                        ₹{item.price + (item.addOns?.reduce((s, a) => s + a.price, 0) || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tariff Breakdown */}
              <div className="space-y-2 pt-2 border-t border-[#39352E] text-xs">
                <div className="flex justify-between text-[#A7A7A7]">
                  <span>Services Subtotal:</span>
                  <span className="font-mono text-white">₹{subtotalAmount}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promotional Discount ({appliedCoupon?.code}):</span>
                    <span className="font-mono">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A7A7A7]">
                  <span>GST (18% included in tariff):</span>
                  <span className="font-mono">₹{taxAmount}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-[#39352E] text-white">
                  <span>Net Indicative Tariff:</span>
                  <span className="text-xl font-mono text-[#C9A45C]">₹{netTotal}</span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-[#A7A7A7] italic">
                {SAMPLE_PRICE_DISCLAIMER}
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 8: CONFIRMATION & UNIQUE REFERENCE ================= */}
        {currentStep === 8 && confirmedBooking && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#191919] border border-[#2E9D67] rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-[#2E9D67]/20 border border-[#2E9D67] rounded-full flex items-center justify-center mx-auto text-[#2E9D67]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-[#2E9D67] font-bold tracking-widest">
                  Confirmed &amp; Persisted to Server Database
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
                  Reservation Locked
                </h2>
                <p className="text-xs sm:text-sm text-[#A7A7A7] max-w-md mx-auto">
                  A chair has been officially allocated for you at The Gent's Den Atelier.
                </p>
              </div>

              {/* Unique Booking Reference Box */}
              <div className="bg-[#101010] border-2 border-[#C9A45C] rounded-2xl p-5 max-w-md mx-auto space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#A7A7A7] tracking-wider block">
                  Unique Booking Reference Code
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-[#C9A45C] tracking-wider">
                    {confirmedBooking.bookingReference}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedBooking.bookingReference);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#39352E] text-[#A7A7A7] hover:text-white transition"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#A7A7A7] block">
                  Status: <strong className="text-emerald-400">{confirmedBooking.status}</strong>
                </span>
              </div>

              {/* Digital Pass Details */}
              <div className="bg-[#101010] border border-[#39352E] rounded-2xl p-5 max-w-lg mx-auto text-left space-y-2.5 text-xs text-[#A7A7A7]">
                <div className="flex justify-between">
                  <span>Guest Name:</span>
                  <span className="text-white font-bold">{confirmedBooking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone Number:</span>
                  <span className="text-white font-mono">{confirmedBooking.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Master Barber:</span>
                  <span className="text-[#C9A45C] font-semibold">{confirmedBooking.barberName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date &amp; Time:</span>
                  <span className="text-white font-mono font-bold">
                    {confirmedBooking.appointmentDate} at {confirmedBooking.startTime} – {confirmedBooking.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Treatments:</span>
                  <span className="text-white font-medium">{confirmedBooking.serviceNames}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#39352E] font-bold text-sm">
                  <span>Indicative Amount:</span>
                  <span className="text-[#C9A45C] font-mono">₹{confirmedBooking.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <a
                  href={`https://wa.me/919829012345?text=Hello%20The%20Gent's%20Den,%20I%20have%20booked%20appointment%20ref%20${confirmedBooking.bookingReference}%20for%20${confirmedBooking.appointmentDate}%20at%20${confirmedBooking.startTime}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-[#25D366] hover:bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  WhatsApp Concierge Slip
                </a>

                {onOpenMyBookings && (
                  <button
                    onClick={onOpenMyBookings}
                    className="px-5 py-3 bg-[#191919] border border-[#39352E] text-xs font-bold uppercase tracking-wider text-white rounded-xl hover:border-[#C9A45C]"
                  >
                    View in My Bookings
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setConfirmedBooking(null);
                  }}
                  className="px-5 py-3 bg-[#C9A45C] text-[#101010] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#F1D9A3]"
                >
                  Reserve Another Chair
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons (Step 1 to 7) */}
        {currentStep < 8 && (
          <div className="pt-6 border-t border-[#39352E] flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-5 py-3 rounded-xl border border-[#39352E] text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                currentStep === 1 ? 'opacity-30 cursor-not-allowed' : 'text-[#A7A7A7] hover:text-white hover:border-[#C9A45C]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              disabled={
                (currentStep === 1 && selectedServices.length === 0) ||
                (currentStep === 3 && !selectedDate) ||
                (currentStep === 4 && !selectedSlotTime) ||
                (currentStep === 5 && (!customerName.trim() || !customerPhone.trim() || !policyAccepted)) ||
                isPrevalidating ||
                isSubmittingBooking
              }
              onClick={handleNext}
              className="px-8 py-3.5 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrevalidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Live Chair...
                </>
              ) : isSubmittingBooking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Locking Booking in Database...
                </>
              ) : currentStep === 7 ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Confirm &amp; Lock Chair
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
export default BookingWizard;
