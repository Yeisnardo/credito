import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// 🔥 FUNCIONES PRINCIPALES PARA FIADOR - CORREGIDAS
export const createFiador = async (fiadorData, archivo = null) => {
  try {
    console.log('📤 Creando fiador:', fiadorData);
    
    const formData = new FormData();
    
    // Agregar todos los campos del fiador al FormData
    Object.keys(fiadorData).forEach(key => {
      formData.append(key, fiadorData[key]);
    });
    
    // Agregar archivo si existe
    if (archivo) {
      formData.append('foto_rif_fiscal', archivo);
    }
    
    const response = await api.post('/api/fiadores', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Fiador creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear fiador:', error);
    throw error;
  }
};

export const updateFiador = async (id_fiador, fiadorData, archivo = null) => {
  try {
    const formData = new FormData();
    
    // Agregar todos los campos del fiador al FormData
    Object.keys(fiadorData).forEach(key => {
      formData.append(key, fiadorData[key]);
    });
    
    // Agregar archivo si existe
    if (archivo) {
      formData.append('foto_rif_fiscal', archivo);
    }
    
    const response = await api.put(`/api/fiadores/${id_fiador}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error actualizando fiador:', error);
    throw error;
  }
};

// Las demás funciones permanecen igual...
export const getFiadorPorIdReq = async (id_req) => {
  try {
    const response = await api.get(`/api/fiadores/requerimiento/${id_req}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo fiador por id_req:', error);
    throw error;
  }
};

export const getFiadorPorCedulaEmprendedor = async (cedula_emprendedor) => {
  try {
    const response = await api.get(`/api/fiadores/emprendedor/${cedula_emprendedor}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo fiador por cédula:', error);
    throw error;
  }
};

export const deleteFiador = async (id_fiador) => {
  try {
    const response = await api.delete(`/api/fiadores/${id_fiador}`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando fiador:', error);
    throw error;
  }
};

// 🔥 FUNCIONES PARA REQUERIMIENTOS DEL FIADOR
export const getRequerimientosFiador = async () => {
  try {
    const response = await api.get('/api/requerimientos-fiador');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo requerimientos del fiador:', error);
    throw error;
  }
};

export const createRequerimientoFiador = async (requerimientoData) => {
  try {
    const response = await api.post('/api/requerimientos-fiador', requerimientoData);
    return response.data;
  } catch (error) {
    console.error('Error creando requerimiento fiador:', error);
    throw error;
  }
};

export default {
  // Fiadores
  createFiador,
  getFiadorPorIdReq,
  getFiadorPorCedulaEmprendedor,
  updateFiador,
  deleteFiador,
  
  // Requerimientos Fiador
  getRequerimientosFiador,
  createRequerimientoFiador,
};