/**
 * cloud.ts - Capa de nube (Supabase) para CyC Tu Dietética.
 * Molde del ecosistema CyC: base compartida + Auth real + RLS por membresia.
 * Reutiliza validar_licencia / reclamar_tienda / tl_miembros y las funciones
 * propias de esta app (diet_*). Prefijo de datos: DIET. Tabla: diet_backups.
 */

export const SB_URL = 'https://pcxlhgdpxfuybzfsquem.supabase.co';
export const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGxoZ2RweGZ1eWJ6ZnNxdWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDIyOTQsImV4cCI6MjA5NjE3ODI5NH0.HJWpFO8TkRsmUx15GtSsUusjvVEhUsi5b_QGoPoPU00';

const SESS_KEY = 'diet_sb_sess';
const MAIL_DOM = '@tiendalibre.app'; // namespace interno compartido de Auth

export interface CloudData {
  settings?: any;
  products?: any[];
  diets?: any[];
  orders?: any[];
  reviews?: any[];
  queries?: any[];
  collaborators?: any[];
  categories?: string[];
}

interface SbSession {
  access_token: string;
  refresh_token: string;
  user_id: string | null;
  expira: number;
}

// -- Helpers de email/sesion --
export function emailDe(usuario: string, codigo: string): string {
  const base = ((usuario || '') + '.' + (codigo || '')).toLowerCase().replace(/[^a-z0-9.]/g, '');
  return base + MAIL_DOM;
}
function sessGet(): SbSession | null {
  try { return JSON.parse(localStorage.getItem(SESS_KEY) || 'null'); } catch (e) { return null; }
}
function sessSet(s: SbSession | null) {
  if (s) localStorage.setItem(SESS_KEY, JSON.stringify(s)); else localStorage.removeItem(SESS_KEY);
}
export function estaLogueado(): boolean { return !!sessGet(); }
export function authUserId(): string | null { const s = sessGet(); return s ? s.user_id : null; }

function guardarSesion(d: any): SbSession | null {
  if (!d || !d.access_token) return null;
  const s: SbSession = {
    access_token: d.access_token,
    refresh_token: d.refresh_token || '',
    user_id: (d.user && d.user.id) || d.user_id || null,
    expira: Date.now() + ((d.expires_in || 3600) * 1000) - 60000,
  };
  sessSet(s);
  return s;
}

async function authPost(path: string, body: any) {
  const res = await fetch(SB_URL + path, {
    method: 'POST',
    headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const txt = await res.text();
  let data: any = null;
  try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = { raw: txt }; }
  return { ok: res.ok, status: res.status, data };
}

async function signUp(email: string, password: string): Promise<SbSession | null> {
  const r = await authPost('/auth/v1/signup', { email, password });
  if (r.ok && r.data && r.data.access_token) return guardarSesion(r.data);
  return null;
}
async function signIn(email: string, password: string): Promise<SbSession | null> {
  const r = await authPost('/auth/v1/token?grant_type=password', { email, password });
  if (r.ok && r.data && r.data.access_token) return guardarSesion(r.data);
  return null;
}
/**
 * Renueva la sesión CON CANDADO.
 *
 * Supabase cambia el refresh_token cada vez que se usa. Sin candado, dos
 * renovaciones al mismo tiempo (el sondeo + el guardado, o dos pestañas, o el
 * navegador y la app instalada) hacían que la segunda llegara con un token ya
 * gastado: la sesión se moría sola y el panel dejaba de sincronizar sin avisar.
 */
let refrescando: Promise<SbSession | null> | null = null;
const LOCK_KEY = 'diet_sb_refresh';
async function refresh(): Promise<SbSession | null> {
  if (refrescando) return refrescando;
  refrescando = (async () => {
    const s = sessGet(); if (!s || !s.refresh_token) return null;
    try {
      const otra = Number(localStorage.getItem(LOCK_KEY) || 0);
      if (Date.now() - otra < 4000) {
        await new Promise((r) => setTimeout(r, 1600));
        const nueva = sessGet();
        if (nueva && nueva.refresh_token && nueva.refresh_token !== s.refresh_token) return nueva;
      }
      localStorage.setItem(LOCK_KEY, String(Date.now()));
    } catch (e) { /* modo privado */ }
    const r = await authPost('/auth/v1/token?grant_type=refresh_token', { refresh_token: sessGet()?.refresh_token || s.refresh_token });
    if (r.ok && r.data && r.data.access_token) return guardarSesion(r.data);
    return null;
  })();
  try { return await refrescando; }
  finally { setTimeout(() => { refrescando = null; }, 1500); }
}

/**
 * Renueva la sesión ANTES de que venza. El token dura una hora: sin esto, el
 * panel quedaba abierto, se vencía, y de golpe dejaba de sincronizar o volvía
 * a pedir la contraseña. Conviene llamarlo cada tanto y al volver a la app.
 */
export async function mantenerSesionViva(): Promise<boolean> {
  const s = sessGet();
  if (!s) return false;
  if (((s.expira || 0) - Date.now()) > 15 * 60 * 1000) return true;
  return !!(await refresh());
}
export async function authToken(): Promise<string | null> {
  const s = sessGet(); if (!s) return null;
  if (Date.now() < (s.expira || 0)) return s.access_token;
  const ns = await refresh();
  return ns ? ns.access_token : null;
}
export function signOut() { sessSet(null); olvidarCache(); }

export async function signOutGlobal() {
  try {
    const tok = await authToken();
    if (tok) {
      // scope=local: cierra la sesión SOLO en este dispositivo. Con `global` se
      // revocaba en TODOS, así que salir en la PC le mataba la sesión del
      // celular en silencio: el otro panel seguía abierto pero ya no leía nada.
      await fetch(`${SB_URL}/auth/v1/logout?scope=local`, {
        method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + tok },
      });
    }
  } catch (e) { /* noop */ }
  signOut();
}

