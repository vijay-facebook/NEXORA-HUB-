import React, { useState } from 'react';
import { BarberLayout } from './layout/BarberLayout';
import { HomePage } from './pages/HomePage';
import { ServicesCatalogPage } from './pages/ServicesCatalogPage';
import { BookingWizard } from './components/booking/BookingWizard';
import { BookingAdminDashboard } from './components/booking/BookingAdminDashboard';
import { BookingLookupModal } from './components/booking/BookingLookupModal';
import { BarberService, ServiceAddOn, defaultBarberServices } from './data/services';
import { Scissors, Calendar, Sparkles } from 'lucide-react';
import { useTemplateManager } from '../../hooks/useTemplateManager';
import { HeroBanner } from '../../components/shared';

export type BarberPage = 
  | 'home' 
  | 'about' 
  | 'services' 
  | 'barbers' 
  | 'booking' 
  | 'gallery' 
  | 'memberships' 
  | 'shop' 
  | 'blog' 
  | 'contact' 
  | 'privacy' 
  | 'terms' 
  | 'cancellation' 
  | 'faq' 
  | 'account';

export default function BarberShopTemplate() {
  const { getTemplate } = useTemplateManager();
  const templateConfig = getTemplate('barber-shop') || {
    id: 'barber-shop',
    name: "THE GENT'S DEN Barber Atelier",
    status: 'Ready',
    industryType: "Barber & Men's Grooming"
  };

  const [currentPage, setCurrentPage] = useState<BarberPage>('home');
  const [cartItemsCount, setCartItemsCount] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv-cut-01');

  // Modals
  const [showLookupModal, setShowLookupModal] = useState<boolean>(false);
  const [showAdminConsole, setShowAdminConsole] = useState<boolean>(false);

  const handleNavigate = (page: BarberPage, params?: any) => {
    if (params?.serviceId) {
      setSelectedServiceId(params.serviceId);
    }
    if (page === 'account') {
      setShowLookupModal(true);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookServiceFromCatalog = (service: BarberService, addOns?: ServiceAddOn[]) => {
    setSelectedServiceId(service.id);
    setCurrentPage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = () => {
    setCartItemsCount(prev => prev + 1);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="space-y-0">
            <HeroBanner 
              badgeText="Jaipur's Master Barber Craftsmanship"
              badgeIcon={<Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />}
              headline={<>UNCOMPROMISING STYLE.{' '}<span className="text-[#C9A45C] block sm:inline">CLASSIC BARBER HERITAGE.</span></>}
              subheadline="Experience precision razor fades, royal hot towel shaves, and bespoke hair styling in the heart of Civil Lines, Jaipur."
              bgImageUrl="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1800"
              primaryCta={{
                label: "Book Chair Now",
                onClick: () => handleNavigate('booking'),
                icon: <Calendar className="w-4 h-4" />
              }}
              secondaryCta={{
                label: "Explore Catalog",
                onClick: () => handleNavigate('services'),
                icon: <Scissors className="w-4 h-4 text-[#C9A45C]" />
              }}
            />
            <HomePage 
              onNavigate={handleNavigate} 
              onAddToCart={handleAddToCart} 
            />
          </div>
        );

      case 'services':
        return (
          <ServicesCatalogPage
            onNavigate={handleNavigate}
            onBookService={handleBookServiceFromCatalog}
          />
        );

      case 'booking':
        return (
          <BookingWizard
            initialServiceId={selectedServiceId}
            onNavigateHome={() => handleNavigate('home')}
            onOpenMyBookings={() => setShowLookupModal(true)}
          />
        );

      case 'about':
        return (
          <div className="py-24 px-6 max-w-4xl mx-auto text-left space-y-8 animate-fadeIn">
            <span className="text-xs font-mono text-[#C9A45C] uppercase tracking-widest font-bold">Heritage & Ethos</span>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE]">About THE GENT'S DEN</h1>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Founded on the belief that a barbershop should be a sacred sanctuary of calm, conversation, and uncompromising mastery. Located in Jaipur's royal Civil Lines enclave, we blend old-world Mayfair barbering traditions with clinical cleanliness and modern Japanese steel cutting instruments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="bg-[#191919] border border-[#39352E] p-6 rounded-2xl">
                <span className="text-3xl font-serif text-[#C9A45C] font-black block">100%</span>
                <span className="text-xs text-slate-400 mt-1 block">Sanitized Autoclave Tools</span>
              </div>
              <div className="bg-[#191919] border border-[#39352E] p-6 rounded-2xl">
                <span className="text-3xl font-serif text-[#C9A45C] font-black block">12+ Yrs</span>
                <span className="text-xs text-slate-400 mt-1 block">Master Barber Heritage</span>
              </div>
              <div className="bg-[#191919] border border-[#39352E] p-6 rounded-2xl">
                <span className="text-3xl font-serif text-[#C9A45C] font-black block">Zero</span>
                <span className="text-xs text-slate-400 mt-1 block">Synthetic Aerosols or Harsh Sulfates</span>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="py-24 px-6 max-w-4xl mx-auto text-left space-y-8 animate-fadeIn">
            <span className="text-xs font-mono text-[#C9A45C] uppercase tracking-widest font-bold">Connect with the Concierge</span>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE]">Contact & Studio Atelier</h1>
            <div className="bg-[#191919] border border-[#39352E] p-8 rounded-3xl space-y-4">
              <p className="text-sm text-slate-300">Plot 14, Civil Lines Royal Arcade, Near Raj Bhawan, Jaipur, Rajasthan 302006</p>
              <p className="text-sm text-[#F1D9A3] font-mono">Phone: +91 98290 12345 | concierge@thegentsden.com</p>
              <p className="text-xs text-slate-400">Open Daily: 9:00 AM – 9:00 PM</p>
            </div>
          </div>
        );

      case 'privacy':
      case 'terms':
      case 'cancellation':
      case 'faq':
        return (
          <div className="py-24 px-6 max-w-3xl mx-auto text-left space-y-6 animate-fadeIn">
            <span className="text-xs font-mono text-[#C9A45C] uppercase tracking-widest font-bold">Policy & Protocols</span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#F7F4EE] capitalize">{currentPage.replace('-', ' ')} Policy</h1>
            <div className="bg-[#191919] border border-[#39352E] p-6 rounded-2xl text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>All bookings at The Gent's Den are respected with zero double-booking policy. Cancellations made at least 2 hours prior to scheduled chair time incur zero fees and allow seamless re-scheduling.</p>
              <p>Personal client grooming records, fade clipper guard lengths, and allergic sensitivities are securely encrypted and never shared with external advertising vendors.</p>
            </div>
          </div>
        );

      default:
        return (
          <HomePage 
            onNavigate={handleNavigate} 
            onAddToCart={handleAddToCart} 
          />
        );
    }
  };

  return (
    <BarberLayout 
      onNavigate={handleNavigate} 
      currentPage={currentPage}
      cartCount={cartItemsCount}
      onOpenLookup={() => setShowLookupModal(true)}
      onOpenAdminBookings={() => setShowAdminConsole(true)}
    >
      {renderContent()}

      {/* Customer Lookup & Passes Modal */}
      {showLookupModal && (
        <BookingLookupModal
          onClose={() => setShowLookupModal(false)}
          onBookNew={() => {
            setShowLookupModal(false);
            handleNavigate('booking');
          }}
        />
      )}

      {/* Admin Dispatch & Calendar Console Modal */}
      {showAdminConsole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#101010] border border-[#39352E] rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl relative">
            <BookingAdminDashboard onClose={() => setShowAdminConsole(false)} />
          </div>
        </div>
      )}
    </BarberLayout>
  );
}
