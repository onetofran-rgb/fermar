import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Users, MessageSquare, ShoppingCart,
  Factory, Calendar, BarChart2, Play, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/interacciones', icon: MessageSquare, label: 'Interacciones' },
  { to: '/compras', icon: ShoppingCart, label: 'Compras' },
  { to: '/produccion', icon: Factory, label: 'Produccion' },
  { to: '/calendario', icon: Calendar, label: 'Calendario' },
  { to: '/reportes', icon: BarChart2, label: 'Reportes' },
  { to: '/demo', icon: Play, label: 'Demo' },
  { to: '/configuracion', icon: Settings, label: 'Config' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={clsx(
      'flex flex-col bg-gray-900 text-white transition-all duration-300 flex-shrink-0',
      collapsed ? 'w-16' : 'w-56'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-none">FERMAR</p>
            <p className="text-gray-400 text-xs">Distribuidora</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
              isActive
                ? 'bg-amber-500 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-center py-3 border-t border-gray-700 text-gray-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
