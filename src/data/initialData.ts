import { Product, CustomerReview, CustomerQuery, Collaborator, TenantSettings, Order, Diet } from '../types';

export const INITIAL_TENANT_SETTINGS: TenantSettings = {
  id: 'tenant-palermo',
  name: 'Tu Dietética - Soho NYC',
  subname: 'Alimentos Naturales & Orgánicos Seleccionados',
  logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1200&q=80',
  phone: '1149208392',
  phonePrefix: '+549',
  address: 'Av. Santa Fe 3421, Palermo, CABA',
  mapsUrl: 'https://maps.google.com/?q=Av.+Santa+Fe+3421+Palermo+Buenos+Aires',
  categories: ['Promo', 'Oferta', 'Frutos Secos', 'Harinas Integrales', 'Superalimentos', 'Aceites & Orgánicos', 'Infusiones'],
  publicTheme: 'new-york',
  panelTheme: 'oscuro',
  fontFamily: 'playfair',
  fontSize: 'normal',
  textColor: '#1c1917',
  accentColor: '#d97706',
  announcementText: '✨ Envío sin cargo en encargos superiores a $15.000 | Retiro express con tu código',
  footerQrText: 'Escaneá para acceder a nuestro catálogo digital y realizar tu encargo directo.',
  licenseKey: 'TD-PRO-2026-NY',
  enableDelivery: true,
  deliveryFee: 1200,
  deliveryNotes: 'Envíos a domicilio en CABA y alrededores. Gratis en encargos desde $15.000.',
  weeklyDietTitle: '🥦 Plan Nutricional & Dieta de la Semana',
  weeklyDietContent: '• Lunes: Desayuno con semillas de chía y fruta. Almuerzo ensalada completa con quinoa.\n• Martes: Arepas sin TACC con omelette de espinaca y queso port salut.\n• Miércoles: Guiso saludable de lentejas con vegetales de estación.\n• Jueves: Mix de frutos secos y tazón de yogurt natural con granola sin azúcar.\n• Viernes: Filet de pescado con vegetales al horno y semillas de sésamo tostadas.\n• Sábado & Domingo: Menú consciente libre e hidratación abundante (2L agua/día).',
  weeklyDietVisible: true,
  weeklyDiets: [
    {
      id: 'diet-item-1',
      title: '🥦 Plan Nutricional & Dieta de la Semana',
      content: '• Lunes: Desayuno con semillas de chía y fruta. Almuerzo ensalada completa con quinoa.\n• Martes: Arepas sin TACC con omelette de espinaca y queso port salut.\n• Miércoles: Guiso saludable de lentejas con vegetales de estación.\n• Jueves: Mix de frutos secos y tazón de yogurt natural con granola sin azúcar.\n• Viernes: Filet de pescado con vegetales al horno y semillas de sésamo tostadas.\n• Sábado & Domingo: Menú consciente libre e hidratación abundante (2L agua/día).'
    },
    {
      id: 'diet-item-2',
      title: '🫀 Dieta DASH (Hipertensión)',
      content: 'Dieta recomendada para controlar la hipertensión (DASH - Enfoques Dietéticos para Detener la Hipertensión):\n• Se centra en el consumo de frutas, verduras, cereales integrales y proteínas magras.\n• Limita el sodio/sal, las carnes rojas y los azúcares añadidos.\n• Incluye legumbres, semillas y lácteos descremados en raciones balanceadas.'
    }
  ]
};

