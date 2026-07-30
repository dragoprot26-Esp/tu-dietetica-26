import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Collaborator } from '../../types';
import { Users, UserPlus, Trash2, Edit3, LogOut, Phone, User, Key, Check, Shield } from 'lucide-react';

export const CollaboratorsManager: React.FC = () => {
  const {
    collaborators,
    addCollaborator,
    updateCollaborator,
    deleteCollaborator,
    logoutCollaboratorRemote
  } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editingColab, setEditingColab] = useState<Collaborator | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenAdd = () => {
    setEditingColab(null);
    setName('');
    setPhone('');
    setUsername('');
    setPassword('');
    setShowModal(true);
  };

  const handleOpenEdit = (col: Collaborator) => {
    setEditingColab(col);
    setName(col.name);
    setPhone(col.phone);
    setUsername(col.username);
    setPassword(col.passwordHash);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !username.trim() || !password.trim()) return;

    if (editingColab) {
      updateCollaborator({
        ...editingColab,
        name: name.trim(),
        phone: phone.trim(),
        username: username.trim().toLowerCase(),
        passwordHash: password.trim()
      });
    } else {
      addCollaborator(name.trim(), phone.trim(), username.trim().toLowerCase(), password.trim());
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-playfair text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Equipo de Colaboradores ({collaborators.length})
          </h3>
          <p className="text-xs text-stone-400">
            Creá credenciales de acceso para tu personal con control de sesión a distancia.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Agregar Colaborador</span>
        </button>
      </div>

      {/* Staff List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collaborators.map(colab => (
          <div key={colab.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                    {colab.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-100">{colab.name}</h4>
                    <p className="text-xs text-stone-400 font-mono">@{colab.username}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                  colab.activeSession
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {colab.activeSession ? 'Sesión Activa' : 'Sesión Cerrada'}
                </span>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 space-y-1 text-xs">
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Teléfono:
                  </span>
                  <span className="font-semibold text-stone-200">{colab.phone}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Key className="w-3 h-3" /> Clave Acceso:
                  </span>
                  <span className="font-mono text-amber-400">••••••••</span>
                </div>
              </div>
            </div>

            {/* Actions: Edit, Delete, Remote Logout (Cerrar sesión a distancia) */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
              {/* Cerrar sesión a distancia */}
              <button
                onClick={() => logoutCollaboratorRemote(colab.id)}
                disabled={!colab.activeSession}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  colab.activeSession
                    ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                    : 'bg-stone-800 text-stone-500 opacity-50 cursor-not-allowed'
                }`}
                title="Cerrar sesión a distancia para este colaborador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión a Distancia</span>
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenEdit(colab)}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg transition-colors"
                  title="Editar credenciales"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCollaborator(colab.id)}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-rose-400 rounded-lg transition-colors"
                  title="Eliminar colaborador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Collaborator Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <h4 className="text-lg font-bold font-jakarta text-white">
              {editingColab ? 'Editar Colaborador' : 'Agregar Nuevo Colaborador'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Facundo Gómez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Teléfono (Celular) *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 11 3847 2910"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nombre de Usuario *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: facundo"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Contraseña de Acceso *</label>
                <input
                  type="text"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Guardar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
