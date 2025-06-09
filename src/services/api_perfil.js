import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // reemplaza con tu URL base
});

// Obtener todas las solicitudes
const getSolicitudes = async () => {
  const response = await api.get('/api/solicitudes');
  return response.data;
};

// Crear una solicitud
const createSolicitud = async (solicitud) => {
  const response = await api.post('/api/solicitudes', solicitud);
  return response.data;
};

// Obtener una solicitud por cedula
const getSolicitudPorcedula = async (cedula) => {
  const response = await api.get(`/api/solicitudes/${cedula}`);
  return response.data;
};

// Actualizar una solicitud por cedula
const updateSolicitud = async (cedula, solicitud) => {
  const response = await api.put(`/api/solicitudes/${cedula}`, solicitud);
  return response.data;
};

// Eliminar una solicitud por cedula
const deleteSolicitud = async (cedula) => {
  const response = await api.delete(`/api/solicitudes/${cedula}`);
  return response.data;
};

export default {
  getSolicitudes,
  createSolicitud,
  getSolicitudPorcedula,
  updateSolicitud,
  deleteSolicitud,
};