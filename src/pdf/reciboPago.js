import { jsPDF } from "jspdf";

// Función principal para generar recibo de pago
export const generarReciboPago = (pago, user, contrato) => {
  const doc = new jsPDF();
  
  // Configuración de márgenes y posiciones
  const margin = 20;
  let yPosition = margin;
  
  // ====================
  // ENCABEZADO
  // ====================
  doc.setFillColor(79, 70, 229); // Color indigo
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text("IFEMI & UPTYAB", 105, 15, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("RECIBO DE PAGO OFICIAL", 105, 25, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("Sistema de Gestión de Créditos", 105, 32, { align: "center" });
  
  yPosition = 50;

  // ====================
  // INFORMACIÓN DEL RECIBO
  // ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN DEL RECIBO", margin, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Número de recibo único
  const numeroRecibo = `REC-${pago.id_cuota}-${Date.now().toString().slice(-6)}`;
  doc.text(`Número de Recibo: ${numeroRecibo}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Hora de Emisión: ${new Date().toLocaleTimeString()}`, margin, yPosition);
  
  yPosition += 10;

  // ====================
  // INFORMACIÓN DEL PAGO
  // ====================
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN DEL PAGO", margin, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Semana Pagada: ${pago.semana}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Número de Contrato: ${pago.numero_contrato || contrato?.numero_contrato || 'N/A'}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Fecha de Pago: ${pago.fecha_pagada || 'No especificada'}`, margin, yPosition);
  yPosition += 6;
  
  // Estado con color
  const estadoX = margin + 80;
  doc.text(`Estado:`, margin, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // Verde para confirmado
  doc.text("CONFIRMADO", estadoX, yPosition);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  yPosition += 10;

  // ====================
  // INFORMACIÓN DEL EMPRENDEDOR
  // ====================
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN DEL EMPRENDEDOR", margin, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Nombre: ${user?.nombre_completo || 'No disponible'}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Cédula: ${user?.cedula || 'No disponible'}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Rol: ${user?.rol || 'Emprendedor'}`, margin, yPosition);
  
  yPosition += 15;

  // ====================
  // DETALLES DEL MONTO
  // ====================
  doc.setFillColor(240, 249, 255);
  doc.rect(margin, yPosition, 170, 25, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105); // Verde
  doc.text("MONTO PAGADO", 105, yPosition + 10, { align: "center" });
  
  doc.setFontSize(20);
  doc.text(`$${parseFloat(pago.monto).toFixed(2)}`, 105, yPosition + 20, { align: "center" });
  
  yPosition += 35;

  // ====================
  // DESGLOSE ADICIONAL (si hay mora)
  // ====================
  if (pago.incluye_mora || pago.interes_mora) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("DESGLOSE DEL PAGO", margin, yPosition);
    
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Monto base: $${parseFloat(pago.monto_base || pago.monto).toFixed(2)}`, margin, yPosition);
    yPosition += 5;
    
    if (pago.interes_mora) {
      doc.text(`Interés por mora: +$${parseFloat(pago.interes_mora).toFixed(2)}`, margin, yPosition);
      yPosition += 5;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total pagado: $${parseFloat(pago.monto).toFixed(2)}`, margin, yPosition);
    yPosition += 10;
  }

  // ====================
  // OBSERVACIONES
  // ====================
  doc.setFont('helvetica', 'bold');
  doc.text("OBSERVACIONES", margin, yPosition);
  
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const observaciones = [
    "Este recibo es generado automáticamente por el sistema IFEMI-UPTYAB",
    "Para consultas o aclaratorias, contacte a la administración",
    "Conserve este documento como comprobante de pago"
  ];
  
  observaciones.forEach(obs => {
    doc.text(`• ${obs}`, margin, yPosition);
    yPosition += 5;
  });

  // ====================
  // PIE DE PÁGINA
  // ====================
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento válido solo con sello y firma autorizada", 105, pageHeight - 20, { align: "center" });
  doc.text(`© ${new Date().getFullYear()} IFEMI & UPTYAB - Todos los derechos reservados`, 105, pageHeight - 15, { align: "center" });
  doc.text("Sistema de Gestión de Créditos - Versión 1.0", 105, pageHeight - 10, { align: "center" });

  return doc;
};

// Modelo alternativo de recibo de pago - Estilo profesional
export const generarReciboPagoProfesional = (pago, user, contrato) => {
  const doc = new jsPDF();
  
  // Configuración
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = margin;
  
  // ====================
  // ENCABEZADO PROFESIONAL
  // ====================
  doc.setFillColor(59, 130, 246); // Azul profesional
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo simulado
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, 10, 30, 30, 'F');
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text("IFEMI", margin + 15, 25, { align: "center" });
  doc.text("UPTYAB", margin + 15, 30, { align: "center" });
  
  // Información de la empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("IFEMI & UPTYAB", pageWidth - margin, 20, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Sistema de Gestión de Créditos", pageWidth - margin, 27, { align: "right" });
  doc.text("Tel: (123) 456-7890", pageWidth - margin, 34, { align: "right" });
  doc.text("email: info@ifemi-uptyab.com", pageWidth - margin, 41, { align: "right" });
  
  yPosition = 60;

  // ====================
  // TÍTULO DEL RECIBO
  // ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text("COMPROBANTE DE PAGO", pageWidth / 2, yPosition, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento válido como comprobante oficial", pageWidth / 2, yPosition + 8, { align: "center" });
  
  yPosition += 25;

  // ====================
  // INFORMACIÓN PRINCIPAL EN 2 COLUMNAS
  // ====================
  const col1 = margin;
  const col2 = pageWidth / 2 + 10;
  
  // Columna 1 - Información del recibo
  doc.setFillColor(248, 250, 252);
  doc.rect(col1, yPosition, pageWidth / 2 - 20, 45, 'F');
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("DATOS DEL RECIBO", col1 + 10, yPosition + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  const numeroRecibo = `REC-${pago.id_cuota}-${Date.now().toString().slice(-6)}`;
  doc.text(`Número: ${numeroRecibo}`, col1 + 10, yPosition + 16);
  doc.text(`Fecha Emisión: ${new Date().toLocaleDateString()}`, col1 + 10, yPosition + 22);
  doc.text(`Hora: ${new Date().toLocaleTimeString()}`, col1 + 10, yPosition + 28);
  doc.text(`Referencia: ${pago.numero_contrato || contrato?.numero_contrato || 'N/A'}`, col1 + 10, yPosition + 34);
  
  // Columna 2 - Información del pago
  doc.setFillColor(248, 250, 252);
  doc.rect(col2, yPosition, pageWidth / 2 - 25, 45, 'F');
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("DATOS DEL PAGO", col2 + 10, yPosition + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  doc.text(`Semana: ${pago.semana}`, col2 + 10, yPosition + 16);
  doc.text(`Fecha Pago: ${pago.fecha_pagada || 'No especificada'}`, col2 + 10, yPosition + 22);
  doc.text(`Método: ${pago.metodo_pago || 'Transferencia'}`, col2 + 10, yPosition + 28);
  
  // Estado con badge
  doc.setFillColor(16, 185, 129);
  doc.rect(col2 + 50, yPosition + 32, 25, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text("CONFIRMADO", col2 + 62.5, yPosition + 37, { align: "center" });
  
  yPosition += 55;

  // ====================
  // INFORMACIÓN DEL CLIENTE
  // ====================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN DEL CLIENTE", margin, yPosition);
  
  yPosition += 8;
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 12;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  doc.text(`Nombre completo:`, margin, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${user?.nombre_completo || 'No disponible'}`, margin + 35, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Cédula:`, margin, yPosition + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${user?.cedula || 'No disponible'}`, margin + 35, yPosition + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Rol:`, margin, yPosition + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${user?.rol || 'Emprendedor'}`, margin + 35, yPosition + 12);
  
  yPosition += 25;

  // ====================
  // MONTO PRINCIPAL
  // ====================
  doc.setFillColor(240, 253, 244);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 25, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 25);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("TOTAL PAGADO", pageWidth / 2, yPosition + 10, { align: "center" });
  
  doc.setFontSize(24);
  doc.setTextColor(16, 185, 129);
  doc.text(`$${parseFloat(pago.monto).toFixed(2)}`, pageWidth / 2, yPosition + 22, { align: "center" });
  
  yPosition += 35;

  // ====================
  // DESGLOSE DETALLADO
  // ====================
  if (pago.incluye_mora || pago.interes_mora || pago.monto_base) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text("DESGLOSE DEL PAGO", margin, yPosition);
    
    yPosition += 8;
    
    // Tabla de desglose
    const tableTop = yPosition;
    const tableWidth = pageWidth - margin * 2;
    
    // Encabezado de tabla
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, tableTop, tableWidth, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Concepto", margin + 5, tableTop + 5);
    doc.text("Monto", pageWidth - margin - 20, tableTop + 5, { align: "right" });
    
    yPosition += 8;
    
    // Filas de la tabla
    const rows = [];
    
    // Monto base
    rows.push({
      concepto: "Pago de cuota semanal",
      monto: parseFloat(pago.monto_base || pago.monto).toFixed(2)
    });
    
    // Interés por mora
    if (pago.interes_mora) {
      rows.push({
        concepto: "Interés por mora",
        monto: `+${parseFloat(pago.interes_mora).toFixed(2)}`
      });
    }
    
    // Total
    rows.push({
      concepto: "TOTAL PAGADO",
      monto: parseFloat(pago.monto).toFixed(2)
    });
    
    // Dibujar filas
    rows.forEach((row, index) => {
      const isTotal = row.concepto === "TOTAL PAGADO";
      const rowY = yPosition + (index * 6);
      
      if (isTotal) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, rowY - 3, tableWidth, 8, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, rowY - 3, pageWidth - margin, rowY - 3);
        doc.line(margin, rowY + 5, pageWidth - margin, rowY + 5);
      }
      
      doc.setFontSize(9);
      if (isTotal) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
      }
      
      doc.text(row.concepto, margin + 5, rowY + 2);
      doc.text(`$${row.monto}`, pageWidth - margin - 5, rowY + 2, { align: "right" });
    });
    
    yPosition += (rows.length * 6) + 10;
  }

  // ====================
  // FIRMAS Y SELLOS
  // ====================
  const firmaY = yPosition + 10;
  const firmaWidth = (pageWidth - margin * 2) / 2;
  
  // Firma del cliente
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, firmaY + 15, margin + firmaWidth - 10, firmaY + 15);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Firma del Cliente", margin + (firmaWidth - 10) / 2, firmaY + 20, { align: "center" });
  
  // Sello de la empresa
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.rect(pageWidth - margin - firmaWidth + 10, firmaY, firmaWidth - 10, 30);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("SELLO Y FIRMA AUTORIZADA", pageWidth - margin - firmaWidth / 2 + 5, firmaY + 10, { align: "center" });
  doc.text("IFEMI & UPTYAB", pageWidth - margin - firmaWidth / 2 + 5, firmaY + 15, { align: "center" });
  doc.text("Sistema de Gestión de Créditos", pageWidth - margin - firmaWidth / 2 + 5, firmaY + 20, { align: "center" });

  // ====================
  // PIE DE PÁGINA
  // ====================
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Este documento es generado automáticamente y es válido como comprobante de pago oficial.", pageWidth / 2, pageHeight - 20, { align: "center" });
  doc.text("Para consultas o aclaratorias contacte a: administracion@ifemi-uptyab.com | Tel: (123) 456-7890", pageWidth / 2, pageHeight - 15, { align: "center" });
  doc.text(`© ${new Date().getFullYear()} IFEMI & UPTYAB - Todos los derechos reservados | Versión 2.0`, pageWidth / 2, pageHeight - 10, { align: "center" });

  return doc;
};

// Función para generar resumen de usuario
export const generarResumenUsuario = (user, stats) => {
  const doc = new jsPDF();

  // Configuración
  const margin = 20;
  let yPosition = margin;
  const pageWidth = doc.internal.pageSize.width;

  // ENCABEZADO
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("RESUMEN DEL USUARIO", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("IFEMI & UPTYAB - Sistema de Gestión de Créditos", pageWidth / 2, 25, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, 32, { align: "center" });

  yPosition = 50;

  // INFORMACIÓN DEL USUARIO
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN PERSONAL", margin, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text(`Nombre: ${user?.nombre_completo || 'No disponible'}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Cédula: ${user?.cedula || 'No disponible'}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Rol: ${user?.rol || 'Emprendedor'}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Estatus: ${user?.estatus || 'Activo'}`, margin, yPosition);
  
  yPosition += 15;

  // ESTADÍSTICAS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("ESTADÍSTICAS FINANCIERAS", margin, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  
  // Total Pagado
  doc.setFillColor(240, 249, 255);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
  doc.text("Total Pagado:", margin + 5, yPosition + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${stats.totalPagado || 0}`, pageWidth - margin - 5, yPosition + 5, { align: "right" });
  yPosition += 12;
  
  // Total Pendiente
  doc.setFillColor(255, 247, 237);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text("Total Pendiente:", margin + 5, yPosition + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${stats.totalPendiente || 0}`, pageWidth - margin - 5, yPosition + 5, { align: "right" });
  yPosition += 12;
  
  // Progreso
  doc.setFillColor(237, 247, 255);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text("Progreso:", margin + 5, yPosition + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${stats.progreso || 0}%`, pageWidth - margin - 5, yPosition + 5, { align: "right" });
  yPosition += 12;
  
  // Cuotas Pendientes
  doc.setFillColor(247, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text("Cuotas Pendientes:", margin + 5, yPosition + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${stats.proximasCuotas || 0}`, pageWidth - margin - 5, yPosition + 5, { align: "right" });
  yPosition += 12;
  
  // Mora Acumulada
  if (stats.totalMora > 0) {
    doc.setFillColor(254, 242, 242);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.text("Mora Acumulada:", margin + 5, yPosition + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${stats.totalMora || 0}`, pageWidth - margin - 5, yPosition + 5, { align: "right" });
    yPosition += 12;
  }

  yPosition += 10;

  // PIE DE PÁGINA
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento informativo generado automáticamente", pageWidth / 2, pageHeight - 20, { align: "center" });
  doc.text(`© ${new Date().getFullYear()} IFEMI & UPTYAB - Todos los derechos reservados`, pageWidth / 2, pageHeight - 15, { align: "center" });
  doc.text("Sistema de Gestión de Créditos", pageWidth / 2, pageHeight - 10, { align: "center" });

  return doc;
};

// Función para visualizar el recibo en nueva pestaña
export const visualizarReciboPago = (pago, user, contrato) => {
  const doc = generarReciboPago(pago, user, contrato);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Abrir en nueva pestaña
  const newWindow = window.open(pdfUrl, '_blank');
  
  // Liberar el objeto URL después de que la ventana se cierre
  if (newWindow) {
    newWindow.onbeforeunload = () => {
      URL.revokeObjectURL(pdfUrl);
    };
  }
  
  return newWindow;
};

// Función para descargar el recibo
export const descargarReciboPago = (pago, user, contrato, filename = 'recibo_pago') => {
  const doc = generarReciboPago(pago, user, contrato);
  doc.save(`${filename}_${pago.semana}_${pago.numero_contrato}.pdf`);
};

// Función para visualizar el recibo profesional
export const visualizarReciboProfesional = (pago, user, contrato) => {
  const doc = generarReciboPagoProfesional(pago, user, contrato);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const newWindow = window.open(pdfUrl, '_blank');
  
  if (newWindow) {
    newWindow.onbeforeunload = () => {
      URL.revokeObjectURL(pdfUrl);
    };
  }
  
  return newWindow;
};

// Función para descargar el recibo profesional
export const descargarReciboProfesional = (pago, user, contrato, filename = 'recibo_pago') => {
  const doc = generarReciboPagoProfesional(pago, user, contrato);
  doc.save(`${filename}_${pago.semana}_${pago.numero_contrato}_v2.pdf`);
};