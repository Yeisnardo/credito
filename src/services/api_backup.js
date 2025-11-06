import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000, // 30 segundos timeout
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Crear respaldo de base de datos
 */
export const crearRespaldo = async () => {
  try {
    const response = await api.post('/backup/create');
    return response.data;
  } catch (error) {
    console.error('Error en crearRespaldo:', error);
    throw new Error(error.response?.data?.message || 'Error al crear respaldo');
  }
};

/**
 * Restaurar base de datos desde archivo
 */
export const restaurarBaseDatos = async (formData) => {
  try {
    const response = await api.post('/backup/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000 // 2 minutos para restauración
    });
    return response.data;
  } catch (error) {
    console.error('Error en restaurarBaseDatos:', error);
    throw new Error(error.response?.data?.message || 'Error al restaurar base de datos');
  }
};

/**
 * Descargar último respaldo
 */
export const descargarUltimoRespaldo = async () => {
  try {
    const response = await api.get('/backup/download/latest', {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const contentDisposition = response.headers['content-disposition'];
    let filename = `backup_${new Date().toISOString().split('T')[0]}.sql`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }
    
    return {
      success: true,
      downloadUrl,
      filename
    };
  } catch (error) {
    console.error('Error en descargarUltimoRespaldo:', error);
    throw new Error(error.response?.data?.message || 'Error al descargar respaldo');
  }
};

/**
 * Obtener historial de respaldos
 */
export const obtenerHistorialRespaldos = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/backup/history', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error en obtenerHistorialRespaldos:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener historial');
  }
};

/**
 * Eliminar respaldo por ID
 */
export const eliminarRespaldo = async (backupId) => {
  try {
    const response = await api.delete(`/backup/${backupId}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarRespaldo:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar respaldo');
  }
};

export default {
  crearRespaldo,
  restaurarBaseDatos,
  descargarUltimoRespaldo,
  obtenerHistorialRespaldos,
  eliminarRespaldo
};