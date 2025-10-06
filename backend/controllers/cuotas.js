const express = require("express");
const path = require("path");
const multer = require("multer");
const { query } = require("../config/conexion"); // conexión a la base

const router = express.Router();

// Variable para mantener el último ID utilizado
let lastId = 0;

// Función para inicializar lastId con el valor máximo en la base de datos
async function initializeLastId() {
  try {
    const res = await query('SELECT MAX(id_cuota) AS max_id FROM cuota');
    lastId = res.rows[0].max_id !== null ? parseInt(res.rows[0].max_id, 10) : 0;
  } catch (err) {
    console.error('Error al obtener el max id_cuota:', err);
    lastId = 0;
  }
}

// Configuración de multer para guardar archivos en /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads")); // carpeta destino
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // límite 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato no válido. Solo JPG, PNG o PDF."));
    }
  },
});

// Ruta para obtener contrato y cuotas por cédula del emprendedor
router.get("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      `SELECT c.*, q.*
       FROM contrato c
       LEFT JOIN cuota q ON c.id_contrato = q.id_cuota_c
       WHERE c.cedula_emprendedor = $1 AND c.estatus = 'aceptado'`,
      [cedula_emprendedor]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener contrato y cuotas:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para registrar una cuota sin configuración
router.post("/", upload.single("comprobante"), async (req, res) => {
  try {
    const {
      id_cuota_c,
      cedula_emprendedor,
      monto_ves,
      semana,
      monto,
      fecha_pagada,          // Nuevo: obtener del cuerpo
      confirmacionIFEMI,     // Nuevo: obtener del cuerpo
      dias_mora_cuota,       // Nuevo: obtener del cuerpo
      interes_acumulado,     // Nuevo: obtener del cuerpo
      estado_cuota           // Nuevo: obtener del cuerpo
    } = req.body;

    const comprobantePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Asignar valores predeterminados en caso de que no vengan en req.body
    const fechaPagada = fecha_pagada || null;
    const confirmacion = "En Espera"; // valor por defecto
    const diasMora = dias_mora_cuota !== undefined ? parseInt(dias_mora_cuota, 10) : 0;
    const interes = interes_acumulado; // asumiendo que es VARCHAR
    const estado = estado_cuota || "Pendiente"; // o el valor que prefieras

    // Incrementar el ID manualmente
    lastId += 1;
    const id_cuota = lastId;

    const resultado = await query(
      `INSERT INTO cuota (
        id_cuota,
        id_cuota_c,
        cedula_emprendedor,
        semana,
        monto,
        monto_ves,
        fecha_pagada,
        estado_cuota,
        dias_mora_cuota,
        interes_acumulado,
        confirmacionIFEMI,
        comprobante
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *`,
      [
        id_cuota,
        id_cuota_c,
        cedula_emprendedor,
        semana,
        monto,
        monto_ves,
        fechaPagada,
        estado,
        diasMora,
        interes,
        confirmacion,
        comprobantePath,
      ]
    );

    res.status(201).json({
      message: `Cuota registrada.`,
      cuota: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar cuota:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;