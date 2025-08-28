import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es diferente
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