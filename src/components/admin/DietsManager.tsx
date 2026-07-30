import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Diet } from '../../types';
import { BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, Check, X, Sparkles, Tag, Apple } from 'lucide-react';

export const DietsManager: React.FC = () => {
  const { diets, addDiet, updateDiet, deleteDiet, toggleDietVisibility } = useApp();

  const [editingDiet, setEditingDiet] = useState<Diet | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visiblePublic, setVisiblePublic] = useState(true);
  const [badgeColor, setBadgeColor] = useState('amber');
  const [keywordsStr, setKeywordsStr] = useState('');

  const handleOpenNew = () => {
    setEditingDiet(null);
    setName('');
    setDescription('');
    setVisiblePublic(true);
    setBadgeColor('amber');
    setKeywordsStr('tacc, sin gluten, celiaco');
    setShowModal(true);
  };

  const handleOpenEdit = (diet: Diet) => {
    setEditingDiet(diet);
    setName(diet.name);
    setDescription(diet.description);
    setVisiblePublic(diet.visiblePublic);
    setBadgeColor(diet.badgeColor || 'amber');
    setKeywordsStr((diet.keywords || []).join(', '));
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const keywords = keywordsStr
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    if (editingDiet) {
      updateDiet({
        ...editingDiet,
        name: name.trim(),
        description: description.trim(),
        visiblePublic,
        badgeColor,
        keywords
      });
    } else {
      addDiet(name.trim(), description.trim(), visiblePublic, badgeColor, keywords);
    }

    setShowModal(false);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'green':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'sky':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'amber':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-5 rounded-2xl">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-stone-100 font-playfair flex items-center gap-2">
            <Apple className="w-5 h-5 text-amber-500" />
            Dietario & Planes Nutricionales ({diets.length})
          </h3>
          <p className="text-xs text-stone-400">
            Cargá las dietas para tus clientes. Tildá la casilla si querés que aparezcan públicamente en la sección "Elegí tu dieta".
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Dieta</span>
        </button>
      </div>

      {/* Diet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {diets.map(diet => (
          <div
            key={diet.id}
            className={`bg-stone-900 border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all ${
              diet.visiblePublic ? 'border-amber-500/40 shadow-lg' : 'border-stone-800 opacity-75'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getColorClasses(diet.badgeColor || 'amber')}`}>
                  {diet.name}
                </span>

                {/* Visibility Toggle Checkbox (Cajita con tilde) */}
                <label className="flex items-center gap-1.5 cursor-pointer bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800 text-[11px] font-semibold text-stone-300 hover:border-amber-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={diet.visiblePublic}
                    onChange={() => toggleDietVisibility(diet.id)}
                    className="rounded accent-amber-500"
                  />
                  <span>{diet.visiblePublic ? 'Visible' : 'Oculto'}</span>
                </label>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                {diet.description}
              </p>

              {diet.keywords && diet.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {diet.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-stone-950 text-stone-400 px-2 py-0.5 rounded border border-stone-800">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-1">
                {diet.visiblePublic ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                    <Eye className="w-3.5 h-3.5" /> En Página Pública
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-stone-500 font-medium text-[11px]">
                    <EyeOff className="w-3.5 h-3.5" /> Solo Admin
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handleOpenEdit(diet)}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg transition-colors"
                  title="Editar dieta"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDiet(diet.id)}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-rose-400 rounded-lg transition-colors"
                  title="Eliminar dieta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Diet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900">
              <h4 className="text-base font-bold font-jakarta flex items-center gap-2">
                <Apple className="w-4 h-4 text-amber-500" />
                {editingDiet ? 'Editar Dieta / Plan' : 'Agregar Nueva Dieta'}
              </h4>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-stone-800 rounded text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nombre de la Dieta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Celíacos / Sin TACC, Keto, Vegano"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Descripción / Recomendación *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej: Alimentos 100% libres de gluten certificados para celíacos e intolerantes al trigo..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Checkbox cajita con tilde para ver en página pública */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-amber-400">
                  <input
                    type="checkbox"
                    checked={visiblePublic}
                    onChange={e => setVisiblePublic(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <span>Ver en la página pública (Sección "Elegí tu dieta")</span>
                </label>
                <p className="text-[11px] text-stone-400 mt-1 pl-6">
                  Si está marcado, los clientes verán esta dieta en la tienda para filtrar el catálogo.
                </p>
              </div>

              {/* Color badge option */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Color Distintivo</label>
                <select
                  value={badgeColor}
                  onChange={e => setBadgeColor(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="amber">Ámbar (Dorado)</option>
                  <option value="emerald">Esmeralda (Verde Oliva)</option>
                  <option value="green">Verde Orgánico</option>
                  <option value="sky">Celeste / Azul</option>
                  <option value="rose">Rosa / Rojo</option>
                  <option value="purple">Púrpura</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Palabras Clave (Separadas por comas)</label>
                <input
                  type="text"
                  placeholder="tacc, gluten, celiaco, harina almendras"
                  value={keywordsStr}
                  onChange={e => setKeywordsStr(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-500">Sirven para matchear productos automáticamente al filtrar.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md"
                >
                  {editingDiet ? 'Guardar Cambios' : 'Crear Dieta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
