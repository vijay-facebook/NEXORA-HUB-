/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tenant, Service, Appointment, Staff, Review, Profile } from '../types';

/**
 * Data mapping utilities to resolve schema differences between potential old/external tables
 * and the canonical Nexora light SaaS operational schemas.
 */

export const mappers = {
  // Maps a legacy/alternative Salon/Shop model to the canonical Tenant schema
  toCanonicalTenant(rawSalon: any): Tenant {
    if (!rawSalon) return {} as Tenant;
    return {
      id: rawSalon.id || rawSalon.tenant_id || rawSalon.shop_id || '',
      owner_id: rawSalon.owner_id || rawSalon.user_id || 'usr_unknown',
      name: rawSalon.name || rawSalon.shop_name || rawSalon.title || 'Unnamed Salon',
      business_type: rawSalon.business_type || rawSalon.category || rawSalon.type || 'salons',
      phone: rawSalon.phone || rawSalon.mobile || rawSalon.contact || rawSalon.phone_number || '',
      email: rawSalon.email || '',
      address: rawSalon.address || '',
      city: rawSalon.city || 'Jaipur',
      state: rawSalon.state || 'Rajasthan',
      area: rawSalon.area || rawSalon.location || rawSalon.neighborhood || '',
      logo_url: rawSalon.logo_url || rawSalon.shop_logo_url || rawSalon.logo || '',
      banner_url: rawSalon.banner_url || rawSalon.shop_banner_url || rawSalon.banner || '',
      description: rawSalon.description || rawSalon.about || rawSalon.bio || '',
      approval_status: rawSalon.approval_status || rawSalon.status || 'approved',
      is_active: rawSalon.is_active !== undefined ? rawSalon.is_active : (rawSalon.active !== undefined ? rawSalon.active : true),
      latitude: rawSalon.latitude || rawSalon.lat || undefined,
      longitude: rawSalon.longitude || rawSalon.lng || undefined,
      rating: rawSalon.rating || rawSalon.shop_rating || rawSalon.average_rating || 5.0,
      reviews_count: rawSalon.reviews_count || rawSalon.review_count || rawSalon.num_reviews || 0,
      starting_price: rawSalon.starting_price || rawSalon.starting || rawSalon.min_price || 300,
      is_verified: rawSalon.is_verified || rawSalon.verified || rawSalon.certified || false,
      created_at: rawSalon.created_at || new Date().toISOString(),
      updated_at: rawSalon.updated_at || new Date().toISOString()
    };
  },

  // Maps alternative service models to canonical Service schema
  toCanonicalService(rawService: any): Service {
    if (!rawService) return {} as Service;
    return {
      id: rawService.id || rawService.service_id || '',
      tenant_id: rawService.tenant_id || rawService.shop_id || rawService.business_id || '',
      category_name: rawService.category_name || rawService.category || 'Grooming',
      name: rawService.name || rawService.title || rawService.service_name || '',
      description: rawService.description || rawService.about || '',
      price: rawService.price || rawService.amount || rawService.cost || 0,
      duration_minutes: rawService.duration_minutes || rawService.duration || rawService.time_taken || 30,
      image_url: rawService.image_url || rawService.image || '',
      status: rawService.status || 'active',
      is_featured: rawService.is_featured || rawService.featured || false,
      deleted_at: rawService.deleted_at || undefined
    };
  },

  // Maps legacy bookings to canonical Appointment schema
  toCanonicalAppointment(rawBooking: any): Appointment {
    if (!rawBooking) return {} as Appointment;
    return {
      id: rawBooking.id || rawBooking.booking_id || '',
      tenant_id: rawBooking.tenant_id || rawBooking.shop_id || rawBooking.business_id || '',
      customer_id: rawBooking.customer_id || rawBooking.user_id || '',
      service_id: rawBooking.service_id || '',
      staff_id: rawBooking.staff_id || rawBooking.employee_id || undefined,
      appointment_date: rawBooking.appointment_date || rawBooking.date || rawBooking.booking_date || '',
      appointment_time: rawBooking.appointment_time || rawBooking.time || rawBooking.booking_time || '',
      total_amount: rawBooking.total_amount || rawBooking.total || rawBooking.price || rawBooking.amount || 0,
      advance_amount: rawBooking.advance_amount || rawBooking.advance || rawBooking.deposit || 0,
      remaining_amount: rawBooking.remaining_amount || rawBooking.remaining || rawBooking.balance || 0,
      status: rawBooking.status || 'pending_payment',
      payment_status: rawBooking.payment_status || 'advance_pending',
      customer_name: rawBooking.customer_name || rawBooking.client_name || rawBooking.user_name || '',
      customer_phone: rawBooking.customer_phone || rawBooking.client_phone || rawBooking.phone || '',
      notes: rawBooking.notes || rawBooking.comment || '',
      created_at: rawBooking.created_at || new Date().toISOString()
    };
  },

  // Maps alternative staff models to canonical Staff schema
  toCanonicalStaff(rawStaff: any): Staff {
    if (!rawStaff) return {} as Staff;
    
    let specialties: string[] = [];
    if (Array.isArray(rawStaff.specialty)) {
      specialties = rawStaff.specialty;
    } else if (typeof rawStaff.specialty === 'string') {
      specialties = rawStaff.specialty.split(',').map((s: string) => s.trim());
    } else if (Array.isArray(rawStaff.specialties)) {
      specialties = rawStaff.specialties;
    } else if (typeof rawStaff.specialties === 'string') {
      specialties = rawStaff.specialties.split(',').map((s: string) => s.trim());
    }

    return {
      id: rawStaff.id || rawStaff.staff_id || '',
      tenant_id: rawStaff.tenant_id || rawStaff.shop_id || '',
      name: rawStaff.name || rawStaff.staff_name || 'Stylist',
      role: rawStaff.role || rawStaff.designation || 'Specialist',
      specialty: specialties,
      photo_url: rawStaff.photo_url || rawStaff.photo || rawStaff.image_url || rawStaff.avatar_url || '',
      rating: rawStaff.rating || 5.0,
      experience_years: rawStaff.experience_years || rawStaff.experience || 3
    };
  },

  // Maps alternative review models to canonical Review schema
  toCanonicalReview(rawReview: any): Review {
    if (!rawReview) return {} as Review;
    return {
      id: rawReview.id || rawReview.review_id || '',
      tenant_id: rawReview.tenant_id || rawReview.shop_id || '',
      customer_name: rawReview.customer_name || rawReview.client_name || rawReview.author_name || 'Anonymous',
      rating: rawReview.rating || rawReview.score || 5,
      comment: rawReview.comment || rawReview.review_text || rawReview.text || '',
      date: rawReview.date || rawReview.created_at || new Date().toISOString()
    };
  },

  // Maps raw profile models to canonical Profile schema
  toCanonicalProfile(rawProfile: any): Profile {
    if (!rawProfile) return {} as Profile;
    return {
      id: rawProfile.id || rawProfile.user_id || '',
      email: rawProfile.email || '',
      full_name: rawProfile.full_name || rawProfile.name || rawProfile.username || 'User',
      role: rawProfile.role || 'customer',
      phone: rawProfile.phone || rawProfile.mobile || rawProfile.phone_number || '',
      city: rawProfile.city || 'Jaipur',
      created_at: rawProfile.created_at || new Date().toISOString()
    };
  }
};
