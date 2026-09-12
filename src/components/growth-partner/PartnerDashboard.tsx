import React from 'react';
import { LayoutDashboard, Users, ShoppingBag, Wallet, DollarSign, Target, BookOpen, Settings, BarChart } from 'lucide-react';

export default function PartnerDashboard({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'shops', label: 'My Onboarded Shops', icon: ShoppingBag },
    { id: 'commission', label: 'Commission', icon: Wallet },
    { id: 'payout', label: 'Payout', icon: DollarSign },
    { id: 'milestones', label: 'Milestones', icon: Target },
    { id: 'training', label: 'Training Center', icon: BookOpen },
    { id: 'marketing', label: 'Marketing Assets', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <div className="space-y-4"><h2 className="text-xl font-bold">Earnings Overview</h2><p>Real Collection = Real Partner Earning. Track your growth share here.</p></div>;
      case 'leads':
        return <div className="space-y-4"><h2 className="text-xl font-bold">New Leads</h2><p>Manage your prospective shops.</p></div>;
      case 'shops':
        return <div className="space-y-4"><h2 className="text-xl font-bold">Onboarded Shops</h2><p>View the list of shops you have successfully onboarded.</p></div>;
      case 'commission':
        return <div className="space-y-4"><h2 className="text-xl font-bold">Commission Breakdown</h2><p>10% Activation + 10%/5%/2% Growth Share based on revenue.</p></div>;
      case 'payout':
        return <div className="space-y-4"><h2 className="text-xl font-bold">Payout History</h2><p>Track your realized earnings and transfers.</p></div>;
      default:
        return <p className="text-slate-600">Content for {activeTab} is under development.</p>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <div className="text-xl font-black mb-10">Nexora Partner</div>
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${activeTab === tab.id ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-black text-slate-950 mb-6">{tabs.find(t => t.id === activeTab)?.label}</h1>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
