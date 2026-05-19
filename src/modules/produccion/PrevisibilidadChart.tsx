import type { Producto, Compra } from "../../types";
import { addDays, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  producto: Producto;
  compras: Compra[];
}

type Horizonte = 7 | 14 | 30;

export function PrevisibilidadChart({ producto, compras }: Props) {
  const [horizonte, setHorizonte] = useState<Horizonte>(14);
  const hoy = new Date("2026-05-19");

  // Calcular demanda diaria promedio basada en historial de compras (ultimos 90 dias)
  const comprasProducto = compras.flatMap(c =>
    c.productos
      .filter(p => p.nombre === producto.nombre || p.producto_id === producto.id)
      .map(p => ({ fecha: c.fecha, cantidad: p.cantidad }))
  );

  const comprasRecientes = comprasProducto.filter(c => {
    try { return new Date(c.fecha) >= subDays(hoy, 90); } catch { return false; }
  });

  const demandaTotal = comprasRecientes.reduce((s, c) => s + c.cantidad, 0);
  const demandaDiaria = comprasRecientes.length > 0 ? demandaTotal / 90 : producto.capacidad_produccion_diaria * 0.3;

  // Generar proyeccion dia a dia
  let stockActual = producto.stock_actual;
  const datos = Array.from({ length: horizonte }, (_, i) => {
    const fecha = addDays(hoy, i);

    // Variar demanda con algo de ruido para hacerlo mas realista
    const variacion = 0.7 + Math.sin(i * 1.3) * 0.3;
    const demandaDia = parseFloat((demandaDiaria * variacion).toFixed(1));

    stockActual = Math.max(0, stockActual - demandaDia);
    const stockProyectado = parseFloat(stockActual.toFixed(1));
    const alerta = stockProyectado < demandaDiaria * 3;

    return {
      dia: format(fecha, "dd/MM", { locale: es }),
      "Stock proyectado": stockProyectado,
      "Demanda diaria": parseFloat(demandaDia.toFixed(1)),
      alerta,
    };
  });

  const diasCriticos = datos.filter(d => d.alerta).length;
  const primerAlerta = datos.find(d => d.alerta);

  return (
    <div className="space-y-4">
      {/* Estado */}
      <div className="flex items-center gap-3">
        {diasCriticos > 0 ? (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700 dark:text-red-400">
              Stock critico a partir del dia <strong>{primerAlerta?.dia}</strong> — {diasCriticos} dias en alerta en el horizonte
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-400">Stock suficiente para el horizonte seleccionado</span>
          </div>
        )}
        <div className="ml-auto flex gap-1">
          {([7, 14, 30] as Horizonte[]).map(h => (
            <button key={h} onClick={() => setHorizonte(h)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${horizonte === h ? "bg-amber-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"}`}>
              {h}d
            </button>
          ))}
        </div>
      </div>

      {/* Info del producto */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Stock actual</p>
          <p className="font-bold text-gray-900 dark:text-white">{producto.stock_actual} {producto.unidad_medida}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Demanda diaria estimada</p>
          <p className="font-bold text-gray-900 dark:text-white">{demandaDiaria.toFixed(1)} {producto.unidad_medida}/dia</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Dias de stock restantes</p>
          <p className={`font-bold ${producto.stock_actual / demandaDiaria < 5 ? "text-red-600" : "text-green-600"}`}>
            ~{Math.floor(producto.stock_actual / Math.max(demandaDiaria, 0.1))} dias
          </p>
        </div>
      </div>

      {/* Grafico */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--tooltip-bg, #fff)", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
              formatter={(val, name) => [`${val} ${producto.unidad_medida}`, name as string]}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <ReferenceLine y={demandaDiaria * 3} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Minimo seguro", fontSize: 10, fill: "#f59e0b" }} />
            <Line type="monotone" dataKey="Stock proyectado" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Demanda diaria" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 justify-center">
        <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-amber-500 inline-block" /> Stock proyectado</span>
        <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-gray-500 inline-block border-dashed border-t-2 border-gray-500" style={{background:"none"}} /> Demanda diaria</span>
        <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-amber-400 inline-block" style={{borderTop:"2px dashed #f59e0b",background:"none"}} /> Minimo seguro (3 dias)</span>
      </div>
    </div>
  );
}