"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Search,
  Pencil,
  Trash2,
  Plus,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { useModal } from "@/components/modal-provider";
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

export default function TicketsPage() {
  const router = useRouter();
  const { showAlert, showConfirm } = useModal();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

  const [eventoId, setEventoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("");

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const [busqueda, setBusqueda] =
    useState("");

  const [guardando, setGuardando] = useState(false);

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
      await showAlert("Completa todos los campos");
      return;
    }

    if (guardando) return;
    setGuardando(true);

    try {
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
          await showAlert(error.message);
          return;
        }

        await showAlert("Ticket actualizado");
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
          await showAlert(error.message);
          return;
        }

        await showAlert("Ticket creado");
      }

      limpiarFormulario();
      cargarDatos();
    } finally {
      setGuardando(false);
    }
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
      await showAlert(
        "No se puede eliminar porque tiene ventas asociadas."
      );
      return;
    }

    const confirmar = await showConfirm(
      "¿Eliminar este ticket?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", id);

    if (error) {
      await showAlert(error.message);
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

  const ticketsFiltrados = tickets.filter(
    (ticket) => {
      const evento = obtenerEvento(
        ticket.evento_id
      );

      const texto =
        busqueda.toLowerCase();

      return (
        ticket.nombre
          .toLowerCase()
          .includes(texto) ||
        evento?.partido
          .toLowerCase()
          .includes(texto) ||
        evento?.estadio
          .toLowerCase()
          .includes(texto)
      );
    }
  );

  const totalTickets =
    tickets.length;

  const stockDisponible =
    tickets.reduce(
      (acc, ticket) =>
        acc + ticket.cantidad,
      0
    );

  const eventosAsociados =
    new Set(
      tickets.map(
        (t) => t.evento_id
      )
    ).size;

  const precioPromedio =
    tickets.length > 0
      ? Math.round(
          tickets.reduce(
            (acc, ticket) =>
              acc + ticket.precio,
            0
          ) / tickets.length
        )
      : 0;

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

    cargarDatos();
  }, []);

  return (
    <main className="p-8 text-white">

      <div>
        <h1 className="text-4xl font-black">
          Gestión de Tickets
        </h1>

        <p className="text-zinc-400 mt-2">
          Administra zonas, precios y
          disponibilidad para cada evento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Total Tickets
          </p>

          <h2 className="text-4xl font-black mt-2">
            {totalTickets}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Stock Disponible
          </p>

          <h2 className="text-4xl font-black mt-2">
            {stockDisponible}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Eventos Asociados
          </p>

          <h2 className="text-4xl font-black mt-2">
            {eventosAsociados}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Precio Promedio
          </p>

          <h2 className="text-4xl font-black mt-2 text-blue-500">
            $
            {precioPromedio.toLocaleString()}
          </h2>
        </div>

      </div>

      {/* NUEVA ESTRUCTURA EN GRID HORIZONTAL */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8 items-start">

        {/* CONTENEDOR DEL FORMULARIO (OCUPA 1 COLUMNA) */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6 h-fit sticky top-4">

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
              className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3"
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
              className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3"
            />

            <input
              type="number"
              value={precio}
              onChange={(e) =>
                setPrecio(e.target.value)
              }
              placeholder="Precio"
              className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3"
            />

            <input
              type="number"
              value={cantidad}
              onChange={(e) =>
                setCantidad(e.target.value)
              }
              placeholder="Cantidad disponible"
              className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3"
            />

            <div className="flex gap-3">

               <button
                 onClick={guardarTicket}
                 disabled={guardando}
                 className={`bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold cursor-pointer ${
                   guardando ? "opacity-50 cursor-not-allowed" : ""
                 }`}
               >
                 {guardando
                   ? "Guardando..."
                   : editandoId
                   ? "Guardar Cambios"
                   : "Crear Ticket"}
               </button>

              {editandoId && (
                <button
                  onClick={limpiarFormulario}
                  className="bg-zinc-700 hover:bg-zinc-600 px-6 py-3 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
              )}

            </div>

          </div>

        </div>

        {/* CONTENEDOR DEL LISTADO DE TICKETS (OCUPA 2 COLUMNAS) */}
        <div className="lg:col-span-2 bg-[#111827] border border-zinc-800 rounded-2xl p-6">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-xl font-bold">
              Tickets Registrados
            </h2>

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3 text-zinc-500"
              />

              <input
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
                placeholder="Buscar ticket..."
                className="bg-[#0F172A] border border-zinc-700 rounded-xl pl-10 pr-4 py-2"
              />

            </div>

          </div>

          {tickets.length === 0 ? (
            <p>No hay tickets registrados.</p>
          ) : (
            <div className="flex flex-col gap-4">

              {ticketsFiltrados.map((ticket) => {
                const evento =
                  obtenerEvento(
                    ticket.evento_id
                  );

                return (
                  <div
                    key={ticket.id}
                    className="bg-[#0F172A] border border-zinc-800 rounded-2xl p-5"
                  >

                    {evento && (
                      <>
                        <h3 className="text-xl font-bold text-red-400">
                          {evento.partido}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-400 mb-4">

                          <div className="flex items-center gap-2">
                            <CalendarDays size={14} />
                            {formatearFecha(evento.fecha)}
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin size={14} />
                            {evento.estadio}
                          </div>

                        </div>
                      </>
                    )}

                    <hr className="border-zinc-700 mb-4" />

                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-bold">
                        {ticket.nombre}
                      </h4>

                      <span
                        className="
                          bg-green-500/20
                          text-green-400
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                        "
                      >
                        Disponible
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">

                      <div>
                        <p className="text-2xl font-bold text-white">
                          ${ticket.precio.toLocaleString()}
                        </p>

                        <p className="text-sm text-zinc-400">
                          {ticket.cantidad} disponibles
                        </p>
                      </div>

                    </div>

                    <div className="flex gap-3 mt-4">

                      <button
                        onClick={() => editarTicket(ticket)}
                        className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => eliminarTicket(ticket.id)}
                        className="bg-red-600 hover:bg-red-700 p-3 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>

    </main>
  );
}