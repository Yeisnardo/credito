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

module.exports = router;
