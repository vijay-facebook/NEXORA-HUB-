import React, { useState } from 'react';
import { 
  Search, X, Clock, Calendar, AlertCircle, CheckCircle2, 
  RotateCcw, ExternalLink, Scissors, UserCheck
} from 'lucide-react';
import { BarberBooking } from '../../types/booking';

interface BookingLookupModalProps {
  onClose: () => void;
  onBookNew?: () => void;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({ onClose, onBookNew }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<BarberBooking[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/barber-booking/lookup?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data || []);
      setHasSearched(true);
    } catch (e) {
      setActionError('Error looking up appointments. Please retry.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomerCancel = async (bookingId: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/barber-booking/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Cancelled',
          cancellationReason: 'Cancelled online by client',
          isCustomerCancellation: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Failed to cancel appointment');
      } else {
        // Refresh
        handleSearch();
        setCancelTargetId(null);
      }
    } catch (e) {
      setActionError('Network error trying to cancel reservation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#191919] border border-[#39352E] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-[#F7F4EE] shadow-2xl relative p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#39352E] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9A45C] text-[#101010] flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-lg">My Appointments &amp; Passes</h3>
              <p className="text-[11px] text-[#A7A7A7]">Look up your chair reservation with phone number or reference code.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#A7A7A7] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A7A7A7] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter your phone number (e.g. 98290...) or booking ref (TGD-...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#101010] border border-[#39352E] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-[#A7A7A7] outline-none focus:border-[#C9A45C]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Find Passes'}
          </button>
        </form>

        {actionError && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="p-8 bg-[#101010] border border-[#39352E] rounded-2xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-[#A7A7A7] mx-auto opacity-50" />
                <p className="text-xs text-[#A7A7A7]">No reservations found matching "{query}".</p>
                {onBookNew && (
                  <button
                    onClick={() => {
                      onClose();
                      onBookNew();
                    }}
                    className="px-4 py-2 bg-[#C9A45C] text-[#101010] text-xs font-bold uppercase rounded-xl hover:bg-[#F1D9A3]"
                  >
                    Reserve a New Chair
                  </button>
                )}
              </div>
            ) : (
              results.map(b => (
                <div key={b.id} className="bg-[#101010] border border-[#39352E] rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#C9A45C] font-bold uppercase tracking-wider">
                        {b.bookingReference}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{b.serviceNames}</h4>
                      <p className="text-xs text-[#A7A7A7]">Guest: {b.customerName} ({b.customerPhone})</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      b.status === 'Confirmed' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' :
                      b.status === 'Cancelled' ? 'bg-red-950/80 text-red-400 border-red-800' :
                      b.status === 'Checked In' ? 'bg-blue-950/80 text-blue-400 border-blue-800' :
                      b.status === 'Completed' ? 'bg-[#C9A45C]/20 text-[#C9A45C] border-[#C9A45C]/40' :
                      'bg-[#222222] text-[#A7A7A7] border-[#39352E]'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-[#191919] p-3 rounded-xl border border-[#39352E]/60">
                    <div>
                      <span className="text-[10px] text-[#A7A7A7] uppercase block font-mono">Date</span>
                      <span className="text-white font-bold">{b.appointmentDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A7A7A7] uppercase block font-mono">Time Slot</span>
                      <span className="text-[#C9A45C] font-mono">{b.startTime} - {b.endTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A7A7A7] uppercase block font-mono">Master Barber</span>
                      <span className="text-white">{b.barberName}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#39352E]/60 text-xs">
                    <span className="font-mono text-[#C9A45C] font-bold text-sm">
                      Total: ₹{b.totalAmount}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/919829012345?text=Hello%20The%20Gent's%20Den,%20checking%20my%20reservation%20ref%20${b.bookingReference}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] text-[#A7A7A7] hover:text-white rounded-lg transition flex items-center gap-1.5 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3 text-[#25D366]" />
                        WhatsApp Concierge
                      </a>

                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => setCancelTargetId(b.id)}
                          className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg text-[11px] font-bold"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Confirmation for cancellation */}
                  {cancelTargetId === b.id && (
                    <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl space-y-2 text-xs">
                      <p className="text-red-200">
                        Are you sure you want to cancel this booking? Cancellations made at least 2 hours prior are completely complimentary.
                      </p>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setCancelTargetId(null)}
                          className="px-3 py-1 bg-[#191919] border border-[#39352E] text-white rounded text-[11px]"
                        >
                          Keep Booking
                        </button>
                        <button
                          onClick={() => handleCustomerCancel(b.id)}
                          className="px-3 py-1 bg-[#E05252] text-white font-bold rounded text-[11px]"
                        >
                          Confirm Cancellation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default BookingLookupModal;
