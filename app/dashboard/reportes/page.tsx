"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Venta {
  id: number;
  comprador: string;
  cantidad: number;
  ticket_id: number;
  usado?: boolean;
}

interface Ticket {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface ReporteVenta {
  id: number;
  comprador: string;
  ticket: string;
  cantidad: number;
  total: number;
}

interface Aficionado {
  id: number;
}

export default function ReportesPage() {
  const [ventas, setVentas] = useState<ReporteVenta[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [totalVendido, setTotalVendido] = useState(0);
  const [totalEntradas, setTotalEntradas] = useState(0);

  const [totalAficionados, setTotalAficionados] = useState(0);
  const [qrUsados, setQrUsados] = useState(0);
  const [qrDisponibles, setQrDisponibles] = useState(0);

  // IMPLEMENTACIÓN DE AUTO-REFRESCO CADA 5 SEGUNDOS
  useEffect(() => {
    cargarReportes();

    const interval = setInterval(() => {
      cargarReportes();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function cargarReportes() {
    const { data: ventasData } = await supabase
      .from("ventas")
      .select("*");

    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("*");

    const { data: aficionadosData } = await supabase
      .from("aficionados")
      .select("*");

    if (!ventasData || !ticketsData) return;

    setTickets(ticketsData);

    let totalDinero = 0;
    let totalBoletos = 0;

    let usados = 0;
    let disponibles = 0;

    const reporte = ventasData.map((venta: Venta) => {
      const ticket = ticketsData.find(
        (t) => t.id === venta.ticket_id
      );

      const precio = ticket?.precio || 0;

      const total = precio * venta.cantidad;

      totalDinero += total;
      totalBoletos += venta.cantidad;

      if (venta.usado) {
        usados++;
      } else {
        disponibles++;
      }

      return {
        id: venta.id,
        comprador: venta.comprador,
        ticket: ticket?.nombre || "Desconocido",
        cantidad: venta.cantidad,
        total,
      };
    });

    setVentas(reporte);
    setTotalVendido(totalDinero);
    setTotalEntradas(totalBoletos);

    setQrUsados(usados);
    setQrDisponibles(disponibles);

    setTotalAficionados(
      aficionadosData?.length || 0
    );
  }

  return (
    <main className="p-8 text-white min-h-screen bg-black">

      {/* CAMBIO 1 — TÍTULO */}
      <div className="mb-8">
        <h1 className="text-5xl font-black">
          Reportes
        </h1>

        <p className="text-zinc-400 mt-2">
          Métricas operativas y seguimiento de ventas.
        </p>
      </div>

      {/* CORRECCIÓN EXACTA EN LA GRID DE LAS TARJETAS (2 FILAS DE 3 EN XL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">

        {/* KPI: Ingresos */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm text-zinc-400">
            Ingresos Totales
          </h3>

          <p className="text-4xl font-black mt-2 text-white">
            ${totalVendido.toLocaleString()}
          </p>
        </div>

        {/* KPI: Entradas */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm text-zinc-400">
            Entradas Vendidas
          </h3>

          <p className="text-5xl font-black mt-2 text-white">
            {totalEntradas}
          </p>
        </div>

        {/* KPI: Aficionados */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm text-zinc-400">
            Aficionados
          </h3>

          <p className="text-5xl font-black mt-2 text-white">
            {totalAficionados}
          </p>
        </div>

        {/* KPI: Ventas */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm text-zinc-400">
            Ventas
          </h3>

          <p className="text-5xl font-black mt-2 text-white">
            {ventas.length}
          </p>
        </div>

        {/* KPI: QR Utilizados */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm text-zinc-400">
            QR Utilizados
          </h3>

          <p className="text-5xl font-black mt-2 text-white">
            {qrUsados}
          </p>
        </div>

        {/* KPI: QR Disponibles */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm text-zinc-400">
            QR Disponibles
          </h3>

          <p className="text-5xl font-black mt-2 text-white">
            {qrDisponibles}
          </p>
        </div>

      </div>

      {/* CAMBIO 5 — HISTORIAL DE VENTAS */}
      <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6 mb-8">

        <h2 className="text-2xl font-bold mb-6">
          Historial de Ventas
        </h2>

        <div className="overflow-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-400">
                <th className="p-3">Comprador</th>
                <th className="p-3">Ticket</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {ventas.map((venta) => (
                <tr
                  key={venta.id}
                  className="border-b border-zinc-900"
                >
                  <td className="p-3">
                    {venta.comprador}
                  </td>

                  <td className="p-3">
                    {venta.ticket}
                  </td>

                  <td className="p-3">
                    {venta.cantidad}
                  </td>

                  <td className="p-3">
                    ${venta.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

      {/* CAMBIO 7 — STOCK DISPONIBLE */}
      <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Stock Disponible
        </h2>

        <div className="space-y-4">

          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex justify-between bg-zinc-950 border border-zinc-900 p-4 rounded-xl"
            >
              <span>
                {ticket.nombre}
              </span>

              <span className="text-zinc-400">
                Stock: <strong className="text-white">{ticket.cantidad}</strong>
              </span>
            </div>
          ))}

        </div>

      </div>

    </main>
  );
}