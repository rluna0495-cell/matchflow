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

  // PASO 1 — Agregar KPIs
  const [qrUsados, setQrUsados] = useState(0);
  const [qrDisponibles, setQrDisponibles] = useState(0);
  const [autorizados, setAutorizados] = useState(0);
  const [denegados, setDenegados] = useState(0);

  interface UltimoAcceso {
    id: number;
    comprador: string;
    ticketNombre: string;
    cantidad: number;
    usado: boolean;
    hora: string;
  }
  const [ultimosAccesos, setUltimosAccesos] = useState<UltimoAcceso[]>([]);
  const [camaraError, setCamaraError] = useState<string | null>(null);



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
      // PASO 5 — Contador de denegados (Primer bloque)
      setDenegados((prev) => prev + 1);
      setMensaje("QR NO ENCONTRADO");

      reproducirSonidoError();

      setTimeout(() => {
        limpiarPantalla();
      }, 3000);

      return;
    }

    if (venta.usado) {
      setEstado("denegado");
      // PASO 5 — Contador de denegados (Segundo bloque)
      setDenegados((prev) => prev + 1);
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
    // PASO 4 — Contador de autorizados
    setAutorizados((prev) => prev + 1);

    setMensaje("ACCESO AUTORIZADO");

    reproducirSonidoExito();

    // Recargar las estadísticas para actualizar el stock real en tiempo de escaneo
    cargarEstadisticas();

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

  // PASO 2 — Crear función de estadísticas
  async function cargarEstadisticas() {
    const { data: ventasData } = await supabase
      .from("ventas")
      .select("*");

    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("*");

    if (!ventasData) return;

    const usados = ventasData.filter(
      (v) => v.usado === true
    ).length;

    const disponibles = ventasData.filter(
      (v) => !v.usado
    ).length;

    setQrUsados(usados);
    setQrDisponibles(disponibles);

    const accesosValidados = ventasData
      .filter((v) => v.usado && v.fecha_ingreso)
      .sort((a, b) => new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime())
      .slice(0, 10)
      .map((v) => {
        const ticket = ticketsData?.find((t) => t.id === v.ticket_id);
        let horaStr = "—";
        if (v.fecha_ingreso) {
          const d = new Date(v.fecha_ingreso);
          horaStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return {
          id: v.id,
          comprador: v.comprador,
          ticketNombre: ticket?.nombre || "Zona desconocida",
          cantidad: v.cantidad,
          usado: true,
          hora: horaStr
        };
      });

    setUltimosAccesos(accesosValidados);
  }


  // PASO 3 — Ejecutar estadísticas al cargar
  useEffect(() => {
    cargarEstadisticas();

    let isMounted = true;
    let scanner: Html5Qrcode | null = null;

    const timer = setTimeout(() => {
      if (!isMounted) return;

      try {
        scanner = new Html5Qrcode("reader");
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
          .catch((err) => {
            console.error("Error al iniciar el scanner:", err);
            if (isMounted) {
              setCamaraError(
                "No se pudo acceder a la cámara. Asegúrate de otorgar permisos o conectar un dispositivo de captura."
              );
            }
          });
      } catch (e) {
        console.error("Error al instanciar Html5Qrcode:", e);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        const activeScanner = scannerRef.current;
        if (activeScanner.isScanning) {
          activeScanner.stop().catch((err) => console.error("Error al detener el scanner:", err));
        }
      }
    };
  }, []);


  return (
    // PASO 6 — Eliminar fondo verde y rojo
    <main className="space-y-8 p-8 text-white min-h-screen bg-black">
      
      {/* PASO 7 — Nuevo encabezado */}
      <div>
        <h1 className="text-4xl font-black">
          Centro de Validación QR
        </h1>

        <p className="text-zinc-400 mt-2">
          Control de acceso y validación de entradas.
        </p>
      </div>

      {/* PASO 8 — Agregar KPIs visuales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            QR Utilizados
          </p>

          <h2 className="text-4xl font-black mt-2">
            {qrUsados}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            QR Disponibles
          </p>

          <h2 className="text-4xl font-black mt-2">
            {qrDisponibles}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Accesos Autorizados
          </p>

          <h2 className="text-4xl font-black mt-2 text-green-500">
            {autorizados}
          </h2>
        </div>

        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Accesos Denegados
          </p>

          <h2 className="text-4xl font-black mt-2 text-red-500">
            {denegados}
          </h2>
        </div>

      </div>

      {/* NUEVA ESTRUCTURA EN DOS COLUMNAS */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* COLUMNA IZQUIERDA: SCANNER QR */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            Scanner QR
          </h2>

          {camaraError ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm">
              <p className="font-semibold">Aviso de Cámara</p>
              <p className="mt-1 text-zinc-400">{camaraError}</p>
            </div>
          ) : (
            <div
              id="reader"
              className={`max-w-md mx-auto rounded-xl overflow-hidden ${
                estado !== "esperando" ? "opacity-30" : ""
              }`}
            />
          )}
        </div>

        {/* COLUMNA DERECHA: RESULTADO DE VALIDACIÓN */}
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            Resultado de Validación
          </h2>

          <div className="space-y-6">
            {/* BADGES MEJORADOS SEGÚN EL ESTADO */}
            {estado === "esperando" && (
              <div>
                <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full inline-block text-sm font-semibold">
                  Esperando escaneo
                </div>
                <p className="text-zinc-400 mt-8">
                  Escanee un código QR para visualizar la información del acceso.
                </p>
              </div>
            )}

            {estado === "autorizado" && (
              <div className="space-y-4">
                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full inline-block text-sm font-semibold">
                  Acceso autorizado
                </div>
                <div className="text-6xl mt-2">✅</div>
              </div>
            )}

            {estado === "denegado" && (
              <div className="space-y-4">
                <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full inline-block text-sm font-semibold">
                  Acceso denegado
                </div>
                <div className="text-6xl mt-2">❌</div>
                <p className="text-2xl font-bold text-red-400">
                  {mensaje}
                </p>
              </div>
            )}

            {/* CARD RESULTADO CON PLACEHOLDERS SIEMPRE VISIBLES */}
            <div className="border-t border-zinc-800 pt-4 text-xl space-y-3">
              <p className="text-zinc-400">
                Comprador:{" "}
                <strong className={comprador ? "text-white" : "text-zinc-600 font-normal"}>
                  {comprador || "—"}
                </strong>
              </p>

              <p className="text-zinc-400">
                Ticket:{" "}
                <strong className={ticket ? "text-white" : "text-zinc-600 font-normal"}>
                  {ticket || "—"}
                </strong>
              </p>

              <p className="text-zinc-400">
                Cantidad:{" "}
                <strong className={cantidad > 0 ? "text-white" : "text-zinc-600 font-normal"}>
                  {cantidad > 0 ? cantidad : "—"}
                </strong>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* BLOQUE NUEVO: ÚLTIMOS ACCESOS */}
      <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6 mt-8">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">
            Últimos Accesos
          </h2>

          <span className="text-sm text-zinc-400">
            Historial reciente
          </span>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-zinc-800 text-left">

                <th className="py-4">
                  Comprador
                </th>

                <th className="py-4">
                  Ticket
                </th>

                <th className="py-4">
                  Cantidad
                </th>

                <th className="py-4">
                  Estado
                </th>

                <th className="py-4">
                  Hora
                </th>

              </tr>

            </thead>

            <tbody>
              {ultimosAccesos.map((acceso) => (
                <tr key={acceso.id} className="border-b border-zinc-900">
                  <td className="py-4">{acceso.comprador}</td>
                  <td className="py-4">{acceso.ticketNombre}</td>
                  <td className="py-4">{acceso.cantidad}</td>
                  <td className="py-4">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                      Autorizado
                    </span>
                  </td>
                  <td className="py-4">{acceso.hora}</td>
                </tr>
              ))}
              {ultimosAccesos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No hay accesos validados recientes.
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

      </div>
    </main>
  );
}