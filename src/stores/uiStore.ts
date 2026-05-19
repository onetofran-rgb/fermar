import { create } from 'zustand';
import type { UIState, TemaUI, UnidadNegocio, ConfigFirma } from '../types';
import { LS_KEYS } from '../data/seedData';

interface UIStore extends UIState {
  setTema: (tema: TemaUI) => void;
  setUnidadActiva: (un: UnidadNegocio) => void;
  setFirma: (firma: ConfigFirma) => void;
}

function loadUI(): UIState {
  try {
    const raw = localStorage.getItem(LS_KEYS.ui);
    if (raw) return JSON.parse(raw) as UIState;
  } catch {}
  return {
    tema: 'light',
    unidad_activa: 'todas',
    firma: { nombre: 'Equipo Comercial', cargo: 'Representante de Ventas', empresa: 'FERMAR Distribuidora', telefono: '0351-4000000', email: 'ventas@fermar.com.ar' },
  };
}

function saveUI(state: UIState) {
  localStorage.setItem(LS_KEYS.ui, JSON.stringify(state));
}

export const useUIStore = create<UIStore>((set, get) => ({
  ...loadUI(),
  setTema: (tema) => {
    set({ tema });
    saveUI({ ...get(), tema });
    if (tema === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  },
  setUnidadActiva: (unidad_activa) => {
    set({ unidad_activa });
    saveUI({ ...get(), unidad_activa });
  },
  setFirma: (firma) => {
    set({ firma });
    saveUI({ ...get(), firma });
  },
}));
