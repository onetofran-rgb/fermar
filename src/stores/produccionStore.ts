import { create } from 'zustand';
import type { Producto } from '../types';
import { LS_KEYS } from '../data/seedData';

interface ProduccionStore {
  productos: Producto[];
  cargar: () => void;
  agregar: (p: Producto) => void;
  actualizar: (p: Producto) => void;
  eliminar: (id: string) => void;
}

function load(): Producto[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.productos);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(data: Producto[]) {
  localStorage.setItem(LS_KEYS.productos, JSON.stringify(data));
}

export const useProduccionStore = create<ProduccionStore>((set, get) => ({
  productos: [],
  cargar: () => set({ productos: load() }),
  agregar: (p) => { const d = [...get().productos, p]; set({ productos: d }); save(d); },
  actualizar: (p) => { const d = get().productos.map(x => x.id === p.id ? p : x); set({ productos: d }); save(d); },
  eliminar: (id) => { const d = get().productos.filter(x => x.id !== id); set({ productos: d }); save(d); },
}));
