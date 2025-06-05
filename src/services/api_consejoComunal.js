import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Asegúrate que este es el puerto correcto y que el backend está corriendo
});

// Crear consejo comunal
const createConsejo = async (consejo) => {
  const response = await api.post('/api/consejo_comunal', consejo);
  return response.data;
};

// Obtener consejo por cedula_persona
const getConsejo = async (cedula_persona) => {
  const response = await api.get(`/api/consejo_comunal/${cedula_persona}`);
  return response.data;
};

// Actualizar consejo por cedula_persona
const updateConsejo = async (cedula_persona, consejo) => {
  const response = await api.put(`/api/consejo_comunal/${cedula_persona}`, consejo);
  return response.data;
};

// Eliminar consejo por cedula_persona
const deleteConsejo = async (cedula_persona) => {
  const response = await api.delete(`/api/consejo_comunal/${cedula_persona}`);
  return response.data;
};

export default {
  createConsejo,
  getConsejo,
  updateConsejo,
  deleteConsejo,
};