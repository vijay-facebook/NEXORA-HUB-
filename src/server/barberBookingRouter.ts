import { Router, Request, Response } from 'express';
import { BarberBooking, BarberBookingStatus, BarberWorkingHours, BlockedSlot, CouponRule } from '../templates/barber-shop/types/booking';
import { PromotionCampaign } from '../templates/barber-shop/types/promotions';
import { initialBarberPromotions } from '../templates/barber-shop/data/promotions';

export const BARBER_SCHEDULES: Record<string, BarberWorkingHours> = {
  'barber-vikram': {
    barberId: 'barber-vikram',
    barberName: 'Vikram "Blade" Rathore',
    workDays: [0, 2, 3, 4, 5, 6], // Tue - Sun (Mon Off)
    shiftStart: '10:00',
    shiftEnd: '19:30',
    breakStart: '14:00',
    breakEnd: '14:45'
  },
  'barber-marcus': {
    barberId: 'barber-marcus',
    barberName: "Marcus D'Souza",
    workDays: [0, 1, 3, 4, 5, 6], // Wed - Mon (Tue Off)
    shiftStart: '11:00',
    shiftEnd: '20:30',
    breakStart: '15:00',
    breakEnd: '15:45'
  },
  'barber-kabir': {
    barberId: 'barber-kabir',
    barberName: 'Kabir Singhania',
    workDays: [0, 1, 2, 4, 5, 6], // Thu - Tue (Wed Off)
    shiftStart: '10:30',
    shiftEnd: '20:00',
    breakStart: '14:30',
    breakEnd: '15:15'
  },
  'barber-arjun': {
    barberId: 'barber-arjun',
    barberName: 'Arjun Mehra',
    workDays: [1, 2, 3, 4, 5, 6], // Mon - Sat (Sun Off)
    shiftStart: '09:30',
    shiftEnd: '18:30',
    breakStart: '13:30',
    breakEnd: '14:15'
  }
};

export const VALID_COUPONS: CouponRule[] = [
  {
    code: 'GENTS15',
    discountPercent: 15,
    minOrder: 500,
    maxDiscount: 500,
    description: '15% off first haircut or bespoke grooming service',
    expiresAt: '2026-12-31'
  },
  {
    code: 'ROYAL100',
    discountFlat: 100,
    minOrder: 500,
    description: '₹100 flat courtesy discount on royal treatments',
    expiresAt: '2026-12-31'
  },
  {
    code: 'LUXURY20',
    discountPercent: 20,
    minOrder: 1500,
    maxDiscount: 1000,
    description: '20% off all Combos & Groom luxury packages',
    expiresAt: '2026-12-31'
  },
  {
    code: 'FIRSTCUT',
    discountFlat: 150,
    minOrder: 600,
    description: '₹150 welcome gift for first-time gentlemen clients',
    expiresAt: '2026-12-31'
  }
];

export const BUFFER_MINUTES = 10;
export const LEAD_TIME_MINUTES = 60; // 1 hr minimum lead time
export const BOOKING_WINDOW_DAYS = 30; // 30 days advance booking

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function doIntervalsOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
  return Math.max(s1, s2) < Math.min(e1, e2);
}

