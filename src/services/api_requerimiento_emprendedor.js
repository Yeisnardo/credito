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

// Obtener un requerimiento_emprendedor por id_req
export const getRequerimientoEmprendedor = async (id_req) => {
  try {
    // Nota: Falta una barra '/' antes de ${id_req}
    const response = await api.get(`/api/requerimiento_emprendedor/${id_req}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener requerimiento_emprendedor con id ${id_req}:`, error);
    throw error;
  }
};