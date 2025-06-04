import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear ubicación
const createUbicacion = async (ubicacion) => {
  const response = await api.post('/api/ubicaciones', ubicacion);
  return response.data;
};

// Obtener ubicación por cedula_persona
const getUbicacion = async (cedula_persona) => {
  const response = await api.get(`/api/ubicaciones/${cedula_persona}`);
  return response.data;
};

// Actualizar ubicación
const updateUbicacion = async (cedula_persona, ubicacion) => {
  const response = await api.put(`/api/ubicaciones/${cedula_persona}`, ubicacion);
  return response.data;
};

// Eliminar ubicación
const deleteUbicacion = async (cedula_persona) => {
  const response = await api.delete(`/api/ubicaciones/${cedula_persona}`);
  return response.data;
};

export default {
  createUbicacion,
  getUbicacion,
  updateUbicacion,
  deleteUbicacion,
};