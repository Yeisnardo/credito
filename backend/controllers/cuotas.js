const express = require("express");
const path = require("path");
const multer = require("multer");
const { query } = require("../config/conexion");

const router = express.Router();

// ========== CONFIGURACIÓN MULTER ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato no válido. Solo JPG, PNG o PDF."));
    }
  },
});

// ========== VARIABLES GLOBALES ==========
let lastId = 0;

// ========== FUNCIONES AUXILIARES ==========
async function initializeLastId() {
  try {
    const res = await query('SELECT MAX(id_cuota) AS max_id FROM cuota');
    lastId = res.rows[0].max_id !== null ? parseInt(res.rows[0].max_id, 10) : 0;
  } catch (err) {
    console.error('Error al obtener el max id_cuota:', err);
    lastId = 0;
  }
}

function calcularFechaVencimiento(fechaInicio, frecuencia, numeroCuota) {
  const fecha = new Date(fechaInicio);
  
  switch (frecuencia) {
    case 'mensual':
      fecha.setMonth(fecha.getMonth() + numeroCuota);
      break;
    case 'quincenal':
      fecha.setDate(fecha.getDate() + (numeroCuota * 15));
      break;
    case 'semanal':
      fecha.setDate(fecha.getDate() + (numeroCuota * 7));
      break;
    default:
      fecha.setMonth(fecha.getMonth() + numeroCuota);
  }
  
  return fecha.toISOString().split('T')[0];
}

// Obtener configuración activa
async function obtenerConfiguracionActiva() {
  try {
    const resultado = await query(
      'SELECT * FROM configuracion_contratos ORDER BY id DESC LIMIT 1'
    );
    
    if (resultado.rows.length === 0) {
      // Configuración por defecto si no hay ninguna
      return {
        frecuencia_pago: 'mensual',
        numero_cuotas: '6',
        cuotasGracia: '0',
        porcentaje_interes: '0',
        porcentaje_mora: '0'
      };
    }
    
    return resultado.rows[0];
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    // Retornar configuración por defecto en caso de error
    return {
      frecuencia_pago: 'mensual',
      numero_cuotas: '6',
      cuotasGracia: '0',
      porcentaje_interes: '0',
      porcentaje_mora: '0'
    };
  }
}

// ========== RUTAS PARA EMPRENDEDOR ==========

// Obtener contrato por cédula del emprendedor
router.get("/contrato/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      `SELECT * FROM contrato WHERE cedula_emprendedor = $1 AND estatus = 'aceptado'`,
      [cedula_emprendedor]
    );
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }
    
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al obtener contrato:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener cuotas pendientes por emprendedor
router.get("/emprendedor/:cedula_emprendedor/pendientes", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      `SELECT c.*, ct.numero_contrato, ct.monto_devolver
       FROM cuota c
       JOIN contrato ct ON c.id_cuota_c = ct.id_contrato
       WHERE c.cedula_emprendedor = $1 AND c.estado_cuota = $2
       ORDER BY c.semana`,
      [cedula_emprendedor, 'Pendiente']
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener cuotas pendientes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener historial de pagos por emprendedor
router.get("/emprendedor/:cedula_emprendedor/historial", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      `SELECT c.*, ct.numero_contrato
       FROM cuota c
       JOIN contrato ct ON c.id_cuota_c = ct.id_contrato
       WHERE c.cedula_emprendedor = $1 AND c.estado_cuota = $2
       ORDER BY c.fecha_pagada DESC`,
      [cedula_emprendedor, 'Pagado']
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener historial de pagos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener cuotas pagadas por cédula
router.get("/pagadas/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      `SELECT * FROM cuota WHERE cedula_emprendedor = $1 AND estado_cuota = 'Pagado'`,
      [cedula_emprendedor]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener cuotas pagadas:", error);
    res.status(500).json({ error: error.message });
  }
});

