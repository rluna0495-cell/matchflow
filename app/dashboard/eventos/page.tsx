"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Evento {
  id: number;
  partido: string;
  fecha: string;
  estadio: string;
  created_at?: string;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);

  const [partido, setPartido] = useState("");
  const [fecha, setFecha] = useState("");
  const [estadio, setEstadio] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);

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

    if (editandoId !== null) {
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

    setPartido("");
    setFecha("");
    setEstadio("");
    setEditandoId(null);

    cargarEventos();
  }

  async function eliminarEvento(id: number) {
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
  }

  useEffect(() => {
    cargarEventos();
  }, []);

  return (
    <main className="p-8 text-white">
      <h1 className="text-5xl font-bold text-red-500 mb-8">
        Gestión de Eventos
      </h1>

      <div className="bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-3xl font-semibold mb-4">
          {editandoId ? "Editar Evento" : "Crear Evento"}
        </h2>

        <div className="flex flex-col gap-4">
          <input
            value={partido}
            onChange={(e) => setPartido(e.target.value)}
            placeholder="Partido"
            className="p-3 rounded bg-zinc-800"
          />

          <input
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            placeholder="Fecha"
            className="p-3 rounded bg-zinc-800"
          />

          <input
            value={estadio}
            onChange={(e) => setEstadio(e.target.value)}
            placeholder="Estadio"
            className="p-3 rounded bg-zinc-800"
          />

          <button
            onClick={guardarEvento}
            className="bg-red-600 hover:bg-red-700 p-3 rounded font-bold"
          >
            {editandoId ? "Guardar Cambios" : "Crear Evento"}
          </button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-4">
          Eventos Registrados
        </h2>

        {eventos.length === 0 ? (
          <div className="bg-zinc-900 p-5 rounded-xl">
            No hay eventos registrados.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-zinc-900 p-5 rounded-xl"
              >
                <h3 className="text-xl font-bold">
                  {evento.partido}
                </h3>

                <p>{evento.fecha}</p>

                <p>{evento.estadio}</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => editarEvento(evento)}
                    className="bg-blue-600 px-4 py-2 rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarEvento(evento.id)}
                    className="bg-red-700 px-4 py-2 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}