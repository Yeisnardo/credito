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

// Obtener todos los requerimientos (sin filtro)
router.get("/", async (req, res) => {
  try {
    const resultados = await query(
      `SELECT * FROM requerimiento_emprendedor, solicitud, persona, emprendimientos`
    );
    res.status(200).json(resultados.rows);
  } catch (error) {
    console.error("Error en la consulta para obtener todos los requerimientos:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
