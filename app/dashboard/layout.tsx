export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-black text-white">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6">
        <h2 className="text-2xl font-bold text-red-500">
          FLUJO DE PARTIDO
        </h2>

        <nav className="mt-8 space-y-4">
          <a
            href="/dashboard"
            className="block hover:text-red-500 transition"
          >
            Panel
          </a>

          <a
            href="/dashboard/eventos"
            className="block hover:text-red-500 transition"
          >
            Eventos
          </a>

          <a
            href="/dashboard/tickets"
            className="block hover:text-red-500 transition"
          >
            Entradas
          </a>

          <a
            href="/dashboard/ventas"
            className="block hover:text-red-500 transition"
          >
            Ventas
          </a>

          <a
            href="#"
            className="block hover:text-red-500 transition"
          >
            Accesos QR
          </a>

          <a
            href="#"
            className="block hover:text-red-500 transition"
          >
            Aficionados
          </a>

          <a
            href="#"
            className="block hover:text-red-500 transition"
          >
            Configuración
          </a>
        </nav>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}