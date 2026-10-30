import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface NewsletterSectionProps {
  onNavigate?: (page: any) => void;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (input: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !validateEmail(email)) {
      setErrorMessage('Please provide a valid executive email address (e.g. name@domain.com).');
      return;
    }

    if (!consent) {
      setErrorMessage('Please agree to our privacy policy to proceed with your subscription.');
      return;
    }

    setLoading(true);

    // Simulated network dispatch
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setEmail('');
    setConsent(false);
    setSuccess(false);
    setErrorMessage(null);
  };

  return (
    <section className="bg-[#141414] py-20 px-6 border-b border-[#39352E] text-left relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
            <Mail className="w-4 h-4" />
            The Editorial Dispatch
          </div>
          <h3 className="text-2xl sm:text-4xl font-serif font-black text-[#F7F4EE]">
            Join the Gentlemen's Gazette
          </h3>
          <p className="text-[#A7A7A7] text-sm leading-relaxed">
            Delivering monthly haircut maintenance tips, private product drop notifications, and exclusive subscriber promotions directly to your inbox.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#1A1A1A] border border-[#39352E] p-6 sm:p-10 rounded-3xl shadow-xl max-w-2xl mx-auto space-y-5">
          {success ? (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xl text-white">Subscription Confirmed</h4>
                <p className="text-xs text-slate-300">
                  Welcome to the circle. We've sent a 15% welcome voucher code to <strong className="text-[#F1D9A3]">{email}</strong>.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-mono text-[#C9A45C] hover:underline cursor-pointer uppercase pt-2"
              >
                Register another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Input & Button row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your email address..."
                    disabled={loading}
                    className="w-full bg-[#101010] border border-[#39352E] focus:border-[#C9A45C] rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-500 outline-none transition-colors font-mono disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 font-sans"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Dispatch</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs font-mono flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Privacy Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A7A7A7] select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="mt-0.5 rounded border-[#39352E] text-[#C9A45C] focus:ring-[#C9A45C] bg-[#101010] cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    I agree to receive grooming journals and accept the{' '}
                    <button 
                      type="button"
                      onClick={() => onNavigate && onNavigate('privacy')}
                      className="text-[#C9A45C] hover:underline"
                    >
                      Privacy Policy
                    </button>
                    . You can unsubscribe at any time with one click.
                  </span>
                </label>
              </div>

              {/* Security Badge */}
              <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5 border-t border-[#39352E]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero spam guarantee &bull; Encrypted TLS email storage</span>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