// -- RPC --
async function rpc(fn: string, body: any, conAuth = true): Promise<any> {
  const tok = conAuth ? await authToken() : null;
  const res = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + (tok || SB_KEY), 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(txt || ('rpc ' + fn + ' ' + res.status));
  try { return txt ? JSON.parse(txt) : null; } catch (e) { return txt; }
}

// -- Licencia (validar_licencia es idempotente: activa + devuelve la fila) --
export async function validarLicencia(codigo: string): Promise<any | null> {
  try {
    const d = await rpc('validar_licencia', { p_codigo: codigo }, false);
    if (!d || typeof d !== 'object' || !d.codigo) return null;
    if (d.activa === false) return null;
    if (d.fecha_vencimiento && new Date(d.fecha_vencimiento) < new Date()) return null;
    return d;
  } catch (e) { return null; }
}

// -- Cuentas seguras --
export async function asegurarCuentaSeguraDueno(usuario: string, password: string, codigo: string) {
  if (!usuario || !password || !codigo) return { ok: false, msg: 'Faltan datos' };
  const email = emailDe(usuario, codigo);
  let sess = await signIn(email, password);
  if (!sess) {
    await signUp(email, password);
    sess = await signIn(email, password);
  }
  if (!sess) return { ok: false, msg: 'No se pudo crear la cuenta segura (la contrasena debe tener 6+ caracteres).' };
  try { await rpc('sincronizar_clave_dueno', { p_codigo: codigo, p_usuario: usuario, p_pass: password }, false); } catch (e) { /* noop */ }
  try { await rpc('reclamar_tienda', { p_codigo: codigo, p_usuario: usuario }); }
  catch (e: any) { return { ok: false, msg: 'Cuenta creada, pero no se pudo vincular: ' + (e.message || e) }; }
  return { ok: true };
}

export async function asegurarCuentaSeguraColab(usuario: string, password: string, codigo: string) {
  if (!usuario || !password || !codigo) return { ok: false, msg: 'Faltan datos' };
  // La comprobación contra el listado del local va SIEMPRE PRIMERO, no solo
  // cuando falla el inicio de sesión. Antes, a un colaborador dado de baja le
  // quedaba viva la cuenta y entraba igual: el inicio de sesión funcionaba y
  // nadie volvía a mirar si seguía en el listado.
  let habilitado = false;
  try {
    const r: any = await rpc('diet_verificar_colab', { p_codigo: codigo, p_usuario: usuario, p_pass: password }, false);
    habilitado = !!(r === true || (r && r.ok === true));
  } catch (e) { habilitado = false; }
  if (!habilitado) {
    return { ok: false, msg: 'Usuario o contraseña de colaborador incorrectos, o tu acceso fue dado de baja.' };
  }

  const email = emailDe(usuario, codigo);
  let sess = await signIn(email, password);
  if (!sess) { await signUp(email, password); sess = await signIn(email, password); }
  if (!sess) return { ok: false, msg: 'No se pudo crear la cuenta del colaborador (la clave debe tener 6+ caracteres).' };
  // La contraseña viaja también al unir: ahora la comprueba la función del
  // servidor. Sin esto, cualquiera con el código de la licencia (que va adentro
  // del QR) podía anotarse como colaborador de un local ajeno y leerle —y
  // pisarle— todos los datos.
  try { await rpc('diet_unir_colab', { p_codigo: codigo, p_usuario: usuario, p_pass: password }); }
  catch (e: any) { return { ok: false, msg: 'No se pudo unir: ' + (e.message || e) }; }
  return { ok: true };
}

