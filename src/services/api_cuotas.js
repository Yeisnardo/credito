import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Funciones API para cuotas

export const getCuotas = async () => {
  const response = await api.get('/api/cuotas');
  return response.data;
};

export const getContratoPorCedula = async (id_contrato) => {
  const response = await api.get(`/api/cuotas/${id_contrato}`);
  return response.data;
};


export default {
  getCuotas,
  getContratoPorCedula
};