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

// Obtener todos los requerimientos
router.get('/', async (req, res) => {
  try {
    const resultados = await query(
      `SELECT DISTINCT
         re.id_req,
         re.cedula_emprendedor,
         re.opt_requerimiento,
         re.verificacion,
         s.motivo, 
         s.estatus, 
         p.nombre_completo, 
         e.nombre_emprendimiento, 
         e.tipo_sector, 
         e.tipo_negocio
       FROM requerimiento_emprendedor re
       LEFT JOIN solicitud s ON re.cedula_emprendedor = s.cedula_emprendedor
       LEFT JOIN persona p ON p.cedula = re.cedula_emprendedor
       LEFT JOIN emprendimientos e ON e.cedula_emprendedor = re.cedula_emprendedor
       ORDER BY re.id_req DESC`
    );
    res.status(200).json(resultados.rows);
  } catch (error) {
    console.error("Error en obtener todos los requerimientos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar requerimiento_emprendedor por id_req
router.put("/:id_req", async (req, res) => {
  try {
    const { id_req } = req.params;
    const { 
      requerimientosVerificados, 
      estatus, 
      motivo_rechazo,
      verificacion // Mantener compatibilidad con frontend existente
    } = req.body;

    // Usar el campo correcto: verificacion en lugar de verificacion
    const camposActualizar = [];
    const valores = [];
    let contador = 1;

    if (requerimientosVerificados !== undefined) {
      camposActualizar.push(`verificacion = $${contador}`);
      valores.push(requerimientosVerificados);
      contador++;
    }

    if (estatus !== undefined) {
      camposActualizar.push(`estatus = $${contador}`);
      valores.push(estatus);
      contador++;
    }

    if (motivo_rechazo !== undefined) {
      camposActualizar.push(`motivo_rechazo = $${contador}`);
      valores.push(motivo_rechazo);
      contador++;
    }

    // Para mantener compatibilidad con el frontend existente
    if (verificacion !== undefined) {
      camposActualizar.push(`verificacion = $${contador}`);
      valores.push(verificacion);
      contador++;
    }

    if (camposActualizar.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    valores.push(id_req);

    const queryStr = `
      UPDATE requerimiento_emprendedor
      SET ${camposActualizar.join(", ")}
      WHERE id_req = $${contador}
      RETURNING *
    `;

    const resultado = await query(queryStr, valores);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ message: "Requerimiento no encontrado" });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error en updateRequerimientoEmprendedor:", error);
    res.status(500).json({ error: error.message });
  }
});;

module.exports = router;