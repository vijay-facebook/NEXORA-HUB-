/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Clock, Phone, CheckCircle2, Trash2, 
  Scissors, AlertCircle, Search, Filter, Play, Check 
} from 'lucide-react';
import { BrandedButton } from './BrandedButton';
import { ResponsiveCard } from './ResponsiveCard';

export interface WaitlistItem {
  id: string;
  clientName: string;
  phone: string;
  serviceRequested: string;
  preferredStaff: string;
  estimatedWaitMinutes: number;
  status: 'Waiting' | 'In Chair' | 'Completed' | 'Cancelled';
  joinedAt: string;
}

export interface ClientWaitlistProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
  className?: string;
}

const DEFAULT_WAITLIST: WaitlistItem[] = [
  {
    id: 'wait_1',
    clientName: 'Rahul Verma',
    phone: '+91 98290 11223',
    serviceRequested: 'Precision Skin Fade & Beard Trim',
    preferredStaff: 'Vikram Rathore',
    estimatedWaitMinutes: 15,
    status: 'Waiting',
    joinedAt: '10:30 AM'
  },
  {
    id: 'wait_2',
    clientName: 'Aditya Mehra',
    phone: '+91 98290 44556',
    serviceRequested: 'Royal Hot Towel Shave',
    preferredStaff: 'Arjun Verma',
    estimatedWaitMinutes: 30,
    status: 'Waiting',
    joinedAt: '10:45 AM'
  },
  {
    id: 'wait_3',
    clientName: 'Karan Johar',
    phone: '+91 98290 77889',
    serviceRequested: 'Hair Spa & Scalp Detox',
    preferredStaff: 'Pooja Sharma',
    estimatedWaitMinutes: 0,
    status: 'In Chair',
    joinedAt: '10:15 AM'
  }
];

export const ClientWaitlist: React.FC<ClientWaitlistProps> = ({
  title = "Walk-in Client Waitlist & Queue",
  subtitle = "Manage real-time walk-ins, assign waiting clients to master staff chairs, and track queue turnaround times",
  accentColor = "#4F46E5",
  className = ""
}) => {
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>(() => {
    try {
      const stored = localStorage.getItem('nexora_client_waitlist');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return DEFAULT_WAITLIST;
  });

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceRequested, setServiceRequested] = useState('Precision Haircut & Style');
  const [preferredStaff, setPreferredStaff] = useState('Any Available Master');
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState<number>(20);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_client_waitlist', JSON.stringify(waitlist));
    } catch (e) {
      // ignore
    }
  }, [waitlist]);

  const handleAddWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim()) return;

    const newItem: WaitlistItem = {
      id: 'wait_' + Math.random().toString(36).substring(2, 9),
      clientName: clientName.trim(),
      phone: phone.trim(),
      serviceRequested,
      preferredStaff,
      estimatedWaitMinutes: Number(estimatedWaitMinutes) || 15,
      status: 'Waiting',
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setWaitlist([newItem, ...waitlist]);
    setClientName('');
    setPhone('');
  };

  const handleUpdateStatus = (id: string, status: WaitlistItem['status']) => {
    setWaitlist(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Remove this client from the active waitlist queue?")) {
      setWaitlist(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredList = waitlist.filter(item => {
    const matchesSearch = 
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.preferredStaff.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'All') return matchesSearch;
    return matchesSearch && item.status === filterStatus;
  });

  const waitingCount = waitlist.filter(w => w.status === 'Waiting').length;
  const inChairCount = waitlist.filter(w => w.status === 'In Chair').length;

  return (
    <div className={`space-y-6 text-left font-sans ${className}`}>
      
      {/* Header Banner & Stats */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-md shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              {title}
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                {waitingCount} Waiting • {inChairCount} In Chair
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Waiting', 'In Chair', 'Completed', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                filterStatus === status 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Walk-in Add Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Add Walk-in Client</h3>
          </div>

          <form onSubmit={handleAddWalkin} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Client Full Name *</label>
              <input 
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Sameer Malhotra"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 p-3 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Phone Number *</label>
              <input 
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98290 12345"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 p-3 rounded-xl outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Service Requested</label>
              <select
                value={serviceRequested}
                onChange={(e) => setServiceRequested(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 p-3 rounded-xl outline-none cursor-pointer"
              >
                <option value="Precision Haircut & Style">Precision Haircut & Style</option>
                <option value="Skin Fade & Beard Sculpt">Skin Fade & Beard Sculpt</option>
                <option value="Royal Hot Towel Shave">Royal Hot Towel Shave</option>
                <option value="Hair Spa & Scalp Detox">Hair Spa & Scalp Detox</option>
                <option value="Beard Trim & Contouring">Beard Trim & Contouring</option>
                <option value="Groom's Facial & Cleanup">Groom's Facial & Cleanup</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Preferred Barber / Stylist</label>
              <select
                value={preferredStaff}
                onChange={(e) => setPreferredStaff(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 p-3 rounded-xl outline-none cursor-pointer"
              >
                <option value="Any Available Master">Any Available Master</option>
                <option value="Vikram Rathore">Vikram Rathore</option>
                <option value="Pooja Sharma">Pooja Sharma</option>
                <option value="Arjun Verma">Arjun Verma</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Estimated Wait Time (Mins)</label>
              <input 
                type="number"
                min="0"
                step="5"
                value={estimatedWaitMinutes}
                onChange={(e) => setEstimatedWaitMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 p-3 rounded-xl outline-none font-mono"
              />
            </div>

            <BrandedButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              leftIcon={<UserPlus className="w-4 h-4 text-white" />}
            >
              Add to Queue
            </BrandedButton>
          </form>
        </div>

        {/* Waitlist Queue Table / List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-slate-100 pb-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search queue..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs pl-8 pr-3 py-2 rounded-xl outline-none font-mono"
              />
            </div>
            <span className="text-xs font-mono text-slate-500">Showing {filteredList.length} queue entries</span>
          </div>

          <div className="space-y-3">
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.status === 'In Chair' 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : item.status === 'Waiting'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-100/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900">{item.clientName}</h4>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                        item.status === 'Waiting' ? 'bg-amber-100 text-amber-800' :
                        item.status === 'In Chair' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Completed' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 font-mono flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {item.phone}
                      </span>
                      <span>•</span>
                      <span className="text-indigo-600 font-bold">{item.serviceRequested}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
                      <span>Pref: <strong className="text-slate-800">{item.preferredStaff}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-700 font-bold">
                        <Clock className="w-3 h-3" /> Est. {item.estimatedWaitMinutes} mins (Joined {item.joinedAt})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'Waiting' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'In Chair')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Call to Chair
                      </button>
                    )}

                    {item.status === 'In Chair' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Completed')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Complete
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove from Queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-mono">
                No clients currently in the waitlist queue matching your filter.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientWaitlist;
