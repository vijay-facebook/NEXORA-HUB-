/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Calendar as CalendarIcon, Clock, Scissors, Plus, 
  Edit3, Trash2, CheckCircle2, Search, Filter, X, Award, ShieldCheck, Sparkles, Image as ImageIcon 
} from 'lucide-react';
import { BrandedButton } from './BrandedButton';
import { ResponsiveCard } from './ResponsiveCard';

export interface ShiftTimeSlot {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  isWorking: boolean;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "07:00 PM"
  breakTime?: string; // e.g. "01:00 PM - 02:00 PM"
}

export interface ModularStaffMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  yearsOfExperience: string | number;
  photoUrl: string;
  phone?: string;
  email?: string;
  isAvailable: boolean;
  assignedServices?: string[];
  weeklyShifts: ShiftTimeSlot[];
  portfolioImages?: string[];
}

export interface StaffDirectoryProps {
  title?: string;
  subtitle?: string;
  staffMembers?: ModularStaffMember[];
  onUpdateStaffList?: (staff: ModularStaffMember[]) => void;
  accentColor?: string; // e.g. '#C9A45C' or '#6366F1'
  className?: string;
}

const DEFAULT_DAYS: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_STAFF_DIRECTORY: ModularStaffMember[] = [
  {
    id: 'stf_shared_1',
    name: 'Vikram Rathore',
    role: 'Master Barber & Studio Director',
    specialization: 'Precision Skin Fades, Hot Towel Shaves & Beard Architecture',
    yearsOfExperience: '12+ Years',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    phone: '+91 98290 11111',
    email: 'vikram@thegentsden.com',
    isAvailable: true,
    assignedServices: ['Skin Fade', 'Hot Towel Shave', 'Beard Trim'],
    weeklyShifts: [
      { day: 'Mon', isWorking: true, startTime: '09:00 AM', endTime: '07:00 PM', breakTime: '01:00 PM - 02:00 PM' },
      { day: 'Tue', isWorking: true, startTime: '09:00 AM', endTime: '07:00 PM', breakTime: '01:00 PM - 02:00 PM' },
      { day: 'Wed', isWorking: true, startTime: '09:00 AM', endTime: '07:00 PM', breakTime: '01:00 PM - 02:00 PM' },
      { day: 'Thu', isWorking: true, startTime: '09:00 AM', endTime: '07:00 PM', breakTime: '01:00 PM - 02:00 PM' },
      { day: 'Fri', isWorking: true, startTime: '09:00 AM', endTime: '07:00 PM', breakTime: '01:00 PM - 02:00 PM' },
      { day: 'Sat', isWorking: true, startTime: '09:00 AM', endTime: '08:00 PM', breakTime: '01:00 PM - 02:00 PM' },
      { day: 'Sun', isWorking: false, startTime: '10:00 AM', endTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM' }
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: 'stf_shared_2',
    name: 'Pooja Sharma',
    role: 'Creative Senior Stylist & Colorist',
    specialization: 'Balayage, Keratin Treatments & Luxury Hair Spa',
    yearsOfExperience: '8 Years',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    phone: '+91 98290 22222',
    email: 'pooja@thegentsden.com',
    isAvailable: true,
    assignedServices: ['Hair Spa', 'Keratin Smoothening', 'Creative Color'],
    weeklyShifts: [
      { day: 'Mon', isWorking: false, startTime: '10:00 AM', endTime: '08:00 PM', breakTime: '02:00 PM - 03:00 PM' },
      { day: 'Tue', isWorking: true, startTime: '10:00 AM', endTime: '08:00 PM', breakTime: '02:00 PM - 03:00 PM' },
      { day: 'Wed', isWorking: true, startTime: '10:00 AM', endTime: '08:00 PM', breakTime: '02:00 PM - 03:00 PM' },
      { day: 'Thu', isWorking: true, startTime: '10:00 AM', endTime: '08:00 PM', breakTime: '02:00 PM - 03:00 PM' },
      { day: 'Fri', isWorking: true, startTime: '10:00 AM', endTime: '08:00 PM', breakTime: '02:00 PM - 03:00 PM' },
      { day: 'Sat', isWorking: true, startTime: '09:00 AM', endTime: '08:00 PM', breakTime: '02:00 PM - 03:00 PM' },
      { day: 'Sun', isWorking: true, startTime: '10:00 AM', endTime: '06:00 PM', breakTime: '02:00 PM - 03:00 PM' }
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: 'stf_shared_3',
    name: 'Arjun Verma',
    role: 'Beard Architect & Facialist',
    specialization: 'Beard Sculpting, Charcoal Facials & Head Massages',
    yearsOfExperience: '6 Years',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    phone: '+91 98290 33333',
    email: 'arjun@thegentsden.com',
    isAvailable: true,
    assignedServices: ['Beard Spa', 'De-Tan Facial', 'Head Massage'],
    weeklyShifts: [
      { day: 'Mon', isWorking: true, startTime: '11:00 AM', endTime: '08:00 PM', breakTime: '03:00 PM - 04:00 PM' },
      { day: 'Tue', isWorking: true, startTime: '11:00 AM', endTime: '08:00 PM', breakTime: '03:00 PM - 04:00 PM' },
      { day: 'Wed', isWorking: false, startTime: '11:00 AM', endTime: '08:00 PM', breakTime: '03:00 PM - 04:00 PM' },
      { day: 'Thu', isWorking: true, startTime: '11:00 AM', endTime: '08:00 PM', breakTime: '03:00 PM - 04:00 PM' },
      { day: 'Fri', isWorking: true, startTime: '11:00 AM', endTime: '08:00 PM', breakTime: '03:00 PM - 04:00 PM' },
      { day: 'Sat', isWorking: true, startTime: '10:00 AM', endTime: '09:00 PM', breakTime: '03:00 PM - 04:00 PM' },
      { day: 'Sun', isWorking: true, startTime: '10:00 AM', endTime: '07:00 PM', breakTime: '03:00 PM - 04:00 PM' }
    ],
    portfolioImages: [
      'https://images.unsplash.com/photo-1517832606293-7ae2a71c842f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600'
    ]
  }
];

export const StaffDirectory: React.FC<StaffDirectoryProps> = ({
  title = "Staff Directory & Shift Roster",
  subtitle = "Manage master barber headshots, roles, specializations, years of experience, weekly shift schedules, and masonry portfolio galleries",
  staffMembers = DEFAULT_STAFF_DIRECTORY,
  onUpdateStaffList,
  accentColor = "#C9A45C",
  className = ""
}) => {
  const [list, setList] = useState<ModularStaffMember[]>(staffMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<ModularStaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formSpecialization, setFormSpecialization] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formShifts, setFormShifts] = useState<ShiftTimeSlot[]>([]);
  const [formPortfolioImages, setFormPortfolioImages] = useState<string[]>([]);
  const [newPortfolioUrlInput, setNewPortfolioUrlInput] = useState('');

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormName('');
    setFormRole('Senior Stylist');
    setFormSpecialization('Precision Haircuts & Styling');
    setFormExperience('5 Years');
    setFormPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
    setFormPhone('');
    setFormPortfolioImages([
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600'
    ]);
    setNewPortfolioUrlInput('');
    setFormShifts(DEFAULT_DAYS.map(day => ({
      day,
      isWorking: day !== 'Sun',
      startTime: '09:00 AM',
      endTime: '07:00 PM',
      breakTime: '01:00 PM - 02:00 PM'
    })));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: ModularStaffMember) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormRole(staff.role);
    setFormSpecialization(staff.specialization);
    setFormExperience(String(staff.yearsOfExperience));
    setFormPhotoUrl(staff.photoUrl);
    setFormPhone(staff.phone || '');
    setFormPortfolioImages(staff.portfolioImages || []);
    setNewPortfolioUrlInput('');
    setFormShifts(staff.weeklyShifts || DEFAULT_DAYS.map(day => ({
      day,
      isWorking: true,
      startTime: '09:00 AM',
      endTime: '07:00 PM',
      breakTime: '01:00 PM - 02:00 PM'
    })));
    setIsModalOpen(true);
  };

  const handleToggleFormShift = (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun') => {
    setFormShifts(prev => prev.map(s => s.day === day ? { ...s, isWorking: !s.isWorking } : s));
  };

  const handleUpdateShiftHours = (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', field: 'startTime' | 'endTime' | 'breakTime', value: string) => {
    setFormShifts(prev => prev.map(s => s.day === day ? { ...s, [field]: value } : s));
  };

  const handleAddPortfolioImage = () => {
    if (!newPortfolioUrlInput.trim()) return;
    setFormPortfolioImages(prev => [...prev, newPortfolioUrlInput.trim()]);
    setNewPortfolioUrlInput('');
  };

  const handleDeleteFormPortfolioImage = (index: number) => {
    setFormPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let updated: ModularStaffMember[];

    if (editingStaff) {
      updated = list.map(s => s.id === editingStaff.id ? {
        ...s,
        name: formName.trim(),
        role: formRole,
        specialization: formSpecialization,
        yearsOfExperience: formExperience,
        photoUrl: formPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        phone: formPhone,
        weeklyShifts: formShifts,
        portfolioImages: formPortfolioImages
      } : s);
    } else {
      const newMember: ModularStaffMember = {
        id: 'stf_shared_' + Math.random().toString(36).substring(2, 9),
        name: formName.trim(),
        role: formRole,
        specialization: formSpecialization,
        yearsOfExperience: formExperience,
        photoUrl: formPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        phone: formPhone,
        isAvailable: true,
        weeklyShifts: formShifts,
        portfolioImages: formPortfolioImages
      };
      updated = [newMember, ...list];
    }

    setList(updated);
    if (onUpdateStaffList) onUpdateStaffList(updated);
    setIsModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member from the roster?")) {
      const updated = list.filter(s => s.id !== id);
      setList(updated);
      if (onUpdateStaffList) onUpdateStaffList(updated);
    }
  };

  const filteredList = list.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedDayFilter === 'All') return matchesSearch;
    const workingOnDay = s.weeklyShifts?.some(shift => shift.day === selectedDayFilter && shift.isWorking);
    return matchesSearch && workingOnDay;
  });

  return (
    <div className={`space-y-6 text-left font-sans ${className}`}>
      {/* Module Title & Navigation Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-md shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-serif">
              {title}
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                {list.filter(s => s.isAvailable).length} Active Roster
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Card & Portfolio View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Shift Calendar
            </button>
          </div>

          <BrandedButton
            variant="gold"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4 text-slate-950" />}
          >
            Add New Staff
          </BrandedButton>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-950 border border-slate-800 p-3 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff, role, or skill..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-slate-600 text-white text-xs pl-8 pr-3 py-2 rounded-xl outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
          <span className="text-[10px] text-slate-500 font-mono uppercase font-bold shrink-0">Working Day:</span>
          {['All', ...DEFAULT_DAYS].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDayFilter(day)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition-colors cursor-pointer ${
                selectedDayFilter === day 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode: Card Grid with Masonry Portfolio */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((staff) => (
            <ResponsiveCard
              key={staff.id}
              variant="default"
              padding="md"
              className="relative group border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  {/* Staff Headshot */}
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950 shadow-md">
                    <img 
                      src={staff.photoUrl} 
                      alt={staff.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      staff.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-sm text-white truncate font-serif">{staff.name}</h3>
                      <span 
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold shrink-0 border"
                        style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}
                      >
                        {staff.yearsOfExperience}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-400 font-mono line-clamp-1">{staff.role}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{staff.specialization}</p>
                  </div>
                </div>

                {/* Weekly Shift Badges */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Working Shift
                    </span>
                    <span className="text-white font-bold">
                      {staff.weeklyShifts?.find(s => s.isWorking)?.startTime || '09:00 AM'} – {staff.weeklyShifts?.find(s => s.isWorking)?.endTime || '07:00 PM'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap pt-1 font-mono">
                    {DEFAULT_DAYS.map((day) => {
                      const shift = staff.weeklyShifts?.find(s => s.day === day);
                      const isWorking = shift?.isWorking;
                      return (
                        <span
                          key={day}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isWorking 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-slate-950 text-slate-600 border border-slate-900'
                          }`}
                          title={isWorking ? `${day}: ${shift?.startTime} - ${shift?.endTime}` : `${day}: Off`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Masonry-Style Portfolio Grid Preview */}
                {staff.portfolioImages && staff.portfolioImages.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Work Portfolio
                      </span>
                      <span className="text-[10px] text-slate-500">{staff.portfolioImages.length} Photos</span>
                    </div>

                    <div className="columns-2 sm:columns-3 gap-2 space-y-2">
                      {staff.portfolioImages.map((imgUrl, imgIdx) => (
                        <div 
                          key={imgIdx} 
                          className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group/img break-inside-avoid shadow"
                        >
                          <img 
                            src={imgUrl} 
                            alt={`${staff.name} work ${imgIdx + 1}`}
                            className="w-full object-cover rounded-xl group-hover/img:scale-105 transition-transform duration-300"
                            style={{ minHeight: imgIdx % 2 === 0 ? '70px' : '90px', maxHeight: '120px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Roster
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(staff)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Staff Member & Portfolio"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Remove Staff"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </ResponsiveCard>
          ))}
        </div>
      )}

      {/* View Mode: Shift Calendar Matrix Table */}
      {viewMode === 'calendar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4 min-w-[200px]">Staff Member</th>
                <th className="p-4">Role & Exp</th>
                {DEFAULT_DAYS.map(day => (
                  <th key={day} className="p-3 text-center min-w-[100px]">{day}</th>
                ))}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="p-4 font-sans font-extrabold text-white flex items-center gap-3">
                    <img 
                      src={staff.photoUrl} 
                      alt={staff.name} 
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate font-serif">{staff.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal line-clamp-1">{staff.specialization}</div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[11px]">
                    <div className="text-amber-400 font-bold">{staff.role}</div>
                    <div className="text-slate-500 text-[10px]">{staff.yearsOfExperience}</div>
                  </td>

                  {DEFAULT_DAYS.map(day => {
                    const shift = staff.weeklyShifts?.find(s => s.day === day);
                    const isWorking = shift?.isWorking;
                    return (
                      <td key={day} className="p-3 text-center">
                        {isWorking ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-1.5 rounded-xl text-[10px] font-bold">
                            <div>{shift?.startTime}</div>
                            <div className="text-[9px] text-slate-400">{shift?.endTime}</div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600 bg-slate-950 px-2 py-1 rounded font-bold">
                            OFF
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(staff)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Add Modal with Masonry Portfolio Manager */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 font-black"
                  style={{ backgroundColor: accentColor }}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white font-serif">
                    {editingStaff ? 'Edit Staff, Shifts & Portfolio' : 'Add New Staff Member'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure headshots, role, specialization, shift calendar, and masonry portfolio gallery.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">Staff Full Name *</label>
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
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">Title / Role *</label>
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
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">Specialization & Skillsets *</label>
                  <input 
                    type="text"
                    required
                    value={formSpecialization}
                    onChange={(e) => setFormSpecialization(e.target.value)}
                    placeholder="e.g. Skin Fades, Beard Sculpting, Balayage"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 text-white p-3 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">Years of Experience *</label>
                  <input 
                    type="text"
                    required
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value)}
                    placeholder="e.g. 10+ Years"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 text-white p-3 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Headshot */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">Headshot Photo URL</label>
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
                      alt="Headshot Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Masonry-Style Portfolio Work Images Manager */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Masonry Portfolio Work Gallery
                  </span>
                  <span className="text-[10px] text-slate-400">{formPortfolioImages.length} Images</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Add high-resolution photos of haircuts, shaves, and styling work. Hover over any photo in the grid to delete.
                </p>

                <div className="flex gap-2 items-center">
                  <input 
                    type="text"
                    value={newPortfolioUrlInput}
                    onChange={(e) => setNewPortfolioUrlInput(e.target.value)}
                    placeholder="Paste image URL (Unsplash or custom)..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-slate-600 text-white p-2.5 rounded-xl outline-none font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPortfolioImage}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    Add Image
                  </button>
                </div>

                {/* Masonry Grid Preview with Hover Delete Overlay */}
                {formPortfolioImages.length > 0 ? (
                  <div className="columns-2 sm:columns-3 gap-3 space-y-3 pt-2">
                    {formPortfolioImages.map((img, idx) => (
                      <div 
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 break-inside-avoid shadow-lg"
                      >
                        <img 
                          src={img} 
                          alt={`Portfolio work ${idx + 1}`}
                          className="w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          style={{ minHeight: idx % 2 === 0 ? '90px' : '130px', maxHeight: '160px' }}
                        />
                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteFormPortfolioImage(idx)}
                            className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-xl flex items-center gap-1.5 text-[11px] font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer"
                            title="Delete this portfolio image"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-mono">
                    No portfolio images added yet. Add a few images above.
                  </div>
                )}
              </div>

              {/* Weekly Shift Management Calendar Grid */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" /> Shift Management Calendar (Mon – Sun)
                </h4>

                <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pt-1">
                  {formShifts.map((shift) => (
                    <div 
                      key={shift.day}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        shift.isWorking ? 'bg-slate-900 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleFormShift(shift.day)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                            shift.isWorking 
                              ? 'bg-emerald-500 text-slate-950' 
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {shift.day}: {shift.isWorking ? 'WORKING' : 'OFF'}
                        </button>
                      </div>

                      {shift.isWorking && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 font-mono text-[11px]">
                          <div>
                            <span className="block text-[9px] text-slate-500 uppercase">Start</span>
                            <input 
                              type="text"
                              value={shift.startTime}
                              onChange={(e) => handleUpdateShiftHours(shift.day, 'startTime', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-white p-1.5 rounded"
                            />
                          </div>

                          <div>
                            <span className="block text-[9px] text-slate-500 uppercase">End</span>
                            <input 
                              type="text"
                              value={shift.endTime}
                              onChange={(e) => handleUpdateShiftHours(shift.day, 'endTime', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-white p-1.5 rounded"
                            />
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <span className="block text-[9px] text-slate-500 uppercase">Break</span>
                            <input 
                              type="text"
                              value={shift.breakTime || '01:00 PM - 02:00 PM'}
                              onChange={(e) => handleUpdateShiftHours(shift.day, 'breakTime', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-white p-1.5 rounded"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
                  Save Staff Member, Portfolio & Shifts
                </BrandedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;
