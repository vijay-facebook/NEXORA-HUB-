import React from 'react';
import { masterBarbers, Barber } from '../data/barbers';
import { Star, Award, Instagram, Calendar, Clock, ChevronRight } from 'lucide-react';

interface MeetBarbersProps {
  onSelectBarber?: (barber: Barber) => void;
}

export const MeetBarbers: React.FC<MeetBarbersProps> = ({ onSelectBarber }) => {
  return (
    <section id="barbers" className="bg-[#101010] py-24 px-6 border-b border-[#39352E]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
            <Award className="w-4 h-4" />
            Masters of the Craft
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] tracking-tight">
            Meet Our Master Barbers
          </h2>
          <p className="text-[#A7A7A7] text-sm leading-relaxed">
            Every barber at The Gent’s Den is licensed, meticulously trained, and dedicated to customized consultations tailored to your facial architecture.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {masterBarbers.map((barber) => (
            <div 
              key={barber.id}
              className="bg-[#191919] border border-[#39352E] hover:border-[#C9A45C]/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#222222]">
                  <img 
                    src={barber.photoUrl} 
                    alt={barber.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#191919] via-transparent to-transparent opacity-80"></div>
                  
                  {/* Rating Tag */}
                  <div className="absolute top-3 left-3 bg-[#101010]/80 backdrop-blur-md border border-[#39352E] px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-mono text-[#F1D9A3] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#C9A45C] text-[#C9A45C]" />
                    <span>{barber.rating.toFixed(1)}</span>
                    <span className="text-[#A7A7A7] text-[9px]">({barber.reviewsCount})</span>
                  </div>

                  {/* Experience Tag */}
                  <div className="absolute bottom-3 left-3 bg-[#C9A45C] text-[#101010] text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {barber.experience}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-4 text-left">
                  <div>
                    <h3 className="text-xl font-serif font-black text-[#F7F4EE] group-hover:text-[#F1D9A3] transition-colors">
                      {barber.name}
                    </h3>
                    <span className="text-xs font-mono text-[#C9A45C] font-semibold block mt-0.5">
                      {barber.designation}
                    </span>
                  </div>

                  {/* Specialization Pill */}
                  <div className="bg-[#222222] border border-[#39352E] p-2.5 rounded-xl">
                    <span className="text-[9px] uppercase tracking-wider text-[#A7A7A7] font-mono block">Specialty</span>
                    <span className="text-xs text-slate-200 font-medium block mt-0.5">
                      {barber.specialization}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[#A7A7A7] leading-relaxed line-clamp-3 font-sans">
                    {barber.bio}
                  </p>

                  {/* Schedule & Instagram */}
                  <div className="pt-2 border-t border-[#39352E]/60 flex items-center justify-between text-xs font-mono text-[#A7A7A7]">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>{barber.schedule.split('|')[0]}</span>
                    </div>
                    <a 
                      href={`https://instagram.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#C9A45C] hover:text-[#F1D9A3] transition-colors"
                      title="Follow on Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{barber.instagram}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => onSelectBarber && onSelectBarber(barber)}
                  className="w-full py-3 bg-[#222222] hover:bg-[#C9A45C] text-[#F7F4EE] hover:text-[#101010] border border-[#39352E] hover:border-[#C9A45C] rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book with {barber.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-[11px] font-mono text-[#A7A7A7] uppercase tracking-wider">
          * Master Barber profiles are fully configurable by shop manager in the business dashboard
        </div>
      </div>
    </section>
  );
};
