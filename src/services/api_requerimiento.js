import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear un requerimiento
const createRequerimiento = async (cedula_requerimiento, preguntas) => {
  const data = { cedula_requerimiento, respuestas: preguntas };
  const response = await api.post('/api/requerimiento', data);
  return response.data;
};

// Obtener un requerimiento por cédula
const getRequerimiento = async (cedula_requerimiento) => {
  const response = await api.get(`/api/requerimiento/${cedula_requerimiento}`);
  return response.data;
};

// Actualizar un requerimiento por cédula
const updateRequerimiento = async (cedula_requerimiento, preguntas) => {
  const data = { respuestas: preguntas };
  const response = await api.put(`/api/requerimiento/${cedula_requerimiento}`, data);
  return response.data;
};

// Eliminar un requerimiento por cédula
const deleteRequerimiento = async (cedula_requerimiento) => {
  const response = await api.delete(`/api/requerimiento/${cedula_requerimiento}`);
  return response.data;
};

export default {
  createRequerimiento,
  getRequerimiento,
  updateRequerimiento,
  deleteRequerimiento,
};