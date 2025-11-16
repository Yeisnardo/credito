// services/notificacionService.js
const notificacionesApi = require('./api_notificaciones');
const { query } = require("../config/conexion");

class NotificacionService {
  // Crear notificación cuando se envía una solicitud
  async notificarNuevaSolicitud(id_req, cedula_emprendedor) {
    try {
      // Obtener información del emprendedor
      const emprendedor = await query(
        'SELECT nombre_completo, nombre_emprendimiento FROM persona WHERE cedula = $1',
        [cedula_emprendedor]
      );

      if (emprendedor.rows.length === 0) return;

      const nombreEmprendedor = emprendedor.rows[0].nombre_completo;
      const nombreEmprendimiento = emprendedor.rows[0].nombre_emprendimiento;

      // Obtener administradores y credito2
      const destinatarios = await query(
        `SELECT cedula_usuario FROM usuarios 
         WHERE rol IN ('Administrador', 'Credito2') AND estatus = 'Activo'`,
        []
      );

      // Crear notificación para cada destinatario
      for (const dest of destinatarios.rows) {
        await notificacionesApi.crearNotificacion({
          id_req,
          cedula_remitente: cedula_emprendedor,
          cedula_destinatario: dest.cedula_usuario,
          tipo_notificacion: 'nueva_solicitud',
          titulo: 'Nueva Solicitud de Crédito',
          mensaje: `${nombreEmprendedor} ha enviado una nueva solicitud para el emprendimiento "${nombreEmprendimiento}"`
        });
      }
    } catch (error) {
      console.error('Error al crear notificación de nueva solicitud:', error);
    }
  }

  // Notificar cambio de estatus de solicitud
  async notificarCambioEstatus(id_req, cedula_emprendedor, nuevoEstatus, motivo = '') {
    try {
      let titulo, mensaje;

      switch (nuevoEstatus) {
        case 'Aprobada':
          titulo = 'Solicitud Aprobada';
          mensaje = `¡Felicidades! Tu solicitud ha sido aprobada. ${motivo}`;
          break;
        case 'Rechazada':
          titulo = 'Solicitud Rechazada';
          mensaje = `Tu solicitud ha sido rechazada. Motivo: ${motivo}`;
          break;
        case 'En Proceso':
          titulo = 'Solicitud en Proceso';
          mensaje = 'Tu solicitud está siendo revisada por nuestro equipo';
          break;
        default:
          return;
      }

      await notificacionesApi.crearNotificacion({
        id_req,
        cedula_remitente: null, // Sistema
        cedula_destinatario: cedula_emprendedor,
        tipo_notificacion: 'cambio_estatus',
        titulo,
        mensaje
      });
    } catch (error) {
      console.error('Error al crear notificación de cambio de estatus:', error);
    }
  }
}

module.exports = new NotificacionService();