import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiCuotas from "../services/api_cuotas";
import apiConfiguracion from "../services/api_configuracion_contratos";

// Componente de Tarjetas de Estadísticas
const StatsCards = ({ stats }) => (
  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-indigo-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Contratos</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalContratos}</p>
          <p className="text-gray-500 text-sm">Contratos registrados</p>
        </div>
        <div className="bg-indigo-100 p-2 rounded-full">
          <i className="bx bx-file text-2xl text-indigo-600"></i>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-green-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Emprendedores Activos</h2>
          <p className="text-3xl font-bold text-green-600">{stats.emprendedoresActivos}</p>
          <p className="text-gray-500 text-sm">Con contratos activos</p>
        </div>
        <div className="bg-green-100 p-2 rounded-full">
          <i className="bx bx-user-check text-2xl text-green-600"></i>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-amber-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Cuotas Pendientes</h2>
          <p className="text-3xl font-bold text-amber-600">{stats.cuotasPendientes}</p>
          <p className="text-gray-500 text-sm">Por cobrar</p>
        </div>
        <div className="bg-amber-100 p-2 rounded-full">
          <i className="bx bx-time text-2xl text-amber-600"></i>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-purple-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Recaudado</h2>
          <p className="text-3xl font-bold text-purple-600">${stats.totalRecaudado.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">Monto total</p>
        </div>
        <div className="bg-purple-100 p-2 rounded-full">
          <i className="bx bx-dollar-circle text-2xl text-purple-600"></i>
        </div>
      </div>
    </div>
  </section>
);

