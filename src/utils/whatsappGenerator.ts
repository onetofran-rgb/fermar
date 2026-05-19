import type { Cliente } from '../types';
import type { ConfigFirma } from '../types';

export function generarMensajeWA(cliente: Cliente, firma: ConfigFirma, tipo: string): string {
  const plantillas: Record<string, string> = {
    seguimiento: `Hola ${cliente.contacto.nombre}! Te contactamos desde ${firma.empresa}. Queriamos saber como van las cosas y si necesitas algo de nuestra parte. Quedamos a tu disposicion. Saludos, ${firma.nombre}`,
    oferta: `Hola ${cliente.contacto.nombre}! Desde ${firma.empresa} te acercamos una oferta especial para esta semana. Escribinos y te contamos los detalles. Saludos, ${firma.nombre}`,
    cobranza: `Hola ${cliente.contacto.nombre}. Te contactamos desde ${firma.empresa} para recordarte que tenes un saldo pendiente. Podes comunicarte al ${firma.telefono}. Muchas gracias.`,
    bienvenida: `Hola ${cliente.contacto.nombre}! Bienvenido/a a ${firma.empresa}. Estamos muy contentos de tenerte como cliente. Cualquier consulta, estamos disponibles. Saludos, ${firma.nombre}`,
  };
  return plantillas[tipo] || plantillas.seguimiento;
}

export function abrirWhatsApp(numero: string, mensaje: string): void {
  const limpio = numero.replace(/\D/g, '');
  const encoded = encodeURIComponent(mensaje);
  window.open(`https://wa.me/${limpio}?text=${encoded}`, '_blank');
}
