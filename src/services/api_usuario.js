import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Funciones API existentes
export const getUsuarios = async () => {
  const response = await api.get('/api/usuarios');
  return response.data;
};

export const getUsuarioPorCedula = async (cedula_usuario) => {
  const response = await api.get(`/api/usuarios/${cedula_usuario}`);
  return response.data;
};

export const createUsuario = async (usuario) => {
  const response = await api.post('/api/usuarios', usuario);
  return response.data;
};

export const updateUsuario = async (cedula_usuario, usuario) => {
  const response = await api.put(`/api/usuarios/${cedula_usuario}`, usuario);
  return response.data;
};

export const deleteUsuario = async (cedula_usuario) => {
  const response = await api.delete(`/api/usuarios/${cedula_usuario}`);
  return response.data;
};

export const updateUsuarioEstatus = async (cedula_usuario, estatus) => {
  const response = await api.put(`/api/usuarios/${cedula_usuario}/estatus`, { estatus });
  return response.data;
};

// NUEVAS FUNCIONES PARA CONTRASEÑA
export const verifyPassword = async (cedula_usuario, password) => {
  const response = await api.post('/api/usuarios/verify-password', {
    cedula_usuario,
    password
  });
  return response.data;
};

export const updatePassword = async (cedula_usuario, clave) => {
  const response = await api.put(`/api/usuarios/${cedula_usuario}/password`, { clave });
  return response.data;
};

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/Login';
    }
    return Promise.reject(error);
  }
);

// Función específica para logout
export const logoutUsuario = async () => {
  try {
    const response = await api.post('/api/usuarios/logout');
    return response.data;
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

export default {
  getUsuarios,
  getUsuarioPorCedula,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  updateUsuarioEstatus,
  verifyPassword,
  updatePassword,
  logoutUsuario
};