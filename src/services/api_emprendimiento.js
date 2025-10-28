import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Obtener todos los emprendimientos
export const getEmprendimientos = async () => {
  const response = await api.get('/emprendimientos');
  return response.data;
};

// Crear emprendimiento
export const createEmprendimiento = async (emprendimiento) => {
  const response = await api.post('/emprendimientos', emprendimiento);
  return response.data;
};

// Actualizar emprendimiento
export const updateEmprendimiento = async (cedula_emprendedor, emprendimiento) => {
  const response = await api.put(`/emprendimientos/${cedula_emprendedor}`, emprendimiento);
  return response.data;
};

// Eliminar emprendimiento
export const deleteEmprendimiento = async (cedula_emprendedor) => {
  const response = await api.delete(`/emprendimientos/${cedula_emprendedor}`);
  return response.data;
};

// Obtener emprendimiento por cédula del emprendedor
export const getEmprendimientoByCedula = async (cedula_emprendedor) => {
  const response = await api.get(`/emprendimientos/${cedula_emprendedor}`);
  return response.data;
};

export default {
  getEmprendimientos,
  createEmprendimiento,
  updateEmprendimiento,
  deleteEmprendimiento,
  getEmprendimientoByCedula,
};