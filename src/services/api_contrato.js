import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Funciones API
export const getContrato = async () => {
  const response = await api.get('/api/contrato');
  return response.data;
};