/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  UserRole, 
  AppointmentStatus, 
  PaymentStatus,
  Tenant,
  WebsiteTemplate,
  TenantWebsite,
  Service,
  Staff,
  Customer,
  Appointment,
  Review,
  Wallet,
  WalletTransaction,
  Payout,
  Partner,
  BrandProfile,
  DistributorProfile,
  BrandProduct,
  BrandLead,
  JobCandidate,
  JobPost,
  JobApplication
} from "./src/types";

// App setup
const app = express();
const PORT = 3000;
app.use(express.json());

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, "db.json");

// Types for DB
interface DatabaseSchema {
  profiles: any[];
  tenants: Tenant[];
  website_templates: WebsiteTemplate[];
  tenant_websites: TenantWebsite[];
  services: Service[];
  staff: Staff[];
  customers: Customer[];
  appointments: Appointment[];
  reviews: Review[];
  wallets: Wallet[];
  transactions: WalletTransaction[];
  payouts: Payout[];
  partners: Partner[];
  brand_profiles: BrandProfile[];
  distributor_profiles: DistributorProfile[];
  brand_products: BrandProduct[];
  brand_leads: BrandLead[];
  job_candidates: JobCandidate[];
  job_posts: JobPost[];
  job_applications: JobApplication[];
  audit_logs: any[];
}

function recalculateRankings(db: DatabaseSchema) {
  if (!db.tenants) return;
  db.tenants.forEach((tenant) => {
    const tenantApts = db.appointments ? db.appointments.filter(a => a.tenant_id === tenant.id) : [];
    
    // 1. QR payments score (30% weight) - 100 points maximum
    const completedQRApts = tenantApts.filter(a => a.payment_status === PaymentStatus.PAID_IN_FULL || a.payment_status === PaymentStatus.ADVANCE_PAID);
    const totalQRPaidAmount = completedQRApts.reduce((sum, a) => {
      let paid = 0;
      if (a.payment_status === PaymentStatus.PAID_IN_FULL) paid += a.total_amount;
      else if (a.payment_status === PaymentStatus.ADVANCE_PAID) paid += a.advance_amount;
      return sum + paid;
    }, 0);
    const qr_payments_score = Math.min(100, Math.round(totalQRPaidAmount / 50) || 15);

    // 2. Bookings score (25% weight) - 100 points maximum
    const completedCount = tenantApts.filter(a => a.status === AppointmentStatus.COMPLETED).length;
    const bookings_score = Math.min(100, (completedCount * 25) || 40);

    // 3. Reviews score (20% weight) - 100 points maximum
    const rating = tenant.rating || 4.5;
    const shopReviews = db.reviews ? db.reviews.filter(r => r.tenant_id === tenant.id) : [];
    const reviews_count = shopReviews.length || tenant.reviews_count || 1;
    const reviews_score = Math.min(100, Math.round((rating * 15) + (reviews_count * 5)));

    // 4. Repeat customers score (15% weight) - 100 points maximum
    const tenantCustomers = db.customers ? db.customers.filter(c => c.tenant_id === tenant.id) : [];
    const repeatCount = tenantCustomers.filter(c => c.crm_tags && (c.crm_tags.includes('Regular') || c.crm_tags.includes('VIP'))).length;
    const repeatPercent = tenantCustomers.length > 0 ? (repeatCount / tenantCustomers.length) * 100 : 50;
    const repeat_customers_score = Math.min(100, Math.round(repeatPercent));

    // 5. Referrals score (5% weight) - 100 points maximum
    let referralCount = 1;
    if (tenant.id === 'ten_aura') referralCount = 4;
    else if (tenant.id === 'ten_imperial') referralCount = 3;
    else if (tenant.id === 'ten_zen') referralCount = 2;
    const referrals_score = Math.min(100, referralCount * 25);

    // 6. Profile completion score (5% weight) - 100 points maximum
    let profilePoints = 30; // base registered
    if (tenant.banner_url || tenant.logo_url) profilePoints += 20;
    if (tenant.phone && tenant.email) profilePoints += 20;
    const website = db.tenant_websites ? db.tenant_websites.find(w => w.tenant_id === tenant.id) : null;
    if (website && website.is_published) profilePoints += 15;
    const serviceCount = db.services ? db.services.filter(s => s.tenant_id === tenant.id).length : 0;
    if (serviceCount >= 3) profilePoints += 15;
    const profile_completion_score = Math.min(100, profilePoints);

    // Total score calculation
    const total_score = parseFloat((
      (qr_payments_score * 0.30) +
      (bookings_score * 0.25) +
      (reviews_score * 0.20) +
      (repeat_customers_score * 0.15) +
      (referrals_score * 0.05) +
      (profile_completion_score * 0.05)
    ).toFixed(1));

    tenant.ranking_score = total_score;
    tenant.ranking_breakdown = {
      qr_payments_score,
      bookings_score,
      reviews_score,
      repeat_customers_score,
      referrals_score,
      profile_completion_score,
      total_score
    };
  });
}

function addCustomerCashback(db: DatabaseSchema, tenantId: string, customerPhone: string, amount: number, description: string) {
  if (!db.customers) return;
  const customer = db.customers.find(c => c.tenant_id === tenantId && c.phone === customerPhone);
  if (customer) {
    if (!customer.cashback_balance) customer.cashback_balance = 0;
    if (!customer.cashback_earned_history) customer.cashback_earned_history = [];

    const earned = parseFloat(amount.toFixed(2));
    customer.cashback_balance = parseFloat((customer.cashback_balance + earned).toFixed(2));
    customer.cashback_earned_history.push({
      id: "cb_" + Math.random().toString(36).substring(2, 9),
      amount: earned,
      date: new Date().toISOString(),
      description
    });
  }
}

// Helper to load db
function loadDB(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      recalculateRankings(db);
      return db;
    } catch (e) {
      console.error("Error reading database file, using defaults", e);
    }
  }
  const db = getSeededData();
  recalculateRankings(db);
  return db;
}

// Helper to save db
function saveDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing to database file", e);
  }
}

