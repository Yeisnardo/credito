import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ajusta si es necesario
});

// Obtener fiador por cédula
export const getFiadorByCedula = async (id_req) => {
  try {
    const response = await api.get(`/fiador/${id_req}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener fiadores por cédula del emprendedor
export const getFiadoresByEmprendedor = async (req) => {
  try {
    const response = await api.get(`/fiador/emprendedor/${req}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los fiadores
export const getAllFiadores = async () => {
  try {
    const response = await api.get('/fiador');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear nuevo fiador
export const createFiador = async (fiadorData) => {
  try {
    const response = await api.post('/fiador', fiadorData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar fiador existente
export const updateFiador = async (cedula_fiador, fiadorData) => {
  try {
    const response = await api.put(`/fiador/${cedula_fiador}`, fiadorData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar fiador
export const deleteFiador = async (cedula_fiador) => {
  try {
    const response = await api.delete(`/fiador/${cedula_fiador}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getFiadorByCedula,
  getFiadoresByEmprendedor,
  getAllFiadores,
  createFiador,
  updateFiador,
  deleteFiador
};