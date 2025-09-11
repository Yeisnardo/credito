import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // cambia esto si tu backend está en otra URL
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

// Función para obtener contratos por cédula del emprendedor
export const getContratosPorCedulaEmprendedor = async (cedula) => {
  const response = await api.get(`/api/contratos/${cedula}`);
  return response.data; // Asumiendo que el backend devuelve una lista de contratos
};

// Función para aceptar un contrato
export const aceptarContrato = async (idContrato, datosAceptacion) => {
  const response = await api.post(`/api/contratos/${idContrato}`, datosAceptacion);
  return response.data;
};

export default {
  asignarNumeroContrato,
  registrarContrato,
  getContratosPorCedulaEmprendedor,
  aceptarContrato
};