// Componente de Lista de Contratos
const ContratosList = ({ contratos, loading, onVerCuotas, onGenerarReporte, onRefresh }) => (
  <section className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Contratos Activos {loading && <span className="text-sm text-gray-500">(Cargando...)</span>}
      </h2>
      <div className="flex space-x-3">
        <button className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-lg flex items-center hover:bg-gray-50 transition-colors text-sm">
          <i className="bx bx-search mr-1"></i> Buscar
        </button>
        <button className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-lg flex items-center hover:bg-gray-50 transition-colors text-sm">
          <i className="bx bx-sort mr-1"></i> Ordenar
        </button>
      </div>
    </div>

    <div className="space-y-4">
      {contratos.length === 0 ? (
        <div className="text-center py-8">
          <i className="bx bx-file text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">No hay contratos activos</p>
        </div>
      ) : (
        contratos.map(contrato => (
          <div key={contrato.id_contrato} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {contrato.cedula_emprendedor} - {contrato.numero_contrato}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contrato.estatus === 'aceptado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contrato.estatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="bx bx-calendar mr-2"></i>
                    Desde: {new Date(contrato.fecha_desde).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <i className="bx bx-dollar mr-2"></i>
                    Monto: ${contrato.monto_devolver}
                  </div>
                  <div className="flex items-center">
                    <i className="bx bx-calendar mr-2"></i>
                    Hasta: {new Date(contrato.fecha_hasta).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors text-sm"
                  onClick={() => onVerCuotas(contrato.id_contrato)}
                  disabled={loading}
                >
                  <i className="bx bx-show mr-1"></i> Ver Cuotas
                </button>
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors text-sm"
                  onClick={() => onGenerarReporte(contrato.id_contrato)}
                >
                  <i className="bx bx-bar-chart-alt mr-1"></i> Reporte
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);

// Componente de Tabla de Confirmación de Pagos
const ConfirmacionPagosTable = ({ cuotasPorConfirmar, loading, onConfirmarPago, onRechazarPago }) => {
  if (cuotasPorConfirmar.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <i className="bx bx-time-five text-xl text-blue-600"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Pagos por Confirmar</h3>
            <p className="text-blue-600 text-sm">
              {cuotasPorConfirmar.length} pago(s) esperando confirmación
            </p>
          </div>
        </div>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {cuotasPorConfirmar.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-blue-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Semana</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Monto</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Fecha Pago</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuotasPorConfirmar.map(cuota => (
              <tr key={cuota.id_cuota} className="border-b border-blue-100 hover:bg-blue-100">
                <td className="py-3 px-4 text-sm text-blue-800">{cuota.semana}</td>
                <td className="py-3 px-4 text-sm text-blue-800">${cuota.monto}</td>
                <td className="py-3 px-4 text-sm text-blue-800">
                  {cuota.fecha_pagada ? cuota.fecha_pagada : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-700 transition-colors text-sm"
                      onClick={() => onConfirmarPago(cuota.id_cuota)}
                      disabled={loading}
                    >
                      <i className="bx bx-check mr-1"></i> Confirmar
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-red-700 transition-colors text-sm"
                      onClick={() => onRechazarPago(cuota.id_cuota)}
                      disabled={loading}
                    >
                      <i className="bx bx-x mr-1"></i> Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente de Tabla de Cuotas CON BOTONES DE CONFIRMACIÓN MEJORADOS
const CuotasTable = ({ cuotasContrato, loading, onConfirmarPago, onRechazarPago }) => {
  // Filtrar cuotas por confirmar (estado "A Recibido")
  const cuotasPorConfirmar = cuotasContrato.filter(cuota => 
    cuota.estado_cuota === 'Pagado' && cuota.confirmacionifemi === 'A Recibido'
  );

  return (
    <div>
      {/* Tabla de Confirmación de Pagos */}
      <ConfirmacionPagosTable
        cuotasPorConfirmar={cuotasPorConfirmar}
        loading={loading}
        onConfirmarPago={onConfirmarPago}
        onRechazarPago={onRechazarPago}
      />

      {/* Tabla Principal de Todas las Cuotas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Todas las Cuotas</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Confirmado</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Por Confirmar</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span>Pendiente</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Semana</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Monto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Estado Pago</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Confirmación IFEMI</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha Pago</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuotasContrato.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-600">
                    No hay cuotas registradas para este contrato
                  </td>
                </tr>
              ) : (
                cuotasContrato.map(cuota => (
                  <tr 
                    key={cuota.id_cuota} 
                    className={`
                      border-b border-gray-100 hover:bg-gray-50
                      ${cuota.confirmacionifemi === 'Confirmado' ? 'bg-green-50' : ''}
                      ${cuota.confirmacionifemi === 'Rechazado' ? 'bg-red-50' : ''}
                      ${cuota.confirmacionifemi === 'A Recibido' ? 'bg-blue-50' : ''}
                    `}
                  >
                    <td className="py-3 px-4 text-sm text-gray-800">{cuota.semana}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">${cuota.monto}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cuota.estado_cuota === 'Pagado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cuota.estado_cuota}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cuota.confirmacionifemi === 'Confirmado' 
                          ? 'bg-green-100 text-green-800'
                          : cuota.confirmacionifemi === 'A Recibido'
                          ? 'bg-blue-100 text-blue-800'
                          : cuota.confirmacionifemi === 'Rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cuota.confirmacionifemi || 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {cuota.fecha_pagada ? cuota.fecha_pagada : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {/* BOTONES DE CONFIRMACIÓN MEJORADOS */}
                      {cuota.estado_cuota === 'Pagado' && cuota.confirmacionifemi === 'A Recibido' && (
                        <div className="flex space-x-2">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-700 transition-colors text-sm"
                            onClick={() => onConfirmarPago(cuota.id_cuota)}
                            disabled={loading}
                          >
                            <i className="bx bx-check mr-1"></i> Confirmar
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-red-700 transition-colors text-sm"
                            onClick={() => onRechazarPago(cuota.id_cuota)}
                            disabled={loading}
                          >
                            <i className="bx bx-x mr-1"></i> Rechazar
                          </button>
                        </div>
                      )}
                      
                      {/* BOTÓN DE CONFIRMACIÓN ADICIONAL PARA CUOTAS PAGADAS SIN CONFIRMACIÓN */}
                      {cuota.estado_cuota === 'Pagado' && (!cuota.confirmacionifemi || cuota.confirmacionifemi === 'En Espera') && (
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-blue-700 transition-colors text-sm"
                          onClick={() => onConfirmarPago(cuota.id_cuota)}
                          disabled={loading}
                        >
                          <i className="bx bx-check-double mr-1"></i> Confirmar Pago
                        </button>
                      )}
                      
                      {/* ESTADO CONFIRMADO */}
                      {cuota.confirmacionifemi === 'Confirmado' && (
                        <span className="text-green-600 text-sm flex items-center">
                          <i className="bx bx-check-circle mr-1"></i> Confirmado
                        </span>
                      )}
                      
                      {/* ESTADO RECHAZADO */}
                      {cuota.confirmacionifemi === 'Rechazado' && (
                        <span className="text-red-600 text-sm flex items-center">
                          <i className="bx bx-x-circle mr-1"></i> Rechazado
                        </span>
                      )}
                      
                      {/* CUOTAS PENDIENTES DE PAGO */}
                      {cuota.estado_cuota === 'Pendiente' && (
                        <span className="text-amber-600 text-sm flex items-center">
                          <i className="bx bx-time mr-1"></i> Pendiente de pago
                        </span>
                      )}
                      
                      {/* CUOTAS PAGADAS PERO SIN CONFIRMACIÓN (En Espera) */}
                      {cuota.estado_cuota === 'Pagado' && (!cuota.confirmacionifemi || cuota.confirmacionifemi === 'En Espera') && (
                        <span className="text-blue-600 text-sm flex items-center">
                          <i className="bx bx-time-five mr-1"></i> Por confirmar
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente Principal AdminDashboard
const AdminDashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [cuotasContrato, setCuotasContrato] = useState([]);
  const [vista, setVista] = useState('contratos');
  const [stats, setStats] = useState({
    totalContratos: 0,
    emprendedoresActivos: 0,
    cuotasPendientes: 0,
    totalRecaudado: 0
  });
  const [loading, setLoading] = useState(false);
  const [configuracion, setConfiguracion] = useState(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Efectos
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem('cedula_usuario');
        if (cedula) {
          const usuario = {
            nombre_completo: "Administrador Principal",
            rol: "Administrador",
            estatus: "Activo"
          };
          setUserState(usuario);
          if (setUser) setUser(usuario);
          
          await cargarDatosReales();
          await cargarConfiguracion();
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Funciones principales
  const cargarDatosReales = async () => {
    try {
      setLoading(true);
      
      const estadisticas = await apiCuotas.getEstadisticasDashboard();
      setStats({
        totalContratos: estadisticas.totalContratos,
        emprendedoresActivos: estadisticas.emprendedoresActivos,
        cuotasPendientes: estadisticas.cuotasPendientes,
        totalRecaudado: estadisticas.totalRecaudado
      });

      const contratosData = await apiCuotas.getContratos();
      setContratos(contratosData);
      
    } catch (error) {
      console.error('Error cargando datos reales:', error);
      alert('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const cargarConfiguracion = async () => {
    try {
      const config = await apiConfiguracion.getConfiguracionActiva();
      setConfiguracion(config);
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setConfiguracion({
        frecuencia_pago: 'mensual',
        numero_cuotas: '6',
        cuotasGracia: '0',
        porcentaje_interes: '0',
        porcentaje_mora: '0'
      });
    }
  };

  const cargarCuotasContrato = async (id_contrato) => {
    try {
      setLoading(true);
      
      const contrato = contratos.find(c => c.id_contrato === id_contrato);
      if (!contrato) {
        alert('Contrato no encontrado');
        return;
      }

      const cuotasData = await apiCuotas.getCuotasPorContrato(id_contrato);
      setCuotasContrato(cuotasData);
      setContratoSeleccionado(contrato);
      setVista('detalle');
      
    } catch (error) {
      console.error('Error cargando cuotas:', error);
      alert('Error al cargar las cuotas del contrato');
    } finally {
      setLoading(false);
    }
  };

  // Función para CONFIRMAR pago
  const confirmarPago = async (id_cuota) => {
    try {
      setLoading(true);
      
      const confirmar = window.confirm('¿Está seguro de confirmar este pago?');
      if (!confirmar) {
        setLoading(false);
        return;
      }
      
      const resultado = await apiCuotas.confirmarPagoIFEMI(id_cuota);
      
      // Actualizar el estado local
      const cuotasActualizadas = cuotasContrato.map(cuota => 
        cuota.id_cuota === id_cuota 
          ? { ...cuota, confirmacionifemi: 'Confirmado' }
          : cuota
      );
      
      setCuotasContrato(cuotasActualizadas);
      alert('✅ Pago confirmado exitosamente');
      
    } catch (error) {
      console.error('Error confirmando pago:', error);
      alert('❌ Error al confirmar el pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para RECHAZAR pago
  const rechazarPago = async (id_cuota) => {
    try {
      setLoading(true);
      
      const motivo = prompt('Ingrese el motivo del rechazo:');
      if (!motivo) {
        setLoading(false);
        return;
      }
      
      const confirmar = window.confirm('¿Está seguro de rechazar este pago?');
      if (!confirmar) {
        setLoading(false);
        return;
      }
      
      const resultado = await apiCuotas.rechazarPagoIFEMI(id_cuota, motivo);
      
      // Actualizar el estado local
      const cuotasActualizadas = cuotasContrato.map(cuota => 
        cuota.id_cuota === id_cuota 
          ? { 
              ...cuota, 
              confirmacionifemi: 'Rechazado',
              estado_cuota: 'Pendiente',
              fecha_pagada: null
            }
          : cuota
      );
      
      setCuotasContrato(cuotasActualizadas);
      alert('✅ Pago rechazado exitosamente');
      
    } catch (error) {
      console.error('Error rechazando pago:', error);
      alert('❌ Error al rechazar el pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const recalcularCuotas = async () => {
    if (!contratoSeleccionado) return;

    try {
      setLoading(true);
      
      if (!configuracion) {
        alert('No hay configuración disponible');
        setLoading(false);
        return;
      }
      
      const confirmar = window.confirm(
        `¿Está seguro de recalcular las cuotas pendientes?\n\n` +
        `Configuración que se aplicará:\n` +
        `• Frecuencia: ${configuracion.frecuencia_pago}\n` +
        `• Total de cuotas: ${configuracion.numero_cuotas}\n` +
        `• Cuotas de gracia: ${configuracion.cuotasGracia || 0}\n\n` +
        `Esta acción eliminará todas las cuotas pendientes y las recreará según la configuración actual.`
      );

      if (!confirmar) {
        setLoading(false);
        return;
      }

      const resultado = await apiCuotas.recalcularCuotasPendientes(
        contratoSeleccionado.id_contrato
      );

      alert('✅ ' + resultado.message);
      await cargarCuotasContrato(contratoSeleccionado.id_contrato);
      
    } catch (error) {
      console.error('Error recalculando cuotas:', error);
      alert('❌ Error al recalcular: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async (contratoId) => {
    try {
      const contrato = contratos.find(c => c.id_contrato === contratoId);
      if (!contrato) return;

      const cuotasData = await apiCuotas.getCuotasPorContrato(contratoId);
      const cuotasPagadas = cuotasData.filter(c => c.estado_cuota === 'Pagado').length;
      const cuotasConfirmadas = cuotasData.filter(c => c.confirmacionifemi === 'Confirmado').length;
      const totalCuotas = cuotasData.length;
      
      alert(`📊 Reporte de ${contrato.numero_contrato}\n
        Cuotas pagadas: ${cuotasPagadas}/${totalCuotas}\n
        Cuotas confirmadas: ${cuotasConfirmadas}\n
        Emprendedor: ${contrato.cedula_emprendedor}`);
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  // Header común para ambas vistas
  const HeaderSection = ({ title, subtitle, showBackButton = false, children }) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        {showBackButton && (
          <button 
            className="bg-white p-2 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer"
            onClick={() => setVista('contratos')}
            disabled={loading}
          >
            <i className="bx bx-arrow-back text-xl text-indigo-600"></i>
          </button>
        )}
        <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
          <i className={`bx ${showBackButton ? 'bx-credit-card' : 'bx-file-alt'} text-2xl text-indigo-600`}></i>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );

  // Footer común
  const Footer = ({ text = "Panel de Administración" }) => (
    <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
      © {new Date().getFullYear()} IFEMI & UPTYAB. {text}
    </footer>
  );

  // Renderizado condicional de vistas
  const renderVistaContratos = () => (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        <Header toggleMenu={toggleMenu} />
        
        <main className="flex-1 p-6 bg-gray-50">
          <HeaderSection
            title="Gestión de Contratos"
            subtitle="Administra los contratos y cuotas de los emprendedores"
          >
            <div className="flex space-x-3">
              <button 
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
                onClick={cargarDatosReales}
                disabled={loading}
              >
                <i className="bx bx-refresh mr-2"></i> 
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
                <i className="bx bx-plus mr-2"></i> Nuevo Contrato
              </button>
            </div>
          </HeaderSection>

          <StatsCards stats={stats} />
          <ContratosList 
            contratos={contratos}
            loading={loading}
            onVerCuotas={cargarCuotasContrato}
            onGenerarReporte={generarReporte}
            onRefresh={cargarDatosReales}
          />
        </main>

        <Footer />
      </div>
    </div>
  );

  const renderVistaDetalle = () => {
    if (!contratoSeleccionado) return null;

    const cuotasPagadas = cuotasContrato.filter(c => c.estado_cuota === 'Pagado');
    const cuotasConfirmadas = cuotasContrato.filter(c => c.confirmacionifemi === 'Confirmado');
    const cuotasPorConfirmar = cuotasContrato.filter(c => 
      c.estado_cuota === 'Pagado' && c.confirmacionifemi === 'A Recibido'
    );
    
    const totalPagado = cuotasPagadas.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0);
    const montoTotal = parseFloat(contratoSeleccionado.monto_devolver || 0);

    const contratoStats = [
      { label: "Total Contrato", value: `$${montoTotal}`, color: "indigo", icon: "bx-file" },
      { label: "Pagado", value: `$${totalPagado.toFixed(2)}`, color: "green", icon: "bx-check-circle" },
      { label: "Pendiente", value: `$${(montoTotal - totalPagado).toFixed(2)}`, color: "amber", icon: "bx-time" },
      { label: "Por Confirmar", value: `${cuotasPorConfirmar.length}`, color: "blue", icon: "bx-time-five" }
    ];

    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        {menuOpen && <Menu />}

        <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
          <Header toggleMenu={toggleMenu} />
          
          <main className="flex-1 p-6 bg-gray-50">
            <HeaderSection
              title={`Cuotas de ${contratoSeleccionado.cedula_emprendedor}`}
              subtitle={`Contrato: ${contratoSeleccionado.numero_contrato}`}
              showBackButton={true}
            >
              <div className="flex space-x-3">
                <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                  <i className="bx bx-download mr-2"></i> Exportar
                </button>
                <button 
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-amber-600 transition-colors"
                  onClick={recalcularCuotas}
                  disabled={loading}
                >
                  <i className="bx bx-refresh mr-2"></i> 
                  {loading ? 'Procesando...' : 'Recalcular'}
                </button>
              </div>
            </HeaderSection>

            {/* Resumen del Contrato */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {contratoStats.map((stat, index) => (
                <div key={index} className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-${stat.color}-500`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</h2>
                      <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                    <div className={`bg-${stat.color}-100 p-2 rounded-full`}>
                      <i className={`bx ${stat.icon} text-xl text-${stat.color}-600`}></i>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Lista de Cuotas */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Detalle de Cuotas {loading && <span className="text-sm text-gray-500">(Cargando...)</span>}
                </h2>
                {cuotasPorConfirmar.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {cuotasPorConfirmar.length} pagos por confirmar
                  </span>
                )}
              </div>
              
              <CuotasTable 
                cuotasContrato={cuotasContrato}
                loading={loading}
                onConfirmarPago={confirmarPago}
                onRechazarPago={rechazarPago}
              />
            </section>
          </main>

          <Footer text="Gestión de Cuotas" />
        </div>
      </div>
    );
  };

  // Renderizado principal
  if (vista === 'contratos') {
    return renderVistaContratos();
  }

  if (vista === 'detalle' && contratoSeleccionado) {
    return renderVistaDetalle();
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <i className="bx bx-loader-circle bx-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;