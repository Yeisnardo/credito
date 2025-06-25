import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Función para obtener todos los créditos
const getCreditos = async () => {
  const response = await api.get('/api/credito');
  return response.data;
};

// Función para crear un nuevo crédito
const crearCredito = async (data) => {
  const response = await api.post('/api/credito', data);
  return response.data;
};

// Función para obtener créditos por cédula
const getCreditosPorCedula = async (cedula_credito) => {
  const response = await api.get(`/api/credito/cedula_credito/${cedula_credito}`);
  return response.data;
};

const actualizarEstatusCredito = async (cedulaCredito, nuevoEstatus) => {
  const response = await api.put(`/api/credito/actualizar-estatus/${cedulaCredito}`, { estatus: nuevoEstatus });
  return response.data;
};

export {
  getCreditos,
  crearCredito,
  getCreditosPorCedula,
  actualizarEstatusCredito
};