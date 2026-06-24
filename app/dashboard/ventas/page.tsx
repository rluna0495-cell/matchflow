"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import { generarTicketPDF } from "@/lib/pdf-ticket";
import { ChevronDown, ChevronUp, Download, TicketIcon } from "lucide-react";
import { useModal } from "@/components/modal-provider";

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

interface Aficionado {
  id: number;
  nombre: string;
  cedula: string;
}

// Un boleto individual (1 fila en ventas)
interface Boleto {
  id: number;
  ticket_id: number;
  comprador: string;
  cantidad: number;
  qr_code: string;
  qr_image: string;
  usado?: boolean;
  venta_grupo?: string;
  aficionado_id?: number;
  precio_unitario?: number;
  total?: number;
}

// Un grupo de boletos de la misma compra
interface GrupoVenta {
  grupo: string;
  comprador: string;
  ticket_id: number;
  boletos: Boleto[];
  totalBoletos: number;
  totalPagado: number;
  boletosUsados: number;
}

export default function VentasPage() {
  const router = useRouter();
  const { showAlert } = useModal();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [aficionados, setAficionados] = useState<Aficionado[]>([]);
  const [grupos, setGrupos] = useState<GrupoVenta[]>([]);
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set());

  const [ticketId, setTicketId] = useState("");
  const [eventoId, setEventoId] = useState("");
  const [aficionadoId, setAficionadoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [busquedaAficionado, setBusquedaAficionado] = useState("");
  const [mostrarAficionadosList, setMostrarAficionadosList] = useState(false);

  const ticketsFiltrados = tickets.filter(
    (t) => !eventoId || t.evento_id === Number(eventoId)
  );

  const handleEventoChange = (id: string) => {
    setEventoId(id);
    setTicketId("");
  };

  const aficionadosFiltradosBusqueda = aficionados.filter((aficionado) => {
    const term = busquedaAficionado.toLowerCase();
    const selectedFan = aficionados.find((a) => a.id === Number(aficionadoId));
    if (
      selectedFan &&
      busquedaAficionado === `${selectedFan.nombre} (C.I: ${selectedFan.cedula})`
    ) {
      return true;
    }
    return (
      aficionado.nombre.toLowerCase().includes(term) ||
      aficionado.cedula.toLowerCase().includes(term)
    );
  });

  const seleccionarAficionado = (aficionado: Aficionado) => {
    setAficionadoId(aficionado.id.toString());
    setBusquedaAficionado(`${aficionado.nombre} (C.I: ${aficionado.cedula})`);
    setMostrarAficionadosList(false);
  };

  async function cargarDatos() {
    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("*")
      .order("id", { ascending: false });

    const { data: eventosData } = await supabase.from("eventos").select("*");

    const { data: aficionadosData } = await supabase
      .from("aficionados")
      .select("*");

    const { data: ventasData } = await supabase
      .from("ventas")
      .select("*")
      .order("id", { ascending: false });

    setTickets(ticketsData || []);
    setEventos(eventosData || []);
    setAficionados(aficionadosData || []);

    if (ventasData) {
      // Generar imágenes QR para cada boleto
      const boletosConQR: Boleto[] = await Promise.all(
        ventasData.map(async (v) => ({
          ...v,
          qr_image: await QRCode.toDataURL(v.qr_code),
        }))
      );

      // Agrupar boletos por venta_grupo (o por id si no tiene grupo)
      const mapaGrupos = new Map<string, GrupoVenta>();

      for (const boleto of boletosConQR) {
        // Extraer grupo del qr_code (formato: GRUPO-12345-123-B01)
        const match = boleto.qr_code.match(/^(.*?)-B\d+$/);
        const clave = match ? match[1] : `solo-${boleto.id}`;

        if (!mapaGrupos.has(clave)) {
          mapaGrupos.set(clave, {
            grupo: clave,
            comprador: boleto.comprador,
            ticket_id: boleto.ticket_id,
            boletos: [],
            totalBoletos: 0,
            totalPagado: 0,
            boletosUsados: 0,
          });
        }

        const g = mapaGrupos.get(clave)!;
        g.boletos.push(boleto);
        g.totalBoletos += 1;
        g.totalPagado += boleto.precio_unitario || 0;
        if (boleto.usado) g.boletosUsados += 1;
      }

      setGrupos(Array.from(mapaGrupos.values()));
    }
  }

  async function registrarVenta() {
    if (!ticketId || !aficionadoId || !cantidad) {
      await showAlert("Completa todos los campos");
      return;
    }

    const cantNum = Number(cantidad);
    if (cantNum < 1 || cantNum > 10) {
      await showAlert("La cantidad debe ser entre 1 y 10 boletos.");
      return;
    }

    if (guardando) return;
    setGuardando(true);

    try {
      const ticket = tickets.find((t) => t.id === Number(ticketId));
      if (!ticket) {
        await showAlert("Ticket no encontrado");
        return;
      }

      const aficionado = aficionados.find((a) => a.id === Number(aficionadoId));
      if (!aficionado) {
        await showAlert("Aficionado no encontrado");
        return;
      }

      if (cantNum > ticket.cantidad) {
        await showAlert(`Stock insuficiente. Solo quedan ${ticket.cantidad} boletos.`);
        return;
      }

      // Identificador único del grupo de compra
      const grupoId = `GRUPO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // Crear 1 registro por boleto, cada uno con su propio QR único
      const registros = Array.from({ length: cantNum }, (_, i) => ({
        ticket_id: ticket.id,
        comprador: aficionado.nombre,
        cantidad: 1,
        qr_code: `${grupoId}-B${String(i + 1).padStart(2, "0")}`,
        usado: false,
        aficionado_id: aficionado.id,
        precio_unitario: ticket.precio,
        total: ticket.precio,
      }));

      const { error } = await supabase.from("ventas").insert(registros);

      if (error) {
        await showAlert(error.message);
        return;
      }

      await supabase
        .from("tickets")
        .update({ cantidad: ticket.cantidad - cantNum })
        .eq("id", ticket.id);

      await showAlert(
        `✅ Venta registrada: ${cantNum} boleto${cantNum > 1 ? "s" : ""} con QRs únicos.`
      );

      setCantidad("");
      setTicketId("");
      setAficionadoId("");
      setEventoId("");
      setBusquedaAficionado("");

      await cargarDatos();
    } catch (err: any) {
      await showAlert(err.message || "Error al registrar la venta");
    } finally {
      setGuardando(false);
    }
  }

  function descargarPDF(boleto: Boleto) {
    const ticket = tickets.find((t) => t.id === boleto.ticket_id);
    if (!ticket) return;

    const evento = eventos.find((e) => e.id === ticket.evento_id);
    if (!evento) return;

    // Extraer número de boleto del qr_code (B01, B02, ...)
    const numBoleto = boleto.qr_code.match(/-B(\d+)$/)?.[1] ?? "1";

    generarTicketPDF({
      comprador: boleto.comprador,
      partido: evento.partido,
      fecha: evento.fecha,
      estadio: evento.estadio,
      zona: ticket.nombre,
      qr: boleto.qr_code,
      qrImage: boleto.qr_image,
      numeroBoleto: parseInt(numBoleto),
      totalBoletos: grupos.find((g) => {
        const match = boleto.qr_code.match(/^(.*?)-B\d+$/);
        const clave = match ? match[1] : `solo-${boleto.id}`;
        return g.grupo === clave;
      })?.totalBoletos ?? 1,
    });
  }

  function toggleGrupo(grupo: string) {
    setGruposExpandidos((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(grupo)) {
        nuevo.delete(grupo);
      } else {
        nuevo.add(grupo);
      }
      return nuevo;
    });
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // KPIs calculados
  const totalBoletos = grupos.reduce((acc, g) => acc + g.totalBoletos, 0);
  const totalUsados = grupos.reduce((acc, g) => acc + g.boletosUsados, 0);
  const totalDisponibles = tickets.reduce((acc, t) => acc + t.cantidad, 0);

  return (
    <main className="space-y-8 text-white">
      <div>
        <h1 className="text-4xl font-black">Gestión de Ventas</h1>
        <p className="text-zinc-400 mt-2">
          Registro, control y emisión de tickets digitales con QR único por boleto.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">Tipos de Ticket</p>
          <h2 className="text-4xl font-bold mt-2">{tickets.length}</h2>
        </div>
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">Boletos Emitidos</p>
          <h2 className="text-4xl font-bold mt-2 text-blue-400">{totalBoletos}</h2>
        </div>
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">Boletos Usados</p>
          <h2 className="text-4xl font-bold mt-2 text-red-400">{totalUsados}</h2>
        </div>
        <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">Stock Disponible</p>
          <h2 className="text-4xl font-bold mt-2 text-green-400">{totalDisponibles}</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="lg:col-span-1">
          <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-6">Nueva Venta</h2>

            <div className="space-y-4">
              {/* Evento */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">Evento</label>
                <select
                  value={eventoId}
                  onChange={(e) => handleEventoChange(e.target.value)}
                  className="w-full bg-[#0F172A] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar Evento</option>
                  {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.partido}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ticket / Zona */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">Ticket / Zona</label>
                <select
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  disabled={!eventoId}
                  className={`w-full bg-[#0F172A] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500 ${
                    !eventoId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">
                    {eventoId ? "Seleccionar Zona" : "Selecciona un evento primero"}
                  </option>
                  {ticketsFiltrados.map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.nombre} — ${ticket.precio} | Stock: {ticket.cantidad}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aficionado buscador */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">Aficionado</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o cédula..."
                    value={busquedaAficionado}
                    onFocus={() => setMostrarAficionadosList(true)}
                    onBlur={() =>
                      setTimeout(() => setMostrarAficionadosList(false), 200)
                    }
                    onChange={(e) => {
                      setBusquedaAficionado(e.target.value);
                      setAficionadoId("");
                      setMostrarAficionadosList(true);
                    }}
                    className="w-full bg-[#0F172A] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                  />

                  {mostrarAficionadosList && (
                    <div className="absolute z-10 w-full mt-1 bg-[#111827] border border-zinc-800 rounded-xl max-h-52 overflow-y-auto shadow-2xl">
                      {aficionadosFiltradosBusqueda.length === 0 ? (
                        <div className="p-3 text-zinc-500 text-sm text-center">
                          Sin resultados
                        </div>
                      ) : (
                        aficionadosFiltradosBusqueda.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => seleccionarAficionado(a)}
                            className="w-full text-left px-4 py-3 hover:bg-[#1E293B] border-b border-zinc-800/50 last:border-0 transition text-sm flex flex-col cursor-pointer"
                          >
                            <span className="font-semibold text-white">{a.nombre}</span>
                            <span className="text-zinc-400 text-xs mt-0.5">
                              C.I: {a.cedula}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cantidad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">
                  Cantidad de Boletos{" "}
                  <span className="text-zinc-500 text-xs">(máx. 10)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Ej: 2"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full bg-[#0F172A] border border-zinc-700 rounded-xl p-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Preview de precio */}
              {ticketId && cantidad && Number(cantidad) > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-blue-400 text-sm font-medium">Resumen de compra</p>
                  <p className="text-white font-bold text-lg mt-1">
                    {cantidad} boleto{Number(cantidad) > 1 ? "s" : ""} ×{" "}
                    ${tickets.find((t) => t.id === Number(ticketId))?.precio ?? 0} ={" "}
                    <span className="text-green-400">
                      ${(Number(cantidad) * (tickets.find((t) => t.id === Number(ticketId))?.precio ?? 0)).toFixed(2)}
                    </span>
                  </p>
                  <p className="text-zinc-400 text-xs mt-1">
                    Se generarán {cantidad} QR únicos e individuales
                  </p>
                </div>
              )}

              <button
                onClick={registrarVenta}
                disabled={guardando}
                className={`w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-3.5 font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                  guardando ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {guardando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generando boletos...
                  </>
                ) : (
                  <>
                    <TicketIcon size={18} />
                    Registrar Venta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* HISTORIAL AGRUPADO */}
        <div className="lg:col-span-2">
          <div className="bg-[#111827] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Boletos Emitidos</h2>
              <span className="text-zinc-400 text-sm">
                {grupos.length} transaccion{grupos.length !== 1 ? "es" : ""}
              </span>
            </div>

            {grupos.length === 0 && (
              <div className="text-center py-16 text-zinc-500">
                <TicketIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>No hay ventas registradas aún.</p>
              </div>
            )}

            <div className="space-y-4">
              {grupos.map((grupo) => {
                const ticket = tickets.find((t) => t.id === grupo.ticket_id);
                const evento = ticket
                  ? eventos.find((e) => e.id === ticket.evento_id)
                  : null;
                const expandido = gruposExpandidos.has(grupo.grupo);
                const todosUsados =
                  grupo.boletosUsados === grupo.totalBoletos;
                const algunoUsado = grupo.boletosUsados > 0;

                return (
                  <div
                    key={grupo.grupo}
                    className="bg-[#0F172A] border border-zinc-800 rounded-2xl overflow-hidden"
                  >
                    {/* Cabecera del grupo */}
                    <button
                      onClick={() => toggleGrupo(grupo.grupo)}
                      className="w-full flex items-center justify-between p-5 hover:bg-[#1E293B]/50 transition cursor-pointer text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-lg text-white truncate">
                            {grupo.comprador}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                              todosUsados
                                ? "bg-red-500/20 text-red-400"
                                : algunoUsado
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {todosUsados
                              ? "Todos usados"
                              : algunoUsado
                              ? `${grupo.boletosUsados}/${grupo.totalBoletos} usados`
                              : "Disponibles"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400 flex-wrap">
                          <span>
                            {ticket?.nombre ?? "Zona desconocida"}
                          </span>
                          {evento && (
                            <>
                              <span className="text-zinc-700">·</span>
                              <span>{evento.partido}</span>
                            </>
                          )}
                          <span className="text-zinc-700">·</span>
                          <span className="font-semibold text-white">
                            {grupo.totalBoletos} boleto
                            {grupo.totalBoletos !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0 text-zinc-500">
                        {expandido ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </button>

                    {/* Boletos expandidos */}
                    {expandido && (
                      <div className="border-t border-zinc-800 p-5">
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {grupo.boletos.map((boleto, idx) => (
                            <div
                              key={boleto.id}
                              className={`rounded-xl border p-4 flex flex-col items-center gap-3 ${
                                boleto.usado
                                  ? "border-red-500/20 bg-red-500/5"
                                  : "border-zinc-700 bg-[#111827]"
                              }`}
                            >
                              {/* Número de boleto */}
                              <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-semibold text-zinc-300">
                                  Boleto #{idx + 1}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                    boleto.usado
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-green-500/20 text-green-400"
                                  }`}
                                >
                                  {boleto.usado ? "Usado" : "Válido"}
                                </span>
                              </div>

                              {/* QR */}
                              <div
                                className={`relative ${boleto.usado ? "opacity-40" : ""}`}
                              >
                                <img
                                  src={boleto.qr_image}
                                  alt={`QR Boleto ${idx + 1}`}
                                  className="w-32 h-32 bg-white rounded-lg p-1.5"
                                />
                                {boleto.usado && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-red-500 font-black text-2xl rotate-[-20deg] border-4 border-red-500 px-2 rounded">
                                      USADO
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Código QR */}
                              <p className="text-xs text-zinc-500 font-mono text-center break-all leading-relaxed">
                                {boleto.qr_code}
                              </p>

                              {/* Botón PDF */}
                              {!boleto.usado && (
                                <button
                                  onClick={() => descargarPDF(boleto)}
                                  className="w-full bg-green-600 hover:bg-green-700 rounded-lg py-2 text-sm font-bold transition cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <Download size={14} />
                                  PDF
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}