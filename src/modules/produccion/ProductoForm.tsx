import { useState } from "react";
import type { Producto } from "../../types";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { generarId } from "../../utils/formatters";

interface Props {
  inicial: Producto | null;
  onGuardar: (p: Producto) => void;
  onCancelar: () => void;
}

const OPT_CAT = ["harina","levadura","grasa","azucar","sal","aditivo","aceite","otro"].map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));
const OPT_UM = ["bolsa","kg","bidon","unidad","caja","litro"].map(u => ({ value: u, label: u }));

export function ProductoForm({ inicial, onGuardar, onCancelar }: Props) {
  const [form, setForm] = useState({
    nombre: inicial?.nombre ?? "",
    categoria: inicial?.categoria ?? "harina",
    stock_actual: inicial?.stock_actual ?? 0,
    capacidad_produccion_diaria: inicial?.capacidad_produccion_diaria ?? 50,
    unidad_medida: inicial?.unidad_medida ?? "bolsa",
    costo_unitario: inicial?.costo_unitario ?? 0,
    precio_venta: inicial?.precio_venta ?? 0,
    tiempo_produccion_hs: inicial?.tiempo_produccion_hs ?? 0,
  });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const n = (v: string) => parseFloat(v) || 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGuardar({ ...form, id: inicial?.id ?? generarId("prod") });
  }

  const margen = form.precio_venta > 0 ? ((form.precio_venta - form.costo_unitario) / form.precio_venta * 100).toFixed(1) : "0";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Nombre del producto" value={form.nombre} onChange={e => set("nombre", e.target.value)} required />
        </div>
        <Select label="Categoria" options={OPT_CAT} value={form.categoria} onChange={e => set("categoria", e.target.value)} />
        <Select label="Unidad de medida" options={OPT_UM} value={form.unidad_medida} onChange={e => set("unidad_medida", e.target.value)} />
        <Input label="Stock actual" type="number" min="0" value={form.stock_actual} onChange={e => set("stock_actual", n(e.target.value))} />
        <Input label="Capacidad produccion diaria" type="number" min="1" value={form.capacidad_produccion_diaria} onChange={e => set("capacidad_produccion_diaria", n(e.target.value))} />
        <Input label="Costo unitario ($)" type="number" min="0" value={form.costo_unitario} onChange={e => set("costo_unitario", n(e.target.value))} />
        <Input label="Precio de venta ($)" type="number" min="0" value={form.precio_venta} onChange={e => set("precio_venta", n(e.target.value))} />
      </div>
      {form.precio_venta > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm">
          <span className="text-green-700 dark:text-green-400 font-medium">Margen estimado: {margen}%</span>
          <span className="text-gray-500 ml-2">(${(form.precio_venta - form.costo_unitario).toLocaleString("es-AR")} por {form.unidad_medida})</span>
        </div>
      )}
      <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button type="button" variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit">{inicial ? "Guardar cambios" : "Agregar producto"}</Button>
      </div>
    </form>
  );
}