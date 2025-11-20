import { jsPDF } from "jspdf";
import logoIfemi from "../assets/image/logo_header_ca.png";

// Función principal para generar PDF del contrato IFEMI
export const generarContratoPdf = (contrato, user) => {
  const doc = new jsPDF();

  // Configuración
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = margin;

  // ====================
  // ENCABEZADO IFEMI
  // ====================
  doc.setFillColor(255, 255, 255); // Fondo blanco
  doc.rect(0, 0, pageWidth, 45, "F");

  // ====================
  // IMAGEN A LA DERECHA
  // ====================
  const imgWidth = 30; // Ancho reducido para mejor ajuste
  const imgHeight = 30; // Alto reducido
  const imgX = pageWidth - margin - imgWidth; // Posición X (derecha con margen)
  const imgY = 8; // Posición Y (misma altura que el texto)

  // Agregar imagen a la derecha
  try {
    doc.addImage(logoIfemi, "PNG", imgX, imgY, imgWidth, imgHeight);
  } catch (error) {
    console.warn("No se pudo cargar la imagen:", error);
  }

  // ====================
  // TEXTO INSTITUCIONAL (AJUSTADO A LA IZQUIERDA)
  // ====================
  doc.setTextColor(0, 0, 0); // Texto negro
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  // Texto centrado (ajustado para compensar la imagen derecha)
  doc.text("Republica Bolivariana de Venezuela", pageWidth / 2, 15, { align: "center", });
  doc.text("Gobierno Bolivariano del Municipio Independencia", pageWidth / 2, 20, { align: "center", });
  doc.text("Estado Yaracuy", pageWidth / 2, 25, { align: "center" });
  doc.text("Instituto para el Fortalezimiento al Emprendedor", pageWidth / 2, 30, { align: "center", });
  doc.text("(IFEMI)", pageWidth / 2, 35, { align: "center" });

  yPosition = 55;

  // ====================
  // INFORMACIÓN DEL CONTRATO IFEMI
  // ====================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CONTRATO DE CRÉDITO IFEMI/CRED/122-24", pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += 15;

  // ====================
  // PARTES CONTRATANTES
  // ====================
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("PARTES CONTRATANTES", margin, yPosition);

  yPosition += 10;

  // ACREEDOR (IFEMI)
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 30, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 30);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 56, 147);
  doc.text("EL ACREEDOR:", margin + 5, yPosition + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("MUNICIPIO INDEPENDENCIA (IFEMI)", margin + 5, yPosition + 15);
  doc.text(
    "Registro Información Fiscal Nro. G-200165529",
    margin + 5,
    yPosition + 21
  );
  doc.text(
    "Instituto para el Fortalecimiento al Emprendedor",
    margin + 5,
    yPosition + 27
  );

  yPosition += 40;

  // DEUDOR (Cliente)
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 40, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 40);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 56, 147);
  doc.text("EL DEUDOR:", margin + 5, yPosition + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    user?.nombre_completo || "JUAN FELIZ RODRIGUEZ PADRON",
    margin + 5,
    yPosition + 15
  );
  doc.text(
    `Cédula de Identidad: ${user?.cedula_usuario || "V-31234536"}`,
    margin + 5,
    yPosition + 21
  );
  doc.text(
    "Venezolano, mayor de edad, estado civil soltero",
    margin + 5,
    yPosition + 27
  );
  doc.text(
    "Registro de Información Fiscal: V120608696",
    margin + 5,
    yPosition + 33
  );
  doc.text("CLL. LIBERTADOR SECTOR GUARABAITO,", margin + 5, yPosition + 39);
  doc.text(
    "MANZANA Q, CASA Q NRO 22, MUNICIPIO INDEPENDENCIA, ESTADO YARACUY",
    margin + 5,
    yPosition + 45
  );

  yPosition += 55;

  // ====================
  // CLÁUSULAS DEL CONTRATO
  // ====================
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("CLÁUSULAS DEL CONTRATO", margin, yPosition);

  yPosition += 10;

  const clausulas = [
    {
      titulo: "PRIMERA:",
      contenido:
        "EL DEUDOR formalizó solicitud de crédito por ante la oficina del IFEMI. Posteriormente se realizó inspección con el propósito de verificar las condiciones socio económicas y nivel de avance del emprendimiento, arrojando como resultado: Apto para el otorgamiento del crédrito, cumpliendo así con los requisitos exigidos por la Institución para la aprobación y otorgamiento del mismo.",
    },
    {
      titulo: "SEGUNDA:",
      contenido: "El emprendimiento consiste en TRANSPORTISTA.",
    },
    {
      titulo: "TERCERA:",
      contenido: `Se aprueba y se otorga en calidad de préstamo a EL DEUDOR la cantidad de QUINIENTOS DÓLARES AMERICANOS (USD. 500.00), los cuales serán transferidos en su equivalente en bolívares a la tasa del BCV del día en la cuenta administrada previamente al Instituto para tales efectos, al momento de suscribir el presente contrato.`,
    },
    {
      titulo: "CUARTA:",
      contenido: `La cantidad total del préstamo deberá ser pagado en DIECIOCHO (18) cuotas semanales equivalentes en bolívares según la tasa de cambio del BCV vigente al momento de cada pago, que se efectuarán los días Lunes, según lo establecido en la tabla de amortización anexa al presente contrato.`,
    },
    {
      titulo: "QUINTA:",
      contenido:
        "EL DEUDOR declara mediante el presente contrato que tiene la capacidad legal para suscribirlo y cumplir con las obligaciones aquí establecidas.",
    },
    {
      titulo: "SEXTA:",
      contenido:
        "El incumplimiento en el pago de cualquiera de las cuotas establecidas dará derecho al ACREEDOR a exigir el pago total del saldo pendiente más los intereses moratorios correspondientes.",
    },
    {
      titulo: "SÉPTIMA:",
      contenido:
        "Cualquier controversia derivada de este contrato será resuelta por los tribunales competentes del Municipio Independencia, Estado Yaracuy.",
    },
  ];

  clausulas.forEach((clausula, index) => {
    // Verificar si necesita nueva página
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin;
    }

    // Título de la cláusula
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 56, 147);
    doc.text(clausula.titulo, margin, yPosition);

    // Contenido de la cláusula
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    const lines = doc.splitTextToSize(
      clausula.contenido,
      pageWidth - margin * 2 - 10
    );
    doc.text(lines, margin + 20, yPosition);

    yPosition += lines.length * 4 + 8;
  });

  // ====================
  // TÉRMINOS FINANCIEROS
  // ====================
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = margin;
  }

  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("RESUMEN DE TÉRMINOS FINANCIEROS", margin, yPosition);

  yPosition += 10;

  // Tabla de términos financieros
  const terminosFinancieros = [
    { concepto: "Monto Aprobado (USD)", valor: "USD 500.00" },
    {
      concepto: "Monto Equivalente en Bs",
      valor: formatearMontoBs(contrato?.monto_bs || "Según tasa BCV"),
    },
    { concepto: "Número de Cuotas", valor: "18 cuotas semanales" },
    { concepto: "Día de Pago", valor: "Lunes" },
    { concepto: "Tipo de Crédito", valor: "Préstamo para emprendimiento" },
    { concepto: "Actividad", valor: "Transportista" },
    {
      concepto: "Número de Contrato",
      valor: contrato?.numero_contrato || "IFEMI/CRED/122-24",
    },
  ];

  // Encabezado de la tabla
  doc.setFillColor(0, 56, 147);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CONCEPTO", margin + 5, yPosition + 5);
  doc.text("VALOR", pageWidth - margin - 5, yPosition + 5, { align: "right" });

  yPosition += 8;

  // Filas de la tabla
  terminosFinancieros.forEach((termino, index) => {
    const rowY = yPosition + index * 6;
    const bgColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];

    doc.setFillColor(...bgColor);
    doc.rect(margin, rowY, pageWidth - margin * 2, 6, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(termino.concepto, margin + 5, rowY + 4);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(termino.valor, pageWidth - margin - 5, rowY + 4, {
      align: "right",
    });
  });

  yPosition += terminosFinancieros.length * 6 + 15;

  // ====================
  // FIRMAS
  // ====================
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("FIRMAS DE CONFORMIDAD", pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += 15;

  const firmaWidth = (pageWidth - margin * 2 - 20) / 2;

  // Firma del DEUDOR
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition + 20, margin + firmaWidth, yPosition + 20);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Firma del DEUDOR", margin + firmaWidth / 2, yPosition + 30, {
    align: "center",
  });
  doc.text(
    user?.nombre_completo || "JUAN FELIZ RODRIGUEZ PADRON",
    margin + firmaWidth / 2,
    yPosition + 35,
    { align: "center" }
  );
  doc.text(
    `Cédula de Identidad: ${user?.cedula_usuario || "V-31234536"}`,
    margin + firmaWidth / 2,
    yPosition + 40,
    { align: "center" }
  );
  doc.text(
    `Fecha: ${formatearFecha(new Date())}`,
    margin + firmaWidth / 2,
    yPosition + 45,
    { align: "center" }
  );

  // Firma del ACREEDOR
  const firmaAcreedorX = margin + firmaWidth + 20;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(
    firmaAcreedorX,
    yPosition + 20,
    firmaAcreedorX + firmaWidth,
    yPosition + 20
  );

  doc.text(
    "Firma del ACREEDOR",
    firmaAcreedorX + firmaWidth / 2,
    yPosition + 30,
    { align: "center" }
  );
  doc.text(
    "MUNICIPIO INDEPENDENCIA (IFEMI)",
    firmaAcreedorX + firmaWidth / 2,
    yPosition + 35,
    { align: "center" }
  );
  doc.text(
    "RIF: G-200165529",
    firmaAcreedorX + firmaWidth / 2,
    yPosition + 40,
    { align: "center" }
  );
  doc.text(
    `Fecha: ${formatearFecha(new Date())}`,
    firmaAcreedorX + firmaWidth / 2,
    yPosition + 45,
    { align: "center" }
  );

  // Sello oficial
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(1);
  doc.rect(pageWidth - margin - 40, yPosition + 55, 40, 20);

  doc.setFontSize(6);
  doc.setTextColor(220, 38, 38);
  doc.text("SELLO OFICIAL", pageWidth - margin - 20, yPosition + 62, {
    align: "center",
  });
  doc.text("IFEMI", pageWidth - margin - 20, yPosition + 67, {
    align: "center",
  });
  doc.text("CONTRATO VÁLIDO", pageWidth - margin - 20, yPosition + 72, {
    align: "center",
  });

  // ====================
  // PIE DE PÁGINA
  // ====================
  const footerY = pageHeight - 15;
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Este documento es un contrato legalmente vinculante entre EL ACREEDOR (IFEMI) y EL DEUDOR.",
    pageWidth / 2,
    footerY - 10,
    { align: "center" }
  );
  doc.text(
    `Documento generado el ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} | Página 1 de ${doc.getNumberOfPages()}`,
    pageWidth / 2,
    footerY - 5,
    { align: "center" }
  );
  doc.text(
    "© IFEMI - Municipio Independencia, Estado Yaracuy - Todos los derechos reservados",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc;
};

// Función para visualizar el contrato
export const visualizarContratoPdf = (contrato, user) => {
  const doc = generarContratoPdf(contrato, user);
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const newWindow = window.open(pdfUrl, "_blank");

  if (newWindow) {
    newWindow.onbeforeunload = () => {
      URL.revokeObjectURL(pdfUrl);
    };
  }

  return newWindow;
};

// Función para descargar el contrato
export const descargarContratoPdf = (
  contrato,
  user,
  filename = "contrato_ifemi"
) => {
  const doc = generarContratoPdf(contrato, user);
  const numeroContrato =
    contrato?.numero_contrato?.replace(/\s+/g, "_") || "IFEMI_CRED_122-24";
  doc.save(`${filename}_${numeroContrato}.pdf`);
};

// ====================
// FUNCIONES AUXILIARES
// ====================

const formatearMonto = (monto) => {
  if (!monto) return "USD 0.00";
  return `USD ${Number(monto).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatearMontoBs = (monto) => {
  if (!monto) return "Bs. Según tasa BCV";
  return `Bs. ${Number(monto).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
