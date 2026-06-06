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
    <main className="p-8 text-white">
      <h1 className="text-5xl font-bold text-red-500 mb-8">
        Gestión de Ventas
      </h1>

      <div className="bg-zinc-900 p-6 rounded-xl mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Registrar Venta
        </h2>

        <div className="flex flex-col gap-4">
          <select
            value={ticketId}
            onChange={(e) =>
              setTicketId(e.target.value)
            }
            className="p-3 rounded bg-zinc-800"
          >
            <option value="">
              Selecciona Ticket
            </option>

            {tickets.map((ticket) => (
              <option
                key={ticket.id}
                value={ticket.id}
              >
                {ticket.nombre} - Stock:{" "}
                {ticket.cantidad}
              </option>
            ))}
          </select>

          <select
            value={aficionadoId}
            onChange={(e) =>
              setAficionadoId(e.target.value)
            }
            className="p-3 rounded bg-zinc-800"
          >
            <option value="">
              Selecciona Aficionado
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
            className="p-3 rounded bg-zinc-800"
          />

          <button
            onClick={registrarVenta}
            className="bg-red-600 p-3 rounded font-bold"
          >
            Registrar Venta
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">
          Ventas Registradas
        </h2>

        <div className="space-y-6">
          {ventas.map((venta) => {
            const ticket = tickets.find(
              (t) => t.id === venta.ticket_id
            );

            return (
              <div
                key={venta.id}
                className="bg-zinc-800 p-5 rounded-xl"
              >
                <h3 className="text-xl font-bold">
                  {venta.comprador}
                </h3>

                <p>
                  Ticket: {ticket?.nombre}
                </p>

                <p>
                  Cantidad: {venta.cantidad}
                </p>

                <p>
                  Estado:
                  {venta.usado
                    ? " 🔴 Usado"
                    : " 🟢 Disponible"}
                </p>

                <p>
                  QR: {venta.qr_code}
                </p>

                <img
                  src={venta.qr_image}
                  alt="QR"
                  className="w-40 mt-4 bg-white p-2 rounded"
                />

                <button
                  onClick={() =>
                    descargarPDF(venta)
                  }
                  className="mt-4 bg-green-600 px-4 py-2 rounded font-bold"
                >
                  Descargar Ticket PDF
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}