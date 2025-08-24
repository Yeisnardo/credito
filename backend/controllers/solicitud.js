const express = require("express");
const { query } = require("../config/conexion"); // Conexión a la base de datos

const router = express.Router();

// Endpoint para obtener todas las solicitudes por cédula del emprendedor
router.get("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    const resultado = await query(
      `SELECT * FROM solicitud WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (resultado.rows.length > 0) {
      res.json(resultado.rows);
    } else {
      res
        .status(404)
        .json({ message: "No se encontraron solicitudes para esa cédula" });
    }
  } catch (error) {
    console.error("Error al obtener las solicitudes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener nombres de personas con solicitudes aprobadas
router.get("/estatus/aprobada", async (req, res) => {
  try {
    const resultado = await query(
      `SELECT p.nombre_completo, p.cedula, nc.numero_contrato
       FROM solicitud s
       JOIN persona p ON s.cedula_emprendedor = p.cedula
       LEFT JOIN n_contrato nc ON p.cedula = nc.cedula_emprendedor
       WHERE s.estatus = 'Aprobada'`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener nombres de personas con solicitudes aprobadas:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para crear una nueva solicitud
router.post("/", async (req, res) => {
  try {
    const { cedula_emprendedor, motivo, estatus } = req.body;

    const resultado = await query(
      `INSERT INTO solicitud (
        cedula_emprendedor,
        motivo,
        estatus
      ) VALUES ($1, $2, $3) RETURNING *`,
      [cedula_emprendedor, motivo, estatus]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para actualizar una solicitud por cédula del emprendedor
router.put("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const { estatus } = req.body; // Solo necesitas estatus

    // Actualiza solo el campo estatus
    const resultado = await query(
      `UPDATE solicitud SET estatus = $1 WHERE cedula_emprendedor = $2 RETURNING *;`,
      [estatus, cedula_emprendedor]
    );

    if (resultado.rows.length > 0) {
      res.json(resultado.rows[0]);
    } else {
      res
        .status(404)
        .json({ message: "Solicitud no encontrada para esa cédula" });
    }
  } catch (error) {
    console.error("Error al actualizar la solicitud:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
