import React, { useState, useEffect } from 'react';
import { Phone, Calendar, History, Wallet, ChevronRight, LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../lib/supabase';
import { Appointment, Customer, Tenant } from '../types';
import { Entrance, ScrollReveal, StaggerContainer, StaggerItem, HoverCard } from './animations/MotionComponents';

interface ClientPortalProps {
  onNavigateHome: () => void;
}

export default function ClientPortal({ onNavigateHome }: ClientPortalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customerProfiles, setCustomerProfiles] = useState<Customer[]>([]);
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Try to load from localStorage on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('client_portal_phone');
    if (savedPhone) {
      setPhoneNumber(savedPhone);
      handleLogin(savedPhone);
    }
  }, []);

  const handleLogin = async (phoneToUse: string = phoneNumber) => {
    if (!phoneToUse || phoneToUse.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Clean phone number (strip +91, spaces)
      let cleanPhone = phoneToUse.replace(/[^0-9]/g, "");
      if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
        cleanPhone = cleanPhone.substring(2);
      }
      
      const [apts, customers, allTenants] = await Promise.all([
        api.getAppointments(undefined, cleanPhone),
        api.getCustomers(undefined, cleanPhone),
        api.getTenants()
      ]);
      
      setAppointments(apts);
      setCustomerProfiles(customers);
      
      const tenantMap: Record<string, Tenant> = {};
      allTenants.forEach((t: Tenant) => {
        tenantMap[t.id] = t;
      });
      setTenants(tenantMap);
      
      setIsLoggedIn(true);
      setPhoneNumber(cleanPhone);
      localStorage.setItem('client_portal_phone', cleanPhone);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPhoneNumber('');
    setAppointments([]);
    setCustomerProfiles([]);
    localStorage.removeItem('client_portal_phone');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Entrance direction="up" duration={0.4}>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center mb-6 cursor-pointer" onClick={onNavigateHome}>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-serif font-black text-2xl shadow-xl shadow-indigo-600/30">
                N
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
              Client Portal
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Access your bookings and loyalty points
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
              <div className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3 border outline-none"
                      placeholder="e.g. 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <button
                    onClick={() => handleLogin()}
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access My Account'}
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                   <button onClick={onNavigateHome} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                     &larr; Back to Nexora
                   </button>
                </div>
              </div>
            </div>
          </div>
        </Entrance>
      </div>
    );
  }

  // Calculate stats
  const now = new Date();
  
  const upcomingBookings = appointments.filter(a => {
    const aptDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
    return aptDate > now && a.status !== 'cancelled' && a.status !== 'no_show';
  }).sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() - new Date(`${b.appointment_date}T${b.appointment_time}`).getTime());

  const pastBookings = appointments.filter(a => {
    const aptDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
    return aptDate <= now || a.status === 'cancelled' || a.status === 'no_show';
  }).sort((a, b) => new Date(`${b.appointment_date}T${b.appointment_time}`).getTime() - new Date(`${a.appointment_date}T${a.appointment_time}`).getTime());

  const totalPoints = customerProfiles.reduce((acc, curr) => acc + (curr.cashback_balance || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
               <button onClick={onNavigateHome} className="text-slate-400 hover:text-slate-600 transition-colors mr-2">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-serif font-black text-lg">
                 N
               </div>
               <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Client Portal</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome & Stats */}
        <Entrance direction="up" delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-indigo-200 font-medium mb-1">Welcome back,</p>
                <h2 className="text-3xl font-black">{customerProfiles[0]?.full_name || phoneNumber}</h2>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div>
                  <p className="text-indigo-200 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold">{appointments.length}</p>
                </div>
                <div className="h-10 w-px bg-indigo-500/50"></div>
                <div>
                  <p className="text-indigo-200 text-sm">Active Salons</p>
                  <p className="text-3xl font-bold">{customerProfiles.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center text-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-sm">Loyalty Points</p>
                  <h3 className="text-3xl font-black text-slate-900">{totalPoints.toFixed(0)} Points</h3>
                </div>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalPoints / 5000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {5000 - totalPoints > 0 
                  ? `${(5000 - totalPoints).toFixed(0)} points to reach next reward` 
                  : 'Reward unlocked!'}
              </p>
            </div>
          </div>
        </Entrance>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <ScrollReveal direction="up" delay={0.15}>
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Upcoming Bookings</h3>
              </div>
              
              {upcomingBookings.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                  <p className="text-slate-500">No upcoming bookings scheduled.</p>
                </div>
              ) : (
                <StaggerContainer className="space-y-4">
                  {upcomingBookings.map(apt => {
                    const tenant = tenants[apt.tenant_id];
                    const dateObj = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
                    return (
                      <StaggerItem key={apt.id}>
                        <HoverCard hoverY={-2} hoverScale={1.005}>
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-slate-900">{tenant?.name || 'Unknown Salon'}</h4>
                                <p className="text-sm text-slate-500">{tenant?.address}</p>
                              </div>
                              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {apt.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-y border-slate-100">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Date & Time</p>
                                <p className="font-semibold text-slate-800">
                                  {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                                <p className="font-semibold text-slate-800">
                                  {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Service Amount</p>
                                <p className="font-semibold text-slate-800">Rs. {apt.total_amount}</p>
                                {apt.advance_amount > 0 && (
                                  <p className="text-xs text-emerald-600 font-medium">Advance Paid: Rs. {apt.advance_amount}</p>
                                )}
                              </div>
                            </div>
                            
                            {apt.verification_proof_code && (
                              <div className="mt-4 bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Verification Code:</span>
                                <span className="font-mono font-bold text-indigo-700 tracking-widest text-lg bg-indigo-100/50 px-3 py-1 rounded-lg">
                                  {apt.verification_proof_code}
                                </span>
                              </div>
                            )}
                          </div>
                        </HoverCard>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              )}
            </section>
          </ScrollReveal>

          {/* Past Bookings */}
          <ScrollReveal direction="up" delay={0.2}>
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <History className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-bold text-slate-900">Booking History</h3>
              </div>
              
              {pastBookings.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                  <p className="text-slate-500">No previous bookings found.</p>
                </div>
              ) : (
                <StaggerContainer className="space-y-3">
                  {pastBookings.map(apt => {
                    const tenant = tenants[apt.tenant_id];
                    const dateObj = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
                    
                    return (
                      <StaggerItem key={apt.id}>
                        <HoverCard hoverY={-2} hoverScale={1.005}>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{tenant?.name || 'Unknown Salon'}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span>{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span>&bull;</span>
                                <span>Rs. {apt.total_amount}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {apt.status}
                              </span>
                              
                              {apt.customer_cashback_earned && apt.customer_cashback_earned > 0 && (
                                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5">
                                  +{apt.customer_cashback_earned} pts
                                </span>
                              )}
                            </div>
                          </div>
                        </HoverCard>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              )}
            </section>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
