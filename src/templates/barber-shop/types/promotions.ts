import { PromotionCampaign, DiscountType } from '../../../types';

export type { PromotionCampaign, DiscountType };

export interface CouponValidationRequest {
  code: string;
  subtotal: number;
  customerPhone?: string;
  serviceIds?: string[];
  serviceNames?: string[];
}

export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  campaignId?: string;
  campaignName?: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  totalAfterDiscount: number;
  description: string;
  savingsPercentage: number;
  termsSummary?: string;
  error?: string;
}

export interface CouponRedemptionRecord {
  id: string;
  campaignId: string;
  couponCode: string;
  bookingReference?: string;
  customerPhone: string;
  customerName?: string;
  orderSubtotal: number;
  discountApplied: number;
  redeemedAt: string;
}
