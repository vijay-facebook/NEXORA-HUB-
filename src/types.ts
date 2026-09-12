/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  CUSTOMER = 'customer',
  OWNER = 'owner',
  ADMIN = 'admin',
  PARTNER = 'partner',
  BRAND = 'brand',
  DISTRIBUTOR = 'distributor',
  JOB_USER = 'job_user'
}

export enum AppointmentStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  ADVANCE_PENDING = 'advance_pending',
  ADVANCE_PENDING_VERIFICATION = 'advance_pending_verification',
  ADVANCE_PAID = 'advance_paid',
  FULL_PENDING_VERIFICATION = 'full_pending_verification',
  PAID_IN_FULL = 'paid_in_full',
  REFUNDED = 'refunded'
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  city?: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  owner_id: string;
  name: string;
  business_type: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  area: string;
  logo_url?: string;
  banner_url?: string;
  description: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews_count?: number;
  starting_price?: number;
  is_verified?: boolean;
  ranking_score?: number;
  ranking_breakdown?: {
    qr_payments_score: number;
    bookings_score: number;
    reviews_score: number;
    repeat_customers_score: number;
    referrals_score: number;
    profile_completion_score: number;
    total_score: number;
  };
  created_at: string;
  updated_at: string;
}

export interface WebsiteTemplate {
  id: string;
  code: string; // 'luxury_beauty', 'modern_barber', 'spa_wellness'
  name: string;
  description: string;
  target_business: string;
  theme_config: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  layout_config: Record<string, any>;
  is_active: boolean;
  display_order: number;
}

export interface TenantWebsite {
  id: string;
  tenant_id: string;
  template_id: string;
  slug: string;
  website_title: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  instagram_url?: string;
  facebook_url?: string;
  section_visibility: {
    hero: boolean;
    services: boolean;
    gallery: boolean;
    reviews: boolean;
    location: boolean;
    contact: boolean;
    offers: boolean;
  };
  is_published: boolean;
  published_at?: string;
}

export interface Service {
  id: string;
  tenant_id: string;
  category_name: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_url?: string;
  status: 'active' | 'inactive';
  is_featured: boolean;
  deleted_at?: string;
}

export interface Staff {
  id: string;
  tenant_id: string;
  name: string;
  role: string;
  specialty: string[];
  photo_url?: string;
  rating?: number;
  experience_years?: number;
}

export interface Customer {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
  crm_tags?: string[]; // 'New', 'Regular', 'VIP', 'Lost', etc.
  cashback_balance?: number;
  cashback_earned_history?: { id: string; amount: number; date: string; description: string; }[];
  created_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  customer_id: string;
  service_id: string;
  staff_id?: string;
  appointment_date: string;
  appointment_time: string;
  total_amount: number;
  advance_amount: number;
  remaining_amount: number;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  customer_name: string;
  customer_phone: string;
  notes?: string;
  is_fallback?: boolean;
  verification_proof_code?: string;
  verification_submitted_at?: string;
  customer_cashback_earned?: number;
  is_disputed?: boolean;
  dispute_reason?: string;
  dispute_status?: 'open' | 'refunded' | 'rejected';
  created_at: string;
}

export interface Review {
  id: string;
  tenant_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Wallet {
  id: string;
  owner_id: string; // Tenant Owner or Partner ID
  owner_type: 'tenant' | 'partner';
  available_balance: number;
  pending_balance: number;
  lifetime_earned: number;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'credit' | 'debit';
  purpose: 'booking_payment' | 'booking_advance' | 'payout' | 'commission' | 'refund' | 'qr_bonus';
  status: 'pending' | 'completed' | 'failed';
  reference_id?: string; // appointment_id or payout_id
  description: string;
  created_at: string;
}

export interface Payout {
  id: string;
  wallet_id: string;
  amount: number;
  payout_time: string; // Everyday 10:00 PM schedule
  status: 'pending' | 'completed' | 'failed';
  ledger_hash: string;
  created_at: string;
}

export interface Partner {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  referral_code: string;
  district: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  company_name: string;
  logo_url?: string;
  description: string;
  categories: string[];
  contact_email: string;
  contact_phone: string;
  status: 'pending' | 'approved';
}

export interface DistributorProfile {
  id: string;
  user_id: string;
  company_name: string;
  logo_url?: string;
  description: string;
  coverage_areas: string[];
  brand_associations: string[];
  contact_email: string;
  contact_phone: string;
  status: 'pending' | 'approved';
}

export interface BrandProduct {
  id: string;
  brand_id: string;
  name: string;
  category: string;
  description: string;
  benefits: string;
  mrp: number;
  image_url?: string;
  is_sponsored: boolean;
}

export interface BrandLead {
  id: string;
  brand_or_distributor_id: string;
  inquirer_name: string;
  inquirer_company: string;
  inquirer_phone: string;
  inquirer_email: string;
  notes: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export interface JobCandidate {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  skills: string[];
  experience_years: number;
  preferred_location: string;
  resume_url?: string;
  created_at: string;
}

export interface JobPost {
  id: string;
  tenant_id: string;
  title: string;
  category: string;
  description: string;
  salary_range: string;
  job_type: 'Full-time' | 'Part-time' | 'Commission-based';
  location: string;
  status: 'active' | 'closed';
  created_at: string;
}

export interface JobApplication {
  id: string;
  job_post_id: string;
  candidate_id: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
}
