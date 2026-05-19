import { useState } from "react";
import type { Evento, TipoInteraccion } from "../../types";
import type { Cliente } from "../../types";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { generarId } from "../../utils/formatters";

interface Props {
  inicial: Evento | null;
  fechaInicial?: string; // ISO date string (YYYY-MM-DD)
  clientes: Cliente[];
  onGuardar: (e: Evento) => void;
  onCancelar: () => void;
}

const OPT_TIPO: { value: TipoInteraccion; label: string }[] = [
  { value: "visita_directa", label: "Visita directa" },
  { value: "telefonico", label: "Llamada telefónica" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "video_llamada", label: "Video llamada" },
];

const RESPONSABLES = [
  "Vendedor Zona Norte",
  "Vendedor Zona Centro",
  "Vendedor Zona Serrana",
  "Administrativo",
  "Gerencia",
];

export function EventoForm({ inicial, fechaInicial, clientes, onGuardar, onCancelar }: Props) {
  // fecha inicial: si hay evento usamos su fecha, si no usamos la pasada o hoy
  const fechaDefault = inicial?.fecha
    ? inicial.fecha.slice(0, 10)
    : (fechaInicial ?? new Date("2026-05-19").toISOString().slice(0, 10));

  const [clienteId, setClienteId] = useState(inicial?.cliente_id ?? (clientes[0]?.id ?? ""));
  const [fecha, setFecha] = useState(fechaDefault);
  const [tipo, setTipo] = useState<TipoInteraccion>(inicial?.tipo ?? "visita_directa");
  const [responsable, setResponsable] = useState(inicial?.responsable ?? RESPONSABLES[0]);
  const [notas, setNotas] = useState(inicial?.notas ?? "");

  const optClientes = clientes.map(c => ({ value: c.id, label: c.nombre }));
  const optResponsables = RESPONSABLES.map(r => ({ value: r, label: r }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const evento: Evento = {
      id: inicial?.id ?? generarId("evt"),
      cliente_id: clienteId,
      fecha,
      tipo,
      responsable,
      notas,
      completado: inicial?.completado ?? false,
    };
    onGuardar(evento);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Cliente"
          options={optClientes}
          value={clienteId}
          onChange={e => setClienteId(e.target.value)}
        />
        <Input
          label="Fecha"
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tipo de actividad"
          options={OPT_TIPO}
          value={tipo}
          onChange={e => setTipo(e.target.value as TipoInteraccion)}
        />
        <Select
          label="Responsable"
          options={optResponsables}
          value={responsable}
          onChange={e => setResponsable(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Notas</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows={3}
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Detalles adicionales sobre la actividad..."
        />
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancelar} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {inicial ? "Guardar cambios" : "Crear evento"}
        </Button>
      </div>
    </form>
  );
}
