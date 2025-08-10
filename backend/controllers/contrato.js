const express = require("express");
const { query } = require("../config/conexion"); // Conexión a la base de datos
const router = express.Router();

// =======================
// Obtener todos los registros de personas con solicitud aprobada
// =======================
router.get("/", async (req, res) => {
  try {
    const resultado = await query(`
      SELECT 
        p.cedula, 
        p.nombre_completo, 
        p.edad, 
        p.telefono, 
        p.email, 
        p.estado, 
        p.municipio, 
        p.direccion_actual, 
        p.tipo_persona,
        c.monto_aprob_euro,
        c.cincoflat,
        c.diezinteres,
        c.monto_devolver,
        c.fecha_desde,
        c.fecha_hasta,
        c.estatus AS estatus_contrato,
        nc.numero_contrato
      FROM persona p
      LEFT JOIN solicitud s ON p.cedula = s.cedula_emprendedor
      LEFT JOIN contrato c ON s.id_contrato = c.id_contrato
      LEFT JOIN n_contrato nc ON c.id_contrato = nc.id_n_ontrato
      WHERE s.estatus = 'Aprobada';
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error("Error al obtener solicitud en estatus de Aprobada:", err);
    res.status(500).json({ message: "Error al obtener solicitud en estatus de Aprobada" });
  }
});

// =======================
// Ruta para asignar número de contrato usando la cédula del emprendedor
// =======================
router.post("/asignarNumeroPorCedula", async (req, res) => {
  const { cedula_emprendedor, numero_contrato } = req.body;

  try {
    const resultado = await query(
      `INSERT INTO n_contrato (cedula_emprendedor, numero_contrato) VALUES ($1, $2) RETURNING *`,
      [cedula_emprendedor, numero_contrato]
    );
    res.json({ message: "Contrato asignado correctamente", contrato: resultado.rows[0] });
  } catch (err) {
    console.error("Error al asignar contrato por cédula:", err);
    res.status(500).json({ message: "Error al asignar contrato" });
  }
});

// =======================
// Ruta para registrar un contrato usando la cédula del emprendedor
// =======================
router.post("/registrarContratoPorCedula", async (req, res) => {
  const {
    monto_aprob_euro,
    cincoflat,
    diezinteres,
    monto_devolver,
    fecha_desde,
    fecha_hasta,
    cedula_emprendedor
  } = req.body;

  try {
    const resultado = await query(
      `INSERT INTO Contrato (
        monto_aprob_euro,
        cincoflat,
        diezinteres,
        monto_devolver,
        fecha_desde,
        fecha_hasta,
        estatus,
        cedula_emprendedor
      ) VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente', $7) RETURNING *`,
      [
        monto_aprob_euro,
        cincoflat,
        diezinteres,
        monto_devolver,
        fecha_desde,
        fecha_hasta,
        cedula_emprendedor 
      ]
    );
    res.json({
      message: "Contrato registrado correctamente",
      contrato: resultado.rows[0],
    });
  } catch (err) {
    console.error("Error al registrar contrato:", err);
    res.status(500).json({ message: "Error al registrar contrato" });
  }
});

module.exports = router;