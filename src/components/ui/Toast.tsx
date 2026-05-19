import { clsx } from 'clsx';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastItem } from '../../hooks/useToast';

interface ToastProps {
  toasts: ToastItem[];
  cerrar: (id: string) => void;
}

const configs = {
  success: { icon: CheckCircle, cls: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' },
  error: { icon: XCircle, cls: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' },
  info: { icon: Info, cls: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' },
  warning: { icon: AlertTriangle, cls: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300' },
};

export function ToastContainer({ toasts, cerrar }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map(t => {
        const { icon: Icon, cls } = configs[t.tipo];
        return (
          <div
            key={t.id}
            className={clsx(
              'flex items-start gap-3 rounded-xl border p-4 shadow-xl pointer-events-auto',
              'animate-[slideIn_0.25s_ease-out]',
              cls
            )}
            style={{ animation: 'slideInRight 0.25s ease-out' }}
          >
            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{t.mensaje}</p>
            <button
              onClick={() => cerrar(t.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
