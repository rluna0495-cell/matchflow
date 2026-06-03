"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Ticket {
  id: number;
  evento_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Aficionado {
  id: number;
  nombre: string;
  cedula: string;
}

interface Venta {
  id: number;
  ticket_id: number;
  aficionado_id?: number;
  comprador: string;
  cantidad: number;
  qr_code?: string;
  usado?: boolean;
}

export default function VentasPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
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

    const { data: aficionadosData } = await supabase
      .from("aficionados")
      .select("*")
      .order("nombre");

    const { data: ventasData } = await supabase
      .from("ventas")
      .select("*")
      .order("id", { ascending: false });

    setTickets(ticketsData || []);
    setAficionados(aficionadosData || []);
    setVentas(ventasData || []);
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
      alert("No hay stock suficiente");
      return;
    }

    const codigoQR =
      "QR-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 100000);

    const { error: ventaError } = await supabase
      .from("ventas")
      .insert([
        {
          ticket_id: ticket.id,
          aficionado_id: aficionado.id,
          comprador: aficionado.nombre,
          cantidad: Number(cantidad),
          qr_code: codigoQR,
          usado: false,
        },
      ]);

    if (ventaError) {
      alert(ventaError.message);
      return;
    }

    const nuevoStock =
      ticket.cantidad - Number(cantidad);

    const { error: stockError } = await supabase
      .from("tickets")
      .update({
        cantidad: nuevoStock,
      })
      .eq("id", ticket.id);

    if (stockError) {
      alert(stockError.message);
      return;
    }

    setTicketId("");
    setAficionadoId("");
    setCantidad("");

    await cargarDatos();

    alert("Venta registrada correctamente");
  }

  function obtenerTicket(id: number) {
    return tickets.find(
      (ticket) => ticket.id === id
    );
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
              Selecciona un ticket
            </option>

            {tickets.map((ticket) => (
              <option
                key={ticket.id}
                value={ticket.id}
              >
                {ticket.nombre} - Stock: {ticket.cantidad}
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
              Selecciona un aficionado
            </option>

            {aficionados.map((aficionado) => (
              <option
                key={aficionado.id}
                value={aficionado.id}
              >
                {aficionado.nombre} - {aficionado.cedula}
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
            className="bg-red-600 hover:bg-red-700 p-3 rounded font-bold"
          >
            Registrar Venta
          </button>

        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          Ventas Registradas
        </h2>

        {ventas.length === 0 ? (
          <p>No hay ventas registradas.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {ventas.map((venta) => {
              const ticket = obtenerTicket(
                venta.ticket_id
              );

              return (
                <div
                  key={venta.id}
                  className="bg-zinc-800 p-4 rounded-lg"
                >
                  <h3 className="text-xl font-bold">
                    {venta.comprador}
                  </h3>

                  <p>
                    Ticket:{" "}
                    {ticket?.nombre ||
                      "No encontrado"}
                  </p>

                  <p>
                    Cantidad: {venta.cantidad}
                  </p>

                  <p>
                    QR: {venta.qr_code}
                  </p>

                  <p>
                    Estado:{" "}
                    {venta.usado
                      ? "Usado"
                      : "Disponible"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}