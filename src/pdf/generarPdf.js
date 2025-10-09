// src/pdf/generarPdf.js
import { jsPDF } from "jspdf";

export const generarResumenUsuario = (user, stats) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Resumen del Usuario", 20, 20);

  doc.setFontSize(12);
  doc.text(`Nombre: ${user?.nombre_completo || 'Cargando...'}`, 20, 40);
  doc.text(`Estatus: ${user?.estatus || 'Cargando...'}`, 20, 50);
  doc.text(`Créditos activos: ${stats.creditosActivos}`, 20, 60);
  doc.text(`Próximos pagos: ${stats.proximosPagos}`, 20, 70);
  doc.text(`Mensajes no leídos: ${stats.mensajesNoLeidos}`, 20, 80);

  return doc;
};