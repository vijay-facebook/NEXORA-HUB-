/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, ArrowLeft, ExternalLink, Sliders, 
  Sparkles, CheckCircle2, ChevronDown 
} from 'lucide-react';
import BarberShopTemplate from './barber-shop';
import UnisexSalonTemplate from './unisex-salon';
import MensSalonTemplate from './mens-salon';
import LadiesParlourTemplate from './ladies-parlour';
import SpaGroomingTemplate from './spa-grooming';
import HairStudioTemplate from './hair-studio';
import NailsStudioTemplate from './nails-studio';
import BeautyGroomingTemplate from './beauty-grooming';
import { BUSINESS_TYPES, getTemplateForBusinessType } from '../config/businessTypeMapper';

interface TemplateRouterProps {
  templateSlug: string;
  onNavigateHome: () => void;
  onNavigateToBuilder: () => void;
}

export function TemplateRouter({
  templateSlug,
  onNavigateHome,
  onNavigateToBuilder
}: TemplateRouterProps) {
  const [activeSlug, setActiveSlug] = useState<string>(templateSlug || 'barber-shop');

  React.useEffect(() => {
    if (templateSlug) {
      setActiveSlug(templateSlug);
    }
  }, [templateSlug]);

  // Load recently created business profile from localStorage if present
  let savedProfile: any = null;
  try {
    const raw = localStorage.getItem('nexora_active_business_profile');
    if (raw) savedProfile = JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  const businessName = savedProfile?.tenant?.name || 'My Salon';
  const businessType = savedProfile?.businessType || 'Barber Shop';
  const currentTemplate = BUSINESS_TYPES.find(b => b.templateSlug === activeSlug) || BUSINESS_TYPES[0];

  const handleSwitchTemplate = (slug: string) => {
    setActiveSlug(slug);
    window.history.pushState({}, '', `/templates/${slug}`);
  };

  const renderActiveTemplate = () => {
    switch (activeSlug) {
      case 'barber-shop':
        return <BarberShopTemplate />;
      case 'unisex-salon':
        return <UnisexSalonTemplate onBackToDashboard={onNavigateHome} onNavigateToBuilder={onNavigateToBuilder} />;
      case 'mens-salon':
        return <MensSalonTemplate onBackToDashboard={onNavigateHome} onNavigateToBuilder={onNavigateToBuilder} />;
      case 'ladies-parlour':
        return <LadiesParlourTemplate onBackToDashboard={onNavigateHome} onNavigateToBuilder={onNavigateToBuilder} />;
      case 'spa-grooming':
        return <SpaGroomingTemplate onBackToDashboard={onNavigateHome} onNavigateToBuilder={onNavigateToBuilder} />;
      case 'hair-studio':
        return <HairStudioTemplate onBackToDashboard={onNavigateHome} onNavigateToBuilder={onNavigateToBuilder} />;
      case 'nails-studio':
        return <NailsStudioTemplate onBackToDashboard={onNavigateHome} onNavigateToBuilder={onNavigateToBuilder} />;
      case 'beauty-grooming':
        return <BeautyGroomingTemplate onBackToDashboard={onNavigateHome} onNavigateToBuilder={onNavigateToBuilder} />;
      default:
        return <BarberShopTemplate />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-left">
      {/* Top Template Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 text-xs font-sans flex flex-col sm:flex-row justify-between items-center gap-3 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer shadow-md shadow-indigo-600/30"
            title="Exit live preview and return to Nexora SalonOS console"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Preview / Back to Dashboard</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-white">{businessName}</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
              {currentTemplate.label} Template
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick template library switcher */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Templates Library:</span>
            <select
              value={activeSlug}
              onChange={(e) => handleSwitchTemplate(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs py-0.5"
            >
              {BUSINESS_TYPES.filter(b => b.value !== 'Other').map(b => (
                <option key={b.templateSlug} value={b.templateSlug} className="bg-slate-900 text-white">
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={onNavigateToBuilder}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Customize in Builder</span>
          </button>
        </div>
      </div>

      {/* Main Template Renderer */}
      <div className="flex-1">
        {renderActiveTemplate()}
      </div>
    </div>
  );
}

export default TemplateRouter;
