import { useEffect, useState } from "react";
import { useInteraccionesStore } from "../../stores/interaccionesStore";
import { useClientesStore } from "../../stores/clientesStore";
import { useUIStore } from "../../stores/uiStore";
import type { Interaccion } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { InteraccionForm } from "./InteraccionForm";
import { ComunicacionModal } from "./ComunicacionModal";
import { formatFecha, LABEL_TIPO_INTERACCION, LABEL_CANAL_ESTADO } from "../../utils/formatters";
import { Plus, MessageSquare, Mail, Phone, MapPin, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  mostrarToast: (msg: string, tipo?: "success"|"error"|"info"|"warning") => void;
}

const TIPO_ICON: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4 text-green-500" />,
  telefonico: <Phone className="h-4 w-4 text-blue-500" />,
  visita_directa: <MapPin className="h-4 w-4 text-amber-500" />,
};

const CANAL_BADGE: Record<string, "success"|"info"|"error"|"neutral"|"warning"> = {
  respondido: "success",
  enviado: "info",
  sin_respuesta: "error",
  programado: "neutral",
};

const OPT_TIPO = [
  { value: "", label: "Todos los tipos" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telefonico", label: "Telefonico" },
  { value: "visita_directa", label: "Visita Directa" },
];

const OPT_ESTADO = [
  { value: "", label: "Todos los estados" },
  { value: "enviado", label: "Enviado" },
  { value: "respondido", label: "Respondido" },
  { value: "sin_respuesta", label: "Sin respuesta" },
  { value: "programado", label: "Programado" },
];

export function InteraccionesPage({ mostrarToast }: Props) {
  const { interacciones, cargar, agregar, actualizar, eliminar } = useInteraccionesStore();
  const { clientes, cargar: cargarClientes } = useClientesStore();
  const { unidad_activa } = useUIStore();

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [pag, setPag] = useState(1);
  const POR_PAG = 12;

  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState<Interaccion | null>(null);
  const [modalComun, setModalComun] = useState(false);
  const [clienteComun, setClienteComun] = useState<string | null>(null);

  useEffect(() => { cargar(); cargarClientes(); }, [cargar, cargarClientes]);
  useEffect(() => { setPag(1); }, [busqueda, filtroTipo, filtroEstado, filtroCliente, unidad_activa]);

  const clienteIdsPorUN = new Set(
    unidad_activa === "todas"
      ? clientes.map(c => c.id)
      : clientes.filter(c => c.unidad_negocio === unidad_activa).map(c => c.id)
  );

  const getCliente = (id: string) => clientes.find(c => c.id === id);

  const optClientes = [
    { value: "", label: "Todos los clientes" },
    ...clientes
      .filter(c => unidad_activa === "todas" || c.unidad_negocio === unidad_activa)
      .map(c => ({ value: c.id, label: c.nombre })),
  ];

  const filtradas = interacciones
    .filter(i => clienteIdsPorUN.has(i.cliente_id))
    .filter(i => !filtroTipo || i.tipo === filtroTipo)
    .filter(i => !filtroEstado || i.canal_estado === filtroEstado)
    .filter(i => !filtroCliente || i.cliente_id === filtroCliente)
    .filter(i => {
      if (!busqueda) return true;
      const q = busqueda.toLowerCase();
      const c = getCliente(i.cliente_id);
      return i.asunto.toLowerCase().includes(q) ||
        i.contenido.toLowerCase().includes(q) ||
        (c?.nombre.toLowerCase().includes(q) ?? false);
    })
    .sort((a, b) => sortAsc
      ? a.fecha.localeCompare(b.fecha)
      : b.fecha.localeCompare(a.fecha)
    );

  const totalPags = Math.max(1, Math.ceil(filtradas.length / POR_PAG));
  const pagina = filtradas.slice((pag - 1) * POR_PAG, pag * POR_PAG);

  function handleGuardar(i: Interaccion) {
    if (editando) { actualizar(i); mostrarToast("Interaccion actualizada"); }
    else { agregar(i); mostrarToast("Interaccion registrada"); }
    setModalForm(false);
    setEditando(null);
  }

  function handleEliminar(id: string) {
    eliminar(id);
    mostrarToast("Interaccion eliminada", "info");
  }

  function abrirComunicacion(clienteId: string) {
    setClienteComun(clienteId);
    setModalComun(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interacciones</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtradas.length} registros encontrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setClienteComun(null); setModalComun(true); }}>
            <Mail className="h-4 w-4" /> Enviar comunicacion
          </Button>
          <Button onClick={() => { setEditando(null); setModalForm(true); }}>
            <Plus className="h-4 w-4" /> Registrar interaccion
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <Input placeholder="Buscar por asunto, contenido, cliente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <Select options={OPT_TIPO} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} />
          <Select options={OPT_ESTADO} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} />
          <Select options={optClientes} value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />
          <Button variant="ghost" size="sm" onClick={() => setSortAsc(a => !a)}>
            Fecha {sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      {/* Lista */}
      <div className="space-y-3">
        {pagina.map(i => {
          const cliente = getCliente(i.cliente_id);
          const esPasada = i.canal_estado !== "programado";
          return (
            <Card key={i.id} padding={false} className="hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg ${esPasada ? "bg-gray-100 dark:bg-gray-700" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                    {TIPO_ICON[i.tipo]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{cliente?.nombre ?? "Cliente desconocido"}</span>
                          <Badge variant="neutral">{LABEL_TIPO_INTERACCION[i.tipo]}</Badge>
                          <Badge variant={CANAL_BADGE[i.canal_estado]}>{LABEL_CANAL_ESTADO[i.canal_estado]}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{i.asunto}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{i.contenido}</p>
                        {i.resultado && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            <span className="font-medium">Resultado:</span> {i.resultado}
                          </p>
                        )}
                        {i.proxima_accion && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            <span className="font-medium">Proxima accion:</span> {i.proxima_accion}
                          </p>
                        )}
                        {i.adjuntos.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {i.adjuntos.map((a, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                {a.nombre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{formatFecha(i.fecha, "dd/MM/yyyy HH:mm")}</p>
                        <p className="text-xs text-gray-400">{formatFecha(i.fecha, "EEEE")}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {cliente && (
                    <Button variant="ghost" size="sm" onClick={() => abrirComunicacion(i.cliente_id)}>
                      <Mail className="h-3.5 w-3.5" /> Comunicar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { setEditando(i); setModalForm(true); }}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEliminar(i.id)} className="text-red-500 hover:text-red-700">
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {pagina.length === 0 && (
          <Card className="py-12 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400">No se encontraron interacciones</p>
          </Card>
        )}
      </div>

      {/* Paginacion */}
      {totalPags > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={pag === 1} onClick={() => setPag(p => p - 1)}>Anterior</Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">{pag} / {totalPags}</span>
          <Button variant="secondary" size="sm" disabled={pag === totalPags} onClick={() => setPag(p => p + 1)}>Siguiente</Button>
        </div>
      )}

      {/* Modal registrar/editar */}
      <Modal open={modalForm} onClose={() => { setModalForm(false); setEditando(null); }} titulo={editando ? "Editar interaccion" : "Registrar interaccion"} ancho="lg">
        <InteraccionForm
          inicial={editando}
          clientes={clientes.filter(c => unidad_activa === "todas" || c.unidad_negocio === unidad_activa)}
          onGuardar={handleGuardar}
          onCancelar={() => { setModalForm(false); setEditando(null); }}
        />
      </Modal>

      {/* Modal comunicacion */}
      <Modal open={modalComun} onClose={() => { setModalComun(false); setClienteComun(null); }} titulo="Nueva comunicacion" ancho="xl">
        <ComunicacionModal
          clientes={clientes.filter(c => unidad_activa === "todas" || c.unidad_negocio === unidad_activa)}
          clientePreseleccionado={clienteComun}
          onEnviar={(i) => { agregar(i); mostrarToast("Comunicacion registrada correctamente"); setModalComun(false); }}
          onCerrar={() => { setModalComun(false); setClienteComun(null); }}
        />
      </Modal>
    </div>
  );
}