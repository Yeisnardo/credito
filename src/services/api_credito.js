import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const getCreditos = async () => {
  const response = await api.get('/api/credito');
  return response.data; // Devuelve array de objetos
};

export {
  getCreditos
};