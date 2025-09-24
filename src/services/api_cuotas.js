import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Obtener contrato y cuotas por cédula del emprendedor
export const getContratoPorId = async (cedula_emprendedor) => {
  const response = await api.get(`/api/cuotas/${cedula_emprendedor}`);
  return response.data;
};

// Registrar una cuota (incluye comprobante)
export const registrarCuota = async (cuotaData) => {
  const response = await api.post('/api/cuotas', cuotaData);
  return response.data;
};

export default {
  getContratoPorId,
  registrarCuota,
};