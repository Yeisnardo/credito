const { query } = require('../config/db');

class Requerimiento {
  // Validar campos obligatorios
  static validarRequerimiento(requerimiento) {
    const { nombre_requerimiento } = requerimiento;
    if (!nombre_requerimiento) {
      throw new Error("El campo 'nombre_requerimiento' es obligatorio");
    }
  }

  // Obtener todos los requerimientos
  static async getRequerimientos() {
    const resultado = await query('SELECT * FROM requerimientos');
    return resultado.rows;
  }

  // Crear nuevo requerimiento
  static async createRequerimiento({ nombre_requerimiento }) {
    this.validarRequerimiento({ nombre_requerimiento });
    const resultado = await query(
      'INSERT INTO requerimientos (nombre_requerimiento) VALUES ($1) RETURNING *',
      [nombre_requerimiento]
    );
    return resultado.rows[0];
  }

  // Actualizar requerimiento
  static async updateRequerimiento(id, { nombre_requerimiento }) {
    this.validarRequerimiento({ nombre_requerimiento });
    const resultado = await query(
      'UPDATE requerimientos SET nombre_requerimiento = $1 WHERE id_requerimientos = $2 RETURNING *',
      [nombre_requerimiento, id]
    );
    return resultado.rows[0];
  }

  // Eliminar requerimiento
  static async deleteRequerimiento(id) {
    const resultado = await query('DELETE FROM requerimientos WHERE id_requerimientos = $1 RETURNING *', [id]);
    return resultado.rows[0];
  }
}

module.exports = Requerimiento;