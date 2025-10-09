import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear configuración
export const createConfiguracion = async (configuracion) => {
  const response = await api.post('/api/configuracion', configuracion);
  return response.data;
};

// Obtener configuración actual
export const getConfiguracion = async () => {
  const response = await api.get('/api/configuracion');
  if (response.data.length > 0) {
    return response.data[0];
  }
  return null;
};

// Obtener todas las configuraciones
export const getAllConfiguraciones = async () => {
  const response = await api.get('/api/configuracion/todas');
  return response.data;
};

// Actualizar configuración
export const updateConfiguracion = async (id, configuracion) => {
  const response = await api.put(`/api/configuracion/${id}`, configuracion);
  return response.data;
};

// Eliminar configuración
export const deleteConfiguracion = async (id) => {
  const response = await api.delete(`/api/configuracion/${id}`);
  return response.data;
};

// Obtener historial de configuraciones
export const getHistorialConfiguracion = async () => {
  const response = await api.get('/api/configuracion/historial');
  return response.data;
};

// Obtener configuración activa (la más reciente)
export const getConfiguracionActiva = async () => {
  const response = await api.get('/api/configuracion/activa');
  return response.data;
};

export default {
  createConfiguracion,
  getConfiguracion,
  getAllConfiguraciones,
  updateConfiguracion,
  deleteConfiguracion,
  getHistorialConfiguracion,
  getConfiguracionActiva
};