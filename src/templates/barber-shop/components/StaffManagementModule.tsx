/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Clock, Scissors, 
  Check, X, Sparkles, Upload, CheckCircle2, AlertCircle, Search, ShieldCheck 
} from 'lucide-react';
import { BrandedButton } from '../../../components/shared/BrandedButton';
import { ResponsiveCard } from '../../../components/shared/ResponsiveCard';

export interface AssignedService {
  id: string;
  name: string;
  category?: string;
  price?: number;
}

export interface StaffShiftSchedule {
  workDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  startTime: string;  // "09:00 AM"
  endTime: string;    // "07:00 PM"
  breakTime: string;  // "01:00 PM - 02:00 PM"
  maxDailyBookings: number;
}

export interface SharedStaffMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experienceYears: number | string;
  photoUrl: string;
  phone?: string;
  isAvailable: boolean;
  assignedServiceIds: string[];
  schedule: StaffShiftSchedule;
}

interface StaffManagementModuleProps {
  initialStaff?: SharedStaffMember[];
  availableServices?: AssignedService[];
  onSaveStaff?: (staffList: SharedStaffMember[]) => void;
  accentColor?: string;
  className?: string;
}

const DEFAULT_SERVICES: AssignedService[] = [
  { id: 'srv_1', name: 'Signature Skin Fade & Haircut', category: 'Haircuts', price: 600 },
  { id: 'srv_2', name: 'Royal Hot Towel Shave', category: 'Shaves', price: 450 },
  { id: 'srv_3', name: 'Beard Sculpting & Oil Ritual', category: 'Beard', price: 400 },
  { id: 'srv_4', name: 'Executive Hair Spa & Scalp Detox', category: 'Hair & Scalp', price: 800 },
  { id: 'srv_5', name: 'De-Tan Charcoal Facial Treatment', category: 'Facials', price: 950 },
  { id: 'srv_6', name: 'Creative Color & Balayage', category: 'Coloring', price: 2500 }
];

const DEFAULT_STAFF: SharedStaffMember[] = [
  {
    id: 'stf_barber_1',
    name: 'Vikram Rathore',
    role: 'Master Barber & Founder',
    specialty: 'Precision Skin Fades & Straight Razor Shaves',
    experienceYears: '12 Yrs',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    phone: '+91 98290 11111',
    isAvailable: true,
    assignedServiceIds: ['srv_1', 'srv_2', 'srv_3', 'srv_4'],
    schedule: {
      workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      startTime: '09:00 AM',
      endTime: '07:00 PM',
      breakTime: '01:00 PM - 02:00 PM',
      maxDailyBookings: 12
    }
  },
  {
    id: 'stf_barber_2',
    name: 'Pooja Sharma',
    role: 'Senior Stylist & Colorist',
    specialty: 'Creative Layer Cuts, Keratin & Hair Spa',
    experienceYears: '8 Yrs',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    phone: '+91 98290 22222',
    isAvailable: true,
    assignedServiceIds: ['srv_1', 'srv_4', 'srv_6'],
    schedule: {
      workDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      startTime: '10:00 AM',
      endTime: '08:00 PM',
      breakTime: '02:00 PM - 03:00 PM',
      maxDailyBookings: 10
    }
  },
  {
    id: 'stf_barber_3',
    name: 'Arjun Verma',
    role: 'Beard Specialist & Groomer',
    specialty: 'Beard Architecture, Shaves & Facials',
    experienceYears: '6 Yrs',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    phone: '+91 98290 33333',
    isAvailable: true,
    assignedServiceIds: ['srv_2', 'srv_3', 'srv_5'],
    schedule: {
      workDays: ['Mon', 'Thu', 'Fri', 'Sat', 'Sun'],
      startTime: '11:00 AM',
      endTime: '09:00 PM',
      breakTime: '03:00 PM - 04:00 PM',
      maxDailyBookings: 8
    }
  }
];

