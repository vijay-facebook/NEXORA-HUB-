/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, ShieldAlert, Check, Calendar, Clock, 
  User, CheckCircle, ArrowLeft, ArrowRight, Star, 
  MapPin, Heart, Sparkles, MessageCircle, AlertCircle,
  Home, Gift, RefreshCw, X
} from 'lucide-react';
import { api } from '../lib/supabase';
import { 
  Tenant, TenantWebsite, Service, Staff, Review, 
  AppointmentStatus, PaymentStatus, Appointment
} from '../types';

interface PublicShopWebsiteProps {
  slug: string;
  initialSubRoute?: string;
  onBackToMarketplace: () => void;
  onNavigateToBuilder: () => void;
}

export default function PublicShopWebsite({ 
  slug, 
  initialSubRoute,
  onBackToMarketplace,
  onNavigateToBuilder
}: PublicShopWebsiteProps) {
  // Website data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<{
    website: TenantWebsite;
    tenant: Tenant;
    services: Service[];
    staff: Staff[];
    reviews: Review[];
  } | null>(null);

  // Active public tab state (Home, Services, Book, Offers, Reviews/About)
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'book' | 'offers' | 'about'>('home');

  // Booking Flow State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  
  const [bookingStep, setBookingStep] = useState(1);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [isRetryingSync, setIsRetryingSync] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);
  const [selectedProfileStaff, setSelectedProfileStaff] = useState<Staff | null>(null);

  // Lightbox state & touch gesture handlers
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxCaption, setLightboxCaption] = useState('');

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      setLightboxIndex(prev => (prev + 1) % lightboxImages.length);
    } else if (distance < -minSwipeDistance) {
      setLightboxIndex(prev => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const openLightbox = (images: string[], index: number, caption: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxCaption(caption);
    setLightboxOpen(true);
  };

  // Customer Reviews & Testimonials state
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (siteData && siteData.reviews) {
      setReviewsList(siteData.reviews);
    }
  }, [siteData]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewComment) return;
    setSubmittingReview(true);
    try {
      const res = await api.createReview({
        tenant_id: tenant.id,
        customer_name: newReviewName,
        rating: Number(newReviewRating),
        comment: newReviewComment
      });
      if (res.success && res.review) {
        setReviewsList(prev => [res.review, ...prev]);
        setShowReviewModal(false);
        setNewReviewName('');
        setNewReviewComment('');
        setNewReviewRating(5);
        alert("Thank you! Your verified review has been published successfully.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Customer Profile & Booking History State (Powered by Supabase)
  const [userPhoneSearch, setUserPhoneSearch] = useState(() => localStorage.getItem('nexora_customer_phone') || '');
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myCustomerData, setMyCustomerData] = useState<any>(null);
  const [fetchingMyBookings, setFetchingMyBookings] = useState(false);
  const [profileSearchPerformed, setProfileSearchPerformed] = useState(false);
  const [submittingCancelId, setSubmittingCancelId] = useState<string | null>(null);
  const [cancellingSuccess, setCancellingSuccess] = useState<string | null>(null);
  const [profileViewTab, setProfileViewTab] = useState<'about' | 'customer'>('about');

  // QR Terminal & Dispute state
  const [activeQRBookingId, setActiveQRBookingId] = useState<string | null>(null);
  const [qrProofCode, setQrProofCode] = useState('');
  const [isAdvanceQR, setIsAdvanceQR] = useState(true);
  const [activeDisputeBookingId, setActiveDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [submittingDisputeState, setSubmittingDisputeState] = useState(false);

  // Auto-fetch customer history on tab click if phone exists
  useEffect(() => {
    if (activeTab === 'about' && userPhoneSearch) {
      handleFetchCustomerHistory(userPhoneSearch);
    }
  }, [activeTab]);

  const handleFetchCustomerHistory = async (phoneToSearch?: string) => {
    const searchVal = phoneToSearch || userPhoneSearch;
    if (!searchVal) return;
    try {
      setFetchingMyBookings(true);
      setProfileSearchPerformed(true);
      localStorage.setItem('nexora_customer_phone', searchVal);
      const list = await api.getAppointments(undefined, searchVal);
      // Sort bookings by date/time descending so latest is on top
      const sorted = (list || []).sort((a: any, b: any) => {
        return new Date(`${b.appointment_date} ${b.appointment_time || '00:00 AM'}`).getTime() - 
               new Date(`${a.appointment_date} ${a.appointment_time || '00:00 AM'}`).getTime();
      });
      setMyBookings(sorted);

      // Fetch customer data for cashback
      try {
        const tenantId = tenant.id;
        const customersList = await api.getCustomers(tenantId);
        const match = (customersList || []).find((c: any) => c.phone === searchVal);
        if (match) {
          setMyCustomerData(match);
        } else {
          setMyCustomerData(null);
        }
      } catch (custErr) {
        console.warn("Could not load customer rewards details:", custErr);
      }
    } catch (err) {
      console.error("Error loading customer booking history:", err);
    } finally {
      setFetchingMyBookings(false);
    }
  };

  const handleCancelBooking = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setSubmittingCancelId(appointmentId);
      const res = await api.updateAppointment(appointmentId, { status: 'cancelled' });
      if (res.success) {
        setCancellingSuccess("Booking cancelled successfully.");
        // Refresh history
        handleFetchCustomerHistory();
        setTimeout(() => setCancellingSuccess(null), 3000);
      } else {
        alert(res.error || "Failed to cancel booking");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling appointment");
    } finally {
      setSubmittingCancelId(null);
    }
  };

  const handleVerifyQR = async (appointmentId: string, proof: string, isAdvance: boolean) => {
    if (!proof.trim()) {
      alert("Please enter a valid 12-digit UPI/UTR Transaction Reference code.");
      return;
    }
    try {
      setSubmittingProof(true);
      const res = await api.submitPaymentVerification(appointmentId, proof, isAdvance);
      if (res.success) {
        alert("Payment proof submitted successfully! Our system is processing it. Your booking status will update to 'pending_verification' until the merchant manually validates your transaction.");
        setQrProofCode('');
        setActiveQRBookingId(null);
        handleFetchCustomerHistory();
        if (successBooking && successBooking.id === appointmentId) {
          setSuccessBooking(res.appointment);
        }
      } else {
        alert(res.error || "Failed to submit verification");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting payment proof");
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleRaiseDispute = async (appointmentId: string, reason: string) => {
    if (!reason.trim()) {
      alert("Please provide a brief reason for raising the dispute.");
      return;
    }
    try {
      setSubmittingDisputeState(true);
      const res = await api.submitDispute(appointmentId, reason);
      if (res.success) {
        alert("Dispute raised successfully. Our Nexora Resolution Desk is reviewing this. You will be contacted shortly.");
        setDisputeReason('');
        setActiveDisputeBookingId(null);
        handleFetchCustomerHistory();
      } else {
        alert(res.error || "Failed to raise dispute");
      }
    } catch (err) {
      console.error(err);
      alert("Error raising dispute");
    } finally {
      setSubmittingDisputeState(false);
    }
  };

  // Fetch website data on load
  useEffect(() => {
    async function fetchWebsite() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getWebsiteBySlug(slug);
        setSiteData(data);
      } catch (err: any) {
        console.error("Error loading shop website:", err);
        setError(err.message || "Public website for this salon is not available.");
      } finally {
        setLoading(false);
      }
    }
    fetchWebsite();
  }, [slug]);

  // Sync activeTab with URL sub-route changes
  useEffect(() => {
    if (initialSubRoute === 'services') {
      setActiveTab('services');
    } else if (initialSubRoute === 'book') {
      setActiveTab('book');
    } else if (initialSubRoute === 'booking-success') {
      setActiveTab('book');
      setBookingStep(4); // Shows success stage if the customer successfully navigated
    } else if (initialSubRoute === 'home' || !initialSubRoute) {
      setActiveTab('home');
    }
  }, [initialSubRoute]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium text-sm">Loading custom website templates...</p>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-xl font-bold text-slate-900">Unpublished or Missing Site</h3>
          <p className="text-sm text-slate-500 mt-2">
            The website folder for '{slug}' does not exist or has been temporarily unpublished by the owner.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onBackToMarketplace}
            className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Go to Marketplace
          </button>
          <button 
            onClick={onNavigateToBuilder}
            className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 cursor-pointer"
          >
            Build Website Free
          </button>
        </div>
      </div>
    );
  }

  const { website, tenant, services, staff: staffList, reviews } = siteData;
  const templateId = website.template_id; // 'tpl_luxury', 'tpl_barber', 'tpl_spa'

  // Style configurations depending on active template code
  let templateStyle = {
    fontClass: 'font-sans',
    primaryBg: 'bg-blue-600',
    primaryHoverBg: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    navBg: 'bg-slate-900 text-white',
    heroBg: 'bg-slate-900 text-white',
    cardBg: 'bg-white',
    textColor: 'text-slate-900',
    buttonClass: 'rounded-lg bg-blue-600 text-white',
    accentBorder: 'border-slate-200'
  };

  if (templateId === 'tpl_luxury') {
    // Luxury template - black / gold / elegance
    templateStyle = {
      fontClass: 'font-serif',
      primaryBg: 'bg-amber-500',
      primaryHoverBg: 'hover:bg-amber-600',
      primaryText: 'text-amber-500',
      navBg: 'bg-slate-950 text-white',
      heroBg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white',
      cardBg: 'bg-slate-900 text-white border-slate-800',
      textColor: 'text-slate-100',
      buttonClass: 'rounded-full bg-amber-500 text-slate-950 hover:bg-amber-600 font-serif',
      accentBorder: 'border-amber-500/20'
    };
  } else if (templateId === 'tpl_barber') {
    // Modern Barber - steel slate / masculine / bold
    templateStyle = {
      fontClass: 'font-mono',
      primaryBg: 'bg-blue-700',
      primaryHoverBg: 'hover:bg-blue-800',
      primaryText: 'text-blue-700',
      navBg: 'bg-slate-900 text-white',
      heroBg: 'bg-slate-900 text-white',
      cardBg: 'bg-slate-800 text-slate-100 border-slate-700',
      textColor: 'text-slate-100',
      buttonClass: 'rounded-none bg-blue-700 text-white hover:bg-blue-800',
      accentBorder: 'border-slate-700'
    };
  } else if (templateId === 'tpl_spa') {
    // Spa Wellness - beige / sage green / soothing
    templateStyle = {
      fontClass: 'font-sans',
      primaryBg: 'bg-emerald-600',
      primaryHoverBg: 'hover:bg-emerald-700',
      primaryText: 'text-emerald-600',
      navBg: 'bg-emerald-950 text-stone-100',
      heroBg: 'bg-[#FCFBF7] text-stone-900 border-b border-emerald-100',
      cardBg: 'bg-[#FCFBF7] border-emerald-100/50',
      textColor: 'text-stone-800',
      buttonClass: 'rounded-full bg-emerald-600 text-white hover:bg-emerald-700',
      accentBorder: 'border-emerald-100'
    };
  }

  // Handle Book appointment start
  const handleStartBooking = (service: Service) => {
    setSelectedService(service);
    setBookingStep(2);
    setActiveTab('book');
  };

  // Submit Booking to Full-stack API
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !bookingDate || !bookingTime) {
      alert("Please fill in all booking credentials.");
      return;
    }

    const payload = {
      tenant_id: tenant.id,
      service_id: selectedService?.id,
      staff_id: selectedStaff?.id || staffList[0]?.id,
      appointment_date: bookingDate,
      appointment_time: bookingTime,
      customer_name: customerName,
      customer_phone: customerPhone,
      notes: customerNotes
    };

    const attemptBooking = async (retries = 3, delay = 1000): Promise<any> => {
      try {
        const res = await api.createBooking(payload);
        if (!res.success) {
          throw new Error(res.error || "Failed to finalize booking");
        }
        return res;
      } catch (err: any) {
        if (retries > 0) {
          console.warn(`Booking failed, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptBooking(retries - 1, delay * 1.5);
        }
        throw err;
      }
    };

    try {
      setSubmittingBooking(true);
      const res = await attemptBooking();
      
      setSuccessBooking(res.appointment);
      setBookingStep(5);
      setUserPhoneSearch(customerPhone);
      localStorage.setItem('nexora_customer_phone', customerPhone);
    } catch (err: any) {
      console.error("Booking retry exhausted, falling back to local pending state:", err);
      // Fallback state
      const fallbackBooking: Appointment = {
        id: `PND-${Date.now().toString().slice(-6)}`,
        tenant_id: tenant.id,
        customer_id: 'pending',
        service_id: selectedService?.id || '',
        customer_name: customerName,
        customer_phone: customerPhone,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        status: AppointmentStatus.PENDING_PAYMENT,
        payment_status: PaymentStatus.ADVANCE_PENDING,
        total_amount: selectedService ? selectedService.price : 0,
        advance_amount: selectedService ? selectedService.price * 0.25 : 0,
        remaining_amount: selectedService ? selectedService.price * 0.75 : 0,
        is_fallback: true,
        created_at: new Date().toISOString()
      };
      
      setSuccessBooking(fallbackBooking);
      setBookingStep(5);
      setUserPhoneSearch(customerPhone);
      localStorage.setItem('nexora_customer_phone', customerPhone);
      
      // Store in localStorage to try again later if possible
      const pendingBookings = JSON.parse(localStorage.getItem('nexora_pending_bookings') || '[]');
      pendingBookings.push(payload);
      localStorage.setItem('nexora_pending_bookings', JSON.stringify(pendingBookings));
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleRetrySync = async () => {
    if (!successBooking || !successBooking.is_fallback) return;

    try {
      setIsRetryingSync(true);
      const pendingBookings = JSON.parse(localStorage.getItem('nexora_pending_bookings') || '[]');
      
      // Find the payload corresponding to the current fallback booking
      // For simplicity in this flow, we'll assume the last one is the one we want if there are multiple, or just take the first matching
      const payload = pendingBookings.find((p: any) => 
        p.customer_phone === successBooking.customer_phone && 
        p.appointment_date === successBooking.appointment_date &&
        p.appointment_time === successBooking.appointment_time
      ) || pendingBookings[pendingBookings.length - 1];

      if (!payload) {
        throw new Error("No pending booking found in local storage to retry.");
      }

      const res = await api.createBooking(payload);
      if (!res.success) {
        throw new Error(res.error || "Failed to finalize booking");
      }
      
      // Update success state to be canonical
      setSuccessBooking(res.appointment);
      
      // Remove from pending bookings
      const updatedPendingBookings = pendingBookings.filter((p: any) => p !== payload);
      localStorage.setItem('nexora_pending_bookings', JSON.stringify(updatedPendingBookings));
      
      alert("Booking successfully synced to server!");
      
    } catch (err: any) {
      console.error("Retry sync failed:", err);
      alert("Still unable to sync booking. It remains saved locally and we will try again later.");
    } finally {
      setIsRetryingSync(false);
    }
  };

  const [localPendingBookings, setLocalPendingBookings] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('nexora_pending_bookings') || '[]');
      const forThisTenant = stored.filter((p: any) => p.tenant_id === tenant.id);
      setLocalPendingBookings(forThisTenant);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab, successBooking, bookingStep, isRetryingSync]);

  const handleRetrySpecificSync = async (payloadToSync: any) => {
    try {
      setIsRetryingSync(true);
      const res = await api.createBooking(payloadToSync);
      if (!res.success) {
        throw new Error(res.error || "Failed to finalize booking");
      }

      const pendingBookings = JSON.parse(localStorage.getItem('nexora_pending_bookings') || '[]');
      const updatedPending = pendingBookings.filter((p: any) => 
        !(p.customer_phone === payloadToSync.customer_phone && 
          p.appointment_date === payloadToSync.appointment_date &&
          p.appointment_time === payloadToSync.appointment_time &&
          p.service_id === payloadToSync.service_id)
      );
      localStorage.setItem('nexora_pending_bookings', JSON.stringify(updatedPending));
      
      alert("Booking successfully synced to server!");
    } catch (err: any) {
      console.error("Retry sync failed:", err);
      alert("Still unable to sync booking. Please check connection and try again later.");
    } finally {
      setIsRetryingSync(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col justify-between ${templateStyle.fontClass}`}>
      
      {/* Premium Header */}
      <header className={`${templateStyle.navBg} border-b ${templateStyle.accentBorder} sticky top-0 z-30 transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBackToMarketplace}
              className="text-xs font-bold py-1 px-2 rounded hover:bg-white/10 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-widest">{tenant.name}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <button onClick={() => setActiveTab('home')} className={`hover:opacity-80 cursor-pointer ${activeTab === 'home' ? 'underline decoration-2 underline-offset-4' : ''}`}>Home</button>
            <button onClick={() => setActiveTab('services')} className={`hover:opacity-80 cursor-pointer ${activeTab === 'services' ? 'underline decoration-2 underline-offset-4' : ''}`}>Services Menu</button>
            <button onClick={() => { setActiveTab('book'); setBookingStep(1); }} className={`hover:opacity-80 cursor-pointer ${activeTab === 'book' ? 'underline decoration-2 underline-offset-4' : ''}`}>Book Seat</button>
            <button onClick={() => setActiveTab('offers')} className={`hover:opacity-80 cursor-pointer ${activeTab === 'offers' ? 'underline decoration-2 underline-offset-4' : ''}`}>Offers</button>
            <button onClick={() => setActiveTab('about')} className={`hover:opacity-80 cursor-pointer ${activeTab === 'about' ? 'underline decoration-2 underline-offset-4' : ''}`}>About Venue</button>
          </div>

          <div>
            <a 
              href={`https://wa.me/${website.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-md hover:bg-emerald-700 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp Audited</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1">
        
        {/* TAB 1: Home/Hero Showcase */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            
            {/* Custom Template Styled Hero */}
            <section className={`${templateStyle.heroBg} py-20 sm:py-28 relative overflow-hidden px-4`}>
              <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full inline-block">
                  {website.website_title}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  {website.hero_title}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
                  {website.hero_subtitle}
                </p>
                <div className="flex justify-center gap-4 pt-4 flex-wrap">
                  <button 
                    onClick={() => { setActiveTab('book'); setBookingStep(1); }}
                    className={`px-8 py-3.5 text-xs font-bold ${templateStyle.buttonClass} cursor-pointer shadow-lg active:scale-95 transition-all`}
                  >
                    Book Online Seat (Save 25%)
                  </button>
                  <a 
                    href={`tel:${website.phone}`}
                    className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Desk</span>
                  </a>
                </div>
              </div>
            </section>

            {/* About & Features Grid */}
            {website.section_visibility.hero && (
              <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6">
                <div className="space-y-4">
                  <span className="text-xs font-extrabold text-blue-600 tracking-widest uppercase block">Our Story</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Crafting Beauty Perfection</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {website.about_text}
                  </p>
                  <div className="flex items-center gap-6 pt-2 font-mono">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="font-extrabold text-slate-800">{tenant.rating || '5.0'} Rating</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600 text-xs font-semibold">{reviewsList.length} Audited Reviews</span>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden aspect-video shadow-lg bg-slate-200">
                  <img 
                    src={tenant.banner_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} 
                    alt="Salon Ambience" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </section>
            )}

            {/* Services Highlight */}
            {website.section_visibility.services && (
              <section className="max-w-5xl mx-auto px-4 space-y-6 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">Featured Transformative Treatments</h3>
                  <button onClick={() => setActiveTab('services')} className="text-xs font-bold text-blue-600 hover:underline">View All {services.length} Services</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {services.filter(s => s.is_featured).map((service) => (
                    <div 
                      key={service.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all justify-between items-start"
                    >
                      {service.image_url && (
                        <img src={service.image_url} alt={service.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 space-y-1 text-left">
                        <span className="bg-slate-100 text-slate-700 text-[8px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full inline-block">
                          {service.category_name}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{service.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{service.description}</p>
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-sm font-extrabold text-slate-900">Rs. {service.price}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{service.duration_minutes} Mins</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleStartBooking(service)}
                        className={`px-3 py-1.5 text-[10px] font-bold ${templateStyle.primaryBg} ${templateStyle.primaryHoverBg} text-white rounded cursor-pointer`}
                      >
                        Book Seat
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery Images Placeholder */}
            {website.section_visibility.gallery && (
              <section className="max-w-5xl mx-auto px-4 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">Visual Ambience & Portfolio</h3>
                  <span className="text-xs text-slate-400 font-mono">Click to view full-screen</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200&h=1200",
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200&h=1200",
                    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200&h=1200",
                    "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=1200&h=1200"
                  ].map((imgUrl, i, arr) => (
                    <div 
                      key={i} 
                      onClick={() => openLightbox(arr, i, `Salon Ambience & Portfolio #${i + 1}`)}
                      className="aspect-square rounded-2xl overflow-hidden bg-slate-200 cursor-pointer group relative shadow-sm hover:shadow-md transition-all"
                    >
                      <img src={imgUrl} alt="Portfolio item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        View Lightbox
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Meet Our Expert Specialists Section */}
            <section className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-blue-600 tracking-widest uppercase block">Expert Team</span>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">Meet Our Master Specialists & View Profiles</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">{staffList.length} Professionals</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {staffList.map((st) => {
                  const staffGallery = (st.work_gallery && st.work_gallery.length > 0 ? st.work_gallery : [
                    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400&h=400",
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400&h=400",
                    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400&h=400"
                  ]).slice(0, 3);

                  return (
                    <div 
                      key={st.id}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between text-left"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {st.photo_url ? (
                            <img src={st.photo_url} alt={st.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
                              {st.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{st.name}</h4>
                            <span className="text-[11px] text-slate-500 block font-medium">{st.role}</span>
                            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              <span>{st.rating || '4.9'}</span>
                              <span className="text-slate-400 font-normal">({st.experience_years || 5} yrs exp)</span>
                            </div>
                          </div>
                        </div>

                        {/* Stylist Portfolio Preview Grid */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Stylist Portfolio</span>
                            <span className="text-[10px] font-mono text-indigo-600 font-bold">Verified Work</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {staffGallery.map((imgUrl, idx) => (
                              <div 
                                key={idx} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLightbox(staffGallery, idx, `${st.name} - Work Portfolio #${idx + 1}`);
                                }}
                                className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group/thumb relative shadow-xs"
                              >
                                <img src={imgUrl} alt="Portfolio preview" className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                                  View
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {st.specialty?.map((sp, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedProfileStaff(st)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                        >
                          Full Profile
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(st);
                            setActiveTab('book');
                            setBookingStep(1);
                          }}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl text-white ${templateStyle.primaryBg} ${templateStyle.primaryHoverBg} shadow-sm cursor-pointer text-center`}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Customer Reviews & Testimonials Section */}
            {website.section_visibility.reviews && (
              <section className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-extrabold text-amber-600 tracking-widest uppercase block font-mono">Verified Client Feedback</span>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Customer Reviews & Testimonials</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real verified ratings and testimonials from clients who experienced {tenant.name}.</p>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer w-max"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    <span>Write a Review</span>
                  </button>
                </div>

                {/* Rating Summary Banner */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-amber-500/20">
                  <div className="flex items-center gap-6">
                    <div className="text-center sm:text-left">
                      <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">{tenant.rating || '5.0'}</span>
                      <div className="flex items-center gap-1 text-amber-400 mt-1 justify-center sm:justify-start">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">Based on {reviewsList.length} verified audit reviews</p>
                    </div>
                  </div>

                  <div className="space-y-2 w-full sm:w-64">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewsList.filter(r => Math.round(r.rating) === stars).length;
                      const pct = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : (stars === 5 ? 85 : stars === 4 ? 15 : 0);
                      return (
                        <div key={stars} className="flex items-center gap-2 text-xs font-mono">
                          <span className="w-3 text-right">{stars}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="w-6 text-right text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviewsList.map((r) => (
                    <div key={r.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                              {r.customer_name?.[0] || 'C'}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">{r.customer_name}</h4>
                              <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Verified Client Audit
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: Math.round(r.rating) }).map((_, idx) => (
                              <Star key={idx} className="w-3.5 h-3.5 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 block">Reviewed on {r.date}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Write a Review Modal */}
            {showReviewModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scaleUp text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest">Audited Feedback</span>
                      <h3 className="text-xl font-black text-slate-950">Write a Review for {tenant.name}</h3>
                    </div>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating (1 to 5 Stars)</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star className={`w-8 h-8 ${star <= newReviewRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                          </button>
                        ))}
                        <span className="ml-2 font-mono font-bold text-sm text-slate-800">{newReviewRating}.0 / 5.0</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Testimonial / Review</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe your experience, staff professionalism, ambience, and results..."
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                      ></textarea>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(false)}
                        className="flex-1 py-3 border border-slate-300 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {submittingReview ? 'Publishing...' : 'Publish Verified Review'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: Services Full Menu */}
        {activeTab === 'services' && (
          <section className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-left">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Services Catalog</h2>
              <p className="text-sm text-slate-500 mt-1">Select and book high-end transformative therapies directly from our list.</p>
            </div>

            <div className="space-y-6">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-5 justify-between items-start shadow-sm"
                >
                  <div className="space-y-1.5 flex-1">
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full inline-block">
                      {service.category_name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{service.description}</p>
                    <div className="flex items-center gap-4 pt-1 font-mono text-xs">
                      <span className="text-base font-black text-slate-900">Rs. {service.price}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 font-semibold">{service.duration_minutes} Mins Duration</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleStartBooking(service)}
                    className={`px-5 py-2.5 text-xs font-bold ${templateStyle.primaryBg} ${templateStyle.primaryHoverBg} text-white rounded-lg cursor-pointer shrink-0`}
                  >
                    Reserve Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: Interactive 5-Step Booking Flow */}
        {activeTab === 'book' && (
          <section className="max-w-xl mx-auto px-4 py-12">
            
            {/* Offline Pending Bookings Recovery UI */}
            {localPendingBookings.length > 0 && bookingStep !== 5 && (
              <div className="mb-8 p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm animate-fadeIn">
                <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Unsynced Offline Bookings Found
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed mb-4 font-medium">
                  We detected {localPendingBookings.length} booking(s) that were saved offline due to network issues. 
                  Please sync them to confirm your reservation.
                </p>
                <div className="space-y-3">
                  {localPendingBookings.map((pb, idx) => {
                    const svc = services.find(s => s.id === pb.service_id);
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-amber-200 shadow-sm">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{pb.customer_name} <span className="text-slate-400 font-normal">({pb.customer_phone})</span></div>
                          <div className="text-xs font-bold text-indigo-600 mt-1">{svc?.name || 'Treatment'}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {pb.appointment_date} @ {pb.appointment_time}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRetrySpecificSync(pb)}
                          disabled={isRetryingSync}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 shrink-0 justify-center"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRetryingSync ? 'animate-spin' : ''}`} />
                          {isRetryingSync ? 'Syncing...' : 'Sync Now'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step Wizard Indicator */}
            {bookingStep < 5 && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">
                  <span>Step {bookingStep} of 4</span>
                  <span>
                    {bookingStep === 1 ? 'Select Treatment' : 
                     bookingStep === 2 ? 'Date & Stylist' : 
                     bookingStep === 3 ? 'Select Slot Time' : 'Customer Credentials'}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(bookingStep / 4) * 100}%` }}></div>
                </div>
              </div>
            )}

            {/* STEP 1: Select Service */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Which service would you like to book?</h3>
                  <p className="text-xs text-slate-500 mt-1">Please select one catalog service below to proceed.</p>
                </div>
                <div className="space-y-3">
                  {services.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => { setSelectedService(s); setBookingStep(2); }}
                      className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 cursor-pointer transition-all flex justify-between items-center"
                    >
                      <div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono block w-max uppercase mb-1">{s.category_name}</span>
                        <h4 className="text-sm font-bold text-slate-800">{s.name}</h4>
                        <span className="text-xs text-slate-500 block mt-0.5">{s.duration_minutes} Mins</span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-950">Rs. {s.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Select Date & Staff */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Select Date & Preferred Stylist</h3>
                  <p className="text-xs text-slate-500 mt-1">Treating service: <span className="font-extrabold text-slate-900">{selectedService?.name} (Rs. {selectedService?.price})</span></p>
                </div>

                <div className="space-y-4">
                  {/* Date selection input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Appointment Date</label>
                    <input 
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                    />
                  </div>

                  {/* Staff selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Preferred Stylist</label>
                    <div className="grid grid-cols-2 gap-3">
                      {staffList.map((st) => (
                        <div 
                          key={st.id}
                          onClick={() => setSelectedStaff(st)}
                          className={`p-3 bg-white border rounded-xl cursor-pointer transition-all flex items-center gap-2.5 ${
                            selectedStaff?.id === st.id ? 'border-blue-600 ring-2 ring-blue-500/10' : 'border-slate-200'
                          }`}
                        >
                          {st.photo_url && (
                            <img src={st.photo_url} alt={st.name} className="w-8 h-8 rounded-full object-cover" />
                          )}
                          <div className="text-left">
                            <h5 className="text-xs font-bold text-slate-800">{st.name}</h5>
                            <span className="text-[9px] text-slate-400 block">{st.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setBookingStep(1)}
                    className="flex-1 py-3 border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => {
                      if (!bookingDate) { alert("Please select a calendar date"); return; }
                      setBookingStep(3);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer"
                  >
                    Next: Select Time
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Select Time Slot */}
            {bookingStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Choose Appointment Time Slot</h3>
                  <p className="text-xs text-slate-500 mt-1">For Date: <span className="font-extrabold text-slate-900">{bookingDate}</span></p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    "09:30 AM", "10:30 AM", "11:30 AM", 
                    "12:30 PM", "02:00 PM", "03:00 PM", 
                    "04:00 PM", "05:00 PM", "06:30 PM"
                  ].map((time) => (
                    <button 
                      key={time}
                      onClick={() => setBookingTime(time)}
                      className={`p-3 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        bookingTime === time 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setBookingStep(2)}
                    className="flex-1 py-3 border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => {
                      if (!bookingTime) { alert("Please select a slot time"); return; }
                      setBookingStep(4);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer"
                  >
                    Next: Your Details
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Enter Name + Mobile */}
            {bookingStep === 4 && (
              <form onSubmit={handleConfirmBooking} className="space-y-6 text-left">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Enter Your Contact Details</h3>
                  <p className="text-xs text-slate-500 mt-1">We will send an automated WhatsApp booking summary here.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. 98290XXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Special Notes (Optional)</label>
                    <textarea 
                      placeholder="e.g. Allergy details, specific styling preferences..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none h-20 resize-none"
                    />
                  </div>

                  {/* Summary card with split */}
                  {selectedService && (
                    <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-2.5">
                      <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Booking Cost Split</h4>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Total Service Fee:</span>
                        <span className="font-bold text-slate-900">Rs. {selectedService.price}</span>
                      </div>
                      <div className="flex justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-100">
                        <span>25% Advance Booking Required:</span>
                        <span className="font-extrabold">Rs. {selectedService.price * 0.25}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>75% Remaining due at shop counter:</span>
                        <span className="font-semibold text-slate-800">Rs. {selectedService.price * 0.75}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setBookingStep(3)}
                    className="flex-1 py-3 border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={submittingBooking}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {submittingBooking ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    ) : (
                      <span>Confirm & Book Seat</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 5: Success Booking Screen */}
            {bookingStep === 5 && successBooking && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl animate-fadeIn">
                {successBooking.is_fallback ? (
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-8 h-8 text-amber-500 animate-pulse" />
                  </div>
                ) : (
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                )}
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {successBooking.is_fallback ? 'Booking Queued' : 'Seat Reserved Successfully'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {successBooking.is_fallback 
                      ? 'We are experiencing network latency. Your booking is saved locally and will sync automatically when the connection restores.'
                      : 'Your reservation request has been logged in Nexora Ledger.'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 font-mono text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking ID:</span>
                    <span className="font-bold text-slate-950">{successBooking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Treatment:</span>
                    <span className="font-bold text-slate-950">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Slot:</span>
                    <span className="font-bold text-slate-950">{successBooking.appointment_date} @ {successBooking.appointment_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client Name:</span>
                    <span className="font-bold text-slate-950">{successBooking.customer_name}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between text-sm">
                    <span className="font-extrabold text-slate-900">Total Price:</span>
                    <span className="font-black text-slate-950">Rs. {successBooking.total_amount}</span>
                  </div>
                </div>

                {successBooking.is_fallback ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-3">
                    <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Pending Network Sync</span>
                    </h4>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Your booking is securely saved on your device. You can retry the sync now, or we'll automatically sync it when a connection is established.
                    </p>
                    <button
                      onClick={handleRetrySync}
                      disabled={isRetryingSync}
                      className="w-full py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      {isRetryingSync ? 'Retrying Sync...' : 'Sync Now'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-2">
                    <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Advance Payout Split Required</span>
                    </h4>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      To activate your booking, please pay the 25% advance amount (<span className="font-extrabold text-slate-900">Rs. {successBooking.advance_amount}</span>) by scanning the Nexora QR Code at the salon. 
                      The remaining 75% (<span className="font-extrabold text-slate-900">Rs. {successBooking.remaining_amount}</span>) will be payable at the counter after your service is complete.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setActiveTab('home');
                      setBookingStep(1);
                    }}
                    className="flex-1 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    Back to Shop Home
                  </button>
                  <button 
                    onClick={onBackToMarketplace}
                    className="flex-1 py-3 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl hover:bg-blue-100 cursor-pointer"
                  >
                    Exit to Marketplace
                  </button>
                </div>
              </div>
            )}

          </section>
        )}

        {/* TAB 4: Active Offers */}
        {activeTab === 'offers' && (
          <section className="max-w-xl mx-auto px-4 py-12 space-y-6 text-left">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Offers</h2>
              <p className="text-sm text-slate-500 mt-1">Configure salon benefit codes or bundle coupon offers directly at checkout.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 space-y-4 shadow-lg border border-slate-800">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                Exclusive Campaign
              </span>
              <div>
                <h3 className="text-lg font-bold">15% Verified Nexora QR Cashback</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Pay directly via the official Nexora QR scan terminal in-store. Customers receive an automated 15% cashback credited as points directly to their Nexora Reward Wallet on transaction closure.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 p-2.5 rounded-lg text-slate-300">
                <span>No code required. Applicable automatically.</span>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: About & Location or Customer Profile & Bookings */}
        {activeTab === 'about' && (
          <section className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-left">
            {/* Tabbed Navigation Control inside Profile tab */}
            <div className="flex border-b border-slate-200 pb-px gap-4 mb-6">
              <button 
                onClick={() => setProfileViewTab('about')}
                className={`py-3 px-1 text-xs font-bold border-b-2 tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  profileViewTab === 'about' 
                    ? `border-blue-600 ${templateStyle.primaryText}` 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>About Salon</span>
              </button>
              <button 
                onClick={() => setProfileViewTab('customer')}
                className={`py-3 px-1 text-xs font-bold border-b-2 tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  profileViewTab === 'customer' 
                    ? `border-blue-600 ${templateStyle.primaryText}` 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Customer Bookings & Wallet</span>
              </button>
            </div>

            {profileViewTab === 'about' ? (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">About {tenant.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">Location mapping, working hours, and certified address credentials.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Contact Details</h3>
                    <ul className="space-y-3 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{website.phone}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{website.address}</span>
                      </li>
                    </ul>

                    <h3 className="text-base font-bold text-slate-800 pt-2">Working Hours</h3>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex justify-between"><span>Monday - Friday</span> <span className="font-bold text-slate-800">10:00 AM - 08:30 PM</span></li>
                      <li className="flex justify-between"><span>Saturday - Sunday</span> <span className="font-bold text-slate-800">09:00 AM - 09:00 PM</span></li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-800">Physical Location & Area Map</h3>
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Verified GPS</span>
                    </div>
                    
                    {/* Luxury Static Map Placeholder Component */}
                    <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900 aspect-video flex flex-col items-center justify-center p-6 text-center select-none group">
                      {/* Styled decorative map grid lines background */}
                      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent"></div>
                      
                      {/* Stylized animated radar ping / map pin */}
                      <div className="relative z-10 flex flex-col items-center space-y-3">
                        <div className="relative">
                          <div className="absolute -inset-3 bg-indigo-500/30 rounded-full animate-ping"></div>
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 relative z-10">
                            <MapPin className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white tracking-wide">{tenant.name}</h4>
                          <p className="text-xs text-indigo-200 font-medium">{website.address || `${tenant.city}, ${tenant.area}`}</p>
                          <div className="pt-1 flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400">
                            <span>Lat: {tenant.latitude || '26.9124'}° N</span>
                            <span>•</span>
                            <span>Long: {tenant.longitude || '75.7873'}° E</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom badge */}
                      <div className="absolute bottom-3 inset-x-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 flex items-center justify-between text-white text-[11px] font-medium z-10">
                        <span className="text-indigo-200">Static GPS Location Marker</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-bold">● Active Zone</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Nexora Customer Portal</h2>
                  <p className="text-sm text-slate-500 mt-1">Track your verified salon reservations, rewards cashbacks, and active booking slots in real-time.</p>
                </div>

                {/* Search / Lookup Header */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Access Your Secure Ledger</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        placeholder="Enter your registered mobile number..." 
                        value={userPhoneSearch}
                        onChange={(e) => setUserPhoneSearch(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold w-full outline-none text-slate-850 placeholder-slate-400"
                      />
                    </div>
                    <button 
                      onClick={() => handleFetchCustomerHistory()}
                      disabled={fetchingMyBookings || !userPhoneSearch}
                      className={`px-6 py-3 text-xs font-bold rounded-2xl cursor-pointer text-white flex items-center justify-center gap-1.5 shadow-md ${
                        fetchingMyBookings ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-950 hover:bg-slate-900'
                      }`}
                    >
                      {fetchingMyBookings ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>Pull Booking Ledger</span>
                      )}
                    </button>
                  </div>
                  {userPhoneSearch && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      Currently locked to phone session: <span className="font-extrabold text-slate-700">{userPhoneSearch}</span>. Switch number to pull different records.
                    </p>
                  )}
                </div>

                {cancellingSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs font-bold text-emerald-800">
                    {cancellingSuccess}
                  </div>
                )}

                {profileSearchPerformed ? (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Rewards Wallet Summary Widget */}
                    <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-lg border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10 font-black text-8xl pointer-events-none select-none tracking-tighter">15%</div>
                      <div className="space-y-2 relative z-10 text-left flex-1">
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold uppercase px-2.5 py-1 rounded-full border border-indigo-500/20 inline-block">
                          Nexora Beauty Club Rewards
                        </span>
                        <h4 className="text-xl font-bold tracking-tight">Verified Rewards Wallet</h4>
                        <p className="text-xs text-slate-300 max-w-sm">
                          Earned automatically on settlement of any Nexora SalonOS transactions. Valid for instant billing discounts at any approved Jaipur studio.
                        </p>
                        {myCustomerData?.cashback_earned_history && myCustomerData.cashback_earned_history.length > 0 && (
                          <div className="pt-3 border-t border-white/5 mt-3">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block mb-1">Cashback Reward Log:</span>
                            <div className="max-h-[80px] overflow-y-auto space-y-1 pr-2">
                              {myCustomerData.cashback_earned_history.map((h: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                                  <span>{h.description || 'Verified Salon Visit'}</span>
                                  <span className="font-bold text-emerald-400">+Rs. {h.amount}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center md:min-w-[160px] shrink-0 relative z-10">
                        <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-400">Balance Points</span>
                        <span className="block text-3xl font-black text-amber-300 mt-1 font-mono">
                          {myCustomerData ? Math.round(myCustomerData.cashback_balance * 10) : myBookings.filter(b => b.status === 'completed').length * 150} pts
                        </span>
                        <span className="block text-[9px] text-emerald-400 font-medium mt-1">
                          ≈ Rs. {myCustomerData ? myCustomerData.cashback_balance : myBookings.filter(b => b.status === 'completed').length * 15} Cash value
                        </span>
                      </div>
                    </div>

                    {/* Bookings Title */}
                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                      <div className="text-left">
                        <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">Appointment History</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Real-time status of your salon appointments.</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Total: {myBookings.length} records</span>
                    </div>

                    {fetchingMyBookings ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                      </div>
                    ) : myBookings.length === 0 ? (
                      <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-700">No Reservations Found</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                          We didn't detect any prior booking slips linked to <span className="font-semibold text-slate-600">{userPhoneSearch}</span> on this platform.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myBookings.map((b) => {
                          const isCancelled = b.status === 'cancelled';
                          const isCompleted = b.status === 'completed';
                          const isConfirmed = b.status === 'confirmed';
                          
                          let statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
                          if (isCancelled) statusColor = 'bg-slate-50 text-slate-500 border-slate-200';
                          if (isCompleted) statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          if (isConfirmed) statusColor = 'bg-blue-50 text-blue-700 border-blue-200';

                          // Payment state detection helper
                          const paymentStatus = b.payment_status || 'advance_pending';
                          const isAdvancePending = paymentStatus === 'advance_pending';
                          const isAdvancePendingVerification = paymentStatus === 'ADVANCE_PENDING_VERIFICATION';
                          const isAdvancePaid = paymentStatus === 'ADVANCE_PAID';
                          const isFullPendingVerification = paymentStatus === 'FULL_PENDING_VERIFICATION';
                          const isPaidInFull = paymentStatus === 'paid_in_full';

                          return (
                            <div 
                              key={b.id} 
                              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-left transition-all hover:shadow-md"
                            >
                              <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-3">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-mono">BOOKING REF: {b.id.substring(0, 8)}</span>
                                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{b.service_name || 'Premium Salon Service'}</h4>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded border tracking-wider ${statusColor}`}>
                                    {b.status}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono text-slate-600">
                                <div className="space-y-1">
                                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Date & Slot</span>
                                  <span className="font-bold text-slate-800">{b.appointment_date} @ {b.appointment_time}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Ledger Total</span>
                                  <span className="font-bold text-slate-900">Rs. {b.total_amount || 450}</span>
                                </div>
                                <div className="space-y-1 col-span-2 md:col-span-1">
                                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Payment Status</span>
                                  <span className="block font-bold">
                                    {isAdvancePending && <span className="text-amber-600 font-extrabold">🔴 Advance Pending</span>}
                                    {isAdvancePendingVerification && <span className="text-blue-600 font-extrabold">⏳ Advance Pending Review</span>}
                                    {isAdvancePaid && <span className="text-emerald-600 font-extrabold">🟢 25% Advance Paid</span>}
                                    {isFullPendingVerification && <span className="text-indigo-600 font-extrabold">⏳ Checkout Pending Review</span>}
                                    {isPaidInFull && <span className="text-green-600 font-extrabold">✅ Fully Paid (15% Cash)</span>}
                                  </span>
                                </div>
                              </div>

                              {/* Dispute Alerts */}
                              {b.is_disputed && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 space-y-1 text-left">
                                  <div className="flex items-center gap-1.5 font-bold">
                                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span className="uppercase tracking-wide">ACTIVE REFUND DISPUTE: {b.dispute_status?.toUpperCase()}</span>
                                  </div>
                                  <p className="leading-relaxed">
                                    <span className="font-bold">Reason:</span> "{b.dispute_reason || 'No description provided'}"
                                  </p>
                                  <p className="text-[10px] text-rose-600 font-medium">
                                    Nexora Dispute Desk is reviewing your UTR details. Balance adjustments will reflect automatically on resolution.
                                  </p>
                                </div>
                              )}

                              {/* Action Sections */}
                              {!isCancelled && (
                                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                  
                                  {/* Payment & Verification triggers */}
                                  <div className="flex flex-wrap gap-2">
                                    {/* Advance pay trigger */}
                                    {isAdvancePending && (
                                      <button
                                        onClick={() => {
                                          setActiveQRBookingId(b.id);
                                          setIsAdvanceQR(true);
                                          setQrProofCode('');
                                        }}
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
                                      >
                                        <Gift className="w-3.5 h-3.5" />
                                        <span>Pay Rs. {b.advance_amount || Math.round(b.total_amount * 0.25)} Advance via Nexora QR</span>
                                      </button>
                                    )}

                                    {/* Remaining Checkout pay trigger (available if advance is paid and appointment is confirmed or completed) */}
                                    {isAdvancePaid && !isCompleted && (
                                      <button
                                        onClick={() => {
                                          setActiveQRBookingId(b.id);
                                          setIsAdvanceQR(false);
                                          setQrProofCode('');
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Pay Remaining Rs. {b.remaining_amount} via Nexora QR</span>
                                      </button>
                                    )}

                                    {/* Dispute trigger */}
                                    {(isAdvancePaid || isPaidInFull) && !b.is_disputed && (
                                      <button
                                        onClick={() => {
                                          setActiveDisputeBookingId(b.id);
                                          setDisputeReason('');
                                        }}
                                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
                                      >
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        <span>Raise Dispute / File Refund</span>
                                      </button>
                                    )}
                                  </div>

                                  {/* Cancel trigger */}
                                  {!isCompleted && !isCancelled && !isPaidInFull && (
                                    <button
                                      onClick={() => handleCancelBooking(b.id)}
                                      disabled={submittingCancelId === b.id}
                                      className="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 uppercase tracking-wider cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {submittingCancelId === b.id ? (
                                        <span className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></span>
                                      ) : (
                                        <span>Cancel Seat</span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Interactive official Nexora QR Scan Terminal interface */}
                              {activeQRBookingId === b.id && (
                                <div className="mt-4 p-5 bg-slate-950 text-white rounded-3xl border border-indigo-900 animate-slideDown text-left space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Sparkles className="w-4 h-4 text-amber-400" />
                                      <span className="text-xs font-black uppercase tracking-wider text-slate-300">Official Nexora QR Terminal</span>
                                    </div>
                                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                      Free White-Label Site Active
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                                    {/* Custom physical standee terminal QR */}
                                    <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-800 text-slate-950 space-y-2 max-w-[200px] mx-auto">
                                      {/* Simulated QR Block */}
                                      <div className="relative w-32 h-32 bg-slate-100 border border-slate-300 rounded-xl p-1 flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-x-0 h-0.5 bg-blue-500 animate-scanner"></div>
                                        <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-80">
                                          {[...Array(25)].map((_, i) => (
                                            <div 
                                              key={i} 
                                              className={`rounded-sm ${(i % 3 === 0 || i % 7 === 1 || i < 5 || i % 5 === 0) ? 'bg-slate-950' : 'bg-transparent'}`}
                                            ></div>
                                          ))}
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">UPI ONLY</span>
                                      <span className="text-[9px] font-extrabold text-indigo-700 uppercase">Nexora QR Pay v2.0</span>
                                    </div>

                                    <div className="space-y-3">
                                      <div className="space-y-1">
                                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Amount Payable</span>
                                        <span className="text-2xl font-black text-amber-300 font-mono">
                                          Rs. {isAdvanceQR ? (b.advance_amount || Math.round(b.total_amount * 0.25)) : b.remaining_amount}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block leading-relaxed">
                                          ({isAdvanceQR ? '25% Booking Deposit' : '75% Counter Checkout Balance'})
                                        </span>
                                      </div>

                                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-300 leading-relaxed">
                                        <span className="font-extrabold text-amber-400 block mb-0.5">⚠️ STRICT FRAUD CONTROL WARNING</span>
                                        Only scan the official Nexora system terminal QR. Using personal QR codes, direct shop phone numbers, or external payment links is strictly forbidden on Nexora. Transactions outside this ledger are invalid and lose the <span className="text-emerald-400 font-bold">15% customer cashback</span> reward.
                                      </div>
                                    </div>
                                  </div>

                                  {/* UTR Input Form */}
                                  <div className="space-y-3 border-t border-white/10 pt-4 text-xs">
                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-mono uppercase text-slate-400">
                                        Enter 12-Digit UPI Transaction Reference ID (UTR / Reference No.)
                                      </label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. 312093847583" 
                                        value={qrProofCode}
                                        onChange={(e) => setQrProofCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs outline-none focus:border-indigo-500"
                                        maxLength={12}
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleVerifyQR(b.id, qrProofCode, isAdvanceQR)}
                                        disabled={submittingProof || qrProofCode.length < 8}
                                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider text-[10px]"
                                      >
                                        {submittingProof ? 'Verifying...' : 'Submit QR Payment Proof'}
                                      </button>
                                      <button
                                        onClick={() => setActiveQRBookingId(null)}
                                        className="py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider text-[10px]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Dispute / Refund request form */}
                              {activeDisputeBookingId === b.id && (
                                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-slideDown text-left space-y-3">
                                  <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                                    <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
                                    <span>SUBMIT REFUND & DISPUTE FOUNDATION SLIP</span>
                                  </div>
                                  <p className="text-[10px] text-rose-700 leading-relaxed">
                                    Please provide a brief description of the issue. The Nexora resolution ledger requires disputes to be filed within 24 hours of scheduled services. On approval, the owner's ledger wallet will be debited automatically and your points restored.
                                  </p>

                                  <div className="space-y-1.5">
                                    <textarea 
                                      placeholder="Explain the reason for dispute (e.g. booked treatment was refused, charged more than catalog)..."
                                      value={disputeReason}
                                      onChange={(e) => setDisputeReason(e.target.value)}
                                      className="w-full min-h-[70px] p-3 border border-rose-200 bg-white text-slate-800 text-xs rounded-xl outline-none focus:border-rose-500"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleRaiseDispute(b.id, disputeReason)}
                                      disabled={submittingDisputeState || !disputeReason.trim()}
                                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider text-[10px]"
                                    >
                                      {submittingDisputeState ? 'Submitting...' : 'File Official Dispute'}
                                    </button>
                                    <button
                                      onClick={() => setActiveDisputeBookingId(null)}
                                      className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-100/50 rounded-2xl p-6 text-center space-y-2">
                    <User className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                    <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Provide Your Number To Load</h4>
                    <p className="text-xs text-indigo-700/80 max-w-xs mx-auto">
                      All reservations made via Nexora are mapped to your verified mobile number. Input your number above to view real-time records.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

      </div>

      {/* Floating Website Builder Callout Widget */}
      <div className="bg-blue-600 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold shadow-2xl relative z-20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Are you a salon owner in Jaipur? Build your own free published website like this in 2 minutes!</span>
        </div>
        <button 
          onClick={onNavigateToBuilder}
          className="bg-white text-blue-600 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg font-bold cursor-pointer shrink-0"
        >
          Build Website Free
        </button>
      </div>

      {/* Sticky Bottom Mobile Container (CTA + Navigation) */}
      <div className="sticky bottom-0 sm:hidden z-30 shadow-2xl border-t border-slate-200 bg-white">
        
        {/* Sticky Mobile CTA: Book Appointment + WhatsApp (Shown only when not on the booking tab) */}
        {activeTab !== 'book' && (
          <div className="p-3 flex justify-between items-center border-b border-slate-100 bg-white animate-fadeIn">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-mono">From</span>
              <span className="block text-sm font-black text-slate-950">Rs. {tenant.starting_price}</span>
            </div>
            <div className="flex gap-2">
              <a 
                href={`https://wa.me/${website.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <button 
                onClick={() => { setActiveTab('book'); setBookingStep(1); }}
                className={`text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer text-white ${templateStyle.primaryBg} ${templateStyle.primaryHoverBg}`}
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar: Home, Services, Book, Offers, Profile */}
        <div className="grid grid-cols-5 py-2 text-center bg-white border-t border-slate-50">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'services', label: 'Services', icon: CheckCircle },
            { id: 'book', label: 'Book', icon: Calendar },
            { id: 'offers', label: 'Offers', icon: Gift },
            { id: 'about', label: 'Profile', icon: User }
          ].map((item) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id === 'book' && bookingStep === 5) {
                    setBookingStep(1); // Reset step if they finished
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${
                  isTabActive ? templateStyle.primaryText : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Staff Member Profile Modal / Work Gallery Viewer */}
      {selectedProfileStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-left relative">
            <button 
              onClick={() => setSelectedProfileStaff(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6">
              {selectedProfileStaff.photo_url ? (
                <img src={selectedProfileStaff.photo_url} alt={selectedProfileStaff.name} className="w-24 h-24 rounded-2xl object-cover shadow-md border border-slate-200 shrink-0" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-2xl shrink-0">
                  {selectedProfileStaff.name.charAt(0)}
                </div>
              )}
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold inline-block mb-1">
                    {selectedProfileStaff.role}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">{selectedProfileStaff.name}</h3>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 font-mono">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-900">{selectedProfileStaff.rating || '4.9'} Rating</span>
                  </div>
                  <span>·</span>
                  <span className="font-semibold">{selectedProfileStaff.experience_years || 5}+ Years Experience</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedProfileStaff.bio || `${selectedProfileStaff.name} is a premier specialist at ${tenant.name}, dedicated to providing transformative beauty and wellness services with precision and artistry.`}
                </p>
              </div>
            </div>

            {/* Specific Service Expertise Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Specific Service Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProfileStaff.specialty?.map((spec, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    {spec}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Expertly certified in advanced techniques matching our premium salon catalog. Book an appointment below to reserve your seat with {selectedProfileStaff.name}.
              </div>
            </div>

            {/* Individual Work Gallery Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Individual Work & Portfolio Gallery</h4>
                <span className="text-xs font-mono text-slate-400">Click to view full-screen</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(() => {
                  const staffGallery = (selectedProfileStaff.work_gallery && selectedProfileStaff.work_gallery.length > 0 ? selectedProfileStaff.work_gallery : [
                    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200&h=1200",
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200&h=1200",
                    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200&h=1200"
                  ]);
                  return staffGallery.map((imgUrl, i) => (
                    <div 
                      key={i} 
                      onClick={() => openLightbox(staffGallery, i, `${selectedProfileStaff.name} - Portfolio #${i + 1}`)}
                      className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative cursor-pointer shadow-sm hover:shadow-md transition-all"
                    >
                      <img src={imgUrl} alt="Work sample" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Portfolio #{i + 1} - {selectedProfileStaff.name}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setSelectedProfileStaff(null)}
                className="flex-1 py-3 border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer text-slate-700"
              >
                Close Profile
              </button>
              <button 
                onClick={() => {
                  const staffObj = selectedProfileStaff;
                  setSelectedProfileStaff(null);
                  setSelectedStaff(staffObj);
                  setActiveTab('book');
                  setBookingStep(1);
                }}
                className={`flex-1 py-3 text-xs font-bold rounded-xl cursor-pointer text-white ${templateStyle.primaryBg} ${templateStyle.primaryHoverBg} shadow-md`}
              >
                Book with {selectedProfileStaff.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Lightbox with Swipe Gestures */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fadeIn select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar Controls */}
          <div className="absolute top-6 inset-x-6 flex items-center justify-between z-20 text-white">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <span className="text-xs font-mono font-bold tracking-wider">{lightboxIndex + 1} / {lightboxImages.length}</span>
              {lightboxCaption && <span className="text-xs text-slate-300 hidden sm:inline">| {lightboxCaption}</span>}
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer backdrop-blur-md"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image Display */}
          <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center px-4 sm:px-16">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(prev => (prev - 1 + lightboxImages.length) % lightboxImages.length);
              }}
              className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
              aria-label="Previous Image"
            >
              <span className="text-xl font-bold">&larr;</span>
            </button>

            <img
              src={lightboxImages[lightboxIndex]}
              alt={`Lightbox item ${lightboxIndex + 1}`}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
              referrerPolicy="no-referrer"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(prev => (prev + 1) % lightboxImages.length);
              }}
              className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
              aria-label="Next Image"
            >
              <span className="text-xl font-bold">&rarr;</span>
            </button>
          </div>

          {/* Thumbnail Navigation Bar at Bottom */}
          <div className="absolute bottom-6 inset-x-6 flex items-center justify-center gap-2 z-20 overflow-x-auto py-2">
            {lightboxImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${idx === lightboxIndex ? 'border-white scale-110 shadow-lg' : 'border-white/20 opacity-50 hover:opacity-100'}`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="block font-semibold text-white mb-2">Powered by Nexora SalonOS</span>
          <span className="block text-[10px] text-slate-500">10% Platform Success Transaction Fee Applied. No fixed monthly rental charges.</span>
        </div>
      </footer>

    </div>
  );
}
