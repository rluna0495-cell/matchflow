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

interface Evento {
  id: number;
  partido: string;
  fecha: string;
  estadio: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

  const [eventoId, setEventoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("");

  async function cargarDatos() {
    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("*")
      .order("id", { ascending: false });

    const { data: eventosData } = await supabase
      .from("eventos")
      .select("*")
      .order("id", { ascending: false });

    setTickets(ticketsData || []);
    setEventos(eventosData || []);
  }

  async function crearTicket() {
    if (
      !eventoId ||
      !nombre ||
      !precio ||
      !cantidad
    ) {
      alert("Completa todos los campos");
      return;
    }

    const { error } = await supabase
      .from("tickets")
      .insert([
        {
          evento_id: Number(eventoId),
          nombre,
          precio: Number(precio),
          cantidad: Number(cantidad),
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setEventoId("");
    setNombre("");
    setPrecio("");
    setCantidad("");

    cargarDatos();
  }

  function obtenerEvento(eventoId: number) {
    return eventos.find(
      (evento) => evento.id === eventoId
    );
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <main className="p-8 text-white">
      <h1 className="text-5xl font-bold text-red-500 mb-8">
        Gestión de Tickets
      </h1>

      <div className="bg-zinc-900 p-6 rounded-xl mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Crear Ticket
        </h2>

        <div className="flex flex-col gap-4">
          <select
            value={eventoId}
            onChange={(e) =>
              setEventoId(e.target.value)
            }
            className="p-3 rounded bg-zinc-800"
          >
            <option value="">
              Selecciona un evento
            </option>

            {eventos.map((evento) => (
              <option
                key={evento.id}
                value={evento.id}
              >
                {evento.partido}
              </option>
            ))}
          </select>

          <input
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            placeholder="Nombre del ticket"
            className="p-3 rounded bg-zinc-800"
          />

          <input
            type="number"
            value={precio}
            onChange={(e) =>
              setPrecio(e.target.value)
            }
            placeholder="Precio"
            className="p-3 rounded bg-zinc-800"
          />

          <input
            type="number"
            value={cantidad}
            onChange={(e) =>
              setCantidad(e.target.value)
            }
            placeholder="Cantidad disponible"
            className="p-3 rounded bg-zinc-800"
          />

          <button
            onClick={crearTicket}
            className="bg-red-600 hover:bg-red-700 p-3 rounded font-bold"
          >
            Crear Ticket
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          Tickets Registrados
        </h2>

        {tickets.length === 0 ? (
          <p>No hay tickets registrados.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((ticket) => {
              const evento = obtenerEvento(
                ticket.evento_id
              );

              return (
                <div
                  key={ticket.id}
                  className="bg-zinc-800 p-5 rounded-lg"
                >
                  {evento && (
                    <>
                      <h3 className="text-2xl font-bold text-red-400">
                        {evento.partido}
                      </h3>

                      <p>{evento.fecha}</p>

                      <p className="mb-4">
                        {evento.estadio}
                      </p>
                    </>
                  )}

                  <hr className="border-zinc-700 mb-4" />

                  <h4 className="text-xl font-bold">
                    {ticket.nombre}
                  </h4>

                  <p>
                    Precio: $
                    {ticket.precio.toLocaleString()}
                  </p>

                  <p>
                    Disponibles: {ticket.cantidad}
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