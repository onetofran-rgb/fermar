# PROGRESS.md — FERMAR CRM

## Estado General
**En progreso — Fase 1 y 2 completadas**

## Última sesión — 2026-05-19
- ✅ FASE 1 completada: Fundación del proyecto (Vite + React + TS + Tailwind + Zustand)
- ✅ Tipos TypeScript completos (`src/types/index.ts`)
- ✅ 5 Zustand stores creados (clientes, interacciones, compras, produccion, calendario, ui)
- ✅ Seed data completo: 15 clientes, 25 compras, 30 interacciones, 8 productos, 5 eventos
- ✅ Layout base con Sidebar + Header colapsable
- ✅ Componentes UI reutilizables: Button, Input, Select, Card, Modal, Badge, Toast
- ✅ FASE 2 completada: Módulo Clientes con CRUD, filtros, búsqueda, vista tabla/tarjetas, modal detalle
- ✅ Dashboard funcional con KPIs reales del seed data
- ✅ Modo oscuro/claro implementado
- ✅ Build sin errores TypeScript
- ✅ Dev server corriendo en http://localhost:5173

## Pendientes Priorizados
- [ ] Alta: FASE 3 — Interacciones (historial + generador email + simulador WhatsApp)
- [ ] Alta: FASE 4 — Compras (CRUD) + Producción (stock + previsibilidad con Recharts)
- [ ] Media: FASE 5 — Calendario (vista mensual/semanal, drag & drop, exportar GCal)
- [ ] Media: FASE 6 — Reportes (KPIs, gráficos Recharts, export CSV)
- [ ] Baja: FASE 7 — Demo interactiva (slides, fullscreen)
- [ ] Baja: FASE 8 — Polish (responsive tablet, toasts mejorados, deploy Vercel)

## TODOs Activos en el Código
- Módulos placeholder: InteraccionesPage, ComprasPage, ProduccionPage, CalendarioPage, ReportesPage, DemoPage
- El score_cliente se hardcodea en 50 al crear clientes nuevos — pendiente calcular dinámicamente

## Stack
- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS 3 + Lucide React
- Zustand 4 (stores por módulo)
- date-fns 3, clsx, tailwind-merge
- Persistencia: localStorage (keys FERMAR_*)
