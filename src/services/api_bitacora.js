import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Obtener todos los registros de bitácora
export const getBitacora = async (limite = 100, offset = 0) => {
  try {
    const response = await api.get(`/bitacora?limite=${limite}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo bitácora:', error);
    throw error;
  }
};

// Obtener bitácora con filtros
export const getBitacoraFiltrada = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) params.append(key, filtros[key]);
    });
    
    const response = await api.get(`/bitacora?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo bitácora filtrada:', error);
    throw error;
  }
};

export default {
  getBitacora,
  getBitacoraFiltrada
};