// Initial seeded data generator
function getSeededData(): DatabaseSchema {
  const seedTime = new Date().toISOString();
  
  // 3 Templates
  const website_templates: WebsiteTemplate[] = [
    {
      id: "tpl_luxury",
      code: "luxury_beauty",
      name: "Luxury Beauty Salon",
      description: "A premium black, gold, and clean white template designed for high-end salons and bridal studios.",
      target_business: "Salons, bridal, makeup studios",
      theme_config: {
        primaryColor: "#D4AF37", // Gold
        secondaryColor: "#1E1E1E", // Black
        backgroundColor: "#FFFFFF",
        textColor: "#0F172A",
        fontFamily: "Outfit"
      },
      layout_config: {},
      is_active: true,
      display_order: 1
    },
    {
      id: "tpl_barber",
      code: "modern_barber",
      name: "Modern Barber Shop",
      description: "A bold, dark grey, steel-toned layout tailored for male grooming and beard studios.",
      target_business: "Barbershops, men's grooming",
      theme_config: {
        primaryColor: "#2563EB", // Blue
        secondaryColor: "#1E293B", // Steel slate
        backgroundColor: "#F8FAFC",
        textColor: "#0F172A",
        fontFamily: "Inter"
      },
      layout_config: {},
      is_active: true,
      display_order: 2
    },
    {
      id: "tpl_spa",
      code: "spa_wellness",
      name: "Spa & Wellness",
      description: "A soft beige and calming green-toned relaxing aesthetic perfect for massage and therapy centers.",
      target_business: "Spas, massage, therapy clinics",
      theme_config: {
        primaryColor: "#059669", // Sage green
        secondaryColor: "#F5F5DC", // Beige
        backgroundColor: "#FCFBF7",
        textColor: "#1E293B",
        fontFamily: "Inter"
      },
      layout_config: {},
      is_active: true,
      display_order: 3
    }
  ];

  // 3 Tenants (Jaipur-based)
  const tenants: Tenant[] = [
    {
      id: "ten_aura",
      owner_id: "usr_owner_aura",
      name: "Aura Premium Salon & Bridal",
      business_type: "salons",
      phone: "+91 98765 43210",
      email: "aura@nexora.io",
      address: "Plot 42, Girdhar Marg, Sector 9, Malviya Nagar",
      city: "Jaipur",
      state: "Rajasthan",
      area: "Malviya Nagar",
      logo_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200&h=200",
      banner_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200",
      description: "A luxury lifestyle beauty salon specializing in premium bridal makeovers, global hair transformations, and organic facials.",
      approval_status: "approved",
      is_active: true,
      latitude: 26.8529,
      longitude: 75.8048,
      rating: 4.9,
      reviews_count: 142,
      starting_price: 950,
      is_verified: true,
      created_at: seedTime,
      updated_at: seedTime
    },
    {
      id: "ten_imperial",
      owner_id: "usr_owner_imperial",
      name: "The Imperial Royal Barbers",
      business_type: "barber shops",
      phone: "+91 99999 88888",
      email: "imperial@nexora.io",
      address: "12, Ashok Marg, Near C-Scheme Post Office, C-Scheme",
      city: "Jaipur",
      state: "Rajasthan",
      area: "C-Scheme",
      logo_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=200&h=200",
      banner_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
      description: "A traditional men's grooming lounge reviving the fine art of hot towel shaves, meticulous haircuts, and royal beard treatments.",
      approval_status: "approved",
      is_active: true,
      latitude: 26.9116,
      longitude: 75.8021,
      rating: 4.8,
      reviews_count: 98,
      starting_price: 250,
      is_verified: true,
      created_at: seedTime,
      updated_at: seedTime
    },
    {
      id: "ten_zen",
      owner_id: "usr_owner_zen",
      name: "Siam Zen Wellness Spa",
      business_type: "spas",
      phone: "+91 95555 44444",
      email: "zen@nexora.io",
      address: "B-8, Gali No. 3, Govind Marg, Raja Park",
      city: "Jaipur",
      state: "Rajasthan",
      area: "Raja Park",
      logo_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=200&h=200",
      banner_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
      description: "Indulge in ancient therapeutic rituals. We offer deep-tissue Thai massages, aromatherapy, and hot stone stress-relieving sessions.",
      approval_status: "approved",
      is_active: true,
      latitude: 26.8993,
      longitude: 75.8315,
      rating: 4.7,
      reviews_count: 64,
      starting_price: 1200,
      is_verified: true,
      created_at: seedTime,
      updated_at: seedTime
    }
  ];

  // Websites for each tenant
  const tenant_websites: TenantWebsite[] = [
    {
      id: "web_aura",
      tenant_id: "ten_aura",
      template_id: "tpl_luxury",
      slug: "aura-premium",
      website_title: "Aura Premium Salon | Malviya Nagar",
      hero_title: "Reveal Your True Radiance",
      hero_subtitle: "Experience elite beauty styling, luxury bridal care, and premium hair treatments tailored by industry maestros in Jaipur.",
      about_text: "Aura Premium has been the epitome of luxury makeovers in Malviya Nagar for over five years. We bring top-of-the-line services, state-of-the-art products, and unmatched attention to detail directly to you.",
      phone: "+91 98765 43210",
      whatsapp_number: "+919876543210",
      email: "aura@nexora.io",
      address: "Plot 42, Girdhar Marg, Sector 9, Malviya Nagar, Jaipur",
      instagram_url: "https://instagram.com/aura_premium",
      facebook_url: "https://facebook.com/aura_premium",
      section_visibility: {
        hero: true,
        services: true,
        gallery: true,
        reviews: true,
        location: true,
        contact: true,
        offers: true
      },
      is_published: true,
      published_at: seedTime
    },
    {
      id: "web_imperial",
      tenant_id: "ten_imperial",
      template_id: "tpl_barber",
      slug: "imperial-barbers",
      website_title: "The Imperial Royal Barbers | C-Scheme",
      hero_title: "Crafting Rajasthan's Finest Gentlemen",
      hero_subtitle: "Step into our royal grooming club. Enjoy hot towel shaves, beard architecture, and premium haircuts in Jaipur's most masculine lounge.",
      about_text: "At The Imperial, grooming is a noble ritual, not just a routine chore. We maintain the rich traditions of classic barbershops with a modern edge, serving Jaipur's discerning elite with precision.",
      phone: "+91 99999 88888",
      whatsapp_number: "+919999988888",
      email: "imperial@nexora.io",
      address: "12, Ashok Marg, Near C-Scheme Post Office, C-Scheme, Jaipur",
      instagram_url: "https://instagram.com/imperial_barbers",
      facebook_url: "https://facebook.com/imperial_barbers",
      section_visibility: {
        hero: true,
        services: true,
        gallery: true,
        reviews: true,
        location: true,
        contact: true,
        offers: true
      },
      is_published: true,
      published_at: seedTime
    },
    {
      id: "web_zen",
      tenant_id: "ten_zen",
      template_id: "tpl_spa",
      slug: "siam-spa",
      website_title: "Siam Zen Wellness Spa | Raja Park",
      hero_title: "Rejuvenate Your Mind & Soul",
      hero_subtitle: "An authentic sanctuary of peace in Raja Park. Unwind with stress-melting Thai treatments, luxury facials, and hot stone therapy.",
      about_text: "Siam Zen Spa offers an exclusive relaxation escape from Jaipur's bustling lifestyle. Our therapists are trained in the highest disciplines of Thai physical therapies, ensuring premium relief and wellness.",
      phone: "+91 95555 44444",
      whatsapp_number: "+919555544444",
      email: "zen@nexora.io",
      address: "B-8, Gali No. 3, Govind Marg, Raja Park, Jaipur",
      section_visibility: {
        hero: true,
        services: true,
        gallery: true,
        reviews: true,
        location: true,
        contact: true,
        offers: true
      },
      is_published: true,
      published_at: seedTime
    }
  ];

  // Preseeded Services
  const services: Service[] = [
    // Aura
    { id: "ser_aura_1", tenant_id: "ten_aura", category_name: "Bridal", name: "Royal HD Bridal Makeup", description: "Flawless HD airbrush makeup package including hair setting, dupatta draping, and customized skin preparation.", price: 8500, duration_minutes: 150, image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=200", status: "active", is_featured: true },
    { id: "ser_aura_2", tenant_id: "ten_aura", category_name: "Hair Care", name: "Global Hair Keratin Infusion", description: "Rich keratin bonding therapy to smooth frizz, reinforce cuticles, and add long-lasting luminous shine.", price: 4500, duration_minutes: 120, image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=200", status: "active", is_featured: true },
    { id: "ser_aura_3", tenant_id: "ten_aura", category_name: "Facial", name: "O3+ Radiance Glow Therapy", description: "Luxury skin brightening facial with multi-vitamin infusions to target uneven tone and boost hydration.", price: 1800, duration_minutes: 60, status: "active", is_featured: false },
    { id: "ser_aura_4", tenant_id: "ten_aura", category_name: "Hair Care", name: "Elite Hair Cut & Style Blowout", description: "Creative style consultation, professional hair wash, customized cutting, and standard volume blowout.", price: 950, duration_minutes: 45, status: "active", is_featured: true },
    
    // Imperial
    { id: "ser_imp_1", tenant_id: "ten_imperial", category_name: "Haircuts", name: "Gentleman's Royal Haircut", description: "Precision shears and clipper haircut, energizing tea tree wash, hot-towel neck shave, and bespoke styling.", price: 450, duration_minutes: 40, image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=200", status: "active", is_featured: true },
    { id: "ser_imp_2", tenant_id: "ten_imperial", category_name: "Beard Grooming", name: "Imperial Beard Sculpting & Shave", description: "Intricate beard trim shaped with straight razor lining, conditioned with cedarwood oil and hot towel relaxer.", price: 250, duration_minutes: 30, image_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=200", status: "active", is_featured: true },
    { id: "ser_imp_3", tenant_id: "ten_imperial", category_name: "Skin Treatment", name: "Charcoal Detan Face Therapy", description: "Active charcoal deep-pore cleansing peel and cooling aloe-vera compress to reverse sun damage and pollution.", price: 600, duration_minutes: 30, status: "active", is_featured: false },
    { id: "ser_imp_4", tenant_id: "ten_imperial", category_name: "Hair Care", name: "Anti-Dandruff Royal Hair Spa", description: "Nourishing scalp massage with therapeutic oils, protein hair mask, and deep steam hydration treatment.", price: 1200, duration_minutes: 50, status: "active", is_featured: true },
    
    // Zen
    { id: "ser_zen_1", tenant_id: "ten_zen", category_name: "Massage", name: "Authentic Thai Full Body Therapy", description: "Ancient dry-stretching massage focusing on pressure points to unlock tight joints and increase flexibility.", price: 2400, duration_minutes: 90, image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=200", status: "active", is_featured: true },
    { id: "ser_zen_2", tenant_id: "ten_zen", category_name: "Massage", name: "Swedish Deep Stress-Relief", description: "Fluid, circular kneading with hot essential oils targeting deep muscle fatigue to trigger intense relaxation.", price: 2200, duration_minutes: 75, image_url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=200", status: "active", is_featured: true },
    { id: "ser_zen_3", tenant_id: "ten_zen", category_name: "Facial", name: "Calming Aromatherapy Facial", description: "Gentle natural facial with lavender extracts and cooling pack to hydrate sensitive skin and clear fatigue.", price: 1500, duration_minutes: 60, status: "active", is_featured: false }
  ];

  // Staff
  const staff: Staff[] = [
    { id: "stf_aura_1", tenant_id: "ten_aura", name: "Priya Sharma", role: "Master Aesthetician", specialty: ["Bridal Makeups", "Facials"], photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150", rating: 4.95, experience_years: 8 },
    { id: "stf_aura_2", tenant_id: "ten_aura", name: "Rahul Verma", role: "Art Director", specialty: ["Hair Coloring", "Hair Keratin"], photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150", rating: 4.88, experience_years: 11 },
    { id: "stf_imp_1", tenant_id: "ten_imperial", name: "Vikram Singh", role: "Lead Barber Maestro", specialty: ["Beard Sculpting", "Haircuts"], photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150", rating: 4.9, experience_years: 9 },
    { id: "stf_imp_2", tenant_id: "ten_imperial", name: "Amit Yadav", role: "Beard Architect", specialty: ["Hot Towel Shave", "Detan"], photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150", rating: 4.75, experience_years: 5 },
    { id: "stf_zen_1", tenant_id: "ten_zen", name: "Ananya Thaimassage", role: "Senior Holistic Therapist", specialty: ["Thai Massage", "Deep Tissue"], photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150", rating: 4.98, experience_years: 12 }
  ];

  // Customers
  const customers: Customer[] = [
    { id: "cus_1", tenant_id: "ten_aura", full_name: "Sunita Khanna", phone: "9829012345", email: "sunita@gmail.com", status: "active", crm_tags: ["Regular", "VIP"], created_at: seedTime },
    { id: "cus_2", tenant_id: "ten_imperial", full_name: "Rajesh Shrivastav", phone: "9414098765", email: "rajesh@gmail.com", status: "active", crm_tags: ["VIP"], created_at: seedTime },
    { id: "cus_3", tenant_id: "ten_zen", full_name: "Meera Nair", phone: "9660124578", status: "active", crm_tags: ["New"], created_at: seedTime }
  ];

  // Appointments
  const appointments: Appointment[] = [
    {
      id: "apt_1",
      tenant_id: "ten_aura",
      customer_id: "cus_1",
      service_id: "ser_aura_4",
      staff_id: "stf_aura_2",
      appointment_date: "2026-07-08",
      appointment_time: "11:30 AM",
      total_amount: 950,
      advance_amount: 237.5,
      remaining_amount: 712.5,
      status: AppointmentStatus.CONFIRMED,
      payment_status: PaymentStatus.ADVANCE_PAID,
      customer_name: "Sunita Khanna",
      customer_phone: "9829012345",
      notes: "Please wash hair with cold water.",
      created_at: seedTime
    },
    {
      id: "apt_2",
      tenant_id: "ten_imperial",
      customer_id: "cus_2",
      service_id: "ser_imp_1",
      staff_id: "stf_imp_1",
      appointment_date: "2026-07-08",
      appointment_time: "04:00 PM",
      total_amount: 450,
      advance_amount: 112.5,
      remaining_amount: 337.5,
      status: AppointmentStatus.PENDING_PAYMENT,
      payment_status: PaymentStatus.ADVANCE_PENDING,
      customer_name: "Rajesh Shrivastav",
      customer_phone: "9414098765",
      created_at: seedTime
    }
  ];

  // Reviews
  const reviews: Review[] = [
    { id: "rev_1", tenant_id: "ten_aura", customer_name: "Simran J.", rating: 5, comment: "Hands down the best bridal makeover experience. Priya is extremely talented and made sure my wedding look was absolutely flawless! Thank you!", date: "2026-06-15" },
    { id: "rev_2", tenant_id: "ten_aura", customer_name: "Rohan G.", rating: 5, comment: "Very professional hair blowout. The salon has an incredible luxury vibe and the hygiene is top-notch.", date: "2026-06-28" },
    { id: "rev_3", tenant_id: "ten_imperial", customer_name: "Divyansh M.", rating: 5, comment: "Fabulous hot towel straight razor shave. Vikram has steady hands. Highly recommended for premium beard grooming.", date: "2026-07-01" },
    { id: "rev_4", tenant_id: "ten_zen", customer_name: "Anjali S.", rating: 5, comment: "The dry Thai massage completely relieved my lower back stiffness. Pure professional bliss. The sage tea was perfect.", date: "2026-07-03" }
  ];

  // Wallets
  const wallets: Wallet[] = [
    { id: "wal_aura", owner_id: "usr_owner_aura", owner_type: "tenant", available_balance: 4800, pending_balance: 712.5, lifetime_earned: 15400 },
    { id: "wal_imperial", owner_id: "usr_owner_imperial", owner_type: "tenant", available_balance: 1450, pending_balance: 337.5, lifetime_earned: 5200 },
    { id: "wal_zen", owner_id: "usr_owner_zen", owner_type: "tenant", available_balance: 3200, pending_balance: 0, lifetime_earned: 12400 },
    { id: "wal_partner_jaipur", owner_id: "usr_partner_jaipur", owner_type: "partner", available_balance: 850, pending_balance: 150, lifetime_earned: 2450 }
  ];

  // Transactions (Real ledgers)
  const transactions: WalletTransaction[] = [
    { id: "tx_1", wallet_id: "wal_aura", amount: 237.5, type: "credit", purpose: "booking_advance", status: "completed", reference_id: "apt_1", description: "Advance deposit received for Royal Haircut", created_at: seedTime },
    { id: "tx_2", wallet_id: "wal_partner_jaipur", amount: 150, type: "credit", purpose: "commission", status: "completed", reference_id: "apt_1", description: "Partner 10% activation commission - Aura Premium Salon", created_at: seedTime }
  ];

  // Daily payouts logs
  const payouts: Payout[] = [
    { id: "pay_1", wallet_id: "wal_aura", amount: 4800, payout_time: "2026-07-06T22:00:00.000Z", status: "completed", ledger_hash: "0x89fd10b27efdae11a687efc9022ee", created_at: "2026-07-06T22:05:00-07:00" },
    { id: "pay_2", wallet_id: "wal_imperial", amount: 1450, payout_time: "2026-07-06T22:00:00.000Z", status: "completed", ledger_hash: "0xcd389f410badde1127eef89aa022ff", created_at: "2026-07-06T22:05:00-07:00" }
  ];

  // Partners
  const partners: Partner[] = [
    {
      id: "usr_partner_jaipur",
      user_id: "usr_partner_jaipur",
      full_name: "Sanjay Singhal",
      phone: "+91 94140 11111",
      referral_code: "JAIPUR100",
      district: "Jaipur (East)",
      status: "active",
      created_at: seedTime
    }
  ];

  // Brand Profiles & Distributors
  const brand_profiles: BrandProfile[] = [
    { id: "brnd_loreal", user_id: "usr_brand_loreal", company_name: "L'Oreal Professional", description: "The global leader in professional hair styling and scientific hair care formulations.", categories: ["Hair Color", "Hair Care", "Styling Products"], contact_email: "pro@loreal.in", contact_phone: "+91 22 4000 5000", status: "approved" },
    { id: "brnd_wella", user_id: "usr_brand_wella", company_name: "Wella Professionals", description: "Brings color creativity and scalp wellness products directly to premium salons.", categories: ["Hair Color", "Hair Care"], contact_email: "support@wella.com", contact_phone: "+91 11 3989 2989", status: "approved" }
  ];

  const distributor_profiles: DistributorProfile[] = [
    { id: "dist_raj_beauty", user_id: "usr_dist_raj", company_name: "Rajasthan Beauty Emporium", description: "Authorized premium distributor for North India, supplying wholesale hair, facial and spa inventory to 350+ certified venues.", coverage_areas: ["Jaipur", "Jodhpur", "Ajmer", "Udaipur"], brand_associations: ["L'Oreal Professional", "Wella Professionals", "Biotique"], contact_email: "sales@rajbeauty.com", contact_phone: "+91 141 2309876", status: "approved" }
  ];

  const brand_products: BrandProduct[] = [
    { id: "prd_loreal_1", brand_id: "brnd_loreal", name: "Majirel Hair Color Cream 50ml", category: "Hair Color", description: "Permanent hair color providing rich, deep, and uniform color payoff with perfect gray coverage.", benefits: "Long lasting shine, fiber care", mrp: 450, image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=200", is_sponsored: true },
    { id: "prd_loreal_2", brand_id: "brnd_loreal", name: "Serie Expert Absolut Repair Shampoo 300ml", category: "Hair Care", description: "Deeply reconstructive golden shampoo for instantly restructured damaged hair fibers.", benefits: "Reduces damage by 77%, non-weigh down", mrp: 750, image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=200", is_sponsored: false },
    { id: "prd_wella_1", brand_id: "brnd_wella", name: "Wella Kolestint Developer 1000ml", category: "Hair Color", description: "Professional salon-grade cream activator designed for reliable and seamless mixing.", benefits: "Perfect consistency, homogeneous coloring", mrp: 1250, is_sponsored: true }
  ];

  const brand_leads: BrandLead[] = [
    { id: "ld_1", brand_or_distributor_id: "brnd_loreal", inquirer_name: "Aura Premium Salon", inquirer_company: "Aura Salon", inquirer_phone: "+919876543210", inquirer_email: "aura@nexora.io", notes: "Need quotation for bulk order of Majirel shade 5.3.", status: "new", created_at: seedTime }
  ];

  // Jobs Module
  const job_candidates: JobCandidate[] = [
    { id: "cand_1", user_id: "usr_cand_1", full_name: "Manish Solanki", email: "manish.styles@gmail.com", phone: "+91 91160 55555", skills: ["Beard Shaving", "Hair Cutting", "Hair Tattooing"], experience_years: 4, preferred_location: "Jaipur (C-Scheme)", created_at: seedTime }
  ];

  const job_posts: JobPost[] = [
    { id: "job_1", tenant_id: "ten_imperial", title: "Senior Gentleman Stylist", category: "Barbers", description: "Seeking a professional stylist proficient in razor lining, hot towel royal shaves, and trending hair designs.", salary_range: "Rs. 25,000 - 35,000 / month", job_type: "Full-time", location: "C-Scheme, Jaipur", status: "active", created_at: seedTime },
    { id: "job_2", tenant_id: "ten_aura", title: "Professional Bridal Makeup Artist", category: "Makeup Artists", description: "Looking for an expert makeup artist with solid HD airbrush work and active bridal portfolio.", salary_range: "Rs. 30,000 - 50,000 / month", job_type: "Commission-based", location: "Malviya Nagar, Jaipur", status: "active", created_at: seedTime }
  ];

  const job_applications: JobApplication[] = [
    { id: "appl_1", job_post_id: "job_1", candidate_id: "cand_1", status: "applied", created_at: seedTime }
  ];

  return {
    profiles: [],
    tenants,
    website_templates,
    tenant_websites,
    services,
    staff,
    customers,
    appointments,
    reviews,
    wallets,
    transactions,
    payouts,
    partners,
    brand_profiles,
    distributor_profiles,
    brand_products,
    brand_leads,
    job_candidates,
    job_posts,
    job_applications,
    audit_logs: []
  };
}

// REST API Routes
// -----------------------------------------------------------------------------

// DB Endpoint
app.get("/api/db", (req, res) => {
  const db = loadDB();
  res.json(db);
});

// Reset database
app.post("/api/db/reset", (req, res) => {
  const fresh = getSeededData();
  saveDB(fresh);
  res.json({ success: true, message: "Database re-seeded successfully." });
});

// Tenants
app.get("/api/tenants", (req, res) => {
  const db = loadDB();
  res.json(db.tenants);
});

app.post("/api/tenants", (req, res) => {
  const db = loadDB();
  const newTenant: Tenant = {
    id: "ten_" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    approval_status: "pending", // super admin will approve
    is_active: true,
    rating: 5.0,
    reviews_count: 0,
    is_verified: false,
    starting_price: 300,
    ...req.body
  };

  db.tenants.push(newTenant);

  // Initialize a wallet for this new shop owner
  const newWallet: Wallet = {
    id: "wal_" + newTenant.id,
    owner_id: newTenant.owner_id || "usr_owner_generic",
    owner_type: "tenant",
    available_balance: 0,
    pending_balance: 0,
    lifetime_earned: 0
  };
  db.wallets.push(newWallet);

  // Initialize website placeholder
  const newWebsite: TenantWebsite = {
    id: "web_" + newTenant.id,
    tenant_id: newTenant.id,
    template_id: "tpl_luxury", // Default template
    slug: newTenant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    website_title: `${newTenant.name} | ${newTenant.area}`,
    hero_title: `Welcome to ${newTenant.name}`,
    hero_subtitle: "Your premier destination for luxury grooming and beauty experiences.",
    about_text: `${newTenant.name} offers premium services in ${newTenant.area}, Jaipur. Experience our skilled touch and professional care.`,
    phone: newTenant.phone,
    whatsapp_number: newTenant.phone.replace(/[^0-9]/g, ""),
    email: newTenant.email,
    address: newTenant.address,
    section_visibility: {
      hero: true,
      services: true,
      gallery: true,
      reviews: true,
      location: true,
      contact: true,
      offers: true
    },
    is_published: false
  };
  db.tenant_websites.push(newWebsite);

  // Auto-seed a few default services for this tenant
  const defaultServices: Service[] = [
    {
      id: "ser_" + Math.random().toString(36).substring(2, 9),
      tenant_id: newTenant.id,
      category_name: "Grooming",
      name: "Classic Haircut",
      description: "Standard style cut and neck wash.",
      price: 300,
      duration_minutes: 30,
      status: "active",
      is_featured: true
    }
  ];
  db.services.push(...defaultServices);

  saveDB(db);
  res.json({ success: true, tenant: newTenant, website: newWebsite });
});

app.put("/api/tenants/:id", (req, res) => {
  const db = loadDB();
  const idx = db.tenants.findIndex(t => t.id === req.params.id);
  if (idx !== -1) {
    db.tenants[idx] = {
      ...db.tenants[idx],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    saveDB(db);
    res.json({ success: true, tenant: db.tenants[idx] });
  } else {
    res.status(404).json({ error: "Tenant not found" });
  }
});

// Websites
app.get("/api/tenant-websites", (req, res) => {
  const db = loadDB();
  res.json(db.tenant_websites);
});

app.get("/api/tenant-websites/by-slug/:slug", (req, res) => {
  const db = loadDB();
  const web = db.tenant_websites.find(w => w.slug === req.params.slug);
  if (web) {
    // Find associated tenant
    const tenant = db.tenants.find(t => t.id === web.tenant_id);
    const services = db.services.filter(s => s.tenant_id === web.tenant_id && s.status === 'active');
    const staffMembers = db.staff.filter(st => st.tenant_id === web.tenant_id);
    const shopReviews = db.reviews.filter(r => r.tenant_id === web.tenant_id);

    res.json({
      website: web,
      tenant,
      services,
      staff: staffMembers,
      reviews: shopReviews
    });
  } else {
    res.status(404).json({ error: "Website slug not found" });
  }
});

app.put("/api/tenant-websites/:id", (req, res) => {
  const db = loadDB();
  const idx = db.tenant_websites.findIndex(w => w.id === req.params.id);
  if (idx !== -1) {
    // Check if slug is unique
    const newSlug = req.body.slug;
    if (newSlug && newSlug !== db.tenant_websites[idx].slug) {
      const isTaken = db.tenant_websites.some((w, i) => i !== idx && w.slug === newSlug);
      if (isTaken) {
        return res.status(400).json({ error: "Slug is already taken by another salon." });
      }
    }

    db.tenant_websites[idx] = {
      ...db.tenant_websites[idx],
      ...req.body
    };
    saveDB(db);
    res.json({ success: true, website: db.tenant_websites[idx] });
  } else {
    res.status(404).json({ error: "Website settings not found" });
  }
});

// Services
app.get("/api/services", (req, res) => {
  const db = loadDB();
  const tenantId = req.query.tenant_id as string;
  if (tenantId) {
    res.json(db.services.filter(s => s.tenant_id === tenantId && !s.deleted_at));
  } else {
    res.json(db.services.filter(s => !s.deleted_at));
  }
});

app.post("/api/services", (req, res) => {
  const db = loadDB();
  const newService: Service = {
    id: "ser_" + Math.random().toString(36).substring(2, 9),
    status: "active",
    is_featured: false,
    ...req.body
  };
  db.services.push(newService);

  // Update tenant starting price
  const tenantServices = db.services.filter(s => s.tenant_id === newService.tenant_id && !s.deleted_at && s.status === 'active');
  const prices = tenantServices.map(s => s.price);
  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const tIdx = db.tenants.findIndex(t => t.id === newService.tenant_id);
    if (tIdx !== -1) {
      db.tenants[tIdx].starting_price = minPrice;
    }
  }

  saveDB(db);
  res.json({ success: true, service: newService });
});

app.put("/api/services/:id", (req, res) => {
  const db = loadDB();
  const idx = db.services.findIndex(s => s.id === req.params.id);
  if (idx !== -1) {
    db.services[idx] = {
      ...db.services[idx],
      ...req.body
    };

    // Update tenant starting price
    const tenantId = db.services[idx].tenant_id;
    const tenantServices = db.services.filter(s => s.tenant_id === tenantId && !s.deleted_at && s.status === 'active');
    const prices = tenantServices.map(s => s.price);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const tIdx = db.tenants.findIndex(t => t.id === tenantId);
      if (tIdx !== -1) {
        db.tenants[tIdx].starting_price = minPrice;
      }
    }

    saveDB(db);
    res.json({ success: true, service: db.services[idx] });
  } else {
    res.status(404).json({ error: "Service not found" });
  }
});

// Staff
app.get("/api/staff", (req, res) => {
  const db = loadDB();
  const tenantId = req.query.tenant_id as string;
  if (tenantId) {
    res.json(db.staff.filter(s => s.tenant_id === tenantId));
  } else {
    res.json(db.staff);
  }
});

app.post("/api/staff", (req, res) => {
  const db = loadDB();
  const newStaff: Staff = {
    id: "stf_" + Math.random().toString(36).substring(2, 9),
    rating: 5.0,
    experience_years: 2,
    specialty: req.body.specialty || [],
    ...req.body
  };
  db.staff.push(newStaff);
  saveDB(db);
  res.json({ success: true, staff: newStaff });
});

// Bookings / Appointments
app.get("/api/appointments", (req, res) => {
  const db = loadDB();
  const tenantId = req.query.tenant_id as string;
  const customerPhone = req.query.customer_phone as string;
  
  if (tenantId) {
    res.json(db.appointments.filter(a => a.tenant_id === tenantId));
  } else if (customerPhone) {
    res.json(db.appointments.filter(a => a.customer_phone === customerPhone));
  } else {
    res.json(db.appointments);
  }
});

app.post("/api/public-booking/create", (req, res) => {
  const db = loadDB();
  const { tenant_id, service_id, staff_id, appointment_date, appointment_time, customer_name, customer_phone, notes } = req.body;

  if (!tenant_id || !service_id || !customer_name || !customer_phone) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  // Get service details
  const service = db.services.find(s => s.id === service_id);
  if (!service) {
    return res.status(404).json({ error: "Service not found" });
  }

  // Find or create customer
  let customer = db.customers.find(c => c.tenant_id === tenant_id && c.phone === customer_phone);
  if (!customer) {
    customer = {
      id: "cus_" + Math.random().toString(36).substring(2, 9),
      tenant_id,
      full_name: customer_name,
      phone: customer_phone,
      status: "active",
      crm_tags: ["New"],
      created_at: new Date().toISOString()
    };
    db.customers.push(customer);
  } else {
    // Tag existing customers who book again
    if (customer.crm_tags && !customer.crm_tags.includes("Regular")) {
      customer.crm_tags.push("Regular");
    }
  }

  const total_amount = service.price;
  // Rule: Advance is 25%, remaining is 75%
  const advance_amount = total_amount * 0.25;
  const remaining_amount = total_amount * 0.75;

  const newAppointment: Appointment = {
    id: "apt_" + Math.random().toString(36).substring(2, 9),
    tenant_id,
    customer_id: customer.id,
    service_id,
    staff_id,
    appointment_date,
    appointment_time,
    total_amount,
    advance_amount,
    remaining_amount,
    status: AppointmentStatus.PENDING_PAYMENT,
    payment_status: PaymentStatus.ADVANCE_PENDING,
    customer_name,
    customer_phone,
    notes,
    created_at: new Date().toISOString()
  };

  db.appointments.push(newAppointment);

  // Add ledger audit logs
  db.audit_logs.push({
    id: "aud_" + Math.random().toString(36).substring(2, 9),
    event: "booking_created",
    tenant_id,
    reference_id: newAppointment.id,
    description: `Booking created for ${customer_name} (Phone: ${customer_phone}) for service "${service.name}". Total: Rs. ${total_amount}, Advance Req: Rs. ${advance_amount}.`,
    created_at: new Date().toISOString()
  });

  saveDB(db);
  res.json({ success: true, appointment: newAppointment });
});

app.put("/api/appointments/:id", (req, res) => {
  const db = loadDB();
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx !== -1) {
    const oldApt = db.appointments[idx];
    const newStatus = req.body.status as AppointmentStatus;
    const newPayStatus = req.body.payment_status as PaymentStatus;
    
    db.appointments[idx] = {
      ...oldApt,
      ...req.body
    };

    // Wallet transaction trigger on verification
    // 10% platform fee rule, 15% QR reward points
    if (newPayStatus === PaymentStatus.ADVANCE_PAID && oldApt.payment_status !== PaymentStatus.ADVANCE_PAID) {
      // Create ledger credit transaction in owner wallet
      const ownerTenant = db.tenants.find(t => t.id === oldApt.tenant_id);
      if (ownerTenant) {
        const wallet = db.wallets.find(w => w.owner_id === ownerTenant.owner_id);
        if (wallet) {
          // Increment pending balance with advance amount
          wallet.pending_balance += oldApt.advance_amount;
          wallet.lifetime_earned += oldApt.advance_amount;

          db.transactions.push({
            id: "tx_" + Math.random().toString(36).substring(2, 9),
            wallet_id: wallet.id,
            amount: oldApt.advance_amount,
            type: "credit",
            purpose: "booking_advance",
            status: "completed",
            reference_id: oldApt.id,
            description: `Advance deposit (Nexora QR verified) of Rs. ${oldApt.advance_amount} for appointment ${oldApt.id}`,
            created_at: new Date().toISOString()
          });

          // 15% Customer Benefit Reward Record on QR Payment
          const cashbackEarned = oldApt.advance_amount * 0.15;
          addCustomerCashback(db, oldApt.tenant_id, oldApt.customer_phone, cashbackEarned, `15% Nexora QR Reward Benefit on Advance Deposit for Booking #${oldApt.id}`);
          db.appointments[idx].customer_cashback_earned = parseFloat(((db.appointments[idx].customer_cashback_earned || 0) + cashbackEarned).toFixed(2));
        }
      }
    }

    // Complete transaction flow
    if (newStatus === AppointmentStatus.COMPLETED && oldApt.status !== AppointmentStatus.COMPLETED) {
      const ownerTenant = db.tenants.find(t => t.id === oldApt.tenant_id);
      if (ownerTenant) {
        const wallet = db.wallets.find(w => w.owner_id === ownerTenant.owner_id);
        if (wallet) {
          // Add remaining amount, move pending to available
          const isAdvancePaid = oldApt.payment_status === PaymentStatus.ADVANCE_PAID || db.appointments[idx].payment_status === PaymentStatus.ADVANCE_PAID;
          if (isAdvancePaid) {
            wallet.pending_balance = Math.max(0, wallet.pending_balance - oldApt.advance_amount);
          }
          wallet.available_balance += oldApt.total_amount; // Standard salon cashout
          
          // Apply Nexora's 10% Platform fee cut on complete transaction
          const platformFeeCut = oldApt.total_amount * 0.10;
          wallet.available_balance -= platformFeeCut;

          db.transactions.push({
            id: "tx_" + Math.random().toString(36).substring(2, 9),
            wallet_id: wallet.id,
            amount: oldApt.total_amount - platformFeeCut,
            type: "credit",
            purpose: "booking_payment",
            status: "completed",
            reference_id: oldApt.id,
            description: `Completed checkout for booking ${oldApt.id}. Platform 10% success commission fee (-Rs. ${platformFeeCut.toFixed(2)}) applied.`,
            created_at: new Date().toISOString()
          });

          // Credit customer cashback (15% on remaining or full amount)
          const cashbackRemaining = isAdvancePaid ? (oldApt.remaining_amount * 0.15) : (oldApt.total_amount * 0.15);
          addCustomerCashback(db, oldApt.tenant_id, oldApt.customer_phone, cashbackRemaining, `15% Nexora QR Reward Benefit on Checkout for Booking #${oldApt.id}`);
          db.appointments[idx].customer_cashback_earned = parseFloat(((db.appointments[idx].customer_cashback_earned || 0) + cashbackRemaining).toFixed(2));

          // Check if there is a Growth Partner who referred this shop
          // Partner commission ladder: 10% of Nexora revenue (first 6 months)
          // Nexora's revenue from this is platformFeeCut. Partner gets 10% of platformFeeCut.
          const partnerComm = platformFeeCut * 0.10; 
          const partnerWallet = db.wallets.find(w => w.owner_type === "partner");
          if (partnerWallet) {
            partnerWallet.available_balance += partnerComm;
            db.transactions.push({
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              wallet_id: partnerWallet.id,
              amount: partnerComm,
              type: "credit",
              purpose: "commission",
              status: "completed",
              reference_id: oldApt.id,
              description: `Growth Partner 10% commission credited on Nexora platform collection.`,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    }

    recalculateRankings(db);
    saveDB(db);
    res.json({ success: true, appointment: db.appointments[idx] });
  } else {
    res.status(404).json({ error: "Appointment not found" });
  }
});

app.post("/api/appointments/:id/submit-verification", (req, res) => {
  const db = loadDB();
  const { proof_code, is_advance } = req.body;
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx !== -1) {
    const apt = db.appointments[idx];
    apt.verification_proof_code = proof_code;
    apt.verification_submitted_at = new Date().toISOString();
    
    if (is_advance) {
      apt.payment_status = PaymentStatus.ADVANCE_PENDING_VERIFICATION;
    } else {
      apt.payment_status = PaymentStatus.FULL_PENDING_VERIFICATION;
    }

    db.audit_logs.push({
      id: "aud_" + Math.random().toString(36).substring(2, 9),
      event: "payment_verification_submitted",
      tenant_id: apt.tenant_id,
      reference_id: apt.id,
      description: `Payment verification submitted by customer with proof UPI ID/UTR ${proof_code}. Amount: Rs. ${is_advance ? apt.advance_amount : apt.total_amount}.`,
      created_at: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true, appointment: apt });
  } else {
    res.status(404).json({ error: "Appointment not found" });
  }
});

app.post("/api/appointments/:id/dispute", (req, res) => {
  const db = loadDB();
  const { dispute_reason } = req.body;
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx !== -1) {
    const apt = db.appointments[idx];
    apt.is_disputed = true;
    apt.dispute_reason = dispute_reason;
    apt.dispute_status = 'open';

    db.audit_logs.push({
      id: "aud_" + Math.random().toString(36).substring(2, 9),
      event: "dispute_raised",
      tenant_id: apt.tenant_id,
      reference_id: apt.id,
      description: `Dispute raised on appointment ${apt.id} by customer. Reason: "${dispute_reason}".`,
      created_at: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true, appointment: apt });
  } else {
    res.status(404).json({ error: "Appointment not found" });
  }
});

app.post("/api/appointments/:id/resolve-dispute", (req, res) => {
  const db = loadDB();
  const { resolution } = req.body; // 'refunded' | 'rejected'
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx !== -1) {
    const apt = db.appointments[idx];
    apt.is_disputed = false;
    apt.dispute_status = resolution === 'refunded' ? 'refunded' : 'rejected';

    if (resolution === 'refunded') {
      apt.status = AppointmentStatus.CANCELLED;
      const originalPayStatus = apt.payment_status;
      apt.payment_status = PaymentStatus.REFUNDED;

      // Debit refund from Salon Owner wallet
      const tenant = db.tenants.find(t => t.id === apt.tenant_id);
      if (tenant) {
        const wallet = db.wallets.find(w => w.owner_id === tenant.owner_id);
        if (wallet) {
          // If they paid full or advance, refund what they paid
          let refundAmount = 0;
          if (originalPayStatus === PaymentStatus.PAID_IN_FULL || originalPayStatus === PaymentStatus.FULL_PENDING_VERIFICATION) {
            refundAmount = apt.total_amount;
            wallet.available_balance = Math.max(0, wallet.available_balance - (refundAmount * 0.90)); // Owner paid 90% of total
          } else {
            refundAmount = apt.advance_amount;
            wallet.pending_balance = Math.max(0, wallet.pending_balance - refundAmount);
          }

          db.transactions.push({
            id: "tx_" + Math.random().toString(36).substring(2, 9),
            wallet_id: wallet.id,
            amount: refundAmount,
            type: "debit",
            purpose: "refund",
            status: "completed",
            reference_id: apt.id,
            description: `Dispute Refund processed: Rs. ${refundAmount} debited from wallet due to dispute on booking ${apt.id}`,
            created_at: new Date().toISOString()
          });
        }
      }

      // Deduct Customer cashback if any
      const customer = db.customers.find(c => c.tenant_id === apt.tenant_id && c.phone === apt.customer_phone);
      if (customer && customer.cashback_balance && apt.customer_cashback_earned) {
        customer.cashback_balance = Math.max(0, parseFloat((customer.cashback_balance - apt.customer_cashback_earned).toFixed(2)));
        if (!customer.cashback_earned_history) customer.cashback_earned_history = [];
        customer.cashback_earned_history.push({
          id: "cb_" + Math.random().toString(36).substring(2, 9),
          amount: -apt.customer_cashback_earned,
          date: new Date().toISOString(),
          description: `Deduction of QR Reward Cashback due to dispute refund of Booking #${apt.id}`
        });
      }
    }

    db.audit_logs.push({
      id: "aud_" + Math.random().toString(36).substring(2, 9),
      event: "dispute_resolved",
      tenant_id: apt.tenant_id,
      reference_id: apt.id,
      description: `Dispute on appointment ${apt.id} resolved: "${resolution.toUpperCase()}".`,
      created_at: new Date().toISOString()
    });

    recalculateRankings(db);
    saveDB(db);
    res.json({ success: true, appointment: apt });
  } else {
    res.status(404).json({ error: "Appointment not found" });
  }
});

// Customers list per shop
app.get("/api/customers", (req, res) => {
  const db = loadDB();
  const tenantId = req.query.tenant_id as string;
  if (tenantId) {
    res.json(db.customers.filter(c => c.tenant_id === tenantId));
  } else {
    res.json(db.customers);
  }
});

// Reviews
app.post("/api/reviews", (req, res) => {
  const db = loadDB();
  const newReview: Review = {
    id: "rev_" + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split('T')[0],
    ...req.body
  };
  db.reviews.push(newReview);

  // Recalculate tenant rating
  const shopReviews = db.reviews.filter(r => r.tenant_id === newReview.tenant_id);
  const avg = shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length;
  const tIdx = db.tenants.findIndex(t => t.id === newReview.tenant_id);
  if (tIdx !== -1) {
    db.tenants[tIdx].rating = parseFloat(avg.toFixed(1));
    db.tenants[tIdx].reviews_count = shopReviews.length;
  }

  saveDB(db);
  res.json({ success: true, review: newReview });
});

// Wallet Operations
app.get("/api/wallets", (req, res) => {
  const db = loadDB();
  const ownerId = req.query.owner_id as string;
  if (ownerId) {
    res.json(db.wallets.filter(w => w.owner_id === ownerId));
  } else {
    res.json(db.wallets);
  }
});

app.get("/api/transactions", (req, res) => {
  const db = loadDB();
  const walletId = req.query.wallet_id as string;
  if (walletId) {
    res.json(db.transactions.filter(t => t.wallet_id === walletId).sort((a,b) => b.created_at.localeCompare(a.created_at)));
  } else {
    res.json(db.transactions);
  }
});

app.get("/api/payouts", (req, res) => {
  const db = loadDB();
  res.json(db.payouts.sort((a,b) => b.created_at.localeCompare(a.created_at)));
});

// Daily 10:00 PM Owner Settlement Engine Mock Trigger
app.post("/api/wallets/trigger-daily-payouts", (req, res) => {
  const db = loadDB();
  const now = new Date();
  const createdPayouts: Payout[] = [];

  db.wallets.forEach(wallet => {
    if (wallet.available_balance > 0 && wallet.owner_type === "tenant") {
      const payoutAmount = wallet.available_balance;
      wallet.available_balance = 0; // Cleared

      const newPayout: Payout = {
        id: "pay_" + Math.random().toString(36).substring(2, 9),
        wallet_id: wallet.id,
        amount: payoutAmount,
        payout_time: new Date(now.setHours(22, 0, 0, 0)).toISOString(),
        status: "completed",
        ledger_hash: "0x" + Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15),
        created_at: new Date().toISOString()
      };

      db.payouts.push(newPayout);
      createdPayouts.push(newPayout);

      db.transactions.push({
        id: "tx_" + Math.random().toString(36).substring(2, 9),
        wallet_id: wallet.id,
        amount: payoutAmount,
        type: "debit",
        purpose: "payout",
        status: "completed",
        reference_id: newPayout.id,
        description: `Daily settlement credit automated sweep to bank ledger.`,
        created_at: new Date().toISOString()
      });
    }
  });

  if (createdPayouts.length > 0) {
    saveDB(db);
  }

  res.json({ success: true, count: createdPayouts.length, payouts: createdPayouts });
});

// Partners API
app.get("/api/partners", (req, res) => {
  const db = loadDB();
  res.json(db.partners);
});

app.post("/api/partners", (req, res) => {
  const db = loadDB();
  const newPartner: Partner = {
    id: "usr_partner_" + Math.random().toString(36).substring(2, 9),
    user_id: "usr_partner_" + Math.random().toString(36).substring(2, 9),
    referral_code: "REF" + Math.random().toString(36).substring(2, 6).toUpperCase(),
    status: "pending",
    created_at: new Date().toISOString(),
    ...req.body
  };

  db.partners.push(newPartner);

  // Set up partner wallet
  const partnerWallet: Wallet = {
    id: "wal_" + newPartner.id,
    owner_id: newPartner.user_id,
    owner_type: "partner",
    available_balance: 0,
    pending_balance: 0,
    lifetime_earned: 0
  };
  db.wallets.push(partnerWallet);

  saveDB(db);
  res.json({ success: true, partner: newPartner });
});

// Distributor & Brands Portal
app.get("/api/brands", (req, res) => {
  const db = loadDB();
  res.json(db.brand_profiles);
});

app.post("/api/brands", (req, res) => {
  const db = loadDB();
  const newBrand: BrandProfile = {
    id: "brnd_" + Math.random().toString(36).substring(2, 9),
    user_id: "usr_brand_" + Math.random().toString(36).substring(2, 9),
    status: "pending",
    ...req.body
  };
  db.brand_profiles.push(newBrand);
  saveDB(db);
  res.json({ success: true, brand: newBrand });
});

app.get("/api/distributors", (req, res) => {
  const db = loadDB();
  res.json(db.distributor_profiles);
});

app.post("/api/distributors", (req, res) => {
  const db = loadDB();
  const newDist: DistributorProfile = {
    id: "dist_" + Math.random().toString(36).substring(2, 9),
    user_id: "usr_dist_" + Math.random().toString(36).substring(2, 9),
    status: "pending",
    ...req.body
  };
  db.distributor_profiles.push(newDist);
  saveDB(db);
  res.json({ success: true, distributor: newDist });
});

app.get("/api/brand-products", (req, res) => {
  const db = loadDB();
  res.json(db.brand_products);
});

app.post("/api/brand-products", (req, res) => {
  const db = loadDB();
  const newProd: BrandProduct = {
    id: "prd_" + Math.random().toString(36).substring(2, 9),
    is_sponsored: false,
    ...req.body
  };
  db.brand_products.push(newProd);
  saveDB(db);
  res.json({ success: true, product: newProd });
});

app.get("/api/brand-leads", (req, res) => {
  const db = loadDB();
  res.json(db.brand_leads);
});

app.post("/api/brand-leads", (req, res) => {
  const db = loadDB();
  const newLead: BrandLead = {
    id: "ld_" + Math.random().toString(36).substring(2, 9),
    status: "new",
    created_at: new Date().toISOString(),
    ...req.body
  };
  db.brand_leads.push(newLead);
  saveDB(db);
  res.json({ success: true, lead: newLead });
});

// Jobs API
app.get("/api/jobs/posts", (req, res) => {
  const db = loadDB();
  res.json(db.job_posts);
});

app.post("/api/jobs/posts", (req, res) => {
  const db = loadDB();
  const newPost: JobPost = {
    id: "job_" + Math.random().toString(36).substring(2, 9),
    status: "active",
    created_at: new Date().toISOString(),
    ...req.body
  };
  db.job_posts.push(newPost);
  saveDB(db);
  res.json({ success: true, job: newPost });
});

app.get("/api/jobs/candidates", (req, res) => {
  const db = loadDB();
  res.json(db.job_candidates);
});

app.post("/api/jobs/candidates", (req, res) => {
  const db = loadDB();
  const newCand: JobCandidate = {
    id: "cand_" + Math.random().toString(36).substring(2, 9),
    user_id: req.body.user_id || "usr_cand_" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    ...req.body
  };
  db.job_candidates.push(newCand);
  saveDB(db);
  res.json({ success: true, candidate: newCand });
});

app.get("/api/jobs/applications", (req, res) => {
  const db = loadDB();
  res.json(db.job_applications);
});

app.post("/api/jobs/applications", (req, res) => {
  const db = loadDB();
  const newApp: JobApplication = {
    id: "appl_" + Math.random().toString(36).substring(2, 9),
    status: "applied",
    created_at: new Date().toISOString(),
    ...req.body
  };
  db.job_applications.push(newApp);
  saveDB(db);
  res.json({ success: true, application: newApp });
});

app.put("/api/jobs/applications/:id", (req, res) => {
  const db = loadDB();
  const idx = db.job_applications.findIndex(a => a.id === req.params.id);
  if (idx !== -1) {
    db.job_applications[idx].status = req.body.status;
    saveDB(db);
    res.json({ success: true, application: db.job_applications[idx] });
  } else {
    res.status(404).json({ error: "Application not found" });
  }
});


// Audit Logs & Stats for Admin Panel
app.get("/api/admin/audit", (req, res) => {
  const db = loadDB();
  res.json(db.audit_logs.sort((a,b) => b.created_at.localeCompare(a.created_at)));
});

// Initialize seed data on startup
try {
  if (!fs.existsSync(DB_FILE)) {
    saveDB(getSeededData());
    console.log("Database seeded successfully.");
  } else {
    console.log("Using existing local JSON database.");
  }
} catch (e) {
  console.error("Database seeding exception:", e);
}


// Vite middleware integration for full-stack
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