export const INITIAL_DIETS: Diet[] = [
  {
    id: 'diet-1',
    name: 'Celíacos / Sin TACC',
    description: 'Alimentos 100% libres de gluten certificados para celíacos e intolerantes al trigo.',
    visiblePublic: true,
    badgeColor: 'amber',
    keywords: ['tacc', 'gluten', 'celiaco', 'celiacos']
  },
  {
    id: 'diet-2',
    name: 'Keto / Cetogénica',
    description: 'Baja en carbohidratos netos, rica en grasas saludables y harinas de frutos secos.',
    visiblePublic: true,
    badgeColor: 'emerald',
    keywords: ['keto', 'cetogenica', 'almendras', 'coco', 'nueces']
  },
  {
    id: 'diet-3',
    name: 'Vegano / Plant Based',
    description: '100% de origen vegetal sin ingredientes ni derivados de origen animal.',
    visiblePublic: true,
    badgeColor: 'green',
    keywords: ['vegano', 'plant', 'semillas', 'chia', 'lino', 'vegetal']
  },
  {
    id: 'diet-4',
    name: 'Diabéticos / Sin Azúcar',
    description: 'Bajo índice glucémico, sin azúcares refinados ni endulzantes calóricos.',
    visiblePublic: true,
    badgeColor: 'sky',
    keywords: ['azucar', 'diabetico', 'glucemico']
  },
  {
    id: 'diet-5',
    name: 'Hipertensión / Low Sodium',
    description: 'Sin sal agregada y selección especial con contenido de sodio reducido.',
    visiblePublic: true,
    badgeColor: 'rose',
    keywords: ['sodio', 'sal', 'hipertension']
  },
  {
    id: 'diet-6',
    name: 'Proteico & Fitness',
    description: 'Alto aporte proteico y fibra prebiótica para nutrición deportiva activa.',
    visiblePublic: true,
    badgeColor: 'purple',
    keywords: ['proteico', 'proteina', 'superalimentos', 'chía']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Almendras Nono Premium',
    description: 'Almendras tostadas sin sal, ricas en vitamina E, calcio y grasas saludables. Directo de exportación.',
    price: 4800,
    unit: '500g',
    category: 'Frutos Secos',
    images: [
      'https://images.unsplash.com/photo-1508061252966-dfd30f67ea55?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80'
    ],
    autoCarousel: true,
    isPromo: true,
    isOffer: false,
    customFields: [
      { id: 'f-1', name: 'Origen', value: 'Mendoza, Argentina' },
      { id: 'f-2', name: 'Certificación', value: 'Sin TACC / Gluten Free' }
    ]
  },
  {
    id: 'prod-2',
    name: 'Nueces Mariposa Extra Blancas',
    description: 'Nueces mariposa seleccionadas a mano. Ideales para granola, ensaladas o consumo directo.',
    price: 3900,
    unit: '250g',
    category: 'Frutos Secos',
    images: [
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80'
    ],
    autoCarousel: true,
    isPromo: false,
    isOffer: true,
    customFields: [
      { id: 'f-3', name: 'Conservación', value: 'Lugar fresco y seco' }
    ]
  },
  {
    id: 'prod-3',
    name: 'Harina de Almendras Orgánica',
    description: 'Harina 100% de almendra pelada fina. Especial para repostería keto, macarons y recetas saludables.',
    price: 6200,
    unit: '1 kg',
    category: 'Harinas Integrales',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80'
    ],
    autoCarousel: false,
    isPromo: true,
    isOffer: true
  },
  {
    id: 'prod-4',
    name: 'Semillas de Chía & Lino Mix Gold',
    description: 'Mezcla energizante de chía negra molienda fina y lino dorado. Aporta Omega 3 y fibra prebiótica.',
    price: 2100,
    unit: '500g',
    category: 'Superalimentos',
    images: [
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80'
    ],
    autoCarousel: true,
    isPromo: false,
    isOffer: false
  },
  {
    id: 'prod-5',
    name: 'Aceite de Coco Virgen Extra',
    description: 'Aceite prensado en frío, 100% puro. Apto para cocinar a altas temperaturas y cuidado personal.',
    price: 7500,
    unit: '500ml',
    category: 'Aceites & Orgánicos',
    images: [
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80'
    ],
    autoCarousel: true,
    isPromo: true,
    isOffer: false,
    customFields: [
      { id: 'f-4', name: 'Prensado', value: 'En frío primera extracción' }
    ]
  },
  {
    id: 'prod-6',
    name: 'Miel Orgánica de Pradera Multifloral',
    description: 'Miel pura de abejas no pasteurizada. Cosecha sustentable de pequeñas granjas apícolas.',
    price: 3400,
    unit: '1 kg',
    category: 'Aceites & Orgánicos',
    images: [
      'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800&q=80'
    ],
    autoCarousel: true,
    isPromo: false,
    isOffer: true
  }
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Valeria R.',
    rating: 5,
    comment: '¡Excelente calidad de los frutos secos! Hice el encargo por la web y en 10 min retiré con mi código en el local.',
    date: '2026-07-28',
    approved: true
  },
  {
    id: 'rev-2',
    author: 'Martín G.',
    rating: 5,
    comment: 'La mejor harina de almendras de la zona. Muy buena atención y rápido sistema de retiro con código.',
    date: '2026-07-27',
    approved: true
  },
  {
    id: 'rev-3',
    author: 'Sofía M.',
    rating: 4,
    comment: 'Hermosa la tienda y los productos súper frescos. Recomiendo la miel orgánica.',
    date: '2026-07-25',
    approved: false
  }
];

export const INITIAL_QUERIES: CustomerQuery[] = [
  {
    id: 'q-1',
    name: 'Lucía Fernández',
    phone: '1158392019',
    query: '¿Tienen harina de garbanzo certificada sin TACC para la semana que viene?',
    date: '2026-07-29',
    resolved: false
  },
  {
    id: 'q-2',
    name: 'Gonzalo Pérez',
    phone: '1148291044',
    query: 'Buenas tardes, ¿tienen stock de aceite de coco en presentación de 1 litro?',
    date: '2026-07-28',
    resolved: true
  }
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'col-1',
    name: 'Facundo Gómez',
    phone: '1138472910',
    username: 'facundo',
    passwordHash: 'colab123',
    activeSession: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'col-2',
    name: 'Camila Rossi',
    phone: '1169204812',
    username: 'camila',
    passwordHash: 'colab123',
    activeSession: true,
    createdAt: '2026-03-10'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    pickupCode: '#TD-9842',
    customerName: 'Mariana López',
    customerPhone: '1149201938',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 2 },
      { product: INITIAL_PRODUCTS[4], quantity: 1 }
    ],
    totalPrice: 17100,
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    collaboratorId: 'col-1',
    collaboratorName: 'Facundo Gómez',
    status: 'entregado',
    tenantId: 'tenant-palermo'
  },
  {
    id: 'ord-102',
    pickupCode: '#TD-4721',
    customerName: 'Santiago Rossi',
    customerPhone: '1162948102',
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 1 },
      { product: INITIAL_PRODUCTS[3], quantity: 2 }
    ],
    totalPrice: 8100,
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    collaboratorId: 'col-2',
    collaboratorName: 'Camila Rossi',
    status: 'pendiente',
    tenantId: 'tenant-palermo'
  }
];
