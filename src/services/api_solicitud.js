import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear una nueva solicitud
const createSolicitud = async (solicitud) => {
  const response = await api.post('/api/solicitud', solicitud);
  return response.data;
};

// Obtener una solicitud por cédula
const getSolicitud = async (cedula_solicitud) => {
  const response = await api.get(`/api/solicitud/${cedula_solicitud}`);
  return response.data;
};

// Actualizar una solicitud por cédula
const updateSolicitud = async (cedula_solicitud, solicitud) => {
  const response = await api.put(`/api/solicitud/${cedula_solicitud}`, solicitud);
  return response.data;
};

// Eliminar una solicitud por cédula
const deleteSolicitud = async (cedula_solicitud) => {
  const response = await api.delete(`/api/solicitud/${cedula_solicitud}`);
  return response.data;
};

export default {
  createSolicitud,
  getSolicitud,
  updateSolicitud,
  deleteSolicitud,
};