const express = require("express");
const { query } = require("../config/conexion"); // Conexión a la base de datos

const router = express.Router();

// Obtener todas las cuotas
router.get("/", async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM contrato");
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener cuotas:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener cuota por cédula del emprendedor
router.get("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      "SELECT * FROM contrato WHERE cedula_emprendedor = $1",
      [cedula_emprendedor]
    );
    if (resultado.rows.length > 0) {
      res.json(resultado.rows);
    } else {
      res.status(404).json({ message: "No se encontraron cuotas para esa cédula" });
    }
  } catch (error) {
    console.error("Error al obtener cuota por cédula:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;