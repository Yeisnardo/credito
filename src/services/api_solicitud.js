import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// 🔥 NUEVA FUNCIÓN: Actualizar solicitud SOLO por id_req
export const updateSolicitudPorIdReq = async (id_req, datos) => {
  try {
    console.log('🎯 Enviando actualización por id_req:', {
      id_req,
      datos
    });

    const response = await api.put(
      `/api/solicitudes/requerimiento/${id_req}`, 
      datos
    );
    
    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en updateSolicitudPorIdReq:', error);
    throw error;
  }
};

// 🔥 FUNCIÓN PARA OBTENER SOLICITUD POR id_req
export const getSolicitudPorIdReq = async (id_req) => {
  try {
    const response = await api.get(`/api/solicitudes/requerimiento/${id_req}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo solicitud por id_req:', error);
    throw error;
  }
};

// Funciones API para Solicitud
export const getSolicitudes = async () => {
  const response = await api.get('/api/solicitudes');
  return response.data;
};

export const getSolicitudPorCedula = async (cedula_emprendedor) => {
  const response = await api.get(`/api/solicitudes/${cedula_emprendedor}`);
  return response.data;
};

// Función para obtener solicitudes por estatus
export const getSolicitudesPorEstatus = async (estatus) => {
  const response = await api.get(`/api/solicitudes/estatus/${estatus}`);
  return response.data;
};

export const createSolicitud = async (solicitud) => {
  const response = await api.post('/api/solicitudes', solicitud);
  return response.data;
};

export const updateSolicitud = async (cedula_emprendedor, solicitud) => {
  const response = await api.put(`/api/solicitudes/${cedula_emprendedor}`, solicitud);
  return response.data;
};

export const deleteSolicitud = async (cedula_emprendedor) => {
  const response = await api.delete(`/api/solicitudes/${cedula_emprendedor}`);
  return response.data;
};

// Opcional: si necesitas actualizar algún campo específico, como motivo o estado
export const updateSolicitudMotivo = async (cedula_emprendedor, motivo) => {
  const response = await api.put(`/api/solicitudes/${cedula_emprendedor}/motivo`, { motivo });
  return response.data;
};

export default {
  getSolicitudes,
  getSolicitudPorCedula,
  getSolicitudesPorEstatus,
  createSolicitud,
  updateSolicitud,
  updateSolicitudPorIdReq, // 🔥 NUEVA
  getSolicitudPorIdReq,    // 🔥 NUEVA
  deleteSolicitud,
  updateSolicitudMotivo,
};