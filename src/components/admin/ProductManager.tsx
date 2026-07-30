import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, CustomField } from '../../types';
import { Plus, Minus, Trash2, Edit3, Image, Sparkles, PlusCircle, Check, X, Tag, Truck, Upload, Camera } from 'lucide-react';

export const ProductManager: React.FC = () => {
  const {
    tenantSettings,
    updateTenantSettings,
    products,
    categories,
    addCategory,
    removeCategory,
    addProduct,
    updateProduct,
    deleteProduct
  } = useApp();

  // Category management input
  const [newCatName, setNewCatName] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Product Form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState('500g');
  const [category, setCategory] = useState(categories[0] || 'Frutos Secos');
  const [images, setImages] = useState<string[]>(['https://images.unsplash.com/photo-1508061252966-dfd30f67ea55?auto=format&fit=crop&w=800&q=80']);
  const [autoCarousel, setAutoCarousel] = useState(true);
  const [isPromo, setIsPromo] = useState(false);
  const [isOffer, setIsOffer] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setUnit('500g');
    setCategory(categories[0] || 'Frutos Secos');
    setImages(['https://images.unsplash.com/photo-1508061252966-dfd30f67ea55?auto=format&fit=crop&w=800&q=80']);
    setAutoCarousel(true);
    setIsPromo(false);
    setIsOffer(false);
    setCustomFields([]);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setUnit(prod.unit);
    setCategory(prod.category);
    setImages(prod.images.length > 0 ? prod.images : ['']);
    setAutoCarousel(prod.autoCarousel);
    setIsPromo(prod.isPromo);
    setIsOffer(prod.isOffer);
    setCustomFields(prod.customFields || []);
    setShowProductModal(true);
  };

  const handleAddImageSlot = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const handleRemoveImageSlot = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleImageChange = (idx: number, val: string) => {
    const next = [...images];
    next[idx] = val;
    setImages(next);
  };

  const handleFileUpload = (idx: number, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleImageChange(idx, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultiFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).slice(0, 5 - images.length);
    
    fileArray.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImages(prev => {
            const next = [...prev];
            const emptyIdx = next.findIndex(img => !img.trim());
            if (emptyIdx !== -1) {
              next[emptyIdx] = result;
            } else if (next.length < 5) {
              next.push(result);
            }
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddCustomField = () => {
    setCustomFields([
      ...customFields,
      { id: `f-${Date.now()}`, name: 'Nuevo Campo', value: '' }
    ]);
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    const cleanImages = images.map(i => i.trim()).filter(Boolean);
    const finalImages = cleanImages.length > 0
      ? cleanImages
      : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'];

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        unit,
        category,
        images: finalImages,
        autoCarousel,
        isPromo,
        isOffer,
        customFields
      });
    } else {
      addProduct({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        unit,
        category,
        images: finalImages,
        autoCarousel,
        isPromo,
        isOffer,
        customFields
      });
    }

    setShowProductModal(false);
  };

  const handleCreateCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName);
      setNewCatName('');
      setShowAddCatModal(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Category Manager Section (Boton + y -) */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2 font-jakarta">
              <Tag className="w-5 h-5 text-amber-500" />
              Gestión de Categorías
            </h3>
            <p className="text-xs text-stone-400">Creá y eliminá las categorías visibles en el catálogo público.</p>
          </div>
          
          <button
            onClick={() => setShowAddCatModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Categoría (+)</span>
          </button>
        </div>

        {/* Categories Chips with (-) Delete Button */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <div
              key={cat}
              className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs font-semibold text-stone-200"
            >
              <span>{cat}</span>
              {cat !== 'Promo' && cat !== 'Oferta' && cat !== 'Todo' && (
                <button
                  onClick={() => removeCategory(cat)}
                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950 rounded transition-colors"
                  title="Eliminar categoría (-)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Configuración de Envíos en el Canasto (Cajita con tilde) */}
        <div className="pt-3 border-t border-stone-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950 p-3.5 rounded-xl border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400">
                  <input
                    type="checkbox"
                    checked={tenantSettings.enableDelivery ?? true}
                    onChange={e => updateTenantSettings({ enableDelivery: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <span>Habilitar Opción de Envíos a Domicilio en el Canasto</span>
                </label>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Permite que tus clientes elijan 'Envío a Domicilio' e ingresen su dirección al hacer el pedido.
                </p>
              </div>
            </div>

            {tenantSettings.enableDelivery && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-stone-300 font-semibold whitespace-nowrap">Costo Envío ($):</span>
                <input
                  type="number"
                  placeholder="0"
                  value={tenantSettings.deliveryFee ?? 1200}
                  onChange={e => updateTenantSettings({ deliveryFee: Number(e.target.value) })}
                  className="w-24 bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product List Header & Creator Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-stone-100 font-playfair">Inventario de Productos ({products.length})</h3>
          <p className="text-xs text-stone-400">Sincronización instantánea con el catálogo público.</p>
        </div>

        <button
          onClick={handleOpenNewProduct}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nuevo Producto</span>
        </button>
      </div>

      {/* Product Cards Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(product => (
          <div key={product.id} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-4 space-y-3 flex flex-col justify-between">
            <div className="flex gap-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-xl border border-stone-800 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {product.category}
                </span>
                <h4 className="font-bold text-sm text-stone-100 line-clamp-1">{product.name}</h4>
                <p className="text-xs font-bold text-amber-400">${product.price.toLocaleString()} / {product.unit}</p>
              </div>
            </div>

            <p className="text-xs text-stone-400 line-clamp-2">{product.description}</p>

            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-2 border-t border-stone-800">
              <span>{product.images.length} fotos {product.autoCarousel ? '(Carrusel Auto)' : ''}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenEditProduct(product)}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg transition-colors"
                  title="Editar producto"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-rose-400 rounded-lg transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h4 className="text-base font-bold text-white font-jakarta">Agregar Nueva Categoría (+)</h4>
            <form onSubmit={handleCreateCatSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Nombre de la categoría (ej: Cereales)"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Creator & Editor Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <h4 className="text-lg font-bold font-jakarta">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h4>
              <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-stone-800 rounded-lg text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Almendras Nono Premium"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4800"
                    value={price}
                    onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Presentación (Kg, Litros, etc.) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 500g, 1 kg, 1 litro, unidad"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-amber-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPromo}
                      onChange={e => setIsPromo(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Es Promo</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-rose-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOffer}
                      onChange={e => setIsOffer(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <span>Es Oferta</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Detalle / Descripción</label>
                  <textarea
                    rows={2}
                    placeholder="Descripción detallada de origen, sabor y beneficios..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Product Images (Hasta 5 imágenes con subida desde PC/Móvil o URL) */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Image className="w-4 h-4" />
                    Imágenes del Producto (Hasta 5)
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir desde PC / Celular</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => handleMultiFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>

                    {images.length < 5 && (
                      <button
                        type="button"
                        onClick={handleAddImageSlot}
                        className="text-xs text-stone-400 hover:text-amber-400 hover:underline font-semibold"
                      >
                        + URL ({images.length}/5)
                      </button>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-stone-300 cursor-pointer bg-stone-900 p-2.5 rounded-lg border border-stone-800">
                  <input
                    type="checkbox"
                    checked={autoCarousel}
                    onChange={e => setAutoCarousel(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>Cambiar las imágenes automáticamente en la galería pública</span>
                </label>

                <div className="space-y-2.5">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-stone-900/60 p-2 rounded-xl border border-stone-800">
                      <span className="text-xs font-bold text-amber-400 w-5 text-center">#{idx + 1}</span>
                      
                      {/* Image Thumbnail Preview */}
                      <div className="w-10 h-10 bg-stone-950 rounded-lg overflow-hidden border border-stone-800 shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} alt={`Foto ${idx+1}`} className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-4 h-4 text-stone-600" />
                        )}
                      </div>

                      {/* URL input field */}
                      <input
                        type="text"
                        placeholder="Pegar URL o subir archivo desde tu dispositivo..."
                        value={imgUrl}
                        onChange={e => handleImageChange(idx, e.target.value)}
                        className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                      />

                      {/* File upload button for this specific slot */}
                      <label className="cursor-pointer px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 border border-stone-700 shrink-0 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Examinar</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])}
                          className="hidden"
                        />
                      </label>

                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageSlot(idx)}
                          className="p-1.5 text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                          title="Eliminar esta foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Extra Fields ("bon mas campo") */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-stone-300 tracking-wider">
                    Campos Personalizados Extras (+ campo)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    + Agregar Campo
                  </button>
                </div>

                {customFields.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">No hay campos extras agregados.</p>
                ) : (
                  <div className="space-y-2">
                    {customFields.map((cf, idx) => (
                      <div key={cf.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Nombre (ej: Origen)"
                          value={cf.name}
                          onChange={e => {
                            const next = [...customFields];
                            next[idx].name = e.target.value;
                            setCustomFields(next);
                          }}
                          className="w-1/3 bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-200"
                        />
                        <input
                          type="text"
                          placeholder="Valor (ej: Mendoza)"
                          value={cf.value}
                          onChange={e => {
                            const next = [...customFields];
                            next[idx].value = e.target.value;
                            setCustomFields(next);
                          }}
                          className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(cf.id)}
                          className="p-1 text-rose-400 hover:bg-stone-800 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
