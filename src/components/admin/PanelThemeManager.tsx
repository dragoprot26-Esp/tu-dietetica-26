import React from 'react';
import { useApp } from '../../context/AppContext';
import { PanelThemeTone } from '../../types';
import { Palette, Check, Moon, Sun, Monitor } from 'lucide-react';

export const PanelThemeManager: React.FC = () => {
  const { tenantSettings, updateTenantSettings } = useApp();

  const handleSelectTone = (tone: PanelThemeTone) => {
    updateTenantSettings({ panelTheme: tone });
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <div>
          <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-500" />
            Tema del Panel de Administración (3 Tonos)
          </h3>
          <p className="text-xs text-stone-400">
            Elegí el tono de contraste para el panel de administración. En modo <strong>Oscuro</strong>, todos los campos de texto muestran letras en color blanco puro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Tone 1: Claro */}
          <div
            onClick={() => handleSelectTone('claro')}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
              tenantSettings.panelTheme === 'claro'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg scale-102'
                : 'border-stone-800 bg-stone-950 hover:border-stone-700'
            }`}
          >
            <div className="h-20 bg-stone-100 text-stone-900 rounded-lg mb-3 p-3 flex flex-col justify-between border border-stone-300">
              <Sun className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold">Tono Claro (Light Panel)</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-200">
              <span>Claro</span>
              {tenantSettings.panelTheme === 'claro' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
          </div>

          {/* Tone 2: Medio */}
          <div
            onClick={() => handleSelectTone('medio')}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
              tenantSettings.panelTheme === 'medio'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg scale-102'
                : 'border-stone-800 bg-stone-950 hover:border-stone-700'
            }`}
          >
            <div className="h-20 bg-stone-700 text-stone-100 rounded-lg mb-3 p-3 flex flex-col justify-between border border-stone-600">
              <Monitor className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold">Tono Medio (Neutral Slate)</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-200">
              <span>Medio</span>
              {tenantSettings.panelTheme === 'medio' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
          </div>

          {/* Tone 3: Oscuro (Dark - white text enforced) */}
          <div
            onClick={() => handleSelectTone('oscuro')}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
              tenantSettings.panelTheme === 'oscuro'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg scale-102'
                : 'border-stone-800 bg-stone-950 hover:border-stone-700'
            }`}
          >
            <div className="h-20 bg-stone-950 text-white rounded-lg mb-3 p-3 flex flex-col justify-between border border-stone-800">
              <Moon className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-white">Oscuro (Letras Blancas)</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-200">
              <span>Oscuro (Recomendado)</span>
              {tenantSettings.panelTheme === 'oscuro' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
