"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  DollarSign,
  QrCode,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

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
      icon: LayoutDashboard,
    },
    {
      name: "Eventos",
      href: "/dashboard/eventos",
      icon: CalendarDays,
    },
    {
      name: "Tickets",
      href: "/dashboard/tickets",
      icon: Ticket,
    },
    {
      name: "Ventas",
      href: "/dashboard/ventas",
      icon: DollarSign,
    },
    {
      name: "Accesos QR",
      href: "/dashboard/accesos-qr",
      icon: QrCode,
    },
    {
      name: "Reportes",
      href: "/dashboard/reportes",
      icon: BarChart3,
    },
    {
      name: "Aficionados",
      href: "/dashboard/aficionados",
      icon: Users,
    },
    {
      name: "Configuración",
      href: "/dashboard/configuracion",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#09090B] text-white">

      <aside className="w-72 bg-[#111827] border-r border-slate-800 flex flex-col">

        <div className="p-8 border-b border-slate-800">

          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-blue-500">
              Match
            </span>
            Flow
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Sports Ticketing Platform
          </p>

        </div>

        <nav className="flex-1 p-4 space-y-2">

          {menuItems.map((item) => {
            const active =
              pathname === item.href;

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 font-medium ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span>
                  {item.name}
                </span>
              </Link>
            );
          })}

        </nav>

        <div className="p-6 border-t border-slate-800">

          <div className="bg-slate-900 rounded-2xl p-4">

            <p className="text-slate-500 text-xs uppercase tracking-wider">
              Sistema
            </p>

            <p className="font-bold mt-2">
              MatchFlow Pro
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

      <div className="flex-1 flex flex-col">

        <header className="h-20 border-b border-slate-800 bg-[#111827] flex items-center justify-between px-8">

          <div>

            <h2 className="text-xl font-bold">
              Centro de Operaciones
            </h2>

            <p className="text-slate-400 text-sm">
              Monitoreo y administración de la plataforma
            </p>

          </div>

          <div className="flex items-center gap-4">

            <div className="bg-slate-900 px-4 py-2 rounded-xl">

              <span className="text-slate-400 text-sm">
                Producción
              </span>

            </div>

            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              RL
            </div>

          </div>

        </header>

        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}