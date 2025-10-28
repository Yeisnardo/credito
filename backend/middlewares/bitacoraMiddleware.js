// middlewares/bitacoraMiddleware.js
const { query } = require('../config/conexion');

const registrarBitacora = async (req, res, next) => {
  // Guardar referencia original del método send
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Capturar la respuesta
  let responseBody;
  
  res.json = function(body) {
    responseBody = body;
    return originalJson.call(this, body);
  };
  
  res.send = function(body) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Registrar después de que la respuesta se envía
  res.on('finish', async () => {
    try {
      const usuario = req.usuario || 'Sistema'; // Usuario autenticado o sistema
      const cedulaUsuario = req.usuario?.cedula_usuario || 'Sistema';
      const metodo = req.method;
      const ruta = req.originalUrl;
      const estado = res.statusCode;
      const ip = req.ip || req.connection.remoteAddress;
      
      // Determinar la acción basada en el método y ruta
      let accion = '';
      switch (metodo) {
        case 'POST':
          if (ruta.includes('/login')) {
            accion = estado === 200 ? 'Inicio de sesión exitoso' : 'Intento de inicio de sesión fallido';
          } else {
            accion = 'Creación de usuario';
          }
          break;
        case 'PUT':
          if (ruta.includes('/estatus')) {
            accion = 'Cambio de estatus de usuario';
          } else {
            accion = 'Actualización de usuario';
          }
          break;
        case 'DELETE':
          accion = 'Eliminación de usuario';
          break;
        case 'GET':
          accion = 'Consulta de datos';
          break;
        default:
          accion = 'Operación en sistema';
      }

      // Información adicional del request
      const datosAdicionales = {
        body: metodo !== 'GET' ? req.body : null,
        params: req.params,
        query: req.query,
        respuesta: responseBody,
        userAgent: req.get('User-Agent')
      };

      await query(
        `INSERT INTO bitacora (
          cedula_usuario, usuario, accion, metodo, ruta, 
          estado, ip, datos_adicionales, fecha
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          cedulaUsuario,
          typeof usuario === 'object' ? usuario.usuario : usuario,
          accion,
          metodo,
          ruta,
          estado,
          ip,
          JSON.stringify(datosAdicionales)
        ]
      );
      
    } catch (error) {
      console.error('Error al registrar en bitácora:', error);
    }
  });

  next();
};

module.exports = { registrarBitacora };