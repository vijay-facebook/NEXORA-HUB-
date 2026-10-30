import React, { useState } from 'react';
import { Users, Clock, Trash2, Edit2, Plus, Search, Calendar, ChevronDown } from 'lucide-react';
import { Staff, Service, Appointment } from '../types';

interface StaffManagementTabProps {
  staff: Staff[];
  services: Service[];
  bookings: Appointment[];
  tenantId: string;
  onRefresh: () => void;
}

export default function StaffManagementTab({ staff, services, bookings, tenantId, onRefresh }: StaffManagementTabProps) {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Simple performance metric: completed bookings
  const getCompletedBookings = (staffId: string) => {
    return bookings.filter(b => b.staff_id === staffId && b.status === 'completed').length;
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-fadeIn max-w-6xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-indigo-600 tracking-widest uppercase block font-mono">SalonOS Staff Operations</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Staff Directory & Roster Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your team, assign service specialties, and track daily performance metrics.</p>
        </div>
      </div>

      {/* Staff List / Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Staff Directory
          </h3>
          <button className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Staff Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Specialties</th>
                <th className="p-4">Performance (Completed)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-950">{s.name}</td>
                  <td className="p-4 text-slate-700">{s.role}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {s.specialty?.map(spec => (
                        <span key={spec} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium text-[10px]">{spec}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-600">{getCompletedBookings(s.id)}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Roster (Conceptual) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-indigo-500" />
          Shift Management (Weekly View)
        </h3>
        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
          <p className="text-slate-500 text-xs">Shift scheduling and roster automation module coming soon.</p>
        </div>
      </div>
    </div>
  );
}
