import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear una nueva persona
const createPersona = async (persona) => {
  const response = await api.post('/api/persona', persona);
  return response.data;
};

// Obtener una persona por cédula
const getPersona = async (cedula) => {
  const response = await api.get(`/api/persona/${cedula}`);
  return response.data;
};

// Actualizar una persona por cédula
const updatePersona = async (cedula, persona) => {
  const response = await api.put(`/api/persona/${cedula}`, persona);
  return response.data;
};

// Eliminar una persona por cédula
const deletePersona = async (cedula) => {
  const response = await api.delete(`/api/persona/${cedula}`);
  return response.data;
};

export default {
  createPersona,
  getPersona,
  updatePersona,
  deletePersona,
};