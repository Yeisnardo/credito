import { jsPDF } from "jspdf";

// Función principal para generar documento de finiquito
export const generarFiniquito = (user, contrato, stats) => {
  const doc = new jsPDF();
  
  // Configuración
  const margin = 20;
  let yPosition = margin;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // ====================
  // ENCABEZADO OFICIAL
  // ====================
  doc.setFillColor(16, 185, 129); // Verde para finiquito
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo/emblema simulado
  doc.setFillColor(255, 255, 255);
  doc.circle(30, 25, 12, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("✓", 30, 28, { align: "center" });
  
  // Títulos principales
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("IFEMI & UPTYAB", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("CERTIFICADO DE FINIQUITO", pageWidth / 2, 35, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("Documento Oficial de Liquidación", pageWidth / 2, 42, { align: "center" });

  yPosition = 65;

  // ====================
  // DECLARACIÓN PRINCIPAL
  // ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("DECLARACIÓN DE FINIQUITO", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  
  const declaracion = [
    "Por medio del presente documento se hace constar que el contrato de crédito ha sido",
    "completamente liquidado y saldado, no existiendo adeudo alguno por parte del cliente.",
    "Este certificado acredita la finalización satisfactoria de todas las obligaciones contractuales."
  ];
  
  declaracion.forEach(linea => {
    doc.text(linea, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 6;
  });

  yPosition += 10;

  // ====================
  // INFORMACIÓN DEL CONTRATO
  // ====================
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 60, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 60);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN DEL CONTRATO LIQUIDADO", margin + 10, yPosition + 8);
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  // Datos del contrato en dos columnas
  const col1 = margin + 10;
  const col2 = pageWidth / 2 + 10;
  
  if (contrato) {
    doc.text(`Número de Contrato:`, col1, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(contrato.numero_contrato || 'N/A', col1 + 45, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Monto Original:`, col2, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`$${parseFloat(contrato.monto_devolver || 0).toFixed(2)}`, col2 + 35, yPosition);
    
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Fecha de Inicio:`, col1, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(contrato.fecha_desde || 'N/A', col1 + 40, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Frecuencia de Pago:`, col2, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(contrato.frecuencia_pago_contrato || 'N/A', col2 + 45, yPosition);
    
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Duración Total:`, col1, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${contrato.duracion_contrato || 'N/A'} períodos`, col1 + 35, yPosition);
  } else {
    doc.text("Información del contrato no disponible", col1, yPosition);
  }

  yPosition += 25;

  // ====================
  // RESUMEN FINANCIERO
  // ====================
  doc.setFillColor(240, 253, 244);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 80, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 80);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("RESUMEN FINANCIERO FINAL", pageWidth / 2, yPosition + 12, { align: "center" });
  
  yPosition += 25;
  
  // Tabla de resumen financiero
  const tableTop = yPosition;
  const tableWidth = pageWidth - margin * 2;
  
  // Encabezado de tabla
  doc.setFillColor(16, 185, 129);
  doc.rect(margin, tableTop, tableWidth, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text("CONCEPTO", margin + 10, tableTop + 5);
  doc.text("MONTO", pageWidth - margin - 20, tableTop + 5, { align: "right" });
  
  yPosition += 8;
  
  // Filas de la tabla
  const filas = [
    { concepto: "Monto Total del Crédito", monto: parseFloat(contrato?.monto_devolver || 0).toFixed(2) },
    { concepto: "Total Pagado", monto: parseFloat(stats?.totalPagado || 0).toFixed(2) },
    { concepto: "Saldo Pendiente", monto: "0.00" }, // Siempre 0 en finiquito
    { concepto: "Intereses Pagados", monto: parseFloat(stats?.totalMora || 0).toFixed(2) },
    { concepto: "Cuotas Completadas", monto: `${stats?.proximasCuotas || 0} pagos` }
  ];
  
  // Dibujar filas
  filas.forEach((fila, index) => {
    const rowY = yPosition + (index * 6);
    const isTotal = fila.concepto === "Saldo Pendiente";
    
    if (isTotal) {
      doc.setFillColor(240, 253, 244);
      doc.rect(margin, rowY - 2, tableWidth, 8, 'F');
    }
    
    doc.setFontSize(9);
    if (isTotal) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
    }
    
    doc.text(fila.concepto, margin + 5, rowY + 2);
    
    if (fila.concepto === "Saldo Pendiente") {
      doc.setTextColor(16, 185, 129);
      doc.text(`$${fila.monto}`, pageWidth - margin - 5, rowY + 2, { align: "right" });
    } else if (fila.concepto === "Cuotas Completadas") {
      doc.text(fila.monto, pageWidth - margin - 5, rowY + 2, { align: "right" });
    } else {
      doc.text(`$${fila.monto}`, pageWidth - margin - 5, rowY + 2, { align: "right" });
    }
  });
  
  yPosition += (filas.length * 6) + 15;

  // ====================
  // DECLARACIÓN JURÍDICA
  // ====================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("DECLARACIÓN JURÍDICA", margin, yPosition);
  
  yPosition += 8;
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 12;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  const declaracionJuridica = [
    "El presente documento certifica que todas las obligaciones derivadas del contrato de crédito",
    "han sido cumplidas en su totalidad. El cliente queda liberado de cualquier responsabilidad",
    "financiera relacionada con este contrato. No existe deuda pendiente, intereses moratorios,",
    "ni ningún otro concepto por pagar.",
    "",
    "Este certificado tiene validez legal y puede ser presentado como comprobante de solvencia",
    "y cumplimiento de obligaciones crediticias."
  ];
  
  declaracionJuridica.forEach(linea => {
    if (linea === "") {
      yPosition += 3;
    } else {
      doc.text(linea, margin, yPosition);
      yPosition += 5;
    }
  });

  yPosition += 10;

  // ====================
  // INFORMACIÓN DEL CLIENTE
  // ====================
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 40, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 40);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN DEL CLIENTE", margin + 10, yPosition + 8);
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  if (user) {
    doc.text(`Nombre Completo: ${user.nombre_completo || 'No disponible'}`, margin + 10, yPosition);
    yPosition += 7;
    doc.text(`Cédula de Identidad: ${user.cedula || 'No disponible'}`, margin + 10, yPosition);
    yPosition += 7;
    doc.text(`Rol: ${user.rol || 'Emprendedor'}`, margin + 10, yPosition);
    yPosition += 7;
    doc.text(`Estado: ${user.estatus || 'Activo'}`, margin + 10, yPosition);
  } else {
    doc.text("Información del cliente no disponible", margin + 10, yPosition);
  }

  yPosition += 20;

  // ====================
  // FIRMAS Y SELLOS
  // ====================
  const firmaY = yPosition;
  const firmaWidth = (pageWidth - margin * 2) / 2;
  
  // Firma del cliente
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(margin, firmaY + 15, margin + firmaWidth - 10, firmaY + 15);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Firma del Cliente", margin + (firmaWidth - 10) / 2, firmaY + 22, { align: "center" });
  doc.text(user?.nombre_completo || 'Cliente', margin + (firmaWidth - 10) / 2, firmaY + 26, { align: "center" });
  
  // Sello y firma de IFEMI
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.rect(pageWidth - margin - firmaWidth + 10, firmaY, firmaWidth - 10, 35);
  
  // Sello circular
  doc.setFillColor(240, 253, 244);
  doc.circle(pageWidth - margin - firmaWidth / 2 + 5, firmaY + 12, 8, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.circle(pageWidth - margin - firmaWidth / 2 + 5, firmaY + 12, 8);
  
  doc.setFontSize(6);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text("IFEMI", pageWidth - margin - firmaWidth / 2 + 5, firmaY + 12, { align: "center" });
  doc.text("UPTYAB", pageWidth - margin - firmaWidth / 2 + 5, firmaY + 15, { align: "center" });
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("SELLO OFICIAL", pageWidth - margin - firmaWidth / 2 + 5, firmaY + 25, { align: "center" });
  doc.text("FIRMA AUTORIZADA", pageWidth - margin - firmaWidth / 2 + 5, firmaY + 29, { align: "center" });

  // ====================
  // PIE DE PÁGINA
  // ====================
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  
  const footerLines = [
    "Este documento certifica la liquidación total del contrato y la liberación de obligaciones del cliente.",
    "Válido como comprobante de solvencia y cumplimiento crediticio.",
    `Certificado generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
    `© ${new Date().getFullYear()} IFEMI & UPTYAB - Sistema de Gestión de Créditos - Versión 1.0`
  ];
  
  footerLines.forEach((linea, index) => {
    doc.text(linea, pageWidth / 2, pageHeight - 25 + (index * 4), { align: "center" });
  });

  // ====================
  // MARCA DE AGUA (opcional)
  // ====================
  doc.setFontSize(60);
  doc.setTextColor(240, 240, 240);
  doc.setFont('helvetica', 'bold');
  doc.text("LIQUIDADO", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });

  return doc;
};

// Función para generar versión simplificada del finiquito
export const generarFiniquitoSimplificado = (user, contrato, stats) => {
  const doc = new jsPDF();
  
  const margin = 20;
  let yPosition = margin;
  const pageWidth = doc.internal.pageSize.width;

  // Encabezado simple
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("CERTIFICADO DE FINIQUITO", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("IFEMI & UPTYAB", pageWidth / 2, 22, { align: "center" });

  yPosition = 45;

  // Contenido principal
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("¡CONTRATO LIQUIDADO EXITOSAMENTE!", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  
  doc.text(`El cliente ${user?.nombre_completo || ''} con cédula ${user?.cedula || ''}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 7;
  doc.text("ha completado satisfactoriamente todas las obligaciones de su contrato de crédito.", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;
  
  // Resumen rápido
  doc.setFillColor(240, 253, 244);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 30, 'F');
  
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("SALDO: $0.00", pageWidth / 2, yPosition + 12, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("Todas las cuotas han sido pagadas", pageWidth / 2, yPosition + 20, { align: "center" });
  
  yPosition += 40;
  
  // Fecha y número
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(`Número de certificado: FIN-${Date.now().toString().slice(-8)}`, margin, yPosition);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPosition, { align: "right" });

  return doc;
};

// Función para visualizar el finiquito
export const visualizarFiniquito = (user, contrato, stats) => {
  const doc = generarFiniquito(user, contrato, stats);
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

// Función para descargar el finiquito
export const descargarFiniquito = (user, contrato, stats, filename = 'certificado_finiquito') => {
  const doc = generarFiniquito(user, contrato, stats);
  const numeroContrato = contrato?.numero_contrato || 'sin-contrato';
  doc.save(`${filename}_${numeroContrato}_${user?.cedula || 'cliente'}.pdf`);
};

// Función para visualizar versión simplificada
export const visualizarFiniquitoSimplificado = (user, contrato, stats) => {
  const doc = generarFiniquitoSimplificado(user, contrato, stats);
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

// Función para verificar elegibilidad para finiquito
export const esElegibleParaFiniquito = (stats) => {
  return stats && stats.totalPendiente === 0 && stats.totalPagado > 0;
};

// Función para obtener mensaje de estado de finiquito
export const obtenerMensajeFiniquito = (stats) => {
  if (esElegibleParaFiniquito(stats)) {
    return {
      titulo: "✅ Elegible para Finiquito",
      mensaje: "Felicidades, has completado todos tus pagos. Puedes generar tu certificado de finiquito.",
      color: "green"
    };
  } else {
    return {
      titulo: "❌ No Elegible para Finiquito",
      mensaje: `Aún tienes $${stats?.totalPendiente || 0} pendientes. Completa todos los pagos para generar el finiquito.`,
      color: "red"
    };
  }
};