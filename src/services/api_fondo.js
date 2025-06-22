import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Asegúrate de que sea la URL correcta
});

// Crear un nuevo fondo
const createFondo = async (fondo) => {
  const response = await api.post('/api/fondos', fondo);
  return response.data;
};

// Obtener todos los fondos
const getFondos = async () => {
  const response = await api.get('/api/fondos');
  return response.data;
};

export default {
  createFondo,
  getFondos,
};