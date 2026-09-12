/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, CheckCircle, ClipboardList, Scissors, 
  Users, Wallet as WalletIcon, Settings, Sparkles, 
  Eye, Save, Copy, Check, Plus, Trash2, Calendar, 
  MapPin, Phone, ArrowUpRight, TrendingUp, Info,
  Image, Sliders, Globe, AlertCircle, ExternalLink,
  UploadCloud, Play, FileText, ChevronRight
} from 'lucide-react';
import { api } from '../lib/supabase';
import { analyzeCustomerHistory, CustomerInteraction } from '../lib/ai/crm-logic';
import { 
  Tenant, TenantWebsite, Service, Staff, 
  Customer, Appointment, Wallet, WalletTransaction, 
  AppointmentStatus, PaymentStatus 
} from '../types';

interface OwnerDashboardProps {
  ownerTenantId: string;
  onSelectSlug: (slug: string) => void;
  onRefreshDB: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  onSelectOwnerTenantId: (id: string) => void;
}

export default function OwnerDashboard({ 
  ownerTenantId, 
  onSelectSlug,
  onRefreshDB,
  currentPath,
  onNavigate,
  onSelectOwnerTenantId
}: OwnerDashboardProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'bookings' | 'services' | 'staff' | 'crm' | 'wallet' | 'business-profile' | 'media' | 'settings'>('dashboard');

  // Business Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profileType, setProfileType] = useState('salon');
  const [profileOwnerName, setProfileOwnerName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileCity, setProfileCity] = useState('Jaipur');
  const [profileArea, setProfileArea] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Media Tab State
  const [galleryImages, setGalleryImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1605497746444-051d2b6da38e?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=600"
  ]);
  const [draggingMedia, setDraggingMedia] = useState(false);

  // Settings Tab State
  const [slotInterval, setSlotInterval] = useState(30);
  const [advancePercent, setAdvancePercent] = useState(25);
  const [enableWhatsappReminders, setEnableWhatsappReminders] = useState(true);
  const [shopOpenTime, setShopOpenTime] = useState("09:00 AM");
  const [shopCloseTime, setShopCloseTime] = useState("08:00 PM");
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Core Data State
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [website, setWebsite] = useState<TenantWebsite | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Routing-focused sub-states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Onboarding Form States
  const [onboardName, setOnboardName] = useState('');
  const [onboardType, setOnboardType] = useState('salon');
  const [onboardOwnerName, setOnboardOwnerName] = useState('');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardWhatsapp, setOnboardWhatsapp] = useState('');
  const [onboardCity] = useState('Jaipur');
  const [onboardArea, setOnboardArea] = useState('');
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardError, setOnboardError] = useState('');

  // Editing Service Form State
  const [editServiceName, setEditServiceName] = useState('');
  const [editServicePrice, setEditServicePrice] = useState(300);
  const [editServiceDuration, setEditServiceDuration] = useState(30);
  const [editServiceCat, setEditServiceCat] = useState('Grooming');
  const [editServiceDesc, setEditServiceDesc] = useState('');

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(300);
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServiceCat, setNewServiceCat] = useState('Grooming');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // New Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Senior Stylist');
  const [newStaffSpecialty, setNewStaffSpecialty] = useState('');

  // New Customer Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Builder Live Form State
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formHeroTitle, setFormHeroTitle] = useState('');
  const [formHeroSubtitle, setFormHeroSubtitle] = useState('');
  const [formAboutText, setFormAboutText] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTemplate, setFormTemplate] = useState('tpl_luxury');
  const [formVisibility, setFormVisibility] = useState({
    hero: true,
    services: true,
    gallery: true,
    reviews: true,
    location: true,
    contact: true,
    offers: true
  });
  const [isPublished, setIsPublished] = useState(false);

  // Status variables
  const [savingWebsite, setSavingWebsite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI CRM Data Computation
  const crmAnalysis = React.useMemo(() => {
    // Map customers to CustomerInteraction by aggregating bookings
    const interactions: CustomerInteraction[] = customers.map(c => {
      const customerBookings = bookings.filter(b => b.customer_id === c.id && b.status === 'completed');
      customerBookings.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
      
      const totalSpend = customerBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
      const lastVisit = customerBookings.length > 0 ? customerBookings[0].appointment_date : c.created_at;
      
      const pastServiceNames = [...new Set(customerBookings.map(b => {
        const svc = services.find(s => s.id === b.service_id);
        return svc ? svc.name : 'Treatment';
      }))];

      return {
        id: c.id,
        customer_id: c.id,
        customer_name: c.full_name,
        customer_phone: c.phone,
        last_visit_date: lastVisit,
        total_visits: customerBookings.length,
        total_spend: totalSpend,
        past_services: pastServiceNames
      };
    });

    return analyzeCustomerHistory(interactions);
  }, [customers, bookings, services]);

  // Synchronize state with incoming currentPath prop
  useEffect(() => {
    if (!currentPath) return;

    if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
      setActiveTab('dashboard');
      setEditingServiceId(null);
      setSelectedBookingId(null);
    } else if (currentPath.startsWith('/dashboard/website')) {
      setActiveTab('builder');
    } else if (currentPath.startsWith('/dashboard/services')) {
      setActiveTab('services');
      if (currentPath === '/dashboard/services/new') {
        // Render creation form
        setEditingServiceId(null);
      } else if (currentPath.includes('/edit')) {
        const parts = currentPath.split('/');
        const serviceId = parts[3]; // /dashboard/services/[id]/edit
        if (serviceId && serviceId !== 'new') {
          setEditingServiceId(serviceId);
        }
      } else {
        setEditingServiceId(null);
      }
    } else if (currentPath.startsWith('/dashboard/bookings')) {
      setActiveTab('bookings');
      const parts = currentPath.split('/');
      const bookingId = parts[3]; // /dashboard/bookings/[id]
      if (bookingId && bookingId !== 'bookings') {
        setSelectedBookingId(bookingId);
      } else {
        setSelectedBookingId(null);
      }
    } else if (currentPath === '/dashboard/staff') {
      setActiveTab('staff');
    } else if (currentPath === '/dashboard/crm') {
      setActiveTab('crm');
    } else if (currentPath === '/dashboard/business-profile') {
      setActiveTab('business-profile');
    } else if (currentPath === '/dashboard/media') {
      setActiveTab('media');
    } else if (currentPath === '/dashboard/settings') {
      setActiveTab('settings');
    } else if (currentPath === '/dashboard/wallet') {
      setActiveTab('wallet');
    }
  }, [currentPath]);

  // Handle sidebar navigation click
  const handleTabChange = (tabId: 'dashboard' | 'builder' | 'bookings' | 'services' | 'staff' | 'crm' | 'wallet' | 'business-profile' | 'media' | 'settings') => {
    let path = '/dashboard';
    if (tabId === 'builder') path = '/dashboard/website';
    else if (tabId === 'bookings') path = '/dashboard/bookings';
    else if (tabId === 'services') path = '/dashboard/services';
    else if (tabId === 'staff') path = '/dashboard/staff';
    else if (tabId === 'crm') path = '/dashboard/crm';
    else if (tabId === 'business-profile') path = '/dashboard/business-profile';
    else if (tabId === 'media') path = '/dashboard/media';
    else if (tabId === 'settings') path = '/dashboard/settings';
    else if (tabId === 'wallet') path = '/dashboard/wallet';

    setActiveTab(tabId);
    onNavigate(path);
    setEditingServiceId(null);
    setSelectedBookingId(null);
  };

  // Onboard Submission Handler
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardName || !onboardOwnerName || !onboardPhone || !onboardArea) {
      setOnboardError('Please fill in all required fields.');
      return;
    }
    try {
      setOnboardSubmitting(true);
      setOnboardError('');
      
      const newTenantData = {
        name: onboardName,
        business_type: onboardType,
        owner_name: onboardOwnerName,
        phone: onboardPhone,
        whatsapp_number: onboardWhatsapp || onboardPhone,
        city: onboardCity,
        area: onboardArea,
        address: `${onboardArea}, ${onboardCity}`,
        owner_id: "usr_owner_" + Math.random().toString(36).substring(2, 9)
      };

      const result = await api.createTenant(newTenantData);
      if (result.success && result.tenant) {
        onRefreshDB();
        onSelectOwnerTenantId(result.tenant.id);
        onNavigate('/dashboard/website/templates');
      } else {
        setOnboardError(result.error || 'Failed to register salon. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setOnboardError('An unexpected error occurred during salon registration.');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  // Populate edit service fields
  useEffect(() => {
    if (editingServiceId && services.length > 0) {
      const s = services.find(x => x.id === editingServiceId);
      if (s) {
        setEditServiceName(s.name);
        setEditServicePrice(s.price);
        setEditServiceDuration(s.duration_minutes);
        setEditServiceCat(s.category_name);
        setEditServiceDesc(s.description || '');
      }
    }
  }, [editingServiceId, services]);

  // Update Service Handler
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServiceId || !editServiceName) return;
    try {
      const res = await api.updateService(editingServiceId, {
        name: editServiceName,
        price: Number(editServicePrice),
        duration_minutes: Number(editServiceDuration),
        category_name: editServiceCat,
        description: editServiceDesc
      });
      if (res.success) {
        setServices(services.map(s => s.id === editingServiceId ? res.service : s));
        onRefreshDB();
        onNavigate('/dashboard/services');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Business Profile Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    try {
      setSavingProfile(true);
      setProfileSuccess(false);
      const res = await api.updateTenant(tenant.id, {
        name: profileName,
        business_type: profileType,
        owner_name: profileOwnerName,
        phone: profilePhone,
        whatsapp_number: profileWhatsapp,
        city: profileCity,
        area: profileArea,
        address: profileAddress
      });
      if (res.success) {
        setTenant(res.tenant);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
        onRefreshDB();
      } else {
        alert(res.error || "Failed to update business profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile details.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Load everything for the active tenant
  useEffect(() => {
    async function loadOwnerData() {
      if (!ownerTenantId) return;
      if (ownerTenantId === 'new') {
        setLoading(false);
        setTenant(null);
        setWebsite(null);
        return;
      }
      try {
        setLoading(true);
        const fullDB = await api.getFullDB();
        
        // Find tenant
        const activeTenant = fullDB.tenants.find((t: any) => t.id === ownerTenantId);
        if (activeTenant) {
          setTenant(activeTenant);
          setProfileName(activeTenant.name);
          setProfileType(activeTenant.business_type);
          setProfileOwnerName(activeTenant.owner_name);
          setProfilePhone(activeTenant.phone);
          setProfileWhatsapp(activeTenant.whatsapp_number || activeTenant.phone);
          setProfileCity(activeTenant.city);
          setProfileArea(activeTenant.area);
          setProfileAddress(activeTenant.address);
          
          // Find website
          const web = fullDB.tenant_websites.find((w: any) => w.tenant_id === activeTenant.id);
          if (web) {
            setWebsite(web);
            // Populate form fields
            setFormSlug(web.slug);
            setFormTitle(web.website_title);
            setFormHeroTitle(web.hero_title);
            setFormHeroSubtitle(web.hero_subtitle);
            setFormAboutText(web.about_text);
            setFormPhone(web.phone);
            setFormWhatsapp(web.whatsapp_number);
            setFormAddress(web.address);
            setFormTemplate(web.template_id);
            setFormVisibility(web.section_visibility);
            setIsPublished(web.is_published);
          }

          // Fetch other tables filtered by tenant_id
          const shopServices = fullDB.services.filter((s: any) => s.tenant_id === activeTenant.id && !s.deleted_at);
          setServices(shopServices);

          const shopStaff = fullDB.staff.filter((s: any) => s.tenant_id === activeTenant.id);
          setStaff(shopStaff);

          const shopCustomers = fullDB.customers.filter((c: any) => c.tenant_id === activeTenant.id);
          setCustomers(shopCustomers);

          const shopBookings = fullDB.appointments.filter((a: any) => a.tenant_id === activeTenant.id);
          setBookings(shopBookings);

          // Find wallet
          const activeWallet = fullDB.wallets.find((w: any) => w.owner_id === activeTenant.owner_id);
          if (activeWallet) {
            setWallet(activeWallet);
            const activeTx = fullDB.transactions.filter((tx: any) => tx.wallet_id === activeWallet.id);
            setTransactions(activeTx);
          }
        }
      } catch (err) {
        console.error("Error loading owner dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOwnerData();
  }, [ownerTenantId, activeTab, refreshTrigger]);

  // Handle Save Website
  const handleSaveWebsite = async (publishTrigger?: boolean) => {
    if (!website) return;
    try {
      setSavingWebsite(true);
      
      const updatedPublishStatus = publishTrigger !== undefined ? publishTrigger : isPublished;

      // Validation logic if publishing
      if (updatedPublishStatus) {
        if (!formSlug) { alert("Custom domain slug is mandatory for publication."); return; }
        if (!formTitle) { alert("Website Title is required."); return; }
        if (services.length === 0) { alert("Publishing requires at least 1 active menu service."); return; }
        if (!formPhone && !formWhatsapp) { alert("Publishing requires an active phone or WhatsApp desk number."); return; }
      }

      const res = await api.updateWebsite(website.id, {
        slug: formSlug,
        website_title: formTitle,
        hero_title: formHeroTitle,
        hero_subtitle: formHeroSubtitle,
        about_text: formAboutText,
        phone: formPhone,
        whatsapp_number: formWhatsapp,
        address: formAddress,
        template_id: formTemplate,
        section_visibility: formVisibility,
        is_published: updatedPublishStatus,
        published_at: updatedPublishStatus ? new Date().toISOString() : website.published_at
      });

      if (res.success) {
        setWebsite(res.website);
        setIsPublished(updatedPublishStatus);
        alert(updatedPublishStatus ? "Website successfully published live!" : "Website offline drafts saved.");
        onRefreshDB();
      } else {
        alert(res.error || "Failed to update website builder.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving website build configuration.");
    } finally {
      setSavingWebsite(false);
    }
  };

  // Add Service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    try {
      const res = await api.createService({
        tenant_id: ownerTenantId,
        category_name: newServiceCat,
        name: newServiceName,
        description: newServiceDesc,
        price: Number(newServicePrice),
        duration_minutes: Number(newServiceDuration)
      });
      if (res.success) {
        setServices([...services, res.service]);
        setNewServiceName('');
        setNewServiceDesc('');
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Staff
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    try {
      const res = await api.createStaff({
        tenant_id: ownerTenantId,
        name: newStaffName,
        role: newStaffRole,
        specialty: newStaffSpecialty.split(',').map(s => s.trim())
      });
      if (res.success) {
        setStaff([...staff, res.staff]);
        setNewStaffName('');
        setNewStaffSpecialty('');
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) return;

    try {
      const res = await api.createCustomer({
        tenant_id: ownerTenantId,
        full_name: newCustomerName,
        phone: newCustomerPhone,
        status: 'active'
      });
      if (res.success) {
        setCustomers([...customers, res.customer]);
        setNewCustomerName('');
        setNewCustomerPhone('');
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Appointment Status (Triggers split/commission logic on server!)
  const handleUpdateAptStatus = async (id: string, status: AppointmentStatus, payStatus?: PaymentStatus) => {
    try {
      const updates: any = { status };
      if (payStatus) updates.payment_status = payStatus;

      const res = await api.updateAppointment(id, updates);
      if (res.success) {
        setBookings(bookings.map(b => b.id === id ? res.appointment : b));
        alert(`Booking status changed successfully. Wallets updated.`);
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve Dispute Resolution (refunded or rejected)
  const handleResolveDispute = async (id: string, resolution: 'refunded' | 'rejected') => {
    try {
      const res = await api.resolveDispute(id, resolution);
      if (res.success) {
        alert(`Dispute resolved successfully: ${resolution.toUpperCase()}`);
        onRefreshDB();
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(res.error || "Failed to resolve dispute");
      }
    } catch (err) {
      console.error(err);
      alert("Error resolving dispute");
    }
  };

  // Trigger manual simulation payout sweep
  const handleTriggerPayout = async () => {
    try {
      const res = await api.triggerDailyPayouts();
      if (res.success && res.count > 0) {
        alert(`Succeeded! Daily 10:00 PM Settlement Sweep executed. ${res.count} payouts disbursed.`);
        onRefreshDB();
      } else {
        alert("Settlement sweep done: No active wallets with positive balances require payout.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copySlugLink = () => {
    if (!website) return;
    const url = `${window.location.origin}/site/${website.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (ownerTenantId === 'new') {
    return (
      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center text-left">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Building className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Salon Website</h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Launch your free Nexora website and start taking bookings in minutes. No credit card required.
            </p>
          </div>

          {onboardError && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-700 text-xs font-semibold">
              ⚠️ {onboardError}
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Business Name *</label>
                <input 
                  type="text"
                  required
                  value={onboardName}
                  onChange={(e) => setOnboardName(e.target.value)}
                  placeholder="e.g. Aura Premium Salon"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Business Type *</label>
                <select
                  value={onboardType}
                  onChange={(e) => setOnboardType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="salon">Luxury Beauty Salon</option>
                  <option value="barber">Modern Barber Shop</option>
                  <option value="spa">Spa & Wellness Center</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Owner Full Name *</label>
              <input 
                type="text"
                required
                value={onboardOwnerName}
                onChange={(e) => setOnboardOwnerName(e.target.value)}
                placeholder="e.g. Sanjay Singhal"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Mobile Number *</label>
                <input 
                  type="tel"
                  required
                  value={onboardPhone}
                  onChange={(e) => setOnboardPhone(e.target.value)}
                  placeholder="e.g. 9829012345"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">WhatsApp Booking Number</label>
                <input 
                  type="tel"
                  value={onboardWhatsapp}
                  onChange={(e) => setOnboardWhatsapp(e.target.value)}
                  placeholder="Leave blank to use mobile number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">City *</label>
                <input 
                  type="text"
                  required
                  disabled
                  value={onboardCity}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Area / Locality *</label>
                <input 
                  type="text"
                  required
                  value={onboardArea}
                  onChange={(e) => setOnboardArea(e.target.value)}
                  placeholder="e.g. C-Scheme or Malviya Nagar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={onboardSubmitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              {onboardSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Create Business & Website</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs">Synchronizing SalonOS credentials...</p>
      </div>
    );
  }

  // Dashboard Progress checklist calculation
  const isTemplateSelected = !!website?.template_id;
  const isServicesAdded = services.length > 0;
  const isContactAdded = !!formPhone || !!formWhatsapp;
  const readyToBook = isTemplateSelected && isServicesAdded && isContactAdded;

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] flex flex-col md:flex-row text-left font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E2E8F0] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-indigo-600/20 shadow-md">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm leading-tight text-slate-950">{tenant.name}</h2>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono block w-max mt-1 font-semibold capitalize">
                {tenant.business_type} Owner
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ClipboardList },
              { id: 'builder', label: 'Website', icon: Sparkles },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'services', label: 'Services', icon: Scissors },
              { id: 'business-profile', label: 'Business Profile', icon: Building },
              { id: 'media', label: 'Media', icon: Image },
              { id: 'crm', label: 'AI CRM', icon: Sparkles },
              { id: 'staff', label: 'Staff', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`owner-nav-${tab.id}`}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-6">
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-500 font-mono font-medium">SaaS Cloud Connection</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
             {/* TAB 1: Redesigned Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn text-left">
            
            {/* Top Welcome & Business header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                    Nexora SalonOS Console
                  </span>
                  {website?.is_published ? (
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Published & Live</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Offline Draft Mode</span>
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Welcome back, {tenant.owner_name}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm max-w-xl leading-relaxed">
                  Manage operations, website design, slots, and client communications for <strong className="text-slate-800 font-extrabold">{tenant.name}</strong> from your centralized system.
                </p>
              </div>

              {/* Header Actions */}
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button 
                  onClick={() => handleTabChange('builder')}
                  className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize Website</span>
                </button>
                {website && (
                  <button 
                    onClick={() => onSelectSlug(website.slug)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Website</span>
                  </button>
                )}
              </div>
            </div>

            {/* Redesigned Premium Metric Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              
              {/* 1. Website Status Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Website Status</span>
                  {website?.is_published ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                      <span>Published & Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                      <span>Draft Mode</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleSaveWebsite(!isPublished)}
                  className="w-full text-center text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {isPublished ? "Switch to Offline Draft" : "Publish Live Now"}
                </button>
              </div>

              {/* 2. Public Website Link Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Domain Slug URL</span>
                  <div className="text-xs font-mono font-bold text-slate-800 truncate" title={`/site/${website?.slug}`}>
                    /site/{website?.slug}
                  </div>
                </div>
                <button 
                  onClick={copySlugLink}
                  className="w-full text-center text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? "Link Copied!" : "Copy Domain Link"}</span>
                </button>
              </div>

              {/* 3. Total Services Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Total Treatment Services</span>
                  <div className="text-2xl font-black text-slate-950">
                    {services.length}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {services.length > 0 
                    ? `Avg treatment: Rs. ${Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length)}` 
                    : "No services cataloged yet"}
                </div>
              </div>

              {/* 4. Today Bookings Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Today's Slots (July 7)</span>
                  {(() => {
                    const todayStr = '2026-07-07';
                    const todayBookings = bookings.filter(b => b.appointment_date === todayStr);
                    if (todayBookings.length > 0) {
                      return (
                        <div className="text-2xl font-black text-emerald-600">
                          {todayBookings.length} Bookings
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-xs text-slate-500 font-semibold leading-snug">
                          No bookings scheduled for today. Ready for bookings. Share your website to get started!
                        </div>
                      );
                    }
                  })()}
                </div>
                {(() => {
                  const todayStr = '2026-07-07';
                  const todayBookings = bookings.filter(b => b.appointment_date === todayStr);
                  if (todayBookings.length > 0) {
                    return (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        Revenue Today: Rs. {todayBookings.reduce((sum, b) => sum + b.total_amount, 0)}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* 5. Pending Payments Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Pending Escrow / Advances</span>
                  {(() => {
                    const pendingBookings = bookings.filter(
                      b => b.status === AppointmentStatus.PENDING_PAYMENT || b.payment_status === PaymentStatus.ADVANCE_PENDING
                    );
                    const pendingSum = pendingBookings.reduce((sum, b) => sum + b.advance_amount, 0);
                    if (pendingBookings.length > 0) {
                      return (
                        <div className="space-y-1">
                          <div className="text-2xl font-black text-rose-600">
                            Rs. {pendingSum}
                          </div>
                          <div className="text-[10px] text-rose-500 font-medium font-mono">
                            {pendingBookings.length} advances waiting checkout
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-xs text-slate-500 font-semibold leading-snug">
                          All client payments settled. No pending advances.
                        </div>
                      );
                    }
                  })()}
                </div>
                <button 
                  onClick={() => handleTabChange('bookings')}
                  className="w-full text-center text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Verify Booking Ledger
                </button>
              </div>

            </div>

            {/* Launchpad & Quick Actions Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Launchpad checklist: Left Column */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">
                    SaaS Operational Launchpad
                  </span>
                  <h3 className="text-lg font-black text-slate-900 font-sans">
                    Your salon website is almost ready.
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete these steps to start taking bookings.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">Checklist Completion</span>
                    <span className="text-indigo-600">{Math.round(( (isTemplateSelected ? 1 : 0) + (isServicesAdded ? 1 : 0) + (isContactAdded ? 1 : 0) + (website?.is_published ? 1 : 0) ) / 4 * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${((isTemplateSelected ? 1 : 0) + (isServicesAdded ? 1 : 0) + (isContactAdded ? 1 : 0) + (website?.is_published ? 1 : 0)) / 4 * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step items */}
                <div className="space-y-3">
                  {[
                    { 
                      label: "1. Premium Template Selected", 
                      desc: "Select a gold, modern or organic design theme for your salon.", 
                      completed: isTemplateSelected,
                      actionText: "Open Template Store",
                      action: () => handleTabChange('builder') 
                    },
                    { 
                      label: "2. Treatment Catalog Menu Added", 
                      desc: "Provide at least one premium service or package item for clients.", 
                      completed: isServicesAdded,
                      actionText: "Configure Catalog",
                      action: () => onNavigate('/dashboard/services/new')
                    },
                    { 
                      label: "3. Operational Contact Desk phone loaded", 
                      desc: "Make sure clients can call or chat via WhatsApp.", 
                      completed: isContactAdded,
                      actionText: "Update Contact Desk",
                      action: () => onNavigate('/dashboard/website/settings')
                    },
                    { 
                      label: "4. Go Live / Publish Website", 
                      desc: "Deploy your brand website to Jaipur’s public discovery network.", 
                      completed: !!website?.is_published,
                      actionText: "Publish Website",
                      action: () => handleSaveWebsite(true)
                    }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        item.completed ? 'bg-slate-50/50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex gap-3 text-left">
                        {item.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                        )}
                        <div>
                          <h4 className={`text-xs font-bold ${item.completed ? 'text-slate-700' : 'text-slate-900'}`}>
                            {item.label}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      
                      {!item.completed && (
                        <button 
                          onClick={item.action}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors self-start sm:self-center cursor-pointer"
                        >
                          {item.actionText}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions Desk & Real Queue list: Right Column */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Quick actions Desk */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Quick Action Shortcuts
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    
                    <button 
                      onClick={() => {
                        if (website?.slug) {
                          onSelectSlug(website.slug);
                        } else {
                          alert("Please set up your website in the Website tab first.");
                        }
                      }}
                      className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-950">View Website</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Preview live portal</p>
                    </button>

                    <button 
                      onClick={() => onNavigate('/dashboard/services/new')}
                      className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-950">Add Service</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Onboard treatment</p>
                    </button>

                    <button 
                      onClick={() => handleTabChange('builder')}
                      className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-950">Edit Website</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Adjust visual theme</p>
                    </button>

                    <button 
                      onClick={() => handleTabChange('bookings')}
                      className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-950">View Bookings</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Track ledger list</p>
                    </button>

                  </div>
                </div>

                {/* 2. Today's Appointments Timeline */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Today's Timeline
                    </h3>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                      July 7, 2026
                    </span>
                  </div>

                  {(() => {
                    const todayStr = '2026-07-07';
                    const todayBookings = bookings.filter(b => b.appointment_date === todayStr);
                    if (todayBookings.length === 0) {
                      return (
                        <div className="py-6 text-center text-slate-400 text-xs">
                          No client slots scheduled for today yet.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {todayBookings.map((b) => (
                          <div key={b.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between text-xs gap-3">
                            <div className="text-left space-y-0.5 min-w-0">
                              <span className="font-bold text-slate-800 block truncate">
                                {b.customer_name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Slot: {b.appointment_time} | Rs. {b.total_amount}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border shrink-0 ${
                              b.status === AppointmentStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              b.status === AppointmentStatus.PENDING_PAYMENT ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>

            {/* Recent Global Ledger Activity */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Booking Ledger Queue</h3>
                  <p className="text-xs text-slate-500">Live operational slot verification, escrow balances, and direct checkout.</p>
                </div>
                <button 
                  onClick={() => handleTabChange('bookings')}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Verify entire ledger</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No appointments registered yet. When a customer schedules a treatment, it will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-bold">Client / Slot</th>
                        <th className="p-3 font-bold">Treatment Service</th>
                        <th className="p-3 font-bold">Deposit / Escrow</th>
                        <th className="p-3 font-bold">Slot Time</th>
                        <th className="p-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">
                            <div>{b.customer_name}</div>
                            <div className="text-[10px] text-slate-400 font-normal font-mono">{b.customer_phone}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800">{b.service_name}</span>
                          </td>
                          <td className="p-3 font-mono">
                            <div className="font-extrabold text-slate-950">Rs. {b.total_amount}</div>
                            <div className="text-[10px] text-slate-400">Advance: Rs. {b.advance_amount}</div>
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            <div>{b.appointment_date}</div>
                            <div className="text-[10px] text-indigo-600 font-semibold">{b.appointment_time}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded text-[9px] font-bold border capitalize ${
                              b.status === AppointmentStatus.COMPLETED ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              b.status === AppointmentStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              b.status === AppointmentStatus.CANCELLED ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Visual Builder & Split-screen preview */}
        {activeTab === 'builder' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">White-Label Website Builder</h1>
                <p className="text-xs text-slate-500">Design your high-fidelity brand domain with real-time split-screen rendering.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSaveWebsite(false)} 
                  disabled={savingWebsite}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => handleSaveWebsite(true)} 
                  disabled={savingWebsite}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Live</span>
                </button>
              </div>
            </div>

            {/* Website Builder Sub-navigation Bar */}
            <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap text-xs font-bold gap-6">
              {[
                { path: '/dashboard/website', label: 'All Modules' },
                { path: '/dashboard/website/templates', label: '1. Premium Templates' },
                { path: '/dashboard/website/editor', label: '2. Content Editor' },
                { path: '/dashboard/website/preview', label: '3. Visual Mobile Simulator' },
                { path: '/dashboard/website/settings', label: '4. Slug & Domain Settings' }
              ].map((sub) => {
                const isActive = currentPath === sub.path || (sub.path === '/dashboard/website' && currentPath === '/dashboard/website/');
                return (
                  <button
                    key={sub.path}
                    onClick={() => onNavigate(sub.path)}
                    className={`pb-3 border-b-2 px-1 transition-all cursor-pointer ${
                      isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* Sub-routing Render Logic */}
            {(() => {
              const isAll = currentPath === '/dashboard/website' || currentPath === '/dashboard/website/';
              const isTemplates = currentPath === '/dashboard/website/templates';
              const isEditor = currentPath === '/dashboard/website/editor';
              const isPreview = currentPath === '/dashboard/website/preview';
              const isSettings = currentPath === '/dashboard/website/settings';

              // Shared visual simulator element
              const renderPreviewSimulator = () => (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Mobile Simulator</span>
                    {isPublished && (
                      <button 
                        onClick={copySlugLink}
                        className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy live link</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-900 rounded-[32px] p-3.5 shadow-2xl border-4 border-slate-800 aspect-[9/16] max-w-[320px] mx-auto relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full z-20"></div>
                    
                    {/* Embedded Custom representation */}
                    <div className={`bg-white rounded-2xl h-full w-full overflow-y-auto overflow-x-hidden p-3 text-left flex flex-col justify-between ${
                      formTemplate === 'tpl_luxury' ? 'font-serif' : formTemplate === 'tpl_barber' ? 'font-mono' : 'font-sans'
                    }`}>
                      <div className="space-y-4">
                        {/* Nav mock */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] font-bold text-slate-800">
                          <span>{tenant.name}</span>
                          <span className="text-[8px] bg-indigo-100 text-indigo-800 px-1 rounded">Audited</span>
                        </div>

                        {/* Hero mock */}
                        {formVisibility.hero && (
                          <div className="py-6 px-2 text-center space-y-2 bg-slate-50 rounded-xl">
                            <h4 className="text-xs font-black leading-tight text-slate-950">{formHeroTitle || 'Welcome'}</h4>
                            <p className="text-[9px] text-slate-500 leading-normal line-clamp-2">{formHeroSubtitle || 'Description Subtitle'}</p>
                            <button className="bg-indigo-600 text-white text-[8px] font-bold py-1.5 px-3 rounded-full mt-2">Book Online Seat</button>
                          </div>
                        )}

                        {/* Services list mock */}
                        {formVisibility.services && (
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-black border-l-2 border-indigo-600 pl-1 text-slate-900">Services Menu</h5>
                            <div className="space-y-1.5">
                              {services.slice(0, 3).map(s => (
                                <div key={s.id} className="p-2 border border-slate-100 rounded-lg flex justify-between items-center text-[9px] bg-slate-50">
                                  <div>
                                    <h6 className="font-bold text-slate-800">{s.name}</h6>
                                    <span className="text-[8px] text-slate-400">{s.duration_minutes} Mins</span>
                                  </div>
                                  <span className="font-extrabold text-slate-950">Rs. {s.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* About Story mock */}
                        {formVisibility.about && (
                          <div className="space-y-1">
                            <h5 className="text-[10px] font-black border-l-2 border-indigo-600 pl-1 text-slate-900">Our Story</h5>
                            <p className="text-[9px] text-slate-500 leading-normal">{formAboutText || 'Story of the salon...'}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-center pt-4 border-t border-slate-100 text-[8px] text-slate-400">
                        Powered by Nexora SalonOS
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left panel options: conditional on currentPath */}
                  {(isAll || isTemplates || isEditor || isSettings) && (
                    <div className={`${isPreview ? 'hidden' : isAll ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-3xl border border-slate-200 p-6 space-y-6`}>
                      
                      {/* Sub-section: Template selection */}
                      {(isAll || isTemplates) && (
                        <div className="space-y-4">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">1. Selected Premium Template</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { id: 'tpl_luxury', name: 'Luxury Beauty', desc: 'Serif fonts, gold details, warm and elegant high-contrast styling.' },
                              { id: 'tpl_barber', name: 'Modern Barber', desc: 'Monospace code accents, bold borders, vintage urban vibes.' },
                              { id: 'tpl_spa', name: 'Spa & Wellness', desc: 'Sans-serif fonts, organic spacing, lush relaxing color tones.' }
                            ].map((t) => (
                              <div 
                                key={t.id}
                                onClick={() => setFormTemplate(t.id)}
                                className={`p-4 border rounded-2xl text-left cursor-pointer transition-all ${
                                  formTemplate === t.id ? 'border-indigo-600 bg-indigo-50/10 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-xs font-extrabold block text-indigo-900 mb-1">{t.name}</span>
                                <p className="text-[10px] text-slate-500 leading-relaxed">{t.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sub-section: Content Editor details */}
                      {(isAll || isEditor) && (
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                          <h3 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-2">2. Website Content Editor</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Website Title</label>
                              <input 
                                type="text" 
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Hero Headline Text</label>
                              <input 
                                type="text" 
                                value={formHeroTitle}
                                onChange={(e) => setFormHeroTitle(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Hero Description Subtitle</label>
                            <textarea 
                              value={formHeroSubtitle}
                              onChange={(e) => setFormHeroSubtitle(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">About Our Salon Story</label>
                            <textarea 
                              value={formAboutText}
                              onChange={(e) => setFormAboutText(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Enable Page Modules</label>
                            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                              {Object.keys(formVisibility).map((sec) => (
                                <label key={sec} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={(formVisibility as any)[sec]}
                                    onChange={(e) => setFormVisibility({
                                      ...formVisibility,
                                      [sec]: e.target.checked
                                    })}
                                    className="text-indigo-600 focus:ring-indigo-500 rounded border-slate-300 cursor-pointer"
                                  />
                                  <span className="capitalize text-slate-700">{sec} Module</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-section: Slug & Settings */}
                      {(isAll || isSettings) && (
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                          <h3 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-2">4. Slug & Domain Settings</h3>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Custom Slug Name (Your Live URL)</label>
                            <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-1 focus-within:ring-indigo-500 bg-slate-50">
                              <span className="bg-slate-100 text-slate-500 text-xs px-3 py-3 font-mono border-r border-slate-200">/site/</span>
                              <input 
                                type="text" 
                                value={formSlug}
                                onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                className="bg-white border-none focus:ring-0 text-xs font-semibold p-3 w-full outline-none text-slate-800"
                                placeholder="e.g. aura-premium"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Desk Phone</label>
                              <input 
                                type="text" 
                                value={formPhone}
                                onChange={(e) => setFormPhone(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">WhatsApp Booking Number</label>
                              <input 
                                type="text" 
                                value={formWhatsapp}
                                onChange={(e) => setFormWhatsapp(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Salon Physical Address</label>
                            <input 
                              type="text" 
                              value={formAddress}
                              onChange={(e) => setFormAddress(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Right panel: conditional preview simulator */}
                  {(isAll || isPreview) && (
                    <div className={`${isPreview ? 'lg:col-span-12' : 'lg:col-span-5'}`}>
                      {renderPreviewSimulator()}
                    </div>
                  )}

                </div>
              );
            })()}

          </div>
        )}

        {/* TAB 3: Booking Ledger list */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Booking Details View */}
            {selectedBookingId ? (() => {
              const booking = bookings.find(b => b.id === selectedBookingId);
              if (!booking) {
                return (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
                    <p>Booking transaction not found.</p>
                    <button onClick={() => onNavigate('/dashboard/bookings')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded text-xs">Back to Ledger</button>
                  </div>
                );
              }
              const sDetails = services.find(s => s.id === booking.service_id);
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onNavigate('/dashboard/bookings')}
                      className="p-2 border rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer text-xs font-bold"
                    >
                      ← Back to Ledger
                    </button>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-slate-950 font-sans">Booking Transaction Audit</h1>
                      <p className="text-xs text-slate-500 font-mono">Reference: {booking.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Columns: Customer & Treatment */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Customer and Slot Card */}
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">Client Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-slate-400 font-medium block">Customer Name</span>
                            <p className="font-extrabold text-slate-900 text-sm mt-1">{booking.customer_name}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Phone Number</span>
                            <p className="font-bold text-slate-900 text-sm mt-1 font-mono">{booking.customer_phone}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Appointment Date</span>
                            <p className="font-bold text-slate-900 mt-1">{booking.appointment_date}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Scheduled Time Slot</span>
                            <p className="font-bold text-slate-900 mt-1">{booking.appointment_time}</p>
                          </div>
                        </div>
                      </div>

                      {/* Service Card */}
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">Treatment Selection</h3>
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase">{sDetails?.category_name || 'Grooming'}</span>
                            <h4 className="font-extrabold text-base text-slate-900">{sDetails?.name || 'Treatment'}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-md">{sDetails?.description || 'Bespoke beauty grooming treatment configured on Nexora OS.'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-slate-400 text-xs font-semibold block">Service Value</span>
                            <p className="text-lg font-black text-slate-950 mt-1">Rs. {booking.total_amount}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Duration: {sDetails?.duration_minutes || 30} mins</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Ledger Splits and Status Transitions */}
                    <div className="space-y-6">
                      {/* Ledger Splits */}
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">SaaS Ledger Splits</h3>
                        <div className="space-y-3 text-xs font-semibold">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Gross Service Amount</span>
                            <span className="font-extrabold text-slate-900">Rs. {booking.total_amount}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                            <div>
                              <span className="font-bold text-indigo-900 block">25% Advance Booking Deposit</span>
                              <span className="text-[9px] text-indigo-600 font-semibold mt-0.5 block">Payment Status: {booking.payment_status}</span>
                            </div>
                            <span className="font-black text-indigo-950 text-sm shrink-0">Rs. {booking.advance_amount}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                              <span className="font-bold text-slate-700 block">75% Cash On-Venue Settlement</span>
                              <span className="text-[9px] text-slate-500 mt-0.5 block">Paid directly to salon during checkout</span>
                            </div>
                            <span className="font-extrabold text-slate-800 text-sm shrink-0">Rs. {booking.remaining_amount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Transitions */}
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">Ledger Actions</h3>
                        <div className="space-y-3 font-semibold">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-1">Current Booking Status</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block capitalize ${
                              booking.status === AppointmentStatus.CONFIRMED ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                              booking.status === AppointmentStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              booking.status === AppointmentStatus.CANCELLED ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="space-y-3 pt-2">
                            {/* QR Verification Proof Info */}
                            {(booking.payment_status === 'ADVANCE_PENDING_VERIFICATION' || booking.payment_status === 'FULL_PENDING_VERIFICATION' || booking.verification_proof_code) && (
                              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                                <div className="flex gap-2 text-xs font-bold text-amber-800">
                                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="block uppercase tracking-wider text-[10px]">Payment Proof Pending Verification</span>
                                    <span className="text-slate-600 text-[11px] font-medium block mt-1">
                                      Customer UTR/Ref Code:
                                    </span>
                                    <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200 inline-block text-xs mt-1 font-bold">
                                      {booking.verification_proof_code || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                                  Please verify that this UTR Reference Code matches the Rs. {booking.payment_status === 'FULL_PENDING_VERIFICATION' ? booking.total_amount : booking.advance_amount} credit in your Nexora QR Terminal.
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      const payStatus = booking.payment_status === 'FULL_PENDING_VERIFICATION' ? PaymentStatus.PAID_IN_FULL : PaymentStatus.ADVANCE_PAID;
                                      const nextStatus = booking.payment_status === 'FULL_PENDING_VERIFICATION' ? AppointmentStatus.COMPLETED : AppointmentStatus.CONFIRMED;
                                      handleUpdateAptStatus(booking.id, nextStatus, payStatus);
                                    }}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                                  >
                                    Approve Proof
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleUpdateAptStatus(booking.id, AppointmentStatus.PENDING_PAYMENT, PaymentStatus.ADVANCE_PENDING);
                                    }}
                                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    Reject Proof
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Dispute Info & Resolution */}
                            {booking.is_disputed && (
                              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                                <div className="flex gap-2 text-xs font-bold text-rose-800">
                                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div className="space-y-1">
                                    <span className="block uppercase tracking-wider text-[10px]">Active Customer Refund Dispute</span>
                                    <span className="text-slate-600 text-[11px] font-medium block">
                                      Reason:
                                    </span>
                                    <p className="text-rose-950 font-medium bg-rose-100 px-3 py-2 rounded-xl border border-rose-200 text-[11px] italic leading-relaxed">
                                      "{booking.dispute_reason || 'No details provided'}"
                                    </p>
                                    <span className="text-[10px] text-slate-500 block">Status: <span className="uppercase font-bold text-rose-600">{booking.dispute_status || 'open'}</span></span>
                                  </div>
                                </div>
                                {booking.dispute_status === 'open' && (
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => handleResolveDispute(booking.id, 'refunded')}
                                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                                    >
                                      Approve Refund
                                    </button>
                                    <button
                                      onClick={() => handleResolveDispute(booking.id, 'rejected')}
                                      className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      Reject Dispute
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* QR Verification Proof Info */}
                            {(booking.payment_status === 'ADVANCE_PENDING_VERIFICATION' || booking.payment_status === 'FULL_PENDING_VERIFICATION' || booking.verification_proof_code) && (
                              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 mb-3">
                                <div className="flex gap-2 text-xs font-bold text-amber-800">
                                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="block uppercase tracking-wider text-[10px]">Payment Proof Pending Verification</span>
                                    <span className="text-slate-600 text-[11px] font-medium block mt-1">
                                      Customer UTR/Ref Code:
                                    </span>
                                    <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200 inline-block text-xs mt-1 font-bold">
                                      {booking.verification_proof_code || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                                  Please verify that this UTR Reference Code matches the Rs. {booking.payment_status === 'FULL_PENDING_VERIFICATION' ? booking.total_amount : booking.advance_amount} credit in your Nexora QR Terminal.
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      const payStatus = booking.payment_status === 'FULL_PENDING_VERIFICATION' ? PaymentStatus.PAID_IN_FULL : PaymentStatus.ADVANCE_PAID;
                                      const nextStatus = booking.payment_status === 'FULL_PENDING_VERIFICATION' ? AppointmentStatus.COMPLETED : AppointmentStatus.CONFIRMED;
                                      handleUpdateAptStatus(booking.id, nextStatus, payStatus);
                                    }}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                                  >
                                    Approve Proof
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleUpdateAptStatus(booking.id, AppointmentStatus.PENDING_PAYMENT, PaymentStatus.ADVANCE_PENDING);
                                    }}
                                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    Reject Proof
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Dispute Info & Resolution */}
                            {booking.is_disputed && (
                              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3 mb-3">
                                <div className="flex gap-2 text-xs font-bold text-rose-800">
                                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div className="space-y-1">
                                    <span className="block uppercase tracking-wider text-[10px]">Active Customer Refund Dispute</span>
                                    <span className="text-slate-600 text-[11px] font-medium block">
                                      Reason:
                                    </span>
                                    <p className="text-rose-950 font-medium bg-rose-100 px-3 py-2 rounded-xl border border-rose-200 text-[11px] italic leading-relaxed">
                                      "{booking.dispute_reason || 'No details provided'}"
                                    </p>
                                    <span className="text-[10px] text-slate-500 block">Status: <span className="uppercase font-bold text-rose-600">{booking.dispute_status || 'open'}</span></span>
                                  </div>
                                </div>
                                {booking.dispute_status === 'open' && (
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => handleResolveDispute(booking.id, 'refunded')}
                                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                                    >
                                      Approve Refund
                                    </button>
                                    <button
                                      onClick={() => handleResolveDispute(booking.id, 'rejected')}
                                      className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      Reject Dispute
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {booking.status === AppointmentStatus.PENDING_PAYMENT && (
                              <button 
                                onClick={() => handleUpdateAptStatus(booking.id, AppointmentStatus.CONFIRMED, PaymentStatus.ADVANCE_PAID)}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow"
                              >
                                Approve Advance Payment (25%)
                              </button>
                            )}
                            {booking.status === AppointmentStatus.CONFIRMED && (
                              <button 
                                onClick={() => handleUpdateAptStatus(booking.id, AppointmentStatus.COMPLETED, PaymentStatus.PAID_IN_FULL)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow"
                              >
                                Complete Checkout (75%)
                              </button>
                            )}
                            {(booking.status !== AppointmentStatus.COMPLETED && booking.status !== AppointmentStatus.CANCELLED) && (
                              <button 
                                onClick={() => handleUpdateAptStatus(booking.id, AppointmentStatus.CANCELLED, PaymentStatus.REFUNDED)}
                                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs cursor-pointer"
                              >
                                Cancel Appointment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-sans">Appointments Ledger</h1>
                  <p className="text-xs text-slate-500">View real-time customer slot bookings, status, and ledger transaction credit splits.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
                        <tr>
                          <th className="p-4 font-bold">Booking Details</th>
                          <th className="p-4 font-bold">Service Treatment</th>
                          <th className="p-4 font-bold">Payout Split</th>
                          <th className="p-4 font-bold">Booking Status</th>
                          <th className="p-4 font-bold">Payment</th>
                          <th className="p-4 font-bold text-right">Ledger Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400">No appointments scheduled for this salon yet.</td>
                          </tr>
                        ) : (
                          bookings.map((booking) => {
                            const sDetails = services.find(s => s.id === booking.service_id);
                            return (
                              <tr key={booking.id} className="hover:bg-slate-50/50 group">
                                <td className="p-4 cursor-pointer" onClick={() => onNavigate(`/dashboard/bookings/${booking.id}`)}>
                                  <div className="font-bold text-slate-950 group-hover:text-indigo-600 transition-colors">{booking.customer_name}</div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{booking.customer_phone}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{booking.appointment_date} @ {booking.appointment_time}</div>
                                </td>
                                <td className="p-4">
                                  <span className="font-bold text-slate-800">{sDetails?.name || 'Treatment'}</span>
                                  <span className="block text-[10px] text-slate-400 mt-0.5">Duration: {sDetails?.duration_minutes} mins</span>
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-slate-900">Total: Rs. {booking.total_amount}</div>
                                  <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">25% Adv: Rs. {booking.advance_amount}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">75% Rem: Rs. {booking.remaining_amount}</div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block capitalize ${
                                    booking.status === AppointmentStatus.CONFIRMED ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                    booking.status === AppointmentStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    booking.status === AppointmentStatus.CANCELLED ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block capitalize ${
                                    booking.payment_status === PaymentStatus.PAID_IN_FULL ? 'bg-emerald-50 text-emerald-700' :
                                    booking.payment_status === PaymentStatus.ADVANCE_PAID ? 'bg-blue-50 text-blue-700' :
                                    'bg-amber-50 text-amber-700'
                                  }`}>
                                    {booking.payment_status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button 
                                      onClick={() => onNavigate(`/dashboard/bookings/${booking.id}`)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg cursor-pointer"
                                    >
                                      Details
                                    </button>
                                    {booking.status === AppointmentStatus.PENDING_PAYMENT && (
                                      <button 
                                        onClick={() => handleUpdateAptStatus(booking.id, AppointmentStatus.CONFIRMED, PaymentStatus.ADVANCE_PAID)}
                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[9px] cursor-pointer shadow"
                                      >
                                        Approve Adv
                                      </button>
                                    )}
                                    {booking.status === AppointmentStatus.CONFIRMED && (
                                      <button 
                                        onClick={() => handleUpdateAptStatus(booking.id, AppointmentStatus.COMPLETED, PaymentStatus.PAID_IN_FULL)}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[9px] cursor-pointer shadow"
                                      >
                                        Checkout
                                      </button>
                                    )}
                                    {(booking.status !== AppointmentStatus.COMPLETED && booking.status !== AppointmentStatus.CANCELLED) && (
                                      <button 
                                        onClick={() => handleUpdateAptStatus(booking.id, AppointmentStatus.CANCELLED, PaymentStatus.REFUNDED)}
                                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[9px] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: Services Menu manager */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Create Service View */}
            {currentPath === '/dashboard/services/new' && (
              <div className="space-y-6 max-w-xl bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onNavigate('/dashboard/services')}
                    className="p-2 border rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Add New Treatment</h3>
                    <p className="text-xs text-slate-500">Configure catalog treatment pricing and durations.</p>
                  </div>
                </div>

                <form onSubmit={handleAddService} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Service Name *</label>
                    <input 
                      type="text" 
                      required
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="e.g. Balayage Hair Highlights"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Treatment Description</label>
                    <textarea 
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      placeholder="e.g. Customized premium global shades..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none h-20 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Price (Rs.) *</label>
                      <input 
                        type="number" 
                        required
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Duration (Mins) *</label>
                      <input 
                        type="number" 
                        required
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Category *</label>
                    <select 
                      value={newServiceCat}
                      onChange={(e) => setNewServiceCat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none cursor-pointer"
                    >
                      <option value="Grooming">Grooming</option>
                      <option value="Hair Care">Hair Care</option>
                      <option value="Facial">Facial</option>
                      <option value="Massage">Massage</option>
                      <option value="Nail Art">Nail Art</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow mt-2"
                  >
                    Add Service to Menu
                  </button>
                </form>
              </div>
            )}

            {/* Edit Service View */}
            {editingServiceId && (
              <div className="space-y-6 max-w-xl bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onNavigate('/dashboard/services')}
                    className="p-2 border rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Edit Treatment Menu</h3>
                    <p className="text-xs text-slate-500">Modify active pricing, duration, or categories.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateService} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Service Name *</label>
                    <input 
                      type="text" 
                      required
                      value={editServiceName}
                      onChange={(e) => setEditServiceName(e.target.value)}
                      placeholder="e.g. Balayage Hair Highlights"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Treatment Description</label>
                    <textarea 
                      value={editServiceDesc}
                      onChange={(e) => setEditServiceDesc(e.target.value)}
                      placeholder="e.g. Customized premium global shades..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none h-20 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Price (Rs.) *</label>
                      <input 
                        type="number" 
                        required
                        value={editServicePrice}
                        onChange={(e) => setEditServicePrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Duration (Mins) *</label>
                      <input 
                        type="number" 
                        required
                        value={editServiceDuration}
                        onChange={(e) => setEditServiceDuration(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Category *</label>
                    <select 
                      value={editServiceCat}
                      onChange={(e) => setEditServiceCat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none cursor-pointer"
                    >
                      <option value="Grooming">Grooming</option>
                      <option value="Hair Care">Hair Care</option>
                      <option value="Facial">Facial</option>
                      <option value="Massage">Massage</option>
                      <option value="Nail Art">Nail Art</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow mt-2"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Standard Service List View */}
            {!editingServiceId && currentPath === '/dashboard/services' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-sans">Service Catalog</h1>
                    <p className="text-xs text-slate-500">Configure catalog treatments, pricing structures, and active details.</p>
                  </div>
                  <button 
                    onClick={() => onNavigate('/dashboard/services/new')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Onboard New Treatment</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Menu Treatments</span>
                  {services.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-sm">
                      No services have been configured yet. Let's add your first salon treatment to begin.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.map((s) => (
                        <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4 text-left relative group">
                          <div className="space-y-1.5">
                            <span className="text-[8px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono uppercase font-bold">{s.category_name}</span>
                            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{s.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{s.description || 'Custom professional treatment configured on Nexora OS.'}</p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-950">Rs. {s.price}</span>
                              <span className="text-slate-300">|</span>
                              <span className="text-slate-500 font-semibold">{s.duration_minutes} Mins</span>
                            </div>
                            <button 
                              onClick={() => onNavigate(`/dashboard/services/${s.id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-800 text-[10px] font-sans font-extrabold cursor-pointer"
                            >
                              Edit Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: Stylist roster */}
        {activeTab === 'staff' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-sans">Stylist Roster</h1>
              <p className="text-xs text-slate-500">Manage stylists, ratings, specialties, and schedule assignment.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form column */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 h-max space-y-4">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Onboard Stylist / Therapist</h3>
                <form onSubmit={handleAddStaff} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Designation Role</label>
                    <input 
                      type="text" 
                      required
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                      placeholder="e.g. Master Aesthetician"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Specialties (comma separated)</label>
                    <input 
                      type="text" 
                      value={newStaffSpecialty}
                      onChange={(e) => setNewStaffSpecialty(e.target.value)}
                      placeholder="e.g. Bridal makeup, Keratin treatment"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow mt-2"
                  >
                    Save Stylist Profile
                  </button>
                </form>
              </div>

              {/* List column */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map((st) => (
                  <div key={st.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 items-center text-left">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-700 text-sm shadow-inner overflow-hidden shrink-0">
                      {st.photo_url ? (
                        <img src={st.photo_url} alt={st.name} className="w-full h-full object-cover" />
                      ) : (
                        st.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                      <span className="text-[10px] text-indigo-600 font-semibold block">{st.role}</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {st.specialty.map((s, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-500 border border-slate-200 text-[8px] px-1.5 py-0.5 rounded-full font-mono">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: Client CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-sans">AI CRM & Retention</h1>
                <p className="text-xs text-slate-500">Analyze customer interaction history and generate personalized retention campaigns.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                Register New Customer
              </h3>
              <form onSubmit={handleAddCustomer} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input type="text" placeholder="Full Name" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} required className="w-full text-sm px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="flex-1">
                  <input type="tel" placeholder="Phone Number" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} required className="w-full text-sm px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap">
                  Add Customer
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  All Customers Directory
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold">Client Name</th>
                      <th className="p-4 font-bold">Mobile</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">No customers registered for this salon yet.</td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-950">{c.full_name}</td>
                          <td className="p-4 font-mono text-slate-500">{c.phone}</td>
                          <td className="p-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5"></span>
                            <span className="capitalize text-slate-600 font-semibold">{c.status}</span>
                          </td>
                          <td className="p-4 text-slate-400 font-mono text-[10px]">{c.created_at.split('T')[0]}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Cards */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider mb-1">Customers Analyzed</p>
                <p className="text-3xl font-bold text-slate-900">{crmAnalysis.total_customers_analyzed}</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-rose-500 font-mono font-bold uppercase tracking-wider mb-1">At-Risk Customers</p>
                <p className="text-3xl font-bold text-rose-600">{crmAnalysis.at_risk_count}</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-indigo-500 font-mono font-bold uppercase tracking-wider mb-1">Generated Drafts</p>
                <p className="text-3xl font-bold text-indigo-600">{crmAnalysis.generated_campaigns.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  At-Risk Customers
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold">Client Name</th>
                      <th className="p-4 font-bold">Mobile</th>
                      <th className="p-4 font-bold">Last Visit</th>
                      <th className="p-4 font-bold">Risk Level</th>
                      <th className="p-4 font-bold">Action Suggested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {crmAnalysis.at_risk_customers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">No at-risk customers found. Great job!</td>
                      </tr>
                    ) : (
                      crmAnalysis.at_risk_customers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-950">{c.customer_name}</td>
                          <td className="p-4 font-mono text-slate-500">{c.customer_phone}</td>
                          <td className="p-4 font-mono text-slate-500">
                            {c.days_since_last_visit} days ago<br/>
                            <span className="text-[10px] text-slate-400">({new Date(c.last_visit_date).toLocaleDateString()})</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              c.risk_level === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              c.risk_level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              {c.risk_level} Risk
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-slate-600 font-medium">{c.suggested_action}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Campaign Drafts */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-slate-900">AI Generated Campaign Drafts</h3>
              </div>
              <div className="p-5">
                {crmAnalysis.generated_campaigns.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No active campaign drafts.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {crmAnalysis.generated_campaigns.map((draft, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-sm text-slate-900">{draft.campaign_title}</h4>
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                            {draft.discount_percentage}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm italic">
                          "{draft.message_body}"
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                          <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center text-xs font-mono font-bold text-slate-500">
                            CODE: <span className="text-slate-800">{draft.offer_code}</span>
                          </div>
                          <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Run
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: Earnings Wallet Ledger */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">Earnings Wallet & Settlements</h1>
                <p className="text-xs text-slate-500">Track online advance collections, platform deductions, and automatic bank sweeps.</p>
              </div>
              <button 
                onClick={handleTriggerPayout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-600/10 flex items-center gap-1.5 self-start"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Simulate Daily Payout Sweep</span>
              </button>
            </div>

            {/* Balances board */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm relative overflow-hidden">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Available to Sweep</span>
                <span className="text-3xl font-black text-slate-950 block">Rs. {wallet?.available_balance || 0}</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 inline-block">Daily payout at 10:00 PM</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm relative overflow-hidden">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Pending Escrow</span>
                <span className="text-3xl font-black text-slate-400 block">Rs. {wallet?.pending_balance || 0}</span>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 inline-block">Locks until checkout complete</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm relative overflow-hidden">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Lifetime Earned</span>
                <span className="text-3xl font-black text-slate-950 block">Rs. {wallet?.lifetime_earned || 0}</span>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 inline-block">Platform Total Volume</span>
              </div>
            </div>

            {/* Wallet core rule highlights */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-xs text-indigo-800">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block uppercase tracking-wider text-[10px]">Operational Commission Rules</span>
                <p className="leading-relaxed">
                  Every online seat booked incurs an advance 25% payment into Nexora Escrow. Nexora takes an absolute 10% platform success transaction commission fee on appointment completion. Direct bank sweeping occurs daily at 10:00 PM after strict ledger check audit.
                </p>
              </div>
            </div>

            {/* Transactions Ledger log */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Chronological Audit Ledger</span>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
                      <tr>
                        <th className="p-4 font-bold">Transaction ID</th>
                        <th className="p-4 font-bold">Ledger Date</th>
                        <th className="p-4 font-bold">Purpose / Details</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Amount (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {transactions.length === 0 ? (
                        <tr className="font-sans">
                          <td colSpan={5} className="p-8 text-center text-slate-400">No ledger transactions registered yet.</td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="p-4 text-slate-500">{tx.id}</td>
                            <td className="p-4 text-slate-400 text-[10px]">{tx.created_at.replace('T', ' ').substring(0, 19)}</td>
                            <td className="p-4 font-sans text-slate-800">
                              <div className="font-bold">{tx.description}</div>
                              <span className="text-[10px] text-slate-400 capitalize bg-slate-50 px-1.5 py-0.5 rounded border mt-1 inline-block">{tx.purpose}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-100 capitalize">{tx.status}</span>
                            </td>
                            <td className={`p-4 text-right font-extrabold text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tx.type === 'credit' ? '+' : '-'}Rs. {tx.amount}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 8: Business Profile Form */}
        {activeTab === 'business-profile' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Business Profile</h1>
                  <p className="text-xs text-slate-500">Configure your brand details, regional discovery, and physical addresses.</p>
                </div>
              </div>

              {profileSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Salon business profile details updated successfully! Your white-label website has been updated in real-time.</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Business Name *</label>
                    <input 
                      type="text" 
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Business Type *</label>
                    <select 
                      value={profileType}
                      onChange={(e) => setProfileType(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="salon">Salon & Styling Studio</option>
                      <option value="spa">Luxury Spa & Wellness</option>
                      <option value="clinical">Clinical Skin Care</option>
                      <option value="barber">Barbershop</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Owner Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={profileOwnerName}
                      onChange={(e) => setProfileOwnerName(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Operational Phone *</label>
                    <input 
                      type="text" 
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">WhatsApp Booking Number *</label>
                    <input 
                      type="text" 
                      required
                      value={profileWhatsapp}
                      onChange={(e) => setProfileWhatsapp(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase tracking-wider text-[10px] flex items-center justify-between">
                      <span>Operational City (Region)</span>
                      <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded font-mono font-bold lowercase">Jaipur Zone Only</span>
                    </label>
                    <input 
                      type="text" 
                      disabled
                      value={profileCity}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Area Location (Jaipur Neighborhood) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Malviya Nagar, C-Scheme, Vaishali Nagar"
                      value={profileArea}
                      onChange={(e) => setProfileArea(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Full Operational Address *</label>
                    <textarea 
                      required
                      rows={3}
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-sans"
                      placeholder="Enter specific suite, street details or landmark markers..."
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={savingProfile}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? "Saving Profile..." : "Update Business Profile details"}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 9: Media Portfolio */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Media Portfolio Gallery</h1>
                  <p className="text-xs text-slate-500">Manage gorgeous images that showcase treatments and salon aesthetics on your public website.</p>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setDraggingMedia(true); }}
                onDragLeave={() => setDraggingMedia(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggingMedia(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    const url = URL.createObjectURL(file);
                    setGalleryImages(prev => [...prev, url]);
                  }
                }}
                className={`p-8 border-2 border-dashed rounded-2xl text-center transition-all ${
                  draggingMedia 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <div className="max-w-xs mx-auto flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Drag and drop salon portfolio photos here</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, JPEG up to 5MB. Real-time client rendering.</p>
                  
                  <label className="mt-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[10px] font-bold px-4 py-2 rounded-lg cursor-pointer shadow-sm transition-all block">
                    <span>Browse Local Files</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const url = URL.createObjectURL(file);
                          setGalleryImages(prev => [...prev, url]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Gallery List Grid */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Salon Gallery ({galleryImages.length} Photos)</h3>
                  <p className="text-[10px] text-slate-500">Live preview on public /site/[slug]</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 shadow-sm">
                      <img 
                        src={img} 
                        alt="Salon Portfolio" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setGalleryImages(galleryImages.filter((_, i) => i !== idx));
                          }}
                          className="p-2 bg-white/90 hover:bg-white text-rose-600 rounded-xl shadow-sm hover:scale-105 transition-all cursor-pointer"
                          title="Remove from website gallery"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 bg-slate-950/65 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur">
                        Img #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 10: SaaS Booking & Operational Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">SaaS Operational Configurations</h1>
                  <p className="text-xs text-slate-500">Fine-tune dynamic time slot intervals, deposit advance ratios, and system alerts.</p>
                </div>
              </div>

              {settingsSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>SaaS System configurations deployed successfully in Jaipur Cloud Region!</span>
                </div>
              )}

              <div className="space-y-6 text-xs font-semibold">
                
                {/* Spacing Interval config */}
                <div className="space-y-2 pb-5 border-b border-slate-100">
                  <label className="block text-slate-700 uppercase tracking-wider text-[10px]">Dynamic Booking Time Spacing</label>
                  <p className="text-[10px] text-slate-400 font-normal leading-normal mb-3">
                    Configure the standard buffer separation between slot listings during custom online checkouts.
                  </p>
                  <div className="flex gap-2">
                    {[30, 45, 60].map((mins) => (
                      <button 
                        key={mins}
                        onClick={() => setSlotInterval(mins)}
                        className={`flex-1 p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                          slotInterval === mins 
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-black ring-1 ring-indigo-600' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {mins} Minutes Interval
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advance Escrow Deposit Rate config */}
                <div className="space-y-2 pb-5 border-b border-slate-100">
                  <label className="block text-slate-700 uppercase tracking-wider text-[10px]">Client Advance Booking Deposit Rate</label>
                  <p className="text-[10px] text-slate-400 font-normal leading-normal mb-3">
                    Set what percentage of service catalog price must be paid as a non-refundable upfront deposit.
                  </p>
                  <div className="flex gap-2">
                    {[10, 25, 50].map((percent) => (
                      <button 
                        key={percent}
                        onClick={() => setAdvancePercent(percent)}
                        className={`flex-1 p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                          advancePercent === percent 
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-black ring-1 ring-indigo-600' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {percent}% Deposit Advance
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opening and Closing Hours */}
                <div className="space-y-2 pb-5 border-b border-slate-100">
                  <label className="block text-slate-700 uppercase tracking-wider text-[10px]">Daily Studio Opening Hours</label>
                  <p className="text-[10px] text-slate-400 font-normal leading-normal mb-3">
                    Restrict bookable time slots on the public website within specified working windows.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-slate-500 mb-1">Opens Doors At:</span>
                      <select 
                        value={shopOpenTime}
                        onChange={(e) => setShopOpenTime(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-xl outline-none"
                      >
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-500 mb-1">Closes Doors At:</span>
                      <select 
                        value={shopCloseTime}
                        onChange={(e) => setShopCloseTime(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-xl outline-none"
                      >
                        <option value="06:00 PM">06:00 PM</option>
                        <option value="07:00 PM">07:00 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                        <option value="09:00 PM">09:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Auto Reminder switch */}
                <div className="pb-5 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <label className="block text-slate-700 uppercase tracking-wider text-[10px]">Automate Client WhatsApp Reminders</label>
                    <p className="text-[10px] text-slate-400 font-normal leading-normal max-w-sm">
                      Send automated confirmation receipts and day-before reminder texts using our high-fidelity Jaipur SMS API.
                    </p>
                  </div>
                  <button 
                    onClick={() => setEnableWhatsappReminders(!enableWhatsappReminders)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer ${
                      enableWhatsappReminders ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform absolute top-1 ${
                      enableWhatsappReminders ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setSettingsSuccess(true);
                    setTimeout(() => setSettingsSuccess(false), 3000);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save configurations</span>
                </button>

              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
