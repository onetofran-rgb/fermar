import { useEffect } from 'react';
import { useClientesStore } from '../../stores/clientesStore';
import { useComprasStore } from '../../stores/comprasStore';
import { useInteraccionesStore } from '../../stores/interaccionesStore';
import { useCalendarioStore } from '../../stores/calendarioStore';
import { useUIStore } from '../../stores/uiStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatMoneda, formatFecha, LABEL_TIPO_INTERACCION } from '../../utils/formatters';
import { Users, ShoppingCart, MessageSquare, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { isToday, isThisWeek, isThisMonth, parseISO, subMonths, isSameMonth } from 'date-fns';

export function DashboardPage() {
  const { clientes, cargar: cargarClientes } = useClientesStore();
  const { compras, cargar: cargarCompras } = useComprasStore();
  const { interacciones, cargar: cargarInteracciones } = useInteraccionesStore();
  const { eventos, cargar: cargarEventos } = useCalendarioStore();
  const { unidad_activa } = useUIStore();

  useEffect(() => {
    cargarClientes(); cargarCompras(); cargarInteracciones(); cargarEventos();
  }, [cargarClientes, cargarCompras, cargarInteracciones, cargarEventos]);

  const filtrarPorUN = <T extends { unidad_negocio?: string; cliente_id?: string }>(items: T[], getUN?: (item: T) => string): T[] => {
    if (unidad_activa === 'todas') return items;
    if (getUN) return items.filter(i => getUN(i) === unidad_activa);
    return items.filter(i => (i as { unidad_negocio?: string }).unidad_negocio === unidad_activa);
  };

  const clientesFiltrados = filtrarPorUN(clientes);
  const clientesActivos = clientesFiltrados.filter(c => c.estado === 'activo').length;

  const clienteIdsPorUN = new Set(clientesFiltrados.map(c => c.id));
  const comprasFiltradas = unidad_activa === 'todas'
    ? compras
    : compras.filter(c => clienteIdsPorUN.has(c.cliente_id));

  const ventasMes = comprasFiltradas
    .filter(c => { try { return isThisMonth(parseISO(c.fecha)); } catch { return false; } })
    .reduce((s, c) => s + c.total, 0);

  const mesAnterior = subMonths(new Date(), 1);
  const ventasMesAnterior = comprasFiltradas
    .filter(c => { try { return isSameMonth(parseISO(c.fecha), mesAnterior); } catch { return false; } })
    .reduce((s, c) => s + c.total, 0);

  const pctCambio = ventasMesAnterior > 0
    ? ((ventasMes - ventasMesAnterior) / ventasMesAnterior * 100).toFixed(1)
    : null;

  const eventosHoy = eventos.filter(e => { try { return isToday(parseISO(e.fecha)) && !e.completado; } catch { return false; } }).length;
  const eventosSemana = eventos.filter(e => { try { return isThisWeek(parseISO(e.fecha)) && !e.completado; } catch { return false; } }).length;

  const pagosVencidos = comprasFiltradas.filter(c => c.estado_pago === 'vencido');
  const pagosPendientes = comprasFiltradas.filter(c => c.estado_pago === 'pendiente');

  const ultimasInteracciones = [...(unidad_activa === 'todas' ? interacciones : interacciones.filter(i => clienteIdsPorUN.has(i.cliente_id)))]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 5);

  const getCliente = (id: string) => clientes.find(c => c.id === id);

  const estadoPagoBadge = (estado: string) => {
    if (estado === 'pagado') return <Badge variant="success">Pagado</Badge>;
    if (estado === 'pendiente') return <Badge variant="warning">Pendiente</Badge>;
    return <Badge variant="error">Vencido</Badge>;
  };

  const canalBadge = (estado: string) => {
    const v: Record<string, 'success'|'info'|'error'|'neutral'> = {
      respondido: 'success', enviado: 'info', sin_respuesta: 'error', programado: 'neutral'
    };
    const labels: Record<string, string> = {
      respondido: 'Respondido', enviado: 'Enviado', sin_respuesta: 'Sin respuesta', programado: 'Programado'
    };
    return <Badge variant={v[estado] || 'neutral'}>{labels[estado] || estado}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Vision general del negocio {unidad_activa !== 'todas' ? `— ${unidad_activa}` : ''}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clientes activos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{clientesActivos}</p>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{clientesFiltrados.length} total incl. prospectos</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ventas del mes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatMoneda(ventasMes)}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          {pctCambio !== null && (
            <p className={`text-xs mt-2 ${parseFloat(pctCambio) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {parseFloat(pctCambio) >= 0 ? '+' : ''}{pctCambio}% vs. mes anterior
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contactos hoy</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{eventosHoy}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{eventosSemana} esta semana</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pagos vencidos</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{pagosVencidos.length}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{pagosPendientes.length} pendientes de cobro</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ultimas interacciones */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Ultimas interacciones</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {ultimasInteracciones.map(i => {
              const cliente = getCliente(i.cliente_id);
              return (
                <div key={i.id} className="px-5 py-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {cliente?.nombre || 'Desconocido'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {LABEL_TIPO_INTERACCION[i.tipo]} — {i.asunto}
                    </p>
                    <p className="text-xs text-gray-400">{formatFecha(i.fecha)}</p>
                  </div>
                  {canalBadge(i.canal_estado)}
                </div>
              );
            })}
            {ultimasInteracciones.length === 0 && (
              <p className="px-5 py-6 text-center text-gray-400 text-sm">Sin interacciones registradas</p>
            )}
          </div>
        </Card>

        {/* Proximos vencimientos */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Pagos pendientes y vencidos</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[...pagosVencidos, ...pagosPendientes].slice(0, 5).map(c => {
              const cliente = getCliente(c.cliente_id);
              return (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {cliente?.nombre || 'Desconocido'}
                    </p>
                    <p className="text-xs text-gray-400">{formatFecha(c.fecha)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatMoneda(c.total)}</p>
                    {estadoPagoBadge(c.estado_pago)}
                  </div>
                </div>
              );
            })}
            {pagosVencidos.length === 0 && pagosPendientes.length === 0 && (
              <p className="px-5 py-6 text-center text-gray-400 text-sm">Sin pagos pendientes</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
