import { create } from 'zustand';
import type { Interaccion } from '../types';
import { LS_KEYS } from '../data/seedData';

interface InteraccionesStore {
  interacciones: Interaccion[];
  cargar: () => void;
  agregar: (i: Interaccion) => void;
  actualizar: (i: Interaccion) => void;
  eliminar: (id: string) => void;
}

function load(): Interaccion[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.interacciones);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(data: Interaccion[]) {
  localStorage.setItem(LS_KEYS.interacciones, JSON.stringify(data));
}

export const useInteraccionesStore = create<InteraccionesStore>((set, get) => ({
  interacciones: [],
  cargar: () => set({ interacciones: load() }),
  agregar: (i) => { const d = [...get().interacciones, i]; set({ interacciones: d }); save(d); },
  actualizar: (i) => { const d = get().interacciones.map(x => x.id === i.id ? i : x); set({ interacciones: d }); save(d); },
  eliminar: (id) => { const d = get().interacciones.filter(x => x.id !== id); set({ interacciones: d }); save(d); },
}));
