import { format, parseISO, differenceInDays } from 'date-fns';
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
