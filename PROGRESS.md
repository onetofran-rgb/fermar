# PROGRESS.md — FERMAR CRM

## Estado General
✅ **Sistema completo — todas las 8 fases implementadas**

## Última sesión — 2026-05-19
- ✅ FASE 4: Compras (tabla paginada, KPIs, modal detalle, export CSV) + Producción (stock, previsibilidad)
- ✅ FASE 5: Calendario (vista mensual/semanal, crear/editar/completar eventos, link GCal)
- ✅ FASE 6: Reportes (ranking clientes, distribución UN, proyección 30d, top productos, canales, inactivos)
- ✅ FASE 7: Demo interactiva (10 slides, navegación teclado, fullscreen, miniaturas)
- ✅ FASE 8: Polish (dark mode verificado, toast con animación, header con fecha seed correcta)

## Módulos implementados

| Módulo         | Estado | Notas |
|----------------|--------|-------|
| Dashboard      | ✅     | KPIs reales, últimas interacciones, pagos pendientes |
| Clientes       | ✅     | Tabla + cards, filtros, paginación, form completo |
| Interacciones  | ✅     | Historial, filtros, ComunicacionModal (email + WA) |
| Compras        | ✅     | Pedidos, estados de pago, export CSV |
| Producción     | ✅     | Stock semáforo, previsibilidad con gráfico |
| Calendario     | ✅     | Vista mes/semana, eventos, GCal export |
| Reportes       | ✅     | 6 análisis con Recharts, export CSV |
| Demo           | ✅     | 10 slides, fullscreen, navegación teclado |

## Seed data cargada
- 15 clientes (Córdoba, Argentina — UN1/UN2/UN3)
- 8 productos (harinas, levadura, grasa, etc.)
- 25 compras con múltiples ítems
- 30 interacciones históricas y programadas
- 5 eventos de calendario (alrededor del 2026-05-19)

## Stack técnico
- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS v3 (dark mode: 'class')
- Zustand v4 (7 stores: clientes, compras, interacciones, produccion, calendario, ui)
- Recharts (LineChart, BarChart, PieChart)
- date-fns v3, lucide-react, react-router-dom v6
- Persistencia: localStorage con prefijo FERMAR_*

## Pendientes / Backlog
- [ ] Deploy en Vercel (opcional)
- [ ] Conectar con backend real (Supabase/Firebase) cuando escale
- [ ] Tests automatizados (vitest)
- [ ] Filtro por UN activo en Dashboard y Reportes
- [ ] Notificaciones push para eventos del día

## TODOs activos en código
- `ClienteForm.tsx`: score hardcodeado a 50 para nuevos clientes (TODO: calcular dinámicamente)
- `DemoPage.tsx`: datos de cobros son ejemplos estáticos en slide 6

## Git log resumido
- feat: scaffold inicial y configuración base
- feat: FASE 1 — tipos, stores, utilidades, seedData
- feat: FASE 2 — layout, dashboard, componentes UI
- feat: FASE 3 — módulo clientes + interacciones + comunicación
- feat: FASE 4 — módulo compras y producción completos
- feat: FASE 5 — módulo calendario completo
- feat: FASE 6 — módulo reportes con análisis completo
- feat: FASE 7 — demo interactiva con 10 slides
- feat: FASE 8 — polish, animación toasts, fecha seed en header
