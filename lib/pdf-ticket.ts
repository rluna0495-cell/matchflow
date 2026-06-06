import jsPDF from "jspdf";

interface TicketPDF {
  comprador: string;
  partido: string;
  fecha: string;
  estadio: string;
  zona: string;
  qr: string;
  qrImage: string;
}

export function generarTicketPDF(data: TicketPDF) {
  const pdf = new jsPDF();

  // Fondo negro
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, 210, 297, "F");

  // Título
  pdf.setTextColor(255, 0, 0);
  pdf.setFontSize(26);
  pdf.text("MATCHFLOW", 20, 25);

  // Información del evento
  pdf.setTextColor(255, 255, 255);

  pdf.setFontSize(18);
  pdf.text(data.partido, 20, 50);

  pdf.setFontSize(14);
  pdf.text(`Fecha: ${data.fecha}`, 20, 70);

  pdf.text(`Estadio: ${data.estadio}`, 20, 82);

  pdf.text(`Comprador: ${data.comprador}`, 20, 105);

  pdf.text(`Zona: ${data.zona}`, 20, 118);

  // Marco QR
  pdf.setDrawColor(255, 0, 0);
  pdf.rect(15, 135, 180, 80);

  pdf.setFontSize(12);
  pdf.text("QR DE ACCESO", 85, 148);

  // Imagen QR
  pdf.addImage(
    data.qrImage,
    "PNG",
    75,
    155,
    60,
    60
  );

  // Mensaje final
  pdf.setTextColor(0, 255, 0);

  pdf.setFontSize(14);

  pdf.text(
    "Presentar este ticket al ingresar al estadio",
    20,
    240
  );

  pdf.save(
    `${data.comprador}-${data.zona}.pdf`
  );
}