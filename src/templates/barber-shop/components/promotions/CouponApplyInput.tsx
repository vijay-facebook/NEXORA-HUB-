import React, { useState } from 'react';
import { Tag, Check, AlertCircle, RefreshCw, X } from 'lucide-react';
import { CouponValidationResponse } from '../../types/promotions';

interface CouponApplyInputProps {
  orderSubtotal: number;
  customerPhone?: string;
  serviceIds?: string[];
  appliedCoupon?: CouponValidationResponse | null;
  onCouponApplied: (result: CouponValidationResponse) => void;
  onCouponRemoved: () => void;
  placeholder?: string;
}

export const CouponApplyInput: React.FC<CouponApplyInputProps> = ({
  orderSubtotal,
  customerPhone,
  serviceIds = [],
  appliedCoupon,
  onCouponApplied,
  onCouponRemoved,
  placeholder = 'Enter coupon code (e.g. FIRSTCUT15)'
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Please provide a coupon code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/barber-booking/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: trimmed,
          subtotal: orderSubtotal,
          customerPhone: customerPhone || '',
          serviceIds
        })
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.error || 'This promo code could not be applied.');
      } else {
        setError(null);
        setCode(data.code);
        onCouponApplied(data);
      }
    } catch (err: any) {
      setError('Network error validating promotion code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setError(null);
    onCouponRemoved();
  };

  if (appliedCoupon && appliedCoupon.valid) {
    return (
      <div className="bg-[#181818] border border-emerald-500/40 p-3.5 rounded-xl flex items-center justify-between text-left animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-emerald-400 text-sm tracking-wider">
                {appliedCoupon.code}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Applied
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              {appliedCoupon.description} &bull; <strong className="text-emerald-400">Saved ₹{appliedCoupon.discountAmount}</strong>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs font-mono text-slate-400 hover:text-red-400 p-1.5 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          title="Remove coupon"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder={placeholder}
            className="w-full bg-[#181818] border border-[#3A362D] focus:border-[#C9A45C] text-[#F7F4EE] placeholder:text-slate-500 font-mono text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl uppercase tracking-wider outline-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleValidate();
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleValidate}
          disabled={isLoading || !code.trim()}
          className="bg-[#C9A45C] hover:bg-[#F1D9A3] disabled:opacity-50 disabled:cursor-not-allowed text-[#101010] text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Checking</span>
            </>
          ) : (
            <span>Apply Code</span>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-1.5 text-xs text-red-400 font-sans bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
