import React from 'react';

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-950">Nexora Jobs</h1>
          <div className="flex gap-4">
            <a href="/jobs/search" className="text-xs font-bold text-slate-600">Search</a>
            <a href="/jobs/profile" className="text-xs font-bold text-slate-600">Profile</a>
            <a href="/jobs/my-applications" className="text-xs font-bold text-slate-600">My Applications</a>
          </div>
        </div>
      </nav>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
