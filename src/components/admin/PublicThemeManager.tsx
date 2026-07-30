import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PublicThemeStyle } from '../../types';
import { Palette, Layout, Type, Image as ImageIcon, Check, Upload, Sparkles } from 'lucide-react';

export const PublicThemeManager: React.FC = () => {
  const { tenantSettings, updateTenantSettings } = useApp();

  const [themeStyle, setThemeStyle] = useState<PublicThemeStyle>(tenantSettings.publicTheme);
  const [logoUrl, setLogoUrl] = useState(tenantSettings.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(tenantSettings.bannerUrl);
  const [name, setName] = useState(tenantSettings.name);
  const [subname, setSubname] = useState(tenantSettings.subname);
  const [announcementText, setAnnouncementText] = useState(tenantSettings.announcementText);
  const [fontFamily, setFontFamily] = useState(tenantSettings.fontFamily);
  const [fontSize, setFontSize] = useState(tenantSettings.fontSize);
  const [textColor, setTextColor] = useState(tenantSettings.textColor);
  const [accentColor, setAccentColor] = useState(tenantSettings.accentColor);

  const [savedNotice, setSavedNotice] = useState(false);

  // Preset sample image galleries for mobile/PC testing
  const presetLogos = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=400&q=80'
  ];

  const presetBanners = [
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (target === 'logo') setLogoUrl(result);
        if (target === 'banner') setBannerUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateTenantSettings({
      publicTheme: themeStyle,
      logoUrl,
      bannerUrl,
      name,
      subname,
      announcementText,
      fontFamily,
      fontSize,
      textColor,
      accentColor
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. 3 Estilos de Modelo de Página */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
          <Layout className="w-5 h-5 text-amber-500" />
          Modelo y Estilo de Página Pública (3 Diseños)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Theme 1: New York Soho */}
          <div
            onClick={() => setThemeStyle('new-york')}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
              themeStyle === 'new-york'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg scale-102'
                : 'border-stone-800 bg-stone-950 hover:border-stone-700'
            }`}
          >
            <div className="h-20 bg-stone-900 rounded-lg mb-2 p-2 border border-stone-800 flex flex-col justify-between">
              <span className="text-[10px] text-amber-400 font-bold uppercase">NYC Soho Architecture</span>
              <span className="text-xs font-playfair text-white font-bold">Editorial Dark Loft</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200">1. New York Soho</span>
              {themeStyle === 'new-york' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
          </div>

          {/* Theme 2: Eco Green Organics */}
          <div
            onClick={() => setThemeStyle('eco-green')}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
              themeStyle === 'eco-green'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg scale-102'
                : 'border-stone-800 bg-stone-950 hover:border-stone-700'
            }`}
          >
            <div className="h-20 bg-emerald-950 rounded-lg mb-2 p-2 border border-emerald-900 flex flex-col justify-between">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Organic Eco Pure</span>
              <span className="text-xs font-jakarta text-emerald-100 font-bold">Verde Botánico</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200">2. Organic Eco Green</span>
              {themeStyle === 'eco-green' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          </div>

          {/* Theme 3: Minimal Modern */}
          <div
            onClick={() => setThemeStyle('minimal-modern')}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
              themeStyle === 'minimal-modern'
                ? 'border-sky-500 bg-sky-500/10 shadow-lg scale-102'
                : 'border-stone-800 bg-stone-950 hover:border-stone-700'
            }`}
          >
            <div className="h-20 bg-slate-900 rounded-lg mb-2 p-2 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-sky-400 font-bold uppercase">Minimal High Contrast</span>
              <span className="text-xs font-sans text-slate-100 font-bold">Limpio & Moderno</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200">3. Minimal Modern</span>
              {themeStyle === 'minimal-modern' && <Check className="w-4 h-4 text-sky-400" />}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Upload/Change Logo & Banner Image from PC or Mobile */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-6">
        <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-amber-500" />
          Imágenes del Negocio (Logo & Imagen del Local)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Logo Editor */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              Logo del Negocio
            </label>
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Logo Prev" className="w-16 h-16 rounded-xl object-cover border border-stone-800" />
              <div className="space-y-2 flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg cursor-pointer border border-stone-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir desde PC/Móvil</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'logo')} />
                </label>
                <input
                  type="url"
                  placeholder="O URL de imagen..."
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-200"
                />
              </div>
            </div>
          </div>

          {/* Banner Store Image Editor */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              Imagen de Portada del Local
            </label>
            <div className="flex items-center gap-4">
              <img src={bannerUrl} alt="Banner Prev" className="w-24 h-16 rounded-xl object-cover border border-stone-800" />
              <div className="space-y-2 flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg cursor-pointer border border-stone-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir desde PC/Móvil</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'banner')} />
                </label>
                <input
                  type="url"
                  placeholder="O URL de imagen..."
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-200"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Custom Public Texts */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
          <Type className="w-5 h-5 text-amber-500" />
          Textos de la Página Pública
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Nombre del Negocio</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Eslogan / Bajada</label>
            <input
              type="text"
              value={subname}
              onChange={e => setSubname(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-300 mb-1">Cinta Superior de Anuncios</label>
            <input
              type="text"
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 4. Typography, Size & Font Colors */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-500" />
          Tipografía, Tamaño y Colores de Letra
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Tipo de Letra</label>
            <select
              value={fontFamily}
              onChange={e => setFontFamily(e.target.value as any)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100"
            >
              <option value="playfair">Playfair Display (Serif Editorial NYC)</option>
              <option value="jakarta">Plus Jakarta Sans (Sans Modern)</option>
              <option value="space">Space Grotesk (Tech Monospace)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Tamaño de Letra</label>
            <select
              value={fontSize}
              onChange={e => setFontSize(e.target.value as any)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100"
            >
              <option value="normal">Normal (Recomendado)</option>
              <option value="large">Grande (+15%)</option>
              <option value="compact">Compacto (-10%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Color Destacado de Letra</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="w-9 h-9 rounded bg-transparent border-0 cursor-pointer"
              />
              <span className="text-xs font-mono text-stone-300">{accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>¡Tema y textos guardados con éxito en la tienda pública!</span>
        </div>
      )}

      {/* Save Changes Action */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95"
      >
        Guardar Configuración de Tema Público
      </button>

    </div>
  );
};
