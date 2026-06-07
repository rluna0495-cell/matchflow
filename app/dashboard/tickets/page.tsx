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

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

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

  async function guardarTicket() {
    if (
      !eventoId ||
      !nombre ||
      !precio ||
      !cantidad
    ) {
      alert("Completa todos los campos");
      return;
    }

    if (editandoId) {
      const { error } = await supabase
        .from("tickets")
        .update({
          evento_id: Number(eventoId),
          nombre,
          precio: Number(precio),
          cantidad: Number(cantidad),
        })
        .eq("id", editandoId);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Ticket actualizado");
    } else {
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

      alert("Ticket creado");
    }

    limpiarFormulario();
    cargarDatos();
  }

  async function eliminarTicket(id: number) {
    const { count } = await supabase
      .from("ventas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("ticket_id", id);

    if ((count || 0) > 0) {
      alert(
        "No se puede eliminar porque tiene ventas asociadas."
      );
      return;
    }

    const confirmar = confirm(
      "¿Eliminar este ticket?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    cargarDatos();
  }

  function editarTicket(ticket: Ticket) {
    setEventoId(ticket.evento_id.toString());
    setNombre(ticket.nombre);
    setPrecio(ticket.precio.toString());
    setCantidad(ticket.cantidad.toString());

    setEditandoId(ticket.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function limpiarFormulario() {
    setEventoId("");
    setNombre("");
    setPrecio("");
    setCantidad("");
    setEditandoId(null);
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
          {editandoId
            ? "Editar Ticket"
            : "Crear Ticket"}
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

          <div className="flex gap-3">

            <button
              onClick={guardarTicket}
              className="bg-red-600 hover:bg-red-700 p-3 rounded font-bold"
            >
              {editandoId
                ? "Guardar Cambios"
                : "Crear Ticket"}
            </button>

            {editandoId && (
              <button
                onClick={limpiarFormulario}
                className="bg-zinc-700 hover:bg-zinc-600 p-3 rounded font-bold"
              >
                Cancelar
              </button>
            )}

          </div>

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
              const evento =
                obtenerEvento(
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
                    Disponibles:{" "}
                    {ticket.cantidad}
                  </p>

                  <div className="flex gap-3 mt-4">

                    <button
                      onClick={() =>
                        editarTicket(
                          ticket
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        eliminarTicket(
                          ticket.id
                        )
                      }
                      className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
                    >
                      Eliminar
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </main>
  );
}