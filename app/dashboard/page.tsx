export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-8">
        MATCHFLOW Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-zinc-400 text-sm">
            Entradas vendidas
          </h2>

          <p className="text-3xl font-bold mt-2">
            12,458
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-zinc-400 text-sm">
            Ingresos
          </h2>

          <p className="text-3xl font-bold mt-2">
            €286,540
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-zinc-400 text-sm">
            Ocupación
          </h2>

          <p className="text-3xl font-bold mt-2">
            78%
          </p>
        </div>

      </div>

      <div className="mt-8 bg-zinc-900 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Próximo Partido
        </h2>

        <p>
          Rayo Vallecano vs Real Betis
        </p>

        <p className="text-zinc-400 mt-2">
          24 Mayo 2026 - Estadio de Vallecas
        </p>
      </div>
    </main>
  );
}