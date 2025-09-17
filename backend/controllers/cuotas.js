const express = require("express");
const { query } = require("../config/conexion"); // Conexión a la base de datos

const router = express.Router();

// Obtener cuota por cédula del emprendedor
router.get("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      "SELECT * FROM contrato WHERE cedula_emprendedor = $1 AND estatus = 'aceptado'",
      [cedula_emprendedor]
    );
    res.json(resultado.rows); // devuelve array de cuotas
  } catch (error) {
    console.error("Error al obtener contrato por ID:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;