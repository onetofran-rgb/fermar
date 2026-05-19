import { useState, useCallback } from 'react';

export interface ToastItem {
  id: string;
  mensaje: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const mostrar = useCallback((mensaje: string, tipo: ToastItem['tipo'] = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const cerrar = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, mostrar, cerrar };
}
