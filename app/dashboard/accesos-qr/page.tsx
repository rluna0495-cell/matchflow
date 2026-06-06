"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";

interface Venta {
  id: number;
  ticket_id: number;
  comprador: string;
  cantidad: number;
  qr_code: string;
  usado: boolean;
  fecha_ingreso: string | null;
  aficionado_id: number | null;
}

interface Aficionado {
  id: number;
  nombre: string;
  cedula: string;
  email: string;
  telefono: string;
}

export default function AccesosQRPage() {
  const [codigoQR, setCodigoQR] = useState("");
  const [venta, setVenta] = useState<Venta | null>(null);
  const [aficionado, setAficionado] =
    useState<Aficionado | null>(null);

  const [ticketNombre, setTicketNombre] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const scannerRef =
    useRef<Html5Qrcode | null>(null);

  async function buscarQR(codigo: string) {
    setLoading(true);

    setMensaje("");
    setVenta(null);
    setAficionado(null);
    setTicketNombre("");

    const { data, error } = await supabase
      .from("ventas")
      .select("*")
      .eq("qr_code", codigo.trim())
      .single();

    if (error || !data) {
      setMensaje("❌ QR no encontrado");
      setLoading(false);
      return;
    }

    setVenta(data);

    const { data: ticket } = await supabase
      .from("tickets")
      .select("nombre")
      .eq("id", data.ticket_id)
      .single();

    if (ticket) {
      setTicketNombre(ticket.nombre);
    }

    if (data.aficionado_id) {
      const { data: aficionadoData } =
        await supabase
          .from("aficionados")
          .select("*")
          .eq("id", data.aficionado_id)
          .single();

      if (aficionadoData) {
        setAficionado(aficionadoData);
      }
    }

    setLoading(false);
  }

  async function validarIngreso() {
    if (!venta) return;

    if (venta.usado) {
      setMensaje(
        "🚫 Este QR ya fue utilizado"
      );
      return;
    }

    const fechaIngreso =
      new Date().toISOString();

    const { error } = await supabase
      .from("ventas")
      .update({
        usado: true,
        fecha_ingreso: fechaIngreso,
      })
      .eq("id", venta.id);

    if (error) {
      setMensaje(
        `❌ ${error.message}`
      );
      return;
    }

    setVenta({
      ...venta,
      usado: true,
      fecha_ingreso: fechaIngreso,
    });

    setMensaje(
      "✅ Acceso permitido"
    );
  }

  useEffect(() => {
    const scanner =
      new Html5Qrcode("reader");

    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        async (decodedText) => {
          setCodigoQR(decodedText);

          await buscarQR(
            decodedText
          );
        },
        () => {}
      )
      .catch((err) => {
        console.error(err);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, []);

  return (
    <main className="p-8 text-white">
      <h1 className="text-5xl font-bold text-red-500 mb-8">
        Accesos QR
      </h1>

      <div className="bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          Escáner QR
        </h2>

        <div
          id="reader"
          className="w-full max-w-md mx-auto mb-6"
        />

        <input
          type="text"
          value={codigoQR}
          onChange={(e) =>
            setCodigoQR(
              e.target.value
            )
          }
          placeholder="Código QR"
          className="w-full p-3 rounded bg-zinc-800 mb-4"
        />

        <button
          onClick={() =>
            buscarQR(codigoQR)
          }
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold w-full"
        >
          {loading
            ? "Buscando..."
            : "Buscar QR"}
        </button>

        {venta && (
          <div className="mt-6 bg-zinc-800 p-6 rounded-lg">

            <h2 className="text-3xl font-bold text-green-400 mb-4">
              Información del Acceso
            </h2>

            <div className="space-y-2">

              <p>
                <strong>Ticket:</strong>{" "}
                {ticketNombre}
              </p>

              <p>
                <strong>Cantidad:</strong>{" "}
                {venta.cantidad}
              </p>

              <p>
                <strong>QR:</strong>{" "}
                {venta.qr_code}
              </p>

              <p>
                <strong>Estado:</strong>{" "}
                {venta.usado
                  ? "🔴 Ya utilizado"
                  : "🟢 Disponible"}
              </p>

              {venta.fecha_ingreso && (
                <p>
                  <strong>
                    Fecha ingreso:
                  </strong>{" "}
                  {new Date(
                    venta.fecha_ingreso
                  ).toLocaleString()}
                </p>
              )}
            </div>

            {aficionado && (
              <div className="mt-6 border-t border-zinc-700 pt-6">

                <h3 className="text-2xl font-bold text-red-400 mb-4">
                  Datos del Aficionado
                </h3>

                <p>
                  <strong>Nombre:</strong>{" "}
                  {aficionado.nombre}
                </p>

                <p>
                  <strong>Cédula:</strong>{" "}
                  {aficionado.cedula}
                </p>

                <p>
                  <strong>Correo:</strong>{" "}
                  {aficionado.email}
                </p>

                <p>
                  <strong>Teléfono:</strong>{" "}
                  {aficionado.telefono}
                </p>
              </div>
            )}

            {!venta.usado && (
              <button
                onClick={
                  validarIngreso
                }
                className="mt-6 bg-green-600 hover:bg-green-700 p-3 rounded font-bold w-full"
              >
                Permitir Acceso
              </button>
            )}
          </div>
        )}

        {mensaje && (
          <div className="mt-6 text-xl font-bold">
            {mensaje}
          </div>
        )}
      </div>
    </main>
  );
}