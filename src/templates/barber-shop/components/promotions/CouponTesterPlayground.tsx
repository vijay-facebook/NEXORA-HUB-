import React, { useState } from 'react';
import { ShieldCheck, Tag, Check, AlertCircle, RefreshCw, Calculator, Sparkles } from 'lucide-react';
import { CouponValidationResponse } from '../../types/promotions';

export const CouponTesterPlayground: React.FC = () => {
  const [testCode, setTestCode] = useState('FIRSTCUT15');
  const [testSubtotal, setTestSubtotal] = useState<number>(1200);
  const [testPhone, setTestPhone] = useState('+91 98290 12345');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CouponValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestCoupon = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/barber-booking/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: testCode.trim().toUpperCase(),
          subtotal: Number(testSubtotal) || 0,
          customerPhone: testPhone.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.error || 'Coupon rejected by server.');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError('Server validation failed due to network connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuickCodes = ['FIRSTCUT15', 'WEEKDAY20', 'DUOCRAFT250', 'FESTIVAL30', 'STUDENT150', 'EXPIRED99'];

  return (
    <div className="bg-[#151515] border border-[#39352E] rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A45C]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#F1D9A3] text-[11px] font-mono uppercase tracking-wider font-semibold">
            <Calculator className="w-3.5 h-3.5 text-[#C9A45C]" />
            Live Verification Sandbox
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-black text-[#F7F4EE] mt-1">
            Real-Time Coupon Eligibility Checker
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Test any voucher code against server business rules, customer limits, and minimum basket requirements.
          </p>
        </div>

        {/* Quick select test codes */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Quick Test:</span>
          {sampleQuickCodes.map((qc) => (
            <button
              key={qc}
              type="button"
              onClick={() => {
                setTestCode(qc);
                setError(null);
                setResult(null);
              }}
              className={`px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer border ${
                testCode === qc
                  ? 'bg-[#C9A45C] text-[#101010] border-[#C9A45C] font-bold'
                  : 'bg-[#202020] text-slate-300 border-[#333] hover:border-[#C9A45C]'
              }`}
            >
              {qc}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Coupon Code
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              placeholder="e.g. FIRSTCUT15"
              className="w-full bg-[#1C1C1C] border border-[#3A362D] focus:border-[#C9A45C] text-[#F7F4EE] font-mono text-sm pl-9 pr-3 py-2.5 rounded-xl uppercase tracking-wider outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Estimated Basket (₹ INR)
          </label>
          <input
            type="number"
            value={testSubtotal}
            onChange={(e) => setTestSubtotal(Number(e.target.value))}
            className="w-full bg-[#1C1C1C] border border-[#3A362D] focus:border-[#C9A45C] text-[#F7F4EE] font-mono text-sm px-3.5 py-2.5 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Client Mobile (for limits)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#3A362D] focus:border-[#C9A45C] text-[#F7F4EE] font-mono text-sm px-3.5 py-2.5 rounded-xl outline-none"
            />
            <button
              onClick={handleTestCoupon}
              disabled={isLoading || !testCode.trim()}
              className="bg-[#C9A45C] hover:bg-[#F1D9A3] disabled:opacity-50 text-[#101010] font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Verify</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Validation Result Box */}
      {result && (
        <div className="bg-[#17231A] border border-emerald-500/40 p-4 sm:p-5 rounded-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-emerald-400 font-mono font-bold text-sm">
                VALID & AUTHORIZED &bull; {result.campaignName}
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full">
              {result.savingsPercentage}% Total Savings
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-black/40 p-3 rounded-xl border border-emerald-900/40">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">Gross Order</span>
              <span className="text-white font-bold">₹{result.subtotal}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">Discount Granted</span>
              <span className="text-emerald-400 font-bold">-₹{result.discountAmount}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">Payable Balance</span>
              <span className="text-[#F1D9A3] font-bold">₹{result.totalAfterDiscount}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">Benefit Rule</span>
              <span className="text-slate-300">
                {result.discountType === 'percentage' ? `${result.discountValue}% Off` : `₹${result.discountValue} Flat`}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-900/60 p-4 rounded-2xl flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-mono font-bold text-red-300 block uppercase tracking-wider">
              Verification Rejection
            </span>
            <p className="text-slate-300 font-sans leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
