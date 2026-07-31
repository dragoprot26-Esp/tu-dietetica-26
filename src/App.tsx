import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { StickyHeader } from './components/StickyHeader';
import { PublicStore } from './components/PublicStore';
import { AdminPanel } from './components/AdminPanel';
import { CartModal } from './components/CartModal';
import { ShareModal } from './components/ShareModal';
import { LocationModal } from './components/LocationModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Eye, Shield, Store } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { session } = useApp();
  // Al recargar: si había panel abierto (dueño/colaborador logueado), arrancamos
  // en el panel y NO salimos a la página pública hasta que toque "Salir".
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() => {
    try { return localStorage.getItem('diet_panel_view') === '1' ? 'admin' : 'public'; } catch (e) { return 'public'; }
  });

  // Mientras restaura la sesión (tras recargar), mostramos un cargando breve para
  // no parpadear a la tienda pública. Si a los 4s no volvió la sesión, sigue normal.
  const [booting, setBooting] = useState<boolean>(() => {
    try { return localStorage.getItem('diet_panel_view') === '1'; } catch (e) { return false; }
  });
  React.useEffect(() => {
    if (!booting) return;
    if (session.isLoggedIn) { setBooting(false); return; }
    const t = setTimeout(() => setBooting(false), 4000);
    return () => clearTimeout(t);
  }, [booting, session.isLoggedIn]);

  if (booting && !session.isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center font-jakarta">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-stone-700 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-amber-400">Abriendo tu panel…</p>
        </div>
      </div>
    );
  }

  // If user is logged in and mode is 'admin', show Admin Panel
  if (session.isLoggedIn && viewMode === 'admin') {
    return (
      <div className="relative">
        {/* Floating toggle button to preview public store */}
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setViewMode('public')}
            className="flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-full shadow-2xl border-2 border-stone-900 transition-all hover:scale-105 active:scale-95"
          >
            <Store className="w-4 h-4" />
            <span>Ver Tienda Pública</span>
          </button>
        </div>

        <AdminPanel />
      </div>
    );
  }

  // Otherwise show Public Storefront + Sticky Header
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-jakarta">
      {/* Fixed Sticky Header top navigation bar */}
      <StickyHeader />

      {/* Logged-in Admin Banner Switcher */}
      {session.isLoggedIn && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 px-4 py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Sesión activa como {session.userName} ({session.role})</span>
          </div>
          <button
            onClick={() => setViewMode('admin')}
            className="px-3 py-1 bg-amber-500 text-stone-950 font-extrabold rounded-lg text-xs hover:bg-amber-400 transition-colors shadow-sm"
          >
            Ir a Panel Admin
          </button>
        </div>
      )}

      {/* Public Storefront */}
      <PublicStore />

      {/* Global Modals */}
      <CartModal />
      <ShareModal />
      <LocationModal />
      <AdminLoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
