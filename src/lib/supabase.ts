/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { mappers } from './data-mappers';
import { Tenant, Service, Appointment, Staff, Review } from '../types';

const BASE_URL = ''; // Relative path requests go directly to our Express host

// Read browser-injected/platform-supplied public environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Initialize client only if variables exist
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Dynamic table name mapping cache (handles custom Lovable naming variations)
const tableNames = {
  profiles: 'profiles',
  tenants: 'tenants',            // Probed: 'tenants' | 'shops'
  services: 'services',
  staff: 'staff',
  reviews: 'reviews',
  appointments: 'appointments',  // Probed: 'appointments' | 'bookings'
  tenant_websites: 'tenant_websites', // Probed: 'tenant_websites' | 'websites'
  rewards_wallet: 'rewards_wallet',
  rewards_transactions: 'rewards_transactions',
  referrals: 'referrals',
  support_tickets: 'support_tickets',
  notifications: 'notifications',
  partners: 'partners',
  brand_profiles: 'brand_profiles',
  distributor_profiles: 'distributor_profiles',
  brand_products: 'brand_products',
  brand_leads: 'brand_leads',
  job_candidates: 'job_candidates',
  job_posts: 'job_posts',
  job_applications: 'job_applications',
  audit_logs: 'audit_logs'
};

// Column names cache to avoid invalid database field errors
let tenantColumns: string[] = [];
let appointmentColumns: string[] = [];
let serviceColumns: string[] = [];
let staffColumns: string[] = [];
let reviewColumns: string[] = [];
let partnerColumns: string[] = [];

let isProbed = false;

// Dynamic probing function run on first query
async function ensureProbed() {
  if (!supabase || isProbed) return;
  
  try {
    // 1. Probe tenants vs shops
    const { data: shopsData, error: shopsError } = await supabase.from('shops').select('*').limit(1);
    if (!shopsError) {
      tableNames.tenants = 'shops';
      if (shopsData && shopsData.length > 0) {
        tenantColumns = Object.keys(shopsData[0]);
      }
    } else {
      const { data: tenantsData, error: tenantsError } = await supabase.from('tenants').select('*').limit(1);
      if (!tenantsError) {
        tableNames.tenants = 'tenants';
        if (tenantsData && tenantsData.length > 0) {
          tenantColumns = Object.keys(tenantsData[0]);
        }
      }
    }

    // 2. Probe bookings vs appointments
    const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*').limit(1);
    if (!bookingsError) {
      tableNames.appointments = 'bookings';
      if (bookingsData && bookingsData.length > 0) {
        appointmentColumns = Object.keys(bookingsData[0]);
      }
    } else {
      const { data: appointmentsData, error: appointmentsError } = await supabase.from('appointments').select('*').limit(1);
      if (!appointmentsError) {
        tableNames.appointments = 'appointments';
        if (appointmentsData && appointmentsData.length > 0) {
          appointmentColumns = Object.keys(appointmentsData[0]);
        }
      }
    }

    // 3. Probe website tables
    const { error: twError } = await supabase.from('tenant_websites').select('id').limit(1);
    if (!twError) {
      tableNames.tenant_websites = 'tenant_websites';
    } else {
      const { error: wError } = await supabase.from('websites').select('id').limit(1);
      if (!wError) {
        tableNames.tenant_websites = 'websites';
      }
    }

    // 4. Capture columns for services, staff, reviews
    const { data: servData } = await supabase.from('services').select('*').limit(1);
    if (servData && servData.length > 0) serviceColumns = Object.keys(servData[0]);

    const { data: stfData } = await supabase.from('staff').select('*').limit(1);
    if (stfData && stfData.length > 0) staffColumns = Object.keys(stfData[0]);

    const { data: revData } = await supabase.from('reviews').select('*').limit(1);
    if (revData && revData.length > 0) reviewColumns = Object.keys(revData[0]);

    isProbed = true;
    console.log('Supabase table mappings probed and resolved successfully:', tableNames);
  } catch (e) {
    console.warn('Error probing Supabase tables:', e);
    isProbed = true; // prevent infinite retries
  }
}

