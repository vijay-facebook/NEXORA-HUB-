import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string; // ISO string
  label?: string;
  compact?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(targetDateStr: string): TimeRemaining {
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0 || isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isExpired: false };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetDate, 
  label = 'Offer Concludes In',
  compact = false 
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    // Strict interval without fake resets
    const timer = setInterval(() => {
      const updated = calculateTimeRemaining(targetDate);
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-mono">
        <Clock className="w-3.5 h-3.5 text-red-400" />
        <span>Offer Concluded</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#14120D] border border-[#C9A45C]/40 text-[#F1D9A3] text-xs font-mono shadow-sm">
        <Clock className="w-3.5 h-3.5 text-[#C9A45C] animate-pulse" />
        <span className="font-bold">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-[#C9A45C] font-semibold">
          <Clock className="w-3.5 h-3.5 animate-pulse text-[#C9A45C]" />
          <span>{label}</span>
        </div>
      )}
      <div className="flex items-center gap-2 font-mono">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center justify-center bg-[#181714] border border-[#39352E] px-2.5 py-1.5 rounded-lg min-w-[44px]">
            <span className="text-base font-black text-[#F7F4EE] leading-none">{timeLeft.days}</span>
            <span className="text-[9px] uppercase tracking-wider text-[#A7A7A7] mt-0.5">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center justify-center bg-[#181714] border border-[#39352E] px-2.5 py-1.5 rounded-lg min-w-[44px]">
          <span className="text-base font-black text-[#F7F4EE] leading-none">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[#A7A7A7] mt-0.5">Hours</span>
        </div>
        <span className="text-xs text-[#C9A45C] font-black">:</span>
        <div className="flex flex-col items-center justify-center bg-[#181714] border border-[#39352E] px-2.5 py-1.5 rounded-lg min-w-[44px]">
          <span className="text-base font-black text-[#F7F4EE] leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[#A7A7A7] mt-0.5">Mins</span>
        </div>
        <span className="text-xs text-[#C9A45C] font-black">:</span>
        <div className="flex flex-col items-center justify-center bg-[#181714] border border-[#C9A45C]/50 px-2.5 py-1.5 rounded-lg min-w-[44px] shadow-sm shadow-[#C9A45C]/10">
          <span className="text-base font-black text-[#F1D9A3] leading-none">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[#C9A45C] mt-0.5">Secs</span>
        </div>
      </div>
    </div>
  );
};
