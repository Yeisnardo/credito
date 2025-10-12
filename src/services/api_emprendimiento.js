import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Obtener todas las clasificaciones
export const getClasificaciones = async () => {
  const response = await api.get('/clasificacion');
  return response.data;
};

// Crear clasificación
export const createClasificacion = async (clasificacion) => {
  const response = await api.post('/clasificacion', clasificacion);
  return response.data;
};

// Actualizar clasificación
export const updateClasificacion = async (id_clasificacion, clasificacion) => {
  const response = await api.put(`/clasificacion/${id_clasificacion}`, clasificacion);
  return response.data;
};

// Eliminar clasificación
export const deleteClasificacion = async (id_clasificacion) => {
  const response = await api.delete(`/clasificacion/${id_clasificacion}`);
  return response.data;
};

// Obtener clasificación por ID
export const getClasificacionById = async (id_clasificacion) => {
  const response = await api.get(`/clasificacion/${id_clasificacion}`);
  return response.data;
};

export default {
  getClasificaciones,
  createClasificacion,
  updateClasificacion,
  deleteClasificacion,
  getClasificacionById,
};