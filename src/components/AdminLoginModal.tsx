import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, Key, Lock, User, Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    session,
    verifyLicense,
    loginAsAdmin,
    loginAsCollaborator,
    loginBiometric,
    logout,
    authError,
    authBusy,
    bioAvail,
    rememberBio,
    setRememberBio,
    t
  } = useApp();

  const lastLic = (() => { try { return localStorage.getItem('diet_last_license') || ''; } catch (e) { return ''; } })();
  const [licenseInput, setLicenseInput] = useState(lastLic);
  const [isLicenseVerified, setIsLicenseVerified] = useState(false);
  const [role, setRole] = useState<'inquilino' | 'colaborador'>('inquilino');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (activeModal !== 'login') return null;

  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyLicense(licenseInput);
    if (ok) setIsLicenseVerified(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = role === 'inquilino'
      ? await loginAsAdmin(username, password)
      : await loginAsCollaborator(username, password);
    if (ok) setActiveModal(null);
  };

  const handleBiometric = async () => {
    if (await loginBiometric()) setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold font-jakarta">{t.adminLoginTitle}</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          
          {session.isLoggedIn ? (
            /* Currently Logged In View */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Sesión Activa</span>
                <h4 className="text-xl font-bold font-jakarta text-white mt-1">{session.userName}</h4>
                <p className="text-xs text-stone-400 mt-0.5">Rol: <strong className="text-stone-200 capitalize">{session.role}</strong></p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all"
                >
                  Ir al Panel Admin
                </button>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 font-semibold text-xs rounded-xl border border-rose-800 transition-all"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : !isLicenseVerified ? (
            /* STEP 1: License Verification */
            <form onSubmit={handleVerifyLicense} className="space-y-4">
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Key className="w-4 h-4" />
                  {t.licenseStepTitle}
                </div>
                <p className="text-xs text-stone-300">
                  Ingresá la clave de licencia asignada a tu dietética para verificar e ingresar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Clave de Licencia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: DIET-1234-2026-XXXX"
                  value={licenseInput}
                  onChange={e => setLicenseInput(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono tracking-wide focus:outline-none focus:border-amber-500"
                />
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md disabled:opacity-60"
              >
                {authBusy ? 'Validando…' : t.verifyLicense}
              </button>
            </form>
          ) : (
            /* STEP 2: Username & Password + Biometrics */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t.licenseValid}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLicenseVerified(false)}
                  className="text-[11px] underline text-stone-400 hover:text-stone-200"
                >
                  Cambiar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole('inquilino')}
                  className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${role === 'inquilino' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-stone-950 border-stone-700 text-stone-400'}`}>
                  Dueño
                </button>
                <button type="button" onClick={() => setRole('colaborador')}
                  className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${role === 'colaborador' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-stone-950 border-stone-700 text-stone-400'}`}>
                  Colaborador
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider">{t.userPassStepTitle}</h4>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Usuario</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="admin o usuario colaborador"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs">
                  {authError}
                </div>
              )}

              {bioAvail && (
                <label className="flex items-center gap-2 text-[11px] text-stone-300 cursor-pointer select-none">
                  <input type="checkbox" checked={rememberBio} onChange={e => setRememberBio(e.target.checked)} className="accent-amber-500" />
                  Recordar con huella/rostro en este equipo
                </label>
              )}

              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-60"
              >
                {authBusy ? 'Ingresando…' : t.login}
              </button>

              {/* Biometric Quick Login */}
              {bioAvail && (
                <div className="pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={handleBiometric}
                    disabled={authBusy}
                    className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                  >
                    <Fingerprint className="w-4 h-4 text-amber-400" />
                    {t.biometricsLogin}
                  </button>
                </div>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
