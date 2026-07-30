import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WeeklyDietItem } from '../../types';
import { Star, MessageSquare, CheckCircle, Trash2, Phone, ExternalLink, Apple, Save, Sparkles, Plus, Layers } from 'lucide-react';

export const CommentsManager: React.FC = () => {
  const {
    reviews,
    approveReview,
    deleteReview,
    queries,
    resolveQuery,
    deleteQuery,
    tenantSettings,
    updateTenantSettings
  } = useApp();

  const initialDiets: WeeklyDietItem[] = (tenantSettings.weeklyDiets && tenantSettings.weeklyDiets.length > 0)
    ? tenantSettings.weeklyDiets
    : [
        {
          id: 'diet-1',
          title: tenantSettings.weeklyDietTitle || '🥦 Plan Nutricional & Dieta de la Semana',
          content: tenantSettings.weeklyDietContent || ''
        }
      ];

  const [dietList, setDietList] = useState<WeeklyDietItem[]>(initialDiets);
  const [activeDietIndex, setActiveDietIndex] = useState<number>(0);
  const [dietVisible, setDietVisible] = useState(tenantSettings.weeklyDietVisible ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddDiet = () => {
    const newDiet: WeeklyDietItem = {
      id: `diet-${Date.now()}`,
      title: `🥗 Nueva Dieta ${dietList.length + 1}`,
      content: ''
    };
    const updated = [...dietList, newDiet];
    setDietList(updated);
    setActiveDietIndex(updated.length - 1);
  };

  const handleRemoveDiet = (indexToRemove: number) => {
    if (dietList.length <= 1) {
      setDietList([{ id: 'diet-1', title: '', content: '' }]);
      setActiveDietIndex(0);
      return;
    }
    const updated = dietList.filter((_, idx) => idx !== indexToRemove);
    setDietList(updated);
    setActiveDietIndex(prev => (prev >= updated.length ? updated.length - 1 : prev));
  };

  const handleUpdateActiveDiet = (field: 'title' | 'content', value: string) => {
    setDietList(prev => prev.map((item, idx) => {
      if (idx === activeDietIndex) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSaveDiet = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanList = dietList.filter(d => d.title.trim() || d.content.trim());
    const finalList = cleanList.length > 0 ? cleanList : [{ id: 'diet-1', title: '', content: '' }];

    updateTenantSettings({
      weeklyDietTitle: finalList[0]?.title || '',
      weeklyDietContent: finalList[0]?.content || '',
      weeklyDietVisible: dietVisible,
      weeklyDiets: finalList
    });
    setDietList(finalList);
    if (activeDietIndex >= finalList.length) {
      setActiveDietIndex(0);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const pendingReviews = reviews.filter(r => !r.approved);
  const approvedReviews = reviews.filter(r => r.approved);

  return (
    <div className="space-y-8">
      
      {/* Customer Reviews Approval Section */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Opiniones de Clientes ({reviews.length})
            </h3>
            <p className="text-xs text-stone-400">Si aceptás la reseña, se publicará automáticamente en la página pública.</p>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
            {pendingReviews.length} pendientes
          </span>
        </div>

        {/* Pending Reviews List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">Pendientes de Aprobación</h4>
          {pendingReviews.length === 0 ? (
            <p className="text-xs text-stone-500 italic bg-stone-950 p-4 rounded-xl border border-stone-800">
              No hay opiniones pendientes de revisión.
            </p>
          ) : (
            pendingReviews.map(rev => (
              <div key={rev.id} className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{rev.author}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-700'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-500">{rev.date}</span>
                  </div>
                  <p className="text-xs text-stone-300">"{rev.comment}"</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approveReview(rev.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Aceptar & Publicar
                  </button>
                  <button
                    onClick={() => deleteReview(rev.id)}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-rose-400 rounded-lg transition-colors"
                    title="Eliminar opinión"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Already Approved Reviews List */}
        <div className="space-y-3 pt-3 border-t border-stone-800">
          <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider">Publicadas en la Tienda</h4>
          <div className="space-y-2">
            {approvedReviews.map(rev => (
              <div key={rev.id} className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-stone-200">{rev.author} ({rev.rating}★): </span>
                  <span className="text-stone-300">"{rev.comment}"</span>
                </div>
                <button
                  onClick={() => deleteReview(rev.id)}
                  className="p-1 text-stone-500 hover:text-rose-400"
                  title="Despublicar / Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Queries & Suggestions Section */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <div className="border-b border-stone-800 pb-3">
          <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" />
            Consultas & Sugerencias de Clientes ({queries.length})
          </h3>
          <p className="text-xs text-stone-400">Consultas recibidas con nombre y celular del cliente para respuesta rápida.</p>
        </div>

        <div className="space-y-3">
          {queries.length === 0 ? (
            <p className="text-xs text-stone-500 italic bg-stone-950 p-4 rounded-xl border border-stone-800">
              No hay consultas registradas.
            </p>
          ) : (
            queries.map(q => {
              const cleanPhone = q.phone.replace(/\D/g, '');
              const waUrl = `https://wa.me/${tenantSettings.phonePrefix.replace(/\+/g, '')}${cleanPhone}?text=${encodeURIComponent(`Hola ${q.name}, respondiendo a tu consulta en ${tenantSettings.name}:`)}`;

              return (
                <div key={q.id} className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-100">{q.name}</span>
                      <span className="text-xs text-amber-400 font-mono font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {q.phone}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500">{q.date}</span>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed bg-stone-900 p-3 rounded-lg border border-stone-850">
                    "{q.query}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Responder por WhatsApp</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    <button
                      onClick={() => deleteQuery(q.id)}
                      className="p-1.5 text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                      title="Eliminar consulta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sección Dieta de la Semana (Debajo de todo en un apartado) */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4 shadow-lg">
        <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
              <Apple className="w-5 h-5 text-amber-500" />
              Gestión de Dietas Recomendadas de la Semana
            </h3>
            <p className="text-xs text-stone-400">
              Podés agregar y personalizar múltiples planes nutricionales para que tus clientes elijan en la tienda pública.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddDiet}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Nueva Dieta</span>
          </button>
        </div>

        <form onSubmit={handleSaveDiet} className="space-y-4">
          {/* Checkbox cajita con tilde para visibilidad */}
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-amber-400">
              <input
                type="checkbox"
                checked={dietVisible}
                onChange={e => setDietVisible(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span>Mostrar apartado "Dieta de la Semana" en el cuadro de consultas de la página pública</span>
            </label>
            <p className="text-[11px] text-stone-400 mt-1 pl-6">
              Tildá esta casilla si querés que los clientes puedan desplegar los planes de dietas en la tienda.
            </p>
          </div>

          {/* Diets Tabs list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Seleccionar Dieta para Editar ({dietList.length} cargada{dietList.length > 1 ? 's' : ''})
              </label>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {dietList.map((item, idx) => {
                const isActive = idx === activeDietIndex;
                const displayTitle = item.title.trim() || `Dieta #${idx + 1}`;
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveDietIndex(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 border transition-all ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md scale-[1.02]'
                        : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                    }`}
                  >
                    <span>{displayTitle}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleAddDiet}
                className="px-3 py-2 bg-stone-950 hover:bg-stone-800 text-amber-400 font-semibold text-xs rounded-xl border border-dashed border-amber-500/50 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Otra</span>
              </button>
            </div>
          </div>

          {/* Edit form for active diet */}
          {dietList[activeDietIndex] && (
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Editando Dieta #{activeDietIndex + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveDiet(activeDietIndex)}
                  className="px-2.5 py-1 text-rose-400 hover:bg-stone-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-rose-950 hover:border-rose-900"
                  title="Eliminar esta dieta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar esta Dieta</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Título de la Dieta (ej: 🫀 Dieta DASH para hipertensos, 🥦 Plan Veggie, etc.)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 🥦 Plan Nutricional & Dieta de la Semana"
                  value={dietList[activeDietIndex].title}
                  onChange={e => handleUpdateActiveDiet('title', e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Contenido / Menú Diario de esta Dieta
                </label>
                <textarea
                  rows={6}
                  placeholder="Escribí las recomendaciones nutricionales o el menú diario de esta opción..."
                  value={dietList[activeDietIndex].content}
                  onChange={e => handleUpdateActiveDiet('content', e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                />
              </div>
            </div>
          )}

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>¡Todas las Dietas de la Semana fueron guardadas con éxito!</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={handleAddDiet}
              className="w-full sm:w-auto px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Nueva Dieta</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración de Dietas</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
