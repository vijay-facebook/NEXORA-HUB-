import React, { useState } from 'react';

export default function CandidateProfile() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-black mb-4">Your candidate profile has been submitted successfully.</h2>
        <p>Candidate ID: CND-12345</p>
      </div>
    );
  }

  const steps = [
    "Personal", "Contact", "Education", "Experience", "Skills", "Preferred Job", "Documents", "Review & Submit"
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold mb-6">Step {step}: {steps[step - 1]}</h2>
      
      {/* Step content would go here */}
      <div className="h-40 border-2 border-dashed border-slate-200 rounded-xl mb-6 flex items-center justify-center text-slate-400">
        Step {step} Form Content
      </div>

      <div className="flex justify-between">
        <button 
          disabled={step === 1}
          onClick={() => setStep(prev => prev - 1)}
          className="px-6 py-2 bg-slate-100 rounded-xl font-bold"
        >
          Back
        </button>
        {step < 8 ? (
          <button 
            onClick={() => setStep(prev => prev + 1)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={() => setSubmitted(true)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold"
          >
            Submit Profile
          </button>
        )}
      </div>
    </div>
  );
}
