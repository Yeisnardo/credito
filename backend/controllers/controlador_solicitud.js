// controllers/controlador_solicitud.js
const { query } = require('../config/db');

const getSolicitudesComplejas = async (req, res) => {
  try {
    const resultado = await query(`
      SELECT p.cedula, p.nombre_completo, p.email, p.telefono, p.estado, p.municipio, p.direccion_actual,
             e.tipo_sector, e.tipo_negocio, e.nombre_emprendimiento, e.consejo_nombre, e.comuna, e.direccion_emprendimiento
      FROM persona p
      LEFT JOIN emprendimientos e ON p.cedula = e.cedula_emprendedor
    `);
    // Formatear en la estructura que necesita el frontend
    const solicitudes = resultado.rows.map(row => ({
      id: row.cedula, // o puedes hacer un ID autogenerado si quieres
      solicitante: row.nombre_completo,
      contrato: null, // si tienes contrato, ajusta aquí
      estado: row.estado,
      foto: "https://via.placeholder.com/150", // o un campo en la tabla persona con la foto
      detalles: {
        emprendimiento: row.nombre_emprendimiento,
        requerimientos: row.consejo_nombre,
        datosPersonales: {
          nombre: row.nombre_completo,
          email: row.email,
          telefono: row.telefono,
          direccion: row.direccion_actual,
        },
      },
    }));
    res.json(solicitudes);
  } catch (err) {
    console.error('Error en getSolicitudesComplejas:', err);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

module.exports = {
  getSolicitudesComplejas,
};