import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductManager } from './admin/ProductManager';
import { DashboardManager } from './admin/DashboardManager';
import { OrdersManager } from './admin/OrdersManager';
import { CommentsManager } from './admin/CommentsManager';
import { DietsManager } from './admin/DietsManager';
import { CollaboratorsManager } from './admin/CollaboratorsManager';
import { PublicThemeManager } from './admin/PublicThemeManager';
import { PanelThemeManager } from './admin/PanelThemeManager';
import { ConfigManager } from './admin/ConfigManager';
import {
  Package,
  ShoppingBag,
  BarChart3,
  MessageSquare,
  BookOpen,
  Users,
  Layout,
  Palette,
  Settings,
  ArrowLeft,
  LogOut,
  Building2,
  ShieldCheck,
  Apple
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    session,
    logout,
    tenantSettings,
    adminTab,
    setAdminTab,
    orders,
    reviews,
    queries,
    t
  } = useApp();

  // Pending counts for notification badges
  const pendingOrdersCount = orders.filter(o => o.status === 'pendiente').length;
  const pendingCommentsCount = reviews.filter(r => !r.approved).length + queries.filter(q => !q.resolved).length;

  // Determine panel container theme styles based on panelTheme
  const getPanelThemeStyles = () => {
    switch (tenantSettings.panelTheme) {
      case 'claro':
        return 'bg-stone-100 text-stone-900';
      case 'medio':
        return 'bg-stone-800 text-stone-100';
      case 'oscuro':
      default:
        // En oscuro, todos los campos e inputs muestran letras en blanco (text-white / text-stone-100)
        return 'bg-stone-950 text-white [&_input]:text-white [&_select]:text-white [&_textarea]:text-white';
    }
  };

  interface TabItem {
    id: 'products' | 'orders' | 'dashboard' | 'comments' | 'collaborators' | 'publicTheme' | 'panelTheme' | 'config' | 'dietary';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hiddenForColab?: boolean;
    badgeCount?: number;
  }

  const tabs: TabItem[] = [
    { id: 'products', label: t.tabProducts, icon: Package },
    { id: 'orders', label: t.tabOrders || 'Pedidos', icon: ShoppingBag, badgeCount: pendingOrdersCount },
    { id: 'dashboard', label: t.tabDashboard, icon: BarChart3 },
    { id: 'comments', label: t.tabComments, icon: MessageSquare, badgeCount: pendingCommentsCount },
    { id: 'dietary', label: t.tabDietary || 'Dietario', icon: Apple },
    { id: 'collaborators', label: t.tabCollaborators, icon: Users, hiddenForColab: true },
    { id: 'publicTheme', label: t.tabPublicTheme, icon: Layout, hiddenForColab: true },
    { id: 'panelTheme', label: t.tabPanelTheme, icon: Palette, hiddenForColab: true },
    { id: 'config', label: t.tabConfig, icon: Settings, hiddenForColab: true },
  ];

  const visibleTabs = tabs.filter(t => !(session.role === 'colaborador' && t.hiddenForColab));

  return (
    <div className={`min-h-screen pb-16 transition-colors ${getPanelThemeStyles()}`}>
      
      {/* Top Admin Header Bar */}
      <header className="bg-stone-900 border-b border-stone-800 text-stone-100 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white font-playfair">{tenantSettings.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {session.role === 'inquilino' ? 'Inquilino Admin' : 'Colaborador'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Panel de Control Multi-Inquilino • Tu Dietética</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-stone-300 font-semibold">
              {session.userName}
            </span>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir del Panel</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-stone-950/80 border-t border-stone-850 px-4 sm:px-6 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1.5">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-102'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-850'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full transition-colors ${
                      isActive
                        ? 'bg-stone-950 text-amber-400'
                        : 'bg-rose-500 text-white animate-pulse'
                    }`}>
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {adminTab === 'products' && <ProductManager />}
        {adminTab === 'orders' && <OrdersManager />}
        {adminTab === 'dashboard' && <DashboardManager />}
        {adminTab === 'comments' && <CommentsManager />}
        {adminTab === 'dietary' && <DietsManager />}
        {adminTab === 'collaborators' && <CollaboratorsManager />}
        {adminTab === 'publicTheme' && <PublicThemeManager />}
        {adminTab === 'panelTheme' && <PanelThemeManager />}
        {adminTab === 'config' && <ConfigManager />}
      </main>

    </div>
  );
};
