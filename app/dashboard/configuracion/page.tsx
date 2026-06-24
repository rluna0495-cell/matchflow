"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Shield,
  User,
  HardDrive,
  ToggleLeft,
  ToggleRight,
  Check,
  Users,
  Trash2,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useModal } from "@/components/modal-provider";

interface UsuarioSistema {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: "admin" | "empleado";
  iniciales: string;
}

const USUARIOS_DEFAULT: UsuarioSistema[] = [
  {
    id: "default-admin",
    nombre: "Administrador MatchFlow",
    email: "admin@matchflow.com",
    password: "admin123",
    rol: "admin",
    iniciales: "AD",
  },
  {
    id: "default-empleado",
    nombre: "Empleado de Puerta",
    email: "empleado@matchflow.com",
    password: "empleado123",
    rol: "empleado",
    iniciales: "EM",
  },
];

export default function ConfiguracionPage() {
  const router = useRouter();
  const { showAlert, showConfirm } = useModal();

  // Configuración general
  const [nombrePlataforma, setNombrePlataforma] = useState("MatchFlow Pro");
  const [estadioPrincipal, setEstadioPrincipal] = useState("Estadio Nacional");
  const [guardado, setGuardado] = useState(false);
  const [notificaciones, setNotificaciones] = useState(true);
  const [autoRefresco, setAutoRefresco] = useState(true);

  // Sesión activa
  const [sesionActual, setSesionActual] = useState<{ nombre: string; email: string; iniciales: string; rol: string } | null>(null);

  // Gestión de usuarios
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"admin" | "empleado">("empleado");
  const [verPassword, setVerPassword] = useState(false);
  const [mensajeUsuario, setMensajeUsuario] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"ok" | "error">("ok");

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://uomnmelvrsjtdanvsxok.supabase.co";

  useEffect(() => {
    const saved = localStorage.getItem("matchflow_session");
    if (saved) {
      const user = JSON.parse(saved);
      if (user.rol !== "admin") {
        router.push("/dashboard/ventas");
        return;
      }
      setSesionActual(user);
    } else {
      router.push("/dashboard");
      return;
    }

    cargarUsuarios();
  }, []);

  function cargarUsuarios() {
    const stored = localStorage.getItem("matchflow_users");
    if (stored) {
      setUsuarios(JSON.parse(stored));
    } else {
      setUsuarios(USUARIOS_DEFAULT);
      localStorage.setItem("matchflow_users", JSON.stringify(USUARIOS_DEFAULT));
    }
  }

  function guardarConfiguracion() {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  }

  function crearUsuario() {
    setMensajeUsuario("");

    if (!nuevoNombre.trim() || !nuevoEmail.trim() || !nuevoPassword.trim()) {
      setMensajeUsuario("Completa todos los campos del usuario.");
      setTipoMensaje("error");
      return;
    }

    if (nuevoPassword.length < 6) {
      setMensajeUsuario("La contraseña debe tener al menos 6 caracteres.");
      setTipoMensaje("error");
      return;
    }

    const emailDuplicado = usuarios.some(
      (u) => u.email.toLowerCase() === nuevoEmail.toLowerCase()
    );

    if (emailDuplicado) {
      setMensajeUsuario("Ya existe un usuario con ese correo.");
      setTipoMensaje("error");
      return;
    }

    const iniciales = nuevoNombre
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const nuevo: UsuarioSistema = {
      id: Date.now().toString(),
      nombre: nuevoNombre.trim(),
      email: nuevoEmail.trim().toLowerCase(),
      password: nuevoPassword,
      rol: nuevoRol,
      iniciales,
    };

    const actualizados = [...usuarios, nuevo];
    setUsuarios(actualizados);
    localStorage.setItem("matchflow_users", JSON.stringify(actualizados));

    setNuevoNombre("");
    setNuevoEmail("");
    setNuevoPassword("");
    setNuevoRol("empleado");

    setMensajeUsuario(`✅ Usuario "${nuevo.nombre}" creado correctamente.`);
    setTipoMensaje("ok");
    setTimeout(() => setMensajeUsuario(""), 5000);
  }

  async function eliminarUsuario(id: string) {
    if (id === "default-admin") {
      await showAlert("No puedes eliminar el administrador principal del sistema.");
      return;
    }

    const confirmar = await showConfirm("¿Eliminar este usuario del sistema?");
    if (!confirmar) return;

    const actualizados = usuarios.filter((u) => u.id !== id);
    setUsuarios(actualizados);
    localStorage.setItem("matchflow_users", JSON.stringify(actualizados));
  }

  return (
    <main className="space-y-8 text-white">
      <div>
        <h1 className="text-4xl font-black">Configuración</h1>
        <p className="text-zinc-400 mt-2">
          Ajustes de la plataforma y gestión de usuarios del sistema.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: Ajustes + DB */}
        <div className="lg:col-span-2 space-y-6">
          {/* AJUSTES GENERALES */}
          <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="text-blue-500" size={24} />
              <h2 className="text-2xl font-bold">Ajustes Generales</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-sm">Nombre de la Plataforma</label>
                <input
                  type="text"
                  value={nombrePlataforma}
                  onChange={(e) => setNombrePlataforma(e.target.value)}
                  className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-sm">Estadio Principal</label>
                <input
                  type="text"
                  value={estadioPrincipal}
                  onChange={(e) => setEstadioPrincipal(e.target.value)}
                  className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 space-y-4">
              <h3 className="font-semibold text-lg">Preferencias de Sistema</h3>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Auto-refrescar datos</p>
                  <p className="text-sm text-zinc-400">
                    Actualiza las métricas automáticamente cada 5 segundos.
                  </p>
                </div>
                <button onClick={() => setAutoRefresco(!autoRefresco)} className="text-blue-500">
                  {autoRefresco ? <ToggleRight size={40} /> : <ToggleLeft className="text-zinc-600" size={40} />}
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Sonidos de Validación</p>
                  <p className="text-sm text-zinc-400">
                    Reproducir señales sonoras tras escaneos QR.
                  </p>
                </div>
                <button onClick={() => setNotificaciones(!notificaciones)} className="text-blue-500">
                  {notificaciones ? <ToggleRight size={40} /> : <ToggleLeft className="text-zinc-600" size={40} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={guardarConfiguracion}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer"
              >
                {guardado ? (
                  <>
                    <Check size={18} /> Guardado
                  </>
                ) : (
                  "Guardar Preferencias"
                )}
              </button>
            </div>
          </div>

          {/* GESTIÓN DE USUARIOS */}
          <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-blue-500" size={24} />
              <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
            </div>

            {/* Formulario de creación */}
            <div className="bg-[#0F172A] border border-zinc-800 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus size={18} className="text-blue-400" />
                <h3 className="font-semibold text-lg">Crear Nuevo Usuario</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-400 text-sm">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Martínez"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="bg-[#111827] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-zinc-400 text-sm">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={nuevoEmail}
                    onChange={(e) => setNuevoEmail(e.target.value)}
                    className="bg-[#111827] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-zinc-400 text-sm">Contraseña</label>
                  <div className="relative">
                    <input
                      type={verPassword ? "text" : "password"}
                      placeholder="Mín. 6 caracteres"
                      value={nuevoPassword}
                      onChange={(e) => setNuevoPassword(e.target.value)}
                      className="w-full bg-[#111827] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setVerPassword(!verPassword)}
                      className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-zinc-400 text-sm">Rol del Usuario</label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as "admin" | "empleado")}
                    className="bg-[#111827] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500"
                  >
                    <option value="empleado">Empleado (Ventas y Accesos QR)</option>
                    <option value="admin">Administrador (Acceso Completo)</option>
                  </select>
                </div>
              </div>

              {mensajeUsuario && (
                <div
                  className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                    tipoMensaje === "ok"
                      ? "bg-green-500/10 border border-green-500/20 text-green-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  {mensajeUsuario}
                </div>
              )}

              <button
                onClick={crearUsuario}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Plus size={18} /> Crear Usuario
              </button>
            </div>

            {/* Listado de usuarios */}
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-400 text-sm uppercase tracking-wider">
                Usuarios del Sistema ({usuarios.length})
              </h3>

              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between bg-[#0F172A] border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {usuario.iniciales}
                    </div>
                    <div>
                      <p className="font-semibold">{usuario.nombre}</p>
                      <p className="text-sm text-zinc-400">{usuario.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        usuario.rol === "admin"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-zinc-700/50 text-zinc-300"
                      }`}
                    >
                      {usuario.rol === "admin" ? "Administrador" : "Empleado"}
                    </span>

                    {usuario.id !== "default-admin" && (
                      <button
                        onClick={() => eliminarUsuario(usuario.id)}
                        className="bg-red-600/20 hover:bg-red-600/40 text-red-400 p-2 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ESTADO DEL BACKEND */}
          <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <HardDrive className="text-blue-500" size={24} />
              <h2 className="text-2xl font-bold">Servicios de Datos</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Proveedor</span>
                <span className="font-medium text-white">Supabase Cloud</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Endpoint URL</span>
                <span className="font-mono text-xs text-zinc-300 break-all select-all">{supabaseUrl}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-400">Conexión</span>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-green-400 text-sm font-semibold">Activa & Autenticada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Seguridad */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-blue-500" size={24} />
              <h2 className="text-xl font-bold">Tu Perfil</h2>
            </div>

            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-blue-500/20">
                {sesionActual?.iniciales ?? "??"}
              </div>
              <h3 className="text-lg font-bold">{sesionActual?.nombre ?? "Usuario"}</h3>
              <p className="text-sm text-zinc-400 mt-1">{sesionActual?.email ?? ""}</p>
              <span className="mt-3 bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full font-semibold capitalize">
                {sesionActual?.rol === "admin" ? "Administrador" : "Empleado"}
              </span>
            </div>
          </div>

          <div className="bg-[#111827]/50 border border-zinc-800/80 rounded-2xl p-6 flex items-start gap-4">
            <Shield className="text-zinc-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-sm">Seguridad del Sistema</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Los usuarios y sesiones se gestionan localmente. Para mayor seguridad en producción, se recomienda migrar a Supabase Auth.
              </p>
            </div>
          </div>

          <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-400">Roles del Sistema</h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="font-semibold text-blue-400">Administrador</p>
                <p className="text-zinc-400 mt-1 text-xs">Acceso completo: Eventos, Tickets, Ventas, QR, Reportes, Aficionados, Configuración.</p>
              </div>
              <div className="p-3 bg-zinc-700/20 border border-zinc-700/40 rounded-xl">
                <p className="font-semibold text-zinc-300">Empleado</p>
                <p className="text-zinc-400 mt-1 text-xs">Acceso limitado: únicamente Ventas y Accesos QR.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
