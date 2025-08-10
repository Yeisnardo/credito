import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Obtener todos los contratos
export const getContratos = async () => {
  const response = await api.get('/api/contrato');
  return response.data;
};

// Registrar contrato usando la cédula del emprendedor
export const registrarContratoPorCedula = async (contratoData, cedula_emprendedor) => {
  const response = await api.post('/api/contrato/registrarContratoPorCedula', {
    ...contratoData,
    cedula_emprendedor,
  });
  return response.data;
};

// Asignar número de contrato usando la cédula del emprendedor
export const asignarNumeroContratoPorCedula = async (cedula_emprendedor, numero_contrato) => {
  const response = await api.post('/api/contrato/asignarNumeroPorCedula', {
    cedula_emprendedor,
    numero_contrato,
  });
  return response.data;
};