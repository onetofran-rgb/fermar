import { create } from 'zustand';
import type { Compra } from '../types';
import { LS_KEYS } from '../data/seedData';

interface ComprasStore {
  compras: Compra[];
  cargar: () => void;
  agregar: (c: Compra) => void;
  actualizar: (c: Compra) => void;
  eliminar: (id: string) => void;
}

function load(): Compra[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.compras);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(data: Compra[]) {
  localStorage.setItem(LS_KEYS.compras, JSON.stringify(data));
}

export const useComprasStore = create<ComprasStore>((set, get) => ({
  compras: [],
  cargar: () => set({ compras: load() }),
  agregar: (c) => { const d = [...get().compras, c]; set({ compras: d }); save(d); },
  actualizar: (c) => { const d = get().compras.map(x => x.id === c.id ? c : x); set({ compras: d }); save(d); },
  eliminar: (id) => { const d = get().compras.filter(x => x.id !== id); set({ compras: d }); save(d); },
}));
