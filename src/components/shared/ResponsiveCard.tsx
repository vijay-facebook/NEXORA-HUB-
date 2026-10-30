/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'goldBorder' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface ResponsiveCardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  headerIcon?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  variant = 'default',
  padding = 'md',
  title,
  subtitle,
  badge,
  action,
  headerIcon,
  footer,
  children,
  className = '',
  onClick
}) => {
  const variantStyles: Record<CardVariant, string> = {
    default: "bg-slate-900 border border-slate-800 text-slate-100 shadow-sm",
    elevated: "bg-slate-900/90 border border-slate-800/80 text-slate-100 shadow-xl shadow-black/40 backdrop-blur-md",
    glass: "bg-slate-950/60 border border-white/10 text-white shadow-2xl backdrop-blur-xl",
    goldBorder: "bg-[#181818] border border-[#3A362D] hover:border-[#C9A45C] text-[#F7F4EE] shadow-lg transition-colors",
    interactive: "bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-100 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-xl"
  };

  const paddingStyles: Record<CardPadding, string> = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  };

  const hasHeader = Boolean(title || subtitle || badge || action || headerIcon);

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl sm:rounded-3xl overflow-hidden transition-all text-left ${variantStyles[variant]} ${className}`}
    >
      {hasHeader && (
        <div className={`border-b border-slate-800/60 flex items-center justify-between gap-3 ${paddingStyles[padding]}`}>
          <div className="flex items-center gap-3 min-w-0">
            {headerIcon && (
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0">
                {headerIcon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-white truncate">{title}</h3>
                  {badge}
                </div>
              )}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {footer && (
        <div className={`bg-slate-950/40 border-t border-slate-800/60 ${paddingStyles[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default ResponsiveCard;
