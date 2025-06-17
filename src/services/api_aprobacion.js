// services/api_aprobacion.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Ajusta si es diferente
});

// Función para obtener aprobaciones
const getAprobaciones = async () => {
  const response = await api.get('/api/aprobacion/');
  return response.data;
};

// Función para registrar una aprobación
const enviarAprobacion = async ({ cedula_aprobacion, contrato, fecha_aprobacion }) => {
  const payload = {
    cedula_aprobacion,
    contrato,
    fecha_aprobacion,
  };
  const response = await api.post('/api/aprobacion/', payload);
  return response.data;
};

export default {
  getAprobaciones,
  enviarAprobacion,
};