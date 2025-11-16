import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// 🔥 NUEVA FUNCIÓN: Obtener todos los requerimientos del fiador
export const getRequerimientosFiador = async () => {
  try {
    const response = await api.get('/api/requerimientos-fiador');
    return response.data;
  } catch (error) {
    console.error('Error al obtener requerimientos del fiador:', error);
    throw error;
  }
};

// 🔥 NUEVA FUNCIÓN: Crear requerimiento del fiador
export const createRequerimientoFiador = async (requerimientoData) => {
  try {
    console.log('🎯 Enviando creación de requerimiento fiador:', requerimientoData);

    const response = await api.post('/api/requerimientos-fiador', requerimientoData);
    
    console.log('✅ Requerimiento fiador creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en createRequerimientoFiador:', error);
    throw error;
  }
};

// 🔥 NUEVA FUNCIÓN: Actualizar requerimiento del fiador
export const updateRequerimientoFiador = async (id, requerimientoData) => {
  try {
    console.log('🎯 Enviando actualización de requerimiento fiador:', {
      id,
      requerimientoData
    });

    const response = await api.put(`/api/requerimientos-fiador/${id}`, requerimientoData);
    
    console.log('✅ Requerimiento fiador actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en updateRequerimientoFiador:', error);
    throw error;
  }
};

// 🔥 NUEVA FUNCIÓN: Eliminar requerimiento del fiador
export const deleteRequerimientoFiador = async (id) => {
  try {
    console.log('🎯 Eliminando requerimiento fiador:', id);

    const response = await api.delete(`/api/requerimientos-fiador/${id}`);
    
    console.log('✅ Requerimiento fiador eliminado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en deleteRequerimientoFiador:', error);
    throw error;
  }
};

// Exportación por defecto para compatibilidad
export default {
  getRequerimientosFiador,
  createRequerimientoFiador,
  updateRequerimientoFiador,
  deleteRequerimientoFiador,
};