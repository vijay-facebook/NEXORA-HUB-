/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, ShoppingBag, Send, UserCheck, Search, 
  MapPin, CheckCircle, Tag, TrendingUp, Info, HelpCircle
} from 'lucide-react';
import { api } from '../lib/supabase';
import { BrandProfile, DistributorProfile, BrandProduct, BrandLead } from '../types';

interface B2BBrandPortalProps {
  onRefreshDB: () => void;
}

export default function B2BBrandPortal({ onRefreshDB }: B2BBrandPortalProps) {
  // Tabs Navigation
  const [b2bTab, setB2bTab] = useState<'directory' | 'products' | 'leads'>('directory');

  // Core B2B data
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [distributors, setDistributors] = useState<DistributorProfile[]>([]);
  const [products, setProducts] = useState<BrandProduct[]>([]);
  const [leads, setLeads] = useState<BrandLead[]>([]);
  const [loading, setLoading] = useState(true);

  // Inquiry modal / state
  const [selectedProduct, setSelectedProduct] = useState<BrandProduct | null>(null);
  const [inquirerName, setInquirerName] = useState('');
  const [inquirerCompany, setInquirerCompany] = useState('');
  const [inquirerPhone, setInquirerPhone] = useState('');
  const [inquirerEmail, setInquirerEmail] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [isSendingInquiry, setIsSubmittingInquiry] = useState(false);

  // Fetch B2B datasets
  const fetchB2bData = async () => {
    try {
      setLoading(true);
      const db = await api.getFullDB();
      setBrands(db.brand_profiles || []);
      setDistributors(db.distributor_profiles || []);
      setProducts(db.brand_products || []);
      setLeads(db.brand_leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchB2bData();
  }, []);

  // Handle Inquiry Form Submission
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirerName || !inquirerPhone || !selectedProduct) return;
    try {
      setIsSubmittingInquiry(true);
      const res = await api.createBrandLead({
        brand_or_distributor_id: selectedProduct.brand_id,
        inquirer_name: inquirerName,
        inquirer_company: inquirerCompany,
        inquirer_phone: inquirerPhone,
        inquirer_email: inquirerEmail,
        notes: `Inquiry for "${selectedProduct.name}": ${inquiryNotes}`
      });

      if (res.success) {
        alert("Wholesale lead inquiry sent! The authorized brand distributor will contact you within 24 hours.");
        setSelectedProduct(null);
        setInquiryNotes('');
        fetchB2bData();
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs font-semibold">Synchronizing Wholesale Cosmetic Portals...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] p-6 md:p-8 space-y-8 text-left font-sans">
      
      {/* Premium Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono inline-block">
            B2B Marketplace Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Cosmetic Brands & Distributors</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md font-light leading-relaxed">
            Supplying genuine salon-grade hair colors, organic skin facials, and spa oils to certified Rajasthan beauty parlours.
          </p>
        </div>
        <div className="flex gap-2 relative z-10 font-mono text-xs">
          <button 
            onClick={() => setB2bTab('directory')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${b2bTab === 'directory' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            B2B Directories
          </button>
          <button 
            onClick={() => setB2bTab('products')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${b2bTab === 'products' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            Cosmetic Catalogs
          </button>
          <button 
            onClick={() => setB2bTab('leads')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${b2bTab === 'leads' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            Bulk Inquiries ({leads.length})
          </button>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex gap-3 text-xs text-purple-800">
        <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block uppercase tracking-wider text-[10px]">Authorized Salon Wholesale Channel</span>
          <p className="leading-relaxed">
            Nexora strictly prohibits gray-market cosmetics in Jaipur salons. Direct ordering from registered Rajasthan state distributors guarantees genuine supply. Lead management tracking is logged on-server.
          </p>
        </div>
      </div>

      {/* TAB 1: Brand & Distributor directory */}
      {b2bTab === 'directory' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Brands */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-purple-600 pl-2">Registered Cosmetic Brands</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brands.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-left flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-base">{b.company_name}</h4>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase">Certified Brand</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{b.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {b.categories.map((c, i) => (
                        <span key={i} className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded border font-mono">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs font-mono text-slate-500">
                    <span>Contact: {b.contact_email}</span>
                    <button onClick={() => setB2bTab('products')} className="text-purple-600 font-bold hover:underline cursor-pointer">View Products →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distributors */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-purple-600 pl-2">Regional Authorized Distributors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {distributors.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-base">{d.company_name}</h4>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold uppercase">State Wholesaler</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{d.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100 mt-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Coverage Areas</span>
                        <span className="font-bold text-slate-700">{d.coverage_areas.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Authorized Brands</span>
                        <span className="font-bold text-slate-700">{d.brand_associations.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cosmetic catalogs & bulk form */}
      {b2bTab === 'products' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Wholesale Salon Catalogs</h3>
            <p className="text-xs text-slate-500">Authorized items ready for bulk shipment quotes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-4 space-y-3 text-left">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[8px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono font-bold uppercase">{p.category}</span>
                    {p.is_sponsored && (
                      <span className="text-[8px] bg-slate-900 text-white font-mono uppercase px-1.5 py-0.5 rounded">Sponsored Placement</span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{p.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                  
                  <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 text-[11px] leading-relaxed">
                    <span className="block text-slate-400 font-mono">Item Benefits</span>
                    <p className="font-medium text-slate-700">{p.benefits}</p>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-mono">Retail MRP</span>
                    <span className="text-sm font-black text-slate-900">Rs. {p.mrp}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(p)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Inquire Bulk Quote
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk inquiry popup overlay */}
          {selectedProduct && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 max-w-md w-full space-y-4 animate-scaleIn text-left shadow-2xl">
                <div>
                  <h4 className="text-lg font-black text-slate-900">Request Bulk Quote</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Product: <span className="font-bold text-slate-800">{selectedProduct.name}</span></p>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
                    <input 
                      type="text" required value={inquirerName} onChange={(e) => setInquirerName(e.target.value)}
                      placeholder="e.g. Priyesh Sharma" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Salon Venue Name</label>
                    <input 
                      type="text" required value={inquirerCompany} onChange={(e) => setInquirerCompany(e.target.value)}
                      placeholder="e.g. Aura Premium Salon" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Mobile Phone</label>
                      <input 
                        type="tel" required value={inquirerPhone} onChange={(e) => setInquirerPhone(e.target.value)}
                        placeholder="e.g. 9829012345" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Email Desk</label>
                      <input 
                        type="email" value={inquirerEmail} onChange={(e) => setInquirerEmail(e.target.value)}
                        placeholder="aura@nexora.io" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Order Quantity & Notes</label>
                    <textarea 
                      required value={inquiryNotes} onChange={(e) => setInquiryNotes(e.target.value)}
                      placeholder="Need bulk quotation for 24 boxes of Majirel shade 5.3..." className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs h-16 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" onClick={() => setSelectedProduct(null)}
                      className="flex-1 py-2.5 border text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" disabled={isSendingInquiry}
                      className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer flex items-center justify-center"
                    >
                      {isSendingInquiry ? "Sending..." : "Submit Quote Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: B2B Lead generation tracking logs */}
      {b2bTab === 'leads' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="font-bold text-lg text-slate-900 font-sans">Active Leads Directory</h3>
            <p className="text-xs text-slate-500">Live operational inquiries logged under on-server audit logs.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold">Inquirer</th>
                    <th className="p-4 font-bold">Inquiry Details</th>
                    <th className="p-4 font-bold">Lead Status</th>
                    <th className="p-4 font-bold text-right">Inquiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{l.inquirer_name}</div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{l.inquirer_company}</span>
                        <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{l.inquirer_phone}</span>
                      </td>
                      <td className="p-4 text-slate-600 leading-relaxed font-sans max-w-sm">
                        {l.notes}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase font-mono">
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400 font-mono text-[10px]">
                        {l.created_at.substring(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
