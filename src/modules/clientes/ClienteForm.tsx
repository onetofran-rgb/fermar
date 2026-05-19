import { useState } from "react";
import type { Cliente, TipoCliente, EstadoCliente, UnidadNegocio } from "../../types";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { generarId } from "../../utils/formatters";

interface Props {
  inicial: Cliente | null;
  onGuardar: (c: Cliente) => void;
  onCancelar: () => void;
}

const OPT_TIPO = [
  { value: "panadero", label: "Panadero" },
  { value: "supermercado", label: "Supermercado" },
  { value: "minorista", label: "Minorista" },
];
const OPT_ESTADO = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "prospecto", label: "Prospecto" },
];
const OPT_UN = [
  { value: "UN1", label: "UN1" },
  { value: "UN2", label: "UN2" },
  { value: "UN3", label: "UN3" },
];

export function ClienteForm({ inicial, onGuardar, onCancelar }: Props) {
  const [form, setForm] = useState({
    nombre: inicial?.nombre ?? "",
    tipo: (inicial?.tipo ?? "panadero") as TipoCliente,
    unidad_negocio: (inicial?.unidad_negocio ?? "UN1") as UnidadNegocio,
    contacto: inicial?.contacto ?? { nombre: "", telefono: "", email: "", whatsapp: "" },
    direccion: inicial?.direccion ?? "",
    ciudad: inicial?.ciudad ?? "",
    zona: inicial?.zona ?? "",
    estado: (inicial?.estado ?? "activo") as EstadoCliente,
    fecha_alta: inicial?.fecha_alta ?? new Date().toISOString(),
    ultima_compra: inicial?.ultima_compra ?? null,
    proximo_contacto: inicial?.proximo_contacto ?? null,
    notas_internas: inicial?.notas_internas ?? "",
  });

  const setF = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }));
  const setC = (key: string, val: string) => setForm(f => ({ ...f, contacto: { ...f.contacto, [key]: val } }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGuardar({ ...form, id: inicial?.id ?? generarId("cli"), score_cliente: inicial?.score_cliente ?? 50 });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Nombre del negocio" value={form.nombre} onChange={e => setF("nombre", e.target.value)} required />
        </div>
        <Select label="Tipo" options={OPT_TIPO} value={form.tipo} onChange={e => setF("tipo", e.target.value)} />
        <Select label="Estado" options={OPT_ESTADO} value={form.estado} onChange={e => setF("estado", e.target.value)} />
        <Select label="Unidad de negocio" options={OPT_UN} value={form.unidad_negocio} onChange={e => setF("unidad_negocio", e.target.value)} />
        <Input label="Ciudad" value={form.ciudad} onChange={e => setF("ciudad", e.target.value)} />
        <Input label="Zona" value={form.zona} onChange={e => setF("zona", e.target.value)} />
        <Input label="Direccion" value={form.direccion} onChange={e => setF("direccion", e.target.value)} />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Datos de contacto</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre del contacto" value={form.contacto.nombre} onChange={e => setC("nombre", e.target.value)} required />
          <Input label="Telefono" value={form.contacto.telefono} onChange={e => setC("telefono", e.target.value)} />
          <Input label="Email" type="email" value={form.contacto.email} onChange={e => setC("email", e.target.value)} />
          <Input label="WhatsApp" value={form.contacto.whatsapp} onChange={e => setC("whatsapp", e.target.value)} placeholder="5493514123456" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Notas internas</label>
        <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={3} value={form.notas_internas} onChange={e => setF("notas_internas", e.target.value)} placeholder="Preferencias, acuerdos, observaciones..." />
      </div>
      <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button type="button" variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit">{inicial ? "Guardar cambios" : "Crear cliente"}</Button>
      </div>
    </form>
  );
}