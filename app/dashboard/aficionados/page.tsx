"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Aficionado {
  id: number;
  nombre: string;
  cedula: string;
  email: string;
  telefono: string;
}

export default function AficionadosPage() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [aficionados, setAficionados] = useState<Aficionado[]>([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarAficionados();
  }, []);

  async function cargarAficionados() {
    const { data } = await supabase
      .from("aficionados")
      .select("*")
      .order("id", { ascending: false });

    if (data) {
      setAficionados(data);
    }
  }

  async function registrarAficionado() {
    setMensaje("");

    if (
      !nombre.trim() ||
      !cedula.trim() ||
      !email.trim() ||
      !telefono.trim()
    ) {
      setMensaje("Todos los campos son obligatorios");
      return;
    }

    const { error } = await supabase
      .from("aficionados")
      .insert([
        {
          nombre,
          cedula,
          email,
          telefono,
        },
      ]);

    if (error) {
      if (
        error.message.includes(
          "aficionados_cedula_unique"
        )
      ) {
        setMensaje(
          "Ya existe un aficionado con esa cédula"
        );
      } else {
        setMensaje(error.message);
      }

      return;
    }

    setNombre("");
    setCedula("");
    setEmail("");
    setTelefono("");

    setMensaje("Aficionado registrado correctamente");

    cargarAficionados();
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-5xl font-bold text-red-500 mb-8">
        Aficionados
      </h1>

      <div className="bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          Registrar Aficionado
        </h2>

        <div className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            className="p-3 rounded bg-zinc-800"
          />

          <input
            type="text"
            placeholder="Cédula"
            value={cedula}
            onChange={(e) =>
              setCedula(e.target.value)
            }
            className="p-3 rounded bg-zinc-800"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="p-3 rounded bg-zinc-800"
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) =>
              setTelefono(e.target.value)
            }
            className="p-3 rounded bg-zinc-800"
          />

          <button
            onClick={registrarAficionado}
            className="bg-red-600 hover:bg-red-700 p-3 rounded font-bold"
          >
            Registrar
          </button>

        </div>

        {mensaje && (
          <div className="mt-4 font-bold">
            {mensaje}
          </div>
        )}
      </div>

      <div className="bg-zinc-900 p-6 rounded-xl mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Lista de Aficionados
        </h2>

        <div className="space-y-4">
          {aficionados.map((aficionado) => (
            <div
              key={aficionado.id}
              className="bg-zinc-800 p-4 rounded-lg"
            >
              <h3 className="font-bold text-lg">
                {aficionado.nombre}
              </h3>

              <p>
                <strong>Cédula:</strong>{" "}
                {aficionado.cedula}
              </p>

              <p>{aficionado.email}</p>

              <p>{aficionado.telefono}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}