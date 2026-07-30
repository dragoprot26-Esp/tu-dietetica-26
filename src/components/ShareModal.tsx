import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Share2, Copy, Check, MessageCircle, Instagram, Facebook, Twitter, Send } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { activeModal, setActiveModal, tenantSettings, t } = useApp();
  const [copied, setCopied] = useState(false);

  if (activeModal !== 'share') return null;

  // Molde CyC: el link que se comparte es la página pública del local (?codigo=).
  const appUrl = `${window.location.origin}${window.location.pathname}?codigo=${encodeURIComponent(tenantSettings.id)}`;
  const shareText = `¡Mirá el catálogo digital y encargá en ${tenantSettings.name}! 🌿 Almonds, frutos secos, harinas integrales y más:`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tenantSettings.name,
        text: shareText,
        url: appUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-500',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + appUrl)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-500',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-400',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-600 hover:bg-sky-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold font-jakarta">{t.shareTitle}</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <p className="text-xs text-stone-300">
            Compartí el catálogo de <strong>{tenantSettings.name}</strong> en tus redes sociales favoritas para realizar encargos:
          </p>

          {/* Social buttons grid */}
          <div className="grid grid-cols-2 gap-3">
            {socialLinks.map(social => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-3 py-2.5 ${social.color} text-white font-medium text-xs rounded-xl shadow-sm transition-transform active:scale-95`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{social.name}</span>
                </a>
              );
            })}
          </div>

          {/* Native share / Copy link input */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="block text-xs font-semibold text-stone-400">Enlace directo:</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-300 select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiado!' : t.copyLink}
              </button>
            </div>

            {'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                Compartir con App Nativa
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
