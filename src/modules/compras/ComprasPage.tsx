import { useEffect, useState } from "react";
import { useComprasStore } from "../../stores/comprasStore";
import { useClientesStore } from "../../stores/clientesStore";
import { useUIStore } from "../../stores/uiStore";
import type { Compra } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { CompraForm } from "./CompraForm";
import { formatFecha, formatMoneda } from "../../utils/formatters";
import { exportarCSV } from "../../utils/csvExporter";
import { Plus, ShoppingCart, Download, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";

interface Props {
  mostrarToast: (msg: string, tipo?: "success"|"error"|"info"|"warning") => void;
}

const PAGO_BADGE: Record<string, "success"|"warning"|"error"> = {
  pagado: "success", pendiente: "warning", vencido: "error",
};

const OPT_PAGO = [
  { value: "", label: "Todos los estados" },
  { value: "pagado", label: "Pagado" },
  { value: "pendiente", label: "Pendiente" },
  { value: "vencido", label: "Vencido" },
];

export function ComprasPage({ mostrarToast }: Props) {
  const { compras, cargar, agregar, actualizar, eliminar } = useComprasStore();
  const { clientes, cargar: cargarClientes } = useClientesStore();
  const { unidad_activa } = useUIStore();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [pag, setPag] = useState(1);
  const POR_PAG = 10;

  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState<Compra | null>(null);
  const [detalle, setDetalle] = useState<Compra | null>(null);

  useEffect(() => { cargar(); cargarClientes(); }, [cargar, cargarClientes]);
  useEffect(() => { setPag(1); }, [busqueda, filtroEstado, filtroCliente, unidad_activa]);

  const clienteIdsPorUN = new Set(
    unidad_activa === "todas" ? clientes.map(c => c.id)
      : clientes.filter(c => c.unidad_negocio === unidad_activa).map(c => c.id)
  );
  const getCliente = (id: string) => clientes.find(c => c.id === id);

  const optClientes = [
    { value: "", label: "Todos los clientes" },
    ...clientes.filter(c => unidad_activa === "todas" || c.unidad_negocio === unidad_activa)
      .map(c => ({ value: c.id, label: c.nombre })),
  ];

  const filtradas = compras
    .filter(c => clienteIdsPorUN.has(c.cliente_id))
    .filter(c => !filtroEstado || c.estado_pago === filtroEstado)
    .filter(c => !filtroCliente || c.cliente_id === filtroCliente)
    .filter(c => {
      if (!busqueda) return true;
      const q = busqueda.toLowerCase();
      const cl = getCliente(c.cliente_id);
      return (cl?.nombre.toLowerCase().includes(q) ?? false) ||
        c.productos.some(p => p.nombre.toLowerCase().includes(q));
    })
    .sort((a, b) => sortAsc ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha));

  const totalPags = Math.max(1, Math.ceil(filtradas.length / POR_PAG));
  const pagina = filtradas.slice((pag - 1) * POR_PAG, pag * POR_PAG);

  const totalVentas = filtradas.reduce((s, c) => s + c.total, 0);
  const totalVencido = filtradas.filter(c => c.estado_pago === "vencido").reduce((s, c) => s + c.total, 0);
  const totalPendiente = filtradas.filter(c => c.estado_pago === "pendiente").reduce((s, c) => s + c.total, 0);

  function handleGuardar(c: Compra) {
    if (editando) { actualizar(c); mostrarToast("Compra actualizada"); }
    else { agregar(c); mostrarToast("Compra registrada"); }
    setModalForm(false);
    setEditando(null);
  }

  function handleExportar() {
    const datos = filtradas.map(c => ({
      Fecha: formatFecha(c.fecha),
      Cliente: getCliente(c.cliente_id)?.nombre ?? c.cliente_id,
      Productos: c.productos.map(p => `${p.nombre} x${p.cantidad}`).join(" | "),
      Total: c.total,
      "Estado Pago": c.estado_pago,
      Notas: c.notas,
    }));
    exportarCSV(datos as never, "compras_fermar");
    mostrarToast("CSV exportado correctamente", "info");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compras</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtradas.length} registros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportar}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button onClick={() => { setEditando(null); setModalForm(true); }}>
            <Plus className="h-4 w-4" /> Nueva compra
          </Button>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-xs text-gray-500">Total ventas</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatMoneda(totalVentas)}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"><ShoppingCart className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-xs text-gray-500">Pendiente de cobro</p><p className="text-lg font-bold text-yellow-600">{formatMoneda(totalPendiente)}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><ShoppingCart className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-xs text-gray-500">Vencido sin cobrar</p><p className="text-lg font-bold text-red-600">{formatMoneda(totalVencido)}</p></div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <Input placeholder="Buscar por cliente o producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <Select options={OPT_PAGO} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} />
          <Select options={optClientes} value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />
          <Button variant="ghost" size="sm" onClick={() => setSortAsc(a => !a)}>
            Fecha {sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      {/* Tabla */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {pagina.map(c => {
                const cliente = getCliente(c.cliente_id);
                return (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => setDetalle(c)}>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatFecha(c.fecha)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{cliente?.nombre ?? "Desconocido"}</p>
                      <p className="text-xs text-gray-400">{cliente?.unidad_negocio}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 dark:text-gray-300 text-xs">{c.productos.slice(0, 2).map(p => `${p.nombre} ×${p.cantidad}`).join(", ")}{c.productos.length > 2 && ` +${c.productos.length - 2} más`}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">{formatMoneda(c.total)}</td>
                    <td className="px-4 py-3"><Badge variant={PAGO_BADGE[c.estado_pago]}>{c.estado_pago.charAt(0).toUpperCase() + c.estado_pago.slice(1)}</Badge></td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => { setEditando(c); setModalForm(true); }}>Editar</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pagina.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No se encontraron compras</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">{filtradas.length} resultados</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={pag === 1} onClick={() => setPag(p => p - 1)}>Anterior</Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center px-2">{pag} / {totalPags}</span>
            <Button variant="secondary" size="sm" disabled={pag === totalPags} onClick={() => setPag(p => p + 1)}>Siguiente</Button>
          </div>
        </div>
      </Card>

      {/* Modal form */}
      <Modal open={modalForm} onClose={() => { setModalForm(false); setEditando(null); }} titulo={editando ? "Editar compra" : "Nueva compra"} ancho="xl">
        <CompraForm
          inicial={editando}
          clientes={clientes.filter(c => unidad_activa === "todas" || c.unidad_negocio === unidad_activa)}
          onGuardar={handleGuardar}
          onCancelar={() => { setModalForm(false); setEditando(null); }}
        />
      </Modal>

      {/* Modal detalle */}
      {detalle && (
        <Modal open={!!detalle} onClose={() => setDetalle(null)} titulo="Detalle de compra" ancho="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-gray-500">Cliente:</span> <span className="text-gray-900 dark:text-white">{getCliente(detalle.cliente_id)?.nombre}</span></div>
              <div><span className="font-medium text-gray-500">Fecha:</span> <span className="text-gray-900 dark:text-white">{formatFecha(detalle.fecha)}</span></div>
              <div><span className="font-medium text-gray-500">Estado pago:</span> <Badge variant={PAGO_BADGE[detalle.estado_pago]}>{detalle.estado_pago}</Badge></div>
              <div><span className="font-medium text-gray-500">Total:</span> <span className="text-xl font-bold text-amber-600">{formatMoneda(detalle.total)}</span></div>
            </div>
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2 font-medium">Producto</th>
                  <th className="px-3 py-2 font-medium text-right">Cant.</th>
                  <th className="px-3 py-2 font-medium text-right">Precio u.</th>
                  <th className="px-3 py-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {detalle.productos.map((p, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{p.nombre}</td>
                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{p.cantidad} {p.unidad}</td>
                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{formatMoneda(p.precio_unitario)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">{formatMoneda(p.cantidad * p.precio_unitario)}</td>
                  </tr>
                ))}
                <tr className="bg-amber-50 dark:bg-amber-900/10">
                  <td colSpan={3} className="px-3 py-2 font-bold text-right text-gray-700 dark:text-gray-300">TOTAL</td>
                  <td className="px-3 py-2 text-right font-bold text-amber-700 dark:text-amber-400">{formatMoneda(detalle.total)}</td>
                </tr>
              </tbody>
            </table>
            {detalle.notas && <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><span className="font-medium">Notas:</span> {detalle.notas}</p>}
            <div className="flex gap-3 pt-2">
              <Button onClick={() => { setDetalle(null); setEditando(detalle); setModalForm(true); }}>Editar</Button>
              <Button variant="danger" onClick={() => { eliminar(detalle.id); mostrarToast("Compra eliminada", "info"); setDetalle(null); }}>Eliminar</Button>
              <Button variant="secondary" onClick={() => setDetalle(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}