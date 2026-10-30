import React from 'react';

interface PricingItem {
  name: string;
  price: number;
  duration: number;
}

interface TemplatePricingTableProps {
  title: string;
  items: PricingItem[];
  themeColor?: string;
}

export function TemplatePricingTable({ title, items, themeColor = 'indigo' }: TemplatePricingTableProps) {
  // Map theme colors to Tailwind classes
  const themeClasses = {
    indigo: 'border-indigo-900/50 hover:border-indigo-500/50',
    amber: 'border-amber-900/50 hover:border-amber-500/50',
    rose: 'border-rose-900/50 hover:border-rose-500/50',
    teal: 'border-teal-900/50 hover:border-teal-500/50',
    blue: 'border-blue-900/50 hover:border-blue-500/50',
    emerald: 'border-emerald-900/50 hover:border-emerald-500/50',
  }[themeColor] || 'border-indigo-900/50 hover:border-indigo-500/50';

  const textClasses = {
    indigo: 'text-indigo-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    teal: 'text-teal-500',
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
  }[themeColor] || 'text-indigo-500';

  return (
    <section className="py-12 px-6 max-w-5xl mx-auto">
      <h3 className="text-2xl font-bold text-white mb-8 text-center uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.name} className={`bg-gradient-to-br from-slate-900 to-slate-950 border ${themeClasses} p-6 rounded-xl transition-all duration-300`}>
            <h4 className={`${textClasses} font-bold text-lg mb-2`}>{item.name}</h4>
            <div className="flex justify-between items-center mt-4">
              <span className="text-slate-400 text-sm">{item.duration} mins</span>
              <span className="text-white font-bold text-xl">₹{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
