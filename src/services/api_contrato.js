import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Función para crear o actualizar contrato
export const asignarNumeroContrato = async (cedula, numeroContrato) => {
  const response = await api.post('/api/contratos', { 
    cedula_emprendedor: cedula, 
    numero_contrato: numeroContrato 
  });
  return response.data;
};

export default {
  asignarNumeroContrato,
};