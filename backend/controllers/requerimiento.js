const express = require("express");
const { query } = require("../config/conexion"); // Conexión a la base de datos

const router = express.Router();

// Crear un nuevo requerimiento
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const { cedula_emprendedor, opt_requerimiento } = data;

    const resultado = await query(
      `INSERT INTO requerimiento_emprendedor (
        cedula_emprendedor,
        opt_requerimiento
      ) VALUES ($1, $2) RETURNING *`,
      [cedula_emprendedor, opt_requerimiento]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error en createRequerimientoEmprendedor:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultados = await query(
      `SELECT 
         re.*,
         s.motivo,
         s.estatus
       FROM 
         requerimiento_emprendedor re
       LEFT JOIN 
         solicitud s ON re.cedula_emprendedor = s.cedula_emprendedor
       WHERE 
         re.cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );
    res.status(200).json(resultados.rows);
  } catch (error) {
    console.error("Error en la consulta combinada:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener requerimientos por cedula_emprendedor
router.get("/:cedula", async (req, res) => {
  const { cedula } = req.params;
  try {
    const resultados = await query(
      `SELECT re.*, s.motivo, s.estatus, p.nombre_completo, e.nombre_emprendimiento
       FROM requerimiento_emprendedor re
       LEFT JOIN solicitud s ON re.cedula_emprendedor = s.cedula_emprendedor
       LEFT JOIN persona p ON p.cedula = re.cedula_emprendedor
       LEFT JOIN emprendimientos e ON e.cedula_emprendedor = re.cedula_emprendedor
       WHERE re.cedula_emprendedor = $1`, [cedula]
    );
    res.status(200).json(resultados.rows);
  } catch (error) {
    console.error("Error en la consulta para obtener requerimientos por cedula:", error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un requerimiento_emprendedor por cédula del emprendedor
router.put("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const { opt_requerimiento } = req.body;

    const resultado = await query(
      `UPDATE requerimiento_emprendedor
       SET opt_requerimiento = $1
       WHERE cedula_emprendedor = $2
       RETURNING *`,
      [opt_requerimiento, cedula_emprendedor]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ message: "Requerimiento no encontrado" });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error en updateRequerimientoEmprendedor:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
