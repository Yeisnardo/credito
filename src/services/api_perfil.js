import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Obtener todos los perfiles
const getPerfiles = async () => {
  const response = await api.get('/api/perfiles');
  return response.data;
};

// Crear un perfil
const createPerfil = async (perfil) => {
  const response = await api.post('/api/perfiles', perfil);
  return response.data;
};

// Obtener un perfil por cédula
const getPerfilPorCedula = async (cedula) => {
  const response = await api.get(`/api/perfiles/${cedula}`);
  return response.data;
};

// Actualizar un perfil por cédula
const updatePerfil = async (cedula, perfil) => {
  const response = await api.put(`/api/perfiles/${cedula}`, perfil);
  return response.data;
};

// Eliminar un perfil por cédula
const deletePerfil = async (cedula) => {
  const response = await api.delete(`/api/perfiles/${cedula}`);
  return response.data;
};

export {
  getPerfiles,
  createPerfil,
  getPerfilPorCedula,
  updatePerfil,
  deletePerfil,
};