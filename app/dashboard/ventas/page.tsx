"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import { generarTicketPDF } from "@/lib/pdf-ticket";

interface Ticket {
  id: number;
  evento_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Evento {
  id: number;
  partido: string;
  fecha: string;
  estadio: string;
}

interface Aficionado {
  id: number;
  nombre: string;
  cedula: string;
}

interface Venta {
  id: number;
  ticket_id: number;
  comprador: string;
  cantidad: number;
  qr_code: string;
  qr_image: string;
  usado?: boolean;
}

export default function VentasPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [aficionados, setAficionados] = useState<Aficionado[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);

  const [ticketId, setTicketId] = useState("");
  const [aficionadoId, setAficionadoId] = useState("");
  const [cantidad, setCantidad] = useState("");

  async function cargarDatos() {
    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("*")
      .order("id", { ascending: false });

    const { data: eventosData } = await supabase
      .from("eventos")
      .select("*");

    const { data: aficionadosData } = await supabase
      .from("aficionados")
      .select("*");

    const { data: ventasData } = await supabase
      .from("ventas")
      .select("*")
      .order("id", { ascending: false });

    setTickets(ticketsData || []);
    setEventos(eventosData || []);
    setAficionados(aficionadosData || []);

    if (ventasData) {
      const ventasConQR: Venta[] = await Promise.all(
        ventasData.map(async (venta) => ({
          ...venta,
          qr_image: await QRCode.toDataURL(
            venta.qr_code
          ),
        }))
      );

      setVentas(ventasConQR);
    }
  }

  async function registrarVenta() {
    if (!ticketId || !aficionadoId || !cantidad) {
      alert("Completa todos los campos");
      return;
    }

    const ticket = tickets.find(
      (t) => t.id === Number(ticketId)
    );

    if (!ticket) {
      alert("Ticket no encontrado");
      return;
    }

    const aficionado = aficionados.find(
      (a) => a.id === Number(aficionadoId)
    );

    if (!aficionado) {
      alert("Aficionado no encontrado");
      return;
    }

    if (Number(cantidad) > ticket.cantidad) {
      alert("Stock insuficiente");
      return;
    }

    const qr =
      "QR-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 100000);

    const { error } = await supabase
  .from("ventas")
  .insert([
    {
      ticket_id: ticket.id,
      comprador: aficionado.nombre,
      cantidad: Number(cantidad),
      qr_code: qr,
      usado: false,
      aficionado_id: aficionado.id,

      precio_unitario: ticket.precio,

      total:
        ticket.precio *
        Number(cantidad),
    },
  ]);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase
      .from("tickets")
      .update({
        cantidad:
          ticket.cantidad - Number(cantidad),
      })
      .eq("id", ticket.id);

    alert("Venta registrada correctamente");

    setCantidad("");
    setTicketId("");
    setAficionadoId("");

    await cargarDatos();
  }

