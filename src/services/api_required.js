import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Crear un requerimiento_emprendedor
const createRequerimientoEmprendedor = async (data) => {
  const response = await api.post('/api/requerimiento_emprendedor', data);
  return response.data;
};

// Obtener todos los requerimientos
const getRequerimientos = async () => {
  const response = await api.get('/api/requerimiento_emprendedor');
  return response.data;
};

// Obtener un requerimiento por ID
const getRequerimientoById = async (id) => {
  const response = await api.get(`/api/requerimiento_emprendedor/${id}`);
  return response.data;
};

// Actualizar un requerimiento por ID
const updateRequerimiento = async (id, data) => {
  const response = await api.put(`/api/requerimiento_emprendedor/${id}`, data);
  return response.data;
};

// Eliminar un requerimiento por ID
const deleteRequerimiento = async (id) => {
  const response = await api.delete(`/api/requerimiento_emprendedor/${id}`);
  return response.data;
};

export default {
  createRequerimientoEmprendedor,
  getRequerimientos,
  getRequerimientoById,
  updateRequerimiento,
  deleteRequerimiento,
};