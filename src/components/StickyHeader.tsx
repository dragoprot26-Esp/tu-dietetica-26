import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Share2, MapPin, Shield, Globe, Fingerprint } from 'lucide-react';

export const StickyHeader: React.FC = () => {
  const { language, setLanguage, t, cart, session, setActiveModal } = useApp();
  
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Left: Language Toggle (Arriba a la izquierda) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Globe className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex bg-stone-800/80 p-0.5 rounded-lg border border-stone-700">
            <button
              id="lang-es-btn"
              onClick={() => setLanguage('es')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'es'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              ES
            </button>
            <button
              id="lang-en-btn"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Right: Fixed Navigation Buttons (Canasto, Compartir, Ubicación, Escudito) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Canasto (Cart) Button */}
          <button
            id="open-cart-btn"
            onClick={() => setActiveModal('cart')}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg font-bold text-xs sm:text-sm shadow-sm hover:shadow-amber-500/20 transition-all active:scale-95"
            title={t.cart}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">{t.cart}</span>
            {totalCartCount > 0 && (
              <span className="bg-stone-950 text-amber-400 font-extrabold text-[11px] px-1.5 py-0.5 rounded-full border border-amber-400/30">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Compartir (Share) Button */}
          <button
            id="open-share-btn"
            onClick={() => setActiveModal('share')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs sm:text-sm font-medium border border-stone-700 transition-all active:scale-95"
            title={t.share}
          >
            <Share2 className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">{t.share}</span>
          </button>

          {/* Ubicación (Location) Button */}
          <button
            id="open-location-btn"
            onClick={() => setActiveModal('location')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs sm:text-sm font-medium border border-stone-700 transition-all active:scale-95"
            title={t.location}
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{t.location}</span>
          </button>

          {/* Escudito (Admin / Collaborator Login Button) */}
          <button
            id="open-admin-shield-btn"
            onClick={() => setActiveModal('login')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 border ${
              session.isLoggedIn
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title={session.isLoggedIn ? `Panel (${session.userName})` : t.adminAccess}
          >
            <Shield className={`w-4 h-4 ${session.isLoggedIn ? 'text-amber-400 fill-amber-400/20' : 'text-stone-400'}`} />
            <span className="hidden md:inline">
              {session.isLoggedIn ? session.userName?.split(' ')[0] : t.adminAccess}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
