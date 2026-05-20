import { useState } from "react";
import { useUIStore } from "../../stores/uiStore";
import type { ConfigFirma } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import {
  Settings, User, Sun, Moon, Mail, MessageCircle,
  CheckCircle, Building2, Phone, AtSign,
} from "lucide-react";

interface Props {
  mostrarToast: (msg: string, tipo?: "success" | "error" | "info" | "warning") => void;
}

// Vista previa del email con la firma actual
function PreviewFirma({ firma }: { firma: ConfigFirma }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-sm">
      {/* Cabecera tipo email */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        <strong>De:</strong> {firma.nombre} &lt;{firma.email}&gt;
      </div>
      <div className="p-4 space-y-3">
        <p className="text-gray-600 dark:text-gray-400">
          Estimado/a cliente,<br />
          <br />
          Esperamos que se encuentre muy bien. Nos comunicamos desde <strong>FERMAR</strong> para...
        </p>
        {/* Firma */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
          <p className="font-semibold text-gray-700 dark:text-gray-300">{firma.nombre}</p>
          <p>{firma.cargo}</p>
          <p className="font-medium text-amber-600">{firma.empresa}</p>
          <p>📞 {firma.telefono}</p>
          <p>✉️ {firma.email}</p>
        </div>
      </div>
    </div>
  );
}

export function ConfiguracionPage({ mostrarToast }: Props) {
  const { tema, setTema, firma, setFirma } = useUIStore();
  const [editFirma, setEditFirma] = useState<ConfigFirma>({ ...firma });
  const [cambiosFirma, setCambiosFirma] = useState(false);

  function handleFirmaChange(campo: keyof ConfigFirma, valor: string) {
    setEditFirma(prev => ({ ...prev, [campo]: valor }));
    setCambiosFirma(true);
  }

  function guardarFirma() {
    setFirma(editFirma);
    setCambiosFirma(false);
    mostrarToast("Firma actualizada correctamente", "success");
  }

  function cancelarFirma() {
    setEditFirma({ ...firma });
    setCambiosFirma(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Personalizá el sistema y tu firma comercial
        </p>
      </div>

      {/* ── Apariencia ──────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Settings className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Apariencia</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tema visual del sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTema("light")}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              tema === "light"
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <Sun className={`h-6 w-6 ${tema === "light" ? "text-amber-600" : "text-gray-400"}`} />
            <div className="text-left">
              <p className={`font-medium text-sm ${tema === "light" ? "text-amber-700 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>
                Modo claro
              </p>
              <p className="text-xs text-gray-400">Fondo blanco, ideal para oficina</p>
            </div>
            {tema === "light" && <CheckCircle className="h-4 w-4 text-amber-500 ml-auto" />}
          </button>

          <button
            onClick={() => setTema("dark")}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              tema === "dark"
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <Moon className={`h-6 w-6 ${tema === "dark" ? "text-amber-600" : "text-gray-400"}`} />
            <div className="text-left">
              <p className={`font-medium text-sm ${tema === "dark" ? "text-amber-700 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>
                Modo oscuro
              </p>
              <p className="text-xs text-gray-400">Fondo oscuro, reduce fatiga visual</p>
            </div>
            {tema === "dark" && <CheckCircle className="h-4 w-4 text-amber-500 ml-auto" />}
          </button>
        </div>
      </Card>

      {/* ── Firma comercial ──────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">Firma comercial</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Se usa automáticamente en emails y mensajes de WhatsApp
            </p>
          </div>
          {cambiosFirma && (
            <Badge variant="warning">Sin guardar</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Nombre completo"
              value={editFirma.nombre}
              onChange={e => handleFirmaChange("nombre", e.target.value)}
              className="pl-9"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Cargo / Rol"
              value={editFirma.cargo}
              onChange={e => handleFirmaChange("cargo", e.target.value)}
              className="pl-9"
              placeholder="Ej: Representante de Ventas"
            />
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Empresa"
              value={editFirma.empresa}
              onChange={e => handleFirmaChange("empresa", e.target.value)}
              className="pl-9"
              placeholder="Ej: FERMAR Distribuidora"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Teléfono"
              value={editFirma.telefono}
              onChange={e => handleFirmaChange("telefono", e.target.value)}
              className="pl-9"
              placeholder="Ej: 0351-4000000"
            />
          </div>
          <div className="col-span-2 relative">
            <AtSign className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Email"
              type="email"
              value={editFirma.email}
              onChange={e => handleFirmaChange("email", e.target.value)}
              className="pl-9"
              placeholder="Ej: ventas@fermar.com.ar"
            />
          </div>
        </div>

        {cambiosFirma && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={cancelarFirma} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={guardarFirma} className="flex-1">
              <CheckCircle className="h-4 w-4" /> Guardar firma
            </Button>
          </div>
        )}
      </Card>

      {/* ── Vista previa ─────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mail className="h-4 w-4 text-purple-600" />
            </div>
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <MessageCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Vista previa de la firma</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Así aparece en tus comunicaciones</p>
          </div>
        </div>
        <PreviewFirma firma={editFirma} />
      </Card>

      {/* ── Info del sistema ──────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Settings className="h-5 w-5 text-gray-500" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Información del sistema</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Versión", valor: "1.0.0 — Demo" },
            { label: "Almacenamiento", valor: "localStorage (navegador)" },
            { label: "Datos seed", valor: "15 clientes · 25 compras · 30 interacciones" },
            { label: "Fecha de referencia", valor: "2026-05-19" },
            { label: "Stack", valor: "React 18 + Vite 5 + Tailwind + Zustand" },
            { label: "Íconos", valor: "Lucide React" },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-white text-right">{item.valor}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
