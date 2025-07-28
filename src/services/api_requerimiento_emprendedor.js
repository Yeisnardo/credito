import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Asegúrate que esta URL sea la correcta
});

// Crear un nuevo requerimiento_emprendedor
export const createRequerimientoEmprendedor = async (requerimientoEmprendedor) => {
  try {
    const response = await api.post('/api/requerimiento_emprendedor', requerimientoEmprendedor);
    return response.data;
  } catch (error) {
    console.error('Error al crear requerimiento_emprendedor:', error);
    throw error;
  }
};

// Obtener requerimiento_emprendedor por cédula del emprendedor
export const getRequerimientoEmprendedor = async (cedula_emprendedor) => {
  try {
    // Asegúrate de que hay una barra '/' antes del parámetro
    const response = await api.get(`/api/requerimiento_emprendedor/${cedula_emprendedor}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener requerimiento_emprendedor con cédula ${cedula_emprendedor}:`, error);
    throw error;
  }
};