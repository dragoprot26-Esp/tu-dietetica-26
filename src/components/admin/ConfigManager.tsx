import React, { useState, useEffect } from 'react';
import * as cloud from '../../services/cloud';
import { useApp } from '../../context/AppContext';
import { QrCode, Printer, MapPin, Phone, Database, Lock, Check, RefreshCw, Eye, Download, AlertCircle } from 'lucide-react';

export const ConfigManager: React.FC = () => {
  const {
    tenantSettings,
    updateTenantSettings,
    backups,
    createBackup,
    restoreBackup
  } = useApp();

  const [phonePrefix, setPhonePrefix] = useState(tenantSettings.phonePrefix || '+549');
  const [phone, setPhone] = useState(tenantSettings.phone);
  const [address, setAddress] = useState(tenantSettings.address);
  const [mapsUrl, setMapsUrl] = useState(tenantSettings.mapsUrl);
  const [footerQrText, setFooterQrText] = useState(tenantSettings.footerQrText);
  const [licenseKey, setLicenseKey] = useState(tenantSettings.licenseKey);

  // Admin password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passNotice, setPassNotice] = useState('');

  const [backupNotice, setBackupNotice] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  // Molde CyC: el QR apunta a la página pública del local (?codigo=licencia).
  const publicUrl = `${window.location.origin}${window.location.pathname}?codigo=${encodeURIComponent(tenantSettings.id)}`;

  // Suscripción / alquiler: días hasta el vencimiento de la licencia.
  const [vencAlq, setVencAlq] = useState<string | null>(null);
  useEffect(() => {
    let v = true;
    (async () => {
      const l = await cloud.validarLicencia(tenantSettings.id || '');
      if (v && l && l.fecha_vencimiento) setVencAlq(l.fecha_vencimiento);
    })();
    return () => { v = false; };
  }, [tenantSettings.id]);
  const diasAlq = vencAlq ? Math.ceil((new Date(vencAlq).getTime() - Date.now()) / 86400000) : null;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

  const handlePrintQr = () => {
    window.print();
  };

  const handleSaveStoreData = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({
      phonePrefix,
      phone,
      address,
      mapsUrl,
      footerQrText,
      licenseKey
    });
    setSavedNotice('¡Datos de configuración guardados correctamente!');
    setTimeout(() => setSavedNotice(''), 3000);
  };

  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      setPassNotice('Las contraseñas no coinciden.');
      return;
    }
    // Update license/admin pass reference
    updateTenantSettings({ licenseKey: newPassword.trim() });
    setPassNotice('¡Contraseña del administrador actualizada!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassNotice(''), 3000);
  };

  const handleCreateBackupClick = () => {
    createBackup(`Respaldo Manual ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`);
    setBackupNotice('¡Copia de seguridad creada! (Histórico rotativo máximo 3 copias)');
    setTimeout(() => setBackupNotice(''), 3000);
  };

  return (
    <div className="space-y-8">

      {/* Mi Suscripción: contador de vencimiento + pagar alquiler */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-playfair text-white">Mi Suscripción</h3>
            <p className="text-xs text-stone-400 mt-0.5">Licencia <span className="font-mono text-amber-400">{tenantSettings.id}</span></p>
          </div>
          <div className="text-center px-5 py-3 rounded-2xl border border-stone-800">
            {diasAlq === null ? (
              <span className="text-xs text-stone-500">Consultando…</span>
            ) : diasAlq < 0 ? (
              <><span className="block text-2xl font-black text-red-500">Vencida</span><span className="text-[11px] text-red-400">Regularizá tu pago</span></>
            ) : (
              <><span className={`block text-3xl font-black ${diasAlq <= 7 ? 'text-orange-400' : 'text-emerald-400'}`}>{diasAlq}</span><span className="text-[11px] text-stone-500">{diasAlq === 1 ? 'día para vencer' : 'días para vencer'}</span></>
            )}
          </div>
        </div>
        {vencAlq && <p className="text-[11px] text-stone-500">Vence el <strong>{new Date(vencAlq).toLocaleDateString('es-AR')}</strong>.</p>}
        <a href={`https://cyc-qr-cobros.vercel.app/?codigo=${encodeURIComponent(tenantSettings.id || '')}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition">
          <span>💳</span><span>Pagar mi alquiler</span>
        </a>
      </div>

      {/* 1. Código QR de la Página Pública (Vista Previa e Imprimir) */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-500" />
              Código QR de la Página Pública
            </h3>
            <p className="text-xs text-stone-400">Escaneable por clientes en el local para acceder al catálogo.</p>
          </div>

          <button
            onClick={handlePrintQr}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cartel QR</span>
          </button>
        </div>

        {/* Interactive QR Display & Custom Footer Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Printable section element target */}
          <div
            id="printable-qr-section"
            className="bg-stone-950 p-6 rounded-2xl border border-stone-800 text-center space-y-3 max-w-sm mx-auto shadow-xl"
          >
            <h4 className="font-extrabold text-lg text-white font-playfair">{tenantSettings.name}</h4>
            <div className="bg-white p-3 rounded-xl inline-block shadow-md">
              <img src={qrApiUrl} alt="QR Code" className="w-48 h-48 object-contain mx-auto" />
            </div>
            <p className="text-xs text-amber-400 font-semibold">{footerQrText}</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-300">Texto debajo del QR al imprimir</label>
            <textarea
              rows={3}
              value={footerQrText}
              onChange={e => setFooterQrText(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-stone-500">
              Al hacer clic en "Imprimir", el sistema genera automáticamente una vista optimizada con el nombre del negocio, el QR y este texto.
            </p>
          </div>

        </div>
      </div>

      {/* 2. Datos del Local (Teléfono con +549, Dirección y Ubicación) */}
      <form onSubmit={handleSaveStoreData} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Datos del Local & Contacto
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Prefijo Telefónico *</label>
            <input
              type="text"
              required
              value={phonePrefix}
              onChange={e => setPhonePrefix(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Teléfono (Celular) *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-300 mb-1">Dirección del Local *</label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-300 mb-1">Enlace de Ubicación GPS (Google Maps) *</label>
            <input
              type="url"
              required
              value={mapsUrl}
              onChange={e => setMapsUrl(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-sky-400"
            />
          </div>
        </div>

        {savedNotice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{savedNotice}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md"
        >
          Guardar Datos del Local
        </button>
      </form>

      {/* 3. Copia de Seguridad (Hasta 3 copias visibles: la última queda y la primera sale - FIFO) */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              Copias de Seguridad (Histórico Máximo 3 Copias)
            </h3>
            <p className="text-xs text-stone-400">
              Rotación FIFO: Guarda hasta 3 copias. Al crear una 4ª copia, la primera sale y la última queda.
            </p>
          </div>

          <button
            onClick={handleCreateBackupClick}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>+ Generar Copia</span>
          </button>
        </div>

        {backupNotice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{backupNotice}</span>
          </div>
        )}

        <div className="space-y-3">
          {backups.length === 0 ? (
            <p className="text-xs text-stone-500 italic bg-stone-950 p-4 rounded-xl border border-stone-800">
              Aún no hay respaldos generados. Presione "+ Generar Copia" para resguardar sus datos.
            </p>
          ) : (
            backups.map((bkp, idx) => (
              <div key={bkp.id} className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-400">Copia #{idx + 1}: </span>
                  <span className="text-stone-200 font-semibold">{bkp.label} </span>
                  <span className="text-stone-500">({bkp.timestamp})</span>
                </div>
                <button
                  onClick={() => {
                    if (confirm('¿Desea restaurar los datos desde esta copia de seguridad?')) {
                      restoreBackup(bkp.id);
                      setBackupNotice('¡Datos restaurados con éxito!');
                      setTimeout(() => setBackupNotice(''), 3000);
                    }
                  }}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Restaurar Datos
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Cambio de Contraseña del Admin */}
      <form onSubmit={handleChangeAdminPassword} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-400" />
          Cambio de Contraseña del Administrador
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Nueva Contraseña *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Confirmar Contraseña *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100"
            />
          </div>
        </div>

        {passNotice && (
          <div className="p-3 bg-stone-950 border border-amber-500/40 text-amber-300 rounded-xl text-xs">
            {passNotice}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Actualizar Contraseña de Admin
        </button>
      </form>

    </div>
  );
};
