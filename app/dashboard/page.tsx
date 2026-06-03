"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [eventos, setEventos] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [ventas, setVentas] = useState(0);
  const [accesos, setAccesos] = useState(0);

  const [ingresos, setIngresos] = useState(0);
  const [entradasVendidas, setEntradasVendidas] = useState(0);
  const [stockDisponible, setStockDisponible] = useState(0);
  const [ocupacion, setOcupacion] = useState(0);

  const [partido, setPartido] = useState("");
  const [fecha, setFecha] = useState("");
  const [estadio, setEstadio] = useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    const { count: eventosCount } = await supabase
      .from("eventos")
      .select("*", { count: "exact", head: true });

    const { count: ticketsCount } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true });

    const { count: ventasCount } = await supabase
      .from("ventas")
      .select("*", { count: "exact", head: true });

    const { count: accesosCount } = await supabase
      .from("ventas")
      .select("*", { count: "exact", head: true })
      .eq("usado", true);

    const { data: evento } = await supabase
      .from("eventos")
      .select("*")
      .limit(1)
      .single();

    if (evento) {
      setPartido(evento.partido);
      setFecha(evento.fecha);
      setEstadio(evento.estadio);
    }

    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("*");

    const { data: ventasData } = await supabase
      .from("ventas")
      .select("*");

    let totalIngresos = 0;
    let totalVendidas = 0;
    let totalStock = 0;

    if (ticketsData && ventasData) {
      ventasData.forEach((venta) => {
        const ticket = ticketsData.find(
          (t) => t.id === venta.ticket_id
        );

        if (ticket) {
          totalIngresos +=
            ticket.precio * venta.cantidad;

          totalVendidas += venta.cantidad;
        }
      });

      ticketsData.forEach((ticket) => {
        totalStock += ticket.cantidad;
      });
    }

    const capacidadTotal =
      totalStock + totalVendidas;

    const porcentaje =
      capacidadTotal > 0
        ? (
            (totalVendidas / capacidadTotal) *
            100
          ).toFixed(2)
        : "0";

    setEventos(eventosCount || 0);
    setTickets(ticketsCount || 0);
    setVentas(ventasCount || 0);
    setAccesos(accesosCount || 0);

    setIngresos(totalIngresos);
    setEntradasVendidas(totalVendidas);
    setStockDisponible(totalStock);
    setOcupacion(Number(porcentaje));
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-bold text-red-500 mb-8">
        MATCHFLOW Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-zinc-400 text-sm">
            Eventos
          </h2>

          <p className="text-4xl font-bold mt-2">
            {eventos}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-zinc-400 text-sm">
            Tickets
          </h2>

          <p className="text-4xl font-bold mt-2">
            {tickets}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-zinc-400 text-sm">
            Ventas
          </h2>

          <p className="text-4xl font-bold mt-2">
            {ventas}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-zinc-400 text-sm">
            Accesos Utilizados
          </h2>

          <p className="text-4xl font-bold mt-2">
            {accesos}
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">

        <div className="bg-green-900 p-6 rounded-xl">
          <h2 className="text-sm text-green-200">
            Ingresos Totales
          </h2>

          <p className="text-3xl font-bold mt-2">
            ${ingresos.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-900 p-6 rounded-xl">
          <h2 className="text-sm text-blue-200">
            Entradas Vendidas
          </h2>

          <p className="text-3xl font-bold mt-2">
            {entradasVendidas}
          </p>
        </div>

        <div className="bg-yellow-900 p-6 rounded-xl">
          <h2 className="text-sm text-yellow-200">
            Stock Disponible
          </h2>

          <p className="text-3xl font-bold mt-2">
            {stockDisponible}
          </p>
        </div>

        <div className="bg-purple-900 p-6 rounded-xl">
          <h2 className="text-sm text-purple-200">
            Ocupación
          </h2>

          <p className="text-3xl font-bold mt-2">
            {ocupacion}%
          </p>
        </div>

      </div>

      <div className="mt-8 bg-zinc-900 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Próximo Evento
        </h2>

        <p className="text-xl font-semibold">
          {partido}
        </p>

        <p className="text-zinc-400 mt-2">
          {fecha}
        </p>

        <p className="text-zinc-400">
          {estadio}
        </p>
      </div>

      <div className="mt-8 bg-zinc-900 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Estado del Sistema
        </h2>

        <p>
          Plataforma MatchFlow operativa.
        </p>

        <p className="text-zinc-400 mt-2">
          Eventos, Tickets, Ventas y Accesos QR conectados con Supabase.
        </p>
      </div>
    </main>
  );
}