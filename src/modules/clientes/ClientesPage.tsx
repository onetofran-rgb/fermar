import { useEffect, useState } from 'react';
import { useClientesStore } from '../../stores/clientesStore';
import { useUIStore } from '../../stores/uiStore';
import type { Cliente } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ClienteForm } from './ClienteForm';
import { formatFecha, LABEL_TIPO_CLIENTE, LABEL_ESTADO_CLIENTE } from '../../utils/formatters';
import { Plus, Users, Star, Phone, Mail, LayoutGrid, List, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  mostrarToast: (msg: string, tipo?: 'success'|'error'|'info'|'warning') => void;
}

type SortKey = 'nombre' | 'estado' | 'score_cliente' | 'ultima_compra';
type Vista = 'tabla' | 'tarjetas';

const ESTADO_BADGE: Record<string, 'success'|'error'|'info'> = {
  activo: 'success', inactivo: 'error', prospecto: 'info',
};

const OPCIONES_TIPO = [
  { value: '', label: 'Todos los tipos' },
  { value: 'panadero', label: 'Panadero' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'minorista', label: 'Minorista' },
];

const OPCIONES_ESTADO = [
  { value: '', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'prospecto', label: 'Prospecto' },
];

export function ClientesPage({ mostrarToast }: Props) {
  const { clientes, cargar, agregar, actualizar, eliminar } = useClientesStore();
  const { unidad_activa } = useUIStore();

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [vista, setVista] = useState<Vista>('tabla');
  const [sortKey, setSortKey] = useState<SortKey>('nombre');
  const [sortAsc, setSortAsc] = useState(true);
  const [pag, setPag] = useState(1);
  const POR_PAG = 10;

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { setPag(1); }, [busqueda, filtroTipo, filtroEstado, unidad_activa]);

  const filtrados = clientes
    .filter(c => unidad_activa === 'todas' || c.unidad_negocio === unidad_activa)
    .filter(c => filtroTipo === '' || c.tipo === filtroTipo)
    .filter(c => filtroEstado === '' || c.estado === filtroEstado)
    .filter(c => {
      if (!busqueda) return true;
      const q = busqueda.toLowerCase();
      return c.nombre.toLowerCase().includes(q) ||
        c.ciudad.toLowerCase().includes(q) ||
        c.contacto.nombre.toLowerCase().includes(q) ||
        c.contacto.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let va: string | number = a[sortKey] ?? '';
      let vb: string | number = b[sortKey] ?? '';
      if (sortKey === 'score_cliente') { va = a.score_cliente; vb = b.score_cliente; }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });

  const totalPags = Math.max(1, Math.ceil(filtrados.length / POR_PAG));
  const pagina = filtrados.slice((pag - 1) * POR_PAG, pag * POR_PAG);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  function handleGuardar(c: Cliente) {
    if (clienteEditando) { actualizar(c); mostrarToast('Cliente actualizado correctamente'); }
    else { agregar(c); mostrarToast('Cliente agregado correctamente'); }
    setModalAbierto(false);
    setClienteEditando(null);
  }

  function handleEliminar(id: string) {
    eliminar(id);
    mostrarToast('Cliente eliminado', 'info');
    setClienteDetalle(null);
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtrados.length} clientes encontrados
          </p>
        </div>
        <Button onClick={() => { setClienteEditando(null); setModalAbierto(true); }}>
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Buscar por nombre, ciudad, contacto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <Select options={OPCIONES_TIPO} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} />
          <Select options={OPCIONES_ESTADO} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} />
          <div className="flex gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button onClick={() => setVista('tabla')} className={`p-1.5 rounded ${vista === 'tabla' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setVista('tarjetas')} className={`p-1.5 rounded ${vista === 'tarjetas' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Vista tabla */}
      {vista === 'tabla' && (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  {([['nombre', 'Nombre'] , ['estado', 'Estado'], ['score_cliente', 'Score'], ['ultima_compra', 'Ultima compra']] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="px-4 py-3 text-left font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort(key)}>
                      <span className="flex items-center gap-1">{label}<SortIcon k={key} /></span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">UN</th>
                  <th className="px-4 py-3 text-left font-medium">Ciudad</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {pagina.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => setClienteDetalle(c)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{c.nombre}</div>
                      <div className="text-xs text-gray-400">{c.contacto.nombre}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ESTADO_BADGE[c.estado]}>{LABEL_ESTADO_CLIENTE[c.estado]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{c.score_cliente}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {formatFecha(c.ultima_compra)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {LABEL_TIPO_CLIENTE[c.tipo]}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{c.unidad_negocio}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.ciudad}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setClienteEditando(c); setModalAbierto(true); }}>Editar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagina.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No se encontraron clientes</p>
              </div>
            )}
          </div>
          {/* Paginacion */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">{filtrados.length} resultados</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={pag === 1} onClick={() => setPag(p => p - 1)}>Anterior</Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center px-2">{pag} / {totalPags}</span>
              <Button variant="secondary" size="sm" disabled={pag === totalPags} onClick={() => setPag(p => p + 1)}>Siguiente</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Vista tarjetas */}
      {vista === 'tarjetas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagina.map(c => (
            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" padding={false}>
              <div className="p-4" onClick={() => setClienteDetalle(c)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{c.nombre}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{LABEL_TIPO_CLIENTE[c.tipo]} — {c.ciudad}</p>
                  </div>
                  <Badge variant={ESTADO_BADGE[c.estado]}>{LABEL_ESTADO_CLIENTE[c.estado]}</Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{c.contacto.telefono}</div>
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{c.contacto.email}</div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    Score: <span className="font-bold text-amber-600">{c.score_cliente}</span>
                  </div>
                  <Badge variant="neutral">{c.unidad_negocio}</Badge>
                </div>
              </div>
              <div className="px-4 pb-3 flex gap-2" onClick={e => e.stopPropagation()}>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => { setClienteEditando(c); setModalAbierto(true); }}>Editar</Button>
              </div>
            </Card>
          ))}
          {pagina.length === 0 && (
            <div className="col-span-3 py-12 text-center text-gray-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No se encontraron clientes</p>
            </div>
          )}
        </div>
      )}

      {/* Modal nuevo/editar */}
      <Modal open={modalAbierto} onClose={() => { setModalAbierto(false); setClienteEditando(null); }} titulo={clienteEditando ? 'Editar cliente' : 'Nuevo cliente'} ancho="lg">
        <ClienteForm
          inicial={clienteEditando}
          onGuardar={handleGuardar}
          onCancelar={() => { setModalAbierto(false); setClienteEditando(null); }}
        />
      </Modal>

      {/* Modal detalle */}
      {clienteDetalle && (
        <Modal open={!!clienteDetalle} onClose={() => setClienteDetalle(null)} titulo={clienteDetalle.nombre} ancho="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-gray-500">Tipo:</span> <span className="text-gray-900 dark:text-white">{LABEL_TIPO_CLIENTE[clienteDetalle.tipo]}</span></div>
              <div><span className="font-medium text-gray-500">UN:</span> <Badge variant="neutral">{clienteDetalle.unidad_negocio}</Badge></div>
              <div><span className="font-medium text-gray-500">Estado:</span> <Badge variant={ESTADO_BADGE[clienteDetalle.estado]}>{LABEL_ESTADO_CLIENTE[clienteDetalle.estado]}</Badge></div>
              <div><span className="font-medium text-gray-500">Score:</span> <span className="font-bold text-amber-600">{clienteDetalle.score_cliente}/100</span></div>
              <div><span className="font-medium text-gray-500">Ciudad:</span> <span className="text-gray-900 dark:text-white">{clienteDetalle.ciudad} — {clienteDetalle.zona}</span></div>
              <div><span className="font-medium text-gray-500">Direccion:</span> <span className="text-gray-900 dark:text-white">{clienteDetalle.direccion}</span></div>
              <div><span className="font-medium text-gray-500">Alta:</span> <span className="text-gray-900 dark:text-white">{formatFecha(clienteDetalle.fecha_alta)}</span></div>
              <div><span className="font-medium text-gray-500">Ultima compra:</span> <span className="text-gray-900 dark:text-white">{formatFecha(clienteDetalle.ultima_compra)}</span></div>
              <div><span className="font-medium text-gray-500">Proximo contacto:</span> <span className="text-gray-900 dark:text-white">{formatFecha(clienteDetalle.proximo_contacto)}</span></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-1 text-sm">
              <p><span className="font-medium text-gray-500">Contacto:</span> <span className="text-gray-900 dark:text-white">{clienteDetalle.contacto.nombre}</span></p>
              <p><span className="font-medium text-gray-500">Telefono:</span> <span className="text-gray-900 dark:text-white">{clienteDetalle.contacto.telefono}</span></p>
              <p><span className="font-medium text-gray-500">Email:</span> <span className="text-gray-900 dark:text-white">{clienteDetalle.contacto.email}</span></p>
              <p><span className="font-medium text-gray-500">WhatsApp:</span> <span className="text-gray-900 dark:text-white">{clienteDetalle.contacto.whatsapp}</span></p>
            </div>
            {clienteDetalle.notas_internas && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Notas internas:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">{clienteDetalle.notas_internas}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button onClick={() => { setClienteDetalle(null); setClienteEditando(clienteDetalle); setModalAbierto(true); }}>Editar</Button>
              <Button variant="danger" onClick={() => handleEliminar(clienteDetalle.id)}>Eliminar</Button>
              <Button variant="secondary" onClick={() => setClienteDetalle(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
