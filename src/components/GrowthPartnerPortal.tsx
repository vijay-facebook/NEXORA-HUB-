/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Award, TrendingUp, Users, DollarSign, ArrowRight, 
  CheckCircle, Plus, Info, ShieldCheck, MapPin, Send, AlertTriangle
} from 'lucide-react';
import { api } from '../lib/supabase';
import { Partner, Tenant, Wallet, WalletTransaction } from '../types';

interface GrowthPartnerPortalProps {
  onRefreshDB: () => void;
}

export default function GrowthPartnerPortal({ onRefreshDB }: GrowthPartnerPortalProps) {
  // Application / Active flow state
  const [isRegistered, setIsRegistered] = useState(true); // default to true to showcase the rich preseeded partner app immediately!
  
  // Form State
  const [applyName, setApplyName] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyDistrict, setApplyDistrict] = useState('Jaipur (East)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Partner Dashboard States
  const [partner, setPartner] = useState<Partner | null>(null);
  const [onboardedShops, setOnboardedShops] = useState<Tenant[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch partner data
  const loadPartnerData = async () => {
    try {
      setLoading(true);
      const db = await api.getFullDB();
      
      // Load Sanjoy (Preseeded Jaipur partner)
      const activePartner = db.partners.find((p: any) => p.user_id === "usr_partner_jaipur");
      if (activePartner) {
        setPartner(activePartner);
        
        // Referred shops (Preseeded are all referred by Sanjoy for dashboard fullness)
        setOnboardedShops(db.tenants || []);

        // Load partner wallet & tx
        const partnerWallet = db.wallets.find((w: any) => w.owner_id === activePartner.user_id);
        if (partnerWallet) {
          setWallet(partnerWallet);
          const pTx = db.transactions.filter((tx: any) => tx.wallet_id === partnerWallet.id);
          setTransactions(pTx);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRegistered) {
      loadPartnerData();
    }
  }, [isRegistered]);

  // Handle Application submission
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyName || !applyPhone) return;
    try {
      setIsSubmitting(true);
      const res = await api.createPartner({
        full_name: applyName,
        phone: applyPhone,
        district: applyDistrict
      });
      if (res.success) {
        alert("Application successfully submitted! Welcome to the Nexora growth network. Reviewing KYC...");
        setIsRegistered(true);
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs">Authenticating Partner Network Wallet...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] p-6 md:p-8 space-y-8 text-left font-sans">
      
      {/* If partner NOT preseeded/registered, show promotional recruitment landing with apply form */}
      {!isRegistered ? (
        <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
          {/* Promotional Hero */}
          <div className="text-center space-y-4 py-10">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
              Nexora District Alliance
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Salary Nahi. <span className="text-emerald-600">Growth Share.</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              This is not a traditional job, not franchise, and strictly not MLM. Join as a regional Nexora Growth Partner. Earn recurring volume commissions from every verified salon transaction in your Jaipur sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Value proposition */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Partner Commission Ladder</h3>
              
              <div className="space-y-4 text-xs text-slate-600">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex gap-4">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900">One-Time Activation Bonus</h4>
                    <p className="mt-0.5">Earn 10% of total Nexora Platform Revenue gathered during the first 15 days of onboarding a shop.</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex gap-4">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900">First 6 Months: 10% Share</h4>
                    <p className="mt-0.5">Recurring growth share of 10% on Nexora platform collection fee cuts.</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex gap-4">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Months 7 to 12: 5% Share</h4>
                    <p className="mt-0.5">Stabilized monthly residual commission rate set to 5% of platform commission cuts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Apply Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Apply for Jaipur Region</h3>
              
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={applyName}
                    onChange={(e) => setApplyName(e.target.value)}
                    placeholder="e.g. Sanjay Singhal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    required
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    placeholder="e.g. 9414011111"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">District Focus Sector</label>
                  <select 
                    value={applyDistrict}
                    onChange={(e) => setApplyDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none cursor-pointer"
                  >
                    <option value="Jaipur (East)">Jaipur (East) - Malviya Nagar, Raja Park</option>
                    <option value="Jaipur (West)">Jaipur (West) - Vaishali, Sodala</option>
                    <option value="Jaipur (Central)">Jaipur (Central) - C-Scheme, Ashok Nagar</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/10"
                >
                  {isSubmitting ? "Sending application..." : "Submit Regional Application"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // Active Partner Dashboard
        <div className="space-y-8 animate-fadeIn">
          
          {/* Dashboard Header Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono inline-block">
                Referred Channel Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{partner?.full_name || 'Partner Executive'}</h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md font-light leading-relaxed">
                Referral Code: <span className="font-bold text-emerald-400 font-mono text-sm">{partner?.referral_code}</span> • Managing <span className="font-semibold text-white">{partner?.district}</span>
              </p>
            </div>
            <div className="flex gap-2 relative z-10">
              <button 
                onClick={() => setIsRegistered(false)}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
              >
                Log Out Partner View
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Total Salons Onboarded</span>
              <span className="text-2xl font-black text-slate-900">{onboardedShops.length} Shops</span>
              <span className="text-[10px] text-slate-400 block">Active referenced installations</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Referred Volume Gross Sales</span>
              <span className="text-2xl font-black text-indigo-600">Rs. 33,000</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded inline-block">Total referred retail ledger</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Referred Partner Wallet</span>
              <span className="text-2xl font-black text-emerald-600">Rs. {wallet?.available_balance || 0}</span>
              <span className="text-[10px] text-slate-400 block">Sweep scheduled weekly disburse</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Milestone Status Rank</span>
              <span className="text-2xl font-black text-slate-900">Silver Tier</span>
              <span className="text-[10px] text-slate-400 block">Next target: Gold Tier (+Rs 5k bonus)</span>
            </div>
          </section>

          {/* Partner Core Rule alert block */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-xs text-emerald-800">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block uppercase tracking-wider text-[10px]">Growth commission rules</span>
              <p className="leading-relaxed">
                Partner earns recurring residual commissions ONLY on successful completed Nexora Platform Revenue collections (not customer full bill amounts). The ladder is locked: 10% commission first 6 months, 5% months 7-12, 2% after 12 months. Paid out weekly after audit ledger verification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Referred Onboarded Shops list */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">My Referred Salon Network</h3>
                <p className="text-xs text-slate-500">Live operational audit metrics for salons onboarded with your refer code.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold">Salon Name</th>
                      <th className="p-3 font-bold">Location</th>
                      <th className="p-3 font-bold">Verification</th>
                      <th className="p-3 font-bold text-right">Last Collection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {onboardedShops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="font-bold text-slate-950">{shop.name}</div>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Owner Desk: {shop.phone}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700">{shop.area}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border inline-block uppercase ${
                            shop.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {shop.approval_status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          Rs. {shop.id === 'ten_aura' ? '15,400' : shop.id === 'ten_imperial' ? '5,200' : '12,400'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Recent commission transfers log */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">Recent Commission Logs</h3>
                <p className="text-xs text-slate-500">Chronological list of referred payout commissions received.</p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs font-medium">No referred commissions recorded yet.</div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 font-mono text-[10px]">
                      <div className="flex justify-between font-bold text-emerald-600">
                        <span>Commission Credited</span>
                        <span>+Rs. {tx.amount}</span>
                      </div>
                      <p className="font-sans text-[10px] text-slate-500 leading-normal">{tx.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
