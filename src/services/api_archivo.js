import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 30000, // 30 segundos timeout
});

// Interceptor para logging
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status} ${error.config?.url}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Obtener archivo por cédula del emprendedor - CORREGIDO
export const getArchivoPorCedulaEmprendedor = async (cedula_emprendedor) => {
  try {
    if (!cedula_emprendedor) {
      console.error('❌ Cédula de emprendedor no proporcionada');
      return [];
    }
    
    console.log('📞 Llamando API para cédula:', cedula_emprendedor);
    const response = await api.get(`/api/archivo/emprendedor/${cedula_emprendedor}`);
    console.log('✅ Respuesta API archivos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en getArchivoPorCedulaEmprendedor:', error);
    // Si es 404, retornar array vacío en lugar de error
    if (error.response && error.response.status === 404) {
      return [];
    }
    throw error;
  }
};

// Obtener archivos por id_req
export const getArchivosPorRequerimiento = async (id_req) => {
  try {
    if (!id_req) {
      console.error('❌ ID de requerimiento no proporcionado');
      return [];
    }
    
    console.log('📞 Buscando archivos para id_req:', id_req);
    const response = await api.get(`/api/archivo/byReq/${id_req}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error en getArchivosPorRequerimiento:', error);
    if (error.response && error.response.status === 404) {
      return [];
    }
    throw error;
  }
};

// Obtener archivo por ID
export const getArchivoPorId = async (id_archivo) => {
  try {
    const response = await api.get(`/api/archivo/${id_archivo}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error en getArchivoPorId:', error);
    throw error;
  }
};

// Función auxiliar para construir URL de imagen
export const obtenerUrlImagen = (nombreArchivo) => {
  if (!nombreArchivo) {
    console.warn('⚠️ No se proporcionó nombre de archivo');
    return null;
  }
  
  // Si ya es una URL completa, retornarla
  if (nombreArchivo.startsWith('http')) {
    return nombreArchivo;
  }
  
  // Si es una ruta relativa, construir URL completa
  const url = `http://localhost:5000/uploads/${nombreArchivo}`;
  console.log('🔗 URL construida:', url);
  return url;
};

// Crear nuevo archivo
export const crearArchivo = async (formData) => {
  try {
    console.log('📤 Creando nuevo archivo...');
    const response = await api.post('/api/archivo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 segundos para subida de archivos
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error en crearArchivo:', error);
    throw error;
  }
};

// Actualizar archivo existente
export const actualizarArchivo = async (id_archivo, formData) => {
  try {
    const response = await api.put(`/api/archivo/${id_archivo}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error en actualizarArchivo:', error);
    throw error;
  }
};

// Eliminar archivo
export const eliminarArchivo = async (id_archivo) => {
  try {
    const response = await api.delete(`/api/archivo/${id_archivo}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error en eliminarArchivo:', error);
    throw error;
  }
};

// Verificar si una imagen existe
export const verificarImagenExiste = async (urlImagen) => {
  try {
    const response = await fetch(urlImagen, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('❌ Error verificando imagen:', urlImagen, error);
    return false;
  }
};

export default {
  getArchivoPorCedulaEmprendedor,
  getArchivosPorRequerimiento,
  getArchivoPorId,
  crearArchivo,
  actualizarArchivo,
  eliminarArchivo,
  obtenerUrlImagen,
  verificarImagenExiste
};