"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";

export default function AccesosQRPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [escaneando, setEscaneando] = useState(false);

  const [estado, setEstado] = useState<
    "esperando" | "autorizado" | "denegado"
  >("esperando");

  const [mensaje, setMensaje] = useState("");

  const [comprador, setComprador] = useState("");
  const [ticket, setTicket] = useState("");
  const [cantidad, setCantidad] = useState(0);

  async function validarQR(qrCode: string) {
    if (escaneando) return;

    setEscaneando(true);

    const { data: venta, error } = await supabase
      .from("ventas")
      .select("*")
      .eq("qr_code", qrCode)
      .single();

    if (error || !venta) {
      setEstado("denegado");
      setMensaje("QR NO ENCONTRADO");

      reproducirSonidoError();

      setTimeout(() => {
        limpiarPantalla();
      }, 3000);

      return;
    }

    if (venta.usado) {
      setEstado("denegado");
      setMensaje("TICKET YA UTILIZADO");

      reproducirSonidoError();

      setTimeout(() => {
        limpiarPantalla();
      }, 3000);

      return;
    }

    const { data: ticketData } = await supabase
      .from("tickets")
      .select("nombre")
      .eq("id", venta.ticket_id)
      .single();

    await supabase
      .from("ventas")
      .update({
        usado: true,
        fecha_ingreso: new Date().toISOString(),
      })
      .eq("id", venta.id);

    setComprador(venta.comprador);

    setTicket(
      ticketData?.nombre || "Zona no encontrada"
    );

    setCantidad(venta.cantidad);

    setEstado("autorizado");

    setMensaje("ACCESO AUTORIZADO");

    reproducirSonidoExito();

    setTimeout(() => {
      limpiarPantalla();
    }, 3000);
  }

  function limpiarPantalla() {
    setEstado("esperando");
    setMensaje("");
    setComprador("");
    setTicket("");
    setCantidad(0);
    setEscaneando(false);
  }

  function reproducirSonidoExito() {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
    );

    audio.play().catch(() => {});
  }

  function reproducirSonidoError() {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    audio.play().catch(() => {});
  }

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        async (decodedText) => {
          await validarQR(decodedText.trim());
        },
        () => {}
      )
      .catch(console.error);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <main
      className={`min-h-screen p-8 text-white transition-all duration-300 ${
        estado === "autorizado"
          ? "bg-green-900"
          : estado === "denegado"
          ? "bg-red-900"
          : "bg-black"
      }`}
    >
      <h1 className="text-5xl font-bold mb-8 text-center">
        Control de Accesos QR
      </h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-900 rounded-xl p-6">

          <h2 className="text-3xl font-bold mb-6 text-center">
            Escanee el Ticket
          </h2>

          <div
            id="reader"
            className={`max-w-md mx-auto ${
              estado !== "esperando"
                ? "opacity-30"
                : ""
            }`}
          />

          {estado === "esperando" && (
            <div className="text-center mt-6">
              <p className="text-xl text-zinc-300">
                Esperando QR...
              </p>
            </div>
          )}

          {estado === "autorizado" && (
            <div className="text-center mt-8">

              <div className="text-8xl mb-4">
                ✅
              </div>

              <h2 className="text-5xl font-bold text-green-400 mb-6">
                ACCESO AUTORIZADO
              </h2>

              <div className="text-2xl space-y-3">
                <p>
                  Comprador:
                  <strong>
                    {" "}
                    {comprador}
                  </strong>
                </p>

                <p>
                  Zona:
                  <strong>
                    {" "}
                    {ticket}
                  </strong>
                </p>

                <p>
                  Cantidad:
                  <strong>
                    {" "}
                    {cantidad}
                  </strong>
                </p>
              </div>

            </div>
          )}

          {estado === "denegado" && (
            <div className="text-center mt-8">

              <div className="text-8xl mb-4">
                ❌
              </div>

              <h2 className="text-5xl font-bold text-red-400 mb-4">
                ACCESO DENEGADO
              </h2>

              <p className="text-3xl">
                {mensaje}
              </p>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}