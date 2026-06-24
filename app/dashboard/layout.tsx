"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  DollarSign,
  QrCode,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
} from "lucide-react";

interface UsuarioSesion {
  email: string;
  nombre: string;
  rol: "admin" | "empleado";
  iniciales: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Estados de autenticación y UI
  const [sesion, setSesion] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("matchflow_session");
    if (saved) {
      try {
        setSesion(JSON.parse(saved));
      } catch {
        localStorage.removeItem("matchflow_session");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin("");

    const DEFAULT_USERS = [
      { id: "default-admin", email: "admin@matchflow.com", password: "admin123", nombre: "Administrador MatchFlow", rol: "admin" as const, iniciales: "AD" },
      { id: "default-empleado", email: "empleado@matchflow.com", password: "empleado123", nombre: "Empleado de Puerta", rol: "empleado" as const, iniciales: "EM" },
    ];

    const storedRaw = localStorage.getItem("matchflow_users");
    const allUsers = storedRaw ? JSON.parse(storedRaw) : DEFAULT_USERS;

    const match = allUsers.find(
      (u: any) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (match) {
      const user: UsuarioSesion = {
        email: match.email,
        nombre: match.nombre,
        rol: match.rol,
        iniciales: match.iniciales,
      };
      localStorage.setItem("matchflow_session", JSON.stringify(user));
      setSesion(user);
      if (match.rol === "empleado") {
        router.push("/dashboard/ventas");
      }
    } else {
      setErrorLogin("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("matchflow_session");
    setSesion(null);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no hay sesión, mostramos la pantalla de login premium
  if (!sesion) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Fondo decorativo con gradientes */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span className="text-blue-500">Match</span>Flow
            </h1>
            <p className="text-zinc-400 text-sm mt-2">Plataforma de Boletaje y Control de Accesos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-zinc-400 text-sm font-medium">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@correo.com"
                className="w-full bg-[#0F172A] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-zinc-400 text-sm font-medium">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
              />
            </div>

            {errorLogin && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium text-center">
                {errorLogin}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3.5 font-bold transition duration-200 cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Lock size={18} /> Iniciar Sesión
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500">
            <p>Admin: admin@matchflow.com / admin123</p>
            <p className="mt-1">Empleado: empleado@matchflow.com / empleado123</p>
          </div>
        </div>
      </div>
    );
  }

  // Filtrado de menú según rol
  const allMenuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin"],
    },
    {
      name: "Eventos",
      href: "/dashboard/eventos",
      icon: CalendarDays,
      roles: ["admin"],
    },
    {
      name: "Tickets",
      href: "/dashboard/tickets",
      icon: Ticket,
      roles: ["admin"],
    },
    {
      name: "Ventas",
      href: "/dashboard/ventas",
      icon: DollarSign,
      roles: ["admin", "empleado"],
    },
    {
      name: "Accesos QR",
      href: "/dashboard/accesos-qr",
      icon: QrCode,
      roles: ["admin", "empleado"],
    },
    {
      name: "Reportes",
      href: "/dashboard/reportes",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      name: "Aficionados",
      href: "/dashboard/aficionados",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Configuración",
      href: "/dashboard/configuracion",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(sesion.rol));

  return (
    <div className="h-screen overflow-hidden flex bg-[#09090B] text-white">
      {/* OVERLAY MÓVIL */}
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* BARRA LATERAL */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111827] border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-blue-500">Match</span>Flow
            </h1>
            <p className="text-slate-400 text-sm mt-2">Sports Ticketing Platform</p>
          </div>
          <button 
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setMenuAbierto(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 font-medium hover:translate-x-1 ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition duration-200 font-medium cursor-pointer"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-900 rounded-2xl p-4">
            <p className="text-slate-500 text-xs uppercase tracking-wider">Sistema</p>
            <p className="font-bold mt-2">MatchFlow Pro</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400 text-sm">Operativo</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <header className="h-20 flex-shrink-0 border-b border-slate-800 bg-[#111827] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setMenuAbierto(true)}
            >
              <Menu size={28} />
            </button>
            <div>
              <h2 className="text-xl font-bold hidden sm:block">Centro de Operaciones</h2>
              <h2 className="text-xl font-bold sm:hidden">MatchFlow</h2>
              <p className="text-slate-400 text-sm hidden sm:block">Monitoreo y administración de la plataforma</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-slate-900 px-3 py-1.5 md:px-4 md:py-2 rounded-xl hidden sm:block">
              <span className="text-slate-400 text-sm capitalize">{sesion.rol}</span>
            </div>

            <div
              title={sesion.nombre}
              className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold"
            >
              {sesion.iniciales}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
