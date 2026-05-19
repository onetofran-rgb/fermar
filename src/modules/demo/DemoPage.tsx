import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2, X,
  Users, ShoppingCart, Factory, Calendar, BarChart2,
  MessageCircle, CheckCircle, TrendingUp, Zap, Star,
} from "lucide-react";

// ─── Datos de cada slide ──────────────────────────────────────────────────────

interface Slide {
  id: number;
  titulo: string;
  subtitulo: string;
  contenido: React.ReactNode;
  color: string; // gradiente de fondo
}

// ─── Componentes reutilizables dentro de slides ───────────────────────────────

function StatCard({ valor, label, icono, color }: { valor: string; label: string; icono: React.ReactNode; color: string }) {
  return (
    <div className={`rounded-2xl p-5 ${color} flex flex-col gap-2`}>
      <div className="opacity-80">{icono}</div>
      <p className="text-3xl font-black">{valor}</p>
      <p className="text-sm opacity-70 font-medium">{label}</p>
    </div>
  );
}

function FeatureItem({ icono, titulo, desc }: { icono: React.ReactNode; titulo: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-white/20 rounded-xl flex-shrink-0">{icono}</div>
      <div>
        <p className="font-bold text-lg">{titulo}</p>
        <p className="opacity-70 text-sm mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function ModuloCard({ icono, nombre, desc, activo }: { icono: React.ReactNode; nombre: string; desc: string; activo?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border-2 transition-all ${activo ? "border-white bg-white/20 scale-105" : "border-white/20 bg-white/10"}`}>
      <div className="mb-2">{icono}</div>
      <p className="font-bold">{nombre}</p>
      <p className="text-xs opacity-70 mt-0.5">{desc}</p>
    </div>
  );
}

// ─── Slides del demo ──────────────────────────────────────────────────────────

