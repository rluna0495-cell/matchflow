"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react";

interface Evento {
  id: number;
  partido: string;
  fecha: string;
  estadio: string;
  created_at?: string;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [partido, setPartido] = useState("");
  const [fecha, setFecha] = useState("");
  const [estadio, setEstadio] = useState("");

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  useEffect(() => {
    cargarEventos();
  }, []);

  async function cargarEventos() {
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setEventos(data || []);
  }

  async function guardarEvento() {
    if (!partido || !fecha || !estadio) {
      alert("Completa todos los campos");
      return;
    }

    if (editandoId) {
      const { error } = await supabase
        .from("eventos")
        .update({
          partido,
          fecha,
          estadio,
        })
        .eq("id", editandoId);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("eventos")
        .insert([
          {
            partido,
            fecha,
            estadio,
          },
        ]);

      if (error) {
        alert(error.message);
        return;
      }
    }

    limpiarFormulario();
    cargarEventos();
  }

  async function eliminarEvento(id: number) {
    const confirmar = confirm(
      "¿Eliminar este evento?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    cargarEventos();
  }

  function editarEvento(evento: Evento) {
    setPartido(evento.partido);
    setFecha(evento.fecha);
    setEstadio(evento.estadio);
    setEditandoId(evento.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function limpiarFormulario() {
    setPartido("");
    setFecha("");
    setEstadio("");
    setEditandoId(null);
  }

  const eventosFiltrados = eventos.filter(
    (evento) =>
      evento.partido
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      evento.estadio
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          Gestión de Eventos
        </h1>

        <p className="text-zinc-400 mt-2">
          Administra todos los eventos
          deportivos.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400">
            Total Eventos
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {eventos.length}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400">
            Próximos Eventos
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {eventos.length}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400">
            Estadios Registrados
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {
              new Set(
                eventos.map(
                  (e) => e.estadio
                )
              ).size
            }
          </h2>
        </div>

      </div>

      <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">

        <div className="flex items-center gap-3 mb-6">
          <Plus size={20} />

          <h2 className="text-xl font-bold">
            {editandoId
              ? "Editar Evento"
              : "Nuevo Evento"}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">

          <input
            value={partido}
            onChange={(e) =>
              setPartido(e.target.value)
            }
            placeholder="Real Madrid vs Barcelona"
            className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3"
          />

          <input
            type="text"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
            className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3"
          />

          <input
            value={estadio}
            onChange={(e) =>
              setEstadio(e.target.value)
            }
            placeholder="Santiago Bernabéu"
            className="bg-[#0F172A] border border-zinc-700 rounded-xl p-3"
          />

        </div>

        <div className="flex gap-3 mt-5">

          <button
            onClick={guardarEvento}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
          >
            {editandoId
              ? "Actualizar Evento"
              : "Crear Evento"}
          </button>

          {editandoId && (
            <button
              onClick={limpiarFormulario}
              className="bg-zinc-700 hover:bg-zinc-600 px-6 py-3 rounded-xl"
            >
              Cancelar
            </button>
          )}

        </div>

      </div>

      <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-bold">
            Eventos Registrados
          </h2>

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3 text-zinc-500"
            />

            <input
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar evento..."
              className="bg-[#0F172A] border border-zinc-700 rounded-xl pl-10 pr-4 py-2"
            />

          </div>

        </div>

        <div className="space-y-4">

          {eventosFiltrados.map(
            (evento) => (
              <div
                key={evento.id}
                className="bg-[#0F172A] border border-zinc-800 rounded-xl p-5"
              >
                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="text-2xl font-bold">
                      {evento.partido}
                    </h3>

                    <div className="flex items-center gap-2 mt-3 text-zinc-400">
                      <CalendarDays size={16} />

                      {evento.fecha}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-zinc-400">
                      <MapPin size={16} />

                      {evento.estadio}
                    </div>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        editarEvento(
                          evento
                        )
                      }
                      className="bg-blue-600 p-3 rounded-lg"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        eliminarEvento(
                          evento.id
                        )
                      }
                      className="bg-red-600 p-3 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>
              </div>
            )
          )}

          {eventosFiltrados.length === 0 && (
            <div className="text-center py-10 text-zinc-500">
              No se encontraron eventos.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}