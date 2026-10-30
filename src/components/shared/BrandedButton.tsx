/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BrandedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const BrandedButton: React.FC<BrandedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-xs sm:text-sm px-4 py-2.5 gap-2",
    lg: "text-sm sm:text-base px-6 py-3.5 gap-2.5"
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-500/30",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm",
    outline: "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500",
    gold: "bg-gradient-to-r from-[#C9A45C] via-[#E2C78A] to-[#C9A45C] hover:brightness-110 text-slate-950 font-black shadow-md shadow-[#C9A45C]/20 border border-[#F1D9A3]/40",
    ghost: "bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-rose-500/30"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default BrandedButton;
