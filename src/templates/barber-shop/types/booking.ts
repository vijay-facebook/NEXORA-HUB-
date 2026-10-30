import { BarberService, ServiceAddOn } from '../data/services';

export type BarberBookingStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Checked In' 
  | 'Completed' 
  | 'Cancelled' 
  | 'No Show';

export interface SelectedServiceItem {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  addOns?: ServiceAddOn[];
}

export interface BarberBooking {
  id: string;
  bookingReference: string; // e.g. TGD-2026-8941
  services: SelectedServiceItem[];
  serviceNames: string;
  barberId: string; // specific barber ID or 'any' assigned
  barberName: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalDurationMinutes: number;
  bufferMinutes: number; // e.g. 10 mins
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  couponCode?: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number; // 18% GST included/computed
  totalAmount: number;
  status: BarberBookingStatus;
  createdAt: string;
  updatedAt?: string;
  cancellationReason?: string;
  cancellationAllowedUntil?: string;
}

export interface BarberWorkingHours {
  barberId: string;
  barberName: string;
  workDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  shiftStart: string; // "10:00"
  shiftEnd: string; // "19:30"
  breakStart: string; // "14:00"
  breakEnd: string; // "14:45"
}

export interface BlockedSlot {
  id: string;
  barberId?: string; // empty means all barbers / shop holiday
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm or whole day
  endTime?: string; // HH:mm or whole day
  reason: string;
}

export interface CouponRule {
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  expiresAt: string;
}