export function createBarberBookingRouter(loadDB: () => any, saveDB: (db: any) => void): Router {
  const router = Router();

  // Helper to ensure db collections exist and seed initial demo bookings if empty
  const getCollections = () => {
    const db = loadDB();
    if (!db.barber_bookings) db.barber_bookings = [];
    if (!db.barber_blocked_slots) db.barber_blocked_slots = [];
    if (!db.barber_promotions || db.barber_promotions.length === 0) {
      db.barber_promotions = JSON.parse(JSON.stringify(initialBarberPromotions));
    }
    if (!db.coupon_redemptions) db.coupon_redemptions = [];

    // Seed sample bookings if empty
    if (db.barber_bookings.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const sampleBookings: BarberBooking[] = [
        {
          id: 'bbr_seed_01',
          bookingReference: 'TGD-2026-1042',
          services: [{ serviceId: 'srv-cut-03', name: 'Skin Fade', price: 950, duration: 45 }],
          serviceNames: 'Skin Fade',
          barberId: 'barber-vikram',
          barberName: 'Vikram "Blade" Rathore',
          appointmentDate: today,
          startTime: '11:00',
          endTime: '11:45',
          totalDurationMinutes: 45,
          bufferMinutes: 10,
          customerName: 'Devendra Shekhawat',
          customerPhone: '+91 98290 12345',
          customerEmail: 'devendra@example.com',
          notes: 'Low skin fade on sides, textured scissor top.',
          subtotalAmount: 950,
          discountAmount: 142.5,
          couponCode: 'GENTS15',
          taxAmount: 145.35,
          totalAmount: 807.5,
          status: 'Confirmed',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'bbr_seed_02',
          bookingReference: 'TGD-2026-1189',
          services: [
            { serviceId: 'srv-combo-01', name: 'Haircut + Beard Trim', price: 1050, duration: 60 },
            { serviceId: 'srv-scalp-07', name: 'Head Massage', price: 550, duration: 30 }
          ],
          serviceNames: 'Haircut + Beard Trim, Head Massage',
          barberId: 'barber-kabir',
          barberName: 'Kabir Singhania',
          appointmentDate: today,
          startTime: '15:30',
          endTime: '17:00',
          totalDurationMinutes: 90,
          bufferMinutes: 10,
          customerName: 'Aman Singhania',
          customerPhone: '+91 98291 99999',
          customerEmail: 'aman.singhania@gmail.com',
          notes: 'Prepare eucalyptus steam towels.',
          subtotalAmount: 1600,
          discountAmount: 320,
          couponCode: 'LUXURY20',
          taxAmount: 230.4,
          totalAmount: 1280,
          status: 'Checked In',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'bbr_seed_03',
          bookingReference: 'TGD-2026-2241',
          services: [{ serviceId: 'srv-cut-01', name: 'Classic Haircut', price: 750, duration: 45 }],
          serviceNames: 'Classic Haircut',
          barberId: 'barber-arjun',
          barberName: 'Arjun Mehra',
          appointmentDate: yesterday,
          startTime: '10:30',
          endTime: '11:15',
          totalDurationMinutes: 45,
          bufferMinutes: 10,
          customerName: 'Rohit Khandelwal',
          customerPhone: '+91 94140 22334',
          customerEmail: 'rohit.k@yahoo.com',
          subtotalAmount: 750,
          discountAmount: 100,
          couponCode: 'ROYAL100',
          taxAmount: 117,
          totalAmount: 650,
          status: 'Completed',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'bbr_seed_04',
          bookingReference: 'TGD-2026-3392',
          services: [{ serviceId: 'srv-beard-07', name: 'Hot Towel Shave', price: 650, duration: 35 }],
          serviceNames: 'Hot Towel Shave',
          barberId: 'barber-marcus',
          barberName: "Marcus D'Souza",
          appointmentDate: tomorrow,
          startTime: '12:00',
          endTime: '12:35',
          totalDurationMinutes: 35,
          bufferMinutes: 10,
          customerName: 'Yash Vardhan',
          customerPhone: '+91 97840 55667',
          customerEmail: 'yashv@outlook.com',
          subtotalAmount: 650,
          discountAmount: 0,
          taxAmount: 117,
          totalAmount: 650,
          status: 'Pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'bbr_seed_05',
          bookingReference: 'TGD-2026-4401',
          services: [{ serviceId: 'srv-combo-04', name: 'Premium Grooming Combo', price: 1899, duration: 90 }],
          serviceNames: 'Premium Grooming Combo',
          barberId: 'barber-vikram',
          barberName: 'Vikram "Blade" Rathore',
          appointmentDate: yesterday,
          startTime: '16:00',
          endTime: '17:30',
          totalDurationMinutes: 90,
          bufferMinutes: 10,
          customerName: 'Kunal Kapoor',
          customerPhone: '+91 91160 88990',
          customerEmail: 'kunal.kapoor@gmail.com',
          notes: 'Client had sudden flight delay.',
          subtotalAmount: 1899,
          discountAmount: 0,
          taxAmount: 341.82,
          totalAmount: 1899,
          status: 'Cancelled',
          cancellationReason: 'Emergency business flight departure',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: 'bbr_seed_06',
          bookingReference: 'TGD-2026-5510',
          services: [{ serviceId: 'srv-scalp-05', name: 'Hair Spa', price: 1250, duration: 60 }],
          serviceNames: 'Hair Spa',
          barberId: 'barber-arjun',
          barberName: 'Arjun Mehra',
          appointmentDate: yesterday,
          startTime: '14:30',
          endTime: '15:30',
          totalDurationMinutes: 60,
          bufferMinutes: 10,
          customerName: 'Samir Mathur',
          customerPhone: '+91 99280 77112',
          customerEmail: 'samir.m@gmail.com',
          subtotalAmount: 1250,
          discountAmount: 0,
          taxAmount: 225,
          totalAmount: 1250,
          status: 'No Show',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];

      db.barber_bookings = sampleBookings;
      saveDB(db);
    }

    return db;
  };

  // 1. Config endpoint
  router.get('/config', (req: Request, res: Response) => {
    res.json({
      leadTimeMinutes: LEAD_TIME_MINUTES,
      bookingWindowDays: BOOKING_WINDOW_DAYS,
      bufferMinutes: BUFFER_MINUTES,
      barbers: Object.values(BARBER_SCHEDULES),
      coupons: VALID_COUPONS
    });
  });

  // Server-authoritative coupon validator
  const validateCouponServer = (
    db: any,
    code: string,
    subtotal: number,
    customerPhone?: string,
    serviceIds?: string[]
  ) => {
    if (!code || !code.trim()) {
      return { valid: false, error: 'Please provide a coupon code.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const promotions: PromotionCampaign[] = db.barber_promotions || [];

    // Search campaign by code
    let campaign = promotions.find(p => p.couponCode.toUpperCase() === cleanCode);

    // Fallback search in legacy VALID_COUPONS if not found in promotions
    if (!campaign) {
      const legacy = VALID_COUPONS.find(c => c.code.toUpperCase() === cleanCode);
      if (legacy) {
        campaign = {
          id: `legacy-${legacy.code.toLowerCase()}`,
          campaignName: legacy.description,
          description: legacy.description,
          discountType: legacy.discountPercent ? 'percentage' : 'fixed',
          discountValue: legacy.discountPercent || legacy.discountFlat || 0,
          couponCode: legacy.code,
          startDate: '2026-01-01',
          expiryDate: legacy.expiresAt,
          minPurchase: legacy.minOrder,
          maxDiscount: legacy.maxDiscount,
          applicableItems: ['All Services'],
          usageLimit: 500,
          currentUsageCount: 10,
          perCustomerLimit: 2,
          isActive: true,
          termsAndConditions: [legacy.description],
          category: 'first_visit',
          isGenuineTimeLimited: false
        };
      }
    }

    if (!campaign) {
      return {
        valid: false,
        error: `Invalid coupon code "${cleanCode}". Please check our active offers or try FIRSTCUT15.`
      };
    }

    // 1. Active status check
    if (!campaign.isActive) {
      return {
        valid: false,
        error: `Promotion "${campaign.campaignName}" is currently paused or inactive.`
      };
    }

    // 2. Date window validation
    const todayStr = new Date().toISOString().split('T')[0];
    if (campaign.startDate && todayStr < campaign.startDate) {
      return {
        valid: false,
        error: `This promotional campaign is not yet active. Valid from ${campaign.startDate}.`
      };
    }

    if (campaign.expiryDate && todayStr > campaign.expiryDate) {
      return {
        valid: false,
        error: `Coupon "${campaign.couponCode}" expired on ${campaign.expiryDate}.`
      };
    }

    // 3. Genuine time-limited countdown check
    if (campaign.countdownEndsAt) {
      const expiryMs = new Date(campaign.countdownEndsAt).getTime();
      if (!isNaN(expiryMs) && Date.now() > expiryMs) {
        return {
          valid: false,
          error: `The genuine time limit for "${campaign.campaignName}" has concluded.`
        };
      }
    }

    // 4. Overall campaign usage limit
    if (campaign.usageLimit && (campaign.currentUsageCount || 0) >= campaign.usageLimit) {
      return {
        valid: false,
        error: `Promotion "${campaign.couponCode}" has reached its maximum total redemption cap.`
      };
    }

    // 5. Per-customer limit check
    if (customerPhone && campaign.perCustomerLimit) {
      const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 7) {
        const pastBookings = (db.barber_bookings || []).filter((b: BarberBooking) => {
          const matchPhone = b.customerPhone && b.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone);
          const matchCode = b.couponCode && b.couponCode.toUpperCase() === cleanCode;
          return matchPhone && matchCode && b.status !== 'Cancelled';
        });

        const pastRedemptions = (db.coupon_redemptions || []).filter((r: any) => {
          const matchPhone = r.customerPhone && r.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone);
          const matchCode = r.couponCode && r.couponCode.toUpperCase() === cleanCode;
          return matchPhone && matchCode;
        });

        const totalUsedByCustomer = Math.max(pastBookings.length, pastRedemptions.length);
        if (totalUsedByCustomer >= campaign.perCustomerLimit) {
          return {
            valid: false,
            error: `You have reached the maximum allowed redemptions (${campaign.perCustomerLimit}) for code "${campaign.couponCode}".`
          };
        }
      }
    }

    // 6. Minimum purchase validation
    const orderSubtotal = Math.max(0, Number(subtotal) || 0);
    if (orderSubtotal < campaign.minPurchase) {
      return {
        valid: false,
        error: `Coupon "${campaign.couponCode}" requires a minimum order of ₹${campaign.minPurchase} (current order: ₹${orderSubtotal}).`
      };
    }

    // 7. Calculate discount
    let discount = 0;
    if (campaign.discountType === 'percentage') {
      discount = (orderSubtotal * campaign.discountValue) / 100;
      if (campaign.maxDiscount && discount > campaign.maxDiscount) {
        discount = campaign.maxDiscount;
      }
    } else {
      discount = Math.min(campaign.discountValue, orderSubtotal);
    }

    discount = Math.round(discount);
    const totalAfterDiscount = Math.max(0, orderSubtotal - discount);
    const savingsPercentage = orderSubtotal > 0 ? Math.round((discount / orderSubtotal) * 100) : 0;

    return {
      valid: true,
      code: campaign.couponCode,
      campaignId: campaign.id,
      campaignName: campaign.campaignName,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      discountAmount: discount,
      subtotal: orderSubtotal,
      totalAfterDiscount,
      description: campaign.description,
      savingsPercentage,
      termsSummary: campaign.termsAndConditions?.[0] || 'Exclusive studio courtesy discount'
    };
  };

  // 2. Promotions Public List
  router.get('/promotions', (req: Request, res: Response) => {
    const db = getCollections();
    const category = req.query.category as string;
    let list: PromotionCampaign[] = (db.barber_promotions || []).filter((p: PromotionCampaign) => p.isActive);

    if (category && category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    res.json(list);
  });

  // Admin: Get all promotions with stats
  router.get('/promotions/all', (req: Request, res: Response) => {
    const db = getCollections();
    const promotions: PromotionCampaign[] = db.barber_promotions || [];
    const redemptions = db.coupon_redemptions || [];

    const totalSavings = redemptions.reduce((acc: number, r: any) => acc + (Number(r.discountApplied) || 0), 0);

    res.json({
      promotions,
      stats: {
        totalCampaigns: promotions.length,
        activeCampaigns: promotions.filter(p => p.isActive).length,
        totalRedemptions: redemptions.length,
        totalCustomerSavings: totalSavings
      }
    });
  });

  // Admin: Create promotion
  router.post('/promotions', (req: Request, res: Response) => {
    const db = getCollections();
    const newCampaign: PromotionCampaign = {
      id: `promo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      currentUsageCount: 0,
      isActive: true,
      ...req.body
    };

    if (!newCampaign.campaignName || !newCampaign.couponCode || !newCampaign.discountValue) {
      return res.status(400).json({ error: 'campaignName, couponCode, and discountValue are required.' });
    }

    newCampaign.couponCode = newCampaign.couponCode.trim().toUpperCase();
    db.barber_promotions.push(newCampaign);
    saveDB(db);

    res.status(201).json({ success: true, campaign: newCampaign });
  });

  // Admin: Update promotion
  router.put('/promotions/:id', (req: Request, res: Response) => {
    const db = getCollections();
    const { id } = req.params;
    const idx = (db.barber_promotions || []).findIndex((p: PromotionCampaign) => p.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Promotion campaign not found' });
    }

    db.barber_promotions[idx] = {
      ...db.barber_promotions[idx],
      ...req.body
    };
    saveDB(db);

    res.json({ success: true, campaign: db.barber_promotions[idx] });
  });

  // Admin: Delete promotion
  router.delete('/promotions/:id', (req: Request, res: Response) => {
    const db = getCollections();
    const { id } = req.params;
    db.barber_promotions = (db.barber_promotions || []).filter((p: PromotionCampaign) => p.id !== id);
    saveDB(db);

    res.json({ success: true, message: 'Promotion removed' });
  });

  // Dedicated Coupon Validation Endpoint
  router.post('/promotions/validate', (req: Request, res: Response) => {
    const db = getCollections();
    const { code, subtotal, customerPhone, serviceIds } = req.body;

    const result = validateCouponServer(db, code, subtotal, customerPhone, serviceIds);
    if (!result.valid) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Backwards-compatible /validate-coupon endpoint used by BookingWizard
  router.post('/validate-coupon', (req: Request, res: Response) => {
    const db = getCollections();
    const { code, subtotal, customerPhone, serviceIds } = req.body;

    const result = validateCouponServer(db, code, subtotal, customerPhone, serviceIds);
    if (!result.valid) {
      return res.status(400).json({ error: result.error, valid: false });
    }

    res.json({
      valid: true,
      code: result.code,
      discountAmount: result.discountAmount,
      description: result.description,
      totalAfterDiscount: result.totalAfterDiscount
    });
  });

  // 3. Available Slots (Server-Authoritative Real-Time Calculation)
  router.get('/available-slots', (req: Request, res: Response) => {
    const db = getCollections();
    const dateStr = req.query.date as string;
    const requestedBarberId = (req.query.barberId as string) || 'any';
    const totalDuration = parseInt(req.query.totalDuration as string, 10) || 45;

    if (!dateStr) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const targetDate = new Date(`${dateStr}T00:00:00`);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, ...
    const todayStr = new Date().toISOString().split('T')[0];
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const isToday = dateStr === todayStr;

    // Determine barbers to evaluate
    let candidateBarbers: BarberWorkingHours[] = [];
    if (requestedBarberId !== 'any') {
      const barber = BARBER_SCHEDULES[requestedBarberId];
      if (barber) candidateBarbers = [barber];
    } else {
      candidateBarbers = Object.values(BARBER_SCHEDULES);
    }

    // Filter candidate barbers working on this day of week
    candidateBarbers = candidateBarbers.filter(b => b.workDays.includes(dayOfWeek));

    if (candidateBarbers.length === 0) {
      return res.json({
        date: dateStr,
        requestedBarberId,
        totalDuration,
        bufferMinutes: BUFFER_MINUTES,
        slots: [],
        message: 'No master barbers on duty for this day.'
      });
    }

    // Existing active bookings on target date
    const existingBookings: BarberBooking[] = (db.barber_bookings || []).filter(
      (b: BarberBooking) => b.appointmentDate === dateStr && b.status !== 'Cancelled'
    );

    // Blocked slots on target date
    const blockedSlots: BlockedSlot[] = (db.barber_blocked_slots || []).filter(
      (b: BlockedSlot) => b.date === dateStr
    );

    // Collect all candidate 15-minute interval start times
    // From earliest shift start to latest shift end
    let earliestStart = Math.min(...candidateBarbers.map(b => timeToMinutes(b.shiftStart)));
    let latestEnd = Math.max(...candidateBarbers.map(b => timeToMinutes(b.shiftEnd)));

    const availableSlotsMap = new Map<string, { time: string; endTime: string; barberId: string; barberName: string }>();

    for (let slotStart = earliestStart; slotStart + totalDuration <= latestEnd; slotStart += 15) {
      const slotEnd = slotStart + totalDuration;
      const effectiveSlotEnd = slotEnd + BUFFER_MINUTES;

      // Lead time check: If today, slot must be at least LEAD_TIME_MINUTES into the future
      if (isToday && slotStart < nowMinutes + LEAD_TIME_MINUTES) {
        continue;
      }

      // Check which barber(s) can accommodate this slot
      for (const barber of candidateBarbers) {
        const barberStart = timeToMinutes(barber.shiftStart);
        const barberEnd = timeToMinutes(barber.shiftEnd);
        const breakStart = timeToMinutes(barber.breakStart);
        const breakEnd = timeToMinutes(barber.breakEnd);

        // Within shift?
        if (slotStart < barberStart || slotEnd > barberEnd) {
          continue;
        }

        // Intersects break?
        if (doIntervalsOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
          continue;
        }

        // Intersects blocked slots?
        const isBlocked = blockedSlots.some(bs => {
          if (bs.barberId && bs.barberId !== barber.barberId) return false;
          if (!bs.startTime || !bs.endTime) return true; // Entire day blocked
          return doIntervalsOverlap(slotStart, effectiveSlotEnd, timeToMinutes(bs.startTime), timeToMinutes(bs.endTime));
        });
        if (isBlocked) continue;

        // Intersects existing bookings for this barber?
        const hasConflict = existingBookings.some(eb => {
          if (eb.barberId !== barber.barberId) return false;
          const ebStart = timeToMinutes(eb.startTime);
          const ebEnd = timeToMinutes(eb.endTime) + (eb.bufferMinutes || BUFFER_MINUTES);
          return doIntervalsOverlap(slotStart, effectiveSlotEnd, ebStart, ebEnd);
        });
        if (hasConflict) continue;

        // Slot is genuine and available!
        const timeKey = minutesToTime(slotStart);
        if (!availableSlotsMap.has(timeKey)) {
          availableSlotsMap.set(timeKey, {
            time: timeKey,
            endTime: minutesToTime(slotEnd),
            barberId: barber.barberId,
            barberName: barber.barberName
          });
        }
        break; // Found an available barber for this slot time
      }
    }

    const sortedSlots = Array.from(availableSlotsMap.values()).sort(
      (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
    );

    res.json({
      date: dateStr,
      requestedBarberId,
      totalDuration,
      bufferMinutes: BUFFER_MINUTES,
      slots: sortedSlots
    });
  });

  // 4. Validate a single slot before proceeding
  router.post('/validate-slot', (req: Request, res: Response) => {
    const db = getCollections();
    const { appointmentDate, startTime, totalDuration, barberId } = req.body;

    if (!appointmentDate || !startTime || !totalDuration) {
      return res.status(400).json({ error: 'Missing appointmentDate, startTime, or totalDuration' });
    }

    const slotStart = timeToMinutes(startTime);
    const slotEnd = slotStart + Number(totalDuration);
    const effectiveSlotEnd = slotEnd + BUFFER_MINUTES;

    const existingBookings: BarberBooking[] = (db.barber_bookings || []).filter(
      (b: BarberBooking) => b.appointmentDate === appointmentDate && b.status !== 'Cancelled'
    );

    let assignedBarber: BarberWorkingHours | null = null;

    if (barberId && barberId !== 'any') {
      const b = BARBER_SCHEDULES[barberId];
      if (!b) return res.status(404).json({ error: 'Barber not found' });
      
      const hasConflict = existingBookings.some(eb => {
        if (eb.barberId !== barberId) return false;
        const ebStart = timeToMinutes(eb.startTime);
        const ebEnd = timeToMinutes(eb.endTime) + (eb.bufferMinutes || BUFFER_MINUTES);
        return doIntervalsOverlap(slotStart, effectiveSlotEnd, ebStart, ebEnd);
      });

      if (hasConflict) {
        return res.status(409).json({ available: false, error: 'This barber is already booked for this slot.' });
      }
      assignedBarber = b;
    } else {
      // Find first available barber
      for (const b of Object.values(BARBER_SCHEDULES)) {
        const hasConflict = existingBookings.some(eb => {
          if (eb.barberId !== b.barberId) return false;
          const ebStart = timeToMinutes(eb.startTime);
          const ebEnd = timeToMinutes(eb.endTime) + (eb.bufferMinutes || BUFFER_MINUTES);
          return doIntervalsOverlap(slotStart, effectiveSlotEnd, ebStart, ebEnd);
        });
        if (!hasConflict) {
          assignedBarber = b;
          break;
        }
      }
    }

    if (!assignedBarber) {
      return res.status(409).json({ available: false, error: 'No barber is available for this time slot.' });
    }

    res.json({
      available: true,
      assignedBarberId: assignedBarber.barberId,
      assignedBarberName: assignedBarber.barberName
    });
  });

  // 5. Create Booking (Strict Double-Booking Check & DB Save)
  router.post('/create', (req: Request, res: Response) => {
    const db = getCollections();
    const {
      services,
      barberId = 'any',
      appointmentDate,
      startTime,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      couponCode
    } = req.body;

    if (!services || !services.length || !appointmentDate || !startTime || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'All essential booking fields are required.' });
    }

    // Compute total duration and amounts
    let totalDuration = 0;
    let subtotalAmount = 0;
    const serviceNamesArray: string[] = [];

    services.forEach((s: any) => {
      totalDuration += Number(s.duration) || 0;
      subtotalAmount += Number(s.price) || 0;
      serviceNamesArray.push(s.name);
      if (s.addOns && Array.isArray(s.addOns)) {
        s.addOns.forEach((ao: any) => {
          totalDuration += Number(ao.duration) || 0;
          subtotalAmount += Number(ao.price) || 0;
        });
      }
    });

    const slotStart = timeToMinutes(startTime);
    const slotEnd = slotStart + totalDuration;
    const effectiveSlotEnd = slotEnd + BUFFER_MINUTES;

    // Check against DB in real time before creating
    const existingBookings: BarberBooking[] = (db.barber_bookings || []).filter(
      (b: BarberBooking) => b.appointmentDate === appointmentDate && b.status !== 'Cancelled'
    );

    let assignedBarber: BarberWorkingHours | null = null;

    if (barberId !== 'any') {
      const b = BARBER_SCHEDULES[barberId];
      if (!b) return res.status(400).json({ error: 'Selected barber is not registered.' });

      const hasConflict = existingBookings.some(eb => {
        if (eb.barberId !== barberId) return false;
        const ebStart = timeToMinutes(eb.startTime);
        const ebEnd = timeToMinutes(eb.endTime) + (eb.bufferMinutes || BUFFER_MINUTES);
        return doIntervalsOverlap(slotStart, effectiveSlotEnd, ebStart, ebEnd);
      });

      if (hasConflict) {
        return res.status(409).json({
          error: 'Double-Booking Prevented: This time slot was just confirmed for another client. Please choose another time.'
        });
      }
      assignedBarber = b;
    } else {
      // Find candidate barber without conflict
      const dayOfWeek = new Date(`${appointmentDate}T00:00:00`).getDay();
      for (const b of Object.values(BARBER_SCHEDULES)) {
        if (!b.workDays.includes(dayOfWeek)) continue;
        const bStart = timeToMinutes(b.shiftStart);
        const bEnd = timeToMinutes(b.shiftEnd);
        if (slotStart < bStart || slotEnd > bEnd) continue;

        const hasConflict = existingBookings.some(eb => {
          if (eb.barberId !== b.barberId) return false;
          const ebStart = timeToMinutes(eb.startTime);
          const ebEnd = timeToMinutes(eb.endTime) + (eb.bufferMinutes || BUFFER_MINUTES);
          return doIntervalsOverlap(slotStart, effectiveSlotEnd, ebStart, ebEnd);
        });

        if (!hasConflict) {
          assignedBarber = b;
          break;
        }
      }
    }

    if (!assignedBarber) {
      return res.status(409).json({
        error: 'Double-Booking Prevented: No available chairs remain for this time window. Please pick a neighboring slot.'
      });
    }

    // Process coupon with rigorous server-side validation
    let discountAmount = 0;
    let validatedCouponData: any = null;

    if (couponCode && couponCode.trim()) {
      const couponCheck = validateCouponServer(
        db,
        couponCode,
        subtotalAmount,
        customerPhone,
        services.map((s: any) => s.serviceId)
      );

      if (!couponCheck.valid) {
        return res.status(400).json({
          error: `Coupon verification failed: ${couponCheck.error}`
        });
      }

      discountAmount = couponCheck.discountAmount;
      validatedCouponData = couponCheck;

      // Increment campaign usage count
      if (couponCheck.campaignId) {
        const camp = (db.barber_promotions || []).find((p: PromotionCampaign) => p.id === couponCheck.campaignId || p.couponCode.toUpperCase() === couponCheck.code.toUpperCase());
        if (camp) {
          camp.currentUsageCount = (camp.currentUsageCount || 0) + 1;
        }
      }
    }

    discountAmount = Math.round(Math.min(discountAmount, subtotalAmount));
    const discountedSubtotal = subtotalAmount - discountAmount;
    // 18% GST calculation (included in indicative tariff)
    const taxAmount = Math.round(discountedSubtotal * 0.18 * 100) / 100;
    const totalAmount = discountedSubtotal;

    // Unique Booking Reference
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `TGD-${new Date().getFullYear()}-${randomDigits}`;

    const newBooking: BarberBooking = {
      id: `bbr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookingReference,
      services,
      serviceNames: serviceNamesArray.join(', '),
      barberId: assignedBarber.barberId,
      barberName: assignedBarber.barberName,
      appointmentDate,
      startTime,
      endTime: minutesToTime(slotEnd),
      totalDurationMinutes: totalDuration,
      bufferMinutes: BUFFER_MINUTES,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      notes: notes || '',
      couponCode: discountAmount > 0 ? couponCode : undefined,
      subtotalAmount,
      discountAmount,
      taxAmount,
      totalAmount,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      cancellationAllowedUntil: `${appointmentDate}T${minutesToTime(Math.max(0, slotStart - 120))}:00`
    };

    db.barber_bookings.push(newBooking);

    // Record coupon redemption in ledger
    if (discountAmount > 0 && validatedCouponData) {
      if (!db.coupon_redemptions) db.coupon_redemptions = [];
      db.coupon_redemptions.push({
        id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        campaignId: validatedCouponData.campaignId || 'legacy',
        couponCode: validatedCouponData.code,
        bookingReference: newBooking.bookingReference,
        customerPhone,
        customerName,
        orderSubtotal: subtotalAmount,
        discountApplied: discountAmount,
        redeemedAt: new Date().toISOString()
      });
    }

    // Also record audit log in db
    if (!db.audit_logs) db.audit_logs = [];
    db.audit_logs.push({
      id: `aud_${Date.now()}`,
      event: 'barber_booking_confirmed',
      reference_id: newBooking.bookingReference,
      description: `Appointment reserved for ${customerName} (${customerPhone}) with ${assignedBarber.barberName} on ${appointmentDate} at ${startTime}. Total: ₹${totalAmount}. ${discountAmount > 0 ? `Applied coupon ${couponCode} saving ₹${discountAmount}.` : ''}`,
      created_at: new Date().toISOString()
    });

    saveDB(db);

    res.status(201).json({
      success: true,
      bookingReference: newBooking.bookingReference,
      booking: newBooking
    });
  });

  // 6. Customer Lookup (by phone or booking reference)
  router.get('/lookup', (req: Request, res: Response) => {
    const db = getCollections();
    const query = (req.query.query as string || '').trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Search query required (phone number or booking reference)' });
    }

    const cleanPhone = query.replace(/[^0-9]/g, '');

    const matches = (db.barber_bookings || []).filter((b: BarberBooking) => {
      const matchRef = b.bookingReference.toLowerCase().includes(query);
      const matchPhone = cleanPhone && b.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone);
      const matchName = b.customerName.toLowerCase().includes(query);
      return matchRef || matchPhone || matchName;
    });

    res.json(matches);
  });

  // 7. Admin: Get all bookings (with search, status filter, date range, calendar view)
  router.get('/all', (req: Request, res: Response) => {
    const db = getCollections();
    const { search, status, barberId, date } = req.query;

    let list: BarberBooking[] = [...(db.barber_bookings || [])];

    if (search) {
      const q = (search as string).toLowerCase().trim();
      const cleanPhone = q.replace(/[^0-9]/g, '');
      list = list.filter(b => 
        b.bookingReference.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        (cleanPhone && b.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone)) ||
        b.serviceNames.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      list = list.filter(b => b.status.toLowerCase() === (status as string).toLowerCase());
    }

    if (barberId && barberId !== 'all') {
      list = list.filter(b => b.barberId === barberId);
    }

    if (date) {
      list = list.filter(b => b.appointmentDate === date);
    }

    // Sort by date and start time descending
    list.sort((a, b) => {
      const dateComp = b.appointmentDate.localeCompare(a.appointmentDate);
      if (dateComp !== 0) return dateComp;
      return b.startTime.localeCompare(a.startTime);
    });

    res.json(list);
  });

  // 8. Update Booking Status (Pending, Confirmed, Checked In, Completed, Cancelled, No Show)
  router.put('/:id/status', (req: Request, res: Response) => {
    const db = getCollections();
    const { id } = req.params;
    const { status, cancellationReason, isCustomerCancellation } = req.body;

    const validStatuses: BarberBookingStatus[] = ['Pending', 'Confirmed', 'Checked In', 'Completed', 'Cancelled', 'No Show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const idx = (db.barber_bookings || []).findIndex((b: BarberBooking) => b.id === id || b.bookingReference === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = db.barber_bookings[idx];

    // Customer cancellation policy: Must be at least 2 hours prior to scheduled chair time
    if (isCustomerCancellation && status === 'Cancelled') {
      const bookingDateTime = new Date(`${booking.appointmentDate}T${booking.startTime}:00`).getTime();
      const twoHoursAhead = Date.now() + 2 * 3600 * 1000;
      if (bookingDateTime < twoHoursAhead) {
        return res.status(400).json({
          error: 'Cancellations within 2 hours of appointment time cannot be self-cancelled. Please contact our concierge desk directly at +91 98290 12345.'
        });
      }
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    saveDB(db);

    res.json({ success: true, booking });
  });

  // 9. Reschedule Booking (with Server-Side Validation)
  router.put('/:id/reschedule', (req: Request, res: Response) => {
    const db = getCollections();
    const { id } = req.params;
    const { newDate, newTime, newBarberId } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({ error: 'newDate and newTime are required.' });
    }

    const idx = (db.barber_bookings || []).findIndex((b: BarberBooking) => b.id === id || b.bookingReference === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = db.barber_bookings[idx];
    const targetBarberId = newBarberId || booking.barberId;
    const barber = BARBER_SCHEDULES[targetBarberId];
    if (!barber) {
      return res.status(400).json({ error: 'Selected barber is invalid.' });
    }

    const slotStart = timeToMinutes(newTime);
    const slotEnd = slotStart + booking.totalDurationMinutes;
    const effectiveSlotEnd = slotEnd + BUFFER_MINUTES;

    // Check conflict
    const conflicts = (db.barber_bookings || []).filter((b: BarberBooking) => 
      b.id !== booking.id &&
      b.appointmentDate === newDate &&
      b.barberId === targetBarberId &&
      b.status !== 'Cancelled' &&
      doIntervalsOverlap(slotStart, effectiveSlotEnd, timeToMinutes(b.startTime), timeToMinutes(b.endTime) + BUFFER_MINUTES)
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Requested rescheduling time slot is already booked. Please pick another slot.' });
    }

    booking.appointmentDate = newDate;
    booking.startTime = newTime;
    booking.endTime = minutesToTime(slotEnd);
    booking.barberId = barber.barberId;
    booking.barberName = barber.barberName;
    booking.updatedAt = new Date().toISOString();
    booking.cancellationAllowedUntil = `${newDate}T${minutesToTime(Math.max(0, slotStart - 120))}:00`;

    saveDB(db);

    res.json({ success: true, booking });
  });

  // 10. Blocked Slots & Holidays (Admin)
  router.get('/blocked-slots', (req: Request, res: Response) => {
    const db = getCollections();
    res.json(db.barber_blocked_slots || []);
  });

  router.post('/block-slot', (req: Request, res: Response) => {
    const db = getCollections();
    const { barberId, date, startTime, endTime, reason } = req.body;
    if (!date || !reason) {
      return res.status(400).json({ error: 'Date and reason are required.' });
    }

    const newBlocked: BlockedSlot = {
      id: `blk_${Date.now()}`,
      barberId: barberId || undefined,
      date,
      startTime,
      endTime,
      reason
    };

    db.barber_blocked_slots.push(newBlocked);
    saveDB(db);

    res.status(201).json({ success: true, blockedSlot: newBlocked });
  });

  router.delete('/blocked-slots/:id', (req: Request, res: Response) => {
    const db = getCollections();
    const { id } = req.params;
    db.barber_blocked_slots = (db.barber_blocked_slots || []).filter((b: BlockedSlot) => b.id !== id);
    saveDB(db);
    res.json({ success: true, message: 'Blocked slot removed.' });
  });

  return router;
}
