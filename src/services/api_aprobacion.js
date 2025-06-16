import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Obtener todas las aprobaciones
const getAprobaciones = async () => {
  const response = await api.get('/api/aprobacion/');
  return response.data;
};

// Obtener aprobación por cédula
const getAprobacion = async (cedula) => {
  const response = await api.get(`/api/aprobacion/${cedula}`);
  return response.data;
};

export default {
  getAprobaciones,
  getAprobacion,
};