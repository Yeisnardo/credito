import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Funciones API para cuotas

export const getCuotas = async () => {
  const response = await api.get('/api/cuotas');
  return response.data;
};

export const getCuotaPorCedula = async (cedula_emprendedor) => {
  const response = await api.get(`/api/cuotas/${cedula_emprendedor}`);
  return response.data;
};

export default {
  getCuotas,
  getCuotaPorCedula
};