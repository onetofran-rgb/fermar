# DECISIONS.md — FERMAR CRM

## 2026-05-19 — Stack de persistencia: localStorage en lugar de base de datos

**Contexto**: El sistema es un demo 100% funcional que corre en el navegador sin backend.

**Opciones evaluadas**:
- IndexedDB: más potente pero API compleja y asincrónica
- localStorage + JSON: simple, sincrónico, suficiente para demo con ~15 clientes y ~30 registros por módulo

**Decisión tomada**: localStorage serializado como JSON con keys prefijadas `FERMAR_*`

**Consecuencias**: Límite de ~5MB (suficiente para demo). No persiste entre dispositivos ni usuarios.

---

## 2026-05-19 — Zustand stores separados por módulo

**Contexto**: Necesitamos estado global compartido entre rutas.

**Opciones evaluadas**:
- Un solo store grande: más simple pero difícil de mantener
- Stores separados por módulo: más verboso pero aislado y escalable

**Decisión tomada**: Un store por módulo (`clientesStore`, `comprasStore`, etc.) + `uiStore` global.

**Consecuencias**: Cada módulo carga su propio store al montarse (`cargar()` en useEffect). Evita cargar todo en memoria al inicio.

---

## 2026-05-19 — Seed data con fechas relativas a 2026-05-19

**Contexto**: El seed data necesita parecer "vivo" y actual para la demo.

**Decisión tomada**: Todas las fechas del seed se calculan con `addDays` / `subDays` relativos a la fecha hardcodeada `2026-05-19`. Así el dashboard siempre muestra datos coherentes con "hoy".

**Consecuencias**: Si el sistema se usa mucho después de 2026-05-19, los datos pueden parecer antiguos. Aceptable para demo.

---

## 2026-05-19 — Fase 2 (Clientes) incluida en Fase 1

**Contexto**: App.tsx requería el componente ClientesPage para compilar.

**Decisión tomada**: Se implementó el módulo completo de Clientes (CRUD, filtros, búsqueda, vistas) junto con la fundación, en lugar de dejarlo como placeholder.

**Consecuencias**: La Fase 2 ya está completa. La próxima sesión arranca directamente en Fase 3 (Interacciones).
