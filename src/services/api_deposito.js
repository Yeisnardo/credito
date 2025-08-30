import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Cambia si es necesario
});

// Crear un depósito
export const createDeposito = async (deposito) => {
  const response = await api.post('/api/deposito', deposito);
  return response.data;
};

// Obtener todos los depósitos
export const getDepositos = async () => {
  const response = await api.get('/api/deposito');
  return response.data;
};

// Obtener depósitos por cedula_emprendedor
export const getDepositosPorCedula = async (cedula_emprendedor) => {
  const response = await api.get(`/api/deposito/cedula/${cedula_emprendedor}`);
  return response.data;
};

// Función para actualizar el estado de todos los depósitos por cédula
export const updateDepositosPorCedula = async (cedula, estado) => {
  const response = await api.put(`/api/deposito/cedula/${cedula}`, { estado });
  return response.data;
};