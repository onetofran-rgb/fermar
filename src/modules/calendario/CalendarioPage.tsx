import { useEffect, useState } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth,
  format, addMonths, subMonths, addWeeks, subWeeks, parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { useCalendarioStore } from "../../stores/calendarioStore";
import { useClientesStore } from "../../stores/clientesStore";
import type { Evento } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { EventoForm } from "./EventoForm";
import { generarId } from "../../utils/formatters";
import {
  Calendar, ChevronLeft, ChevronRight, Plus,
  Phone, Mail, MessageCircle, Video, Users,
  CheckCircle, Clock, Trash2, ExternalLink,
} from "lucide-react";

// ─── Constantes ──────────────────────────────────────────────────────────────

const HOY = new Date("2026-05-19");

type Vista = "mes" | "semana";

// Iconos por tipo de actividad
function IconoTipo({ tipo }: { tipo: Evento["tipo"] }) {
  const cls = "h-3 w-3";
  switch (tipo) {
    case "telefonico":     return <Phone className={cls} />;
    case "email":          return <Mail className={cls} />;
    case "whatsapp":       return <MessageCircle className={cls} />;
    case "video_llamada":  return <Video className={cls} />;
    default:               return <Users className={cls} />;
  }
}

// Color de fondo por tipo
function colorTipo(tipo: Evento["tipo"]) {
  switch (tipo) {
    case "telefonico":     return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "email":          return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "whatsapp":       return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
    case "video_llamada":  return "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    default:               return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  }
}

// Genera link de Google Calendar para un evento
function gcalLink(evento: Evento, nombreCliente: string) {
  const fecha = evento.fecha.replace(/-/g, "");
  const fechaFin = evento.fecha.replace(/-/g, ""); // mismo día, todo el día
  const titulo = encodeURIComponent(`[FERMAR] ${evento.tipo.replace("_", " ")} — ${nombreCliente}`);
  const detalle = encodeURIComponent(evento.notas || "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${fecha}/${fechaFin}&details=${detalle}&sf=true`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CalendarioPage() {
  const { eventos, cargar, agregar, actualizar, eliminar } = useCalendarioStore();
  const { clientes, cargar: cargarClientes } = useClientesStore();

  const [vista, setVista] = useState<Vista>("mes");
  const [cursor, setCursor] = useState(HOY);          // fecha de referencia para navegar
  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState<Evento | null>(null);
  const [fechaClick, setFechaClick] = useState<string | undefined>(undefined);
  const [detalle, setDetalle] = useState<Evento | null>(null);

  useEffect(() => { cargar(); cargarClientes(); }, [cargar, cargarClientes]);

  // ── helpers ──
  function nombreCliente(id: string) {
    return clientes.find(c => c.id === id)?.nombre ?? "Cliente desconocido";
  }

  function eventosDelDia(dia: Date) {
    return eventos.filter(e => {
      try { return isSameDay(parseISO(e.fecha), dia); } catch { return false; }
    });
  }

  function handleGuardar(e: Evento) {
    if (editando) { actualizar(e); }
    else { agregar({ ...e, id: generarId("evt") }); }
    setModalForm(false);
    setEditando(null);
    setFechaClick(undefined);
  }

  function handleEliminar(id: string) {
    eliminar(id);
    setDetalle(null);
  }

  function handleCompletar(evento: Evento) {
    actualizar({ ...evento, completado: !evento.completado });
    setDetalle(prev => prev?.id === evento.id ? { ...evento, completado: !evento.completado } : prev);
  }

  function abrirFormConFecha(dia: Date) {
    setEditando(null);
    setFechaClick(format(dia, "yyyy-MM-dd"));
    setModalForm(true);
  }

  // ── KPIs rápidos ──
  const pendientes = eventos.filter(e => !e.completado).length;
  const hoy = eventosDelDia(HOY).length;
  const semana = (() => {
    const ini = startOfWeek(HOY, { weekStartsOn: 1 });
    const fin = endOfWeek(HOY, { weekStartsOn: 1 });
    return eventos.filter(e => {
      try { const d = parseISO(e.fecha); return d >= ini && d <= fin; } catch { return false; }
    }).length;
  })();

  // ── Navegación ──
  function anterior() { setCursor(v => vista === "mes" ? subMonths(v, 1) : subWeeks(v, 1)); }
  function siguiente() { setCursor(v => vista === "mes" ? addMonths(v, 1) : addWeeks(v, 1)); }
  function irHoy() { setCursor(HOY); }

  const tituloNav = vista === "mes"
    ? format(cursor, "MMMM yyyy", { locale: es })
    : `Semana del ${format(startOfWeek(cursor, { weekStartsOn: 1 }), "d MMM", { locale: es })} al ${format(endOfWeek(cursor, { weekStartsOn: 1 }), "d MMM yyyy", { locale: es })}`;

  // ── Días del grid ──
  const diasGrid: Date[] = vista === "mes"
    ? eachDayOfInterval({
        start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
      })
    : eachDayOfInterval({
        start: startOfWeek(cursor, { weekStartsOn: 1 }),
        end: endOfWeek(cursor, { weekStartsOn: 1 }),
      });

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendario</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Agenda comercial y seguimiento de actividades</p>
        </div>
        <Button onClick={() => { setEditando(null); setFechaClick(undefined); setModalForm(true); }}>
          <Plus className="h-4 w-4" /> Nuevo evento
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Hoy</p>
              <p className="text-2xl font-bold text-amber-600">{hoy}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Esta semana</p>
              <p className="text-2xl font-bold text-blue-600">{semana}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{pendientes}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar de navegación */}
      <Card padding={false}>
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          {/* Vista toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-sm">
            {(["mes", "semana"] as Vista[]).map(v => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={`px-4 py-1.5 font-medium transition-colors capitalize ${
                  vista === v
                    ? "bg-amber-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navegación fecha */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={anterior}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-white capitalize min-w-48 text-center">
              {tituloNav}
            </span>
            <button
              onClick={siguiente}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={irHoy} className="ml-auto">
            Hoy
          </Button>
        </div>

        {/* Grid encabezado días */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {diasSemana.map(d => (
            <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className={`grid grid-cols-7 ${vista === "mes" ? "auto-rows-fr" : ""}`}>
          {diasGrid.map((dia, idx) => {
            const evsDia = eventosDelDia(dia);
            const esHoy = isSameDay(dia, HOY);
            const esMesActual = vista === "semana" || isSameMonth(dia, cursor);
            const esFds = dia.getDay() === 0 || dia.getDay() === 6;

            return (
              <div
                key={idx}
                onClick={() => abrirFormConFecha(dia)}
                className={`
                  border-b border-r border-gray-100 dark:border-gray-700/60
                  ${vista === "mes" ? "min-h-24 p-1" : "min-h-36 p-2"}
                  ${esMesActual ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"}
                  ${esFds ? "bg-gray-50/70 dark:bg-gray-900/20" : ""}
                  hover:bg-amber-50/50 dark:hover:bg-amber-900/10 cursor-pointer transition-colors group
                `}
              >
                {/* Número de día */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                      ${esHoy
                        ? "bg-amber-500 text-white"
                        : esMesActual
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-600"
                      }
                    `}
                  >
                    {format(dia, "d")}
                  </span>
                  {/* Botón + aparece en hover */}
                  <Plus className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Eventos del día */}
                <div className="space-y-0.5">
                  {evsDia.slice(0, vista === "mes" ? 3 : 10).map(ev => (
                    <div
                      key={ev.id}
                      onClick={e => { e.stopPropagation(); setDetalle(ev); }}
                      className={`
                        flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border cursor-pointer
                        hover:opacity-80 transition-opacity
                        ${ev.completado ? "opacity-50 line-through" : ""}
                        ${colorTipo(ev.tipo)}
                      `}
                    >
                      <IconoTipo tipo={ev.tipo} />
                      <span className="truncate">{nombreCliente(ev.cliente_id)}</span>
                    </div>
                  ))}
                  {evsDia.length > (vista === "mes" ? 3 : 10) && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 pl-1">
                      +{evsDia.length - (vista === "mes" ? 3 : 10)} más
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 justify-center">
        {[
          { tipo: "visita_directa" as const, label: "Visita" },
          { tipo: "telefonico" as const, label: "Llamada" },
          { tipo: "email" as const, label: "Email" },
          { tipo: "whatsapp" as const, label: "WhatsApp" },
          { tipo: "video_llamada" as const, label: "Video" },
        ].map(({ tipo, label }) => (
          <span key={tipo} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${colorTipo(tipo)}`}>
            <IconoTipo tipo={tipo} />
            {label}
          </span>
        ))}
      </div>

      {/* Modal detalle de evento */}
      {detalle && (
        <Modal
          open={!!detalle}
          onClose={() => setDetalle(null)}
          titulo="Detalle del evento"
          ancho="md"
        >
          <div className="space-y-4">
            {/* Tipo + cliente */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colorTipo(detalle.tipo)}`}>
              <IconoTipo tipo={detalle.tipo} />
              <span className="font-medium capitalize">{detalle.tipo.replace(/_/g, " ")}</span>
              <span className="ml-auto text-xs opacity-70">{detalle.fecha}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Cliente</span>
                <span className="font-medium text-gray-900 dark:text-white">{nombreCliente(detalle.cliente_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Responsable</span>
                <span className="font-medium text-gray-900 dark:text-white">{detalle.responsable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Estado</span>
                <Badge variant={detalle.completado ? "success" : "warning"}>
                  {detalle.completado ? "Completado" : "Pendiente"}
                </Badge>
              </div>
              {detalle.notas && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Notas</p>
                  <p className="text-gray-700 dark:text-gray-300">{detalle.notas}</p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCompletar(detalle)}
                className="flex-1"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {detalle.completado ? "Marcar pendiente" : "Marcar completado"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditando(detalle);
                  setDetalle(null);
                  setModalForm(true);
                }}
                className="flex-1"
              >
                Editar
              </Button>
              <a
                href={gcalLink(detalle, nombreCliente(detalle.cliente_id))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Agregar a Google Calendar"
              >
                <ExternalLink className="h-3.5 w-3.5" /> GCal
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEliminar(detalle.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal form crear / editar */}
      <Modal
        open={modalForm}
        onClose={() => { setModalForm(false); setEditando(null); setFechaClick(undefined); }}
        titulo={editando ? "Editar evento" : "Nuevo evento"}
        ancho="lg"
      >
        <EventoForm
          inicial={editando}
          fechaInicial={fechaClick}
          clientes={clientes}
          onGuardar={handleGuardar}
          onCancelar={() => { setModalForm(false); setEditando(null); setFechaClick(undefined); }}
        />
      </Modal>
    </div>
  );
}
