/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Layout, ChevronDown, ExternalLink, Sparkles, X, 
  CheckCircle2, ArrowRight, Scissors, ShieldCheck, Eye 
} from 'lucide-react';
import { BUSINESS_TYPES } from '../config/businessTypeMapper';

interface TemplatePreviewHeaderMenuProps {
  onSelectTemplateRoute: (route: string) => void;
  currentPath?: string;
}

export const TemplatePreviewHeaderMenu: React.FC<TemplatePreviewHeaderMenuProps> = ({
  onSelectTemplateRoute,
  currentPath
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen]);

  // Close dropdown on click outside or on Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const templatesList = BUSINESS_TYPES.filter(b => b.value !== 'Other');

  const handleSelect = (slug: string) => {
    try {
      localStorage.setItem('selectedTemplate', slug);
      localStorage.setItem('activeTemplateSlug', slug);
    } catch (e) {
      // ignore
    }
    setIsOpen(false);
    const targetRoute = `/templates/${slug}`;
    onSelectTemplateRoute(targetRoute);
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:items-start sm:justify-end sm:p-0 pointer-events-auto">
      {/* Backdrop overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md animate-fadeIn z-[9998]"
      />

      {/* Floating Menu Modal / Dropdown Overlay */}
      <div 
        ref={menuRef}
        style={coords && window.innerWidth >= 640 ? {
          position: 'fixed',
          top: `${coords.top}px`,
          right: `${coords.right}px`,
          width: '480px',
        } : undefined}
        className="relative z-[9999] w-full max-w-[480px] sm:w-[480px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden text-left animate-fadeIn flex flex-col max-h-[85vh] sm:mt-0 my-auto"
      >
        {/* Menu Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                Template Library & Previews
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full uppercase font-mono font-bold">
                  8 Live
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Select a business template to preview its full layout & features
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Close template menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template List Grid with Smooth Internal Scroll */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
          {templatesList.map((tpl) => {
            const isActive = currentPath === `/templates/${tpl.templateSlug}`;
            return (
              <div
                key={tpl.templateSlug}
                onClick={() => handleSelect(tpl.templateSlug)}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isActive
                    ? 'bg-indigo-950/70 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-950/60 hover:bg-slate-800/90 border-slate-800 hover:border-amber-500/30'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">
                      {tpl.label}
                    </span>
                    {tpl.badge && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase font-mono">
                        {tpl.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.2 rounded font-bold uppercase font-mono flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" /> Viewing
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal font-sans">
                    {tpl.description}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[9px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                      {tpl.industryType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  <span className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1 group-hover:scale-105">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Preview</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="bg-slate-950 p-3 text-center border-t border-slate-800 text-[10px] text-slate-400 font-mono shrink-0">
          Click any template above to test real-time booking flows, pricing & services.
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative inline-block text-left">
      {/* Header Button Trigger */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 border border-indigo-500/30 cursor-pointer active:scale-95"
      >
        <Layout className="w-4 h-4 text-indigo-200" />
        <span className="hidden sm:inline">Templates Library</span>
        <span className="sm:hidden">Templates</span>
        <span className="bg-white/20 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md font-extrabold">
          8
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(modalContent, document.body)}
    </div>
  );
};

export default TemplatePreviewHeaderMenu;
