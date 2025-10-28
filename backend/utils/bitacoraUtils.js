// utils/bitacoraUtils.js
const { query } = require('../config/conexion');

const registrarAccionManual = async (cedulaUsuario, usuario, accion, datosAdicionales = {}) => {
  try {
    await query(
      `INSERT INTO bitacora (
        cedula_usuario, usuario, accion, metodo, ruta, 
        estado, ip, datos_adicionales, fecha
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        cedulaUsuario,
        usuario,
        accion,
        'SISTEMA',
        'N/A',
        200,
        '127.0.0.1',
        JSON.stringify(datosAdicionales)
      ]
    );
  } catch (error) {
    console.error('Error al registrar acción manual en bitácora:', error);
  }
};

module.exports = { registrarAccionManual };