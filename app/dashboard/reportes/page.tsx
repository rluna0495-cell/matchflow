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

  useEffect(() => {
    cargarReportes();
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
    <main className="p-8 text-white">

      <h1 className="text-5xl font-bold text-red-500 mb-8">
        Reportes Ejecutivos
      </h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-green-900 p-6 rounded-xl">
          <h3 className="text-lg">
            Ingresos Totales
          </h3>

          <p className="text-4xl font-bold mt-2">
            ${totalVendido.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-900 p-6 rounded-xl">
          <h3 className="text-lg">
            Entradas Vendidas
          </h3>

          <p className="text-4xl font-bold mt-2">
            {totalEntradas}
          </p>
        </div>

        <div className="bg-purple-900 p-6 rounded-xl">
          <h3 className="text-lg">
            Aficionados
          </h3>

          <p className="text-4xl font-bold mt-2">
            {totalAficionados}
          </p>
        </div>

        <div className="bg-red-900 p-6 rounded-xl">
          <h3 className="text-lg">
            Ventas
          </h3>

          <p className="text-4xl font-bold mt-2">
            {ventas.length}
          </p>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-green-400 mb-3">
            QR Utilizados
          </h3>

          <p className="text-5xl font-bold">
            {qrUsados}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">
            QR Disponibles
          </h3>

          <p className="text-5xl font-bold">
            {qrDisponibles}
          </p>
        </div>

      </div>

      <div className="bg-zinc-900 rounded-xl p-6 mb-8">

        <h2 className="text-2xl font-bold mb-6">
          Historial de Ventas
        </h2>

        <div className="overflow-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-zinc-700 text-left">
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
                  className="border-b border-zinc-800"
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

      <div className="bg-zinc-900 rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Stock Disponible
        </h2>

        <div className="space-y-4">

          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex justify-between bg-zinc-800 p-4 rounded-lg"
            >
              <span>
                {ticket.nombre}
              </span>

              <span>
                Stock: {ticket.cantidad}
              </span>
            </div>
          ))}

        </div>

      </div>

    </main>
  );
}