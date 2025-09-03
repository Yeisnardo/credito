import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Función para asignar el número de contrato
export const asignarNumeroContrato = async (cedula, numeroContrato) => {
  const response = await api.post('/api/contratos', { 
    cedula_emprendedor: cedula, 
    numero_contrato: numeroContrato 
  });
  return response.data;
};

// Función para registrar contrato completo en ambas tablas
export const registrarContrato = async (contratoData) => {
  const response = await api.post('/api/contratos/contrato', contratoData);
  return response.data;
};

export default {
  asignarNumeroContrato,
  registrarContrato,
};