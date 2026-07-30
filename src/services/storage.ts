import {
  Product,
  CustomerReview,
  CustomerQuery,
  Collaborator,
  TenantSettings,
  Order,
  BackupData,
  UserSession,
  Diet
} from '../types';
import {
  INITIAL_TENANT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_QUERIES,
  INITIAL_COLLABORATORS,
  INITIAL_ORDERS,
  INITIAL_DIETS
} from '../data/initialData';

const STORAGE_KEYS = {
  TENANT_SETTINGS: 'td_tenant_settings_v1',
  PRODUCTS: 'td_products_v1',
  REVIEWS: 'td_reviews_v1',
  QUERIES: 'td_queries_v1',
  COLLABORATORS: 'td_collaborators_v1',
  ORDERS: 'td_orders_v1',
  DIETS: 'td_diets_v1',
  BACKUPS: 'td_backups_v1',
  TENANTS_LIST: 'td_tenants_list_v1',
  ACTIVE_TENANT_ID: 'td_active_tenant_id_v1',
};

// Helper to save/load JSON safely
export const loadLocal = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}`, e);
    return fallback;
  }
};

export const saveLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}`, e);
  }
};

// Storage Service API
export const StorageService = {
  // Tenant Settings
  getTenantSettings: (): TenantSettings => {
    return loadLocal<TenantSettings>(STORAGE_KEYS.TENANT_SETTINGS, INITIAL_TENANT_SETTINGS);
  },
  saveTenantSettings: (settings: TenantSettings): void => {
    saveLocal(STORAGE_KEYS.TENANT_SETTINGS, settings);
  },

  // Products
  getProducts: (): Product[] => {
    return loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProducts: (products: Product[]): void => {
    saveLocal(STORAGE_KEYS.PRODUCTS, products);
  },

  // Reviews
  getReviews: (): CustomerReview[] => {
    return loadLocal<CustomerReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  saveReviews: (reviews: CustomerReview[]): void => {
    saveLocal(STORAGE_KEYS.REVIEWS, reviews);
  },

  // Queries
  getQueries: (): CustomerQuery[] => {
    return loadLocal<CustomerQuery[]>(STORAGE_KEYS.QUERIES, INITIAL_QUERIES);
  },
  saveQueries: (queries: CustomerQuery[]): void => {
    saveLocal(STORAGE_KEYS.QUERIES, queries);
  },

  // Collaborators
  getCollaborators: (): Collaborator[] => {
    return loadLocal<Collaborator[]>(STORAGE_KEYS.COLLABORATORS, INITIAL_COLLABORATORS);
  },
  saveCollaborators: (collaborators: Collaborator[]): void => {
    saveLocal(STORAGE_KEYS.COLLABORATORS, collaborators);
  },

  // Orders
  getOrders: (): Order[] => {
    return loadLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  saveOrders: (orders: Order[]): void => {
    saveLocal(STORAGE_KEYS.ORDERS, orders);
  },

  // Diets
  getDiets: (): Diet[] => {
    return loadLocal<Diet[]>(STORAGE_KEYS.DIETS, INITIAL_DIETS);
  },
  saveDiets: (diets: Diet[]): void => {
    saveLocal(STORAGE_KEYS.DIETS, diets);
  },

  // Backups (Max 3 visible copias - FIFO ring buffer)
  getBackups: (): BackupData[] => {
    return loadLocal<BackupData[]>(STORAGE_KEYS.BACKUPS, []);
  },
  createBackup: (label: string): BackupData[] => {
    const existing = StorageService.getBackups();
    const currentData = {
      settings: StorageService.getTenantSettings(),
      products: StorageService.getProducts(),
      reviews: StorageService.getReviews(),
      queries: StorageService.getQueries(),
      collaborators: StorageService.getCollaborators(),
      orders: StorageService.getOrders(),
    };

    const newBackup: BackupData = {
      id: `bkp-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      label: label || `Copia ${existing.length + 1}`,
      tenantData: currentData,
    };

    let updated = [newBackup, ...existing];
    // Keep max 3 backups ("hasta 3 copias, la última queda y la primera sale")
    if (updated.length > 3) {
      updated = updated.slice(0, 3);
    }

    saveLocal(STORAGE_KEYS.BACKUPS, updated);
    return updated;
  },
  restoreBackup: (backupId: string): boolean => {
    const backups = StorageService.getBackups();
    const target = backups.find(b => b.id === backupId);
    if (!target || !target.tenantData) return false;

    if (target.tenantData.settings) StorageService.saveTenantSettings(target.tenantData.settings);
    if (target.tenantData.products) StorageService.saveProducts(target.tenantData.products);
    if (target.tenantData.reviews) StorageService.saveReviews(target.tenantData.reviews);
    if (target.tenantData.queries) StorageService.saveQueries(target.tenantData.queries);
    if (target.tenantData.collaborators) StorageService.saveCollaborators(target.tenantData.collaborators);
    if (target.tenantData.orders) StorageService.saveOrders(target.tenantData.orders);

    return true;
  },

  // Export Sales Spreadsheet (CSV with BOM for Excel)
  exportSalesSpreadsheet: (orders: Order[], filename: string = 'ventas_tu_dietetica.csv'): void => {
    const headers = ['Código Retiro', 'Cliente', 'Teléfono', 'Detalle Productos', 'Total ($)', 'Fecha y Hora', 'Atendido Por', 'Estado'];
    
    const rows = orders.map(ord => {
      const productDetails = ord.items
        .map(i => `${i.quantity}x ${i.product.name} ($${i.product.price})`)
        .join(' | ');
      
      const formattedDate = new Date(ord.date).toLocaleString('es-AR');
      
      return [
        `"${ord.pickupCode}"`,
        `"${ord.customerName.replace(/"/g, '""')}"`,
        `"${ord.customerPhone}"`,
        `"${productDetails.replace(/"/g, '""')}"`,
        ord.totalPrice,
        `"${formattedDate}"`,
        `"${(ord.collaboratorName || 'Inquilino Admin').replace(/"/g, '""')}"`,
        `"${ord.status}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
