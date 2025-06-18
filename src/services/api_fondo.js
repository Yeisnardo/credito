import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Ajusta si es necesario
});

// Obtener todas las aprobaciones
const getAprobaciones = async () => {
  const response = await api.get('/api/aprobacion');
  return response.data;
};

// Crear una nueva aprobación
const enviarAprobacion = async (data) => {
  const response = await api.post('/api/aprobacion', data);
  return response.data;
};

export default {
  getAprobaciones,
  enviarAprobacion,
};