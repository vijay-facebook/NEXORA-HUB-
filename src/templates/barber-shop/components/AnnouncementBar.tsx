import React, { useState } from 'react';
import { X } from 'lucide-react';

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#C9A45C] text-[#101010] px-4 py-2 text-center text-xs font-bold uppercase tracking-widest relative">
      NEW CLIENT OFFER: GET 15% OFF YOUR FIRST HAIRCUT.
      <button onClick={() => setIsVisible(false)} className="absolute right-4 top-2 hover:text-white cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
