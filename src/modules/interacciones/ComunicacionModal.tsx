import { useState } from "react";
import type { Cliente, Interaccion, TipoPlantilla } from "../../types";
import { useUIStore } from "../../stores/uiStore";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { generarEmailHTML } from "../../utils/emailGenerator";
import { generarMensajeWA, abrirWhatsApp } from "../../utils/whatsappGenerator";
import { generarId } from "../../utils/formatters";
import { Mail, MessageCircle, Send, Eye } from "lucide-react";

interface Props {
  clientes: Cliente[];
  clientePreseleccionado: string | null;
  onEnviar: (i: Interaccion) => void;
  onCerrar: () => void;
}

type Canal = "email" | "whatsapp";

const OPT_PLANTILLA = [
  { value: "seguimiento", label: "Seguimiento comercial" },
  { value: "oferta", label: "Oferta especial" },
  { value: "cobranza", label: "Cobranza / Recordatorio de pago" },
  { value: "bienvenida", label: "Bienvenida" },
];

export function ComunicacionModal({ clientes, clientePreseleccionado, onEnviar, onCerrar }: Props) {
  const { firma } = useUIStore();
  const [canal, setCanal] = useState<Canal>("email");
  const [clienteId, setClienteId] = useState(clientePreseleccionado ?? (clientes[0]?.id ?? ""));
  const [plantilla, setPlantilla] = useState<TipoPlantilla>("seguimiento");
  const [preview, setPreview] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [editandoCuerpo, setEditandoCuerpo] = useState("");

  const cliente = clientes.find(c => c.id === clienteId);
  const optClientes = clientes.map(c => ({ value: c.id, label: c.nombre }));

  const emailData = cliente ? generarEmailHTML(cliente, firma, plantilla, editandoCuerpo || undefined) : null;
  const mensajeWA = cliente ? generarMensajeWA(cliente, firma, plantilla) : "";

  function handlePreview() {
    if (!editandoCuerpo && cliente) {
      const data = generarEmailHTML(cliente, firma, plantilla);
      setEditandoCuerpo(data.texto.split("\n\nSaludos")[0]);
    }
    setPreview(true);
  }

  function registrarInteraccion(simulado: boolean) {
    if (!cliente) return;
    const interaccion: Interaccion = {
      id: generarId("int"),
      cliente_id: clienteId,
      fecha: new Date().toISOString(),
      tipo: canal,
      canal_estado: "enviado",
      asunto: emailData?.asunto ?? `Mensaje ${plantilla} via WhatsApp`,
      contenido: canal === "email" ? (editandoCuerpo || (emailData?.texto ?? "")) : mensajeWA,
      resultado: simulado ? "Enviado (simulado)" : `Enviado via ${canal === "email" ? "Email" : "WhatsApp Web"}`,
      proxima_accion: "Aguardar respuesta del cliente",
      adjuntos: [],
    };
    onEnviar(interaccion);
    setEnviado(true);
  }

  function handleEnviarWA() {
    if (!cliente) return;
    abrirWhatsApp(cliente.contacto.whatsapp, mensajeWA);
    registrarInteraccion(false);
  }

  if (enviado) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <Send className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comunicacion registrada</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          La interaccion fue guardada en el historial del cliente.
        </p>
        <Button onClick={onCerrar}>Cerrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Canal */}
      <div className="flex gap-3">
        <button
          onClick={() => setCanal("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${canal === "email" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
        >
          <Mail className="h-4 w-4" /> Email
        </button>
        <button
          onClick={() => setCanal("whatsapp")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${canal === "whatsapp" ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </button>
      </div>

      {/* Config */}
      <div className="grid grid-cols-2 gap-4">
        <Select label="Cliente destinatario" options={optClientes} value={clienteId} onChange={e => { setClienteId(e.target.value); setEditandoCuerpo(""); setPreview(false); }} />
        <Select label="Tipo de mensaje" options={OPT_PLANTILLA} value={plantilla} onChange={e => { setPlantilla(e.target.value as TipoPlantilla); setEditandoCuerpo(""); setPreview(false); }} />
      </div>

      {/* Datos del destinatario */}
      {cliente && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Destinatario: </span>
          <span className="text-gray-600 dark:text-gray-400">{cliente.contacto.nombre}</span>
          {canal === "email" && (
            <><span className="mx-2 text-gray-400">|</span><span className="text-gray-600 dark:text-gray-400">{cliente.contacto.email}</span></>
          )}
          {canal === "whatsapp" && (
            <><span className="mx-2 text-gray-400">|</span><span className="text-gray-600 dark:text-gray-400">+{cliente.contacto.whatsapp}</span></>
          )}
        </div>
      )}

      {/* Preview email */}
      {canal === "email" && (
        <div className="space-y-3">
          {!preview ? (
            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
              <Mail className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-3">El email se generara automaticamente con la plantilla seleccionada</p>
              <Button variant="secondary" onClick={handlePreview}>
                <Eye className="h-4 w-4" /> Ver preview y editar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {emailData && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                    <strong>Asunto:</strong> {emailData.asunto}
                  </div>
                  <div
                    className="p-4 text-sm max-h-64 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: emailData.html }}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Editar cuerpo del email</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={4}
                  value={editandoCuerpo}
                  onChange={e => setEditandoCuerpo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview WhatsApp */}
      {canal === "whatsapp" && cliente && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">Vista previa del mensaje WhatsApp:</p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-green-100 dark:border-green-900">
            {mensajeWA}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onCerrar} className="flex-1">Cancelar</Button>
        {canal === "email" && (
          <>
            <Button variant="secondary" onClick={() => registrarInteraccion(true)} className="flex-1">
              Simular envio
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (cliente?.contacto.email) {
                  const data = generarEmailHTML(cliente!, firma, plantilla, editandoCuerpo || undefined);
                  window.open(`mailto:${cliente.contacto.email}?subject=${encodeURIComponent(data.asunto)}&body=${encodeURIComponent(data.texto)}`, "_blank");
                  registrarInteraccion(false);
                }
              }}
            >
              <Send className="h-4 w-4" /> Abrir en cliente de email
            </Button>
          </>
        )}
        {canal === "whatsapp" && (
          <>
            <Button variant="secondary" onClick={() => registrarInteraccion(true)} className="flex-1">
              Simular envio
            </Button>
            <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={handleEnviarWA}>
              <MessageCircle className="h-4 w-4" /> Abrir WhatsApp Web
            </Button>
          </>
        )}
      </div>
    </div>
  );
}