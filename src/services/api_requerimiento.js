import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Cambia si es necesario
});

// Crear requerimiento
const createRequerimiento = async (requerimientoData) => {
  const response = await api.post('/api/requerimiento', requerimientoData);
  return response.data;
};

// Obtener requerimiento por cédula
const getRequerimiento = async (cedula_requerimiento) => {
  const response = await api.get(`/api/requerimiento/${cedula_requerimiento}`);
  return response.data; // Puede ser null si no existe
};

export default {
  createRequerimiento,
  getRequerimiento,
};