export function exportarCSV(datos: Record<string, unknown>[], nombreArchivo: string): void {
  if (!datos.length) return;
  const headers = Object.keys(datos[0]);
  const filas = datos.map(fila =>
    headers.map(h => {
      const val = String(fila[h] ?? '');
      return val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );
  const csv = [headers.join(','), ...filas].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${nombreArchivo}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
