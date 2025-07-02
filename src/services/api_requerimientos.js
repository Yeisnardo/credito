import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es diferente
});

// Crear un requerimiento
export const createRequerimiento = async (requerimiento) => {
  const response = await api.post('/api/requerimientos', requerimiento);
  return response.data;
};

// Obtener todos los requerimientos
export const getRequerimientos = async () => {
  const response = await api.get('/api/requerimientos');
  return response.data;
};

// Actualizar un requerimiento por ID
export const updateRequerimiento = async (id, requerimiento) => {
  const response = await api.put(`/api/requerimientos/${id}`, requerimiento);
  return response.data;
};

// Eliminar un requerimiento por ID
export const deleteRequerimiento = async (id) => {
  const response = await api.delete(`/api/requerimientos/${id}`);
  return response.data;
};