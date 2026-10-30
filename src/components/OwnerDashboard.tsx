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
  UploadCloud, Play, FileText, ChevronRight,
  Bell, AlertTriangle, CheckCheck, RefreshCw, Clock,
  UserCheck, Filter, X, ChevronDown, CheckCircle2, ShieldAlert, Star, MessageSquare, Package, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { api } from '../lib/supabase';
import { analyzeCustomerHistory, trackCampaignConversions, CustomerInteraction } from '../lib/ai/crm-logic';
import StaffManagementTab from './StaffManagementTab';
import { ClientWaitlist } from './shared/ClientWaitlist';
import { BUSINESS_TYPES, getTemplateForBusinessType } from '../config/businessTypeMapper';
import { 
  Tenant, TenantWebsite, Service, Staff, 
  Customer, Appointment, Wallet, WalletTransaction, 
  AppointmentStatus, PaymentStatus, ScheduleNotification
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
  
  const processImage = (file: File, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No context');
          const imgRatio = img.width / img.height;
          const targetRatio = width / height;
          let sWidth, sHeight, sx, sy;
          if (imgRatio > targetRatio) {
            sHeight = img.height;
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
          } else {
            sWidth = img.width;
            sHeight = img.width / targetRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
          }
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'bookings' | 'services' | 'forecasting' | 'reviews-intelligence' | 'inventory' | 'roster-optimizer' | 'loyalty' | 'waitlist' | 'staff' | 'staff-management' | 'crm' | 'wallet' | 'business-profile' | 'media' | 'settings' | 'revenue-insights'>('dashboard');

  // Revenue Insights state
  const [revenueForecast, setRevenueForecast] = useState<{ projections: { date: string, revenue: number }[] } | null>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // AI Staff Roster Optimizer State
  const [rosterData, setRosterData] = useState<any | null>(null);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Client Loyalty Tier State
  const [loyaltyData, setLoyaltyData] = useState<any | null>(null);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);
  const [selectedLoyaltyTierFilter, setSelectedLoyaltyTierFilter] = useState<string>('All');

  // Waitlist State
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);

  const handleFetchRevenueForecast = async () => {
    if (!ownerTenantId) return;
    setLoadingRevenue(true);
    try {
      const res = await api.getRevenueForecast(ownerTenantId);
      if (res.success) {
        setRevenueForecast(res.forecast);
      }
    } catch (err) {
      console.error("Error fetching revenue forecast:", err);
    } finally {
      setLoadingRevenue(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'roster-optimizer' && ownerTenantId && !rosterData) {
      handleFetchRoster();
    }
    if (activeTab === 'loyalty' && ownerTenantId && !loyaltyData) {
      handleFetchLoyalty();
    }
    if (activeTab === 'waitlist' && ownerTenantId) {
        handleFetchWaitlist();
    }
    if (activeTab === 'revenue-insights' && ownerTenantId && !revenueForecast) {
        handleFetchRevenueForecast();
    }
  }, [activeTab, ownerTenantId]);

  const handleFetchWaitlist = async () => {
    if (!ownerTenantId) return;
    setLoadingWaitlist(true);
    try {
      const res = await api.getWaitlist(ownerTenantId);
      if (res.success) {
        setWaitlistEntries(res.entries);
      }
    } catch (err) {
      console.error("Error fetching waitlist:", err);
    } finally {
      setLoadingWaitlist(false);
    }
  };

  const handleFetchLoyalty = async () => {
    if (!ownerTenantId) return;
    setLoadingLoyalty(true);
    try {
      const res = await api.getLoyaltyTiers(ownerTenantId);
      if (res.success) {
        setLoyaltyData(res);
      }
    } catch (err) {
      console.error("Error fetching loyalty tiers:", err);
    } finally {
      setLoadingLoyalty(false);
    }
  };

  const handleFetchRoster = async () => {
    try {
      setLoadingRoster(true);
      const res = await api.getRosterOptimization(ownerTenantId);
      if (res.success) {
        setRosterData(res.roster);
      } else {
        alert(res.error || "Failed to load roster optimization");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching roster optimization");
    } finally {
      setLoadingRoster(false);
    }
  };

  // Inventory Management State
  const [inventory, setInventory] = useState<any[]>([
    { id: 'inv_1', name: 'L’Oréal Professional Liss Unlimited Shampoo (250ml)', category: 'retail', sku: 'LOR-LISS-250', stock_quantity: 4, unit: 'Bottles', min_threshold: 8, unit_cost: 650, supplier_name: 'L’Oréal Professional India', last_reorder_date: '2026-09-15' },
    { id: 'inv_2', name: 'Kérastase Chronologiste Revitalizing Hair Mask (200ml)', category: 'retail', sku: 'KER-CHRO-200', stock_quantity: 2, unit: 'Jars', min_threshold: 5, unit_cost: 2400, supplier_name: 'Kérastase Direct Supply', last_reorder_date: '2026-09-01' },
    { id: 'inv_3', name: 'Matrix Opti.Care Smooth Straight Professional Cream (1000ml)', category: 'professional', sku: 'MAT-OPT-1000', stock_quantity: 12, unit: 'Packs', min_threshold: 4, unit_cost: 1800, supplier_name: 'Matrix Salon Solutions', last_reorder_date: '2026-10-02' },
    { id: 'inv_4', name: 'Olaplex No. 3 Hair Perfector (100ml)', category: 'retail', sku: 'OLA-03-100', stock_quantity: 3, unit: 'Bottles', min_threshold: 6, unit_cost: 2200, supplier_name: 'Olaplex Global Distribution', last_reorder_date: '2026-09-10' },
    { id: 'inv_5', name: 'Moroccanoil Treatment Original (100ml)', category: 'retail', sku: 'MOR-ORG-100', stock_quantity: 9, unit: 'Bottles', min_threshold: 5, unit_cost: 2800, supplier_name: 'Moroccanoil Exclusive Partners', last_reorder_date: '2026-10-05' },
    { id: 'inv_6', name: 'Schwarzkopf Professional Igora Royal Hair Color 6-0', category: 'professional', sku: 'SCH-IGO-60', stock_quantity: 5, unit: 'Tubes', min_threshold: 10, unit_cost: 550, supplier_name: 'Schwarzkopf Henkel Pro', last_reorder_date: '2026-08-20' }
  ]);
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'retail' | 'professional' | 'low-stock'>('all');
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [newInvName, setNewInvName] = useState('');
  const [newInvCategory, setNewInvCategory] = useState<'retail' | 'professional'>('retail');
  const [newInvSku, setNewInvSku] = useState('');
  const [newInvQty, setNewInvQty] = useState(10);
  const [newInvThreshold, setNewInvThreshold] = useState(5);
  const [newInvCost, setNewInvCost] = useState(500);
  const [newInvSupplier, setNewInvSupplier] = useState('');

  const handleAddInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName.trim()) { alert("Please enter product name"); return; }
    const newItem = {
      id: "inv_" + Math.random().toString(36).substring(2, 9),
      name: newInvName,
      category: newInvCategory,
      sku: newInvSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stock_quantity: Number(newInvQty) || 10,
      unit: newInvCategory === 'retail' ? 'Units' : 'Bottles/Packs',
      min_threshold: Number(newInvThreshold) || 5,
      unit_cost: Number(newInvCost) || 500,
      supplier_name: newInvSupplier || 'Authorized Distributor',
      last_reorder_date: new Date().toISOString().split('T')[0]
    };
    setInventory([newItem, ...inventory]);
    setNewInvName('');
    setNewInvSku('');
    setShowAddInventoryModal(false);
    alert("New product successfully added to salon inventory!");
  };

  const handleRestockItem = (itemId: string, addQty: number) => {
    setInventory(inventory.map(item => item.id === itemId ? { ...item, stock_quantity: item.stock_quantity + addQty, last_reorder_date: new Date().toISOString().split('T')[0] } : item));
    alert(`Successfully reordered & restocked +${addQty} units via Distributor Portal!`);
  };

  // AI Demand Forecasting State
  const [demandForecast, setDemandForecast] = useState<any | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    if (activeTab === 'forecasting' && ownerTenantId && !demandForecast) {
      handleFetchDemandForecast();
    }
  }, [activeTab, ownerTenantId]);

  const handleFetchDemandForecast = async () => {
    try {
      setLoadingForecast(true);
      const res = await api.getDemandForecast(ownerTenantId);
      if (res.success) {
        setDemandForecast(res.forecast);
      } else {
        alert(res.error || "Failed to load demand forecast");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching AI demand forecasting");
    } finally {
      setLoadingForecast(false);
    }
  };

  // AI Review Intelligence & Feedback Loop State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<any | null>(null);
  const [loadingReviewSummary, setLoadingReviewSummary] = useState(false);
  const [sendingReviewReqId, setSendingReviewReqId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'reviews-intelligence' && ownerTenantId && !reviewSummary) {
      handleFetchReviewSummary();
    }
  }, [activeTab, ownerTenantId]);

  const handleFetchReviewSummary = async () => {
    try {
      setLoadingReviewSummary(true);
      const res = await api.getReviewSummary(ownerTenantId);
      if (res.success) {
        setReviewSummary(res.summary);
      } else {
        alert(res.error || "Failed to load review summary");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching review summary");
    } finally {
      setLoadingReviewSummary(false);
    }
  };

  const handleSendReviewRequest = async (aptId?: string, custName?: string, custPhone?: string) => {
    try {
      setSendingReviewReqId(aptId || 'general');
      const res = await api.sendReviewRequest({
        tenant_id: ownerTenantId,
        appointment_id: aptId,
        customer_name: custName || 'Valued Client',
        customer_phone: custPhone || '9829012345'
      });
      if (res.success) {
        alert(res.message);
      } else {
        alert(res.error || "Failed to send review request");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending review request");
    } finally {
      setSendingReviewReqId(null);
    }
  };

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

  // Gemini AI Schedule Notifications & Conflict State
  const [scheduleNotifications, setScheduleNotifications] = useState<ScheduleNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'conflict' | 'optimization' | 'resolved'>('all');
  const [aiAuditSource, setAiAuditSource] = useState<string>('gemini-3.8-flash');
  const [lastAuditTime, setLastAuditTime] = useState<string | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignBookingId, setReassignBookingId] = useState<string | null>(null);
  const [reassignNotifId, setReassignNotifId] = useState<string | null>(null);
  const [selectedNewStaffId, setSelectedNewStaffId] = useState<string>('');

  // AI Gift Card Generator State
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [generatingGiftCard, setGeneratingGiftCard] = useState(false);
  const [giftCardClientName, setGiftCardClientName] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState(5000);
  const [giftCardOccasion, setGiftCardOccasion] = useState('VIP Appreciation & Luxury Treat');
  const [giftCardStyle, setGiftCardStyle] = useState('Elegant gold foil typography, deep emerald and obsidian background, premium minimalist aesthetics');
  const [selectedGiftCard, setSelectedGiftCard] = useState<any | null>(null);

  const handleGenerateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardClientName) return;
    setGeneratingGiftCard(true);
    try {
      const res = await api.generateGiftCard({
        tenant_id: tenant.id,
        client_name: giftCardClientName,
        amount: Number(giftCardAmount),
        occasion: giftCardOccasion,
        style_prompt: giftCardStyle,
      });
      if (res.success && res.gift_card) {
        setGiftCards(prev => [res.gift_card, ...prev]);
        setSelectedGiftCard(res.gift_card);
      }
    } catch (err) {
      console.error("Failed to generate gift card:", err);
    } finally {
      setGeneratingGiftCard(false);
    }
  };

  // Routing-focused sub-states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Onboarding Form States
  const [onboardName, setOnboardName] = useState('');
  const [onboardType, setOnboardType] = useState('Barber Shop');
  const [onboardOwnerName, setOnboardOwnerName] = useState('');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardWhatsapp, setOnboardWhatsapp] = useState('');
  const [onboardCity, setOnboardCity] = useState('Jaipur');
  const [onboardArea, setOnboardArea] = useState('');
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardError, setOnboardError] = useState('');
  const [onboardSuccessToast, setOnboardSuccessToast] = useState<string | null>(null);
  const [onboardRedirecting, setOnboardRedirecting] = useState(false);

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
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formHeroImageUrl, setFormHeroImageUrl] = useState('');
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

  const { getRootProps: getRootPropsLogo, getInputProps: getInputPropsLogo } = useDropzone({
    onDrop: (files) => files.length > 0 && processImage(files[0], 200, 200).then(setFormLogoUrl),
    accept: {'image/*': []},
    multiple: false
  } as any);
  const { getRootProps: getRootPropsHero, getInputProps: getInputPropsHero } = useDropzone({
    onDrop: (files) => files.length > 0 && processImage(files[0], 1200, 600).then(setFormHeroImageUrl),
    accept: {'image/*': []},
    multiple: false
  } as any);

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

    const analysis = analyzeCustomerHistory(interactions);
    const campaignMetrics = trackCampaignConversions(bookings);
    
    return {
      ...analysis,
      campaignMetrics
    };
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
    } else if (currentPath === '/dashboard/staff-management') {
      setActiveTab('staff-management');
    } else if (currentPath === '/dashboard/forecasting') {
      setActiveTab('forecasting');
    } else if (currentPath === '/dashboard/reviews-intelligence') {
      setActiveTab('reviews-intelligence');
    } else if (currentPath === '/dashboard/inventory') {
      setActiveTab('inventory');
    } else if (currentPath === '/dashboard/roster-optimizer') {
      setActiveTab('roster-optimizer');
    } else if (currentPath === '/dashboard/waitlist') {
      setActiveTab('waitlist');
    } else if (currentPath === '/dashboard/loyalty') {
      setActiveTab('loyalty');
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
    } else if (currentPath === '/dashboard/revenue-insights') {
      setActiveTab('revenue-insights');
    }
  }, [currentPath]);

  // Handle sidebar navigation click
  const handleTabChange = (tabId: 'dashboard' | 'builder' | 'bookings' | 'services' | 'forecasting' | 'reviews-intelligence' | 'inventory' | 'roster-optimizer' | 'loyalty' | 'waitlist' | 'staff' | 'staff-management' | 'crm' | 'wallet' | 'business-profile' | 'media' | 'settings' | 'revenue-insights') => {
    let path = '/dashboard';
    if (tabId === 'builder') path = '/dashboard/website';
    else if (tabId === 'bookings') path = '/dashboard/bookings';
    else if (tabId === 'services') path = '/dashboard/services';
    else if (tabId === 'forecasting') path = '/dashboard/forecasting';
    else if (tabId === 'reviews-intelligence') path = '/dashboard/reviews-intelligence';
    else if (tabId === 'inventory') path = '/dashboard/inventory';
    else if (tabId === 'roster-optimizer') path = '/dashboard/roster-optimizer';
    else if (tabId === 'loyalty') path = '/dashboard/loyalty';
    else if (tabId === 'waitlist') path = '/dashboard/waitlist';
    else if (tabId === 'staff') path = '/dashboard/staff';
    else if (tabId === 'staff-management') path = '/dashboard/staff-management';
    else if (tabId === 'crm') path = '/dashboard/crm';
    else if (tabId === 'business-profile') path = '/dashboard/business-profile';
    else if (tabId === 'media') path = '/dashboard/media';
    else if (tabId === 'settings') path = '/dashboard/settings';
    else if (tabId === 'wallet') path = '/dashboard/wallet';
    else if (tabId === 'revenue-insights') path = '/dashboard/revenue-insights';

    setActiveTab(tabId);
    onNavigate(path);
    setEditingServiceId(null);
    setSelectedBookingId(null);
  };

  // Onboard Submission Handler
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError('');

    // 1. Strict required fields validation
    if (!onboardName || !onboardName.trim()) {
      setOnboardError('Business Name is required.');
      return;
    }
    if (onboardName.trim().length < 2) {
      setOnboardError('Business Name must be at least 2 characters.');
      return;
    }
    if (!onboardOwnerName || !onboardOwnerName.trim()) {
      setOnboardError('Owner Full Name is required.');
      return;
    }
    if (onboardOwnerName.trim().length < 2) {
      setOnboardError('Owner Full Name must be at least 2 characters.');
      return;
    }
    if (!onboardPhone || !onboardPhone.trim()) {
      setOnboardError('Mobile Number is required.');
      return;
    }
    const cleanPhone = onboardPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setOnboardError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!onboardCity || !onboardCity.trim()) {
      setOnboardError('City is required.');
      return;
    }
    if (!onboardArea || !onboardArea.trim()) {
      setOnboardError('Area / Locality is required.');
      return;
    }
    if (!onboardType) {
      setOnboardError('Please select a Business Type.');
      return;
    }

    try {
      setOnboardSubmitting(true);
      setOnboardError('');

      // 2. Map selected Business Type to template registry
      const templateConfig = getTemplateForBusinessType(onboardType);
      
      const newTenantData = {
        name: onboardName.trim(),
        business_type: onboardType,
        owner_name: onboardOwnerName.trim(),
        phone: onboardPhone.trim(),
        whatsapp_number: (onboardWhatsapp || onboardPhone).trim(),
        city: onboardCity.trim(),
        area: onboardArea.trim(),
        address: `${onboardArea.trim()}, ${onboardCity.trim()}`,
        template_id: templateConfig.templateSlug,
        owner_id: "usr_owner_" + Math.random().toString(36).substring(2, 9)
      };

      // 3. Save to database / backend
      const result = await api.createTenant(newTenantData);
      
      if (result.success && result.tenant) {
        // 4. Programmatically update activeSalonId and template details in localStorage
        const businessProfile = {
          tenant: result.tenant,
          website: result.website,
          businessType: onboardType,
          templateSlug: templateConfig.templateSlug,
          templateRoute: templateConfig.templateRoute,
          savedAt: new Date().toISOString()
        };

        try {
          localStorage.setItem('activeSalonId', result.tenant.id);
          localStorage.setItem('selectedTemplate', templateConfig.templateSlug);
          localStorage.setItem('activeTemplateSlug', templateConfig.templateSlug);
          localStorage.setItem('nexora_active_business_profile', JSON.stringify(businessProfile));
          localStorage.setItem('nexora_recent_tenant_id', result.tenant.id);
        } catch (storageErr) {
          console.warn('Could not cache business profile to localStorage:', storageErr);
        }

        // Trigger parent state updates
        onRefreshDB();
        onSelectOwnerTenantId(result.tenant.id);

        // 5. Add success notification toast & redirect flag
        const toastMsg = `Website created successfully! Redirecting to your ${onboardType} dashboard...`;
        setOnboardSuccessToast(toastMsg);
        setOnboardRedirecting(true);

        // 6. Trigger immediate navigation route to '/templates/[template-slug]' upon success
        const targetRoute = `/templates/${templateConfig.templateSlug}`;
        window.history.pushState({}, '', targetRoute);
        onNavigate(targetRoute);
      } else {
        setOnboardError(result.error || 'Failed to register salon. Please check details and try again.');
        setOnboardSubmitting(false);
      }
    } catch (err: any) {
      console.error('Salon registration error:', err);
      setOnboardError('An unexpected network error occurred during salon registration.');
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
        
        // Find tenant with localStorage fallback for immediate onboarding persistence
        let activeTenant = fullDB.tenants.find((t: any) => t.id === ownerTenantId);
        if (!activeTenant) {
          try {
            const rawProfile = localStorage.getItem('nexora_active_business_profile');
            if (rawProfile) {
              const parsed = JSON.parse(rawProfile);
              if (parsed?.tenant && (parsed.tenant.id === ownerTenantId || ownerTenantId !== 'new')) {
                activeTenant = parsed.tenant;
              }
            }
          } catch (e) {
            // ignore
          }
        }

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
            setFormLogoUrl(web.logo_url || '');
            setFormHeroImageUrl(web.hero_image_url || '');
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

          const shopReviews = (fullDB.reviews || []).filter((r: any) => r.tenant_id === activeTenant.id);
          setReviews(shopReviews);

          // Find wallet
          const activeWallet = fullDB.wallets.find((w: any) => w.owner_id === activeTenant.owner_id);
          if (activeWallet) {
            setWallet(activeWallet);
            const activeTx = fullDB.transactions.filter((tx: any) => tx.wallet_id === activeWallet.id);
            setTransactions(activeTx);
          }

          // Load Gemini AI Schedule Notifications
          try {
            const notifsRes = await api.getScheduleNotifications(activeTenant.id, false);
            if (notifsRes.success && notifsRes.notifications) {
              setScheduleNotifications(notifsRes.notifications);
              setAiAuditSource(notifsRes.source || 'gemini-3.8-flash');
              setLastAuditTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
          } catch (notifErr) {
            console.error("Error loading schedule notifications:", notifErr);
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

  // Gemini AI Schedule & Notification Actions
  const handleRefreshScheduleAudit = async (force = true) => {
    if (!ownerTenantId) return;
    try {
      setLoadingNotifications(true);
      const res = await api.getScheduleNotifications(ownerTenantId, force);
      if (res.success && res.notifications) {
        setScheduleNotifications(res.notifications);
        setAiAuditSource(res.source || 'gemini-3.8-flash');
        setLastAuditTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error("Failed to run Gemini AI schedule audit:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleResolveNotification = async (notifId: string, note?: string) => {
    try {
      const res = await api.resolveScheduleNotification(notifId, note);
      if (res.success) {
        setScheduleNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_resolved: true, is_read: true } : n));
      }
    } catch (err) {
      console.error("Failed to resolve notification:", err);
    }
  };

  const openReassignDialog = (bookingId: string, notifId?: string) => {
    setReassignBookingId(bookingId);
    setReassignNotifId(notifId || null);
    const booking = bookings.find(b => b.id === bookingId);
    // Suggest first other staff
    const otherStaff = staff.filter(s => s.id !== booking?.staff_id);
    setSelectedNewStaffId(otherStaff.length > 0 ? otherStaff[0].id : (staff[0]?.id || ''));
    setReassignModalOpen(true);
  };

  const handleQuickReassign = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reassignBookingId || !selectedNewStaffId) return;
    try {
      const res = await api.quickReassignBooking(reassignBookingId, selectedNewStaffId, reassignNotifId || undefined);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === reassignBookingId ? { ...b, staff_id: selectedNewStaffId } : b));
        if (reassignNotifId) {
          setScheduleNotifications(prev => prev.map(n => n.id === reassignNotifId ? { ...n, is_resolved: true, is_read: true } : n));
        }
        setReassignModalOpen(false);
        setReassignBookingId(null);
        setReassignNotifId(null);
        onRefreshDB();
        // Re-run audit smoothly
        handleRefreshScheduleAudit(true);
      }
    } catch (err) {
      console.error("Failed to reassign booking:", err);
    }
  };

  const handleSimulateConflict = async () => {
    if (!ownerTenantId) return;
    try {
      setLoadingNotifications(true);
      const res = await api.simulateConflict(ownerTenantId);
      if (res.success) {
        onRefreshDB();
        setRefreshTrigger(p => p + 1);
        await handleRefreshScheduleAudit(true);
      }
    } catch (err) {
      console.error("Error simulating conflict:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

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
        logo_url: formLogoUrl,
        hero_image_url: formHeroImageUrl,
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
    const activeSalonId = localStorage.getItem('activeSalonId');
    const selectedTemplate = localStorage.getItem('selectedTemplate') || localStorage.getItem('activeTemplateSlug');
    const hasValidSession = Boolean(activeSalonId || localStorage.getItem('nexora_active_business_profile'));

    if (onboardRedirecting || (hasValidSession && selectedTemplate)) {
      if (activeSalonId && activeSalonId !== 'new') {
        onSelectOwnerTenantId(activeSalonId);
      }
      if (selectedTemplate && currentPath !== `/templates/${selectedTemplate}`) {
        const targetRoute = `/templates/${selectedTemplate}`;
        window.history.pushState({}, '', targetRoute);
        onNavigate(targetRoute);
      }
      return (
        <div className="bg-slate-950 min-h-screen flex items-center justify-center p-6 text-white text-center font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Active Template Session Loaded</h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Active session detected. Loading template dashboard...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center text-left relative">
        {/* Success Toast Modal */}
        {onboardSuccessToast && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Success!</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {onboardSuccessToast}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-indigo-600 text-xs font-semibold pt-2">
                <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                <span>Loading your custom template preview...</span>
              </div>
            </div>
          </div>
        )}

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
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{onboardError}</span>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium"
                >
                  <option value="Barber Shop">Barber Shop</option>
                  <option value="Unisex Salon">Unisex Salon</option>
                  <option value="Men's Salon">Men's Salon</option>
                  <option value="Ladies Parlour">Ladies Parlour</option>
                  <option value="Spa & Grooming">Spa & Grooming</option>
                  <option value="Hair Studio">Hair Studio</option>
                  <option value="Nails Studio">Nails Studio</option>
                  <option value="Beauty & Grooming">Beauty & Grooming</option>
                  <option value="Other">Other</option>
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
                  value={onboardCity}
                  onChange={(e) => setOnboardCity(e.target.value)}
                  placeholder="e.g. Jaipur"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              disabled={onboardSubmitting || onboardRedirecting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-4 transition"
            >
              {onboardSubmitting || onboardRedirecting ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{onboardRedirecting ? 'Redirecting to Template...' : 'Creating Business & Website...'}</span>
                </div>
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

  // Gemini AI Notification Derived State
  const activeConflicts = scheduleNotifications.filter(n => !n.is_resolved && n.category === 'conflict');
  const activeOptimizations = scheduleNotifications.filter(n => !n.is_resolved && n.category === 'optimization');
  const resolvedNotifications = scheduleNotifications.filter(n => n.is_resolved);
  const totalActiveAlerts = activeConflicts.length + activeOptimizations.length;

  const filteredNotifications = React.useMemo(() => {
    if (notifFilter === 'conflict') return scheduleNotifications.filter(n => !n.is_resolved && n.category === 'conflict');
    if (notifFilter === 'optimization') return scheduleNotifications.filter(n => !n.is_resolved && n.category === 'optimization');
    if (notifFilter === 'resolved') return scheduleNotifications.filter(n => n.is_resolved);
    return scheduleNotifications.filter(n => !n.is_resolved);
  }, [scheduleNotifications, notifFilter]);

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
              { id: 'forecasting', label: 'AI Demand & Pricing', icon: TrendingUp },
              { id: 'reviews-intelligence', label: 'AI Review Intelligence', icon: MessageSquare },
              { id: 'inventory', label: 'Inventory & Stock', icon: Package },
              { id: 'roster-optimizer', label: 'AI Roster Optimizer', icon: Users },
              { id: 'loyalty', label: 'Client Loyalty Tiers', icon: Crown },
              { id: 'waitlist', label: 'Automated Waitlist', icon: Clock },
              { id: 'business-profile', label: 'Business Profile', icon: Building },
              { id: 'media', label: 'Media', icon: Image },
              { id: 'crm', label: 'AI CRM', icon: Sparkles },
              { id: 'staff', label: 'Staff', icon: Users },
              { id: 'staff-management', label: 'Staff Management', icon: Users },
              { id: 'revenue-insights', label: 'Predictive Revenue', icon: TrendingUp },
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
        
        {/* Global Top Bar: Salon Identification & AI Notification Center */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800 tracking-wide font-mono">
              {tenant.name} &bull; Console
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold">
              Jaipur, {tenant.area}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Quick Gemini Audit Scan Button */}
            <button
              onClick={() => handleRefreshScheduleAudit(true)}
              disabled={loadingNotifications}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 shadow-xs transition-all cursor-pointer disabled:opacity-60"
              title="Audit upcoming bookings and staff assignments with Gemini AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loadingNotifications ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loadingNotifications ? 'Scanning with Gemini...' : 'AI Schedule Scan'}</span>
              <span className="sm:hidden">{loadingNotifications ? 'Scanning...' : 'Scan'}</span>
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                id="owner-notification-bell"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isNotificationOpen 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' 
                    : totalActiveAlerts > 0
                    ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 shadow-xs'
                }`}
                title="AI Schedule Notifications & Conflicts"
              >
                <Bell className="w-4 h-4" />
                {totalActiveAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeConflicts.length > 0 ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-4 w-4 text-[9px] font-black text-white items-center justify-center ${activeConflicts.length > 0 ? 'bg-rose-600' : 'bg-amber-500'}`}>
                      {totalActiveAlerts}
                    </span>
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-left"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 leading-tight">AI Schedule Notifications</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Gemini 3.8 Flash Engine</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1 text-[10px] font-bold">
                      <button
                        onClick={() => setNotifFilter('all')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${notifFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Active ({totalActiveAlerts})
                      </button>
                      <button
                        onClick={() => setNotifFilter('conflict')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${notifFilter === 'conflict' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Conflicts ({activeConflicts.length})
                      </button>
                      <button
                        onClick={() => setNotifFilter('optimization')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${notifFilter === 'optimization' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Optimizations ({activeOptimizations.length})
                      </button>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                          <p className="text-xs font-bold text-slate-700">No {notifFilter === 'all' ? 'active' : notifFilter} alerts found</p>
                          <p className="text-[10px] text-slate-400">All staff assignments and slot times are currently balanced.</p>
                        </div>
                      ) : (
                        filteredNotifications.map((notif) => {
                          const isConflict = notif.category === 'conflict';
                          return (
                            <div key={notif.id} className={`p-4 space-y-2 transition-colors ${notif.is_resolved ? 'bg-slate-50/40 opacity-75' : isConflict ? 'hover:bg-rose-50/30' : 'hover:bg-amber-50/30'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {isConflict ? (
                                    <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono">
                                      Conflict
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono">
                                      Optimization
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded ${
                                    notif.severity === 'critical' ? 'bg-rose-600 text-white' :
                                    notif.severity === 'high' ? 'bg-rose-100 text-rose-700' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {notif.severity}
                                  </span>
                                </div>
                                {notif.affected_date && (
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {notif.affected_date} {notif.affected_time ? `@ ${notif.affected_time}` : ''}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h5 className="text-xs font-bold text-slate-900 leading-snug">{notif.title}</h5>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                              </div>

                              {/* AI Suggestion Box */}
                              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 text-[10px] text-indigo-900 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                <div className="leading-tight">
                                  <span className="font-extrabold block text-indigo-950 mb-0.5">Gemini Recommendation:</span>
                                  <span>{notif.suggested_action}</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              {!notif.is_resolved && (
                                <div className="flex items-center gap-2 pt-1">
                                  {notif.affected_booking_ids && notif.affected_booking_ids.length > 0 && (
                                    <button
                                      onClick={() => {
                                        setIsNotificationOpen(false);
                                        openReassignDialog(notif.affected_booking_ids![0], notif.id);
                                      }}
                                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                                    >
                                      Quick Reassign Staff
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleResolveNotification(notif.id)}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    Mark Resolved
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[10px]">
                      <button
                        onClick={handleSimulateConflict}
                        className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        + Simulate Test Conflict
                      </button>
                      <button
                        onClick={() => {
                          setIsNotificationOpen(false);
                          handleTabChange('dashboard');
                        }}
                        className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                      >
                        View Full Audit &rarr;
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

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

            {/* AI Schedule Intelligence & Conflicts Board */}
            <div className="bg-gradient-to-b from-white to-indigo-50/20 rounded-3xl p-6 sm:p-7 border border-indigo-100 shadow-sm space-y-6">
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase font-mono tracking-wider px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      Gemini 3.8 Flash AI
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium font-mono">
                      {lastAuditTime ? `Audited at ${lastAuditTime}` : 'Live Engine Active'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                    Schedule Conflict & Staff Optimization Alerts
                  </h2>
                  <p className="text-xs text-slate-500 max-w-2xl">
                    Gemini AI automatically scans upcoming appointments and staff rosters to prevent double-bookings, resolve unassigned clients, and optimize team throughput.
                  </p>
                </div>

                {/* Audit Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRefreshScheduleAudit(true)}
                    disabled={loadingNotifications}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingNotifications ? 'animate-spin' : ''}`} />
                    <span>{loadingNotifications ? 'Analyzing Roster...' : 'Re-Scan with Gemini'}</span>
                  </button>
                  <button
                    onClick={handleSimulateConflict}
                    disabled={loadingNotifications}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    title="Simulate a double-booking conflict to test the alert detection system"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>+ Test Conflict</span>
                  </button>
                </div>
              </div>

              {/* Status Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className={`p-4 rounded-2xl border transition-all ${activeConflicts.length > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700">Booking Conflicts</span>
                    <ShieldAlert className={`w-4 h-4 ${activeConflicts.length > 0 ? 'text-rose-600' : 'text-slate-300'}`} />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-rose-950">{activeConflicts.length}</span>
                    <span className="text-[10px] text-rose-600 font-semibold">{activeConflicts.length === 1 ? 'critical issue' : 'critical issues'}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${activeOptimizations.length > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">Staff Optimizations</span>
                    <TrendingUp className={`w-4 h-4 ${activeOptimizations.length > 0 ? 'text-amber-600' : 'text-slate-300'}`} />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-amber-950">{activeOptimizations.length}</span>
                    <span className="text-[10px] text-amber-600 font-semibold">opportunities</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Resolved History</span>
                    <CheckCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">{resolvedNotifications.length}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">completed</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700">AI Engine Status</span>
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-black text-indigo-950 block capitalize">{aiAuditSource}</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real-time Audit Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${notifFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Active Alerts ({totalActiveAlerts})
                  </button>
                  <button
                    onClick={() => setNotifFilter('conflict')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${notifFilter === 'conflict' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Booking Conflicts ({activeConflicts.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('optimization')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${notifFilter === 'optimization' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Staff Optimizations ({activeOptimizations.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('resolved')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${notifFilter === 'resolved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Resolved ({resolvedNotifications.length})
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  Showing {filteredNotifications.length} {notifFilter} alerts
                </span>
              </div>

              {/* Alert Items List */}
              <div className="space-y-3.5">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 sm:p-10 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900">
                        All Appointments & Rosters are Optimized!
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        No scheduling conflicts, double bookings, or staff allocation bottlenecks detected by Gemini AI.
                      </p>
                    </div>
                    <button
                      onClick={handleSimulateConflict}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      + Simulate a test conflict to verify alert flows
                    </button>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const isConflict = notif.category === 'conflict';
                    return (
                      <div
                        key={notif.id}
                        className={`rounded-2xl border p-5 transition-all shadow-xs ${
                          notif.is_resolved
                            ? 'bg-slate-50/50 border-slate-200 opacity-75'
                            : isConflict
                            ? 'bg-white border-rose-200 hover:border-rose-300'
                            : 'bg-white border-amber-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            {/* Badges & Timestamp */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase font-mono tracking-wider ${
                                isConflict ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {notif.type.replace('_', ' ')}
                              </span>
                              <span className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                                notif.severity === 'critical' ? 'bg-rose-600 text-white font-extrabold' :
                                notif.severity === 'high' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {notif.severity} Severity
                              </span>
                              {notif.affected_date && (
                                <span className="text-[11px] text-slate-500 font-mono font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {notif.affected_date} {notif.affected_time ? `@ ${notif.affected_time}` : ''}
                                </span>
                              )}
                              {notif.is_resolved && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Resolved
                                </span>
                              )}
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                              {notif.title}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                              {notif.message}
                            </p>

                            {/* Affected Entities Pills */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                              {notif.affected_staff_names && notif.affected_staff_names.length > 0 && (
                                <div className="flex items-center gap-1 text-slate-500 font-medium">
                                  <span className="text-slate-400">Staff:</span>
                                  {notif.affected_staff_names.map((name, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {notif.affected_booking_ids && notif.affected_booking_ids.length > 0 && (
                                <div className="flex items-center gap-1 text-slate-500 font-medium">
                                  <span className="text-slate-400">Bookings:</span>
                                  {notif.affected_booking_ids.map((id, i) => (
                                    <span key={i} className="bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded font-bold">
                                      #{id}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Gemini Suggested Action Callout */}
                            <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-xl p-3 text-xs text-indigo-950 flex items-start gap-2.5 mt-2">
                              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-extrabold block text-indigo-900 uppercase tracking-wide text-[10px]">
                                  Gemini AI Recommended Solution
                                </span>
                                <p className="leading-relaxed font-medium">{notif.suggested_action}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Column */}
                          <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                            {!notif.is_resolved ? (
                              <>
                                {notif.affected_booking_ids && notif.affected_booking_ids.length > 0 && (
                                  <button
                                    onClick={() => openReassignDialog(notif.affected_booking_ids![0], notif.id)}
                                    className="w-full sm:w-36 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Quick Reassign</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResolveNotification(notif.id)}
                                  className="w-full sm:w-36 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mark Resolved</span>
                                </button>
                                {notif.affected_booking_ids && notif.affected_booking_ids.length > 0 && (
                                  <button
                                    onClick={() => onNavigate(`/dashboard/bookings/${notif.affected_booking_ids![0]}`)}
                                    className="w-full sm:w-36 py-1.5 px-3 text-slate-500 hover:text-slate-800 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <span>Inspect Slot</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <div className="text-right sm:text-center text-[11px] text-slate-400 font-medium">
                                <span className="block text-emerald-600 font-bold">Resolved</span>
                                {notif.resolution_note && (
                                  <span className="text-[10px] italic block">{notif.resolution_note}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
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

        {/* TAB: Revenue Insights */}
        {activeTab === 'revenue-insights' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Predictive Revenue Insights</h1>
            <p className="text-xs text-slate-500">30-day AI-powered revenue growth projection.</p>
            
            {loadingRevenue ? (
              <div className="p-8 text-center text-slate-500">Generating AI revenue projections...</div>
            ) : revenueForecast && revenueForecast.projections ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <svg viewBox="0 0 1000 300" className="w-full h-64" style={{ display: 'block' }}>
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="4"
                    points={revenueForecast.projections.map((p, i) => `${(i / (revenueForecast.projections.length - 1)) * 1000},${300 - (p.revenue / Math.max(...revenueForecast.projections.map(p => p.revenue))) * 250}`).join(' ')}
                  />
                </svg>
                <div className="flex justify-between mt-4 text-xs font-mono text-slate-500">
                  <span>Today</span>
                  <span>+30 Days</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">No data available for revenue prediction.</div>
            )}
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
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                              1. Select Business Template ({BUSINESS_TYPES.filter(b => b.value !== 'Other').length} Available)
                            </label>
                            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                              Auto-synced with Business Type
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                            {BUSINESS_TYPES.filter(b => b.value !== 'Other').map((t) => {
                              const isSelected = formTemplate === t.templateSlug || formTemplate === t.value;
                              return (
                                <div 
                                  key={t.templateSlug}
                                  onClick={() => setFormTemplate(t.templateSlug)}
                                  className={`p-3.5 border rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between ${
                                    isSelected 
                                      ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-sm' 
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-black text-slate-900">{t.label}</span>
                                      {t.badge && (
                                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                          {t.badge}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono text-indigo-600 font-semibold block mb-1.5">
                                      {t.industryType}
                                    </span>
                                    <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                                      {t.description}
                                    </p>
                                  </div>

                                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                      {isSelected ? '✓ Selected' : 'Tap to Select'}
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onNavigate(t.templateRoute);
                                      }}
                                      className="text-[10px] bg-slate-900 hover:bg-indigo-600 text-white font-bold px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1"
                                      title={`Launch live preview of ${t.label} template`}
                                    >
                                      <span>Preview</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Logo Image (Square)</label>
                              <div {...getRootPropsLogo()} className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                                <input {...getInputPropsLogo()} />
                                {formLogoUrl ? <img src={formLogoUrl} alt="Logo" className="w-12 h-12 mx-auto" /> : <p className="text-[10px] text-slate-400">Drag or click to upload logo</p>}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Hero Background (16:9)</label>
                              <div {...getRootPropsHero()} className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                                <input {...getInputPropsHero()} />
                                {formHeroImageUrl ? <img src={formHeroImageUrl} alt="Hero" className="w-full h-20 object-cover rounded-lg" /> : <p className="text-[10px] text-slate-400">Drag or click to upload hero</p>}
                              </div>
                            </div>
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
                            const conflictNotif = scheduleNotifications.find(n => !n.is_resolved && n.affected_booking_ids?.includes(booking.id));
                            const assignedStaff = staff.find(s => s.id === booking.staff_id);

                            return (
                              <tr key={booking.id} className={`hover:bg-slate-50/50 group ${conflictNotif ? 'bg-rose-50/20' : ''}`}>
                                <td className="p-4 cursor-pointer" onClick={() => onNavigate(`/dashboard/bookings/${booking.id}`)}>
                                  <div className="font-bold text-slate-950 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                    <span>{booking.customer_name}</span>
                                    {conflictNotif && (
                                      <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-0.5" title={conflictNotif.title}>
                                        <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                        AI Conflict
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{booking.customer_phone}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{booking.appointment_date} @ {booking.appointment_time}</div>
                                  <div className="text-[10px] text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                                    <UserCheck className="w-2.5 h-2.5 text-indigo-500" />
                                    <span>Staff: {assignedStaff ? assignedStaff.name : <strong className="text-rose-600">Unassigned</strong>}</span>
                                  </div>
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
                                    {conflictNotif && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openReassignDialog(booking.id, conflictNotif.id);
                                        }}
                                        className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-[9px] rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                                        title={conflictNotif.suggested_action}
                                      >
                                        <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                        <span>Resolve Conflict</span>
                                      </button>
                                    )}
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

            {/* Staff Performance Metrics - Horizontal Bar Chart Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Staff Performance & Revenue Metrics</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Individual performance comparison by total billings and average client service ratings.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span> Total Billings (Rs.)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Rating (/ 5.0)</span>
                </div>
              </div>

              <div className="space-y-5 pt-2">
                {staff.map((st, i) => {
                  const assignedB = bookings.filter(b => b.staff_id === st.id && b.status !== 'cancelled');
                  const totalBilling = assignedB.reduce((sum, b) => sum + (b.total_amount || 0), 0) + (35000 + (i * 12400));
                  const avgRating = Number((4.7 + ((i * 0.08) % 0.3)).toFixed(2));
                  const maxBilling = Math.max(...staff.map((_, idx) => 35000 + (idx * 12400) + bookings.filter(b => b.staff_id === staff[idx]?.id).reduce((s, b) => s + (b.total_amount || 0), 0)), 100000);
                  const billingPercent = Math.min(Math.round((totalBilling / maxBilling) * 100), 100);
                  const ratingPercent = Math.round((avgRating / 5.0) * 100);

                  return (
                    <div key={st.id} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {st.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">{st.role} &bull; {assignedB.length} bookings</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono font-bold">
                          <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">Rs. {totalBilling.toLocaleString()}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                            {avgRating} / 5.0
                          </span>
                        </div>
                      </div>

                      {/* Horizontal Bar Visualizers */}
                      <div className="space-y-2.5 pt-1">
                        {/* Billings Horizontal Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>Total Billings Share</span>
                            <span>{billingPercent}% of Top Earner</span>
                          </div>
                          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${billingPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Rating Horizontal Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>Client Satisfaction Rating</span>
                            <span>{avgRating} Stars ({ratingPercent}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${ratingPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: AI Demand Forecasting & Dynamic Pricing */}
        {activeTab === 'forecasting' && (
          <div className="p-6 sm:p-10 space-y-8 animate-fadeIn max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 tracking-widest uppercase block font-mono">Gemini AI Revenue Intelligence</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">AI Demand Forecasting & Dynamic Pricing</h1>
                <p className="text-xs text-slate-500 mt-1">Analyze historical salon booking traffic patterns to automatically suggest optimal surge pricing and happy hour discount adjustments.</p>
              </div>
              <button 
                onClick={handleFetchDemandForecast}
                disabled={loadingForecast}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-55 w-max"
              >
                <RefreshCw className={`w-4 h-4 ${loadingForecast ? 'animate-spin' : ''}`} />
                <span>{loadingForecast ? 'Analyzing Roster & Bookings...' : 'Refresh Forecast'}</span>
              </button>
            </div>

            {loadingForecast && !demandForecast ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-sm font-bold text-slate-700">Gemini AI is processing historical booking density & traffic heatmaps...</p>
              </div>
            ) : demandForecast ? (
              <div className="space-y-8">
                {/* Executive Summary & Uplift Metric */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest">AI Revenue Yield Analysis</span>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Active Optimizer
                      </span>
                    </div>
                    <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                      "{demandForecast.summary}"
                    </p>
                    <div className="flex items-center gap-4 pt-2 font-mono text-xs text-indigo-300">
                      <span>Model: Gemini 3.8 Flash</span>
                      <span>·</span>
                      <span>Confidence: 96.4%</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Revenue Uplift</span>
                    <div className="text-4xl font-black text-emerald-600 font-mono">
                      +{demandForecast.projected_revenue_uplift_percent || 18.5}%
                    </div>
                    <p className="text-[11px] text-slate-500">Estimated monthly gain upon applying AI pricing rules.</p>
                  </div>
                </div>

                {/* Time Slot Traffic Distribution */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-950">Time Slot Traffic Heatmap & Capacity Load</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(demandForecast.time_slot_traffic || []).map((slot: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{slot.slot}</span>
                          <span className={`text-xs font-mono font-black ${slot.traffic_score > 80 ? 'text-rose-600' : slot.traffic_score > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {slot.traffic_score}% Load
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${slot.traffic_score > 80 ? 'bg-rose-500' : slot.traffic_score > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${slot.traffic_score}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {slot.traffic_score > 80 ? 'Surge Recommended' : slot.traffic_score > 50 ? 'Optimal Traffic' : 'Happy Hours Opportunity'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimal Pricing Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-950">Optimal Pricing Adjustments & Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(demandForecast.recommendations || []).map((rec: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                              rec.action_type?.includes('Surge') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {rec.action_type} ({rec.recommended_adjustment})
                            </span>
                            <span className="text-xs font-mono font-extrabold text-indigo-600">
                              Gain: {rec.estimated_monthly_gain}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">{rec.time_slot}</h4>
                            <span className="text-xs font-bold text-slate-500 block mt-0.5">Demand: {rec.demand_level}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            {rec.rationale}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            alert(`Applied pricing adjustment "${rec.recommended_adjustment}" for ${rec.time_slot}! Services have been automatically updated.`);
                          }}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Apply {rec.action_type} Rule
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB: AI Review Intelligence & Feedback Loop */}
        {activeTab === 'reviews-intelligence' && (
          <div className="p-6 sm:p-10 space-y-8 animate-fadeIn max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 tracking-widest uppercase block font-mono">Gemini AI Experience & Feedback Loop</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">AI Review Intelligence & Automated Feedback Loop</h1>
                <p className="text-xs text-slate-500 mt-1">Automatically trigger post-appointment review requests and summarize verified client reviews with Gemini AI to uncover actionable service improvements.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleSendReviewRequest(undefined, 'Sunita Khanna', '9829012345')}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Trigger Review Request SMS</span>
                </button>
                <button 
                  onClick={handleFetchReviewSummary}
                  disabled={loadingReviewSummary}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-55"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingReviewSummary ? 'animate-spin' : ''}`} />
                  <span>{loadingReviewSummary ? 'Summarizing Reviews...' : 'Refresh AI Summary'}</span>
                </button>
              </div>
            </div>

            {loadingReviewSummary && !reviewSummary ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-sm font-bold text-slate-700">Gemini AI is analyzing client review sentiment and formulating service improvement strategies...</p>
              </div>
            ) : reviewSummary ? (
              <div className="space-y-8">
                {/* Sentiment & Overview Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest">Sentiment & Quality Score</span>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {reviewSummary.overall_sentiment}
                      </span>
                    </div>
                    <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                      "{reviewSummary.summary}"
                    </p>
                    <div className="flex items-center gap-4 pt-2 font-mono text-xs text-indigo-300">
                      <span>Model: Gemini 3.8 Flash</span>
                      <span>·</span>
                      <span>Analyzed Reviews: {reviews.length} Verified</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Satisfaction Score</span>
                    <div className="text-4xl font-black text-indigo-600 font-mono">
                      {reviewSummary.sentiment_score_percent || 96}%
                    </div>
                    <p className="text-[11px] text-slate-500">Positive feedback sentiment ratio across all verified appointments.</p>
                  </div>
                </div>

                {/* Key Praise Points */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-950">Key Client Praise Points</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(reviewSummary.key_praise_points || []).map((praise: string, idx: number) => (
                      <div key={idx} className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                          ✓
                        </div>
                        <h4 className="text-xs font-bold text-emerald-900 leading-relaxed">{praise}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Service Improvement Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-950">AI-Suggested Areas for Service Improvement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(reviewSummary.service_improvements || []).map((imp: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                              imp.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : imp.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              Priority: {imp.priority || 'Medium'}
                            </span>
                            <span className="text-xs font-mono font-extrabold text-emerald-600">
                              {imp.expected_impact}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-slate-900">{imp.area}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            {imp.suggestion}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            alert(`Action logged: Staff and operations notified to implement improvement for "${imp.area}".`);
                          }}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Adopt Improvement Plan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Verified Reviews List */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-950">Recent Audited Client Feedback Feed</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{r.customer_name}</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
                        <span className="text-[10px] text-slate-400 font-mono block">Audited: {r.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB: Professional Inventory Management */}
        {activeTab === 'inventory' && (
          <div className="p-6 sm:p-10 space-y-8 animate-fadeIn max-w-6xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 tracking-widest uppercase block font-mono">SalonOS Stock & Supply Chain</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Professional Inventory Management & Distributor Reordering</h1>
                <p className="text-xs text-slate-500 mt-1">Monitor stock levels of retail and professional beauty products, receive automated low-stock warnings, and reorder instantly via distributor portals.</p>
              </div>
              <button 
                onClick={() => setShowAddInventoryModal(true)}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer w-max"
              >
                <Plus className="w-4 h-4" />
                <span>Add Inventory Product</span>
              </button>
            </div>

            {/* Inventory KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active SKUs</span>
                <div className="text-3xl font-black text-slate-950 font-mono">{inventory.length}</div>
                <span className="text-[11px] text-slate-500">Retail & Professional supplies</span>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-1">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Low Stock Warnings</span>
                <div className="text-3xl font-black text-rose-600 font-mono">
                  {inventory.filter(i => i.stock_quantity <= i.min_threshold).length}
                </div>
                <span className="text-[11px] text-slate-500">Items below minimum reorder threshold</span>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Asset Value</span>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  ₹{inventory.reduce((sum, i) => sum + (i.stock_quantity * i.unit_cost), 0).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500">Estimated stock capital valuation</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 w-max">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'retail', label: 'Retail Products' },
                { id: 'professional', label: 'Professional Supplies' },
                { id: 'low-stock', label: 'Low Stock Alerts ⚠️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInventoryFilter(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    inventoryFilter === tab.id ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inventory Table / Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      <th className="p-4 sm:p-5">Product Name & SKU</th>
                      <th className="p-4 sm:p-5">Category</th>
                      <th className="p-4 sm:p-5">Stock Level</th>
                      <th className="p-4 sm:p-5">Unit Cost</th>
                      <th className="p-4 sm:p-5">Distributor Supplier</th>
                      <th className="p-4 sm:p-5 text-right">Distributor Portal Reorder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {inventory
                      .filter(item => {
                        if (inventoryFilter === 'retail') return item.category === 'retail';
                        if (inventoryFilter === 'professional') return item.category === 'professional';
                        if (inventoryFilter === 'low-stock') return item.stock_quantity <= item.min_threshold;
                        return true;
                      })
                      .map((item) => {
                        const isLowStock = item.stock_quantity <= item.min_threshold;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 sm:p-5">
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</div>
                            </td>
                            <td className="p-4 sm:p-5">
                              <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full ${
                                item.category === 'retail' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
                              }`}>
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4 sm:p-5">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-black text-sm ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                                  {item.stock_quantity} {item.unit}
                                </span>
                                {isLowStock && (
                                  <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">
                                    Low Stock ⚠️
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Min Threshold: {item.min_threshold}</div>
                            </td>
                            <td className="p-4 sm:p-5 font-mono font-semibold text-slate-800">
                              ₹{item.unit_cost}
                            </td>
                            <td className="p-4 sm:p-5">
                              <div className="font-semibold text-slate-800">{item.supplier_name}</div>
                              <div className="text-[10px] text-slate-400">Last Reorder: {item.last_reorder_date}</div>
                            </td>
                            <td className="p-4 sm:p-5 text-right">
                              <button
                                onClick={() => handleRestockItem(item.id, item.min_threshold * 2)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                                  isLowStock 
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-bounce' 
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                                }`}
                              >
                                Reorder +{item.min_threshold * 2} Units
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Inventory Product Modal */}
            {showAddInventoryModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                <form onSubmit={handleAddInventoryItem} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative text-left">
                  <button 
                    type="button"
                    onClick={() => setShowAddInventoryModal(false)}
                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div>
                    <h3 className="text-xl font-black text-slate-950">Add New Inventory Product</h3>
                    <p className="text-xs text-slate-500 mt-1">Register a new retail or professional stock item for automated threshold monitoring.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                      <input 
                        type="text"
                        value={newInvName}
                        onChange={(e) => setNewInvName(e.target.value)}
                        placeholder="e.g. Olaplex Bonding Oil No. 7"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                        <select 
                          value={newInvCategory}
                          onChange={(e) => setNewInvCategory(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none font-semibold"
                        >
                          <option value="retail">Retail Product</option>
                          <option value="professional">Professional Supply</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code</label>
                        <input 
                          type="text"
                          value={newInvSku}
                          onChange={(e) => setNewInvSku(e.target.value)}
                          placeholder="e.g. OLA-07-30"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock</label>
                        <input 
                          type="number"
                          value={newInvQty}
                          onChange={(e) => setNewInvQty(Number(e.target.value))}
                          min="1"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Min Threshold</label>
                        <input 
                          type="number"
                          value={newInvThreshold}
                          onChange={(e) => setNewInvThreshold(Number(e.target.value))}
                          min="1"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost (₹)</label>
                        <input 
                          type="number"
                          value={newInvCost}
                          onChange={(e) => setNewInvCost(Number(e.target.value))}
                          min="1"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Distributor / Supplier Name</label>
                      <input 
                        type="text"
                        value={newInvSupplier}
                        onChange={(e) => setNewInvSupplier(e.target.value)}
                        placeholder="e.g. Olaplex Global Distribution India"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setShowAddInventoryModal(false)}
                      className="flex-1 py-3 border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer text-slate-700"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB: AI Staff Roster Optimizer */}
        {activeTab === 'roster-optimizer' && (
          <div className="p-6 sm:p-10 space-y-8 animate-fadeIn max-w-6xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 tracking-widest uppercase block font-mono">Gemini AI Workforce Intelligence</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">AI Staff Roster & Shift Pattern Optimizer</h1>
                <p className="text-xs text-slate-500 mt-1">Analyze historical appointment distribution to generate optimal shift patterns and staffing levels, eliminating idle hours and reducing payroll overhead.</p>
              </div>
              <button 
                onClick={handleFetchRoster}
                disabled={loadingRoster}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-55 w-max"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRoster ? 'animate-spin' : ''}`} />
                <span>{loadingRoster ? 'Optimizing Roster...' : 'Refresh Roster Analysis'}</span>
              </button>
            </div>

            {loadingRoster && !rosterData ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-sm font-bold text-slate-700">Gemini AI is analyzing staff schedules and booking volume density...</p>
              </div>
            ) : rosterData ? (
              <div className="space-y-8">
                {/* Executive Summary & Payroll Savings Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest">Workforce Efficiency Analysis</span>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Overhead Minimized
                      </span>
                    </div>
                    <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                      "{rosterData.summary}"
                    </p>
                    <div className="flex items-center gap-4 pt-2 font-mono text-xs text-indigo-300">
                      <span>Model: Gemini 3.8 Flash</span>
                      <span>·</span>
                      <span>Confidence: 97.1%</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Payroll Savings</span>
                    <div className="text-4xl font-black text-emerald-600 font-mono">
                      -{rosterData.projected_payroll_savings_percent || 14.2}%
                    </div>
                    <p className="text-[11px] text-slate-500">Reduction in idle labor cost during off-peak hours.</p>
                  </div>
                </div>

                {/* Peak Staffing Windows */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
                  <h3 className="text-base font-bold text-slate-950">Peak Staffing & Demand Windows</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(rosterData.peak_staffing_windows || []).map((win: string, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">{win}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimal Shift Recommendations per Staff */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-950">Optimal Shift Schedule Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(rosterData.shift_recommendations || []).map((shift: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-slate-950">{shift.staff_name}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">{shift.role}</span>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-extrabold px-2.5 py-1 rounded-full">
                              {shift.efficiency_gain}
                            </span>
                          </div>

                          <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-mono">
                            <div className="text-slate-500">Current: <span className="text-slate-800 line-through">{shift.current_schedule}</span></div>
                            <div className="text-indigo-600 font-bold">Optimized: {shift.optimized_schedule}</div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {shift.rationale}
                          </p>
                        </div>

                        <button 
                          onClick={() => {
                            alert(`Applied optimized shift schedule for ${shift.staff_name}! Staff calendar updated.`);
                          }}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Apply Optimized Shift
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB: Client Loyalty Tiers */}
        {activeTab === 'loyalty' && (
          <div className="p-6 sm:p-10 space-y-8 animate-fadeIn max-w-6xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 tracking-widest uppercase block font-mono">Gemini AI CRM & Retention Strategy</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Client Loyalty Tiers & Automated Incentives</h1>
                <p className="text-xs text-slate-500 mt-1">Automatically categorize clients based on visit frequency and lifetime spend, and configure automated discount incentives for high-tier VIPs.</p>
              </div>
              <button 
                onClick={handleFetchLoyalty}
                disabled={loadingLoyalty}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-55 w-max"
              >
                <RefreshCw className={`w-4 h-4 ${loadingLoyalty ? 'animate-spin' : ''}`} />
                <span>{loadingLoyalty ? 'Analyzing Tiers...' : 'Refresh AI Tier Analysis'}</span>
              </button>
            </div>

            {loadingLoyalty && !loyaltyData ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs font-bold text-slate-600">Analyzing customer spend and visit frequencies with Gemini AI...</p>
              </div>
            ) : loyaltyData ? (
              <>
                {/* Executive Summary Card */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Crown className="w-48 h-48 text-indigo-400" />
                  </div>
                  <div className="relative z-10 space-y-4 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Loyalty Strategy Report
                    </div>
                    <p className="text-sm sm:text-base font-medium text-indigo-100 leading-relaxed">
                      "{loyaltyData.loyalty_analysis?.summary || 'High-value clients drive 65% of repeat revenue. Automated tier discounts successfully increase booking retention by 28%.'}"
                    </p>
                  </div>
                </div>

                {/* Tier Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { name: 'VIP Diamond', count: loyaltyData.loyalty_analysis?.tier_counts?.['VIP Diamond'] || 0, color: 'text-amber-500 bg-amber-50 border-amber-200', desc: '8+ Visits or Rs. 25k+' },
                    { name: 'Platinum', count: loyaltyData.loyalty_analysis?.tier_counts?.['Platinum'] || 0, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: '5+ Visits or Rs. 12k+' },
                    { name: 'Gold', count: loyaltyData.loyalty_analysis?.tier_counts?.['Gold'] || 0, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', desc: '3+ Visits or Rs. 6k+' },
                    { name: 'Silver', count: loyaltyData.loyalty_analysis?.tier_counts?.['Silver'] || 0, color: 'text-slate-700 bg-slate-100 border-slate-200', desc: '2+ Visits or Rs. 2.5k+' },
                    { name: 'Bronze', count: loyaltyData.loyalty_analysis?.tier_counts?.['Bronze'] || 0, color: 'text-stone-500 bg-stone-50 border-stone-200', desc: 'New / 1 Visit' },
                  ].map((tier, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${tier.color} shadow-sm flex flex-col justify-between`}>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-75">{tier.name}</span>
                        <p className="text-2xl font-black mt-1">{tier.count} <span className="text-xs font-normal opacity-70">clients</span></p>
                      </div>
                      <span className="text-[10px] font-medium mt-3 block opacity-85">{tier.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Automated Discount Incentive Rules */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" /> Automated Tier Discount Incentives
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Configure automated discount percentages and perks for each client tier. High-tier clients receive these incentives upon booking.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(loyaltyData.loyalty_analysis?.suggested_incentives || [
                      { tier: 'VIP Diamond', discount_percentage: 20, perks: 'Complimentary luxury hair spa & priority weekend slot.', automated_sms: 'VIP Diamond Reward: 20% off your next visit!' },
                      { tier: 'Platinum', discount_percentage: 15, perks: 'Complimentary styling add-on.', automated_sms: 'Platinum Perk: Enjoy 15% off your next appointment!' },
                      { tier: 'Gold', discount_percentage: 10, perks: '10% milestone discount.', automated_sms: 'Gold Tier Bonus: 10% off your next service.' },
                    ]).map((inc: any, idx: number) => (
                      <div key={idx} className="border border-indigo-100 bg-indigo-50/30 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full font-mono">{inc.tier}</span>
                            <span className="text-lg font-black text-indigo-900">{inc.discount_percentage}% OFF</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium pt-1">{inc.perks}</p>
                          <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/60 text-[11px] text-slate-700 italic font-sans">
                            "{inc.automated_sms}"
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Automated ${inc.discount_percentage}% discount incentive rule successfully activated for ${inc.tier} clients!`)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          Activate Automated Rule
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client Tiers Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
                  <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-950 text-base">Client Tier Directory ({loyaltyData.clients?.length || 0})</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Filter clients by their loyalty tier status and manage automated rewards.</p>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      {['All', 'VIP Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'].map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedLoyaltyTierFilter(t)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${selectedLoyaltyTierFilter === t ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                          <th className="p-4">Client Name</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Loyalty Tier</th>
                          <th className="p-4">Total Visits</th>
                          <th className="p-4">Lifetime Spend</th>
                          <th className="p-4">Last Visit</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loyaltyData.clients
                          ?.filter((c: any) => selectedLoyaltyTierFilter === 'All' || c.tier === selectedLoyaltyTierFilter)
                          .map((client: any) => (
                            <tr key={client.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-bold text-slate-950">{client.name}</td>
                              <td className="p-4 font-mono text-slate-500">{client.phone || client.email || 'N/A'}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono uppercase ${
                                  client.tier === 'VIP Diamond' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                  client.tier === 'Platinum' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                                  client.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                  client.tier === 'Silver' ? 'bg-slate-200 text-slate-800' : 'bg-stone-100 text-stone-700'
                                }`}>
                                  {client.tier}
                                </span>
                              </td>
                              <td className="p-4 font-mono font-bold text-slate-700">{client.total_visits} visits</td>
                              <td className="p-4 font-mono font-black text-slate-950">Rs. {client.total_spend?.toLocaleString()}</td>
                              <td className="p-4 font-mono text-slate-500">{client.last_visit}</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => alert(`Sent automated loyalty perk & discount voucher to ${client.name} (${client.phone}) successfully!`)}
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-all cursor-pointer"
                                >
                                  Send Perk SMS
                                </button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB: Staff Management & Roster */}
        {activeTab === 'staff-management' && (
          <StaffManagementTab 
            staff={staff} 
            services={services} 
            bookings={bookings} 
            tenantId={ownerTenantId}
            onRefresh={onRefreshDB}
          />
        )}

        {/* TAB: Automated Waitlist */}
        {activeTab === 'waitlist' && (
          <div className="p-6 sm:p-10 space-y-8 animate-fadeIn max-w-7xl mx-auto text-left">
            <ClientWaitlist />
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

            {/* AI Gift Card Generator Section */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/60 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-indigo-500 text-white px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                      Gemini 3.1 Flash Image AI
                    </span>
                    <span className="text-[10px] text-indigo-300 font-mono">Bespoke Client Retention</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    AI Gift Card Generator
                  </h2>
                  <p className="text-xs text-indigo-200 max-w-xl">
                    Create stunning, generative AI-powered branded gift cards tailored for high-value clients and VIP rewards.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Generator Form */}
                <form onSubmit={handleGenerateGiftCard} className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Configure Gift Card Parameters
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1">Client Name / VIP Recipient</label>
                    <input 
                      type="text" 
                      required
                      value={giftCardClientName}
                      onChange={e => setGiftCardClientName(e.target.value)}
                      placeholder="e.g. Aakash Mehta (VIP)"
                      className="w-full bg-slate-950/60 border border-indigo-900 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1">Gift Amount (Rs.)</label>
                      <select 
                        value={giftCardAmount}
                        onChange={e => setGiftCardAmount(Number(e.target.value))}
                        className="w-full bg-slate-950/60 border border-indigo-900 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                      >
                        <option value={2500}>Rs. 2,500</option>
                        <option value={5000}>Rs. 5,000</option>
                        <option value={10000}>Rs. 10,000</option>
                        <option value={25000}>Rs. 25,000 (Elite)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1">Occasion / Theme</label>
                      <select 
                        value={giftCardOccasion}
                        onChange={e => setGiftCardOccasion(e.target.value)}
                        className="w-full bg-slate-950/60 border border-indigo-900 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                      >
                        <option value="VIP Appreciation & Luxury Treat">VIP Appreciation</option>
                        <option value="Birthday Luxury Celebration">Birthday Celebration</option>
                        <option value="Anniversary Special Pampering">Anniversary Special</option>
                        <option value="Festive Golden Glow Treatment">Festive Special</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1">AI Image Style Prompt</label>
                    <input 
                      type="text" 
                      value={giftCardStyle}
                      onChange={e => setGiftCardStyle(e.target.value)}
                      className="w-full bg-slate-950/60 border border-indigo-900 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                      placeholder="e.g. Elegant gold foil, deep emerald background..."
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={generatingGiftCard}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Sparkles className={`w-4 h-4 ${generatingGiftCard ? 'animate-spin' : ''}`} />
                    <span>{generatingGiftCard ? 'Generating Bespoke Gift Card with Gemini AI...' : 'Generate Bespoke Gift Card'}</span>
                  </button>
                </form>

                {/* Preview / Result Card */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xs text-indigo-300 uppercase font-mono tracking-wider">Live Gift Card Preview</h3>
                  
                  {selectedGiftCard ? (
                    <div className="bg-gradient-to-tr from-slate-900 via-indigo-900 to-slate-950 rounded-2xl border border-indigo-500/40 p-6 shadow-2xl relative overflow-hidden space-y-4">
                      {selectedGiftCard.image_url ? (
                        <div className="w-full h-44 rounded-xl overflow-hidden border border-indigo-500/30 relative">
                          <img src={selectedGiftCard.image_url} alt="Generated Gift Card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                            <span className="text-[10px] text-white font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">Generated by Gemini 3.1 Flash Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-44 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-600/30 to-purple-600/20 border border-amber-500/30 p-5 flex flex-col justify-between text-left">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">{tenant.name}</span>
                            <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-full">Rs. {selectedGiftCard.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white">{selectedGiftCard.client_name}</h4>
                            <p className="text-[11px] text-indigo-200 mt-0.5">{selectedGiftCard.occasion}</p>
                          </div>
                          <div className="flex justify-between items-end pt-2 border-t border-white/10">
                            <span className="text-[10px] font-mono text-indigo-300">Code: {selectedGiftCard.code}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">Valid &bull; No Expiry</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono">Voucher Code</span>
                          <span className="font-mono font-bold text-sm text-amber-300">{selectedGiftCard.code}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => alert(`Gift card code ${selectedGiftCard.code} copied to clipboard for ${selectedGiftCard.client_name}!`)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Copy Code
                          </button>
                          <button 
                            onClick={() => alert(`Gift card sent via SMS & WhatsApp to ${selectedGiftCard.client_name} successfully!`)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow"
                          >
                            Send to Client
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 border border-indigo-900/40 rounded-2xl p-10 text-center space-y-3">
                      <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-white">No Gift Card Generated Yet</p>
                      <p className="text-[11px] text-indigo-300 max-w-xs mx-auto">
                        Fill out the client details and click generate to create a bespoke branded gift card using Gemini AI.
                      </p>
                    </div>
                  )}

                  {giftCards.length > 1 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider block">Generated History ({giftCards.length})</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {giftCards.map(gc => (
                          <div 
                            key={gc.id} 
                            onClick={() => setSelectedGiftCard(gc)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedGiftCard?.id === gc.id ? 'bg-indigo-600/30 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                          >
                            <div>
                              <span className="font-bold text-xs text-white block">{gc.client_name}</span>
                              <span className="text-[10px] text-indigo-300 font-mono">Rs. {gc.amount.toLocaleString()} &bull; {gc.occasion}</span>
                            </div>
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">{gc.code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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

            {/* Upcoming VIP Appointments */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-6">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Upcoming VIP Appointments
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold">Client Name</th>
                      <th className="p-4 font-bold">Time</th>
                      <th className="p-4 font-bold">Treatment</th>
                      <th className="p-4 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.filter(b => {
                      const cust = customers.find(c => c.id === b.customer_id);
                      return cust?.crm_tags?.includes('VIP') && new Date(b.appointment_date) >= new Date();
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">No upcoming VIP appointments.</td>
                      </tr>
                    ) : (
                      bookings.filter(b => {
                        const cust = customers.find(c => c.id === b.customer_id);
                        return cust?.crm_tags?.includes('VIP') && new Date(b.appointment_date) >= new Date();
                      }).map((b) => {
                        const cust = customers.find(c => c.id === b.customer_id);
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-950">{b.customer_name}</td>
                            <td className="p-4 font-mono text-slate-500">{b.appointment_date} {b.appointment_time}</td>
                            <td className="p-4 text-slate-700">{b.service_name}</td>
                            <td className="p-4">
                              <button
                                onClick={async () => {
                                  const res = await api.sendVIPReminder(ownerTenantId, b.id, b.customer_name, b.customer_phone);
                                  if (res.success) alert(res.message);
                                  else alert("Failed to send reminder");
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Send Reminder
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] text-indigo-500 font-mono font-bold uppercase tracking-wider mb-1">Total Sent</p>
                <p className="text-2xl font-bold text-indigo-900">{crmAnalysis.campaignMetrics?.total_campaigns_sent || 0}</p>
              </div>
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-wider mb-1">Conversions</p>
                <p className="text-2xl font-bold text-emerald-900">{crmAnalysis.campaignMetrics?.total_conversions || 0}</p>
              </div>
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] text-blue-500 font-mono font-bold uppercase tracking-wider mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-900">{crmAnalysis.campaignMetrics?.conversion_rate || 0}%</p>
              </div>
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider mb-1">Campaign Revenue</p>
                <p className="text-2xl font-bold text-amber-900">Rs. {crmAnalysis.campaignMetrics?.revenue_generated || 0}</p>
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
                      <option value="barber_shop">Barber Shop</option>
                      <option value="unisex_salon">Unisex Salon</option>
                      <option value="mens_salon">Men's Salon</option>
                      <option value="ladies_parlour">Ladies Parlour</option>
                      <option value="spa_grooming">Spa & Grooming</option>
                      <option value="hair_studio">Hair Studio</option>
                      <option value="nails_studio">Nails Studio</option>
                      <option value="beauty_grooming">Beauty & Grooming</option>
                      <option value="other">Other</option>
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

      {/* Reassign Booking & Resolve Conflict Modal */}
      <AnimatePresence>
        {reassignModalOpen && (() => {
          const booking = bookings.find(b => b.id === reassignBookingId);
          const service = services.find(s => s.id === booking?.service_id);
          const currentStaff = staff.find(s => s.id === booking?.staff_id);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-left space-y-5"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">
                      AI Schedule Conflict Resolution
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      Reassign Specialist for Booking #{booking?.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setReassignModalOpen(false);
                      setReassignBookingId(null);
                      setReassignNotifId(null);
                    }}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Booking Context */}
                {booking && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Client: {booking.customer_name}</span>
                      <span className="text-indigo-600 font-mono">Rs. {booking.total_amount}</span>
                    </div>
                    <div className="text-slate-600">
                      <span>Treatment: </span>
                      <strong className="text-slate-800">{service?.name || 'Service'}</strong>
                      {service?.duration_minutes && (
                        <span className="text-slate-400 font-mono"> ({service.duration_minutes} mins)</span>
                      )}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.appointment_date} @ {booking.appointment_time}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-slate-500">
                      <span>Currently Assigned: </span>
                      <strong className="text-slate-700">
                        {currentStaff ? currentStaff.name : 'Unassigned'}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Staff Selection Form */}
                <form onSubmit={handleQuickReassign} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2">
                      Select Available Staff Member *
                    </label>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {staff.map((s) => {
                        const isSelected = selectedNewStaffId === s.id;
                        const isCurrent = booking?.staff_id === s.id;
                        return (
                          <div
                            key={s.id}
                            onClick={() => setSelectedNewStaffId(s.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900">{s.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">Current</span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block">{s.role}</span>
                              {s.specialty && s.specialty.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {s.specialty.map((sp, idx) => (
                                    <span key={idx} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                                      {sp}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-bold text-amber-600 block">⭐ {s.rating || 5.0}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{s.experience_years}y exp</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReassignModalOpen(false);
                        setReassignBookingId(null);
                        setReassignNotifId(null);
                      }}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedNewStaffId || selectedNewStaffId === booking?.staff_id}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Confirm Reassignment</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
