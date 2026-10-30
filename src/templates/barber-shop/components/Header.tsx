/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Header as SharedHeader } from '../../../components/shared/Header';

interface BarberHeaderProps {
  onNavigate: (page: any) => void;
  currentPage?: string;
  cartCount?: number;
  onOpenLookup?: () => void;
  onOpenAdminBookings?: () => void;
}

export const BarberHeader: React.FC<BarberHeaderProps> = ({ 
  onNavigate, 
  currentPage = 'home',
  cartCount = 2,
  onOpenLookup,
  onOpenAdminBookings
}) => {
  const secondaryActions = (
    <>
      {/* Admin Dispatch Console button */}
      {onOpenAdminBookings && (
        <button
          onClick={onOpenAdminBookings}
          className="px-2.5 py-1.5 text-[11px] font-mono text-[#A7A7A7] hover:text-[#C9A45C] border border-[#39352E] hover:border-[#C9A45C] rounded-lg transition flex items-center gap-1 cursor-pointer"
          title="Admin Calendar & Dispatch Console"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C]" />
          <span>Dispatch</span>
        </button>
      )}

      {/* Account / My Bookings Icon */}
      <button
        onClick={() => {
          if (onOpenLookup) onOpenLookup();
          else onNavigate('account');
        }}
        className="p-2 text-slate-300 hover:text-[#C9A45C] hover:bg-[#191919] rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs"
        title="My Bookings & Pass Lookup"
      >
        <User className="w-4 h-4" />
        <span className="hidden xl:inline text-[11px] font-sans">My Passes</span>
      </button>

      {/* Cart Icon */}
      <button
        onClick={() => onNavigate('shop')}
        className="p-2 text-slate-300 hover:text-[#C9A45C] hover:bg-[#191919] rounded-xl transition-colors cursor-pointer relative"
        title="Grooming Cart"
      >
        <ShoppingBag className="w-4 h-4" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#C9A45C] text-[#101010] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
            {cartCount}
          </span>
        )}
      </button>
    </>
  );

  return (
    <SharedHeader
      brandTitle="THE GENT'S DEN"
      brandSubtitle="Barber Atelier • Est. 2021"
      activeLinkId={currentPage}
      onNavigate={onNavigate}
      onBookClick={() => onNavigate('booking')}
      bookButtonText="BOOK APPOINTMENT"
      secondaryActions={secondaryActions}
    />
  );
};

export default BarberHeader;
