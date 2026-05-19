import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './layout/Layout';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { InteraccionesPage } from './modules/interacciones/InteraccionesPage';
import { ComprasPage } from './modules/compras/ComprasPage';
import { ProduccionPage } from './modules/produccion/ProduccionPage';
import { CalendarioPage } from './modules/calendario/CalendarioPage';
import { ReportesPage } from './modules/reportes/ReportesPage';
import { DemoPage } from './modules/demo/DemoPage';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { initializeSeedData } from './data/seedData';
import { useUIStore } from './stores/uiStore';
import { useCalendarioStore } from './stores/calendarioStore';

// Importacion diferida del modulo de clientes (se crea en Fase 2)
import { ClientesPage } from './modules/clientes/ClientesPage';

export default function App() {
  const { toasts, mostrar, cerrar } = useToast();
  const { tema } = useUIStore();
  const { cargar: cargarEventos } = useCalendarioStore();

  useEffect(() => {
    // Carga del seed data al primer uso
    initializeSeedData();
    cargarEventos();
  }, [cargarEventos]);

  useEffect(() => {
    // Aplica el tema guardado al arrancar
    if (tema === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [tema]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesPage mostrarToast={mostrar} />} />
          <Route path="interacciones" element={<InteraccionesPage mostrarToast={mostrar} />} />
          <Route path="compras" element={<ComprasPage />} />
          <Route path="produccion" element={<ProduccionPage />} />
          <Route path="calendario" element={<CalendarioPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="demo" element={<DemoPage />} />
        </Route>
      </Routes>
      <ToastContainer toasts={toasts} cerrar={cerrar} />
    </BrowserRouter>
  );
}