export const StaffManagementModule: React.FC<StaffManagementModuleProps> = ({
  initialStaff = DEFAULT_STAFF,
  availableServices = DEFAULT_SERVICES,
  onSaveStaff,
  accentColor = '#C9A45C',
  className = ''
}) => {
  const [staffList, setStaffList] = useState<SharedStaffMember[]>(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStaff, setEditingStaff] = useState<SharedStaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Senior Stylist');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formExperience, setFormExperience] = useState('5 Yrs');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWorkDays, setFormWorkDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [formStartTime, setFormStartTime] = useState('09:00 AM');
  const [formEndTime, setFormEndTime] = useState('07:00 PM');
  const [formBreakTime, setFormBreakTime] = useState('01:00 PM - 02:00 PM');
  const [formMaxBookings, setFormMaxBookings] = useState(10);
  const [formAssignedServices, setFormAssignedServices] = useState<string[]>([]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const openAddModal = () => {
    setEditingStaff(null);
    setFormName('');
    setFormRole('Senior Stylist');
    setFormSpecialty('');
    setFormExperience('5 Yrs');
    setFormPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
    setFormPhone('');
    setFormWorkDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    setFormStartTime('09:00 AM');
    setFormEndTime('07:00 PM');
    setFormBreakTime('01:00 PM - 02:00 PM');
    setFormMaxBookings(10);
    setFormAssignedServices(availableServices.map(s => s.id));
    setIsModalOpen(true);
  };

  const openEditModal = (staff: SharedStaffMember) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormRole(staff.role);
    setFormSpecialty(staff.specialty);
    setFormExperience(String(staff.experienceYears));
    setFormPhotoUrl(staff.photoUrl);
    setFormPhone(staff.phone || '');
    setFormWorkDays(staff.schedule?.workDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    setFormStartTime(staff.schedule?.startTime || '09:00 AM');
    setFormEndTime(staff.schedule?.endTime || '07:00 PM');
    setFormBreakTime(staff.schedule?.breakTime || '01:00 PM - 02:00 PM');
    setFormMaxBookings(staff.schedule?.maxDailyBookings || 10);
    setFormAssignedServices(staff.assignedServiceIds || []);
    setIsModalOpen(true);
  };

  const handleToggleDay = (day: string) => {
    setFormWorkDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleToggleService = (serviceId: string) => {
    setFormAssignedServices(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let updatedList: SharedStaffMember[];

    if (editingStaff) {
      updatedList = staffList.map(s => s.id === editingStaff.id ? {
        ...s,
        name: formName.trim(),
        role: formRole,
        specialty: formSpecialty,
        experienceYears: formExperience,
        photoUrl: formPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        phone: formPhone,
        assignedServiceIds: formAssignedServices,
        schedule: {
          workDays: formWorkDays,
          startTime: formStartTime,
          endTime: formEndTime,
          breakTime: formBreakTime,
          maxDailyBookings: Number(formMaxBookings)
        }
      } : s);
    } else {
      const newStaff: SharedStaffMember = {
        id: 'stf_' + Math.random().toString(36).substring(2, 9),
        name: formName.trim(),
        role: formRole,
        specialty: formSpecialty,
        experienceYears: formExperience,
        photoUrl: formPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        phone: formPhone,
        isAvailable: true,
        assignedServiceIds: formAssignedServices,
        schedule: {
          workDays: formWorkDays,
          startTime: formStartTime,
          endTime: formEndTime,
          breakTime: formBreakTime,
          maxDailyBookings: Number(formMaxBookings)
        }
      };
      updatedList = [newStaff, ...staffList];
    }

    setStaffList(updatedList);
    if (onSaveStaff) onSaveStaff(updatedList);
    setIsModalOpen(false);
  };

  const handleToggleAvailability = (id: string) => {
    const updated = staffList.map(s => s.id === id ? { ...s, isAvailable: !s.isAvailable } : s);
    setStaffList(updated);
    if (onSaveStaff) onSaveStaff(updated);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member from the roster?")) {
      const updated = staffList.filter(s => s.id !== id);
      setStaffList(updated);
      if (onSaveStaff) onSaveStaff(updated);
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-6 text-left font-sans ${className}`}>
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-md shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              Staff & Barber Roster Management
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {staffList.filter(s => s.isAvailable).length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Manage team headshots, assigned service menus, and individual shift schedules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff name or role..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 text-white placeholder:text-slate-500 text-xs pl-8 pr-3 py-2 rounded-xl outline-none font-mono"
            />
          </div>

          <BrandedButton
            variant="gold"
            size="sm"
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4 text-slate-950" />}
          >
            Add Staff
          </BrandedButton>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((staff) => {
          const assignedServicesCount = staff.assignedServiceIds?.length || 0;
          return (
            <ResponsiveCard
              key={staff.id}
              variant="default"
              padding="md"
              className="relative group hover:border-slate-700 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Headshot */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                  <img 
                    src={staff.photoUrl} 
                    alt={staff.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <button
                    onClick={() => handleToggleAvailability(staff.id)}
                    className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 cursor-pointer ${
                      staff.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    title={staff.isAvailable ? 'On Duty' : 'Off Duty'}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-sm text-white truncate">{staff.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md shrink-0">
                      {staff.experienceYears}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-400 font-mono">{staff.role}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal">{staff.specialty}</p>
                </div>
              </div>

              {/* Shift Hours & Services Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Shift:</span>
                  </span>
                  <span className="text-white font-bold text-[11px]">
                    {staff.schedule?.startTime} – {staff.schedule?.endTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Scissors className="w-3.5 h-3.5 text-slate-500" />
                    <span>Services Assigned:</span>
                  </span>
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {assignedServicesCount} Services
                  </span>
                </div>

                <div className="flex items-center gap-1 pt-1 flex-wrap">
                  {daysOfWeek.map((day) => {
                    const isWorkDay = staff.schedule?.workDays?.includes(day);
                    return (
                      <span 
                        key={day}
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isWorkDay ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-600'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleAvailability(staff.id)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    staff.isAvailable 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                  }`}
                >
                  {staff.isAvailable ? 'On Duty' : 'Off Duty'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(staff)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Staff Member & Shift"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Remove Staff Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </ResponsiveCard>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 font-black"
                  style={{ backgroundColor: accentColor }}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {editingStaff ? 'Edit Staff Profile & Shift' : 'Add New Staff Member'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure headshot, assigned services, and daily shift schedule.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5 text-xs font-semibold">
              {/* Headshot & Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]">Staff Full Name *</label>
                  <input 
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Vikram Rathore"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 text-white p-3 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]">Master Role / Title *</label>
                  <input 
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Master Barber & Colorist"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 text-white p-3 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]">Specialization & Skills</label>
                  <input 
                    type="text"
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    placeholder="e.g. Precision Fades, Hot Towel Shaves"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 text-white p-3 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]">Experience Level</label>
                  <input 
                    type="text"
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value)}
                    placeholder="e.g. 8 Yrs"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 text-white p-3 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Headshot URL */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]">Headshot Photo URL</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="text"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-slate-600 text-white p-3 rounded-xl outline-none font-mono text-[11px]"
                  />
                  {formPhotoUrl && (
                    <img 
                      src={formPhotoUrl} 
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-950"
                    />
                  )}
                </div>
              </div>

              {/* Shift Hours & Schedule */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Shift Schedule & Work Days
                </h4>

                <div>
                  <span className="block text-slate-400 text-[10px] font-mono uppercase mb-1.5">Working Days:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {daysOfWeek.map((day) => {
                      const selected = formWorkDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => handleToggleDay(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
                            selected 
                              ? 'bg-emerald-500 text-slate-950 shadow' 
                              : 'bg-slate-900 border border-slate-800 text-slate-400'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Shift Start</label>
                    <input 
                      type="text"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Shift End</label>
                    <input 
                      type="text"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      placeholder="07:00 PM"
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Break Time</label>
                    <input 
                      type="text"
                      value={formBreakTime}
                      onChange={(e) => setFormBreakTime(e.target.value)}
                      placeholder="01:00 PM - 02:00 PM"
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Assigned Services Checklist */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" /> Assign Services to {formName || 'Barber'}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormAssignedServices(availableServices.map(s => s.id))}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setFormAssignedServices([])}
                      className="text-[10px] text-slate-500 hover:text-slate-400 font-mono cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pt-1">
                  {availableServices.map((service) => {
                    const isChecked = formAssignedServices.includes(service.id);
                    return (
                      <label 
                        key={service.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-indigo-950/60 border-indigo-500/50 text-white' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleService(service.id)}
                            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                          />
                          <span className="text-xs truncate">{service.name}</span>
                        </div>
                        {service.price && (
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">₹{service.price}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <BrandedButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </BrandedButton>
                <BrandedButton
                  type="submit"
                  variant="gold"
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-slate-950" />}
                >
                  Save Staff & Schedule
                </BrandedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementModule;
