"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "📊",
    },
    {
      name: "Eventos",
      href: "/dashboard/eventos",
      icon: "🏟️",
    },
    {
      name: "Tickets",
      href: "/dashboard/tickets",
      icon: "🎟️",
    },
    {
      name: "Ventas",
      href: "/dashboard/ventas",
      icon: "💰",
    },
    {
      name: "Accesos QR",
      href: "/dashboard/accesos-qr",
      icon: "📱",
    },
    {
      name: "Reportes",
      href: "/dashboard/reportes",
      icon: "📈",
    },
    {
      name: "Aficionados",
      href: "/dashboard/aficionados",
      icon: "👥",
    },
    {
      name: "Configuración",
      href: "#",
      icon: "⚙️",
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#09090B] text-white">

      {/* SIDEBAR */}

      <aside className="w-72 bg-[#111114] border-r border-zinc-800 flex flex-col">

        <div className="p-8 border-b border-zinc-800">

          <h1 className="text-3xl font-black tracking-wider">
            <span className="text-red-500">
              MATCH
            </span>
            FLOW
          </h1>

          <p className="text-zinc-500 text-sm mt-2">
            Sports Ticketing SaaS
          </p>

        </div>

        <nav className="flex-1 p-4 space-y-2">

          {menuItems.map((item) => {
            const active =
              pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex
                  items-center
                  gap-4
                  px-4
                  py-4
                  rounded-xl
                  transition-all
                  duration-200
                  font-medium

                  ${
                    active
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }
                `}
              >
                <span className="text-xl">
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>
              </Link>
            );
          })}

        </nav>

        <div className="p-6 border-t border-zinc-800">

          <div className="bg-zinc-900 rounded-2xl p-4">

            <p className="text-zinc-500 text-xs uppercase tracking-wider">
              Sistema
            </p>

            <p className="font-bold mt-2">
              MatchFlow SaaS
            </p>

            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />

              <span className="text-green-400 text-sm">
                Operativo
              </span>
            </div>

          </div>

        </div>

      </aside>

      {/* CONTENIDO */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <header className="h-20 border-b border-zinc-800 bg-[#111114] flex items-center justify-between px-8">

          <div>
            <h2 className="text-xl font-bold">
              Plataforma de Gestión Deportiva
            </h2>

            <p className="text-zinc-500 text-sm">
              Control de eventos, ventas y accesos
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="bg-zinc-900 px-4 py-2 rounded-xl">
              <span className="text-zinc-400 text-sm">
                Producción
              </span>
            </div>

            <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center font-bold">
              RL
            </div>

          </div>

        </header>

        {/* PAGE */}

        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}