// Utility to filter properties that actually exist on the database table
function filterPayload(payload: Record<string, any>, allowedColumns: string[]): Record<string, any> {
  if (allowedColumns.length === 0) return payload; // fallback
  const filtered: Record<string, any> = {};
  for (const key of Object.keys(payload)) {
    if (allowedColumns.includes(key)) {
      filtered[key] = payload[key];
    }
  }
  return filtered;
}

// Extract missing column name from PostgreSQL error message
function extractMissingColumn(errorMessage: string): string | null {
  let match = errorMessage.match(/column "([^"]+)"/);
  if (match) return match[1];
  
  match = errorMessage.match(/column ([a-zA-Z0-9_]+) does not exist/);
  if (match) return match[1];

  return null;
}

// Safe database insertion with auto-pruning for schema mismatches
async function safeInsert(tableName: string, rawPayload: Record<string, any>, cacheColumns?: string[]) {
  if (!supabase) return { data: null, error: new Error('Supabase client is not initialized') };
  
  let payload = { ...rawPayload };
  
  if (cacheColumns && cacheColumns.length > 0) {
    payload = filterPayload(payload, cacheColumns);
  }

  // Ensure an id exists
  if (!payload.id) {
    const prefix = tableName === 'tenants' || tableName === 'shops' ? 'ten' :
                   tableName === 'services' ? 'ser' :
                   tableName === 'staff' ? 'stf' :
                   tableName === 'reviews' ? 'rev' :
                   tableName === 'appointments' || tableName === 'bookings' ? 'apt' :
                   tableName === 'tenant_websites' || tableName === 'websites' ? 'web' : 'id';
    payload.id = prefix + "_" + Math.random().toString(36).substring(2, 9);
  }

  const maxRetries = 15;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { data, error } = await supabase.from(tableName).insert([payload]).select();
    if (!error) {
      if (cacheColumns && cacheColumns.length === 0) {
        cacheColumns.push(...Object.keys(payload));
      }
      return { data, error: null };
    }

    // Postgres code 42703: Column does not exist
    if (error.code === '42703') {
      const missingColumn = extractMissingColumn(error.message || '');
      if (missingColumn && missingColumn in payload) {
        console.warn(`[SafeInsert] Pruning non-existent column "${missingColumn}" from table "${tableName}"`);
        delete payload[missingColumn];
        continue;
      }
    }
    
    return { data: null, error };
  }
  return { data: null, error: new Error('Max retries exceeded during column pruning') };
}

// Safe database update with auto-pruning for schema mismatches
async function safeUpdate(tableName: string, id: string, rawPayload: Record<string, any>, cacheColumns?: string[]) {
  if (!supabase) return { data: null, error: new Error('Supabase client is not initialized') };
  
  let payload = { ...rawPayload };
  
  if (cacheColumns && cacheColumns.length > 0) {
    payload = filterPayload(payload, cacheColumns);
  }

  const maxRetries = 15;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select();
    if (!error) {
      return { data, error: null };
    }

    // Postgres code 42703: Column does not exist
    if (error.code === '42703') {
      const missingColumn = extractMissingColumn(error.message || '');
      if (missingColumn && missingColumn in payload) {
        console.warn(`[SafeUpdate] Pruning non-existent column "${missingColumn}" from table "${tableName}"`);
        delete payload[missingColumn];
        continue;
      }
    }
    
    return { data: null, error };
  }
  return { data: null, error: new Error('Max retries exceeded during column pruning') };
}

