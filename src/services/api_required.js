import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});



// Obtener todos los requerimientos
export const getRequerimientos = async () => {
  const response = await api.get('/api/requerimiento_emprendedor');
  return response.data;
};

// Obtener un requerimiento por ID
export const getRequerimientoById = async (id_req) => {
  const response = await api.get(`/api/requerimiento_emprendedor/${id_req}`);
  return response.data;
};

// Crear un requerimiento_emprendedor
export const createRequerimientoEmprendedor = async (data) => {
  const response = await api.post('/api/requerimiento_emprendedor', data);
  return response.data;
};

// Actualizar un requerimiento por ID_rid_req
export const updateRequerimiento = async (id_req, data) => {
  const response = await api.put(`/api/requerimiento_emprendedor/${id_req}`, data);
  return response.data;
};

// Eliminar un requerimiento por ID_rid_req
export const deleteRequerimiento = async (id_req) => {
  const response = await api.delete(`/api/requerimiento_emprendedor/${id_req}`);
  return response.data;
};