/** Da de baja el acceso de un colaborador: le saca la MEMBRESÍA, no solo el
 *  usuario del listado. Su cuenta seguía viva y desde el teléfono donde ya
 *  había entrado seguía leyendo y escribiendo los datos del local. */
export async function dietBajaColab(codigo: string, usuario: string): Promise<boolean> {
  if (!codigo || !usuario) return false;
  try { const r = await rpc('diet_baja_colab', { p_codigo: codigo, p_usuario: usuario }); return !!(r && r.ok); }
  catch (e) { return false; }
}

export async function miMembresia(): Promise<{ tenant_id: string; rol: string; usuario: string } | null> {
  const tok = await authToken(); if (!tok) return null;
  const uid = authUserId(); if (!uid) return null;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/tl_miembros?select=tenant_id,rol,usuario&user_id=eq.${uid}`,
      { cache: 'no-store', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + tok } });
    const rows = r.ok ? await r.json() : [];
    return (rows && rows.length) ? rows[0] : null;
  } catch (e) { return null; }
}

// -- Sync de datos del local (tabla diet_backups, RLS por membresia) --
/**
 * Baja los datos del local.
 *
 * `null` = NO SE PUDO LEER (sin sesión, sin señal, permiso denegado).
 * `{}`   = se leyó bien y está GENUINAMENTE vacío (licencia nueva).
 *
 * OJO, que acá estuvo el problema que en Boutique borró un catálogo entero:
 * antes, sin sesión, la consulta salía igual con la clave ANÓNIMA. La regla de
 * seguridad respondía `[]` con status 200 y esto devolvía `{}`. La app lo tomaba
 * como "local vacío", sembraba todo en cero y el autoguardado subía ese vacío.
 * Ahora sin sesión no se pregunta, y cero filas se confirma contra
 * diet_version (que se puede leer sin permisos): si hay fecha, la fila EXISTE
 * y lo que falló fue el permiso.
 */
async function cloudLoadDirecto(codigo: string): Promise<CloudData | null> {
  diag.ultimoIntento = Date.now();
  let tok = await authToken();
  if (!tok) { await refresh(); tok = await authToken(); }
  diag.tokenVivo = !!tok;
  if (!tok) { diag.ultimoError = 'sin sesión'; return null; }
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/diet_backups?tenant_id=eq.${encodeURIComponent(codigo)}&select=datos&limit=1`,
      { cache: 'no-store', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + tok } });
    if (!res.ok) { diag.ultimoError = 'HTTP ' + res.status; return null; }
    const rows = await res.json();
    if (!Array.isArray(rows)) { diag.ultimoError = 'respuesta rara'; return null; }

    if (!rows.length) {
      let v = '';
      try { v = await dietVersion(codigo); } catch (e) { v = ''; }
      if (v) { diag.ultimoError = 'sin permiso sobre este local'; return null; }
      diag.ultimaLectura = Date.now(); diag.ultimoError = '';
      return {};
    }

    diag.ultimaLectura = Date.now(); diag.ultimoError = '';
    return (rows[0].datos || {}) as CloudData;
  } catch (e) { diag.ultimoError = 'sin conexión'; return null; }
}

/* ══════════════════════════════════════════════════════════════════════
   AHORRO DE CONSUMO (egress de Supabase)

   El respaldo de un local puede pesar varios MEGABYTES, porque las fotos
   viajan adentro. Y ANTES de cada guardado la app lo baja entero para no
   pisar los pedidos que entraron desde la página pública.

   O sea que el dueño editando 20 productos seguidos bajaba 20 veces el
   respaldo completo. Con un respaldo de 6 MB, eso es más de 100 MB en una
   sola tarde de trabajo — y el plan gratis da 5 GB por mes para TODAS las
   apps juntas.

   Lo que hacemos acá: guardamos en memoria lo último que bajamos junto con
   la FECHA de ese momento. Antes de bajar de nuevo preguntamos la fecha
   (dietVersion, que son unos pocos bytes). Si es la misma, devolvemos la copia
   que ya teníamos y NO se baja nada.

   Si algo cambió —el mismo dueño desde otro dispositivo, un pedido nuevo
   del público, un colaborador— la fecha es distinta y se baja igual que
   siempre. Nunca se trabaja con datos viejos.

   Si la función de fecha no existe en la base, esto queda desactivado solo
   y todo funciona como antes.
   ══════════════════════════════════════════════════════════════════════ */
let _memCod = '';
let _memVer = '';
let _memDatos: CloudData | null = null;

/** Borra la copia en memoria (por ejemplo al cerrar sesión). */
export function olvidarCache() { _memCod = ''; _memVer = ''; _memDatos = null; }

