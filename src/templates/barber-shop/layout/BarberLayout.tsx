import React from 'react';
import { BarberHeader } from '../components/Header';
import { BarberFooter } from '../components/Footer';

interface BarberLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: any) => void;
  currentPage?: string;
  cartCount?: number;
  onOpenLookup?: () => void;
  onOpenAdminBookings?: () => void;
}

export const BarberLayout: React.FC<BarberLayoutProps> = ({ 
  children, 
  onNavigate,
  currentPage = 'home',
  cartCount = 2,
  onOpenLookup,
  onOpenAdminBookings
}) => {
  return (
    <div className="min-h-screen bg-[#101010] font-sans text-[#F7F4EE] flex flex-col justify-between selection:bg-[#C9A45C] selection:text-[#101010]">
      <BarberHeader 
        onNavigate={onNavigate} 
        currentPage={currentPage} 
        cartCount={cartCount}
        onOpenLookup={onOpenLookup}
        onOpenAdminBookings={onOpenAdminBookings}
      />
      <main className="flex-1">
        {children}
      </main>
      <BarberFooter onNavigate={onNavigate} />
    </div>
  );
};
