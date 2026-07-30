import React from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Phone, ExternalLink, Navigation } from 'lucide-react';

export const LocationModal: React.FC = () => {
  const { activeModal, setActiveModal, tenantSettings, t } = useApp();

  if (activeModal !== 'location') return null;

  const fullPhone = `${tenantSettings.phonePrefix} ${tenantSettings.phone}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold font-jakarta">{t.locationTitle}</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">{t.address}</span>
                <p className="text-sm font-semibold text-stone-100">{tenantSettings.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-stone-800/80 pt-3">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">{t.phone}</span>
                <p className="text-sm font-semibold text-stone-100">{fullPhone}</p>
                <a
                  href={`https://wa.me/${tenantSettings.phonePrefix.replace(/\+/g, '')}${tenantSettings.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline mt-0.5"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Action button: Open Map */}
          <a
            href={tenantSettings.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            {t.openMaps}
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

        </div>
      </div>
    </div>
  );
};
