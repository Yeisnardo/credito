import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Funciones API
const getUsers = async () => {
  const response = await api.get('/api/usuarios');
  return response.data;
};

const createUsuario = async (usuario) => {
  const response = await api.post('/api/usuarios', usuario);
  return response.data;
};

const updateUsuario = async (cedula_usuario, usuario) => {
  const response = await api.put(`/api/usuarios/${cedula_usuario}`, usuario);
  return response.data;
};

const deleteUsuario = async (cedula_usuario) => {
  const response = await api.delete(`/api/usuarios/${cedula_usuario}`);
  return response.data;
};

const updateUsuarioEstatus = async (cedula_usuario, estatus) => {
  const response = await api.put(`/api/usuarios/${cedula_usuario}/estatus`, { estatus });
  return response.data;
};

export default {
  getUsers,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  updateUsuarioEstatus,
};