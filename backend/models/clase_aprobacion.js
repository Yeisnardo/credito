// models/clase_aprobacion.js
const { query } = require('../config/db');

class Aprobacion {
  static async getAprobaciones() {
  const resultado = await query(`
    SELECT
  p.*, 
  e.tipo_sector, 
  e.tipo_negocio, 
  e.nombre_emprendimiento, 
  e.consejo_nombre, 
  e.comuna, 
  e.direccion_emprendimiento,
  u.usuario, 
  u.rol, 
  u.estatus AS estatus_usuario,
  r.fecha AS requerimiento_fecha,
  r.carta_solicitud,
  r.postulacion_UBCH,
  r.certificado_emprender,
  r.registro_municipal,
  r.carta_residencia,
  r.copia_cedula,
  r.rif_personal,
  r.fotos_emprendimiento,
  r.rif_emprendimiento,
  r.referencia_bancaria,
  s.motivo,
  s.estatus AS estatus_solicitud,
  a.contrato AS contrato_aprobacion,
  a.fecha_aprobacion
FROM persona p
LEFT JOIN emprendimientos e ON p.cedula = e.cedula_emprendedor
LEFT JOIN usuario u ON p.cedula = u.cedula_usuario
LEFT JOIN requerimientos r ON p.cedula = r.cedula_requerimiento
LEFT JOIN solicitud s ON p.cedula = s.cedula_solicitud
LEFT JOIN aprobacion a ON p.cedula = a.cedula_aprobacion;
  `);
  return resultado.rows;
}
}

module.exports = Aprobacion;