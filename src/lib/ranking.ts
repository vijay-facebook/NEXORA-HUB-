// Ranking calculation utility

/**
 * Calculates the 'Top Jaipur' ranking score for a salon.
 * 
 * Formula:
 * - 40% QR Payments Volume (normalized)
 * - 35% Booking Volume (normalized) 
 * - 25% Reviews (Rating & Volume normalized)
 */

interface SalonMetrics {
  qrPaymentsTotal: number;
  bookingsTotal: number;
  averageRating: number;
  totalReviews: number;
}

export function calculateTopJaipurScore(
  metrics: SalonMetrics, 
  maxMetricsInCity: { maxQrPayments: number, maxBookings: number, maxReviews: number }
): number {
  const { qrPaymentsTotal, bookingsTotal, averageRating, totalReviews } = metrics;
  const { maxQrPayments, maxBookings, maxReviews } = maxMetricsInCity;

  // Normalize scores to a 0-1 scale
  const normalizedQrPayments = maxQrPayments > 0 ? Math.min(qrPaymentsTotal / maxQrPayments, 1) : 0;
  const normalizedBookings = maxBookings > 0 ? Math.min(bookingsTotal / maxBookings, 1) : 0;
  
  // Review score is a combination of quantity and quality
  const normalizedReviewVolume = maxReviews > 0 ? Math.min(totalReviews / maxReviews, 1) : 0;
  // Rating is on a 0-5 scale, normalize to 0-1
  const normalizedRating = Math.max(0, Math.min(averageRating / 5, 1));
  
  // Combine review metrics (e.g. 70% rating, 30% volume)
  const compositeReviewScore = (normalizedRating * 0.7) + (normalizedReviewVolume * 0.3);

  // Apply weights
  // 40% QR payments, 35% bookings, 25% reviews
  const score = (normalizedQrPayments * 0.40) + (normalizedBookings * 0.35) + (compositeReviewScore * 0.25);

  // Return score out of 100
  return Math.round(score * 100);
}
