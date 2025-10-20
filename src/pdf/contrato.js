import { jsPDF } from "jspdf";

// Función principal para generar PDF del contrato
export const generarContratoPdf = (contrato, user) => {
  const doc = new jsPDF();
  
  // Configuración
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = margin;

  // ====================
  // ENCABEZADO PROFESIONAL
  // ====================
  doc.setFillColor(59, 130, 246); // Azul corporativo
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo simulado
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, 10, 35, 30, 'F');
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("IFEMI", margin + 17.5, 22, { align: "center" });
  doc.text("UPTYAB", margin + 17.5, 28, { align: "center" });
  
  // Información de la empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("CONTRATO DE FINANCIAMIENTO", pageWidth - margin, 20, { align: "right" });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Sistema de Gestión de Créditos", pageWidth - margin, 27, { align: "right" });
  doc.text("RIF: J-123456789-0", pageWidth - margin, 34, { align: "right" });
  doc.text("Tel: (123) 456-7890 | info@ifemi-uptyab.com", pageWidth - margin, 41, { align: "right" });

  yPosition = 60;

  // ====================
  // INFORMACIÓN DEL CONTRATO
  // ====================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMACIÓN DEL CONTRATO", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;

  // Tabla de información del contrato
  const infoContrato = [
    { label: "Número de Contrato", value: contrato?.numero_contrato || "N/A" },
    { label: "Estado", value: contrato?.estatus || "N/A" },
    { label: "Fecha de Emisión", value: formatearFecha(contrato?.fecha_creacion) },
    { label: "Fecha de Aceptación", value: formatearFecha(contrato?.fecha_aceptacion) || "Pendiente" }
  ];

  infoContrato.forEach((item, index) => {
    const rowY = yPosition + (index * 8);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.label}:`, margin, rowY);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(item.value, margin + 45, rowY);
  });

  yPosition += 40;

  // ====================
  // INFORMACIÓN DE LAS PARTES
  // ====================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("PARTES CONTRATANTES", margin, yPosition);
  
  yPosition += 10;

  // PRESTAMISTA (IFEMI & UPTYAB)
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 35, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 35);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text("PRESTAMISTA:", margin + 5, yPosition + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text("IFEMI & UPTYAB C.A.", margin + 5, yPosition + 15);
  doc.text("RIF: J-123456789-0", margin + 5, yPosition + 21);
  doc.text("Av. Principal, Edificio Corporativo, Piso 5", margin + 5, yPosition + 27);
  doc.text("Tel: (123) 456-7890 | Email: legal@ifemi-uptyab.com", margin + 5, yPosition + 33);

  yPosition += 45;

  // PRESTATARIO (Cliente)
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 35, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 35);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text("PRESTATARIO:", margin + 5, yPosition + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(user?.nombre_completo || "Nombre no disponible", margin + 5, yPosition + 15);
  doc.text(`Cédula: ${user?.cedula || "N/A"}`, margin + 5, yPosition + 21);
  doc.text("Emprendedor registrado en el sistema IFEMI-UPTYAB", margin + 5, yPosition + 27);
  doc.text("Email: contacto@emprendedor.com", margin + 5, yPosition + 33);

  yPosition += 45;

  // ====================
  // TÉRMINOS FINANCIEROS
  // ====================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("TÉRMINOS FINANCIEROS", margin, yPosition);
  
  yPosition += 10;

  // Tabla de términos financieros
  const terminosFinancieros = [
    { concepto: "Monto Aprobado (EUR)", valor: formatearMonto(contrato?.monto_aprob_euro) },
    { concepto: "Monto Aprobado (Bs)", valor: formatearMontoBs(contrato?.monto_bs) },
    { concepto: "Monto a Devolver (EUR)", valor: formatearMonto(contrato?.monto_devolver) },
    { concepto: "Cuota Semanal (EUR)", valor: formatearMonto(contrato?.monto_semanal) },
    { concepto: "Período de Pago", valor: "Semanal" },
    { concepto: "Fecha de Inicio", valor: formatearFecha(contrato?.fecha_desde) },
    { concepto: "Fecha de Vencimiento", valor: formatearFecha(contrato?.fecha_hasta) },
    { concepto: "Duración Total", valor: calcularDuracion(contrato?.fecha_desde, contrato?.fecha_hasta) }
  ];

  // Encabezado de la tabla
  doc.setFillColor(59, 130, 246);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("CONCEPTO", margin + 5, yPosition + 5);
  doc.text("VALOR", pageWidth - margin - 5, yPosition + 5, { align: "right" });

  yPosition += 8;

  // Filas de la tabla
  terminosFinancieros.forEach((termino, index) => {
    const rowY = yPosition + (index * 6);
    const bgColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
    
    doc.setFillColor(...bgColor);
    doc.rect(margin, rowY, pageWidth - margin * 2, 6, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(termino.concepto, margin + 5, rowY + 4);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(termino.valor, pageWidth - margin - 5, rowY + 4, { align: "right" });
  });

  yPosition += (terminosFinancieros.length * 6) + 15;

  // ====================
  // CLÁUSULAS Y CONDICIONES
  // ====================
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("CLÁUSULAS Y CONDICIONES", margin, yPosition);
  
  yPosition += 10;

  const clausulas = [
    "OBLIGACIONES DEL PRESTATARIO: El prestatario se obliga a devolver el monto del crédito más los intereses establecidos en los plazos y condiciones acordadas.",
    "PAGOS: Los pagos se realizarán semanalmente según el calendario establecido. El incumplimiento generará intereses moratorios.",
    "DESTINO DE LOS FONDOS: Los fondos deberán ser utilizados exclusivamente para los fines establecidos en la solicitud de crédito.",
    "MORA: En caso de mora en el pago, se aplicará un interés moratorio según lo establecido en la ley.",
    "TERMINACIÓN: El incumplimiento reiterado de las obligaciones dará derecho al prestamista a exigir la terminación anticipada del contrato.",
    "JURISDICCIÓN: Cualquier controversia será resuelta por los tribunales competentes de la jurisdicción correspondiente.",
    "ACEPTACIÓN: La firma del presente contrato implica la aceptación total de todas sus cláusulas y condiciones.",
    "CONFIDENCIALIDAD: Las partes se obligan a mantener la confidencialidad de los términos del presente contrato."
  ];

  clausulas.forEach((clausula, index) => {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(`Cláusula ${index + 1}:`, margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    
    const lines = doc.splitTextToSize(clausula, pageWidth - margin * 2 - 10);
    doc.text(lines, margin + 25, yPosition);
    
    yPosition += (lines.length * 4) + 6;
  });

  // ====================
  // FIRMAS
  // ====================
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = margin;
  }

  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("FIRMAS DE ACEPTACIÓN", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;

  const firmaWidth = (pageWidth - margin * 2 - 20) / 2;

  // Firma del Prestatario
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition + 20, margin + firmaWidth, yPosition + 20);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Firma del Prestatario", margin + firmaWidth / 2, yPosition + 30, { align: "center" });
  doc.text(user?.nombre_completo || "Nombre del Cliente", margin + firmaWidth / 2, yPosition + 35, { align: "center" });
  doc.text(`Cédula: ${user?.cedula || "N/A"}`, margin + firmaWidth / 2, yPosition + 40, { align: "center" });
  doc.text(`Fecha: ${formatearFecha(new Date())}`, margin + firmaWidth / 2, yPosition + 45, { align: "center" });

  // Firma del Prestamista
  const firmaPrestamistaX = margin + firmaWidth + 20;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(firmaPrestamistaX, yPosition + 20, firmaPrestamistaX + firmaWidth, yPosition + 20);
  
  doc.text("Firma del Prestamista", firmaPrestamistaX + firmaWidth / 2, yPosition + 30, { align: "center" });
  doc.text("IFEMI & UPTYAB C.A.", firmaPrestamistaX + firmaWidth / 2, yPosition + 35, { align: "center" });
  doc.text("RIF: J-123456789-0", firmaPrestamistaX + firmaWidth / 2, yPosition + 40, { align: "center" });
  doc.text(`Fecha: ${formatearFecha(new Date())}`, firmaPrestamistaX + firmaWidth / 2, yPosition + 45, { align: "center" });

  // Sello de la empresa
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(1);
  doc.rect(pageWidth - margin - 40, yPosition + 55, 40, 20);
  
  doc.setFontSize(6);
  doc.setTextColor(220, 38, 38);
  doc.text("SELLO OFICIAL", pageWidth - margin - 20, yPosition + 62, { align: "center" });
  doc.text("IFEMI & UPTYAB", pageWidth - margin - 20, yPosition + 67, { align: "center" });
  doc.text("CONTRATO VÁLIDO", pageWidth - margin - 20, yPosition + 72, { align: "center" });

  // ====================
  // PIE DE PÁGINA
  // ====================
  const footerY = pageHeight - 15;
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Este documento es un contrato legalmente vinculante. Conserve una copia para sus registros.", pageWidth / 2, footerY - 10, { align: "center" });
  doc.text(`Documento generado el ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} | Página 1 de ${doc.getNumberOfPages()}`, pageWidth / 2, footerY - 5, { align: "center" });
  doc.text("© IFEMI & UPTYAB C.A. - Todos los derechos reservados", pageWidth / 2, footerY, { align: "center" });

  return doc;
};

// Función para visualizar el contrato
export const visualizarContratoPdf = (contrato, user) => {
  const doc = generarContratoPdf(contrato, user);
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

// Función para descargar el contrato
export const descargarContratoPdf = (contrato, user, filename = 'contrato') => {
  const doc = generarContratoPdf(contrato, user);
  const numeroContrato = contrato?.numero_contrato?.replace(/\s+/g, '_') || 'contrato';
  doc.save(`${filename}_${numeroContrato}.pdf`);
};

// ====================
// FUNCIONES AUXILIARES
// ====================

const formatearMonto = (monto) => {
  if (!monto) return "€ 0.00";
  return `€ ${Number(monto).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatearMontoBs = (monto) => {
  if (!monto) return "Bs. 0.00";
  return `Bs. ${Number(monto).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calcularDuracion = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return "N/A";
  
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const semanas = Math.ceil(diffDays / 7);
  
  return `${semanas} semanas (${diffDays} días)`;
};