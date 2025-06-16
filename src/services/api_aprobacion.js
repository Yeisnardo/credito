import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const getAprobaciones = async () => {
  const response = await api.get('/api/aprobacion/');
  return response.data;
};

export default {
  getAprobaciones,
};