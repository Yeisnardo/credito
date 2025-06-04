import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear emprendimiento
const createEmprendimiento = async (emprendimiento) => {
  const response = await api.post('/api/emprendimientos', emprendimiento);
  return response.data;
};

// Obtener emprendimiento por cedula_emprendedor
const getEmprendimiento = async (cedula_emprendedor) => {
  const response = await api.get(`/api/emprendimientos/${cedula_emprendedor}`);
  return response.data;
};

// Actualizar emprendimiento
const updateEmprendimiento = async (cedula_emprendedor, emprendimiento) => {
  const response = await api.put(`/api/emprendimientos/${cedula_emprendedor}`, emprendimiento);
  return response.data;
};

// Eliminar emprendimiento
const deleteEmprendimiento = async (cedula_emprendedor) => {
  const response = await api.delete(`/api/emprendimientos/${cedula_emprendedor}`);
  return response.data;
};

export default {
  createEmprendimiento,
  getEmprendimiento,
  updateEmprendimiento,
  deleteEmprendimiento,
};