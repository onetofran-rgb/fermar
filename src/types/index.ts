// ─── ENUMERACIONES ───────────────────────────────────────────────────────────

export type UnidadNegocio = 'UN1' | 'UN2' | 'UN3' | 'todas';
export type TipoCliente = 'panadero' | 'supermercado' | 'minorista';
export type EstadoCliente = 'activo' | 'inactivo' | 'prospecto';
export type TipoInteraccion = 'email' | 'whatsapp' | 'telefonico' | 'visita_directa';
export type CanalEstado = 'enviado' | 'respondido' | 'sin_respuesta' | 'programado';
export type EstadoPago = 'pagado' | 'pendiente' | 'vencido';
export type TipoPlantilla = 'seguimiento' | 'oferta' | 'cobranza' | 'bienvenida';
export type TemaUI = 'light' | 'dark';

// ─── CLIENTE ─────────────────────────────────────────────────────────────────

export interface Contacto {
  nombre: string;
  telefono: string;
  email: string;
  whatsapp: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  unidad_negocio: UnidadNegocio;
  contacto: Contacto;
  direccion: string;
  ciudad: string;
  zona: string;
  estado: EstadoCliente;
  fecha_alta: string;
  ultima_compra: string | null;
  proximo_contacto: string | null;
  notas_internas: string;
  score_cliente: number;
}

// ─── INTERACCIÓN ─────────────────────────────────────────────────────────────

export interface Adjunto {
  nombre: string;
  tipo: string;
  tamaño_kb: number;
}

export interface Interaccion {
  id: string;
  cliente_id: string;
  fecha: string;
  tipo: TipoInteraccion;
  canal_estado: CanalEstado;
  asunto: string;
  contenido: string;
  resultado: string;
  proxima_accion: string;
  adjuntos: Adjunto[];
}

// ─── COMPRA ──────────────────────────────────────────────────────────────────

export interface ItemCompra {
  producto_id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
}

export interface Compra {
  id: string;
  cliente_id: string;
  fecha: string;
  productos: ItemCompra[];
  total: number;
  estado_pago: EstadoPago;
  notas: string;
}

// ─── PRODUCCIÓN ──────────────────────────────────────────────────────────────

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  stock_actual: number;
  capacidad_produccion_diaria: number;
  unidad_medida: string;
  costo_unitario: number;
  precio_venta: number;
  tiempo_produccion_hs: number;
}

export interface ProyeccionDia {
  fecha: string;
  stock_proyectado: number;
  demanda_proyectada: number;
  alerta: boolean;
}

export interface PrevisibilidadProducto {
  producto_id: string;
  proyeccion_7d: ProyeccionDia[];
  proyeccion_14d: ProyeccionDia[];
  proyeccion_30d: ProyeccionDia[];
}

// ─── CALENDARIO ──────────────────────────────────────────────────────────────

export interface Evento {
  id: string;
  cliente_id: string;
  fecha: string;
  tipo: TipoInteraccion;
  responsable: string;
  notas: string;
  completado: boolean;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export interface ConfigFirma {
  nombre: string;
  cargo: string;
  empresa: string;
  telefono: string;
  email: string;
}

export interface UIState {
  tema: TemaUI;
  unidad_activa: UnidadNegocio;
  firma: ConfigFirma;
}

// ─── REPORTES ────────────────────────────────────────────────────────────────

export interface KPIData {
  clientes_activos: number;
  clientes_por_un: Record<string, number>;
  contactos_hoy: number;
  contactos_semana: number;
  ventas_mes_actual: number;
  ventas_mes_anterior: number;
  alertas_stock: number;
}

// ─── MENSAJERÍA ──────────────────────────────────────────────────────────────

export interface PlantillaEmail {
  tipo: TipoPlantilla;
  asunto: string;
  cuerpo: string;
}

export interface MensajeGenerado {
  asunto: string;
  cuerpo_html: string;
  cuerpo_texto: string;
  destinatario_email: string;
  destinatario_wa: string;
}
