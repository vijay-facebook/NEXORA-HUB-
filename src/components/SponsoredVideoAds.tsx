import React, { useRef, useEffect, useState } from 'react';
import { Play, Volume2, VolumeX, ArrowRight, X } from 'lucide-react';

const SPONSORED_VIDEOS = [
  {
    id: 'v1',
    title: "Signature Hair Keratin Treatment",
    salon: "Aura Premium Salon",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    poster: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    views: "3.2k views"
  },
  {
    id: 'v2',
    title: "Bridal HD Makeup Masterclass",
    salon: "The Royal Grooming Club",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
    views: "1.4k views"
  },
  {
    id: 'v3',
    title: "Stress Relief Swedish Massage",
    salon: "Siam Zen Wellness Spa",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    poster: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800",
    views: "980 views"
  },
  {
    id: 'v4',
    title: "Advanced Skin Laser Therapy",
    salon: "DermaGlow Clinic",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster: "https://images.unsplash.com/photo-1570172619644-defd822b39fb?auto=format&fit=crop&q=80&w=800",
    views: "4.5k views"
  },
  {
    id: 'v5',
    title: "Luxury Manicure & Pedicure",
    salon: "Nail Boutique",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://images.unsplash.com/photo-1519014816548-bf5fe059c98b?auto=format&fit=crop&q=80&w=800",
    views: "2.1k views"
  },
  {
    id: 'v6',
    title: "Precision Men's Fade & Beard Trim",
    salon: "The Gentlemen's Barber",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    poster: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
    views: "5.5k views"
  }
];

export function SponsoredVideoAds({ onSelectShop }: { onSelectShop: (id: string) => void }) {
  const [muted, setMuted] = useState(true);
  const [activeVideo, setActiveVideo] = useState<typeof SPONSORED_VIDEOS[0] | null>(null);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Play className="w-8 h-8 text-indigo-600 fill-indigo-100" />
            <span>Sponsored Spotlights</span>
          </h3>
          <p className="text-base text-slate-500 mt-2">Live video walk-through tours and treatment close-ups.</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setMuted(!muted)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-slate-100 px-4 py-2 rounded-full"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {muted ? 'Unmute Previews' : 'Mute Previews'}
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {SPONSORED_VIDEOS.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            globalMuted={muted} 
            onSelectShop={onSelectShop} 
            onPlayFull={() => setActiveVideo(video)}
          />
        ))}
      </div>
      
      {/* Full Immersive Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button 
            onClick={() => setActiveVideo(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-full max-w-5xl px-4 flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="w-full md:w-2/3 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
              <video 
                src={activeVideo.videoUrl} 
                poster={activeVideo.poster} 
                autoPlay 
                controls 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full md:w-1/3 space-y-6 text-white text-left">
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-4">
                  Sponsored Spotlight
                </span>
                <h2 className="text-3xl font-black leading-tight mb-2">{activeVideo.title}</h2>
                <p className="text-slate-400 font-medium text-lg">{activeVideo.salon}</p>
                <p className="text-slate-500 text-sm mt-1">{activeVideo.views}</p>
              </div>
              <p className="text-slate-300 text-base leading-relaxed">
                Experience this premium treatment in real-time. Our video spotlight provides an exclusive behind-the-scenes look at the techniques and atmosphere you can expect.
              </p>
              <button 
                onClick={() => {
                  onSelectShop('ten_aura'); // Mock ID
                  setActiveVideo(null);
                }}
                className="w-full bg-white text-slate-950 hover:bg-indigo-600 hover:text-white font-black text-sm py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Book This Experience</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

const VideoCard: React.FC<{
  video: typeof SPONSORED_VIDEOS[0];
  globalMuted: boolean;
  onSelectShop: (id: string) => void;
  onPlayFull: () => void;
}> = ({ video, globalMuted, onSelectShop, onPlayFull }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Intersection Observer for autoplay on viewport entry and pause on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.6 } // Trigger when 60% visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isInView]);

  return (
    <div 
      ref={containerRef}
      className="snap-center shrink-0 w-[85vw] sm:w-[400px] bg-slate-950 rounded-3xl overflow-hidden relative group cursor-pointer transition-all duration-500 shadow-md hover:shadow-xl border border-slate-200 hover:border-indigo-400"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlayFull}
    >
      <div className="aspect-video relative overflow-hidden bg-slate-900">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.poster}
          muted={globalMuted}
          loop
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'scale-105 opacity-100' : 'opacity-80'}`}
        />
        
        {/* Persistent Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 flex flex-col justify-end p-6`}>
          <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg shadow-indigo-600/30">
            Featured
          </div>
          <div className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            <Play className="w-5 h-5 text-white fill-white ml-1" />
          </div>
          
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <h4 className="text-white font-black text-xl leading-tight line-clamp-2 mb-1">{video.title}</h4>
            <div className="flex items-center justify-between mt-2">
              <span className="text-slate-300 text-sm font-medium">{video.salon}</span>
              <span className="text-indigo-400 text-xs font-bold bg-indigo-950/50 px-2 py-1 rounded backdrop-blur-sm">{video.views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
