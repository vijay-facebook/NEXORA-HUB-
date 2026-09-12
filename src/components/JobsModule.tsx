/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, PlusCircle, CheckCircle, 
  MapPin, DollarSign, Send, UserCheck, AlertCircle, Info 
} from 'lucide-react';
import { api } from '../lib/supabase';
import { JobPost, JobCandidate, JobApplication } from '../types';

interface JobsModuleProps {
  onRefreshDB: () => void;
}

export default function JobsModule({ onRefreshDB }: JobsModuleProps) {
  // Navigation subtabs
  const [activeTab, setActiveTab] = useState<'board' | 'resume' | 'post-job'>('board');

  // Core database state
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [seekerProfile, setSeekerProfile] = useState<JobCandidate | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply Modal states
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applying, setApplying] = useState(false);

  // Resume builder form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState(2);
  const [specialty, setSpecialty] = useState('Hair Coloring, Styling');
  const [portfolio, setPortfolio] = useState('');

  // Post Job form states
  const [jobTitle, setJobTitle] = useState('');
  const [salonName, setSalonName] = useState('');
  const [jobLocation, setJobLocation] = useState('Jaipur (Malviya Nagar)');
  const [salaryRange, setSalaryRange] = useState('Rs. 25,000 - 35,000');
  const [jobDesc, setJobDesc] = useState('');

  // Sync jobs list
  const syncJobsList = async () => {
    try {
      setLoading(true);
      const res = await api.getJobPosts();
      setJobs(res.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncJobsList();
  }, []);

  // Handle Candidate Application
  const handleApplyToJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      setApplying(true);
      const res = await api.createJobApplication({
        job_post_id: selectedJob.id,
        candidate_name: fullName || "Anonymous Candidate",
        candidate_phone: phone || "9999999999",
        cover_letter: applyNotes
      });
      if (res.success) {
        alert(`Application successfully transmitted to ${selectedJob.salon_name}! They will call you for interview slot verification.`);
        setSelectedJob(null);
        setApplyNotes('');
        syncJobsList();
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  // Handle Seeker Resume Save
  const handleSaveResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    const profile: JobCandidate = {
      id: 'seek_' + Math.random().toString(36).substring(2, 9),
      user_id: 'usr_seek_' + Math.random().toString(36).substring(2, 9),
      full_name: fullName,
      email: fullName.toLowerCase().replace(/\s+/g, '') + '@gmail.com',
      phone,
      experience_years: Number(experience),
      skills: specialty.split(',').map(s => s.trim()),
      preferred_location: 'Jaipur',
      resume_url: portfolio,
      created_at: new Date().toISOString()
    };
    setSeekerProfile(profile);
    alert("Talent Seeker Profile built successfully! You can now apply directly to premium open job roles.");
    setActiveTab('board');
  };

  // Handle Employer Job Post
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !salonName) return;
    try {
      const res = await api.createJobPost({
        title: jobTitle,
        salon_name: salonName,
        location: jobLocation,
        salary_range: salaryRange,
        description: jobDesc,
        category: 'Hair Care',
        tenant_id: 'ten_aura'
      });
      if (res.success) {
        alert("Job vacancy published live to Rajasthan Beauty Talent Board!");
        setJobTitle('');
        setSalonName('');
        setJobDesc('');
        setActiveTab('board');
        syncJobsList();
        onRefreshDB();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs">Loading Talent Board Listings...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] p-6 md:p-8 space-y-8 text-left font-sans">
      
      {/* Header operations banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono inline-block">
            Talent & Employment
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Jaipur Beauty Jobs Directory</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md font-light leading-relaxed">
            Connecting Rajasthan's licensed hairstylists, beauty therapists, and massage technicians with premium luxury salons.
          </p>
        </div>
        
        <div className="flex gap-2 relative z-10 font-mono text-xs">
          <button 
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'board' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            Job Vacancies
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            Resume Profile
          </button>
          <button 
            onClick={() => setActiveTab('post-job')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'post-job' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            Post a Vacancy
          </button>
        </div>
      </div>

      {/* Talent Rules notice */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-xs text-indigo-800">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block uppercase tracking-wider text-[10px]">Licensed Practitioner Sourcing</span>
          <p className="leading-relaxed">
            All candidates listed in Nexora's Jaipur directory undergo training verification checks by regional Growth Partners. No placement agency fees. Hiring is direct and transparent.
          </p>
        </div>
      </div>

      {/* TAB 1: Job board list */}
      {activeTab === 'board' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Seeker Card if exists */}
          {seekerProfile && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex justify-between items-center gap-4 text-xs text-emerald-800">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-[10px] uppercase tracking-wider block text-emerald-950">Active Seeker Profile Loaded</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">{seekerProfile.full_name}</span>
                  <span className="text-slate-600 font-medium block mt-0.5">Exp: {seekerProfile.experience_years} Years • Specs: {seekerProfile.specialties.join(', ')}</span>
                </div>
              </div>
              <button 
                onClick={() => setSeekerProfile(null)}
                className="text-slate-500 font-bold hover:text-rose-600 hover:underline cursor-pointer"
              >
                Clear Profile
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between text-left hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{job.title}</h4>
                      <span className="text-xs text-slate-500 font-bold">{job.salon_name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border font-mono font-bold uppercase">{job.location}</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{job.description}</p>
                  
                  <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono font-bold text-slate-700 flex justify-between">
                    <span>Offered Salary Tier</span>
                    <span className="text-indigo-600">{job.salary_range}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">Posted: {job.created_at.substring(0, 10)}</span>
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow shadow-indigo-600/10"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Job Apply Overlay */}
          {selectedJob && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 max-w-md w-full space-y-4 animate-scaleIn text-left shadow-2xl">
                <div>
                  <h4 className="text-lg font-black text-slate-900">Apply for Open Vacancy</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Role: <span className="font-bold text-slate-800">{selectedJob.title}</span> at <span className="font-bold text-indigo-600">{selectedJob.salon_name}</span></p>
                </div>

                <form onSubmit={handleApplyToJob} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
                    <input 
                      type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Nikita Vyas" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Contact Phone</label>
                    <input 
                      type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9829011111" className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Cover Notes & Specialties</label>
                    <textarea 
                      required value={applyNotes} onChange={(e) => setApplyNotes(e.target.value)}
                      placeholder="Experienced hair technician with 4 years at Jaipur Premium Parlor. Specialized in L'Oreal Global tints..." className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs h-20 resize-none focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" onClick={() => setSelectedJob(null)}
                      className="flex-1 py-2.5 border text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" disabled={applying}
                      className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center justify-center"
                    >
                      {applying ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Seeker Resume builder form */}
      {activeTab === 'resume' && (
        <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans">Build Seeker Resume Profile</h3>
            <p className="text-xs text-slate-500">Add credentials to apply to premier Rajasthan salon vacancies with 1-click.</p>
          </div>

          <form onSubmit={handleSaveResume} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                <input 
                  type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Megha Sharma" className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Phone Number</label>
                <input 
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9116011111" className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Years of Experience</label>
                <input 
                  type="number" required value={experience} onChange={(e) => setExperience(Number(e.target.value))}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Portfolio Links (Insta, drive etc)</label>
                <input 
                  type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://instagram.com/my-hair-art" className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Core Specialties (comma separated)</label>
              <input 
                type="text" required value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Nail gel extensions, Keratin hair treatment, Bridal makeup" className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none"
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow"
            >
              Verify & Save Resume Profile
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Post a job vacancy form */}
      {activeTab === 'post-job' && (
        <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans">Publish Beauty Job Vacancy</h3>
            <p className="text-xs text-slate-500">Recruit top Jaipur hair, nail, or spa therapists directly without commissions.</p>
          </div>

          <form onSubmit={handlePostJob} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Designation Title</label>
                <input 
                  type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Advanced Nail Extension Artist" className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Your Salon Brand Name</label>
                <input 
                  type="text" required value={salonName} onChange={(e) => setSalonName(e.target.value)}
                  placeholder="e.g. Imperial Barber C-Scheme" className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Jaipur Location / Area Sector</label>
                <select 
                  value={jobLocation} onChange={(e) => setJobLocation(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none cursor-pointer text-slate-700"
                >
                  <option value="Jaipur (Malviya Nagar)">Jaipur (Malviya Nagar)</option>
                  <option value="Jaipur (C-Scheme)">Jaipur (C-Scheme)</option>
                  <option value="Jaipur (Vaishali Nagar)">Jaipur (Vaishali Nagar)</option>
                  <option value="Jaipur (Raja Park)">Jaipur (Raja Park)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Salary Range Offer (Per Month)</label>
                <input 
                  type="text" required value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. Rs. 20,000 - 30,000" className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Role Description & Job Responsibilities</label>
              <textarea 
                required value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Looking for a certified nail artist with deep experience in acrylic extensions, 3D art, and gel overlays. Must have 2+ years of premium parlour salon exposure..." 
                className="w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none h-24 resize-none"
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow"
            >
              Publish Vacancy Board
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