export async function cloudLoad(codigo: string): Promise<CloudData | null> {
  let v = '';
  try { v = await dietVersion(codigo); } catch (e) { v = ''; }
  const sirve = !!(v && v !== '__unknown__');
  if (sirve && codigo === _memCod && v === _memVer && _memDatos) {
    diag.ultimaLectura = Date.now(); diag.ultimoError = '';
    // Copia superficial: si la app tocara el objeto, no ensucia lo guardado.
    return { ..._memDatos };
  }
  const d = await cloudLoadDirecto(codigo);
  if (d !== null) { _memCod = codigo; _memVer = sirve ? v : ''; _memDatos = { ...d }; }
  return d;
}


/** Últimos datos del sondeo, para poder ver qué está pasando sin adivinar. */
export const diag = {
  ultimaLectura: 0 as number,
  ultimoIntento: 0 as number,
  ultimoError: '' as string,
  tokenVivo: false as boolean,
};

/** ¿La sesión de nube sigue viva? */
export async function sesionViva(): Promise<boolean> { return !!(await authToken()); }

export async function cloudSave(codigo: string, datos: CloudData): Promise<boolean> {
  const body = JSON.stringify({ tenant_id: codigo, datos, updated_at: new Date().toISOString() });
  const enviar = async (tok: string) => fetch(`${SB_URL}/rest/v1/diet_backups`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY, Authorization: 'Bearer ' + tok,
      'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates',
    },
    body,
  });
  try {
    const tok = await authToken();
    if (!tok) return false; // sin sesión no se guarda (ver comentario en cloudLoad)
    let res = await enviar(tok);
    if (res.status === 401 || res.status === 403) {
      const ns = await refresh();
      if (ns && ns.access_token) res = await enviar(ns.access_token);
    }
    const _guardo = res.ok;
    // Guardamos en memoria lo que acabamos de subir junto con su fecha
    // nueva: así el próximo guardado no tiene que volver a bajarlo.
    if (_guardo) {
      _memCod = codigo; _memDatos = datos;
      try { const nv = await dietVersion(codigo); _memVer = (nv && nv !== '__unknown__') ? nv : ''; }
      catch (e) { _memVer = ''; }
    }
    return _guardo;
  } catch (e) { return false; }
}

// -- Publico (catalogo + reseñas aprobadas) y alta de pedido/reseña sin login --
export async function dietPublica(codigo: string): Promise<CloudData | null> {
  try { return await rpc('diet_publica', { p_codigo: codigo }, false) as CloudData; }
  catch (e) { return null; }
}

export async function dietAgregarPedido(codigo: string, pedido: any): Promise<void> {
  try { await rpc('diet_agregar_pedido', { p_codigo: codigo, p_pedido: pedido }, false); }
  catch (e) { /* noop */ }
}

export async function dietAgregarResena(codigo: string, resena: any): Promise<void> {
  try { await rpc('diet_agregar_resena', { p_codigo: codigo, p_resena: resena }, false); }
  catch (e) { /* noop */ }
}

// -- Cambio de contraseña real del dueño (estando logueado) --
export async function cambiarPasswordDueno(codigo: string, newPassword: string): Promise<{ ok: boolean; msg?: string }> {
  if (!newPassword || newPassword.length < 6) return { ok: false, msg: 'La contraseña debe tener 6+ caracteres.' };
  const tok = await authToken();
  if (!tok) return { ok: false, msg: 'La sesión venció. Salí y volvé a entrar antes de cambiarla.' };
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    if (!res.ok) { const t = await res.text(); return { ok: false, msg: 'No se pudo cambiar: ' + t }; }
    try {
      const m = await miMembresia();
      if (m && m.usuario) await rpc('sincronizar_clave_dueno', { p_codigo: codigo, p_usuario: m.usuario, p_pass: newPassword }, false);
    } catch (e) { /* noop */ }
    return { ok: true };
  } catch (e: any) { return { ok: false, msg: e.message || 'Error de red' }; }
}

// Optimización de egress: solo el timestamp para saber si cambió.
// '__unknown__' si la función falta/errora → el poll no se bloquea.
export async function dietVersion(codigo: string): Promise<string> {
  try { const r = await rpc('diet_version', { p_codigo: codigo }, false); return typeof r === 'string' ? r : String(r || ''); }
  catch (e) { return '__unknown__'; }
}

// Lista SEGURA de colaboradores de una licencia (sin contraseñas).
export async function dietListaColab(codigo: string): Promise<any[]> {
  try { const r = await rpc('diet_lista_colab', { p_codigo: codigo }, false); return Array.isArray(r) ? r : []; }
  catch (e) { return []; }
}
