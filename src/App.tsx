/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Sparkles, Calendar, Users, 
  Wallet, ShieldAlert, ShoppingBag, Briefcase, 
  RefreshCw, Globe, ArrowRight, CheckCircle2
} from 'lucide-react';

import RoleSelector from './components/RoleSelector';
import MarketplaceHome from './components/MarketplaceHome';
import PublicShopWebsite from './components/PublicShopWebsite';
import OwnerDashboard from './components/OwnerDashboard';
import SuperAdminPanel from './components/SuperAdminPanel';
import PublicLanding from './components/growth-partner/PublicLanding';
import PartnerDashboard from './components/growth-partner/PartnerDashboard';
import JobsLayout from './components/jobs/JobsLayout';
import CandidateProfile from './components/jobs/CandidateProfile';
import ClientPortal from './components/ClientPortal';
import TemplateRouter from './templates/TemplateRouter';
import TemplatePreviewHeaderMenu from './components/TemplatePreviewHeaderMenu';

import { api } from './lib/supabase';
import { Tenant, Service } from './types';
import { AnimatePresence } from 'framer-motion';
import { ScrollProgressBar, PageTransition, Entrance } from './components/animations/MotionComponents';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeRole, setActiveRole] = useState<'marketplace' | 'owner' | 'partner' | 'brand' | 'jobs' | 'admin'>('marketplace');
  
  // Salon owner selected tenant initialized from activeSalonId / localStorage if present
  const [selectedOwnerTenantId, setSelectedOwnerTenantId] = useState<string>(() => {
    try {
      const activeSalonId = localStorage.getItem('activeSalonId');
      if (activeSalonId) return activeSalonId;
      const recentId = localStorage.getItem('nexora_recent_tenant_id');
      if (recentId) return recentId;
      const profileRaw = localStorage.getItem('nexora_active_business_profile');
      if (profileRaw) {
        const parsed = JSON.parse(profileRaw);
        if (parsed?.tenant?.id) return parsed.tenant.id;
      }
    } catch (e) {
      // ignore
    }
    return 'ten_aura';
  });
  
  // Custom public slug route simulation
  const [activePublicSlug, setActivePublicSlug] = useState<string | null>(null);

  // Db refresh trigger
  const [dbRefreshKey, setDbRefreshKey] = useState(0);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse location pathname or manual state simulation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path.startsWith('/dashboard')) {
        setActiveRole('owner');
      } else if (path.startsWith('/site/')) {
        const parts = path.split('/');
        setActivePublicSlug(parts[2] || null);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    // Initial check
    handleLocationChange();
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Fetch tenants & services for configuration
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const db = await api.getFullDB();
        setAllTenants(db.tenants || []);
        setAllServices(db.services || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dbRefreshKey]);

  // Synchronize owner role with tenant selection and path safely
  useEffect(() => {
    // If current path is a template preview or public site route, do NOT redirect to /dashboard
    if (
      currentPath.startsWith('/templates/') || 
      currentPath.startsWith('/site/') || 
      currentPath.startsWith('/jobs') || 
      currentPath === '/client-portal' || 
      currentPath === '/growth-partner'
    ) {
      return;
    }

    if (activeRole === 'owner') {
      const activeSalonId = localStorage.getItem('activeSalonId');
      const recentTenantId = localStorage.getItem('nexora_recent_tenant_id');
      const activeProfileRaw = localStorage.getItem('nexora_active_business_profile');
      
      let targetTenantId = selectedOwnerTenantId;
      
      if (activeSalonId) {
        targetTenantId = activeSalonId;
      } else if (recentTenantId) {
        targetTenantId = recentTenantId;
      } else if (activeProfileRaw) {
        try {
          const parsed = JSON.parse(activeProfileRaw);
          if (parsed?.tenant?.id) targetTenantId = parsed.tenant.id;
        } catch (e) {}
      }

      if (allTenants.length > 0) {
        if (!targetTenantId || (targetTenantId !== 'new' && !allTenants.some(t => t.id === targetTenantId))) {
          if (activeSalonId) {
            targetTenantId = activeSalonId;
          } else if (recentTenantId) {
            targetTenantId = recentTenantId;
          } else {
            targetTenantId = allTenants[0]?.id || 'ten_aura';
          }
        }
        if (targetTenantId !== selectedOwnerTenantId) {
          setSelectedOwnerTenantId(targetTenantId);
        }
        if (currentPath === '/' || currentPath === '/marketplace' || currentPath === '') {
          const selectedTemplate = localStorage.getItem('selectedTemplate') || localStorage.getItem('activeTemplateSlug');
          if (activeSalonId && selectedTemplate) {
            const templateRoute = `/templates/${selectedTemplate}`;
            setCurrentPath(templateRoute);
            window.history.pushState({}, '', templateRoute);
          } else {
            setCurrentPath('/dashboard');
            window.history.pushState({}, '', '/dashboard');
          }
        }
      } else if (!loading) {
        if (!activeProfileRaw && !recentTenantId && !activeSalonId) {
          if (selectedOwnerTenantId !== 'new') {
            setSelectedOwnerTenantId('new');
          }
          if (currentPath === '/' || currentPath === '/marketplace' || currentPath === '') {
            setCurrentPath('/dashboard');
            window.history.pushState({}, '', '/dashboard');
          }
        }
      }
    }
  }, [activeRole, allTenants, currentPath, loading, selectedOwnerTenantId]);

  // Handle direct url path checks (e.g. /site/aura-premium)
  let urlSlug: string | null = null;
  let subRoute: string | null = null;
  if (currentPath.startsWith('/site/')) {
    const parts = currentPath.split('/');
    urlSlug = parts[2];
    subRoute = parts[3] || null;
  } else if (activePublicSlug) {
    urlSlug = activePublicSlug;
  }

  // Partner dashboard sub-tab
  const [partnerTab, setPartnerTab] = useState('dashboard');

  // Handle growth partner public page
  if (currentPath === '/growth-partner') {
    return (
      <>
        <ScrollProgressBar />
        <PageTransition viewKey="growth-partner">
          <PublicLanding />
        </PageTransition>
      </>
    );
  }

  // Handle Jobs module
  if (currentPath.startsWith('/jobs')) {
    return (
      <>
        <ScrollProgressBar />
        <PageTransition viewKey="jobs">
          <JobsLayout><CandidateProfile /></JobsLayout>
        </PageTransition>
      </>
    );
  }

  // Handle Client Portal
  if (currentPath === '/client-portal') {
    return (
      <>
        <ScrollProgressBar />
        <PageTransition viewKey="client-portal">
          <ClientPortal onNavigateHome={() => {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
          }} />
        </PageTransition>
      </>
    );
  }

  // Handle Business-specific template route (e.g. /templates/barber-shop, /templates/unisex-salon)
  if (currentPath.startsWith('/templates/')) {
    const templateSlug = currentPath.split('/')[2] || 'barber-shop';
    return (
      <div className="bg-slate-950 min-h-screen">
        <ScrollProgressBar />
        <PageTransition viewKey={`template-${templateSlug}`}>
          <TemplateRouter 
            templateSlug={templateSlug}
            onNavigateHome={() => {
              setActiveRole('owner');
              window.history.pushState({}, '', '/dashboard');
              setCurrentPath('/dashboard');
            }}
            onNavigateToBuilder={() => {
              setActiveRole('owner');
              window.history.pushState({}, '', '/dashboard/website');
              setCurrentPath('/dashboard/website');
            }}
          />
        </PageTransition>
      </div>
    );
  }

  // Trigger global data refresh across components
  const triggerDbRefresh = () => {
    setDbRefreshKey(prev => prev + 1);
  };

  const handleSelectPublicSlug = (slug: string) => {
    setActivePublicSlug(slug);
    // Push state mock
    window.history.pushState({}, '', `/site/${slug}`);
    setCurrentPath(`/site/${slug}`);
  };

  const handleBackToConsole = () => {
    setActivePublicSlug(null);
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  // If viewing a dynamic public slug white-label website (Direct booking view)
  if (urlSlug) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        <ScrollProgressBar />
        {/* Mock Simulator bar on top to return to Dashboard */}
        <div className="bg-slate-900 text-white px-4 py-2 text-xs font-mono font-bold flex justify-between items-center border-b border-slate-800 relative z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live White-Label Domain Simulator: `/site/{urlSlug}`</span>
          </div>
          <button 
            onClick={handleBackToConsole}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-[11px] cursor-pointer"
          >
            ← Back to Nexora Operating Dashboard
          </button>
        </div>

        <PageTransition viewKey={`site-${urlSlug}`}>
          <PublicShopWebsite 
            slug={urlSlug} 
            initialSubRoute={subRoute}
            userRole={activeRole}
            onBackToMarketplace={handleBackToConsole}
            onNavigateToBuilder={() => {
              setActiveRole('owner');
              window.history.pushState({}, '', '/dashboard/website');
              setCurrentPath('/dashboard/website');
            }}
          />
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] flex flex-col font-sans relative">
      <ScrollProgressBar />
      
      {/* Top Main Master Navbar */}
      <Entrance direction="down" duration={0.3}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-slate-950 font-sans">Nexora SalonOS</h1>
                <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Jaipur SaaS MVP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Beauty Industry Operating System</p>
            </div>
          </div>

          {/* Template Preview Menu & Database state indicator */}
          <div className="flex items-center gap-3">
            <TemplatePreviewHeaderMenu 
              currentPath={currentPath}
              onSelectTemplateRoute={(targetRoute) => {
                window.history.pushState({}, '', targetRoute);
                setCurrentPath(targetRoute);
              }}
            />

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full font-medium">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>Jaipur Core Ledger Nodes Online</span>
            </div>
            <button 
              onClick={triggerDbRefresh}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              title="Force refresh database node"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>
      </Entrance>

      {/* Simulator / Role Switcher Strip */}
      <section className="bg-slate-900 border-b border-slate-800 text-white py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between lg:items-center gap-4 text-left">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Simulator Sandbox Center</span>
            <p className="text-[11px] text-slate-400 max-w-md leading-relaxed">
              Experience the full ecosystem. Switch personas instantly to test booking dispatches, owner settlements, and super-admin KYC verification.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 font-mono">
            {[
              { id: 'marketplace', label: '1. Discovery Hub', icon: Globe, desc: 'Public Discovery Marketplace' },
              { id: 'owner', label: '2. Salon Owner', icon: Building2, desc: 'Operational dashboard & Visual Builder' },
              { id: 'partner', label: '4. Growth Partner', icon: Briefcase, desc: 'District Business Partner Program' },
              { id: 'admin', label: 'admin', labelText: '3. Super Admin', icon: ShieldAlert, desc: 'Verification, ledger audits & manual payouts sweep' }
            ].map((role) => {
              const Icon = role.icon;
              const roleId = role.id === 'admin' ? 'admin' : role.id;
              const isActive = activeRole === roleId;
              return (
                <button
                  key={roleId}
                  onClick={() => setActiveRole(roleId as any)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={role.desc}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{role.labelText || role.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Workspace View Rendering */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* Marketplace Explorer */}
          {activeRole === 'marketplace' && (
            <PageTransition key="marketplace" viewKey="marketplace">
              <MarketplaceHome 
                tenants={allTenants}
                services={allServices}
                onSelectShop={handleSelectPublicSlug}
                onNavigateToRole={(role) => setActiveRole(role as any)}
              />
            </PageTransition>
          )}

          {/* Salon Owner suite with sub-tenant selector */}
          {activeRole === 'owner' && (
            <PageTransition key="owner" viewKey="owner">
              <div className="space-y-4">
                {/* Quick tenant select banner to switch between preseeded salons */}
                <div className="bg-indigo-50 border-b border-indigo-100 p-3.5 text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-left font-sans font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Simulating Salon Owner profile. Switch active salon profile to test:</span>
                  </div>
                  <div className="flex gap-2 font-mono items-center flex-wrap">
                    {allTenants.map((t) => (
                      <button 
                        key={t.id}
                        onClick={() => {
                          setSelectedOwnerTenantId(t.id);
                          setCurrentPath('/dashboard');
                          window.history.pushState({}, '', '/dashboard');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          selectedOwnerTenantId === t.id 
                            ? 'bg-indigo-600 text-white shadow' 
                            : 'bg-white border text-slate-700'
                        }`}
                      >
                        {t.name} ({t.city})
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => {
                        setSelectedOwnerTenantId('new');
                        setCurrentPath('/dashboard');
                        window.history.pushState({}, '', '/dashboard');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                        selectedOwnerTenantId === 'new'
                          ? 'bg-emerald-600 text-white shadow' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span>➕ Create New Salon</span>
                    </button>
                  </div>
                </div>

                <OwnerDashboard 
                  ownerTenantId={selectedOwnerTenantId}
                  onSelectSlug={handleSelectPublicSlug}
                  onRefreshDB={triggerDbRefresh}
                  currentPath={currentPath}
                  onNavigate={(path) => {
                    window.history.pushState({}, '', path);
                    setCurrentPath(path);
                  }}
                  onSelectOwnerTenantId={(id) => setSelectedOwnerTenantId(id)}
                />
              </div>
            </PageTransition>
          )}

          {/* Growth Partner Suite */}
          {activeRole === 'partner' && (
            <PageTransition key="partner" viewKey="partner">
              <PartnerDashboard activeTab={partnerTab} setActiveTab={setPartnerTab} />
            </PageTransition>
          )}

          {/* Super admin control center */}
          {activeRole === 'admin' && (
            <PageTransition key="admin" viewKey="admin">
              <SuperAdminPanel 
                onRefreshDB={triggerDbRefresh}
              />
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
