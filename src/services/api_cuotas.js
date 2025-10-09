import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// ========== APIS EXISTENTES ==========
export const getContratoPorCedula = async (cedula_emprendedor) => {
  const response = await api.get(`/api/cuotas/contrato/${cedula_emprendedor}`);
  return response.data;
};

export const registrarCuota = async (cuotaData) => {
  const response = await api.post('/api/cuotas', cuotaData);
  return response.data;
};

export const getCuotasPagadas = async (cedula_emprendedor) => {
  const response = await api.get(`/api/cuotas/pagadas/${cedula_emprendedor}`);
  return response.data;
};

// ========== NUEVAS APIS ==========

// Obtener todos los contratos (para administrador)
export const getContratos = async () => {
  const response = await api.get('/api/cuotas/contratos/todos');
  return response.data;
};

// Obtener cuotas por contrato (para administrador)
export const getCuotasPorContrato = async (id_contrato) => {
  const response = await api.get(`/api/cuotas/contrato/${id_contrato}/cuotas`);
  return response.data;
};

// Registrar pago manual (para administrador)
export const registrarPagoManual = async (id_cuota, pagoData) => {
  const response = await api.post(`/api/cuotas/${id_cuota}/pago-manual`, pagoData);
  return response.data;
};

// Recalcular cuotas pendientes
export const recalcularCuotasPendientes = async (id_contrato, configData) => {
  const response = await api.post(`/api/cuotas/recalcular/${id_contrato}`, configData);
  return response.data;
};

// Obtener estadísticas para dashboard
export const getEstadisticasDashboard = async () => {
  const response = await api.get('/api/cuotas/estadisticas/dashboard');
  return response.data;
};

// Obtener cuotas pendientes por emprendedor
export const getCuotasPendientesEmprendedor = async (cedula_emprendedor) => {
  const response = await api.get(`/api/cuotas/emprendedor/${cedula_emprendedor}/pendientes`);
  return response.data;
};

// Obtener historial de pagos por emprendedor
export const getHistorialPagosEmprendedor = async (cedula_emprendedor) => {
  const response = await api.get(`/api/cuotas/emprendedor/${cedula_emprendedor}/historial`);
  return response.data;
};

export default {
  getContratoPorCedula,
  registrarCuota,
  getCuotasPagadas,
  getContratos,
  getCuotasPorContrato,
  registrarPagoManual,
  recalcularCuotasPendientes,
  getEstadisticasDashboard,
  getCuotasPendientesEmprendedor,
  getHistorialPagosEmprendedor
};