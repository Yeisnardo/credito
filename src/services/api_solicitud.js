import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Funciones API para Solicitud
export const getSolicitudes = async () => {
  const response = await api.get('/api/solicitudes');
  return response.data;
};

export const getSolicitudPorCedula = async (cedula_emprendedor) => {
  const response = await api.get(`/api/solicitudes/${cedula_emprendedor}`);
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
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
  updateSolicitudMotivo,
};