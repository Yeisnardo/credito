import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Funciones API para cuotas

export const getContratoPorId = async (cedula_emprendedor) => {
  const response = await api.get(`/api/cuotas/${cedula_emprendedor}`);
  return response.data;
};


export default {
  getContratoPorId
};