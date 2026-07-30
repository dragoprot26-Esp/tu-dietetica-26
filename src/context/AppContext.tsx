import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Language,
  Product,
  CustomerReview,
  CustomerQuery,
  Collaborator,
  TenantSettings,
  Order,
  OrderItem,
  BackupData,
  UserSession,
  Diet
} from '../types';
import { StorageService } from '../services/storage';
import { translations } from '../data/translations';
import * as cloud from '../services/cloud';
import * as biometria from '../services/biometria';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.es;
  
  tenantSettings: TenantSettings;
  updateTenantSettings: (newSettings: Partial<TenantSettings>) => void;
  
  products: Product[];
  categories: string[];
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  diets: Diet[];
  addDiet: (name: string, description: string, visiblePublic: boolean, badgeColor?: string, keywords?: string[]) => void;
  updateDiet: (diet: Diet) => void;
  deleteDiet: (id: string) => void;
  toggleDietVisibility: (id: string) => void;
  activeDietId: string | null;
  setActiveDietId: (id: string | null) => void;
  
  orders: Order[];
  cart: OrderItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  submitOrder: (
    name: string,
    phone: string,
    deliveryType?: 'pickup' | 'delivery',
    deliveryAddress?: string,
    deliveryFee?: number
  ) => Order | null;
  updateOrderStatus: (
    orderId: string,
    newStatus: 'pendiente' | 'entregado' | 'cancelado',
    fulfilledByName?: string
  ) => void;
  deleteOrder: (orderId: string) => void;
  
  reviews: CustomerReview[];
  addReview: (author: string, rating: number, comment: string) => void;
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;
  
  queries: CustomerQuery[];
  addQuery: (name: string, phone: string, query: string) => void;
  resolveQuery: (id: string) => void;
  deleteQuery: (id: string) => void;
  
  collaborators: Collaborator[];
  addCollaborator: (name: string, phone: string, username: string, passwordHash: string) => void;
  updateCollaborator: (collaborator: Collaborator) => void;
  deleteCollaborator: (id: string) => void;
  logoutCollaboratorRemote: (id: string) => void;
  
  session: UserSession;
  verifyLicense: (key: string) => Promise<boolean>;
  loginAsAdmin: (username: string, password: string) => Promise<boolean>;
  loginAsCollaborator: (username: string, password: string) => Promise<boolean>;
  loginBiometric: () => Promise<boolean>;
  logout: () => void;
  authError: string;
  authBusy: boolean;
  bioAvail: boolean;
  rememberBio: boolean;
  setRememberBio: (v: boolean) => void;
  
  backups: BackupData[];
  createBackup: (label?: string) => void;
  restoreBackup: (id: string) => boolean;
  
  canClearSales: boolean;
  exportSalesSpreadsheet: () => void;
  clearSales: () => void;
  
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  activeModal: 'cart' | 'location' | 'share' | 'login' | 'qr' | null;
  setActiveModal: (modal: 'cart' | 'location' | 'share' | 'login' | 'qr' | null) => void;
  
  adminTab: 'products' | 'dashboard' | 'comments' | 'collaborators' | 'publicTheme' | 'panelTheme' | 'config' | 'dietary';
  setAdminTab: (tab: 'products' | 'dashboard' | 'comments' | 'collaborators' | 'publicTheme' | 'panelTheme' | 'config' | 'dietary') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');
  const [tenantSettings, setTenantSettingsState] = useState<TenantSettings>(StorageService.getTenantSettings());
  const [products, setProductsState] = useState<Product[]>(StorageService.getProducts());
  const [diets, setDietsState] = useState<Diet[]>(StorageService.getDiets());
  const [reviews, setReviewsState] = useState<CustomerReview[]>(StorageService.getReviews());
  const [queries, setQueriesState] = useState<CustomerQuery[]>(StorageService.getQueries());
  const [collaborators, setCollaboratorsState] = useState<Collaborator[]>(StorageService.getCollaborators());
  const [orders, setOrdersState] = useState<Order[]>(StorageService.getOrders());
  const [backups, setBackupsState] = useState<BackupData[]>(StorageService.getBackups());
  
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todo');
  const [activeDietId, setActiveDietId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<'cart' | 'location' | 'share' | 'login' | 'qr' | null>(null);
  const [adminTab, setAdminTab] = useState<'products' | 'orders' | 'dashboard' | 'comments' | 'collaborators' | 'publicTheme' | 'panelTheme' | 'config' | 'dietary'>('products');
  const [canClearSales, setCanClearSales] = useState<boolean>(false);

  // Session state
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: null,
    userId: null,
    userName: null,
    username: null
  });

  const t = translations[language];

  // Helper sync methods
  const updateTenantSettings = (newSettings: Partial<TenantSettings>) => {
    const updated = { ...tenantSettings, ...newSettings };
    setTenantSettingsState(updated);
    StorageService.saveTenantSettings(updated);
  };

  const addCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed || tenantSettings.categories.includes(trimmed)) return;
    const newCats = [...tenantSettings.categories, trimmed];
    updateTenantSettings({ categories: newCats });
  };

  const removeCategory = (categoryName: string) => {
    const newCats = tenantSettings.categories.filter(c => c !== categoryName);
    updateTenantSettings({ categories: newCats });
    if (activeCategory === categoryName) setActiveCategory('Todo');
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    const updated = [newProduct, ...products];
    setProductsState(updated);
    StorageService.saveProducts(updated);
  };

  const updateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProductsState(updated);
    StorageService.saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProductsState(updated);
    StorageService.saveProducts(updated);
  };

  // Diet Operations
  const addDiet = (
    name: string,
    description: string,
    visiblePublic: boolean,
    badgeColor: string = 'amber',
    keywords: string[] = []
  ) => {
    const newDiet: Diet = {
      id: `diet-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      visiblePublic,
      badgeColor,
      keywords
    };
    const updated = [...diets, newDiet];
    setDietsState(updated);
    StorageService.saveDiets(updated);
  };

  const updateDiet = (updatedDiet: Diet) => {
    const updated = diets.map(d => d.id === updatedDiet.id ? updatedDiet : d);
    setDietsState(updated);
    StorageService.saveDiets(updated);
  };

  const deleteDiet = (id: string) => {
    const updated = diets.filter(d => d.id !== id);
    setDietsState(updated);
    StorageService.saveDiets(updated);
  };

  const toggleDietVisibility = (id: string) => {
    const updated = diets.map(d => d.id === id ? { ...d, visiblePublic: !d.visiblePublic } : d);
    setDietsState(updated);
    StorageService.saveDiets(updated);
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as OrderItem[];
    });
  };

  const clearCart = () => setCart([]);

  const submitOrder = (
    name: string,
    phone: string,
    deliveryType: 'pickup' | 'delivery' = 'pickup',
    deliveryAddress: string = '',
    deliveryFee: number = 0
  ): Order | null => {
    if (cart.length === 0 || !name.trim() || !phone.trim()) return null;
    
    // Generate random 4-digit code e.g. #TD-7492
    const randomCode = `#TD-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const finalTotal = itemsTotal + (deliveryType === 'delivery' ? deliveryFee : 0);
    
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      pickupCode: randomCode,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      items: [...cart],
      totalPrice: finalTotal,
      date: new Date().toISOString(),
      collaboratorId: session.role === 'colaborador' ? (session.userId || undefined) : undefined,
      collaboratorName: session.role === 'colaborador' ? (session.userName || undefined) : undefined,
      status: 'pendiente',
      tenantId: tenantSettings.id,
      deliveryType,
      deliveryAddress: deliveryAddress.trim(),
      deliveryFee: deliveryType === 'delivery' ? deliveryFee : 0
    };

    const updatedOrders = [newOrder, ...orders];
    setOrdersState(updatedOrders);
    StorageService.saveOrders(updatedOrders);
    // Molde CyC: el pedido del cliente se agrega ATÓMICO a la nube (sin login).
    if (cloudCodeRef.current) cloud.dietAgregarPedido(cloudCodeRef.current, newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: 'pendiente' | 'entregado' | 'cancelado',
    fulfilledByName?: string
  ) => {
    const defaultFulfillerName = fulfilledByName ?? session.userName ?? (session.role === 'inquilino' ? 'Inquilino Administrador' : 'Colaborador');
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          collaboratorName: newStatus === 'entregado' ? (fulfilledByName || o.collaboratorName || defaultFulfillerName) : o.collaboratorName
        };
      }
      return o;
    });
    setOrdersState(updated);
    StorageService.saveOrders(updated);
  };

  const deleteOrder = (orderId: string) => {
    const updated = orders.filter(o => o.id !== orderId);
    setOrdersState(updated);
    StorageService.saveOrders(updated);
  };

  // Customer Reviews
  const addReview = (author: string, rating: number, comment: string) => {
    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: author.trim() || 'Cliente Anónimo',
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      approved: false // Pending approval by admin
    };
    const updated = [newReview, ...reviews];
    setReviewsState(updated);
    StorageService.saveReviews(updated);
    // Molde CyC: la reseña queda PENDIENTE de aprobar y se sube a la nube.
    if (cloudCodeRef.current) cloud.dietAgregarResena(cloudCodeRef.current, newReview);
  };

  const approveReview = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: true } : r);
    setReviewsState(updated);
    StorageService.saveReviews(updated);
  };

  const deleteReview = (id: string) => {
    const updated = reviews.filter(r => r.id !== id);
    setReviewsState(updated);
    StorageService.saveReviews(updated);
  };

  // Customer Queries
  const addQuery = (name: string, phone: string, queryText: string) => {
    const newQuery: CustomerQuery = {
      id: `q-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      query: queryText.trim(),
      date: new Date().toISOString().split('T')[0],
      resolved: false
    };
    const updated = [newQuery, ...queries];
    setQueriesState(updated);
    StorageService.saveQueries(updated);
  };

  const resolveQuery = (id: string) => {
    const updated = queries.map(q => q.id === id ? { ...q, resolved: true } : q);
    setQueriesState(updated);
    StorageService.saveQueries(updated);
  };

  const deleteQuery = (id: string) => {
    const updated = queries.filter(q => q.id !== id);
    setQueriesState(updated);
    StorageService.saveQueries(updated);
  };

  // Collaborators
  const addCollaborator = (name: string, phone: string, username: string, passwordHash: string) => {
    const newColab: Collaborator = {
      id: `col-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      username: username.trim().toLowerCase(),
      passwordHash: passwordHash.trim(),
      activeSession: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [...collaborators, newColab];
    setCollaboratorsState(updated);
    StorageService.saveCollaborators(updated);
  };

  const updateCollaborator = (updatedColab: Collaborator) => {
    const updated = collaborators.map(c => c.id === updatedColab.id ? updatedColab : c);
    setCollaboratorsState(updated);
    StorageService.saveCollaborators(updated);
  };

  const deleteCollaborator = (id: string) => {
    const updated = collaborators.filter(c => c.id !== id);
    setCollaboratorsState(updated);
    StorageService.saveCollaborators(updated);
  };

  const logoutCollaboratorRemote = (id: string) => {
    const updated = collaborators.map(c => c.id === id ? { ...c, activeSession: false } : c);
    setCollaboratorsState(updated);
    StorageService.saveCollaborators(updated);
  };

  // ── Nube (molde CyC): estado y helpers ────────────────────────────────
  const cloudCodeRef = useRef<string | null>(null);
  const pendingLicRef = useRef<{ code: string; lic: any } | null>(null);
  const suspendSaveRef = useRef<boolean>(false);
  const saveTimerRef = useRef<any>(null);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [bioAvail, setBioAvail] = useState(false);
  const [rememberBio, setRememberBio] = useState(false);

  // Escribe TODO el estado desde un blob de la nube (y lo persiste local).
  const aplicarBlob = (data: cloud.CloudData) => {
    suspendSaveRef.current = true;
    try {
      if (data.settings) { const s = { ...StorageService.getTenantSettings(), ...data.settings }; setTenantSettingsState(s); StorageService.saveTenantSettings(s); }
      if (Array.isArray(data.products)) { setProductsState(data.products); StorageService.saveProducts(data.products); }
      if (Array.isArray(data.diets)) { setDietsState(data.diets); StorageService.saveDiets(data.diets); }
      if (Array.isArray(data.orders)) { setOrdersState(data.orders); StorageService.saveOrders(data.orders); }
      if (Array.isArray(data.reviews)) { setReviewsState(data.reviews); StorageService.saveReviews(data.reviews); }
      if (Array.isArray(data.queries)) { setQueriesState(data.queries); StorageService.saveQueries(data.queries); }
      if (Array.isArray(data.collaborators)) { setCollaboratorsState(data.collaborators); StorageService.saveCollaborators(data.collaborators); }
    } finally { suspendSaveRef.current = false; }
  };

  // Licencia NUEVA: arranca DE CERO (sin catálogo/dietas/pedidos demo).
  const arrancarEnCero = (code: string, lic: any) => {
    suspendSaveRef.current = true;
    try {
      const limpio: TenantSettings = {
        ...tenantSettings,
        id: code,
        licenseKey: code,
        name: (lic && (lic.nombre_negocio || lic.cliente_nombre)) || 'Mi Dietética',
        subname: '',
        logoUrl: '', bannerUrl: '',
        phone: '', address: '', mapsUrl: '',
        announcementText: '',
        weeklyDiets: [], weeklyDietVisible: false,
      };
      setTenantSettingsState(limpio); StorageService.saveTenantSettings(limpio);
      setProductsState([]); StorageService.saveProducts([]);
      setDietsState([]); StorageService.saveDiets([]);
      setOrdersState([]); StorageService.saveOrders([]);
      setReviewsState([]); StorageService.saveReviews([]);
      setQueriesState([]); StorageService.saveQueries([]);
      setCollaboratorsState([]); StorageService.saveCollaborators([]);
    } finally { suspendSaveRef.current = false; }
  };

  // Cierre común del login: hidrata de la nube o arranca en cero, fija sesión.
  const finalizarLogin = async (role: 'inquilino' | 'colaborador', user: string, pass: string, code: string, lic: any) => {
    const remote = await cloud.cloudLoad(code);
    const tieneDatos = !!(remote && ((remote.products && remote.products.length) || remote.settings || (remote.diets && remote.diets.length) || (remote.orders && remote.orders.length)));
    if (tieneDatos) aplicarBlob(remote as cloud.CloudData);
    else if (remote && role === 'inquilino') arrancarEnCero(code, lic);
    else if (remote) aplicarBlob(remote as cloud.CloudData);
    cloudCodeRef.current = code;
    let userId = 'admin-1', userName = 'Inquilino Administrador';
    if (role === 'colaborador') {
      const found = StorageService.getCollaborators().find(c => c.username.toLowerCase() === user.trim().toLowerCase());
      userId = found ? found.id : `col-${code}-${user}`;
      userName = found ? found.name : user;
    }
    setSession({ isLoggedIn: true, role, userId, userName, username: user });
    if (rememberBio && bioAvail) {
      try { await biometria.registrar(code, user, role === 'inquilino' ? 'admin' : 'collaborator', role === 'colaborador' ? userId : undefined); } catch (e) { /* noop */ }
    }
  };

  // Paso 1: validar la licencia CONTRA LA NUBE.
  const verifyLicense = async (key: string): Promise<boolean> => {
    setAuthError(''); setAuthBusy(true);
    const code = key.trim().toUpperCase();
    const lic = await cloud.validarLicencia(code);
    setAuthBusy(false);
    if (!lic) { setAuthError('Licencia inválida, inactiva o vencida.'); return false; }
    pendingLicRef.current = { code, lic };
    try { localStorage.setItem('diet_last_license', code); } catch (e) { /* noop */ }
    return true;
  };

  const loginAsAdmin = async (username: string, password: string): Promise<boolean> => {
    const pl = pendingLicRef.current;
    if (!pl) { setAuthError('Primero validá la licencia.'); return false; }
    setAuthError(''); setAuthBusy(true);
    const r = await cloud.asegurarCuentaSeguraDueno(username.trim(), password, pl.code);
    if (!r.ok) { setAuthBusy(false); setAuthError(r.msg || 'No se pudo ingresar.'); return false; }
    await finalizarLogin('inquilino', username.trim(), password, pl.code, pl.lic);
    setAuthBusy(false);
    return true;
  };

  const loginAsCollaborator = async (username: string, password: string): Promise<boolean> => {
    const pl = pendingLicRef.current;
    if (!pl) { setAuthError('Primero validá la licencia.'); return false; }
    setAuthError(''); setAuthBusy(true);
    const r = await cloud.asegurarCuentaSeguraColab(username.trim(), password, pl.code);
    if (!r.ok) { setAuthBusy(false); setAuthError(r.msg || 'No se pudo ingresar.'); return false; }
    await finalizarLogin('colaborador', username.trim(), password, pl.code, pl.lic);
    setAuthBusy(false);
    return true;
  };

  const loginBiometric = async (): Promise<boolean> => {
    setAuthError(''); setAuthBusy(true);
    try {
      const meta = await biometria.desbloquear();
      if (!meta) { setAuthBusy(false); setAuthError('No se pudo verificar la biometría. Ingresá con tus datos.'); return false; }
      if (!cloud.estaLogueado()) { setAuthBusy(false); setAuthError('La sesión venció. Ingresá con licencia y contraseña una vez más.'); return false; }
      pendingLicRef.current = { code: meta.licenseCode, lic: null };
      await finalizarLogin(meta.role === 'admin' ? 'inquilino' : 'colaborador', meta.name || 'usuario', '', meta.licenseCode, null);
      setAuthBusy(false);
      return true;
    } catch (e) { setAuthBusy(false); setAuthError('Biometría cancelada o no disponible.'); return false; }
  };

  const logout = () => {
    setSession({
      isLoggedIn: false,
      role: null,
      userId: null,
      userName: null,
      username: null
    });
    cloudCodeRef.current = null;
    try { cloud.signOut(); } catch (e) { /* noop */ }
  };

  // ── Arranque: página pública por ?codigo o restaurar sesión admin ──────
  useEffect(() => {
    (async () => { try { setBioAvail(await biometria.soportada()); } catch (e) { /* noop */ } })();
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const codigo = (params.get('codigo') || params.get('tienda') || '').trim().toUpperCase();
      if (codigo) {
        cloudCodeRef.current = codigo; // en público lo usamos para el alta atómica
        const pub = await cloud.dietPublica(codigo);
        if (pub) aplicarBlob(pub as cloud.CloudData);
        return;
      }
      if (cloud.estaLogueado()) {
        try {
          const m = await cloud.miMembresia();
          if (m && m.tenant_id) {
            const remote = await cloud.cloudLoad(m.tenant_id);
            if (remote) aplicarBlob(remote as cloud.CloudData);
            cloudCodeRef.current = m.tenant_id;
            const role: 'inquilino' | 'colaborador' = m.rol === 'colab' ? 'colaborador' : 'inquilino';
            let userId = 'admin-1', userName = 'Inquilino Administrador';
            if (role === 'colaborador') {
              const found = StorageService.getCollaborators().find(c => c.username.toLowerCase() === (m.usuario || '').toLowerCase());
              userId = found ? found.id : `col-${m.tenant_id}`;
              userName = found ? found.name : (m.usuario || 'Colaborador');
            }
            setSession({ isLoggedIn: true, role, userId, userName, username: m.usuario });
          }
        } catch (e) { /* sin sesión válida */ }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Guardado NO destructivo a la nube (admin/colaborador logueado) ─────
  useEffect(() => {
    if (!session.isLoggedIn || !cloudCodeRef.current || suspendSaveRef.current) return;
    const code = cloudCodeRef.current;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const unir = (loc: any[], rem: any[]) => { const m = new Map<string, any>(); (rem || []).forEach(x => { if (x && x.id) m.set(x.id, x); }); (loc || []).forEach(x => { if (x && x.id) m.set(x.id, x); }); return Array.from(m.values()); };
        const remote = await cloud.cloudLoad(code);
        const mergedOrders = unir(orders, (remote && remote.orders) || []);
        const mergedReviews = unir(reviews, (remote && remote.reviews) || []);
        if (JSON.stringify(mergedOrders) !== JSON.stringify(orders)) { suspendSaveRef.current = true; setOrdersState(mergedOrders); StorageService.saveOrders(mergedOrders); suspendSaveRef.current = false; }
        if (JSON.stringify(mergedReviews) !== JSON.stringify(reviews)) { suspendSaveRef.current = true; setReviewsState(mergedReviews); StorageService.saveReviews(mergedReviews); suspendSaveRef.current = false; }
        await cloud.cloudSave(code, {
          settings: tenantSettings, products, diets,
          orders: mergedOrders, reviews: mergedReviews,
          queries, collaborators, categories: tenantSettings.categories,
        });
      } catch (e) { /* offline: queda local */ }
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, diets, orders, reviews, queries, collaborators, tenantSettings, session.isLoggedIn]);

  // ── Poll en vivo (admin): trae pedidos/reseñas nuevos del público ──────
  useEffect(() => {
    if (!session.isLoggedIn || !cloudCodeRef.current) return;
    const code = cloudCodeRef.current;
    let lastVer = '';
    let stop = false;
    const traer = async () => {
      const ver = await cloud.dietVersion(code);
      if (stop || !ver || ver === lastVer) return;
      lastVer = ver;
      const remote = await cloud.cloudLoad(code);
      if (!remote) return;
      const unir = (loc: any[], rem: any[]) => { const m = new Map<string, any>(); (rem || []).forEach(x => { if (x && x.id) m.set(x.id, x); }); (loc || []).forEach(x => { if (x && x.id) m.set(x.id, x); }); return Array.from(m.values()); };
      if (Array.isArray(remote.orders)) setOrdersState(prev => { const mg = unir(prev, remote.orders as any[]); return JSON.stringify(mg) === JSON.stringify(prev) ? prev : (StorageService.saveOrders(mg), mg); });
      if (Array.isArray(remote.reviews)) setReviewsState(prev => { const mg = unir(prev, remote.reviews as any[]); return JSON.stringify(mg) === JSON.stringify(prev) ? prev : (StorageService.saveReviews(mg), mg); });
    };
    const iv = setInterval(traer, 12000);
    let ultimo = 0;
    const thr = () => { const n = Date.now(); if (n - ultimo < 4000) return; ultimo = n; traer(); };
    const alVolver = () => { if (document.visibilityState === 'visible') thr(); };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', thr);
    window.addEventListener('pageshow', thr);
    document.addEventListener('touchstart', thr, { passive: true });
    return () => { stop = true; clearInterval(iv); document.removeEventListener('visibilitychange', alVolver); window.removeEventListener('focus', thr); window.removeEventListener('pageshow', thr); document.removeEventListener('touchstart', thr); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.isLoggedIn]);

  // Backup & Restore
  const createBackup = (label?: string) => {
    const updated = StorageService.createBackup(label || `Respaldo ${new Date().toLocaleDateString()}`);
    setBackupsState(updated);
  };

  const restoreBackup = (id: string): boolean => {
    const ok = StorageService.restoreBackup(id);
    if (ok) {
      setTenantSettingsState(StorageService.getTenantSettings());
      setProductsState(StorageService.getProducts());
      setReviewsState(StorageService.getReviews());
      setQueriesState(StorageService.getQueries());
      setCollaboratorsState(StorageService.getCollaborators());
      setOrdersState(StorageService.getOrders());
    }
    return ok;
  };

  // Export Sales & Reset
  const exportSalesSpreadsheet = () => {
    const visibleOrders = session.role === 'colaborador' 
      ? orders.filter(o => o.collaboratorId === session.userId)
      : orders;
    
    StorageService.exportSalesSpreadsheet(visibleOrders, `ventas_tu_dietetica_${Date.now()}.csv`);
    setCanClearSales(true); // Enable clear sales button after export!
  };

  const clearSales = () => {
    if (!canClearSales && orders.length > 0) return;
    if (session.role === 'colaborador') {
      const updated = orders.filter(o => o.collaboratorId !== session.userId);
      setOrdersState(updated);
      StorageService.saveOrders(updated);
    } else {
      setOrdersState([]);
      StorageService.saveOrders([]);
    }
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      tenantSettings,
      updateTenantSettings,
      products,
      categories: tenantSettings.categories,
      addCategory,
      removeCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      diets,
      addDiet,
      updateDiet,
      deleteDiet,
      toggleDietVisibility,
      activeDietId,
      setActiveDietId,
      orders,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      submitOrder,
      updateOrderStatus,
      deleteOrder,
      reviews,
      addReview,
      approveReview,
      deleteReview,
      queries,
      addQuery,
      resolveQuery,
      deleteQuery,
      collaborators,
      addCollaborator,
      updateCollaborator,
      deleteCollaborator,
      logoutCollaboratorRemote,
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
      backups,
      createBackup,
      restoreBackup,
      canClearSales,
      exportSalesSpreadsheet,
      clearSales,
      activeCategory,
      setActiveCategory,
      searchQuery,
      setSearchQuery,
      activeModal,
      setActiveModal,
      adminTab,
      setAdminTab,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
