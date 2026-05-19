import { useEffect, useState } from "react";
import { useProduccionStore } from "../../stores/produccionStore";
import { useComprasStore } from "../../stores/comprasStore";
import type { Producto } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { ProductoForm } from "./ProductoForm";
import { PrevisibilidadChart } from "./PrevisibilidadChart";
import { formatMoneda } from "../../utils/formatters";
import { Factory, Plus, AlertTriangle, Package, BarChart2 } from "lucide-react";

interface Props {
  mostrarToast: (msg: string, tipo?: "success"|"error"|"info"|"warning") => void;
}

export function ProduccionPage({ mostrarToast }: Props) {
  const { productos, cargar, agregar, actualizar, eliminar } = useProduccionStore();
  const { compras, cargar: cargarCompras } = useComprasStore();
  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [productoGrafico, setProductoGrafico] = useState<Producto | null>(null);

  useEffect(() => { cargar(); cargarCompras(); }, [cargar, cargarCompras]);

  function stockStatus(p: Producto): "ok"|"bajo"|"critico" {
    const ratio = p.stock_actual / p.capacidad_produccion_diaria;
    if (ratio >= 5) return "ok";
    if (ratio >= 2) return "bajo";
    return "critico";
  }

  const criticos = productos.filter(p => stockStatus(p) === "critico").length;
  const bajos = productos.filter(p => stockStatus(p) === "bajo").length;
  const valorStock = productos.reduce((s, p) => s + p.stock_actual * p.costo_unitario, 0);

  function handleGuardar(p: Producto) {
    if (editando) { actualizar(p); mostrarToast("Producto actualizado"); }
    else { agregar(p); mostrarToast("Producto agregado"); }
    setModalForm(false);
    setEditando(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produccion</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Base de productos y previsibilidad de demanda</p>
        </div>
        <Button onClick={() => { setEditando(null); setModalForm(true); }}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><Package className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-xs text-gray-500">Valor total en stock</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatMoneda(valorStock)}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"><AlertTriangle className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-xs text-gray-500">Stock bajo</p><p className="text-2xl font-bold text-yellow-600">{bajos}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-xs text-gray-500">Stock critico</p><p className="text-2xl font-bold text-red-600">{criticos}</p></div>
          </div>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <Factory className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Base de productos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium text-right">Stock actual</th>
                <th className="px-4 py-3 font-medium text-right">Cap. diaria</th>
                <th className="px-4 py-3 font-medium text-right">Precio venta</th>
                <th className="px-4 py-3 font-medium text-right">Margen</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {productos.map(p => {
                const estado = stockStatus(p);
                const margen = ((p.precio_venta - p.costo_unitario) / p.precio_venta * 100).toFixed(0);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{p.nombre}</p>
                      <p className="text-xs text-gray-400">{p.unidad_medida}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">{p.categoria}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${estado === "critico" ? "text-red-600" : estado === "bajo" ? "text-yellow-600" : "text-green-600"}`}>
                        {p.stock_actual} {p.unidad_medida}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{p.capacidad_produccion_diaria}/{p.unidad_medida}/día</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatMoneda(p.precio_venta)}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{margen}%</td>
                    <td className="px-4 py-3">
                      <Badge variant={estado === "critico" ? "error" : estado === "bajo" ? "warning" : "success"}>
                        {estado === "critico" ? "Critico" : estado === "bajo" ? "Bajo" : "OK"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setProductoGrafico(p)}>
                          <BarChart2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditando(p); setModalForm(true); }}>Editar</Button>
                        <Button variant="ghost" size="sm" onClick={() => { eliminar(p.id); mostrarToast("Producto eliminado", "info"); }} className="text-red-400">Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {productos.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay productos registrados</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal form */}
      <Modal open={modalForm} onClose={() => { setModalForm(false); setEditando(null); }} titulo={editando ? "Editar producto" : "Nuevo producto"} ancho="lg">
        <ProductoForm inicial={editando} onGuardar={handleGuardar} onCancelar={() => { setModalForm(false); setEditando(null); }} />
      </Modal>

      {/* Modal previsibilidad */}
      {productoGrafico && (
        <Modal open={!!productoGrafico} onClose={() => setProductoGrafico(null)} titulo={`Previsibilidad — ${productoGrafico.nombre}`} ancho="xl">
          <PrevisibilidadChart producto={productoGrafico} compras={compras} />
        </Modal>
      )}
    </div>
  );
}