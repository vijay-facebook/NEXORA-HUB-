/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DesignTokens {
  bg: string;
  text: string;
  primary: string;
  themeColor: string;
  font: string;
}

export const TEMPLATE_TOKENS: Record<string, DesignTokens> = {
  'barber-shop': {
    bg: 'bg-slate-950',
    text: 'text-slate-100',
    primary: 'bg-indigo-600',
    themeColor: 'indigo',
    font: 'font-sans',
  },
  'mens-salon': {
    bg: 'bg-[#0D0D0D]',
    text: 'text-[#E5E5E5]',
    primary: 'bg-amber-600',
    themeColor: 'amber',
    font: 'font-serif',
  },
  'ladies-parlour': {
    bg: 'bg-[#FFF5F5]',
    text: 'text-rose-950',
    primary: 'bg-rose-500',
    themeColor: 'rose',
    font: 'font-serif',
  },
  'spa-grooming': {
    bg: 'bg-[#F0FDF9]',
    text: 'text-teal-950',
    primary: 'bg-teal-600',
    themeColor: 'teal',
    font: 'font-sans',
  },
  'hair-studio': {
    bg: 'bg-[#F5F7FF]',
    text: 'text-indigo-950',
    primary: 'bg-indigo-700',
    themeColor: 'indigo',
    font: 'font-sans',
  },
  'nails-studio': {
    bg: 'bg-[#F0FDF4]',
    text: 'text-emerald-950',
    primary: 'bg-emerald-600',
    themeColor: 'emerald',
    font: 'font-sans',
  },
  'beauty-grooming': {
    bg: 'bg-[#F5F3FF]',
    text: 'text-purple-950',
    primary: 'bg-purple-700',
    themeColor: 'purple',
    font: 'font-sans',
  },
  'unisex-salon': {
    bg: 'bg-white',
    text: 'text-slate-900',
    primary: 'bg-indigo-600',
    themeColor: 'indigo',
    font: 'font-sans',
  }
};
