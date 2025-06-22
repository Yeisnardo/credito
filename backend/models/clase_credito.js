const { query } = require("../config/db");

class Credito {
  static async getCreditos() {
    const resultado = await query(`
    SELECT 
  p.cedula, 
  p.nombre_completo AS nombre_apellido, 
  a.contrato, 
  a.estatus AS estado, 
  a.fecha_aprobacion,
  c.monto_euros,
  c.monto_bs,
  c.diez_euros
FROM persona p
LEFT JOIN aprobacion a ON p.cedula = a.cedula_aprobacion
LEFT JOIN credito c ON c.cedula_credito = a.cedula_aprobacion;
  `);
    return resultado.rows;
  }
}

module.exports = Credito;