const SLIDES: Slide[] = [
  {
    id: 1,
    titulo: "FERMAR CRM",
    subtitulo: "Sistema de gestión comercial para distribuidoras",
    color: "from-amber-600 to-orange-700",
    contenido: (
      <div className="flex flex-col items-center justify-center h-full gap-8 text-center text-white">
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center">
          <span className="text-5xl font-black text-white">F</span>
        </div>
        <div>
          <h2 className="text-5xl font-black mb-4">FERMAR CRM</h2>
          <p className="text-xl opacity-80 max-w-xl">
            Gestión comercial integral para tu distribuidora — clientes, ventas, producción y agenda en un solo lugar.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 w-full max-w-2xl">
          <StatCard valor="15" label="Clientes activos" icono={<Users className="h-6 w-6 text-white" />} color="bg-white/15" />
          <StatCard valor="$556k" label="Ventas mayo" icono={<TrendingUp className="h-6 w-6 text-white" />} color="bg-white/15" />
          <StatCard valor="8" label="Módulos" icono={<Zap className="h-6 w-6 text-white" />} color="bg-white/15" />
        </div>
      </div>
    ),
  },
  {
    id: 2,
    titulo: "El problema",
    subtitulo: "¿Qué pasa sin un CRM?",
    color: "from-gray-700 to-gray-900",
    contenido: (
      <div className="flex flex-col justify-center h-full gap-6 text-white">
        <h2 className="text-4xl font-black">Sin un CRM, perdés...</h2>
        <div className="grid grid-cols-2 gap-5">
          {[
            { emoji: "📋", titulo: "Control de clientes", desc: "No sabés quién compró hace cuánto ni quién necesita seguimiento urgente." },
            { emoji: "💰", titulo: "Ventas por falta de seguimiento", desc: "El 60% de las ventas perdidas se deben a un seguimiento tardío o inexistente." },
            { emoji: "📦", titulo: "Visibilidad del stock", desc: "Sin proyección de demanda, el stockout detiene la producción." },
            { emoji: "📅", titulo: "Organización de agenda", desc: "Visitas y llamadas se pierden entre papeles y mensajes de WhatsApp." },
          ].map(item => (
            <div key={item.titulo} className="bg-white/10 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-3xl">{item.emoji}</span>
              <div>
                <p className="font-bold text-lg">{item.titulo}</p>
                <p className="text-sm opacity-70 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    titulo: "Módulos",
    subtitulo: "Todo en un solo sistema",
    color: "from-blue-600 to-indigo-800",
    contenido: (
      <div className="flex flex-col justify-center h-full gap-6 text-white">
        <h2 className="text-4xl font-black">8 módulos integrados</h2>
        <div className="grid grid-cols-4 gap-3">
          <ModuloCard icono={<Users className="h-6 w-6" />} nombre="Clientes" desc="Base CRM completa" activo />
          <ModuloCard icono={<MessageCircle className="h-6 w-6" />} nombre="Interacciones" desc="Historial y comunicación" />
          <ModuloCard icono={<ShoppingCart className="h-6 w-6" />} nombre="Compras" desc="Pedidos y cobros" />
          <ModuloCard icono={<Factory className="h-6 w-6" />} nombre="Producción" desc="Stock y capacidad" />
          <ModuloCard icono={<Calendar className="h-6 w-6" />} nombre="Calendario" desc="Agenda comercial" />
          <ModuloCard icono={<BarChart2 className="h-6 w-6" />} nombre="Reportes" desc="KPIs y proyecciones" />
          <ModuloCard icono={<TrendingUp className="h-6 w-6" />} nombre="Dashboard" desc="Vista ejecutiva" />
          <ModuloCard icono={<Zap className="h-6 w-6" />} nombre="Demo" desc="Esta presentación" activo />
        </div>
        <p className="text-center opacity-60 text-sm">100% en el navegador · Sin instalación · Datos en tu dispositivo</p>
      </div>
    ),
  },
  {
    id: 4,
    titulo: "Clientes",
    subtitulo: "Gestión CRM completa",
    color: "from-emerald-600 to-teal-800",
    contenido: (
      <div className="flex flex-col justify-center h-full gap-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl"><Users className="h-8 w-8" /></div>
          <div>
            <h2 className="text-4xl font-black">Módulo Clientes</h2>
            <p className="opacity-70">Panaderos, supermercados y minoristas</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-4">
            <FeatureItem
              icono={<Users className="h-5 w-5 text-white" />}
              titulo="Ficha completa de cliente"
              desc="Datos de contacto, zona, unidad de negocio, historial y score."
            />
            <FeatureItem
              icono={<TrendingUp className="h-5 w-5 text-white" />}
              titulo="Score automático"
              desc="Puntuación de 0 a 100 basada en frecuencia y volumen de compra."
            />
            <FeatureItem
              icono={<CheckCircle className="h-5 w-5 text-white" />}
              titulo="Filtros y búsqueda"
              desc="Por tipo, estado, unidad de negocio y texto libre."
            />
          </div>
          <div className="bg-white/10 rounded-2xl p-5 space-y-3">
            <p className="font-bold text-lg mb-3">Vista de ejemplo</p>
            {[
              { nombre: "Panadería Regina", tipo: "Panadero", estado: "Activo", score: 88 },
              { nombre: "Mercado Córdoba", tipo: "Supermercado", estado: "Activo", score: 72 },
              { nombre: "Almacén Dos Ríos", tipo: "Minorista", estado: "Prospecto", score: 45 },
            ].map(c => (
              <div key={c.nombre} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2.5">
                <div>
                  <p className="font-semibold text-sm">{c.nombre}</p>
                  <p className="text-xs opacity-60">{c.tipo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">{c.estado}</p>
                  <p className="font-bold text-amber-300">{c.score}pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    titulo: "Comunicación",
    subtitulo: "Email y WhatsApp con plantillas",
    color: "from-purple-600 to-pink-700",
    contenido: (
      <div className="flex flex-col justify-center h-full gap-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl"><MessageCircle className="h-8 w-8" /></div>
          <div>
            <h2 className="text-4xl font-black">Comunicación integrada</h2>
            <p className="opacity-70">Email y WhatsApp desde el sistema</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="font-bold mb-2 flex items-center gap-2">✉️ Email con plantillas</p>
              <ul className="space-y-1 text-sm opacity-80">
                <li>• Seguimiento comercial</li>
                <li>• Oferta especial</li>
                <li>• Cobranza / recordatorio</li>
                <li>• Bienvenida a nuevos clientes</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="font-bold mb-2 flex items-center gap-2">💬 WhatsApp Web</p>
              <ul className="space-y-1 text-sm opacity-80">
                <li>• Mensaje pre-armado automáticamente</li>
                <li>• Abre WhatsApp Web directo</li>
                <li>• Queda registrado en historial</li>
              </ul>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-5">
            <p className="text-xs opacity-60 mb-1">Vista previa — WhatsApp</p>
            <div className="bg-green-900/50 border border-green-500/30 rounded-xl p-4 text-sm space-y-1">
              <p className="font-semibold text-green-300">Panadería Regina</p>
              <p className="opacity-80 text-xs mt-2">
                Hola Roberto! Te contactamos desde FERMAR para recordarte que tenemos disponibilidad de <strong>Harina 000</strong> esta semana.
              </p>
              <p className="opacity-80 text-xs">
                Podemos coordinar entrega para el miércoles. ¿Te interesa?
              </p>
              <p className="opacity-60 text-xs mt-3">— Equipo Comercial FERMAR</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    titulo: "Compras y Cobros",
    subtitulo: "Pedidos, estados y seguimiento de pagos",
    color: "from-orange-600 to-red-700",
    contenido: (
      <div className="flex flex-col justify-center h-full gap-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl"><ShoppingCart className="h-8 w-8" /></div>
          <div>
            <h2 className="text-4xl font-black">Compras y Cobros</h2>
            <p className="opacity-70">Control total del flujo de ventas</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatCard valor="$556k" label="Total facturado" icono={<TrendingUp className="h-6 w-6 text-white" />} color="bg-white/15" />
          <StatCard valor="$87k" label="Pendiente de cobro" icono={<ShoppingCart className="h-6 w-6 text-white" />} color="bg-yellow-500/30" />
          <StatCard valor="$35k" label="Vencido sin cobrar" icono={<X className="h-6 w-6 text-white" />} color="bg-red-500/30" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white/10 rounded-2xl p-4 space-y-3">
            <p className="font-bold">Funcionalidades</p>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Creación de pedidos con múltiples productos</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Estados: pendiente / parcial / cobrado / vencido</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Vista detallada por ítem con totales</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Export CSV completo</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="font-bold mb-3">Estados de pago</p>
            <div className="space-y-2">
              {[
                { estado: "Cobrado", count: 18, color: "bg-green-400" },
                { estado: "Pendiente", count: 5, color: "bg-yellow-400" },
                { estado: "Pago parcial", count: 1, color: "bg-orange-400" },
                { estado: "Vencido", count: 1, color: "bg-red-400" },
              ].map(e => (
                <div key={e.estado} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${e.color}`} />
                  <span className="text-sm flex-1">{e.estado}</span>
                  <span className="font-bold">{e.count}</span>
                  <div className="w-24 bg-white/10 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${e.color}`} style={{ width: `${(e.count / 25) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    titulo: "Producción",
    subtitulo: "Stock, capacidad y previsibilidad de demanda",
    color: "from-teal-600 to-cyan-800",
    contenido: (
      <div className="flex flex-col justify-center h-full gap-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl"><Factory className="h-8 w-8" /></div>
          <div>
            <h2 className="text-4xl font-black">Producción e inventario</h2>
            <p className="opacity-70">Nunca más un stockout sorpresivo</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <FeatureItem
              icono={<Factory className="h-5 w-5 text-white" />}
              titulo="Stock en tiempo real"
              desc="Semáforo de estado: OK / Bajo / Crítico según días de cobertura."
            />
            <FeatureItem
              icono={<BarChart2 className="h-5 w-5 text-white" />}
              titulo="Gráfico de previsibilidad"
              desc="Proyección día a día basada en la demanda histórica real."
            />
            <FeatureItem
              icono={<TrendingUp className="h-5 w-5 text-white" />}
              titulo="Alerta temprana"
              desc="Aviso cuando el stock proyectado cae bajo el mínimo seguro."
            />
          </div>
          <div className="bg-white/10 rounded-2xl p-5">
            <p className="font-bold mb-4">Productos monitoreados</p>
            <div className="space-y-2.5">
              {[
                { nombre: "Harina 000", stock: "450 bolsas", estado: "OK", color: "text-green-400" },
                { nombre: "Levadura", stock: "18 kg", estado: "Bajo", color: "text-yellow-400" },
                { nombre: "Grasa vacuna", stock: "25 kg", estado: "Crítico", color: "text-red-400" },
                { nombre: "Harina 0000", stock: "210 bolsas", estado: "OK", color: "text-green-400" },
              ].map(p => (
                <div key={p.nombre} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2">
                  <p className="text-sm font-medium">{p.nombre}</p>
                  <div className="text-right">
                    <p className="text-xs opacity-60">{p.stock}</p>
                    <p className={`text-xs font-bold ${p.color}`}>{p.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 8,
    titulo: "Reportes",
    subtitulo: "Análisis de performance y proyecciones",
    color: "from-violet-600 to-purple-800",
    contenido: (
      <div className="flex flex-col justify-center h-full gap-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl"><BarChart2 className="h-8 w-8" /></div>
          <div>
            <h2 className="text-4xl font-black">Reportes e inteligencia</h2>
            <p className="opacity-70">Datos para tomar mejores decisiones</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { titulo: "Ranking de clientes", desc: "Top 10 por volumen facturado con export CSV." },
            { titulo: "Distribución por UN", desc: "Ventas de UN1, UN2 y UN3 en gráfico circular." },
            { titulo: "Proyección 30 días", desc: "Ingresos estimados basados en promedio histórico." },
            { titulo: "Top 5 productos", desc: "Los productos que más ingresos generan." },
            { titulo: "Actividad por canal", desc: "Email, WhatsApp, llamadas — cuál funciona más." },
            { titulo: "Clientes inactivos", desc: "Alerta de clientes sin compra en +60 días." },
          ].map(r => (
            <div key={r.titulo} className="bg-white/10 rounded-2xl p-4">
              <p className="font-bold text-sm mb-1">{r.titulo}</p>
              <p className="text-xs opacity-70">{r.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
          <Star className="h-6 w-6 text-amber-300 flex-shrink-0" />
          <p className="text-sm opacity-80">
            Todos los reportes se calculan en tiempo real sobre los datos de la base. Al agregar nuevos clientes o compras, los análisis se actualizan automáticamente.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 9,
    titulo: "¿Por qué FERMAR CRM?",
    subtitulo: "Sin servidores, sin suscripciones, sin depender de nadie",
    color: "from-amber-500 to-orange-600",
    contenido: (
      <div className="flex flex-col justify-center h-full gap-6 text-white">
        <h2 className="text-4xl font-black text-center">¿Por qué elegir FERMAR CRM?</h2>
        <div className="grid grid-cols-2 gap-5">
          {[
            { emoji: "🌐", titulo: "100% en el navegador", desc: "No necesita instalación ni servidores. Funciona en cualquier PC o tablet." },
            { emoji: "🔒", titulo: "Datos en tu dispositivo", desc: "Toda la información se guarda localmente. Nadie accede a tus datos." },
            { emoji: "⚡", titulo: "Respuesta instantánea", desc: "Sin llamadas a servidores. Todo carga al instante." },
            { emoji: "🎨", titulo: "Modo oscuro incluido", desc: "Diseño profesional adaptable a cualquier entorno de trabajo." },
            { emoji: "📊", titulo: "Datos reales de demo", desc: "15 clientes, 25 compras y 30 interacciones de ejemplo listos para explorar." },
            { emoji: "🚀", titulo: "Listo para expandir", desc: "Arquitectura modular lista para conectar con backend real cuando escale." },
          ].map(item => (
            <div key={item.titulo} className="bg-white/15 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-bold">{item.titulo}</p>
                <p className="text-sm opacity-70 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 10,
    titulo: "Próximos pasos",
    subtitulo: "El sistema está listo — ¿qué viene después?",
    color: "from-gray-800 to-gray-950",
    contenido: (
      <div className="flex flex-col items-center justify-center h-full gap-8 text-white text-center">
        <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center">
          <span className="text-4xl font-black">F</span>
        </div>
        <h2 className="text-4xl font-black">¡El sistema está en marcha!</h2>
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl text-left">
          {[
            { paso: "01", titulo: "Explorar el sistema", desc: "Recorrés cada módulo con los datos de demo cargados." },
            { paso: "02", titulo: "Cargar tus datos reales", desc: "Agregás tus clientes, productos y primeras compras." },
            { paso: "03", titulo: "Escalar con backend", desc: "Conectamos con base de datos real cuando el volumen lo requiera." },
          ].map(p => (
            <div key={p.paso} className="bg-white/10 rounded-2xl p-5">
              <p className="text-3xl font-black text-amber-400 mb-2">{p.paso}</p>
              <p className="font-bold mb-1">{p.titulo}</p>
              <p className="text-sm opacity-60">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          <a
            href="/"
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 rounded-xl font-bold text-white transition-colors"
          >
            Ver el sistema en vivo →
          </a>
        </div>
        <p className="text-sm opacity-40 mt-2">Presioná ESC para salir de pantalla completa</p>
      </div>
    ),
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export function DemoPage() {
  const [slide, setSlide] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const total = SLIDES.length;
  const actual = SLIDES[slide];

  // Navegación con teclado
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
      e.preventDefault();
      setSlide(s => Math.min(s + 1, total - 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setSlide(s => Math.max(s - 1, 0));
    } else if (e.key === "Escape") {
      setFullscreen(false);
    }
  }, [total]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Toggle pantalla completa
  function toggleFullscreen() {
    if (!fullscreen) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    setFullscreen(f => !f);
  }

  return (
    <div className={`${fullscreen ? "fixed inset-0 z-50" : "relative"} flex flex-col`}>
      {/* Header de control (siempre visible) */}
      {!fullscreen && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Demo interactiva</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Usá ← → o los botones para navegar · {slide + 1} / {total}
            </p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-medium rounded-xl transition-colors text-sm"
          >
            <Maximize2 className="h-4 w-4" /> Pantalla completa
          </button>
        </div>
      )}

      {/* Slide principal */}
      <div
        className={`
          relative bg-gradient-to-br ${actual.color}
          ${fullscreen ? "flex-1 min-h-0" : "rounded-2xl"}
          overflow-hidden
        `}
        style={{ height: fullscreen ? undefined : "560px" }}
      >
        {/* Contenido del slide */}
        <div className="absolute inset-0 p-10 overflow-auto">
          {actual.contenido}
        </div>

        {/* Controles de navegación — superpuestos */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-8">
          {/* Botón anterior */}
          <button
            onClick={() => setSlide(s => Math.max(s - 1, 0))}
            disabled={slide === 0}
            className="p-3 bg-black/20 hover:bg-black/40 rounded-xl text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Dots de progreso */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all ${
                  i === slide
                    ? "w-6 h-2.5 bg-white"
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Botón siguiente / cerrar fullscreen */}
          <div className="flex items-center gap-2">
            {fullscreen && (
              <button
                onClick={() => setFullscreen(false)}
                className="p-3 bg-black/20 hover:bg-black/40 rounded-xl text-white transition-colors backdrop-blur-sm"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setSlide(s => Math.min(s + 1, total - 1))}
              disabled={slide === total - 1}
              className="p-3 bg-black/20 hover:bg-black/40 rounded-xl text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contador top-right en fullscreen */}
        {fullscreen && (
          <div className="absolute top-6 right-8 text-white/50 text-sm font-medium">
            {slide + 1} / {total}
          </div>
        )}
      </div>

      {/* Miniaturas debajo (solo en modo normal) */}
      {!fullscreen && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSlide(i)}
              className={`
                flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all text-left
                ${i === slide ? "border-amber-500 shadow-lg scale-105" : "border-transparent opacity-60 hover:opacity-90"}
              `}
            >
              <div className={`bg-gradient-to-br ${s.color} w-28 h-16 p-2 flex flex-col justify-end`}>
                <p className="text-white text-xs font-bold truncate">{s.titulo}</p>
                <p className="text-white/60 text-[10px] truncate">{s.subtitulo}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
