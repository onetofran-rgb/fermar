import { create } from 'zustand';
import type { Cliente } from '../types';
import { LS_KEYS } from '../data/seedData';

interface ClientesStore {
  clientes: Cliente[];
  cargar: () => void;
  agregar: (c: Cliente) => void;
  actualizar: (c: Cliente) => void;
  eliminar: (id: string) => void;
}

function load(): Cliente[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.clientes);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(clientes: Cliente[]) {
  localStorage.setItem(LS_KEYS.clientes, JSON.stringify(clientes));
}

export const useClientesStore = create<ClientesStore>((set, get) => ({
  clientes: [],
  cargar: () => set({ clientes: load() }),
  agregar: (c) => {
    const clientes = [...get().clientes, c];
    set({ clientes });
    save(clientes);
  },
  actualizar: (c) => {
    const clientes = get().clientes.map(x => x.id === c.id ? c : x);
    set({ clientes });
    save(clientes);
  },
  eliminar: (id) => {
    const clientes = get().clientes.filter(x => x.id !== id);
    set({ clientes });
    save(clientes);
  },
}));
