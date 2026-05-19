import { create } from 'zustand';
import type { Evento } from '../types';
import { LS_KEYS } from '../data/seedData';

interface CalendarioStore {
  eventos: Evento[];
  cargar: () => void;
  agregar: (e: Evento) => void;
  actualizar: (e: Evento) => void;
  eliminar: (id: string) => void;
}

function load(): Evento[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.eventos);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(data: Evento[]) {
  localStorage.setItem(LS_KEYS.eventos, JSON.stringify(data));
}

export const useCalendarioStore = create<CalendarioStore>((set, get) => ({
  eventos: [],
  cargar: () => set({ eventos: load() }),
  agregar: (e) => { const d = [...get().eventos, e]; set({ eventos: d }); save(d); },
  actualizar: (e) => { const d = get().eventos.map(x => x.id === e.id ? e : x); set({ eventos: d }); save(d); },
  eliminar: (id) => { const d = get().eventos.filter(x => x.id !== id); set({ eventos: d }); save(d); },
}));
