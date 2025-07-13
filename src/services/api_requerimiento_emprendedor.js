import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Cambia esto si usas otra URL
});

// Crear un nuevo requerimiento_emprendedor
export const createRequerimientoEmprendedor = async (requerimientoEmprendedor) => {
  try {
    const response = await api.post('/api/requerimiento_emprendedor', requerimientoEmprendedor);
    return response.data;
  } catch (error) {
    console.error('Error al crear requerimiento_emprendedor:', error);
    throw error; // Puedes lanzar el error para manejarlo donde llames esta función
  }
};

// Obtener un requerimiento_emprendedor por cedula_emprendedor
export const getRequerimientoEmprendedor = async (cedula_emprendedor) => {
  try {
    // Nota: Falta una barra '/' antes de ${cedula_emprendedor}
    const response = await api.get(`/api/requerimiento_emprendedor/${cedula_emprendedor}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener requerimiento_emprendedor con id ${cedula_emprendedor}:`, error);
    throw error;
  }
};