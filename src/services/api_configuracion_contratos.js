import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear configuración
const createConfiguracion = async (configuracion) => {
  const response = await api.post('/api/configuracion', configuracion);
  return response.data;
};

// Obtener configuración
const getConfiguracion = async () => {
  const response = await api.get('/api/configuracion');
  // Si devuelve un array, retoma el primer elemento si existe
  if (response.data.length > 0) {
    return response.data[0];
  }
  return null; // si no hay datos
};

// Actualizar configuración
const updateConfiguracion = async (id, configuracion) => {
  const response = await api.put(`/api/configuracion/${id}`, configuracion);
  return response.data;
};

// Exporta
export default {
  createConfiguracion,
  getConfiguracion,
  updateConfiguracion,
};