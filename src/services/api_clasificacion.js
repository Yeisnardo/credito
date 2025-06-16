import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear una clasificación (sector y negocio son opcionales)
const createClasificacion = async (clasificacion) => {
  const response = await api.post('/api/clasificacion', clasificacion);
  return response.data;
};

// Obtener todas las clasificaciones
const getClasificaciones = async () => {
  const response = await api.get('/api/clasificacion');
  return response.data;
};

// Actualizar clasificación por id
const updateClasificacion = async (id_clasificacion, updatedData) => {
  const response = await api.put(`/api/clasificacion/${id_clasificacion}`, updatedData);
  return response.data;
};

export default {
  createClasificacion,
  getClasificaciones,
  updateClasificacion,
};
