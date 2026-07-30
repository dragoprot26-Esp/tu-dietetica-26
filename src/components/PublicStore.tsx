import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Diet } from '../types';
import {
  Search,
  ShoppingBag,
  Star,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  Info,
  Send,
  CheckCircle,
  Clock,
  Percent,
  Apple,
  Filter,
  X,
  Check
} from 'lucide-react';

export const PublicStore: React.FC = () => {
  const {
    tenantSettings,
    products,
    categories,
    diets,
    activeDietId,
    setActiveDietId,
    reviews,
    addReview,
    addQuery,
    addToCart,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    t
  } = useApp();

  // Selected product for multi-image viewing modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Review & Inquiry form states
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [queryName, setQueryName] = useState('');
  const [queryPhone, setQueryPhone] = useState('');
  const [queryText, setQueryText] = useState('');
  const [querySubmitted, setQuerySubmitted] = useState(false);
  const [showWeeklyDietModal, setShowWeeklyDietModal] = useState(false);
  const [selectedDietIndex, setSelectedDietIndex] = useState(0);

  // Weekly Diets list configured by admin
  const publicWeeklyDiets = (tenantSettings.weeklyDiets && tenantSettings.weeklyDiets.length > 0)
    ? tenantSettings.weeklyDiets
    : (tenantSettings.weeklyDietTitle || tenantSettings.weeklyDietContent)
    ? [{ id: 'diet-1', title: tenantSettings.weeklyDietTitle || '🥦 Plan Nutricional & Dieta de la Semana', content: tenantSettings.weeklyDietContent || '' }]
    : [];
  const currentWeeklyDiet = publicWeeklyDiets[selectedDietIndex] || publicWeeklyDiets[0];

  // Publicly visible diets loaded by admin
  const publicDiets = diets.filter(d => d.visiblePublic);
  const selectedDiet = diets.find(d => d.id === activeDietId);

  // Filter products by active category, active diet & search query
  const filteredProducts = products.filter(product => {
    // Category match
    if (activeCategory === 'Promo' && !product.isPromo) return false;
    if (activeCategory === 'Oferta' && !product.isOffer) return false;
    if (
      activeCategory !== 'Todo' &&
      activeCategory !== 'Promo' &&
      activeCategory !== 'Oferta' &&
      product.category !== activeCategory
    ) {
      return false;
    }

    // Diet match
    if (selectedDiet) {
      const keywords = selectedDiet.keywords || [];
      const dietNameLower = selectedDiet.name.toLowerCase();
      const pName = product.name.toLowerCase();
      const pDesc = product.description.toLowerCase();
      const pCat = product.category.toLowerCase();
      const customStr = (product.customFields || []).map(f => `${f.name} ${f.value}`).join(' ').toLowerCase();
      const combined = `${pName} ${pDesc} ${pCat} ${customStr}`;

      const matchesKeyword = keywords.some(kw => combined.includes(kw));
      const matchesName = dietNameLower.split('/').some(part => combined.includes(part.trim()));
      
      if (!matchesKeyword && !matchesName) {
        return false;
      }
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat;
    }

    return true;
  });

  // Approved customer reviews to display on public page
  const approvedReviews = reviews.filter(r => r.approved);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addReview(reviewAuthor, reviewRating, reviewComment);
    setReviewSubmitted(true);
    setReviewAuthor('');
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryName.trim() || !queryPhone.trim() || !queryText.trim()) return;
    addQuery(queryName, queryPhone, queryText);
    setQuerySubmitted(true);
    setQueryName('');
    setQueryPhone('');
    setQueryText('');
    setTimeout(() => setQuerySubmitted(false), 4000);
  };

  // Theme Styling Classes based on publicTheme choice
  const getThemeWrapperClass = () => {
    switch (tenantSettings.publicTheme) {
      case 'eco-green':
        return 'bg-emerald-950/20 text-stone-900';
      case 'minimal-modern':
        return 'bg-slate-50 text-slate-900';
      case 'new-york':
      default:
        return 'bg-stone-900 text-stone-100 font-jakarta';
    }
  };

  return (
    <div className={`min-h-screen pb-16 ${getThemeWrapperClass()}`}>
      
      {/* Announcement Bar (Only if delivery is enabled and announcement text exists) */}
      {(tenantSettings.enableDelivery ?? true) && tenantSettings.announcementText && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-bold text-xs py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{tenantSettings.announcementText}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* New York Style Header: Logo & Store Image */}
        <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl group">
          {/* Banner background image */}
          <div className="h-48 sm:h-72 md:h-80 w-full relative overflow-hidden">
            <img
              src={tenantSettings.bannerUrl}
              alt={tenantSettings.name}
              className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
          </div>

          {/* Logo & Store Identity overlay */}
          <div className="relative -mt-16 sm:-mt-20 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left z-10">
            {/* Logo image */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-stone-900 bg-stone-900 shadow-xl shrink-0">
              <img
                src={tenantSettings.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Business Text & Info */}
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                Dietética & Orgánicos • NYC Soho Edition
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white font-playfair tracking-tight">
                {tenantSettings.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-medium">
                {tenantSettings.subname}
              </p>
            </div>
          </div>
        </div>

        {/* Category Buttons Bar (Debajo logo e imagen) */}
        <div className="sticky top-16 z-30 bg-stone-900/90 backdrop-blur-md p-2 rounded-2xl border border-stone-800 shadow-md">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            
            {/* Category: Todo */}
            <button
              id="cat-todo-btn"
              onClick={() => setActiveCategory('Todo')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeCategory === 'Todo'
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              {t.allCategories}
            </button>

            {/* Category: Promo */}
            <button
              id="cat-promo-btn"
              onClick={() => setActiveCategory('Promo')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeCategory === 'Promo'
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.promos}
            </button>

            {/* Category: Oferta */}
            <button
              id="cat-oferta-btn"
              onClick={() => setActiveCategory('Oferta')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeCategory === 'Oferta'
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                  : 'bg-stone-800 hover:bg-stone-700 text-rose-400 border border-rose-500/30'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              {t.offers}
            </button>

            {/* Dynamic Custom Categories */}
            {categories
              .filter(c => c !== 'Promo' && c !== 'Oferta')
              .map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
          </div>
        </div>

        {/* Section: Elegí tu dieta */}
        {publicDiets.length > 0 && (
          <div className="bg-stone-950/90 border border-stone-800 p-4 sm:p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-stone-850 pb-2.5">
              <h3 className="text-sm sm:text-base font-bold font-playfair text-white flex items-center gap-2">
                <Apple className="w-4.5 h-4.5 text-amber-500" />
                Elegí tu dieta
              </h3>
              {activeDietId && (
                <button
                  onClick={() => setActiveDietId(null)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline"
                >
                  <X className="w-3.5 h-3.5" />
                  Ver todas las dietas
                </button>
              )}
            </div>

            {/* Diets Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {publicDiets.map(diet => {
                const isSelected = activeDietId === diet.id;
                return (
                  <button
                    key={diet.id}
                    onClick={() => setActiveDietId(isSelected ? null : diet.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 shadow-md scale-105 ring-2 ring-amber-400'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800'
                    }`}
                  >
                    <span>{diet.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-stone-950" />}
                  </button>
                );
              })}
            </div>

            {selectedDiet && (
              <div className="text-xs text-stone-300 bg-stone-900/80 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <span>
                  💡 <strong>{selectedDiet.name}:</strong> {selectedDiet.description}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Search Bar (Barra de Búsqueda) */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 shadow-inner transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3 text-xs text-stone-400 hover:text-white"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Dynamic Catalog Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold font-playfair text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              Catálogo de Alimentos ({filteredProducts.length})
            </h2>
            <span className="text-xs text-stone-400 font-medium">Categoría: {activeCategory}</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-stone-950/50 rounded-2xl border border-stone-800/80 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto" />
              <h3 className="text-base font-bold text-stone-300">No se encontraron productos</h3>
              <p className="text-xs text-stone-400">Pruebe cambiar los filtros de categoría o el texto de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onInspect={() => {
                    setSelectedProduct(product);
                    setActiveImgIndex(0);
                  }}
                  onAddToCart={() => addToCart(product, 1)}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>

        {/* Customer Feedback & Reviews + Queries Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-stone-800">
          
          {/* Reviews Display & Submit */}
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-playfair text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                {t.reviewsTitle}
              </h3>
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
                {approvedReviews.length} opiniones
              </span>
            </div>

            {/* Approved Reviews List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {approvedReviews.length === 0 ? (
                <p className="text-xs text-stone-400 italic">Aún no hay opiniones publicadas.</p>
              ) : (
                approvedReviews.map(rev => (
                  <div key={rev.id} className="bg-stone-900 p-3.5 rounded-xl border border-stone-850 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-200">{rev.author}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-300">{rev.comment}</p>
                    <span className="text-[10px] text-stone-500 block">{rev.date}</span>
                  </div>
                ))
              )}
            </div>

            {/* Leave a review form */}
            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-stone-800 space-y-3">
              <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">{t.leaveReview}</h4>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Calificación:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 focus:outline-none"
                    >
                      <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400' : 'text-stone-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder={t.yourName}
                value={reviewAuthor}
                onChange={e => setReviewAuthor(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />

              <textarea
                required
                rows={2}
                placeholder={t.yourComment}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />

              {reviewSubmitted && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Gracias! Tu opinión fue enviada a revisión por el administrador.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                Publicar Opinión
              </button>
            </form>
          </div>

          {/* Suggestions & Queries Form (Caja más chica) */}
          <div className="bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-3 shadow-md">
            <div>
              <h3 className="text-base font-bold font-playfair text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                {t.askQuery}
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                ¿Dudas sobre productos sin TACC, encargos o stock? Escribinos y te responderemos por WhatsApp.
              </p>
            </div>

            <form onSubmit={handleQuerySubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    placeholder={`${t.yourName} *`}
                    value={queryName}
                    onChange={e => setQueryName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    placeholder={`${t.yourPhone} *`}
                    value={queryPhone}
                    onChange={e => setQueryPhone(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <textarea
                  required
                  rows={2}
                  placeholder="Tu consulta o sugerencia..."
                  value={queryText}
                  onChange={e => setQueryText(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {querySubmitted && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>¡Consulta registrada! Te responderemos pronto.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {t.sendQuery}
              </button>
            </form>

            {/* Apartado Dieta de la Semana (Debajo de Enviar Consulta) */}
            {(tenantSettings.weeklyDietVisible ?? true) && (
              <div className="pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowWeeklyDietModal(prev => !prev)}
                  className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-850 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-between border border-amber-500/40 hover:border-amber-400 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Apple className="w-4.5 h-4.5 text-amber-500" />
                    <span>
                      {publicWeeklyDiets.length > 1
                        ? `🥦 Ver Dietas Recomendadas (${publicWeeklyDiets.length} opciones)`
                        : tenantSettings.weeklyDietTitle || '🥦 Ver Dieta de la Semana'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                    {showWeeklyDietModal ? 'Ocultar' : 'Presioná para ver'}
                  </span>
                </button>

                {showWeeklyDietModal && (
                  <div className="mt-2.5 bg-stone-900 border border-amber-500/40 p-4 rounded-xl space-y-3 text-xs text-stone-200 shadow-xl">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="font-bold text-amber-400 font-playfair flex items-center gap-1.5 text-sm">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Planes Nutricionales Recomendados
                      </span>
                      <button
                        onClick={() => setShowWeeklyDietModal(false)}
                        className="p-1 text-stone-400 hover:text-stone-200 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Selector de Dietas (si hay más de 1 opción) */}
                    {publicWeeklyDiets.length > 1 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-stone-400 font-semibold block">
                          Elegí la opción de plan que más se adapte a vos:
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {publicWeeklyDiets.map((dietItem, idx) => {
                            const isSelected = idx === selectedDietIndex;
                            return (
                              <button
                                key={dietItem.id || idx}
                                type="button"
                                onClick={() => setSelectedDietIndex(idx)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                                  isSelected
                                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                                }`}
                              >
                                {dietItem.title || `Opción ${idx + 1}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Title of selected diet if multiple exist */}
                    {publicWeeklyDiets.length > 1 && currentWeeklyDiet?.title && (
                      <div className="font-bold text-amber-300 font-playfair text-xs pt-1 border-t border-stone-850">
                        {currentWeeklyDiet.title}
                      </div>
                    )}

                    {/* Content text */}
                    <div className="whitespace-pre-line leading-relaxed text-stone-300 font-normal bg-stone-950 p-3.5 rounded-lg border border-stone-850 text-xs font-sans">
                      {currentWeeklyDiet?.content || 'No hay información cargada para esta dieta.'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </section>

        {/* Link Button: Visita Vitrina */}
        <div className="text-center pt-8 border-t border-stone-800">
          <a
            id="visit-vitrina-link"
            href="https://vitrina-cyc.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-stone-800 via-stone-800 to-stone-900 hover:from-amber-600 hover:to-amber-500 text-white font-bold rounded-2xl border border-stone-700 hover:border-amber-400 text-sm sm:text-base shadow-xl transition-all duration-300 group"
          >
            <span>{t.visitShowcase}</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-[11px] text-stone-500 mt-2">Visitá nuestra Vitrina digital externa de Alimentos & Servicios.</p>
        </div>

      </main>

      {/* Multi-Image Product Inspection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-stone-950/70 hover:bg-stone-950 text-white rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Gallery Slider */}
              <div className="relative h-64 md:h-full bg-stone-950 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedProduct.images[activeImgIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />

                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImgIndex(prev => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1))
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-stone-950/70 text-white rounded-full hover:bg-amber-500 hover:text-stone-950 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImgIndex(prev => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-stone-950/70 text-white rounded-full hover:bg-amber-500 hover:text-stone-950 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Thumbnail Indicators */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImgIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            activeImgIndex === idx ? 'bg-amber-400 scale-125' : 'bg-stone-600'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-xl font-bold font-playfair text-white">{selectedProduct.name}</h3>
                  <p className="text-xs text-stone-300 leading-relaxed">{selectedProduct.description}</p>
                  
                  {/* Custom Fields */}
                  {selectedProduct.customFields && selectedProduct.customFields.length > 0 && (
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                      {selectedProduct.customFields.map(cf => (
                        <div key={cf.id} className="text-xs flex justify-between">
                          <span className="text-stone-400 font-medium">{cf.name}:</span>
                          <span className="text-stone-200 font-semibold">{cf.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-2xl font-black font-space text-amber-400 pt-2">
                    ${selectedProduct.price.toLocaleString()}{' '}
                    <span className="text-xs text-stone-400 font-normal">/ {selectedProduct.unit}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct, 1);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 mt-4"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t.addToCart}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component for individual product card
const ProductCard: React.FC<{
  product: Product;
  onInspect: () => void;
  onAddToCart: () => void;
  t: any;
}> = ({ product, onInspect, onAddToCart, t }) => {
  const [currentImg, setCurrentImg] = useState(0);

  // Auto carousel effect if enabled
  useEffect(() => {
    if (!product.autoCarousel || product.images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % product.images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [product.autoCarousel, product.images.length]);

  return (
    <div className="bg-stone-950 border border-stone-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group transition-all duration-300">
      
      {/* Product Image & Badges */}
      <div className="relative h-48 bg-stone-900 cursor-pointer overflow-hidden" onClick={onInspect}>
        <img
          src={product.images[currentImg] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Promo / Offer Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isPromo && (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> PROMO
            </span>
          )}
          {product.isOffer && (
            <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Percent className="w-3 h-3" /> OFERTA
            </span>
          )}
        </div>

        {/* Image count badge */}
        {product.images.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-sm text-stone-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            1/{product.images.length} fotos
          </span>
        )}
      </div>

      {/* Info & Cart Actions */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
            {product.category}
          </span>
          <h3
            onClick={onInspect}
            className="font-bold text-base text-stone-100 hover:text-amber-400 cursor-pointer line-clamp-1 transition-colors"
          >
            {product.name}
          </h3>
          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-stone-850 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-stone-400 block font-normal">{product.unit}</span>
            <span className="text-lg font-black font-space text-amber-400">
              ${product.price.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Canasto</span>
          </button>
        </div>
      </div>

    </div>
  );
};
