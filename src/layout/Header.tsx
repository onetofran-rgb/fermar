import { Sun, Moon, Bell, Building2 } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useCalendarioStore } from '../stores/calendarioStore';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { isSameDay, parseISO } from 'date-fns';

// Fecha de referencia del sistema (seed date)
const HOY_SEED = new Date('2026-05-19');

const UN_OPTIONS = [
  { value: 'todas', label: 'Todas las UN' },
  { value: 'UN1', label: 'UN1' },
  { value: 'UN2', label: 'UN2' },
  { value: 'UN3', label: 'UN3' },
];

export function Header() {
  const { tema, setTema, unidad_activa, setUnidadActiva } = useUIStore();
  const { eventos } = useCalendarioStore();

  // Comparamos contra la fecha seed para que la demo siempre muestre eventos "hoy"
  const eventosHoy = eventos.filter(e => {
    try { return isSameDay(parseISO(e.fecha), HOY_SEED) && !e.completado; } catch { return false; }
  }).length;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-amber-500" />
        <Select
          options={UN_OPTIONS}
          value={unidad_activa}
          onChange={e => setUnidadActiva(e.target.value as never)}
          className="text-sm border-gray-200 dark:border-gray-700 py-1.5"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          {eventosHoy > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {eventosHoy}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setTema(tema === 'light' ? 'dark' : 'light')}>
          {tema === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
