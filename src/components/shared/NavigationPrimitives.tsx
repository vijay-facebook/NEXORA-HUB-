/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronRight, X, Menu, Sparkles, CheckCircle2, Circle } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* NavbarBrand                                                                */
/* -------------------------------------------------------------------------- */
export interface NavbarBrandProps {
  title?: string;
  subtitle?: string;
  logoIcon?: React.ReactNode;
  badgeText?: string;
  onClick?: () => void;
}

export const NavbarBrand: React.FC<NavbarBrandProps> = ({
  title = "Nexora SalonOS",
  subtitle = "Beauty Operating System",
  logoIcon,
  badgeText,
  onClick
}) => {
  return (
    <div onClick={onClick} className="flex items-center gap-3 cursor-pointer select-none group text-left">
      <div className="w-10 h-10 rounded-2xl bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/20 transition-colors shrink-0">
        {logoIcon || <Sparkles className="w-5 h-5" />}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight font-sans group-hover:text-indigo-200 transition-colors">
            {title}
          </h1>
          {badgeText && (
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* NavPill                                                                    */
/* -------------------------------------------------------------------------- */
export interface NavPillProps {
  label: string;
  active?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  onClick?: () => void;
}

export const NavPill: React.FC<NavPillProps> = ({
  label,
  active = false,
  icon,
  badge,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {badge !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
          active ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400 border border-slate-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* StatusBadge                                                                */
/* -------------------------------------------------------------------------- */
export type StatusBadgeType = 'online' | 'ready' | 'planned' | 'popular' | 'featured';

export interface StatusBadgeProps {
  type?: StatusBadgeType;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type = 'online',
  label
}) => {
  const styles: Record<StatusBadgeType, { bg: string; text: string; border: string; dot: string; defaultLabel: string }> = {
    online: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500 animate-pulse', defaultLabel: 'Online' },
    ready: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-400', defaultLabel: 'Ready' },
    planned: { bg: 'bg-slate-800/60', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-500', defaultLabel: 'Planned' },
    popular: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', dot: 'bg-amber-400', defaultLabel: 'Popular' },
    featured: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30', dot: 'bg-purple-400', defaultLabel: 'Featured' }
  };

  const current = styles[type];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${current.bg} ${current.text} ${current.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <span>{label || current.defaultLabel}</span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Breadcrumb                                                                 */
/* -------------------------------------------------------------------------- */
export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
            {isLast ? (
              <span className="font-bold text-white truncate">{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                className="hover:text-slate-200 transition-colors cursor-pointer truncate"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/* MobileNavDrawer                                                            */
/* -------------------------------------------------------------------------- */
export interface MobileNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  onClick: () => void;
}

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  items: MobileNavItem[];
  activeId?: string;
  actionButton?: React.ReactNode;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  title = "Navigation Menu",
  items,
  activeId,
  actionButton
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end text-left">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-xs bg-slate-900 border-l border-slate-800 text-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {actionButton && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};
