export type Language = 'es' | 'en';

export type PublicThemeStyle = 'new-york' | 'eco-green' | 'minimal-modern';

export type PanelThemeTone = 'claro' | 'medio' | 'oscuro';

export interface CustomField {
  id: string;
  name: string;
  value: string;
}

export interface Diet {
  id: string;
  name: string;
  description: string;
  visiblePublic: boolean;
  badgeColor?: string; // 'amber' | 'emerald' | 'green' | 'sky' | 'rose' | 'purple'
  keywords?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g., 'kg', 'litros', '100g', 'unidad'
  category: string;
  images: string[]; // up to 5 images
  autoCarousel: boolean;
  isPromo: boolean;
  isOffer: boolean;
  customFields?: CustomField[];
  stock?: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string; // Order ID
  pickupCode: string; // e.g. #TD-9482
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  date: string; // ISO String
  collaboratorId?: string; // assigned collaborator if delivered by staff
  collaboratorName?: string;
  status: 'pendiente' | 'entregado' | 'cancelado';
  tenantId: string;
  deliveryType?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryFee?: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  approved: boolean; // Must be approved by admin to appear publicly
}

export interface CustomerQuery {
  id: string;
  name: string;
  phone: string;
  query: string;
  date: string;
  resolved: boolean;
}

export interface Collaborator {
  id: string;
  name: string;
  phone: string;
  username: string;
  passwordHash: string;
  activeSession: boolean;
  createdAt: string;
}

export interface BackupData {
  id: string;
  timestamp: string;
  label: string;
  tenantData: Record<string, any>;
}

export interface WeeklyDietItem {
  id: string;
  title: string;
  content: string;
}

export interface TenantSettings {
  id: string;
  name: string;
  subname: string;
  logoUrl: string;
  bannerUrl: string;
  phone: string; // e.g. +5491112345678
  phonePrefix: string; // e.g. +549
  address: string;
  mapsUrl: string;
  categories: string[];
  publicTheme: PublicThemeStyle;
  panelTheme: PanelThemeTone;
  fontFamily: 'playfair' | 'jakarta' | 'space';
  fontSize: 'normal' | 'large' | 'compact';
  textColor: string;
  accentColor: string;
  announcementText: string;
  footerQrText: string;
  licenseKey: string;
  enableDelivery?: boolean;
  deliveryFee?: number;
  deliveryNotes?: string;
  weeklyDietTitle?: string;
  weeklyDietContent?: string;
  weeklyDietVisible?: boolean;
  weeklyDiets?: WeeklyDietItem[];
}

export interface UserSession {
  isLoggedIn: boolean;
  role: 'inquilino' | 'colaborador' | null;
  userId: string | null;
  userName: string | null;
  username: string | null;
}
