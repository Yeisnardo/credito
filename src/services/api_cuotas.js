import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// ========== APIS PARA EMPRENDEDOR ==========
export const getContratoPorCedula = async (cedula_emprendedor) => {
  try {
    const response = await api.get(`/api/cuotas/contrato/${cedula_emprendedor}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo contrato:', error);
    throw error;
  }
};

export const getCuotasPendientesEmprendedor = async (cedula_emprendedor) => {
  try {
    const response = await api.get(`/api/cuotas/emprendedor/${cedula_emprendedor}/pendientes`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo cuotas pendientes:', error);
    throw error;
  }
};

export const getHistorialPagosEmprendedor = async (cedula_emprendedor) => {
  try {
    const response = await api.get(`/api/cuotas/emprendedor/${cedula_emprendedor}/historial`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    throw error;
  }
};

// ========== APIS PARA ADMINISTRADOR ==========
export const getContratos = async () => {
  try {
    const response = await api.get('/api/cuotas/contratos/todos');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo contratos:', error);
    throw error;
  }
};

export const getCuotasPorContrato = async (id_contrato) => {
  try {
    const response = await api.get(`/api/cuotas/contrato/${id_contrato}/cuotas`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo cuotas por contrato:', error);
    throw error;
  }
};

export const getEstadisticasDashboard = async () => {
  try {
    const response = await api.get('/api/cuotas/estadisticas/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

// ========== OPERACIONES DE PAGOS ==========
export const registrarPagoManual = async (id_cuota, pagoData) => {
  try {
    const response = await api.post(`/api/cuotas/${id_cuota}/pago-manual`, pagoData);
    return response.data;
  } catch (error) {
    console.error('Error registrando pago manual:', error);
    throw error;
  }
};

export const confirmarPagoIFEMI = async (id_cuota) => {
  try {
    const response = await api.put(`/api/cuotas/${id_cuota}/confirmar-pago`);
    return response.data;
  } catch (error) {
    console.error('Error confirmando pago:', error);
    throw error;
  }
};

export const rechazarPagoIFEMI = async (id_cuota, motivo) => {
  try {
    const response = await api.put(`/api/cuotas/${id_cuota}/rechazar-pago`, { motivo });
    return response.data;
  } catch (error) {
    console.error('Error rechazando pago:', error);
    throw error;
  }
};

// ========== OPERACIONES DE CONFIGURACIÓN ==========
export const recalcularCuotasPendientes = async (id_contrato) => {
  try {
    const response = await api.post(`/api/cuotas/recalcular/${id_contrato}`);
    return response.data;
  } catch (error) {
    console.error('Error recalculando cuotas:', error);
    throw error;
  }
};

export const getConfiguracionMora = async () => {
  try {
    const response = await api.get('/api/configuracion/activa');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo configuración mora:', error);
    return { porcentaje_mora: 2 }; // Valor por defecto
  }
};

// ========== APIS ADICIONALES ==========
export const registrarCuota = async (cuotaData) => {
  try {
    const response = await api.post('/api/cuotas', cuotaData);
    return response.data;
  } catch (error) {
    console.error('Error registrando cuota:', error);
    throw error;
  }
};

export const getCuotasPagadas = async (cedula_emprendedor) => {
  try {
    const response = await api.get(`/api/cuotas/pagadas/${cedula_emprendedor}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo cuotas pagadas:', error);
    throw error;
  }
};

export default {
  // Emprendedor
  getContratoPorCedula,
  getCuotasPendientesEmprendedor,
  getHistorialPagosEmprendedor,
  
  // Administrador
  getContratos,
  getCuotasPorContrato,
  getEstadisticasDashboard,
  
  // Pagos
  registrarPagoManual,
  confirmarPagoIFEMI,
  rechazarPagoIFEMI,
  
  // Configuración
  recalcularCuotasPendientes,
  getConfiguracionMora,
  
  // Adicionales
  registrarCuota,
  getCuotasPagadas
};