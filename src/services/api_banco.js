import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Obtener cuenta por ID de banco
export const getCuentaPorCedulaEmprendedor = async (cedula_emprendedor) => {
  const response = await api.get(`/api/cuenta/${cedula_emprendedor}`);
  return response.data;
};

// Crear nueva cuenta
export const crearBanco = async (banco) => {
  const response = await api.post('/api/cuenta', banco);
  return response.data;
};

// Actualizar cuenta existente
export const actualizarBanco = async (id_banco, banco) => {
  const response = await api.put(`/api/cuenta/${id_banco}`, banco);
  return response.data;
};

export default {
  getCuentaPorCedulaEmprendedor,
  crearBanco,
  actualizarBanco
};