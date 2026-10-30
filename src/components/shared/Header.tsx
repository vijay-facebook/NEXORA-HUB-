/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Scissors, Calendar, Menu, X, Sparkles, User, ShieldCheck } from 'lucide-react';
import { BrandedButton } from './BrandedButton';

export interface NavLinkItem {
  id: string;
  label: string;
  href?: string;
  badge?: string;
}

export interface SharedHeaderProps {
  brandTitle?: string;
  brandSubtitle?: string;
  logoIcon?: React.ReactNode;
  links?: NavLinkItem[];
  activeLinkId?: string;
  onNavigate?: (id: string) => void;
  onBookClick?: () => void;
  bookButtonText?: string;
  secondaryActions?: React.ReactNode;
  className?: string;
}

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'barbers', label: 'Our Barbers' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'memberships', label: 'Memberships' },
  { id: 'shop', label: 'Shop' },
  { id: 'contact', label: 'Contact' }
];

export const Header: React.FC<SharedHeaderProps> = ({
  brandTitle = "THE GENT'S DEN",
  brandSubtitle = "Barber Atelier • Est. 2021",
  logoIcon,
  links = DEFAULT_NAV_LINKS,
  activeLinkId = 'home',
  onNavigate,
  onBookClick,
  bookButtonText = 'BOOK APPOINTMENT',
  secondaryActions,
  className = ''
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    }
    setMobileMenuOpen(false);
  };

  const handleBook = () => {
    if (onBookClick) {
      onBookClick();
    } else if (onNavigate) {
      onNavigate('booking');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`bg-[#101010]/95 backdrop-blur-md border-b border-[#39352E] sticky top-0 z-50 transition-all font-sans text-left ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Razor Emblem */}
        <div 
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C9A45C] to-[#F1D9A3] flex items-center justify-center text-[#101010] shadow-md shadow-[#C9A45C]/20 group-hover:scale-105 transition-transform">
            {logoIcon || <Scissors className="w-5 h-5 -rotate-45" />}
          </div>
          <div>
            <span className="text-lg sm:text-xl font-serif font-black tracking-wider text-[#F7F4EE] group-hover:text-[#F1D9A3] transition-colors block leading-none">
              {brandTitle}
            </span>
            <span className="text-[9px] font-mono text-[#C9A45C] tracking-widest uppercase font-bold block mt-1">
              {brandSubtitle}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-widest font-semibold">
          {links.map((link) => {
            const isActive = activeLinkId === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`transition-colors cursor-pointer py-1 relative ${
                  isActive
                    ? 'text-[#C9A45C] font-bold'
                    : 'text-[#A7A7A7] hover:text-[#F7F4EE]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-1.5 text-[9px] bg-[#C9A45C]/20 text-[#F1D9A3] border border-[#C9A45C]/40 px-1.5 py-0.2 rounded font-mono font-bold">
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A45C] rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Desktop CTA & Actions */}
        <div className="hidden sm:flex items-center gap-3 font-mono">
          {secondaryActions}

          {/* Book Appointment CTA */}
          <BrandedButton
            variant="gold"
            size="sm"
            onClick={handleBook}
            leftIcon={<Calendar className="w-3.5 h-3.5 text-slate-950" />}
            className="uppercase tracking-widest text-[11px] px-4 py-2 font-black shadow-lg"
          >
            {bookButtonText}
          </BrandedButton>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <BrandedButton
            variant="gold"
            size="sm"
            onClick={handleBook}
            className="text-[10px] px-2.5 py-1.5 uppercase tracking-wider font-bold"
          >
            Book
          </BrandedButton>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#191919] rounded-xl transition-colors cursor-pointer border border-[#39352E]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#101010] border-b border-[#39352E] px-6 py-6 space-y-5 animate-fadeIn font-sans">
          <nav className="flex flex-col space-y-3 text-xs uppercase tracking-widest font-semibold">
            {links.map((link) => {
              const isActive = activeLinkId === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`text-left py-2 px-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#191919] text-[#C9A45C] font-bold border border-[#39352E]'
                      : 'text-[#A7A7A7] hover:text-[#F7F4EE] hover:bg-[#191919]/50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-[#C9A45C]/20 text-[#F1D9A3] border border-[#C9A45C]/40 px-2 py-0.5 rounded font-mono">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {secondaryActions && (
            <div className="pt-2 border-t border-[#39352E] flex items-center gap-2">
              {secondaryActions}
            </div>
          )}

          <div className="pt-2">
            <BrandedButton
              variant="gold"
              size="md"
              fullWidth
              onClick={handleBook}
              leftIcon={<Calendar className="w-4 h-4 text-slate-950" />}
              className="uppercase tracking-widest text-xs font-black shadow-xl"
            >
              {bookButtonText}
            </BrandedButton>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
