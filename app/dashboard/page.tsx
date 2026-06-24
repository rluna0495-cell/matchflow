"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  Ticket,
  Users,
  QrCode,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

interface Venta {
  id: number;
  comprador: string;
  cantidad: number;
  usado: boolean;
  ticket_id: number;
}

function formatearFecha(fechaStr: string) {
  if (!fechaStr) return "";
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    return d.toLocaleDateString("es-ES", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return fechaStr;
  }
}

export default function DashboardPage() {
  const router = useRouter();
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

  const [ultimasVentas, setUltimasVentas] = useState<Venta[]>([]);

  // AUTO-REFRESCO IMPLEMENTADO EN EL EFFECT
  useEffect(() => {
    const saved = localStorage.getItem("matchflow_session");
    if (saved) {
      const user = JSON.parse(saved);
      if (user.rol !== "admin") {
        router.push("/dashboard/ventas");
        return;
      }
    } else {
      router.push("/dashboard");
      return;
    }

    cargarDashboard();

    const interval = setInterval(() => {
      cargarDashboard();
    }, 5000);

    return () => clearInterval(interval);
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

    const { data: ultimasVentasData } = await supabase
      .from("ventas")
      .select("*")
      .order("id", { ascending: false })
      .limit(5);

    setUltimasVentas(ultimasVentasData || []);

    let totalIngresos = 0;
    let totalVendidas = 0;
    let totalStock = 0;

    if (ticketsData && ventasData) {
      ventasData.forEach((venta) => {
        const ticket = ticketsData.find(
          (t) => t.id === venta.ticket_id
        );

        if (ticket) {
          totalIngresos += ticket.precio * venta.cantidad;
          totalVendidas += venta.cantidad;
        }
      });

      ticketsData.forEach((ticket) => {
        totalStock += ticket.cantidad;
      });
    }

    const capacidadTotal = totalStock + totalVendidas;

    const porcentaje =
      capacidadTotal > 0
        ? ((totalVendidas / capacidadTotal) * 100).toFixed(1)
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
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Resumen general de la operación.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between">
            <span className="text-zinc-400">
              Ingresos
            </span>

            <DollarSign size={20} />
          </div>

          <h2 className="text-3xl font-bold mt-4">
            ${ingresos.toLocaleString()}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between">
            <span className="text-zinc-400">
              Ventas
            </span>

            <TrendingUp size={20} />
          </div>

          <h2 className="text-3xl font-bold mt-4">
            {ventas}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between">
            <span className="text-zinc-400">
              Entradas
            </span>

            <Ticket size={20} />
          </div>

          <h2 className="text-3xl font-bold mt-4">
            {entradasVendidas}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between">
            <span className="text-zinc-400">
              Ocupación
            </span>

            <Users size={20} />
          </div>

          <h2 className="text-3xl font-bold mt-4">
            {ocupacion}%
          </h2>
        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2 bg-[#111827] border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-2 mb-6">
            <CalendarDays size={20} />
            <h2 className="font-bold text-xl">
              Próximo Evento
            </h2>
          </div>

          <h3 className="text-3xl font-bold">
            {partido}
          </h3>

          <p className="text-zinc-400 mt-3">
            {formatearFecha(fecha)}
          </p>

          <p className="text-zinc-400">
            {estadio}
          </p>

        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-2 mb-6">
            <QrCode size={20} />
            <h2 className="font-bold text-xl">
              Accesos
            </h2>
          </div>

          <div className="space-y-4">

            <div>
              <p className="text-zinc-400">
                Utilizados
              </p>

              <h3 className="text-3xl font-bold">
                {accesos}
              </h3>
            </div>

            <div>
              <p className="text-zinc-400">
                Disponibles
              </p>

              <h3 className="text-3xl font-bold">
                {stockDisponible}
              </h3>
            </div>

          </div>

        </div>

      </div>

      <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">

        <h2 className="text-xl font-bold mb-6">
          Últimas Ventas
        </h2>

        <div className="space-y-4">

          {ultimasVentas.map((venta) => (
            <div
              key={venta.id}
              className="flex justify-between items-center bg-[#0F172A] border border-zinc-800 rounded-xl p-4"
            >
              <div>
                <p className="font-semibold">
                  {venta.comprador}
                </p>

                <p className="text-sm text-zinc-400">
                  {venta.cantidad} entradas
                </p>
              </div>

              <span
                className={`text-sm font-medium ${
                  venta.usado
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {venta.usado
                  ? "QR Utilizado"
                  : "QR Disponible"}
              </span>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}