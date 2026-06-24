import jsPDF from "jspdf";

interface TicketPDF {
  comprador: string;
  partido: string;
  fecha: string;
  estadio: string;
  zona: string;
  qr: string;
  qrImage: string;
  numeroBoleto?: number;
  totalBoletos?: number;
}

export function generarTicketPDF(data: TicketPDF) {
  const pdf = new jsPDF();

  const NUM = data.numeroBoleto ?? 1;
  const TOTAL = data.totalBoletos ?? 1;

  // ── Fondo negro ──────────────────────────────────────────────────────────
  pdf.setFillColor(9, 9, 11); // zinc-950
  pdf.rect(0, 0, 210, 297, "F");

  // ── Banda superior roja ───────────────────────────────────────────────────
  pdf.setFillColor(220, 38, 38); // red-600
  pdf.rect(0, 0, 210, 14, "F");

  // ── Título MATCHFLOW ──────────────────────────────────────────────────────
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("MATCHFLOW · TICKET DIGITAL", 10, 9.5);

  // Número de boleto (ej. BOLETO 1 DE 3)
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const boletoLabel = `BOLETO ${NUM} DE ${TOTAL}`;
  const labelW = pdf.getTextWidth(boletoLabel);
  pdf.text(boletoLabel, 200 - labelW, 9.5);

  // ── Partido ───────────────────────────────────────────────────────────────
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.partido, 10, 34);

  // ── Línea divisoria ───────────────────────────────────────────────────────
  pdf.setDrawColor(39, 39, 42); // zinc-800
  pdf.setLineWidth(0.5);
  pdf.line(10, 40, 200, 40);

  // ── Info del evento ───────────────────────────────────────────────────────
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(161, 161, 170); // zinc-400

  const campos = [
    { label: "FECHA", valor: data.fecha },
    { label: "ESTADIO", valor: data.estadio },
    { label: "COMPRADOR", valor: data.comprador },
    { label: "ZONA / CATEGORÍA", valor: data.zona },
  ];

  let y = 56;
  for (const campo of campos) {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(161, 161, 170);
    pdf.text(campo.label, 10, y);

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(campo.valor, 10, y + 8);
    y += 22;
  }

  // ── Línea divisoria ───────────────────────────────────────────────────────
  pdf.setDrawColor(39, 39, 42);
  pdf.line(10, y + 2, 200, y + 2);
  y += 12;

  // ── QR ───────────────────────────────────────────────────────────────────
  const qrX = 70;
  const qrY = y;
  const qrSize = 70;

  // Marco blanco alrededor del QR
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 3, 3, "F");

  pdf.addImage(data.qrImage, "PNG", qrX, qrY, qrSize, qrSize);

  // Etiqueta debajo del QR
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(161, 161, 170);
  const qrLabel = "ESCANEAR PARA VALIDAR ACCESO";
  const qrLabelW = pdf.getTextWidth(qrLabel);
  pdf.text(qrLabel, (210 - qrLabelW) / 2, qrY + qrSize + 14);

  // Código QR en texto
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(63, 63, 70); // zinc-700
  const codeW = pdf.getTextWidth(data.qr);
  pdf.text(data.qr, (210 - codeW) / 2, qrY + qrSize + 21);

  // ── Banda inferior roja ───────────────────────────────────────────────────
  pdf.setFillColor(220, 38, 38);
  pdf.rect(0, 283, 210, 14, "F");

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("Presentar este ticket al ingresar al estadio", 10, 291.5);

  const valid = `VÁLIDO`;
  const validW = pdf.getTextWidth(valid);
  pdf.text(valid, 200 - validW, 291.5);

  // ── Guardar ───────────────────────────────────────────────────────────────
  const filename = `${data.comprador.replace(/\s+/g, "_")}-${data.zona}-B${String(NUM).padStart(2, "0")}.pdf`;
  pdf.save(filename);
}