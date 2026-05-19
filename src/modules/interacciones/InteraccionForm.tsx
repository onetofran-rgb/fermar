import { useState } from "react";
import type { Interaccion, Cliente, TipoInteraccion, CanalEstado } from "../../types";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { generarId } from "../../utils/formatters";
import { format } from "date-fns";

interface Props {
  inicial: Interaccion | null;
  clientes: Cliente[];
  onGuardar: (i: Interaccion) => void;
  onCancelar: () => void;
}

const OPT_TIPO = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telefonico", label: "Telefonico" },
  { value: "visita_directa", label: "Visita Directa" },
];

const OPT_ESTADO = [
  { value: "enviado", label: "Enviado" },
  { value: "respondido", label: "Respondido" },
  { value: "sin_respuesta", label: "Sin respuesta" },
  { value: "programado", label: "Programado" },
];

export function InteraccionForm({ inicial, clientes, onGuardar, onCancelar }: Props) {
  const [form, setForm] = useState({
    cliente_id: inicial?.cliente_id ?? (clientes[0]?.id ?? ""),
    fecha: inicial?.fecha ? format(new Date(inicial.fecha), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    tipo: (inicial?.tipo ?? "whatsapp") as TipoInteraccion,
    canal_estado: (inicial?.canal_estado ?? "enviado") as CanalEstado,
    asunto: inicial?.asunto ?? "",
    contenido: inicial?.contenido ?? "",
    resultado: inicial?.resultado ?? "",
    proxima_accion: inicial?.proxima_accion ?? "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGuardar({
      ...form,
      id: inicial?.id ?? generarId("int"),
      fecha: new Date(form.fecha).toISOString(),
      adjuntos: inicial?.adjuntos ?? [],
    });
  }

  const optClientes = clientes.map(c => ({ value: c.id, label: c.nombre }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Select label="Cliente" options={optClientes} value={form.cliente_id} onChange={e => set("cliente_id", e.target.value)} />
        </div>
        <Select label="Tipo" options={OPT_TIPO} value={form.tipo} onChange={e => set("tipo", e.target.value)} />
        <Select label="Estado" options={OPT_ESTADO} value={form.canal_estado} onChange={e => set("canal_estado", e.target.value)} />
        <div className="col-span-2">
          <Input label="Fecha y hora" type="datetime-local" value={form.fecha} onChange={e => set("fecha", e.target.value)} />
        </div>
        <div className="col-span-2">
          <Input label="Asunto" value={form.asunto} onChange={e => set("asunto", e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Contenido / Descripcion</label>
        <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={3} value={form.contenido} onChange={e => set("contenido", e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Resultado</label>
          <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={2} value={form.resultado} onChange={e => set("resultado", e.target.value)} placeholder="Que paso / que se acordo..." />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Proxima accion</label>
          <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={2} value={form.proxima_accion} onChange={e => set("proxima_accion", e.target.value)} placeholder="Que hay que hacer como seguimiento..." />
        </div>
      </div>

      <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button type="button" variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit">{inicial ? "Guardar cambios" : "Registrar"}</Button>
      </div>
    </form>
  );
}