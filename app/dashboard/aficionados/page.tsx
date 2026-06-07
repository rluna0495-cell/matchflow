"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [aficionados, setAficionados] = useState<
    Aficionado[]
  >([]);

  useEffect(() => {
    cargarAficionados();
  }, []);

  async function cargarAficionados() {
    const { data } = await supabase
      .from("aficionados")
      .select("*")
      .order("id", {
        ascending: false,
      });

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
      setMensaje(
        "Todos los campos son obligatorios"
      );
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

    setMensaje(
      "✅ Aficionado registrado correctamente"
    );

    await cargarAficionados();
  }

  const aficionadosFiltrados = useMemo(() => {
    return aficionados.filter((aficionado) => {
      const texto = busqueda.toLowerCase();

      return (
        aficionado.nombre
          .toLowerCase()
          .includes(texto) ||
        aficionado.cedula
          .toLowerCase()
          .includes(texto)
      );
    });
  }, [aficionados, busqueda]);

  const totalAficionados =
    aficionados.length;

  const conEmail = aficionados.filter(
    (a) => a.email
  ).length;

  const conTelefono = aficionados.filter(
    (a) => a.telefono
  ).length;

  const porcentajeCompleto =
    totalAficionados > 0
      ? Math.round(
          ((conEmail + conTelefono) /
            (totalAficionados * 2)) *
            100
        )
      : 0;

  return (
    <main className="space-y-8">

      <div>
        <h1 className="text-4xl font-black">
          Aficionados
        </h1>

        <p className="text-zinc-400 mt-2">
          Gestiona la base de datos de
          seguidores y compradores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Total Aficionados
          </p>

          <h2 className="text-4xl font-black mt-2">
            {totalAficionados}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Con Email
          </p>

          <h2 className="text-4xl font-black mt-2">
            {conEmail}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Con Teléfono
          </p>

          <h2 className="text-4xl font-black mt-2">
            {conTelefono}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Base Completa
          </p>

          <h2 className="text-4xl font-black mt-2 text-blue-500">
            {porcentajeCompleto}%
          </h2>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Nuevo Aficionado
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              className="w-full bg-[#09090B] border border-zinc-700 rounded-xl p-4 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Cédula"
              value={cedula}
              onChange={(e) =>
                setCedula(e.target.value)
              }
              className="w-full bg-[#09090B] border border-zinc-700 rounded-xl p-4 outline-none focus:border-blue-500"
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-[#09090B] border border-zinc-700 rounded-xl p-4 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) =>
                setTelefono(
                  e.target.value
                )
              }
              className="w-full bg-[#09090B] border border-zinc-700 rounded-xl p-4 outline-none focus:border-blue-500"
            />

            <button
              onClick={
                registrarAficionado
              }
              className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl p-4 font-bold"
            >
              Registrar Aficionado
            </button>

            {mensaje && (
              <div className="bg-[#09090B] border border-zinc-700 rounded-xl p-4">
                {mensaje}
              </div>
            )}

          </div>

        </div>

        <div className="lg:col-span-2 bg-[#111827] border border-zinc-800 rounded-2xl p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <h2 className="text-2xl font-bold">
              Base de Aficionados
            </h2>

            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              className="bg-[#09090B] border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 md:w-80"
            />

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-zinc-800 text-left">

                  <th className="py-4">
                    Nombre
                  </th>

                  <th className="py-4">
                    Cédula
                  </th>

                  <th className="py-4">
                    Correo
                  </th>

                  <th className="py-4">
                    Teléfono
                  </th>

                </tr>

              </thead>

              <tbody>

                {aficionadosFiltrados.map(
                  (aficionado) => (
                    <tr
                      key={
                        aficionado.id
                      }
                      className="border-b border-zinc-900 hover:bg-[#0F172A]"
                    >
                      <td className="py-4">
                        {
                          aficionado.nombre
                        }
                      </td>

                      <td className="py-4">
                        {
                          aficionado.cedula
                        }
                      </td>

                      <td className="py-4">
                        {
                          aficionado.email
                        }
                      </td>

                      <td className="py-4">
                        {
                          aficionado.telefono
                        }
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </main>
  );
}