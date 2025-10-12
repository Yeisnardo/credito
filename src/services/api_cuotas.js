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

// REGISTRAR PAGO MANUAL - FUNCIÓN FALTANTE
export const registrarPagoManual = async (id_cuota, pagoData) => {
  const response = await api.post(`/api/cuotas/${id_cuota}/pago-manual`, pagoData);
  return response.data;
};

// Confirmar pago IFEMI (para administrador)
export const confirmarPagoIFEMI = async (id_cuota) => {
  const response = await api.put(`/api/cuotas/${id_cuota}/confirmar-pago`);
  return response.data;
};

// Rechazar pago IFEMI (para administrador)
export const rechazarPagoIFEMI = async (id_cuota, motivo) => {
  const response = await api.put(`/api/cuotas/${id_cuota}/rechazar-pago`, { motivo });
  return response.data;
};

// Recalcular cuotas pendientes (sin parámetros, usa configuración)
export const recalcularCuotasPendientes = async (id_contrato) => {
  const response = await api.post(`/api/cuotas/recalcular/${id_contrato}`);
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
  registrarPagoManual, // AGREGAR ESTA LÍNEA
  confirmarPagoIFEMI,
  rechazarPagoIFEMI,
  recalcularCuotasPendientes,
  getEstadisticasDashboard,
  getCuotasPendientesEmprendedor,
  getHistorialPagosEmprendedor
};