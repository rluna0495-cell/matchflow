export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-red-500">
        MATCHFLOW
      </h1>

      <p className="mt-4 text-xl text-gray-300">
        Ticketing & Fan Experience Platform
      </p>

      <button className="mt-8 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold">
        Entrar al Dashboard
      </button>
    </main>
  );
}