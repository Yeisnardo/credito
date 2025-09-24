import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ajusta si es necesario
});

// Obtener archivo por cédula del emprendedor
export const getArchivoPorCedulaEmprendedor = async (cedula_emprendedor) => {
  const response = await api.get(`/api/archivo/${cedula_emprendedor}`);
  return response.data;
};

// Crear nuevo archivo
export const crearArchivo = async (archivo) => {
  const response = await api.post('/api/archivo', archivo);
  return response.data;
};

// Actualizar archivo existente
export const actualizarArchivo = async (id_archivo, archivo) => {
  const response = await api.put(`/api/archivo/${id_archivo}`, archivo);
  return response.data;
};

export default {
  getArchivoPorCedulaEmprendedor,
  crearArchivo,
  actualizarArchivo,
};