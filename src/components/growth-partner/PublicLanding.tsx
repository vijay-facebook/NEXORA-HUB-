import React, { useState } from 'react';
import { ArrowRight, CheckCircle, TrendingUp, Users, Shield } from 'lucide-react';

export default function PublicLanding() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="p-6 flex items-center justify-between">
        <div className="text-xl font-black text-slate-950">Nexora Growth Partner</div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-black text-slate-950">Salary Nahi. Growth Share.</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Performance-based Beauty Industry Growth Partner Program.
          </p>
        </div>

        {!submitted ? (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
            <h2 className="text-2xl font-black text-slate-950 mb-6">Apply to Join</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <input type="text" placeholder="Full Name" className="w-full p-3 rounded-xl border border-slate-200" required />
              <input type="tel" placeholder="Phone Number" className="w-full p-3 rounded-xl border border-slate-200" required />
              <input type="text" placeholder="District" className="w-full p-3 rounded-xl border border-slate-200" required />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                Apply Now <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-3xl shadow-lg border border-slate-100 max-w-xl mx-auto">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-slate-950 mb-2">Application Received</h2>
            <p className="text-slate-600">We will get back to you soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
