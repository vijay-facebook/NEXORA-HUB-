/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole } from '../types';
import { Shield, User, ShoppingBag, Award, Briefcase, Sparkles, Building2 } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  currentTenantId: string;
  onTenantChange: (id: string) => void;
  tenants: any[];
}

export default function RoleSelector({ 
  currentRole, 
  onChangeRole, 
  currentTenantId, 
  onTenantChange,
  tenants 
}: RoleSelectorProps) {
  const roles = [
    { value: UserRole.CUSTOMER, label: 'Guest / Customer', icon: User, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: UserRole.OWNER, label: 'Shop Owner', icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { value: UserRole.PARTNER, label: 'Growth Partner', icon: Award, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { value: UserRole.BRAND, label: 'B2B Brand/Distributor', icon: Building2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { value: UserRole.JOB_USER, label: 'Beauty Jobs Seeker', icon: Briefcase, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { value: UserRole.ADMIN, label: 'Super Admin Operations', icon: Shield, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  ];

  return (
    <div className="bg-slate-900 text-white px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 relative z-50 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-lg tracking-wider text-blue-400">NEXORA</span>
        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2 py-0.5 rounded-full font-mono font-medium">SalonOS v3</span>
        <span className="text-slate-400 text-xs hidden lg:inline">| Developer Environment Switcher</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = currentRole === role.value;
          return (
            <button
              key={role.value}
              id={`role-btn-${role.value}`}
              onClick={() => onChangeRole(role.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-105' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>

      {currentRole === UserRole.OWNER && tenants.length > 0 && (
        <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="text-slate-400">Active Shop:</span>
          <select 
            id="active-shop-selector"
            value={currentTenantId}
            onChange={(e) => onTenantChange(e.target.value)}
            className="bg-slate-900 text-white font-semibold border-none focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5 cursor-pointer outline-none"
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