  function descargarPDF(venta: Venta) {
    const ticket = tickets.find(
      (t) => t.id === venta.ticket_id
    );

    if (!ticket) return;

    const evento = eventos.find(
      (e) => e.id === ticket.evento_id
    );

    if (!evento) return;

    generarTicketPDF({
      comprador: venta.comprador,
      partido: evento.partido,
      fecha: evento.fecha,
      estadio: evento.estadio,
      zona: ticket.nombre,
      qr: venta.qr_code,
      qrImage: venta.qr_image,
    });
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
  <main className="space-y-8">

    <div>
      <h1 className="text-5xl font-black text-white">
        Gestión de Ventas
      </h1>

      <p className="text-zinc-400 mt-2">
        Registro, control y emisión de tickets digitales.
      </p>
    </div>

    {/* KPIs */}

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

      <div className="bg-[#081225] border border-[#16213E] rounded-3xl p-6">
        <p className="text-zinc-400">
          Tickets
        </p>

        <h2 className="text-4xl font-bold mt-2">
          {tickets.length}
        </h2>
      </div>

      <div className="bg-[#081225] border border-[#16213E] rounded-3xl p-6">
        <p className="text-zinc-400">
          Aficionados
        </p>

        <h2 className="text-4xl font-bold mt-2">
          {aficionados.length}
        </h2>
      </div>

      <div className="bg-[#081225] border border-[#16213E] rounded-3xl p-6">
        <p className="text-zinc-400">
          Ventas
        </p>

        <h2 className="text-4xl font-bold mt-2">
          {ventas.length}
        </h2>
      </div>

      <div className="bg-[#081225] border border-[#16213E] rounded-3xl p-6">
        <p className="text-zinc-400">
          Disponibles
        </p>

        <h2 className="text-4xl font-bold text-green-400 mt-2">
          {
            tickets.reduce(
              (total, ticket) =>
                total + ticket.cantidad,
              0
            )
          }
        </h2>
      </div>

    </div>

    <div className="grid lg:grid-cols-3 gap-8">

      {/* FORM */}

      <div className="lg:col-span-1">

        <div className="bg-[#081225] border border-[#16213E] rounded-3xl p-6">

          <h2 className="text-3xl font-bold mb-6">
            Nueva Venta
          </h2>

          <div className="space-y-4">

            <select
              value={ticketId}
              onChange={(e) =>
                setTicketId(e.target.value)
              }
              className="w-full bg-black border border-zinc-700 rounded-xl p-4"
            >
              <option value="">
                Seleccionar Ticket
              </option>

              {tickets.map((ticket) => (
                <option
                  key={ticket.id}
                  value={ticket.id}
                >
                  {ticket.nombre} | Stock: {ticket.cantidad}
                </option>
              ))}
            </select>

            <select
              value={aficionadoId}
              onChange={(e) =>
                setAficionadoId(e.target.value)
              }
              className="w-full bg-black border border-zinc-700 rounded-xl p-4"
            >
              <option value="">
                Seleccionar Aficionado
              </option>

              {aficionados.map((aficionado) => (
                <option
                  key={aficionado.id}
                  value={aficionado.id}
                >
                  {aficionado.nombre}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) =>
                setCantidad(e.target.value)
              }
              className="w-full bg-black border border-zinc-700 rounded-xl p-4"
            />

            <button
              onClick={registrarVenta}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-4 font-bold transition"
            >
              Registrar Venta
            </button>

          </div>

        </div>

      </div>

      {/* HISTORIAL */}

      <div className="lg:col-span-2">

        <div className="bg-[#081225] border border-[#16213E] rounded-3xl p-6">

          <h2 className="text-3xl font-bold mb-6">
            Ventas Registradas
          </h2>

          <div className="grid xl:grid-cols-2 gap-6">

            {ventas.map((venta) => {
              const ticket = tickets.find(
                (t) =>
                  t.id === venta.ticket_id
              );

              return (
                <div
                  key={venta.id}
                  className="bg-black border border-zinc-800 rounded-2xl p-5"
                >
                  <h3 className="font-bold text-xl mb-2">
                    {venta.comprador}
                  </h3>

                  <p className="text-zinc-400">
                    Ticket:
                    {" "}
                    {ticket?.nombre}
                  </p>

                  <p className="text-zinc-400">
                    Cantidad:
                    {" "}
                    {venta.cantidad}
                  </p>

                  <div className="mt-3">

                    {venta.usado ? (
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                        Usado
                      </span>
                    ) : (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                        Disponible
                      </span>
                    )}

                  </div>

                  <img
                    src={venta.qr_image}
                    alt="QR"
                    className="w-40 mt-5 bg-white rounded-xl p-2"
                  />

                  <button
                    onClick={() =>
                      descargarPDF(venta)
                    }
                    className="mt-5 w-full bg-green-600 hover:bg-green-700 rounded-xl p-3 font-bold transition"
                  >
                    Descargar PDF
                  </button>

                </div>
              );
            })}

          </div>

        </div>

      </div>

    </div>

  </main>
);
}