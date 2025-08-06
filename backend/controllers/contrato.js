const express = require("express");
const { query } = require("../config/conexion"); // Conexión a la base de datos
const router = express.Router();

// Obtener todos los registros de personas con solicitud aprobada
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
        c.numero_contrato,
        c.monto_aprob_euro,
        c.cincoflat,
        c.diezinteres,
        c.monto_devolver,
        c.fecha_desde,
        c.fecha_hasta,
        c.estatus AS estatus_contrato
      FROM persona p
      LEFT JOIN solicitud s ON p.cedula = s.cedula_emprendedor
      LEFT JOIN Contrato c ON s.id_contrato = c.id_contrato
      WHERE EXISTS (
        SELECT 1 FROM solicitud s2 WHERE s2.cedula_emprendedor = p.cedula AND s2.estatus = 'Aprobada'
      );
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error("Error al obtener solicitud en estatus de Aprobada:", err);
    res.status(500).json({ message: "Error al obtener solicitud en estatus de Aprobada" });
  }
});

module.exports = router;