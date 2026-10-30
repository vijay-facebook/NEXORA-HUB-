import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Search, Filter, 
  CheckCircle2, XCircle, AlertCircle, RefreshCw, 
  User, Phone, Eye, ShieldCheck, ChevronLeft, 
  ChevronRight, CalendarDays, Ban, Plus, Trash2, X
} from 'lucide-react';
import { BarberBooking, BarberBookingStatus, BlockedSlot } from '../../types/booking';
import { masterBarbers } from '../../data/barbers';

interface BookingAdminDashboardProps {
  onClose?: () => void;
}

export const BookingAdminDashboard: React.FC<BookingAdminDashboardProps> = ({ onClose }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'table'>('table');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  
  const [bookings, setBookings] = useState<BarberBooking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cancellation Modal
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Client requested telephone cancellation');

  // Reschedule Modal
  const [reschedulingBooking, setReschedulingBooking] = useState<BarberBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('12:00');
  const [rescheduleBarberId, setRescheduleBarberId] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);

  // Block Slot Modal
  const [isBlockingSlot, setIsBlockingSlot] = useState<boolean>(false);
  const [blockDate, setBlockDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [blockStartTime, setBlockStartTime] = useState<string>('14:00');
  const [blockEndTime, setBlockEndTime] = useState<string>('16:00');
  const [blockBarberId, setBlockBarberId] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('Sanitation & Equipment Maintenance');

  // Load bookings from server
  const fetchAllBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/barber-booking/all');
      if (res.ok) {
        const data = await res.json();
        setBookings(data || []);
      }
      const bRes = await fetch('/api/barber-booking/blocked-slots');
      if (bRes.ok) {
        const bData = await bRes.json();
        setBlockedSlots(bData || []);
      }
    } catch (e) {
      console.error('Error fetching admin bookings', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Search by Customer Name, Mobile, Booking Reference
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanPhone = q.replace(/[^0-9]/g, '');
        const matchName = b.customerName.toLowerCase().includes(q);
        const matchRef = b.bookingReference.toLowerCase().includes(q);
        const matchPhone = cleanPhone && b.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone);
        const matchService = b.serviceNames.toLowerCase().includes(q);
        if (!matchName && !matchRef && !matchPhone && !matchService) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all') {
        if (b.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // Barber
      if (barberFilter !== 'all') {
        if (b.barberId !== barberFilter) return false;
      }

      // Calendar view filter
      if (viewMode === 'daily') {
        if (b.appointmentDate !== selectedDate) return false;
      }

      return true;
    });
  }, [bookings, searchQuery, statusFilter, barberFilter, viewMode, selectedDate]);

  // Update Status
  const handleUpdateStatus = async (bookingId: string, newStatus: BarberBookingStatus, reason?: string) => {
    try {
      const res = await fetch(`/api/barber-booking/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, cancellationReason: reason })
      });
      if (res.ok) {
        fetchAllBookings();
        setCancellingBookingId(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (e) {
      alert('Network error updating status');
    }
  };

  // Submit Reschedule
  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingBooking) return;
    setIsRescheduling(true);
    setRescheduleError(null);

    try {
      const res = await fetch(`/api/barber-booking/${reschedulingBooking.id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          newBarberId: rescheduleBarberId || reschedulingBooking.barberId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setRescheduleError(data.error || 'Cannot reschedule to this time slot');
      } else {
        fetchAllBookings();
        setReschedulingBooking(null);
      }
    } catch (e: any) {
      setRescheduleError('Failed to communicate with booking server');
    } finally {
      setIsRescheduling(false);
    }
  };

  // Submit Block Slot
  const handleSaveBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/barber-booking/block-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: blockDate,
          startTime: blockStartTime,
          endTime: blockEndTime,
          barberId: blockBarberId || undefined,
          reason: blockReason
        })
      });
      if (res.ok) {
        fetchAllBookings();
        setIsBlockingSlot(false);
      }
    } catch (e) {
      alert('Error creating blocked slot');
    }
  };

  // Status Badge Colors
  const getStatusBadge = (status: BarberBookingStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
      case 'Checked In':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/60';
      case 'Completed':
        return 'bg-[#C9A45C]/20 text-[#C9A45C] border-[#C9A45C]/50';
      case 'Pending':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
      case 'Cancelled':
        return 'bg-red-950/80 text-red-400 border-red-800/60';
      case 'No Show':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/60';
      default:
        return 'bg-[#222222] text-[#A7A7A7] border-[#39352E]';
    }
  };

  return (
    <div className="bg-[#101010] min-h-screen text-[#F7F4EE] pt-6 pb-20 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#39352E] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191919] border border-[#39352E] text-xs font-mono text-[#C9A45C] uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Operations &amp; Atelier Management
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white mt-1">
            Chair Reservations &amp; Dispatch Console
          </h1>
          <p className="text-xs text-[#A7A7A7]">
            Real-time server state • Live double-booking protection • Calendar view &amp; status auditing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBlockingSlot(true)}
            className="px-4 py-2 bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] text-xs font-bold uppercase rounded-xl transition flex items-center gap-1.5"
          >
            <Ban className="w-3.5 h-3.5 text-amber-400" />
            Block Slots / Holidays
          </button>
          <button
            onClick={fetchAllBookings}
            className="p-2.5 bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] text-[#A7A7A7] hover:text-white rounded-xl transition"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 bg-[#191919] border border-[#39352E] text-[#A7A7A7] hover:text-white rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-[#191919] border border-[#39352E] p-4 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#A7A7A7] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone number, or booking ref (TGD-...)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#101010] border border-[#39352E] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A7A7A7] outline-none focus:border-[#C9A45C]"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9A45C]"
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {/* Barber Filter */}
          <div className="md:col-span-2">
            <select
              value={barberFilter}
              onChange={e => setBarberFilter(e.target.value)}
              className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9A45C]"
            >
              <option value="all">All Master Barbers</option>
              {masterBarbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="md:col-span-3 flex justify-end">
            <div className="bg-[#101010] border border-[#39352E] rounded-xl p-1 flex items-center gap-1">
              {(['table', 'daily', 'weekly', 'monthly'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                    viewMode === mode
                      ? 'bg-[#C9A45C] text-[#101010]'
                      : 'text-[#A7A7A7] hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Selector for Calendar Views */}
        {viewMode !== 'table' && (
          <div className="flex items-center justify-between pt-2 border-t border-[#39352E]/60 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - (viewMode === 'weekly' ? 7 : viewMode === 'monthly' ? 30 : 1));
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-1 rounded bg-[#101010] border border-[#39352E] text-white hover:border-[#C9A45C]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-[#C9A45C]">
                {viewMode === 'daily' ? `Viewing Date: ${selectedDate}` : `Anchor Date: ${selectedDate}`}
              </span>
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + (viewMode === 'weekly' ? 7 : viewMode === 'monthly' ? 30 : 1));
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-1 rounded bg-[#101010] border border-[#39352E] text-white hover:border-[#C9A45C]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-[#A7A7A7] hover:text-white underline text-[11px]"
            >
              Reset to Today
            </button>
          </div>
        )}
      </div>

      {/* Main List / Calendar View */}
      {viewMode === 'table' ? (
        <div className="bg-[#191919] border border-[#39352E] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101010] text-[#A7A7A7] font-mono uppercase tracking-wider text-[10px] border-b border-[#39352E]">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Treatments</th>
                  <th className="py-3 px-4">Barber</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Tariff</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#39352E]/60 text-white">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#A7A7A7]">
                      No matching appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-[#222222]/50 transition">
                      {/* Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#C9A45C]">
                        {b.bookingReference}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{b.customerName}</div>
                        <div className="text-[11px] font-mono text-[#A7A7A7]">{b.customerPhone}</div>
                      </td>

                      {/* Treatments */}
                      <td className="py-3.5 px-4 max-w-xs truncate" title={b.serviceNames}>
                        <div>{b.serviceNames}</div>
                        <div className="text-[10px] font-mono text-[#A7A7A7]">{b.totalDurationMinutes} mins</div>
                      </td>

                      {/* Barber */}
                      <td className="py-3.5 px-4 font-medium text-white">
                        {b.barberName}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono">{b.appointmentDate}</div>
                        <div className="text-[11px] font-mono text-[#C9A45C]">{b.startTime} - {b.endTime}</div>
                      </td>

                      {/* Tariff */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#F7F4EE]">
                        ₹{b.totalAmount}
                        {b.discountAmount > 0 && (
                          <span className="block text-[10px] text-emerald-400 font-normal">(-₹{b.discountAmount})</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Checked In')}
                            className="px-2 py-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded text-[10px] font-bold"
                            title="Client has arrived at shop"
                          >
                            Check In
                          </button>
                        )}

                        {b.status === 'Checked In' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Completed')}
                            className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded text-[10px] font-bold"
                            title="Mark service finished"
                          >
                            Complete
                          </button>
                        )}

                        {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                          <>
                            <button
                              onClick={() => {
                                setReschedulingBooking(b);
                                setRescheduleDate(b.appointmentDate);
                                setRescheduleTime(b.startTime);
                                setRescheduleBarberId(b.barberId);
                              }}
                              className="px-2 py-1 bg-[#222222] hover:bg-[#39352E] text-[#A7A7A7] hover:text-white rounded text-[10px]"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => setCancellingBookingId(b.id)}
                              className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'No Show')}
                              className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900 text-purple-300 rounded text-[10px]"
                              title="Client failed to arrive"
                            >
                              No Show
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar Grid View (Daily, Weekly, Monthly) */
        <div className="bg-[#191919] border border-[#39352E] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-white text-lg capitalize">{viewMode} Chair Dispatch</h3>
            <span className="text-xs font-mono text-[#A7A7A7]">{filteredBookings.length} bookings shown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map(b => (
              <div key={b.id} className="bg-[#101010] border border-[#39352E] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#C9A45C] uppercase block">{b.bookingReference}</span>
                    <h4 className="text-sm font-bold text-white">{b.customerName}</h4>
                    <p className="text-[11px] font-mono text-[#A7A7A7]">{b.customerPhone}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusBadge(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-[#A7A7A7] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Barber:</span>
                    <span className="text-white font-medium">{b.barberName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date &amp; Time:</span>
                    <span className="text-[#C9A45C] font-mono">{b.appointmentDate} • {b.startTime} - {b.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Services:</span>
                    <span className="text-white truncate max-w-[150px]">{b.serviceNames}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#39352E] flex items-center justify-end gap-1.5">
                  {b.status === 'Confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'Checked In')}
                      className="px-2.5 py-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded text-[10px] font-bold"
                    >
                      Check In
                    </button>
                  )}
                  {b.status === 'Checked In' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'Completed')}
                      className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded text-[10px] font-bold"
                    >
                      Complete
                    </button>
                  )}
                  {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                    <button
                      onClick={() => setCancellingBookingId(b.id)}
                      className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded text-[10px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#191919] border border-red-800/80 rounded-2xl max-w-md w-full p-6 text-left space-y-4">
            <h3 className="text-base font-serif font-bold text-white">Cancel Appointment</h3>
            <p className="text-xs text-[#A7A7A7]">
              Please state the reason for cancellation. The booked slot will be immediately returned to real-time available inventory.
            </p>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#A7A7A7] mb-1">Reason for Cancellation</label>
              <input
                type="text"
                value={cancellationReason}
                onChange={e => setCancellationReason(e.target.value)}
                className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C9A45C]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="px-4 py-2 border border-[#39352E] rounded-xl text-xs text-[#A7A7A7] hover:text-white"
              >
                Go Back
              </button>
              <button
                onClick={() => handleUpdateStatus(cancellingBookingId, 'Cancelled', cancellationReason)}
                className="px-4 py-2 bg-[#E05252] hover:bg-red-600 text-white font-bold rounded-xl text-xs uppercase"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL WITH LIVE VALIDATION */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#191919] border border-[#39352E] rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#39352E] pb-3">
              <h3 className="font-serif font-bold text-white text-base">
                Reschedule Booking: {reschedulingBooking.bookingReference}
              </h3>
              <button onClick={() => setReschedulingBooking(null)} className="text-[#A7A7A7] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-200">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase text-[10px] text-[#A7A7A7] mb-1">New Date *</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[10px] text-[#A7A7A7] mb-1">New Start Time *</label>
                <input
                  type="time"
                  required
                  step={900}
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[10px] text-[#A7A7A7] mb-1">Master Barber</label>
                <select
                  value={rescheduleBarberId}
                  onChange={e => setRescheduleBarberId(e.target.value)}
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                >
                  {masterBarbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#39352E]">
                <button
                  type="button"
                  onClick={() => setReschedulingBooking(null)}
                  className="px-4 py-2 border border-[#39352E] rounded-xl text-[#A7A7A7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-5 py-2 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] font-bold rounded-xl uppercase tracking-wider disabled:opacity-50"
                >
                  {isRescheduling ? 'Verifying Conflict...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK SLOTS / HOLIDAYS MODAL */}
      {isBlockingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#191919] border border-[#39352E] rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#39352E] pb-3">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Ban className="w-4 h-4 text-amber-400" />
                Block Time Window / Shop Holiday
              </h3>
              <button onClick={() => setIsBlockingSlot(false)} className="text-[#A7A7A7] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlockedSlot} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase text-[10px] text-[#A7A7A7] mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={e => setBlockDate(e.target.value)}
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-[10px] text-[#A7A7A7] mb-1">From Time</label>
                  <input
                    type="time"
                    value={blockStartTime}
                    onChange={e => setBlockStartTime(e.target.value)}
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase text-[10px] text-[#A7A7A7] mb-1">To Time</label>
                  <input
                    type="time"
                    value={blockEndTime}
                    onChange={e => setBlockEndTime(e.target.value)}
                    className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase text-[10px] text-[#A7A7A7] mb-1">Affects Master Barber</label>
                <select
                  value={blockBarberId}
                  onChange={e => setBlockBarberId(e.target.value)}
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                >
                  <option value="">All Barbers (Entire Shop Closes)</option>
                  {masterBarbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase text-[10px] text-[#A7A7A7] mb-1">Reason / Note *</label>
                <input
                  type="text"
                  required
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="e.g. Master barber masterclass, National Holiday, Electrical Maintenance"
                  className="w-full bg-[#101010] border border-[#39352E] rounded-xl px-3 py-2 text-white outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#39352E]">
                <button
                  type="button"
                  onClick={() => setIsBlockingSlot(false)}
                  className="px-4 py-2 border border-[#39352E] rounded-xl text-[#A7A7A7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl uppercase tracking-wider"
                >
                  Save Blocked Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default BookingAdminDashboard;