// Registrar una cuota con comprobante
router.post("/", upload.single("comprobante"), async (req, res) => {
  try {
    const {
      id_cuota_c,
      cedula_emprendedor,
      monto_ves,
      semana,
      monto,
      fecha_pagada,
      confirmacionIFEMI,
      dias_mora_cuota,
      interes_acumulado,
      estado_cuota
    } = req.body;

    const comprobantePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Valores por defecto
    const fechaPagada = fecha_pagada || '';
    const confirmacion = confirmacionIFEMI || "En Espera";
    const diasMora = dias_mora_cuota || 0;
    const interes = interes_acumulado || "0";
    const estado = estado_cuota || "Pendiente";

    // Generar nuevo ID
    lastId += 1;
    const id_cuota = lastId;

    const resultado = await query(
      `INSERT INTO cuota (
        id_cuota, id_cuota_c, cedula_emprendedor, semana, monto, monto_ves,
        fecha_pagada, estado_cuota, dias_mora_cuota, interes_acumulado, confirmacionIFEMI, comprobante
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        id_cuota, id_cuota_c, cedula_emprendedor, semana, monto, monto_ves,
        fechaPagada, estado, diasMora, interes, confirmacion, comprobantePath
      ]
    );

    res.status(201).json({
      message: "Cuota registrada exitosamente",
      cuota: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar cuota:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS PARA ADMINISTRADOR ==========

// Confirmar pago IFEMI
router.put("/:id_cuota/confirmar-pago", async (req, res) => {
  try {
    const { id_cuota } = req.params;

    const resultado = await query(
      `UPDATE cuota 
       SET confirmacionIFEMI = 'Confirmado'
       WHERE id_cuota = $1 
       RETURNING *`,
      [id_cuota]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    res.json({
      message: "Pago confirmado exitosamente",
      cuota: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al confirmar pago:", error);
    res.status(500).json({ error: error.message });
  }
});

// Rechazar pago IFEMI
router.put("/:id_cuota/rechazar-pago", async (req, res) => {
  try {
    const { id_cuota } = req.params;
    const { motivo } = req.body;

    const resultado = await query(
      `UPDATE cuota 
       SET confirmacionIFEMI = 'Rechazado',
           estado_cuota = 'Pendiente',
           fecha_pagada = NULL,
           motivo_rechazo = $2
       WHERE id_cuota = $1 
       RETURNING *`,
      [id_cuota, motivo]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    res.json({
      message: "Pago rechazado exitosamente",
      cuota: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al rechazar pago:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los contratos
router.get("/contratos/todos", async (req, res) => {
  try {
    const resultado = await query(
      `SELECT * FROM contrato WHERE estatus = 'aceptado' ORDER BY id_contrato DESC`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener contratos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener cuotas por contrato específico
router.get("/contrato/:id_contrato/cuotas", async (req, res) => {
  try {
    const { id_contrato } = req.params;
    const resultado = await query(
      `SELECT c.*, ct.numero_contrato, ct.cedula_emprendedor, ct.monto_devolver
       FROM cuota c
       JOIN contrato ct ON c.id_cuota_c = ct.id_contrato
       WHERE c.id_cuota_c = $1
       ORDER BY c.semana`,
      [id_contrato]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener cuotas del contrato:", error);
    res.status(500).json({ error: error.message });
  }
});

// Registrar pago manual (administrador)
router.post("/:id_cuota/pago-manual", async (req, res) => {
  try {
    const { id_cuota } = req.params;
    const { metodo_pago, referencia_pago } = req.body;

    const resultado = await query(
      `UPDATE cuota 
       SET estado_cuota = 'Pagado', 
           fecha_pagada = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
           dias_mora_cuota = 0
       WHERE id_cuota = $1 
       RETURNING *`,
      [id_cuota]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    res.json({
      message: "Pago registrado exitosamente",
      cuota: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al registrar pago manual:", error);
    res.status(500).json({ error: error.message });
  }
});

// Recalcular cuotas pendientes BASADO EN CONFIGURACIÓN
router.post("/recalcular/:id_contrato", async (req, res) => {
  try {
    const { id_contrato } = req.params;
    
    // Obtener configuración activa en lugar de pedir parámetros
    const configuracion = await obtenerConfiguracionActiva();
    const nueva_frecuencia = configuracion.frecuencia_pago;
    const nuevo_total_cuotas = configuracion.numero_cuotas;

    // 1. Obtener información del contrato
    const contratoResult = await query(
      'SELECT * FROM contrato WHERE id_contrato = $1',
      [id_contrato]
    );

    if (contratoResult.rows.length === 0) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }

    const contrato = contratoResult.rows[0];

    // 2. Obtener cuotas pagadas
    const cuotasPagadasResult = await query(
      'SELECT * FROM cuota WHERE id_cuota_c = $1 AND estado_cuota = $2',
      [id_contrato, 'Pagado']
    );

    const cuotasPagadas = cuotasPagadasResult.rows;
    
    // Calcular monto pagado
    const montoPagado = cuotasPagadas.reduce((sum, cuota) => {
      return sum + parseFloat(cuota.monto || 0);
    }, 0);
    
    // Calcular saldo pendiente
    const montoTotal = parseFloat(contrato.monto_devolver || 0);
    const saldoPendiente = montoTotal - montoPagado;

    // 3. Validaciones de negocio
    if (parseInt(nuevo_total_cuotas) <= cuotasPagadas.length) {
      return res.status(400).json({
        error: `El total de cuotas configurado (${nuevo_total_cuotas}) debe ser mayor a ${cuotasPagadas.length} (cuotas ya pagadas)`
      });
    }

    if (saldoPendiente <= 0) {
      return res.status(400).json({
        error: "No hay saldo pendiente para recalcular"
      });
    }

    // 4. Eliminar cuotas pendientes existentes
    await query(
      'DELETE FROM cuota WHERE id_cuota_c = $1 AND estado_cuota = $2',
      [id_contrato, 'Pendiente']
    );

    // 5. Calcular nuevo monto por cuota
    const numeroNuevasCuotas = parseInt(nuevo_total_cuotas) - cuotasPagadas.length;
    const nuevoMontoCuota = saldoPendiente / numeroNuevasCuotas;

    // 6. Generar nuevas cuotas pendientes
    const nuevasCuotas = [];
    const ultimoNumero = cuotasPagadas.length;

    for (let i = 1; i <= numeroNuevasCuotas; i++) {
      const numeroCuota = ultimoNumero + i;
      const fechaVencimiento = calcularFechaVencimiento(
        contrato.fecha_desde || new Date(),
        nueva_frecuencia,
        numeroCuota
      );

      lastId += 1;
      
      const nuevaCuota = await query(
        `INSERT INTO cuota (
          id_cuota, id_cuota_c, cedula_emprendedor, semana, monto, monto_ves,
          fecha_pagada, estado_cuota, dias_mora_cuota, interes_acumulado, confirmacionIFEMI
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          lastId, 
          id_contrato, 
          contrato.cedula_emprendedor,
          `Semana ${numeroCuota}`, 
          nuevoMontoCuota.toFixed(2), 
          nuevoMontoCuota.toFixed(2),
          '', // fecha_pagada ($7)
          'Pendiente', // estado_cuota ($8)
          0, // dias_mora_cuota ($9)
          '0', // interes_acumulado ($10)
          'En Espera' // confirmacionIFEMI ($11)
        ]
      );

      nuevasCuotas.push(nuevaCuota.rows[0]);
    }

    res.json({
      message: "Cuotas recalculadas exitosamente usando configuración del sistema",
      configuracion_usada: {
        frecuencia: nueva_frecuencia,
        total_cuotas: nuevo_total_cuotas,
        cuotas_gracia: configuracion.cuotasGracia
      },
      resumen: {
        cuotas_pagadas_mantenidas: cuotasPagadas.length,
        nuevas_cuotas_pendientes: nuevasCuotas.length,
        total_cuotas: nuevo_total_cuotas,
        nuevo_monto_cuota: parseFloat(nuevoMontoCuota.toFixed(2)),
        saldo_pendiente: saldoPendiente
      },
      nuevas_cuotas: nuevasCuotas
    });

  } catch (error) {
    console.error("Error al recalcular cuotas:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS DE ESTADÍSTICAS ==========

// Obtener estadísticas para dashboard
router.get("/estadisticas/dashboard", async (req, res) => {
  try {
    const [
      totalContratos,
      cuotasPendientes,
      cuotasPagadas,
      totalRecaudado,
      contratosActivos
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM contrato WHERE estatus = $1', ['aceptado']),
      query('SELECT COUNT(*) as count FROM cuota WHERE estado_cuota = $1', ['Pendiente']),
      query('SELECT COUNT(*) as count FROM cuota WHERE estado_cuota = $1', ['Pagado']),
      query('SELECT COALESCE(SUM(CAST(monto AS NUMERIC)), 0) as total FROM cuota WHERE estado_cuota = $1', ['Pagado']),
      query('SELECT COUNT(DISTINCT cedula_emprendedor) as count FROM contrato WHERE estatus = $1', ['aceptado'])
    ]);

    res.json({
      totalContratos: parseInt(totalContratos.rows[0].count),
      cuotasPendientes: parseInt(cuotasPendientes.rows[0].count),
      cuotasPagadas: parseInt(cuotasPagadas.rows[0].count),
      totalRecaudado: parseFloat(totalRecaudado.rows[0].total),
      emprendedoresActivos: parseInt(contratosActivos.rows[0].count)
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS ADICIONALES ==========

// Obtener detalles de una cuota específica
router.get("/cuota/:id_cuota", async (req, res) => {
  try {
    const { id_cuota } = req.params;
    const resultado = await query(
      `SELECT c.*, ct.numero_contrato, ct.cedula_emprendedor, ct.monto_devolver
       FROM cuota c
       JOIN contrato ct ON c.id_cuota_c = ct.id_contrato
       WHERE c.id_cuota = $1`,
      [id_cuota]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al obtener cuota:", error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de una cuota
router.put("/cuota/:id_cuota/estado", async (req, res) => {
  try {
    const { id_cuota } = req.params;
    const { estado_cuota } = req.body;

    const resultado = await query(
      `UPDATE cuota SET estado_cuota = $1 WHERE id_cuota = $2 RETURNING *`,
      [estado_cuota, id_cuota]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    res.json({
      message: "Estado de cuota actualizado",
      cuota: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las cuotas (para reportes)
router.get("/todas", async (req, res) => {
  try {
    const resultado = await query(
      `SELECT c.*, ct.numero_contrato, ct.cedula_emprendedor, ct.monto_devolver
       FROM cuota c
       JOIN contrato ct ON c.id_cuota_c = ct.id_contrato
       ORDER BY c.id_cuota DESC`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener todas las cuotas:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== INICIALIZACIÓN ==========
initializeLastId();

module.exports = router;