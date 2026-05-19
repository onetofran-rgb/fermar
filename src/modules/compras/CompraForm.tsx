import { useState } from "react";
import type { Compra, Cliente, ItemCompra, EstadoPago } from "../../types";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { generarId, formatMoneda } from "../../utils/formatters";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface Props {
  inicial: Compra | null;
  clientes: Cliente[];
  onGuardar: (c: Compra) => void;
  onCancelar: () => void;
}

const OPT_ESTADO: { value: string; label: string }[] = [
  { value: "pagado", label: "Pagado" },
  { value: "pendiente", label: "Pendiente" },
  { value: "vencido", label: "Vencido" },
];

const PRODUCTOS_COMUNES = [
  "Harina 000 (bolsa 25kg)", "Harina 0000 (bolsa 25kg)",
  "Levadura Fresca (kg)", "Grasa Vacuna (kg)",
  "Azucar Comun (bolsa 50kg)", "Sal Fina (bolsa 25kg)",
  "Mejorador Panadera (kg)", "Aceite de Girasol (bidon 20L)",
];

const itemVacio = (): ItemCompra => ({
  producto_id: generarId("prod"),
  nombre: "", cantidad: 1, unidad: "bolsa", precio_unitario: 0,
});

export function CompraForm({ inicial, clientes, onGuardar, onCancelar }: Props) {
  const [clienteId, setClienteId] = useState(inicial?.cliente_id ?? (clientes[0]?.id ?? ""));
  const [fecha, setFecha] = useState(inicial?.fecha ? format(new Date(inicial.fecha), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
  const [estadoPago, setEstadoPago] = useState<EstadoPago>((inicial?.estado_pago ?? "pagado") as EstadoPago);
  const [notas, setNotas] = useState(inicial?.notas ?? "");
  const [items, setItems] = useState<ItemCompra[]>(inicial?.productos ?? [itemVacio()]);

  const total = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);

  function setItem(idx: number, key: keyof ItemCompra, val: string | number) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  }

  function agregarItem() { setItems(prev => [...prev, itemVacio()]); }
  function quitarItem(idx: number) { setItems(prev => prev.filter((_, i) => i !== idx)); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const compra: Compra = {
      id: inicial?.id ?? generarId("cmp"),
      cliente_id: clienteId,
      fecha: new Date(fecha + "T12:00:00").toISOString(),
      productos: items.filter(i => i.nombre.trim()),
      total,
      estado_pago: estadoPago,
      notas,
    };
    onGuardar(compra);
  }

  const optClientes = clientes.map(c => ({ value: c.id, label: c.nombre }));
  const optProductos = [{ value: "", label: "Escribir nombre..." }, ...PRODUCTOS_COMUNES.map(p => ({ value: p, label: p }))];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Select label="Cliente" options={optClientes} value={clienteId} onChange={e => setClienteId(e.target.value)} />
        </div>
        <Input label="Fecha" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Productos</label>
          <Button type="button" variant="secondary" size="sm" onClick={agregarItem}>
            <Plus className="h-3.5 w-3.5" /> Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="col-span-5">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Producto</label>
                <select
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={PRODUCTOS_COMUNES.includes(item.nombre) ? item.nombre : ""}
                  onChange={e => { if (e.target.value) setItem(idx, "nombre", e.target.value); }}
                >
                  {optProductos.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {!PRODUCTOS_COMUNES.includes(item.nombre) && (
                  <input className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Nombre del producto" value={item.nombre} onChange={e => setItem(idx, "nombre", e.target.value)} required />
                )}
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Cantidad</label>
                <input type="number" min="0.1" step="0.1" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={item.cantidad} onChange={e => setItem(idx, "cantidad", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Unidad</label>
                <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={item.unidad} onChange={e => setItem(idx, "unidad", e.target.value)}>
                  {["bolsa", "kg", "bidon", "unidad", "caja"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Precio u.</label>
                <input type="number" min="0" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={item.precio_unitario} onChange={e => setItem(idx, "precio_unitario", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => quitarItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right mt-2">
          <span className="text-sm text-gray-500">Total: </span>
          <span className="text-xl font-bold text-amber-600">{formatMoneda(total)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Estado de pago" options={OPT_ESTADO} value={estadoPago} onChange={e => setEstadoPago(e.target.value as EstadoPago)} />
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Notas</label>
          <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={2} value={notas} onChange={e => setNotas(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button type="button" variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit">{inicial ? "Guardar cambios" : "Registrar compra"}</Button>
      </div>
    </form>
  );
}