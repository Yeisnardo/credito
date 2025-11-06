// middlewares/bitacora.js
const { query } = require('../config/conexion');

const registrarBitacora = async (accion, cedula_usuario, detalles = null) => {
  try {
    await query(
      `INSERT INTO bitacora (accion, cedula_usuario, fecha, detalles) 
       VALUES ($1, $2, NOW(), $3)`,
      [accion, cedula_usuario, detalles ? JSON.stringify(detalles) : null]
    );
  } catch (error) {
    console.error('Error registrando en bitácora:', error);
  }
};

const middlewareBitacora = (accion, getDetalles = null) => {
  return async (req, res, next) => {
    // Guardar referencia original del método json
    const originalJson = res.json;
    
    res.json = function(data) {
      // Registrar después de que la respuesta sea exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const cedula_usuario = req.usuario ? req.usuario.cedula_usuario : req.body.cedula_usuario;
          let detalles = null;
          
          if (getDetalles) {
            detalles = getDetalles(req, data);
          }
          
          registrarBitacora(accion, cedula_usuario, detalles);
        } catch (error) {
          console.error('Error en middleware de bitácora:', error);
        }
      }
      
      // Llamar al método json original
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { registrarBitacora, middlewareBitacora };