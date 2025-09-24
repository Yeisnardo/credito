const express = require("express");
const path = require("path");
const multer = require("multer");
const { query } = require("../config/conexion"); // tu conexión a la base

const router = express.Router();

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

// Ruta para registrar cuotas según configuración_contratos
router.post("/", upload.single("comprobante"), async (req, res) => {
  try {
    // **IMPORTANTE**: Define estos valores antes de usar
    const idConfiguracion = req.body.idConfiguracion; // debe enviarse en el body
    const id_cuota_c = req.body.id_cuota_c; // también enviado en el body
    const cedula_emprendedor = req.body.cedula_emprendedor; // enviado en el body
    const monto_ves = req.body.monto_ves || 0; // ajusta según sea necesario

    // Obtener la ruta del comprobante si se subió
    const comprobantePath = req.file ? `/uploads/${req.file.filename}` : null;

    // 1. Obtener los datos de configuración_contratos
    const configuracionResult = await query(
      "SELECT numero_cuotas, cuotasGracia FROM configuracion_contratos WHERE id = $1",
      [idConfiguracion]
    );

    const filaConfig = configuracionResult.rows[0];

    if (!filaConfig) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }

    // Convertir valores a enteros
    const numeroCuotas = parseInt(filaConfig.numero_cuotas, 10);
    const cuotasGracia = parseInt(filaConfig.cuotasGracia, 10);

    // 2. Crear cuotas en ciclo
    const inserciones = [];
    for (let i = 0; i < numeroCuotas; i++) {
      const descripcionCuota = `${i + 1}`; // descripción como "Cuota 1", "Cuota 2", etc.

      // Valores predeterminados o ajustados
      const estado_cuota = "Pendiente";
      const dias_mora_cuota = 0;
      const interes_acumulado = 0;
      const confirmacionIFEMI = "Pendiente";

      const resultado = await query(
        `INSERT INTO cuota (
          id_cuota,
          id_cuota_c,
          cedula_emprendedor,
          semana,
          monto_ves,
          estado_cuota,
          dias_mora_cuota,
          interes_acumulado,
          confirmacionIFEMI,
          comprobante
        ) VALUES (
          DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING *`,
        [
          id_cuota_c,
          cedula_emprendedor,
          descripcionCuota,
          monto_ves,
          estado_cuota,
          dias_mora_cuota,
          interes_acumulado,
          confirmacionIFEMI,
          comprobantePath,
        ]
      );
      inserciones.push(resultado.rows[0]);
    }

    res.status(201).json({
      message: `Se insertaron ${numeroCuotas} cuotas.`,
      cuotas: inserciones,
    });
  } catch (error) {
    console.error("Error al registrar cuotas:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;