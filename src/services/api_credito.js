import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const getCreditos = async () => {
  const response = await api.get('/api/credito');
  return response.data;
};

const crearCredito = async (data) => {
  const response = await api.post('/api/credito', data);
  return response.data;
};

export {
  getCreditos,
  crearCredito
};