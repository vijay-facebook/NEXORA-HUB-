/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Scissors, MapPin, Phone, MessageCircle, Mail, Clock, 
  Instagram, Facebook, Youtube, Twitter, Send, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { useSalonCustomization } from '../../../hooks/useSalonCustomization';

interface BarberFooterProps {
  onNavigate?: (page: any) => void;
}

export const BarberFooter: React.FC<BarberFooterProps> = ({ onNavigate }) => {
  const { customization } = useSalonCustomization();
  const { socialAndVideo, header } = customization;

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-[#0B0B0B] border-t border-[#39352E] text-slate-300 font-sans pt-16 pb-12 px-6 text-left">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Top Tier: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 border-b border-[#39352E] pb-12">
          
          {/* Brand Info & Social Connect */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate && onNavigate('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C9A45C] to-[#F1D9A3] flex items-center justify-center text-[#101010] shadow-md shadow-[#C9A45C]/20">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <span className="text-xl font-serif font-black tracking-wider text-[#F7F4EE] block">
                  {header.brandName || "THE GENT'S DEN"}
                </span>
                <span className="text-[10px] font-mono text-[#C9A45C] tracking-widest uppercase font-bold block">
                  {header.tagline || "Sharp Looks. Bold Confidence."}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A7A7A7] leading-relaxed max-w-md">
              A bespoke grooming atelier designed for the modern gentleman. We revive heritage British and European barbering with clinical hygiene, Japanese steel, and botanical formulations.
            </p>

            {/* Social Connect Section (Linked from Salon Owner Dashboard) */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono text-[#C9A45C] uppercase tracking-widest font-bold block">
                Social Connect & Community
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {socialAndVideo.instagramFeedUrl && (
                  <a 
                    href={socialAndVideo.instagramFeedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-9 h-9 rounded-xl bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] text-slate-300 hover:text-[#C9A45C] flex items-center justify-center transition-colors shadow"
                    title="Instagram Profile"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {socialAndVideo.facebookUrl && (
                  <a 
                    href={socialAndVideo.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-9 h-9 rounded-xl bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] text-slate-300 hover:text-[#C9A45C] flex items-center justify-center transition-colors shadow"
                    title="Facebook Page"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {socialAndVideo.twitterUrl && (
                  <a 
                    href={socialAndVideo.twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-9 h-9 rounded-xl bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] text-slate-300 hover:text-[#C9A45C] flex items-center justify-center transition-colors shadow"
                    title="Twitter / X Profile"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {socialAndVideo.youtubeVideoUrl && (
                  <a 
                    href={socialAndVideo.youtubeVideoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-9 h-9 rounded-xl bg-[#191919] border border-[#39352E] hover:border-[#C9A45C] text-slate-300 hover:text-[#C9A45C] flex items-center justify-center transition-colors shadow"
                    title="YouTube Channel"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                <a 
                  href={`https://wa.me/${header.whatsapp?.replace(/[^0-9]/g, '') || '919829012345'}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 flex items-center justify-center transition-colors shadow"
                  title="WhatsApp Concierge"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 bg-[#141414] border border-[#39352E] rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A45C] font-bold">
                Private Gentlemen’s Circle
              </span>
              <h4 className="text-xl font-serif font-black text-[#F7F4EE]">
                Subscribe for Curated Grooming Journals & VIP Privileges
              </h4>
              <p className="text-xs text-[#A7A7A7]">
                Receive monthly styling guides, early drops of limited-run botanical clays, and member-only event invites.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your executive email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[#1A1A1A] border border-[#39352E] focus:border-[#C9A45C] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-colors font-mono"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-1.5 font-sans"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe</span>
                </button>
              </div>

              {subscribed && (
                <div className="text-emerald-400 font-mono text-xs flex items-center gap-1 pt-1 animate-fadeIn">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Welcome to the circle! A 15% VIP invite has been dispatched.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Middle Tier: Links & Business Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h5 className="font-mono text-xs uppercase tracking-widest text-[#C9A45C] font-bold">
              Navigation
            </h5>
            <ul className="space-y-2.5 text-[#A7A7A7]">
              <li><button onClick={() => onNavigate && onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">Home Atelier</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">Services & Pricing</button></li>
              <li><button onClick={() => onNavigate && onNavigate('barbers')} className="hover:text-white transition-colors cursor-pointer">Our Master Barbers</button></li>
              <li><button onClick={() => onNavigate && onNavigate('gallery')} className="hover:text-white transition-colors cursor-pointer">Before & After Gallery</button></li>
              <li><button onClick={() => onNavigate && onNavigate('memberships')} className="hover:text-white transition-colors cursor-pointer">Memberships & Passes</button></li>
              <li><button onClick={() => onNavigate && onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">Grooming Products</button></li>
              <li><button onClick={() => onNavigate && onNavigate('blog')} className="hover:text-white transition-colors cursor-pointer">Grooming Gazette</button></li>
            </ul>
          </div>

          {/* Signature Services */}
          <div className="space-y-4">
            <h5 className="font-mono text-xs uppercase tracking-widest text-[#C9A45C] font-bold">
              Signature Treatments
            </h5>
            <ul className="space-y-2.5 text-[#A7A7A7]">
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">Classic Scissor Cut</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">Precision Skin Fade</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">Hot Towel Royal Shave</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">Beard Sculpt & Contouring</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">Scalp Detox & Hair Spa</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">Groom's Wedding Package</button></li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h5 className="font-mono text-xs uppercase tracking-widest text-[#C9A45C] font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Atelier Hours
            </h5>
            <div className="space-y-2.5 font-mono text-[11px] text-[#A7A7A7]">
              <div className="flex justify-between border-b border-[#39352E]/40 pb-1.5">
                <span className="text-white">Monday - Friday</span>
                <span className="text-[#F1D9A3]">09:00 AM – 09:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-[#39352E]/40 pb-1.5">
                <span className="text-white">Saturday</span>
                <span className="text-[#F1D9A3]">09:00 AM – 09:30 PM</span>
              </div>
              <div className="flex justify-between border-b border-[#39352E]/40 pb-1.5">
                <span className="text-white">Sunday</span>
                <span className="text-[#F1D9A3]">10:00 AM – 08:30 PM</span>
              </div>
              <div className="pt-1 text-[10px] text-emerald-400">
                ● Open 7 Days with Online Seat Reservation
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-4">
            <h5 className="font-mono text-xs uppercase tracking-widest text-[#C9A45C] font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Studio Location
            </h5>
            <div className="space-y-3 text-[#A7A7A7] text-xs">
              <p className="leading-relaxed">
                {header.address || "Plot 14, Civil Lines Royal Arcade, Near Raj Bhawan, Jaipur, Rajasthan 302006"}
              </p>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <a href={`tel:${header.phone || '+919829012345'}`} className="hover:text-white transition-colors">{header.phone || '+91 98290 12345'}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <a href="mailto:concierge@thegentsden.com" className="hover:text-white transition-colors">concierge@thegentsden.com</a>
                </div>
              </div>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#C9A45C] hover:text-[#F1D9A3] text-xs font-mono font-bold pt-1 transition-colors"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Tier: Policies & Copyright */}
        <div className="border-t border-[#39352E] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A7A7A7]">
          <div>
            &copy; {new Date().getFullYear()} {header.brandName || "THE GENT'S DEN"} &bull; All Rights Reserved. Luxury Barber Operating System.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</button>
            <span>•</span>
            <button onClick={() => onNavigate && onNavigate('cancellation')} className="hover:text-white transition-colors cursor-pointer">Cancellation & Refunds</button>
            <span>•</span>
            <button onClick={() => onNavigate && onNavigate('faq')} className="hover:text-white transition-colors cursor-pointer">FAQ</button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default BarberFooter;
