/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle, XCircle, RefreshCw, 
  TrendingUp, Award, Settings, ListFilter, 
  HelpCircle, Calendar, ArrowRightLeft, Database, Search, Trophy, BarChart
} from 'lucide-react';
import { api } from '../lib/supabase';
import { Tenant, Wallet, Payout, Appointment, UserRole } from '../types';
import { calculateTopJaipurScore } from '../lib/ranking';

interface SuperAdminPanelProps {
  onRefreshDB: () => void;
}

export default function SuperAdminPanel({ onRefreshDB }: SuperAdminPanelProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'ranking'>('overview');
  // KYC modal states
  const [kycReason, setKycReason] = useState('Documents and location verified by regional partner.');

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const db = await api.getFullDB();
      setTenants(db.tenants || []);
      setWallets(db.wallets || []);
      setPayouts(db.payouts || []);
      setAuditLogs(db.audit_logs || []);
      setAppointments(db.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Compute rankings
  const computeRankings = () => {
    const activeTenants = tenants.filter(t => t.approval_status === 'approved' && t.is_active);
    
    // Calculate raw metrics for each salon
    const salonMetrics = activeTenants.map(salon => {
      const salonAppointments = appointments.filter(a => a.tenant_id === salon.id);
      
      const bookingsTotal = salonAppointments.length;
      // Mock QR Payments Total based on total amount paid in completed/paid appointments
      const qrPaymentsTotal = salonAppointments
        .filter(a => ['completed', 'confirmed'].includes(a.status))
        .reduce((sum, a) => sum + a.total_amount, 0);

      const averageRating = salon.rating || 0;
      const totalReviews = salon.reviews_count || 0;

      return {
        id: salon.id,
        name: salon.name,
        area: salon.area,
        city: salon.city,
        metrics: { qrPaymentsTotal, bookingsTotal, averageRating, totalReviews }
      };
    });

    // Find maximums for normalization
    const maxQrPayments = Math.max(...salonMetrics.map(s => s.metrics.qrPaymentsTotal), 1); // fallback to 1 to avoid /0
    const maxBookings = Math.max(...salonMetrics.map(s => s.metrics.bookingsTotal), 1);
    const maxReviews = Math.max(...salonMetrics.map(s => s.metrics.totalReviews), 1);

    // Calculate score
    const rankedSalons = salonMetrics.map(salon => {
      const score = calculateTopJaipurScore(salon.metrics, { maxQrPayments, maxBookings, maxReviews });
      return { ...salon, score };
    });

    return rankedSalons.sort((a, b) => b.score - a.score);
  };

  const rankedSalons = computeRankings();

  // Approve/Reject Shop
  const handleUpdateShopStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.updateTenant(id, {
        approval_status: status,
        is_verified: status === 'approved'
      });
      if (res.success) {
        alert(`Shop KYC status set to: ${status.toUpperCase()}`);
        fetchAdminData();
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger manual simulation payout sweep
  const handleTriggerPayout = async () => {
    try {
      const res = await api.triggerDailyPayouts();
      if (res.success && res.count > 0) {
        alert(`Daily 10:00 PM settlement sweep triggered! Generated ${res.count} payouts.`);
        fetchAdminData();
        onRefreshDB();
      } else {
        alert("Settlement complete. No available balances require sweep.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset entire database to pre-seeded values
  const handleResetDB = async () => {
    if (confirm("Are you sure you want to restore the entire operating database to Jaipur's default pre-seeded records?")) {
      try {
        const res = await api.resetDatabase();
        if (res.success) {
          alert("Database re-seeded successfully!");
          fetchAdminData();
          onRefreshDB();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Calculate platform aggregate stats
  const totalVolume = appointments.reduce((sum, a) => sum + a.total_amount, 0);
  // Platform revenue is 10% on completed appointments
  const platformRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.total_amount * 0.10), 0);

  const pendingKYC = tenants.filter(t => t.approval_status === 'pending');
  const activeSalons = tenants.filter(t => t.approval_status === 'approved' && t.is_active);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-rose-600 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs">Authenticating Server Role Credentials...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] p-6 md:p-8 space-y-8 text-left font-sans">
      
      {/* Header operations bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono inline-block">
            Operations Room
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Nexora Admin Controller</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md font-light leading-relaxed">
            Verify retail KYC submissions, monitor transaction escrow splits, and sweep daily payout ledgers.
          </p>
        </div>
        <div className="flex gap-2 relative z-10">
          <button 
            onClick={fetchAdminData}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button 
            onClick={handleTriggerPayout}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/10"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Run 10:00 PM Sweep</span>
          </button>
          <button 
            onClick={handleResetDB}
            className="px-4 py-2.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-rose-600 cursor-pointer flex items-center gap-1"
          >
            <Database className="w-4 h-4" />
            <span>Reset DB</span>
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'ranking' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Ranking Dashboard
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">


      {/* Stats Board */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Total Platform Volume</span>
          <span className="text-2xl font-black text-slate-900">Rs. {totalVolume}</span>
          <span className="text-[10px] text-slate-400 block">Cumulative salon booking values</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Nexora Platform Earnings (10%)</span>
          <span className="text-2xl font-black text-slate-900 text-rose-600">Rs. {platformRevenue.toFixed(1)}</span>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">10% completed commission share</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Pending KYCs</span>
          <span className="text-2xl font-black text-amber-600">{pendingKYC.length} Shops</span>
          <span className="text-[10px] text-slate-400 block">Require review & live slug triggers</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Approved Operators</span>
          <span className="text-2xl font-black text-indigo-600">{activeSalons.length} Live Sites</span>
          <span className="text-[10px] text-slate-400 block">Publish-ready white-labels</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: KYC Reviews */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-950 font-sans">Pending Salon KYC Submissions</h3>
            <p className="text-xs text-slate-500">Retail registrations requiring verification check before domain publish.</p>
          </div>

          {pendingKYC.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs font-medium">
              Zero pending salon KYC reviews today.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingKYC.map((shop) => (
                <div key={shop.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{shop.name}</h4>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-bold capitalize inline-block mt-1">{shop.business_type}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded">City: {shop.city} ({shop.area})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-600 py-2 border-y border-slate-200/50">
                    <div>Contact Desk: <span className="text-slate-950 font-semibold">{shop.phone}</span></div>
                    <div>Email Desk: <span className="text-slate-950 font-semibold">{shop.email}</span></div>
                    <div className="col-span-2">Address: <span className="text-slate-950 font-semibold">{shop.address}</span></div>
                  </div>

                  {/* Audit justification */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">KYC Settle Justification Reason</label>
                    <input 
                      type="text" 
                      value={kycReason}
                      onChange={(e) => setKycReason(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateShopStatus(shop.id, 'approved')}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Approve & Grant Live Slug
                    </button>
                    <button 
                      onClick={() => handleUpdateShopStatus(shop.id, 'rejected')}
                      className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Reject Submission
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Global Settlement Ledger Audits */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 text-left">
          <div>
            <h3 className="text-base font-bold text-slate-950 font-sans">Global Financial Ledger</h3>
            <p className="text-xs text-slate-500">Chronological platform settlement dispatches audited at 10:00 PM.</p>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl">No payouts swept yet.</div>
            ) : (
              payouts.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 font-mono text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-rose-600">Disbursed Sweep</span>
                    <span className="text-slate-950">Rs. {p.amount}</span>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-500 leading-normal">
                    <div>Dispatched: {p.payout_time.replace('T', ' ').substring(0, 19)}</div>
                    <div>Wallet Ref: {p.wallet_id}</div>
                    <div className="truncate">Ledger Hash: {p.ledger_hash}</div>
                  </div>
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 py-1 px-2 rounded inline-block">
                    ✓ SECURE BANK LEDGER CLEARED
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Top Jaipur Rankings Section */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-950 font-sans">Top Jaipur Algorithm Ranks</h3>
            </div>
            <p className="text-xs text-slate-500">Live scoring computed via: 40% QR Payments + 35% Bookings + 25% Reviews</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
              {rankedSalons.length} Active Partners
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium text-xs border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-16">Rank</th>
                <th className="px-4 py-3">Salon Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">QR Volume (Raw)</th>
                <th className="px-4 py-3 text-center">Bookings</th>
                <th className="px-4 py-3 text-center">Reviews (Avg)</th>
                <th className="px-4 py-3 text-right font-bold text-slate-900">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedSalons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">No active salons to rank.</td>
                </tr>
              ) : (
                rankedSalons.map((salon, index) => (
                  <tr key={salon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center font-bold">
                      {index === 0 ? <span className="text-amber-500">🥇 1</span> : 
                       index === 1 ? <span className="text-slate-400">🥈 2</span> : 
                       index === 2 ? <span className="text-amber-700">🥉 3</span> : 
                       <span className="text-slate-500">{index + 1}</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{salon.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{salon.area}, {salon.city}</td>
                    <td className="px-4 py-3 text-right text-slate-600">Rs. {salon.metrics.qrPaymentsTotal}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{salon.metrics.bookingsTotal}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{salon.metrics.averageRating.toFixed(1)} <span className="text-[10px] text-slate-400">({salon.metrics.totalReviews})</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${index < 3 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${salon.score}%` }}></div>
                        </div>
                        <span className={`font-black ${index < 3 ? 'text-amber-600' : 'text-slate-900'}`}>{salon.score}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Global Audit logs trace */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-950 font-sans">Chronological Operations Trace</h3>
          <p className="text-xs text-slate-500">Live ledger transaction event audit tracking for double-spend protection.</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-400 max-h-56 overflow-y-auto space-y-2">
          {auditLogs.length === 0 ? (
            <div className="text-center py-4 text-slate-500">No events audited in this operational run.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="border-b border-slate-800/50 pb-2">
                <span className="text-blue-400 font-bold">[{log.created_at.replace('T', ' ').substring(11, 19)}]</span>
                <span className="text-rose-500 font-bold ml-1.5 uppercase">[{log.event}]</span>
                <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">{log.description}</p>
              </div>
            ))
          )}
        </div>
      </section>


        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Jaipur Leaderboard
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Algorithmic ranking of active salons based on normalized QR volume, booking count, and verified reviews.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-tl-2xl">Rank</th>
                  <th className="px-4 py-3">Salon Info</th>
                  <th className="px-4 py-3 text-right">QR Volume (40%)</th>
                  <th className="px-4 py-3 text-right">Bookings (35%)</th>
                  <th className="px-4 py-3 text-right">Reviews (25%)</th>
                  <th className="px-4 py-3 text-right rounded-tr-2xl">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankedSalons.map((salon, idx) => (
                  <tr key={salon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{salon.name}</div>
                      <div className="text-[10px] text-slate-500">{salon.area}, {salon.city}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-mono text-slate-900">Rs. {salon.metrics.qrPaymentsTotal}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-slate-700">{salon.metrics.bookingsTotal}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-bold text-slate-700">{salon.metrics.averageRating.toFixed(1)} <span className="text-amber-500 text-[10px]">★</span></div>
                      <div className="text-[10px] text-slate-500">({salon.metrics.totalReviews})</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-md text-sm border border-indigo-100">
                        {salon.score}
                      </span>
                    </td>
                  </tr>
                ))}
                {rankedSalons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                      No active salons with metrics found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
