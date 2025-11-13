import { jsPDF } from "jspdf";

// Función principal para generar guía de métodos de pago
export const generarMetodosPago = (user, contrato) => {
  const doc = new jsPDF();
  
  // Configuración
  const margin = 20;
  let yPosition = margin;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // ====================
  // ENCABEZADO
  // ====================
  doc.setFillColor(59, 130, 246); // Azul profesional
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo/emblema simulado
  doc.setFillColor(255, 255, 255);
  doc.rect(25, 12, 25, 25, 'F');
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("IFEMI", 37.5, 22, { align: "center" });
  doc.text("UPTYAB", 37.5, 27, { align: "center" });
  
  // Títulos principales
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("GUÍA DE MÉTODOS DE PAGO", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("IFEMI & UPTYAB - Sistema de Gestión de Créditos", pageWidth / 2, 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("Opciones disponibles para el pago de cuotas", pageWidth / 2, 35, { align: "center" });

  yPosition = 60;

  // ====================
  // INFORMACIÓN PERSONAL
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
  
  if (user) {
    doc.text(`Nombre: ${user.nombre_completo || 'No disponible'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Cédula: ${user.cedula || 'No disponible'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Contrato: ${contrato?.numero_contrato || 'No disponible'}`, margin, yPosition);
  } else {
    doc.text("Información del cliente no disponible", margin, yPosition);
  }

  yPosition += 15;

  // ====================
  // INTRODUCCIÓN
  // ====================
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 25, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 25);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("📋 INSTRUCCIONES IMPORTANTES", pageWidth / 2, yPosition + 8, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text("Seleccione el método de pago que mejor se adapte a sus necesidades.", pageWidth / 2, yPosition + 15, { align: "center" });
  doc.text("Recuerde incluir su número de contrato en todas las transacciones.", pageWidth / 2, yPosition + 20, { align: "center" });

  yPosition += 35;

  // ====================
  // MÉTODOS DE PAGO - TRANSFERENCIA BANCARIA
  // ====================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("🏦 TRANSFERENCIA BANCARIA", margin, yPosition);
  
  yPosition += 8;
  
  // Tarjeta de información bancaria
  doc.setFillColor(239, 246, 255);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 50, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 50);
  
  const bankInfoY = yPosition + 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("Banco:", margin + 10, bankInfoY);
  doc.setFont('helvetica', 'normal');
  doc.text("Banco de Venezuela", margin + 25, bankInfoY);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Tipo de Cuenta:", margin + 10, bankInfoY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text("Cuenta Corriente", margin + 45, bankInfoY + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Número de Cuenta:", margin + 10, bankInfoY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text("0102-1234-5678-9012-3456", margin + 50, bankInfoY + 16);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Titular:", margin + 10, bankInfoY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text("IFEMI UPTYAB C.A.", margin + 25, bankInfoY + 24);
  
  doc.setFont('helvetica', 'bold');
  doc.text("RIF:", margin + 10, bankInfoY + 32);
  doc.setFont('helvetica', 'normal');
  doc.text("J-412345678-9", margin + 25, bankInfoY + 32);
  
  yPosition += 55;
  
  // Instrucciones transferencia
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const instruccionesTransferencia = [
    "• Realice la transferencia desde su banca en línea o ventanilla",
    "• Incluya su número de cédula y contrato en el concepto",
    "• Envíe el comprobante al correo: pagos@ifemi-uptyab.com",
    "• El proceso de verificación toma de 1 a 2 horas hábiles"
  ];
  
  instruccionesTransferencia.forEach((instruccion, index) => {
    doc.text(instruccion, margin + 5, yPosition + (index * 4));
  });
  
  yPosition += 25;

  // ====================
  // MÉTODOS DE PAGO - PAGO MÓVIL
  // ====================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("📱 PAGO MÓVIL", margin, yPosition);
  
  yPosition += 8;
  
  // Información Pago Móvil
  doc.setFillColor(240, 253, 244);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 35, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 35);
  
  const pagoMovilY = yPosition + 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("Teléfono:", margin + 10, pagoMovilY);
  doc.setFont('helvetica', 'normal');
  doc.text("0412-123-4567", margin + 30, pagoMovilY);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Cédula:", margin + 10, pagoMovilY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text("V-12345678", margin + 30, pagoMovilY + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Banco:", margin + 10, pagoMovilY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text("Banesco", margin + 30, pagoMovilY + 16);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Referencia:", margin + 10, pagoMovilY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(contrato?.numero_contrato || "Su número de contrato", margin + 35, pagoMovilY + 24);
  
  yPosition += 40;
  
  // Instrucciones Pago Móvil
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const instruccionesPagoMovil = [
    "• Registre nuestro número en su aplicación de pago móvil",
    "• Use su número de contrato como referencia de pago",
    "• Guarde el comprobante de la transacción",
    "• Envíe captura de pantalla al WhatsApp: +58 412-123-4567"
  ];
  
  instruccionesPagoMovil.forEach((instruccion, index) => {
    doc.text(instruccion, margin + 5, yPosition + (index * 4));
  });
  
  yPosition += 25;

  // ====================
  // MÉTODOS DE PAGO - EFECTIVO
  // ====================
  // Verificar si hay espacio suficiente en la página actual
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = margin;
  }
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("💵 PAGO EN EFECTIVO", margin, yPosition);
  
  yPosition += 8;
  
  // Puntos de pago
  doc.setFillColor(255, 247, 237);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 60, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 60);
  
  const efectivoY = yPosition + 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("Puntos de Pago Autorizados:", margin + 10, efectivoY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  
  const puntosPago = [
    "📍 Sede Principal IFEMI - Av. Principal, Edificio IFEMI, Piso 3",
    "📍 Oficina UPTYAB - Complejo Universitario, Módulo 2",
    "📍 Agentes Autorizados:",
    "   • Farmacia La Esperanza - Centro Comercial Los Andes",
    "   • Papelería Educativa - Calle 5 con Av. 8",
    "   • Librería Universitaria - Plaza Bolívar"
  ];
  
  puntosPago.forEach((punto, index) => {
    doc.text(punto, margin + 5, efectivoY + 10 + (index * 4));
  });
  
  yPosition += 65;
  
  // Instrucciones Efectivo
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const instruccionesEfectivo = [
    "• Solicite formulario de depósito en caja",
    "• Proporcione su número de cédula y contrato",
    "• Guarde el recibo oficial con sello y firma",
    "• Horario de atención: Lunes a Viernes 8:00 AM - 4:00 PM"
  ];
  
  instruccionesEfectivo.forEach((instruccion, index) => {
    doc.text(instruccion, margin + 5, yPosition + (index * 4));
  });
  
  yPosition += 25;

  // ====================
  // OTRAS OPCIONES
  // ====================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("🔗 OTRAS OPCIONES DISPONIBLES", margin, yPosition);
  
  yPosition += 8;
  
  // Otras opciones en tarjetas
  const otrasOpciones = [
    {
      metodo: "💳 Pago con Tarjeta de Débito/Crédito",
      descripcion: "Disponible en nuestras oficinas principales con datáfono"
    },
    {
      metodo: "🌐 Pago en Línea",
      descripcion: "Próximamente en nuestro portal web: www.ifemi-uptyab.com"
    },
    {
      metodo: "📞 Pago Telefónico",
      descripcion: "Llame al 0800-IFEMI-00 para asistencia en pagos"
    }
  ];
  
  otrasOpciones.forEach((opcion, index) => {
    const opcionY = yPosition + (index * 15);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, opcionY, pageWidth - margin * 2, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(margin, opcionY, pageWidth - margin * 2, 12);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(opcion.metodo, margin + 5, opcionY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(opcion.descripcion, margin + 5, opcionY + 9);
  });
  
  yPosition += 50;

  // ====================
  // RECOMENDACIONES Y CONSEJOS
  // ====================
  doc.setFillColor(255, 251, 235);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 45, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 45);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("💡 RECOMENDACIONES IMPORTANTES", margin + 10, yPosition + 8);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  const recomendaciones = [
    "✅ Siempre verifique que el comprobante incluya su número de contrato",
    "✅ Guarde todos los comprobantes hasta la confirmación del pago",
    "✅ Realice los pagos con al menos 24 horas de anticipación al vencimiento",
    "✅ Contacte a su asesor en caso de cualquier inconveniente con el pago",
    "✅ Reporte inmediatamente pagos no reflejados después de 48 horas",
    "✅ Utilice los canales oficiales para evitar fraudes o estafas"
  ];
  
  recomendaciones.forEach((recomendacion, index) => {
    doc.text(recomendacion, margin + 5, yPosition + 15 + (index * 5));
  });
  
  yPosition += 50;

  // ====================
  // CONTACTOS DE SOPORTE
  // ====================
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("📞 CONTACTOS Y SOPORTE", margin, yPosition);
  
  yPosition += 8;
  
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 30, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 30);
  
  const contactoY = yPosition + 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("Correo Electrónico:", margin + 10, contactoY);
  doc.setFont('helvetica', 'normal');
  doc.text("soporte@ifemi-uptyab.com", margin + 45, contactoY);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Teléfono Principal:", margin + 10, contactoY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text("(0243) 123-4567", margin + 45, contactoY + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.text("WhatsApp:", margin + 10, contactoY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text("+58 412-123-4567", margin + 45, contactoY + 14);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Horario de Atención:", margin + 10, contactoY + 21);
  doc.setFont('helvetica', 'normal');
  doc.text("Lunes a Viernes 7:00 AM - 5:00 PM", margin + 45, contactoY + 21);

  // ====================
  // PIE DE PÁGINA
  // ====================
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  
  const footerLines = [
    "Este documento es informativo y puede estar sujeto a cambios. Consulte siempre los canales oficiales.",
    "IFEMI & UPTYAB se reserva el derecho de modificar los métodos de pago disponibles.",
    `Documento generado el ${new Date().toLocaleDateString()} - Válido por 30 días`,
    `© ${new Date().getFullYear()} IFEMI & UPTYAB - Sistema de Gestión de Créditos - Versión 1.0`
  ];
  
  footerLines.forEach((linea, index) => {
    doc.text(linea, pageWidth / 2, pageHeight - 20 + (index * 4), { align: "center" });
  });

  return doc;
};

