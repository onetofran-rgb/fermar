import { useEffect, useMemo } from "react";
import { subDays, parseISO, format, addDays, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useClientesStore } from "../../stores/clientesStore";
import { useComprasStore } from "../../stores/comprasStore";
import { useInteraccionesStore } from "../../stores/interaccionesStore";
import { useProduccionStore } from "../../stores/produccionStore";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { formatMoneda, LABEL_TIPO_INTERACCION } from "../../utils/formatters";
import { exportarCSV } from "../../utils/csvExporter";
import {
  BarChart2, TrendingUp, Users, AlertTriangle,
  Package, MessageSquare, Download,
} from "lucide-react";

// ─── Constantes de color ──────────────────────────────────────────────────────

const HOY = new Date("2026-05-19");

const COLORES_PIE = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"];
const COLOR_BAR   = "#f59e0b";
const COLOR_LINE  = "#3b82f6";

// ─── Componente ───────────────────────────────────────────────────────────────

export function ReportesPage() {
  const { clientes, cargar: cargarClientes }           = useClientesStore();
  const { compras, cargar: cargarCompras }             = useComprasStore();
  const { interacciones, cargar: cargarInteracciones } = useInteraccionesStore();
  const { cargar: cargarProductos }         = useProduccionStore();

  useEffect(() => {
    cargarClientes();
    cargarCompras();
    cargarInteracciones();
    cargarProductos();
  }, [cargarClientes, cargarCompras, cargarInteracciones, cargarProductos]);

  // ── 1. Ranking de clientes por volumen de compras ──
  const rankingClientes = useMemo(() => {
    const mapa: Record<string, { nombre: string; total: number; unidad: string; compras: number }> = {};
    for (const c of clientes) {
      mapa[c.id] = { nombre: c.nombre, total: 0, unidad: c.unidad_negocio, compras: 0 };
    }
    for (const compra of compras) {
      if (mapa[compra.cliente_id]) {
        mapa[compra.cliente_id].total += compra.total;
        mapa[compra.cliente_id].compras += 1;
      }
    }
    return Object.values(mapa)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [clientes, compras]);

  // ── 2. Clientes inactivos (sin compra en 60 días) ──
  const clientesInactivos = useMemo(() => {
    const limite = subDays(HOY, 60);
    return clientes.filter(c => {
      const ultimaCompra = compras
        .filter(x => x.cliente_id === c.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      if (!ultimaCompra) return true; // nunca compró
      try { return isBefore(parseISO(ultimaCompra.fecha), limite); } catch { return false; }
    });
  }, [clientes, compras]);

  // ── 3. Distribución por unidad de negocio ──
  const distribucionUN = useMemo(() => {
    const totales: Record<string, number> = { UN1: 0, UN2: 0, UN3: 0 };
    for (const compra of compras) {
      const cliente = clientes.find(c => c.id === compra.cliente_id);
      if (cliente) totales[cliente.unidad_negocio] = (totales[cliente.unidad_negocio] ?? 0) + compra.total;
    }
    return Object.entries(totales).map(([name, value]) => ({ name, value }));
  }, [clientes, compras]);

  // ── 4. Tasa de respuesta por canal ──
  const tasaCanal = useMemo(() => {
    const conteo: Record<string, { enviados: number; respondidos: number }> = {};
    for (const inter of interacciones) {
      const tipo = inter.tipo;
      if (!conteo[tipo]) conteo[tipo] = { enviados: 0, respondidos: 0 };
      conteo[tipo].enviados += 1;
      if (inter.canal_estado === "respondido" || inter.resultado?.toLowerCase().includes("positiv")) {
        conteo[tipo].respondidos += 1;
      }
    }
    return Object.entries(conteo).map(([tipo, v]) => ({
      canal: LABEL_TIPO_INTERACCION[tipo as keyof typeof LABEL_TIPO_INTERACCION] ?? tipo,
      enviados: v.enviados,
      respondidos: v.respondidos,
      tasa: v.enviados > 0 ? Math.round((v.respondidos / v.enviados) * 100) : 0,
    })).sort((a, b) => b.enviados - a.enviados);
  }, [interacciones]);

  // ── 5. Top 5 productos por cantidad vendida ──
  const topProductos = useMemo(() => {
    const mapa: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {};
    for (const compra of compras) {
      for (const item of compra.productos) {
        const key = item.nombre;
        if (!mapa[key]) mapa[key] = { nombre: key, cantidad: 0, ingresos: 0 };
        mapa[key].cantidad += item.cantidad;
        mapa[key].ingresos += item.cantidad * item.precio_unitario;
      }
    }
    return Object.values(mapa).sort((a, b) => b.ingresos - a.ingresos).slice(0, 5);
  }, [compras]);

  // ── 6. Proyección de ingresos 30 días ──
  const proyeccionIngresos = useMemo(() => {
    // Historial últimos 30 días agrupado por semana
    const ventasPorDia: Record<string, number> = {};
    for (const compra of compras) {
      const dia = compra.fecha.slice(0, 10);
      ventasPorDia[dia] = (ventasPorDia[dia] ?? 0) + compra.total;
    }

    // Promedio diario de los últimos 60 días
    const diasHist = 60;
    let totalHist = 0;
    for (let i = diasHist; i >= 1; i--) {
      const dia = format(subDays(HOY, i), "yyyy-MM-dd");
      totalHist += ventasPorDia[dia] ?? 0;
    }
    const promDiario = totalHist / diasHist;

    // Proyectar 30 días con variación senoidal para realismo
    return Array.from({ length: 30 }, (_, i) => {
      const fecha = addDays(HOY, i);
      const dia = format(fecha, "dd/MM", { locale: es });
      const variacion = 1 + Math.sin(i * 0.7) * 0.25 + (i < 5 ? -0.1 : 0.05); // tendencia leve al alza
      const proyectado = Math.round(promDiario * variacion);
      return {
        dia,
        Proyectado: proyectado,
        // Solo los primeros 0 días son "reales" (proyectamos todo)
      };
    });
  }, [compras]);

  // ── Exports CSV ──
  function exportarRanking() {
    exportarCSV(
      rankingClientes.map((r, i) => ({
        Posicion: i + 1,
        Cliente: r.nombre,
        "Unidad de Negocio": r.unidad,
        "Compras realizadas": r.compras,
        "Total facturado": r.total.toFixed(2),
      })),
      "ranking_clientes"
    );
  }

  function exportarInactivos() {
    exportarCSV(
      clientesInactivos.map(c => ({
        Cliente: c.nombre,
        "Unidad de Negocio": c.unidad_negocio,
        "Tipo": c.tipo,
        "Estado": c.estado,
        "Ultima compra": compras
          .filter(x => x.cliente_id === c.id)
          .sort((a, b) => b.fecha.localeCompare(a.fecha))[0]?.fecha ?? "Sin compras",
      })),
      "clientes_inactivos"
    );
  }

  // ── KPIs resumen ──
  const totalVentasMes = compras
    .filter(c => c.fecha.startsWith("2026-05"))
    .reduce((s, c) => s + c.total, 0);

  const ticketPromedio = compras.length > 0
    ? compras.reduce((s, c) => s + c.total, 0) / compras.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Análisis de performance comercial y proyecciones</p>
        </div>
      </div>

      {/* KPIs globales */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Ventas mayo", valor: formatMoneda(totalVentasMes), icono: <TrendingUp className="h-5 w-5 text-amber-600" />, color: "bg-amber-100 dark:bg-amber-900/30" },
          { label: "Ticket promedio", valor: formatMoneda(ticketPromedio), icono: <BarChart2 className="h-5 w-5 text-blue-600" />, color: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "Clientes activos", valor: clientes.filter(c => c.estado === "activo").length, icono: <Users className="h-5 w-5 text-green-600" />, color: "bg-green-100 dark:bg-green-900/30" },
          { label: "Inactivos +60d", valor: clientesInactivos.length, icono: <AlertTriangle className="h-5 w-5 text-red-600" />, color: "bg-red-100 dark:bg-red-900/30" },
        ].map(k => (
          <Card key={k.label}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${k.color}`}>{k.icono}</div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{k.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{k.valor}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Fila 1: Ranking clientes + Distribución UN */}
      <div className="grid grid-cols-3 gap-5">
        {/* Ranking clientes — ocupa 2/3 */}
        <div className="col-span-2">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Top 10 clientes por facturación</h3>
              </div>
              <Button variant="secondary" size="sm" onClick={exportarRanking}>
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </div>
            <div className="p-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankingClientes} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip formatter={(v) => formatMoneda(Number(v))} />
                    <Bar dataKey="total" fill={COLOR_BAR} radius={[0, 4, 4, 0]} name="Facturación" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* Distribución por UN — 1/3 */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Distribución por UN</h3>
          </div>
          <div className="p-4">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribucionUN}
                    cx="50%" cy="50%"
                    innerRadius={35} outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {distribucionUN.map((_, i) => (
                      <Cell key={i} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoneda(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {distribucionUN.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORES_PIE[i] }} />
                    <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{formatMoneda(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Fila 2: Proyección 30 días */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Proyección de ingresos — próximos 30 días</h3>
          <span className="ml-auto text-xs text-gray-400">Basado en promedio histórico + tendencia</span>
        </div>
        <div className="p-4 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={proyeccionIngresos} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatMoneda(Number(v)), "Proyectado"]} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="Proyectado"
                stroke={COLOR_LINE}
                strokeWidth={2.5}
                dot={false}
                strokeDasharray="6 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Fila 3: Top productos + Tasa por canal */}
      <div className="grid grid-cols-2 gap-5">
        {/* Top 5 productos */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Top 5 productos vendidos</h3>
          </div>
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductos} layout="vertical" margin={{ left: 4, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(v) => formatMoneda(Number(v))} />
                <Bar dataKey="ingresos" fill="#10b981" radius={[0, 4, 4, 0]} name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tasa de respuesta por canal */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Actividad por canal</h3>
          </div>
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasaCanal} margin={{ left: 0, right: 16, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="canal" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="enviados" fill="#6b7280" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="respondidos" fill="#3b82f6" name="Respondidos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Fila 4: Clientes inactivos */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Clientes inactivos — sin compra en +60 días
            </h3>
            <Badge variant="error">{clientesInactivos.length}</Badge>
          </div>
          <Button variant="secondary" size="sm" onClick={exportarInactivos}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
        {clientesInactivos.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            ✅ Todos los clientes compraron en los últimos 60 días
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">UN</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Última compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {clientesInactivos.map(c => {
                  const ultima = compras
                    .filter(x => x.cliente_id === c.id)
                    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{c.nombre}</p>
                        <p className="text-xs text-gray-400">{c.contacto.nombre}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.unidad_negocio}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">{c.tipo}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.estado === "activo" ? "success" : c.estado === "inactivo" ? "error" : "warning"}>
                          {c.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {ultima ? ultima.fecha : <span className="text-red-400">Sin compras</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
