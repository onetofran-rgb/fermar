import type { Cliente, ConfigFirma } from '../types';

export function generarEmailHTML(cliente: Cliente, firma: ConfigFirma, tipo: string, contenidoPersonalizado?: string): { asunto: string; html: string; texto: string } {
  const plantillas: Record<string, { asunto: string; cuerpo: string }> = {
    seguimiento: {
      asunto: `Seguimiento comercial - ${firma.empresa}`,
      cuerpo: `Estimado/a ${cliente.contacto.nombre},\n\nNos comunicamos desde ${firma.empresa} para hacer un seguimiento de nuestra relacion comercial y consultarle si tiene algun requerimiento o consulta.\n\nQuedamos a su disposicion.`,
    },
    oferta: {
      asunto: `Oferta especial para ${cliente.nombre} - ${firma.empresa}`,
      cuerpo: `Estimado/a ${cliente.contacto.nombre},\n\nTenemos el agrado de comunicarle una oferta especial disponible esta semana para clientes seleccionados como usted.\n\nContactenos para conocer los detalles.`,
    },
    cobranza: {
      asunto: `Aviso de saldo pendiente - ${firma.empresa}`,
      cuerpo: `Estimado/a ${cliente.contacto.nombre},\n\nLe informamos que registramos un saldo pendiente en su cuenta. Le agradeceremos que se ponga en contacto con nosotros para regularizar la situacion.\n\nTelefono: ${firma.telefono}`,
    },
    bienvenida: {
      asunto: `Bienvenido/a a ${firma.empresa}!`,
      cuerpo: `Estimado/a ${cliente.contacto.nombre},\n\nNos complace darle la bienvenida como cliente de ${firma.empresa}. Estamos a su disposicion para acompanarlo en cada pedido.\n\nNo dude en contactarnos ante cualquier consulta.`,
    },
  };

  const plantilla = plantillas[tipo] || plantillas.seguimiento;
  const cuerpo = contenidoPersonalizado || plantilla.cuerpo;
  const firma_bloque = `\n\nSaludos cordiales,\n${firma.nombre}\n${firma.cargo}\n${firma.empresa}\nTel: ${firma.telefono} | ${firma.email}`;
  const texto = cuerpo + firma_bloque;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #f59e0b; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">FERMAR Distribuidora</h1>
      </div>
      <div style="background: #fff; border: 1px solid #e5e7eb; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; line-height: 1.6; white-space: pre-line;">${cuerpo}</p>
        <hr style="border-color: #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          <strong>${firma.nombre}</strong><br/>
          ${firma.cargo}<br/>
          ${firma.empresa}<br/>
          Tel: ${firma.telefono} | ${firma.email}
        </p>
      </div>
    </div>
  `;

  return { asunto: plantilla.asunto, html, texto };
}
