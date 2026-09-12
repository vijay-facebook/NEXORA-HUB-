import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Sparkles, Store, Scissors, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDebounce } from '../hooks/useDebounce';

interface SearchResult {
  type: 'shop' | 'service' | 'area';
  id: string;
  name: string;
  subtitle?: string;
  actionText?: string;
}

const POPULAR_AREAS = ['Malviya Nagar', 'C-Scheme', 'Raja Park', 'Vaishali Nagar', 'Mansarovar'];

export default function GlobalSearch({ onSelect }: { onSelect: (result: SearchResult) => void }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<{ shops: SearchResult[], services: SearchResult[], areas: SearchResult[] }>({ shops: [], services: [], areas: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside to close
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      // Show default popular areas when empty or too short
      setResults({
        shops: [],
        services: [],
        areas: POPULAR_AREAS.map(area => ({ type: 'area', id: area, name: area, subtitle: 'Jaipur, Rajasthan', actionText: 'Explore Area' }))
      });
      setIsLoading(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const [shopsData, servicesData] = await Promise.all([
          supabase.from('tenants').select('id, name, city, area, slug').or(`name.ilike.%${debouncedQuery}%,city.ilike.%${debouncedQuery}%,area.ilike.%${debouncedQuery}%`).limit(3),
          supabase.from('services').select('id, name, category_name, tenant_id, tenants(slug)').ilike('name', `%${debouncedQuery}%`).limit(4)
        ]);

        const shopResults = (shopsData.data || []).map(s => ({ 
          type: 'shop' as const,
          id: s.slug || s.id,
          name: s.name,
          subtitle: `${s.area}, ${s.city}`,
          actionText: 'Book Now'
        }));
        
        const serviceResults = (servicesData.data || []).map((s: any) => ({ 
          type: 'service' as const,
          id: s.tenants?.slug || s.tenant_id, // Use tenant slug to link directly to the shop
          name: s.name,
          subtitle: s.category_name,
          actionText: 'Find Salons'
        }));

        const areaResults = POPULAR_AREAS
          .filter(a => a.toLowerCase().includes(debouncedQuery.toLowerCase()))
          .map(area => ({ type: 'area' as const, id: area, name: area, subtitle: 'Jaipur, Rajasthan', actionText: 'Explore Area' }));
        
        setResults({ shops: shopResults, services: serviceResults, areas: areaResults });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const hasResults = results.shops.length > 0 || results.services.length > 0 || results.areas.length > 0;
  const isDefaultView = query.trim().length < 2;

  const handleSelect = (res: SearchResult) => {
    onSelect(res);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-72" ref={wrapperRef}>
      <div className={`flex items-center bg-slate-100 rounded-full px-4 py-2.5 transition-all duration-300 border ${isOpen ? 'bg-white border-indigo-200 ring-4 ring-indigo-50 shadow-sm' : 'border-transparent hover:bg-slate-200/50'}`}>
        <Search className={`w-4 h-4 mr-2 ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Search salons, services..."
          className="bg-transparent border-none text-xs w-full focus:ring-0 p-0 font-medium placeholder-slate-400 outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-200 rounded-full transition-colors ml-1">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 w-[420px] bg-white border border-slate-200 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] mt-3 p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right overflow-hidden">
          
          <div className="max-h-[70vh] overflow-y-auto hide-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Searching Network</p>
              </div>
            ) : !hasResults ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-900">No matches found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Salons Section */}
                {results.shops.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-3 mb-2">
                      <Store className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salons & Spas</h4>
                    </div>
                    <div className="space-y-1">
                      {results.shops.map(res => (
                        <ResultItem key={`shop-${res.id}`} result={res} onSelect={handleSelect} icon={<Store className="w-4 h-4 text-slate-400" />} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Section */}
                {results.services.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-3 mb-2">
                      <Scissors className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatments & Services</h4>
                    </div>
                    <div className="space-y-1">
                      {results.services.map(res => (
                        <ResultItem key={`svc-${res.id}`} result={res} onSelect={handleSelect} icon={<Sparkles className="w-4 h-4 text-slate-400" />} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Areas Section */}
                {results.areas.length > 0 && (
                  <div className={isDefaultView ? "" : "pt-2 border-t border-slate-100"}>
                    <div className="flex items-center gap-2 px-3 mb-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isDefaultView ? "Trending Areas" : "Locations"}
                      </h4>
                    </div>
                    <div className="space-y-1">
                      {results.areas.map(res => (
                        <ResultItem key={`area-${res.id}`} result={res} onSelect={handleSelect} icon={<MapPin className="w-4 h-4 text-slate-400" />} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 mt-2 -mx-3 -mb-3 rounded-b-3xl">
            <button className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1.5 transition-colors">
              <span>View full directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

const ResultItem: React.FC<{ result: SearchResult, onSelect: (r: SearchResult) => void, icon: React.ReactNode }> = ({ result, onSelect, icon }) => {
  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl group flex items-center justify-between transition-colors border border-transparent hover:border-slate-100"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center shrink-0 border border-transparent group-hover:border-slate-200 transition-colors">
          {icon}
        </div>
        <div>
          <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{result.name}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">{result.subtitle}</div>
        </div>
      </div>
      <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
        <span>{result.actionText}</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}