// Función para generar versión resumida de métodos de pago
export const generarMetodosPagoResumido = (user, contrato) => {
  const doc = new jsPDF();
  
  const margin = 20;
  let yPosition = margin;
  const pageWidth = doc.internal.pageSize.width;

  // Encabezado simple
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("MÉTODOS DE PAGO - RESUMEN", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(9);
  doc.text("IFEMI & UPTYAB", pageWidth / 2, 22, { align: "center" });

  yPosition = 45;

  // Métodos rápidos
  const metodosRapidos = [
    {
      icono: "🏦",
      metodo: "Transferencia Bancaria",
      detalles: "BDV - 0102-1234-5678-9012-3456"
    },
    {
      icono: "📱",
      metodo: "Pago Móvil",
      detalles: "0412-123-4567 - Ref: Su contrato"
    },
    {
      icono: "💵",
      metodo: "Efectivo",
      detalles: "Oficinas IFEMI/UPTYAB y agentes autorizados"
    }
  ];
  
  metodosRapidos.forEach((metodo, index) => {
    const metodoY = yPosition + (index * 25);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, metodoY, pageWidth - margin * 2, 20, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(margin, metodoY, pageWidth - margin * 2, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(`${metodo.icono} ${metodo.metodo}`, margin + 5, metodoY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(metodo.detalles, margin + 5, metodoY + 14);
  });
  
  yPosition += 80;

  // Contacto rápido
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("📞 Contacto Rápido:", margin, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("soporte@ifemi-uptyab.com | (0243) 123-4567", margin, yPosition + 5);
  
  doc.text(`Contrato: ${contrato?.numero_contrato || 'N/A'}`, margin, yPosition + 12);
  doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPosition + 12, { align: "right" });

  return doc;
};

// Función para visualizar métodos de pago
export const visualizarMetodosPago = (user, contrato) => {
  const doc = generarMetodosPago(user, contrato);
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

// Función para descargar métodos de pago
export const descargarMetodosPago = (user, contrato, filename = 'metodos_pago') => {
  const doc = generarMetodosPago(user, contrato);
  doc.save(`${filename}_${user?.cedula || 'cliente'}.pdf`);
};

// Función para visualizar versión resumida
export const visualizarMetodosPagoResumido = (user, contrato) => {
  const doc = generarMetodosPagoResumido(user, contrato);
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

// Función para obtener métodos de pago disponibles
export const obtenerMetodosDisponibles = () => {
  return [
    {
      id: 1,
      nombre: "Transferencia Bancaria",
      icono: "🏦",
      descripcion: "Transferencia a cuenta BDV",
      disponible: true,
      instrucciones: "Use el número de cuenta proporcionado"
    },
    {
      id: 2,
      nombre: "Pago Móvil",
      icono: "📱",
      descripcion: "Pago a través de aplicación móvil",
      disponible: true,
      instrucciones: "Registre nuestro número en su app"
    },
    {
      id: 3,
      nombre: "Efectivo",
      icono: "💵",
      descripcion: "Pago en oficinas autorizadas",
      disponible: true,
      instrucciones: "Acérquese a nuestras sedes"
    },
    {
      id: 4,
      nombre: "Tarjeta de Débito/Crédito",
      icono: "💳",
      descripcion: "Pago con datáfono",
      disponible: true,
      instrucciones: "Solo en oficinas principales"
    },
    {
      id: 5,
      nombre: "Pago en Línea",
      icono: "🌐",
      descripcion: "Portal web de pagos",
      disponible: false,
      instrucciones: "Próximamente"
    }
  ];
};