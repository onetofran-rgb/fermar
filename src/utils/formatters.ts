import { format, parseISO, differenceInDays, subDays } from 'date-fns';
import type { Cliente, Compra } from '../types';
import { es } from 'date-fns/locale';

export function formatFecha(iso: string | null, fmt = 'dd/MM/yyyy'): string {
  if (!iso) return '-';
  try { return format(parseISO(iso), fmt, { locale: es }); } catch { return '-'; }
}

export function formatMoneda(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);
}

export function diasDesde(iso: string | null): number | null {
  if (!iso) return null;
  try { return differenceInDays(new Date(), parseISO(iso)); } catch { return null; }
}

export function generarId(prefijo: string): string {
  return `${prefijo}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const LABEL_TIPO_CLIENTE: Record<string, string> = {
  panadero: 'Panadero',
  supermercado: 'Supermercado',
  minorista: 'Minorista',
};

export const LABEL_ESTADO_CLIENTE: Record<string, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  prospecto: 'Prospecto',
};

export const LABEL_TIPO_INTERACCION: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  telefonico: 'Telefonico',
  visita_directa: 'Visita Directa',
};

export const LABEL_CANAL_ESTADO: Record<string, string> = {
  enviado: 'Enviado',
  respondido: 'Respondido',
  sin_respuesta: 'Sin Respuesta',
  programado: 'Programado',
};

export const LABEL_ESTADO_PAGO: Record<string, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  vencido: 'Vencido',
};

// ─── Score dinámico de cliente ────────────────────────────────────────────────
// Calcula un puntaje de 0-100 basado en historial de compras y comportamiento
const HOY_SCORE = new Date('2026-05-19');

export function calcularScoreCliente(cliente: Cliente, compras: Compra[]): number {
  const comprasCliente = compras.filter(c => c.cliente_id === cliente.id);

  // Base según estado
  let score = cliente.estado === 'activo' ? 40 : cliente.estado === 'prospecto' ? 20 : 10;

  // Puntos por compras recientes
  const hace30  = subDays(HOY_SCORE, 30);
  const hace90  = subDays(HOY_SCORE, 90);
  const hace180 = subDays(HOY_SCORE, 180);

  for (const c of comprasCliente) {
    try {
      const fecha = parseISO(c.fecha);
      if (fecha >= hace30)  { score += 8;  continue; }
      if (fecha >= hace90)  { score += 4;  continue; }
      if (fecha >= hace180) { score += 1; }
    } catch { /* fecha inválida — ignorar */ }
  }

  // Puntos por confiabilidad de pago
  const pagadas  = comprasCliente.filter(c => c.estado_pago === 'pagado').length;
  const vencidas = comprasCliente.filter(c => c.estado_pago === 'vencido').length;
  score += pagadas  * 3;
  score -= vencidas * 8;

  // Bonus por volumen: cada $50k facturado suma 2 puntos (máx 10)
  const totalFacturado = comprasCliente.reduce((s, c) => s + c.total, 0);
  score += Math.min(10, Math.floor(totalFacturado / 50000) * 2);

  return Math.min(100, Math.max(0, Math.round(score)));
}