export const api = {
  // Admin & DB resets
  async resetDatabase() {
    const res = await fetch(`${BASE_URL}/api/db/reset`, { method: 'POST' });
    return res.json();
  },

  async getFullDB() {
    if (supabase) {
      try {
        await ensureProbed();
        const [tenantsRes, servicesRes, staffRes, appointmentsRes, reviewsRes] = await Promise.all([
          supabase.from(tableNames.tenants).select('*'),
          supabase.from(tableNames.services).select('*'),
          supabase.from(tableNames.staff).select('*'),
          supabase.from(tableNames.appointments).select('*'),
          supabase.from(tableNames.reviews).select('*')
        ]);
        
        return {
          tenants: (tenantsRes.data || []).map(mappers.toCanonicalTenant),
          services: (servicesRes.data || []).map(mappers.toCanonicalService),
          staff: (staffRes.data || []).map(mappers.toCanonicalStaff),
          appointments: (appointmentsRes.data || []).map(mappers.toCanonicalAppointment),
          reviews: (reviewsRes.data || []).map(mappers.toCanonicalReview),
          website_templates: [],
          tenant_websites: []
        };
      } catch (err) {
        console.warn("Supabase getFullDB failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/db`);
    return res.json();
  },

  // Tenants
  async getTenants() {
    if (supabase) {
      try {
        await ensureProbed();
        const { data, error } = await supabase.from(tableNames.tenants).select('*');
        if (error) throw error;
        // Customer App should show only approved, published and active businesses.
        return (data || [])
          .map(mappers.toCanonicalTenant)
          .filter(t => t.approval_status === 'approved' && t.is_active);
      } catch (err) {
        console.warn("Supabase getTenants failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/tenants`);
    const list = await res.json();
    return list.filter((t: any) => t.approval_status === 'approved' && t.is_active);
  },

  async createTenant(tenantData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const tenantId = tenantData.id || "ten_" + Math.random().toString(36).substring(2, 9);
        const rawPayload = {
          id: tenantId,
          owner_id: tenantData.owner_id || "usr_owner_" + Math.random().toString(36).substring(2, 9),
          name: tenantData.name,
          business_type: tenantData.business_type,
          phone: tenantData.phone,
          email: tenantData.email || '',
          address: tenantData.address || '',
          city: tenantData.city || 'Jaipur',
          state: tenantData.state || 'Rajasthan',
          area: tenantData.area || '',
          logo_url: tenantData.logo_url || '',
          banner_url: tenantData.banner_url || '',
          description: tenantData.description || '',
          approval_status: tenantData.approval_status || 'approved',
          is_active: tenantData.is_active !== undefined ? tenantData.is_active : true,
          latitude: tenantData.latitude || 26.9124,
          longitude: tenantData.longitude || 75.7873,
          rating: tenantData.rating || 5.0,
          reviews_count: tenantData.reviews_count || 0,
          starting_price: tenantData.starting_price || 300,
          is_verified: tenantData.is_verified || false
        };
        
        const { data, error } = await safeInsert(tableNames.tenants, rawPayload, tenantColumns);
        if (error) throw error;
        
        const tenant = mappers.toCanonicalTenant(data?.[0]);

        // Secondary seedings (done gracefully, so failure on secondary tables does not break tenant registration)
        try {
          const websiteSlug = tenantData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 5);
          const webPayload = {
            id: "web_" + tenantId,
            tenant_id: tenantId,
            shop_id: tenantId,
            template_id: "tpl_luxury",
            slug: websiteSlug,
            website_title: `${tenantData.name} | ${tenantData.area || 'Jaipur'}`,
            hero_title: `Welcome to ${tenantData.name}`,
            hero_subtitle: "Your premier destination for luxury grooming and beauty experiences.",
            about_text: `${tenantData.name} offers premium services in ${tenantData.area || 'Jaipur'}. Experience our skilled touch and professional care.`,
            phone: tenantData.phone,
            whatsapp_number: tenantData.phone.replace(/[^0-9]/g, ""),
            email: tenantData.email || '',
            address: tenantData.address || '',
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
          await safeInsert(tableNames.tenant_websites, webPayload);
        } catch (webErr) {
          console.warn("Could not auto-seed website for Supabase tenant:", webErr);
        }

        try {
          const walletPayload = {
            id: "wal_" + tenantId,
            owner_id: rawPayload.owner_id,
            owner_type: "tenant",
            available_balance: 0,
            pending_balance: 0,
            lifetime_earned: 0
          };
          await safeInsert(tableNames.rewards_wallet, walletPayload);
        } catch (walErr) {
          console.warn("Could not auto-seed wallet for Supabase tenant:", walErr);
        }

        try {
          const servicePayload = {
            id: "ser_" + Math.random().toString(36).substring(2, 9),
            tenant_id: tenantId,
            shop_id: tenantId,
            category_name: "Grooming",
            name: "Classic Haircut",
            description: "Standard style cut and neck wash.",
            price: 300,
            duration_minutes: 30,
            status: "active",
            is_featured: true
          };
          await safeInsert(tableNames.services, servicePayload);
        } catch (serErr) {
          console.warn("Could not auto-seed default services for Supabase tenant:", serErr);
        }

        return { success: true, tenant };
      } catch (err) {
        console.warn("Supabase createTenant failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenantData),
    });
    return res.json();
  },

  async updateTenant(id: string, tenantData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const { data, error } = await safeUpdate(tableNames.tenants, id, tenantData, tenantColumns);
        if (error) throw error;
        return { success: true, tenant: mappers.toCanonicalTenant(data?.[0]) };
      } catch (err) {
        console.warn("Supabase updateTenant failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenantData),
    });
    return res.json();
  },

  // Websites
  async getWebsites() {
    if (supabase) {
      try {
        await ensureProbed();
        const { data, error } = await supabase.from(tableNames.tenant_websites).select('*');
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getWebsites failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/tenant-websites`);
    return res.json();
  },

  async getWebsiteBySlug(slug: string) {
    if (supabase) {
      try {
        await ensureProbed();
        let website: any = null;
        let tenantId = '';
        
        const { data: webData, error: webError } = await supabase.from(tableNames.tenant_websites).select('*').eq('slug', slug).limit(1);
        if (!webError && webData && webData.length > 0) {
          website = webData[0];
          tenantId = website.tenant_id || website.shop_id;
        }

        // Fallback: Check if the tenant itself holds the slug if no website template is preseeded
        if (!website) {
          const { data: tenData, error: tenError } = await supabase.from(tableNames.tenants).select('*').eq('slug', slug).limit(1);
          if (!tenError && tenData && tenData.length > 0) {
            const tenant = mappers.toCanonicalTenant(tenData[0]);
            tenantId = tenant.id;
            website = {
              id: 'web_' + tenant.id,
              tenant_id: tenant.id,
              template_id: 'tpl_luxury',
              slug: slug,
              website_title: tenant.name,
              hero_title: tenant.name,
              hero_subtitle: tenant.description,
              about_text: tenant.description,
              phone: tenant.phone,
              whatsapp_number: tenant.phone,
              email: tenant.email,
              address: tenant.address,
              section_visibility: {
                hero: true,
                services: true,
                gallery: true,
                reviews: true,
                location: true,
                contact: true,
                offers: true
              },
              is_published: true
            };
          }
        }

        if (!website || !tenantId) {
          throw new Error('Website not found');
        }

        // Load associated sub-data
        const [tenantRes, servicesRes, staffRes, reviewsRes] = await Promise.all([
          supabase.from(tableNames.tenants).select('*').eq('id', tenantId).limit(1),
          supabase.from(tableNames.services).select('*').or(`tenant_id.eq.${tenantId},shop_id.eq.${tenantId}`),
          supabase.from(tableNames.staff).select('*').or(`tenant_id.eq.${tenantId},shop_id.eq.${tenantId}`),
          supabase.from(tableNames.reviews).select('*').or(`tenant_id.eq.${tenantId},shop_id.eq.${tenantId}`)
        ]);

        return {
          website,
          tenant: tenantRes.data?.[0] ? mappers.toCanonicalTenant(tenantRes.data[0]) : null,
          services: (servicesRes.data || []).map(mappers.toCanonicalService),
          staff: (staffRes.data || []).map(mappers.toCanonicalStaff),
          reviews: (reviewsRes.data || []).map(mappers.toCanonicalReview)
        };
      } catch (err) {
        console.warn("Supabase getWebsiteBySlug failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/tenant-websites/by-slug/${slug}`);
    if (!res.ok) {
      throw new Error('Website not found');
    }
    return res.json();
  },

  async updateWebsite(id: string, websiteData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const { data, error } = await safeUpdate(tableNames.tenant_websites, id, websiteData);
        if (error) throw error;
        return data?.[0] || {};
      } catch (err) {
        console.warn("Supabase updateWebsite failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/tenant-websites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(websiteData),
    });
    return res.json();
  },

  // Services
  async getServices(tenantId?: string) {
    if (supabase) {
      try {
        await ensureProbed();
        let query = supabase.from(tableNames.services).select('*');
        if (tenantId) {
          query = query.or(`tenant_id.eq.${tenantId},shop_id.eq.${tenantId}`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(mappers.toCanonicalService);
      } catch (err) {
        console.warn("Supabase getServices failed, falling back:", err);
      }
    }
    const url = tenantId ? `${BASE_URL}/api/services?tenant_id=${tenantId}` : `${BASE_URL}/api/services`;
    const res = await fetch(url);
    return res.json();
  },

  async createService(serviceData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const rawPayload = {
          id: serviceData.id,
          tenant_id: serviceData.tenant_id,
          shop_id: serviceData.tenant_id,
          category_name: serviceData.category_name,
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration_minutes: serviceData.duration_minutes,
          image_url: serviceData.image_url,
          status: serviceData.status || 'active',
          is_featured: serviceData.is_featured || false
        };
        const { data, error } = await safeInsert(tableNames.services, rawPayload, serviceColumns);
        if (error) throw error;
        return { success: true, service: mappers.toCanonicalService(data?.[0]) };
      } catch (err) {
        console.warn("Supabase createService failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });
    return res.json();
  },

  async updateService(id: string, serviceData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const { data, error } = await safeUpdate(tableNames.services, id, serviceData, serviceColumns);
        if (error) throw error;
        return { success: true, service: mappers.toCanonicalService(data?.[0]) };
      } catch (err) {
        console.warn("Supabase updateService failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });
    return res.json();
  },

  // Staff
  async getStaff(tenantId?: string) {
    if (supabase) {
      try {
        await ensureProbed();
        let query = supabase.from(tableNames.staff).select('*');
        if (tenantId) {
          query = query.or(`tenant_id.eq.${tenantId},shop_id.eq.${tenantId}`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(mappers.toCanonicalStaff);
      } catch (err) {
        console.warn("Supabase getStaff failed, falling back:", err);
      }
    }
    const url = tenantId ? `${BASE_URL}/api/staff?tenant_id=${tenantId}` : `${BASE_URL}/api/staff`;
    const res = await fetch(url);
    return res.json();
  },

  async createStaff(staffData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const rawPayload = {
          id: staffData.id,
          tenant_id: staffData.tenant_id,
          shop_id: staffData.tenant_id,
          name: staffData.name,
          role: staffData.role,
          specialty: staffData.specialty,
          photo_url: staffData.photo_url,
          rating: staffData.rating || 5.0,
          experience_years: staffData.experience_years || 3
        };
        const { data, error } = await safeInsert(tableNames.staff, rawPayload, staffColumns);
        if (error) throw error;
        return { success: true, staff: mappers.toCanonicalStaff(data?.[0]) };
      } catch (err) {
        console.warn("Supabase createStaff failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData),
    });
    return res.json();
  },

  async createCustomer(customerData: any) {
    const res = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    return res.json();
  },

  // Bookings / Appointments
  async getAppointments(tenantId?: string, customerPhone?: string) {
    if (supabase) {
      try {
        await ensureProbed();
        let query = supabase.from(tableNames.appointments).select('*');
        if (tenantId) {
          query = query.or(`tenant_id.eq.${tenantId},shop_id.eq.${tenantId}`);
        } else if (customerPhone) {
          query = query.or(`customer_phone.eq.${customerPhone},client_phone.eq.${customerPhone}`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(mappers.toCanonicalAppointment);
      } catch (err) {
        console.warn("Supabase getAppointments failed, falling back:", err);
      }
    }
    let url = `${BASE_URL}/api/appointments`;
    if (tenantId) url += `?tenant_id=${tenantId}`;
    else if (customerPhone) url += `?customer_phone=${customerPhone}`;
    
    const res = await fetch(url);
    return res.json();
  },

  async createBooking(bookingData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const rawPayload = {
          id: bookingData.id,
          tenant_id: bookingData.tenant_id,
          shop_id: bookingData.tenant_id,
          service_id: bookingData.service_id,
          staff_id: bookingData.staff_id,
          appointment_date: bookingData.appointment_date,
          date: bookingData.appointment_date,
          appointment_time: bookingData.appointment_time,
          time: bookingData.appointment_time,
          customer_name: bookingData.customer_name,
          client_name: bookingData.customer_name,
          customer_phone: bookingData.customer_phone,
          client_phone: bookingData.customer_phone,
          notes: bookingData.notes || '',
          total_amount: bookingData.total_amount || 400,
          advance_amount: bookingData.advance_amount || 100,
          remaining_amount: bookingData.remaining_amount || 300,
          status: bookingData.status || 'pending_payment',
          payment_status: bookingData.payment_status || 'advance_pending'
        };
        const { data, error } = await safeInsert(tableNames.appointments, rawPayload, appointmentColumns);
        if (error) throw error;
        return { success: true, appointment: mappers.toCanonicalAppointment(data?.[0]) };
      } catch (err) {
        console.warn("Supabase createBooking failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/public-booking/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return res.json();
  },

  async updateAppointment(id: string, appointmentData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const { data, error } = await safeUpdate(tableNames.appointments, id, appointmentData, appointmentColumns);
        if (error) throw error;
        return { success: true, appointment: mappers.toCanonicalAppointment(data?.[0]) };
      } catch (err) {
        console.warn("Supabase updateAppointment failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });
    return res.json();
  },

  async submitPaymentVerification(id: string, proofCode: string, isAdvance: boolean) {
    const res = await fetch(`${BASE_URL}/api/appointments/${id}/submit-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof_code: proofCode, is_advance: isAdvance }),
    });
    return res.json();
  },

  async submitDispute(id: string, disputeReason: string) {
    const res = await fetch(`${BASE_URL}/api/appointments/${id}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispute_reason: disputeReason }),
    });
    return res.json();
  },

  async resolveDispute(id: string, resolution: 'refunded' | 'rejected') {
    const res = await fetch(`${BASE_URL}/api/appointments/${id}/resolve-dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution }),
    });
    return res.json();
  },

  // Customers
  async getCustomers(tenantId?: string, phone?: string) {
    if (supabase) {
      try {
        await ensureProbed();
        let query = supabase.from('customers').select('*');
        if (tenantId) {
          query = query.or(`tenant_id.eq.${tenantId},shop_id.eq.${tenantId}`);
        } else if (phone) {
          query = query.or(`phone.eq.${phone}`);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase getCustomers failed:", err);
      }
    }
    let url = `${BASE_URL}/api/customers`;
    if (tenantId) url += `?tenant_id=${tenantId}`;
    else if (phone) url += `?phone=${phone}`;
    
    const res = await fetch(url);
    return res.json();
  },

  // Reviews
  async createReview(reviewData: any) {
    if (supabase) {
      try {
        await ensureProbed();
        const rawPayload = {
          id: reviewData.id,
          tenant_id: reviewData.tenant_id,
          shop_id: reviewData.tenant_id,
          customer_name: reviewData.customer_name,
          rating: reviewData.rating,
          comment: reviewData.comment,
          date: reviewData.date || new Date().toISOString()
        };
        const { data, error } = await safeInsert(tableNames.reviews, rawPayload, reviewColumns);
        if (error) throw error;
        return { success: true, review: mappers.toCanonicalReview(data?.[0]) };
      } catch (err) {
        console.warn("Supabase createReview failed, falling back:", err);
      }
    }
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return res.json();
  },

  // Wallets & Transactions
  async getWallets(ownerId?: string) {
    if (supabase) {
      try {
        let query = supabase.from(tableNames.rewards_wallet).select('*');
        if (ownerId) query = query.eq('owner_id', ownerId);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase getWallets failed:", err);
      }
    }
    const url = ownerId ? `${BASE_URL}/api/wallets?owner_id=${ownerId}` : `${BASE_URL}/api/wallets`;
    const res = await fetch(url);
    return res.json();
  },

  async getTransactions(walletId?: string) {
    if (supabase) {
      try {
        let query = supabase.from(tableNames.rewards_transactions).select('*');
        if (walletId) query = query.eq('wallet_id', walletId);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase getTransactions failed:", err);
      }
    }
    const url = walletId ? `${BASE_URL}/api/transactions?wallet_id=${walletId}` : `${BASE_URL}/api/transactions`;
    const res = await fetch(url);
    return res.json();
  },

  async getPayouts() {
    const res = await fetch(`${BASE_URL}/api/payouts`);
    return res.json();
  },

  async triggerDailyPayouts() {
    const res = await fetch(`${BASE_URL}/api/wallets/trigger-daily-payouts`, { method: 'POST' });
    return res.json();
  },

  // Partners
  async getPartners() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from(tableNames.partners).select('*');
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase getPartners failed:", e);
      }
    }
    const res = await fetch(`${BASE_URL}/api/partners`);
    return res.json();
  },

  async createPartner(partnerData: any) {
    if (supabase) {
      try {
        const { data, error } = await safeInsert(tableNames.partners, partnerData, partnerColumns);
        if (error) throw error;
        return { success: true, partner: data?.[0] };
      } catch (e) {
        console.warn("Supabase createPartner failed:", e);
      }
    }
    const res = await fetch(`${BASE_URL}/api/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partnerData),
    });
    return res.json();
  },

  // B2B Brand & Distributors
  async getBrands() {
    const res = await fetch(`${BASE_URL}/api/brands`);
    return res.json();
  },

  async createBrand(brandData: any) {
    const res = await fetch(`${BASE_URL}/api/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData),
    });
    return res.json();
  },

  async getDistributors() {
    const res = await fetch(`${BASE_URL}/api/distributors`);
    return res.json();
  },

  async createDistributor(distData: any) {
    const res = await fetch(`${BASE_URL}/api/distributors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(distData),
    });
    return res.json();
  },

  async getBrandProducts() {
    const res = await fetch(`${BASE_URL}/api/brand-products`);
    return res.json();
  },

  async createBrandProduct(productData: any) {
    const res = await fetch(`${BASE_URL}/api/brand-products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async getBrandLeads() {
    const res = await fetch(`${BASE_URL}/api/brand-leads`);
    return res.json();
  },

  async createBrandLead(leadData: any) {
    const res = await fetch(`${BASE_URL}/api/brand-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
    return res.json();
  },

  // Jobs
  async getJobPosts() {
    const res = await fetch(`${BASE_URL}/api/jobs/posts`);
    return res.json();
  },

  async createJobPost(postData: any) {
    const res = await fetch(`${BASE_URL}/api/jobs/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    return res.json();
  },

  async getJobCandidates() {
    const res = await fetch(`${BASE_URL}/api/jobs/candidates`);
    return res.json();
  },

  async createJobCandidate(candData: any) {
    const res = await fetch(`${BASE_URL}/api/jobs/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candData),
    });
    return res.json();
  },

  async getJobApplications() {
    const res = await fetch(`${BASE_URL}/api/jobs/applications`);
    return res.json();
  },

  async createJobApplication(appData: any) {
    const res = await fetch(`${BASE_URL}/api/jobs/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    });
    return res.json();
  },

  async updateJobApplication(id: string, status: string) {
    const res = await fetch(`${BASE_URL}/api/jobs/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Admin audit logs
  async getAdminAudit() {
    const res = await fetch(`${BASE_URL}/api/admin/audit`);
    return res.json();
  },

  // Gemini AI Schedule Notifications & Conflict System
  async getScheduleNotifications(tenantId: string, forceRefresh = false) {
    const res = await fetch(`${BASE_URL}/api/ai/schedule-notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, force_refresh: forceRefresh }),
    });
    return res.json();
  },

  async resolveScheduleNotification(id: string, resolutionNote?: string) {
    const res = await fetch(`${BASE_URL}/api/ai/schedule-notifications/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_note: resolutionNote }),
    });
    return res.json();
  },

  async markScheduleNotificationRead(id: string) {
    const res = await fetch(`${BASE_URL}/api/ai/schedule-notifications/${id}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async quickReassignBooking(bookingId: string, newStaffId: string, notificationId?: string) {
    const res = await fetch(`${BASE_URL}/api/ai/schedule-notifications/quick-reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        new_staff_id: newStaffId,
        notification_id: notificationId,
      }),
    });
    return res.json();
  },

  async simulateConflict(tenantId: string) {
    const res = await fetch(`${BASE_URL}/api/ai/schedule-notifications/simulate-conflict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId }),
    });
    return res.json();
  },

  async generateGiftCard(payload: { tenant_id: string; client_name: string; amount: number; occasion: string; style_prompt?: string }) {
    const res = await fetch(`${BASE_URL}/api/ai/generate-gift-card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getDemandForecast(tenantId: string) {
    const res = await fetch(`${BASE_URL}/api/ai/demand-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId }),
    });
    return res.json();
  },

  async getReviewSummary(tenantId: string) {
    const res = await fetch(`${BASE_URL}/api/ai/review-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId }),
    });
    return res.json();
  },

  async getRecommendations(tenantId: string, bookingHistory: any[]) {
    const res = await fetch(`${BASE_URL}/api/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, booking_history: bookingHistory }),
    });
    return res.json();
  },

  async getRevenueForecast(tenantId: string) {
    const res = await fetch(`${BASE_URL}/api/ai/revenue-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId }),
    });
    return res.json();
  },

  async sendVIPReminder(tenantId: string, appointmentId: string, customerName: string, customerPhone: string) {
    const res = await fetch(`${BASE_URL}/api/ai/send-vip-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, appointment_id: appointmentId, customer_name: customerName, customer_phone: customerPhone }),
    });
    return res.json();
  },

  async sendReviewRequest(payload: { tenant_id: string; appointment_id?: string; customer_name?: string; customer_phone?: string }) {
    const res = await fetch(`${BASE_URL}/api/reviews/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getRosterOptimization(tenantId: string) {
    const res = await fetch(`${BASE_URL}/api/ai/roster-optimizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId }),
    });
    return res.json();
  },

  async getLoyaltyTiers(tenantId: string) {
    const res = await fetch(`${BASE_URL}/api/ai/loyalty-tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId }),
    });
    return res.json();
  },

  async getWaitlist(tenantId: string) {
    const res = await fetch(`${BASE_URL}/api/waitlist?tenant_id=${tenantId}`);
    return res.json();
  }
};

