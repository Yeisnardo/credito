import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiCuotas from "../services/api_cuotas"; // Importar las APIs reales

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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
          
          // Cargar datos REALES desde las APIs
          cargarDatosReales();
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Cargar datos REALES desde las APIs
  const cargarDatosReales = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas del dashboard
      const estadisticas = await apiCuotas.getEstadisticasDashboard();
      setStats({
        totalContratos: estadisticas.totalContratos,
        emprendedoresActivos: estadisticas.emprendedoresActivos,
        cuotasPendientes: estadisticas.cuotasPendientes,
        totalRecaudado: estadisticas.totalRecaudado
      });

      // Cargar todos los contratos
      const contratosData = await apiCuotas.getContratos();
      setContratos(contratosData);
      
    } catch (error) {
      console.error('Error cargando datos reales:', error);
      alert('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Cargar cuotas de un contrato específico
  const cargarCuotasContrato = async (id_contrato) => {
    try {
      setLoading(true);
      
      // Buscar el contrato seleccionado
      const contrato = contratos.find(c => c.id_contrato === id_contrato);
      if (!contrato) {
        alert('Contrato no encontrado');
        return;
      }

      // Cargar cuotas REALES del contrato
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

  // Registrar pago manual (USANDO API REAL)
  const registrarPagoManual = async (id_cuota, metodoPago) => {
    try {
      setLoading(true);
      
      const resultado = await apiCuotas.registrarPagoManual(id_cuota, {
        metodo_pago: metodoPago,
        referencia_pago: `MANUAL-${Date.now()}`
      });

      // Actualizar la lista de cuotas localmente
      const cuotasActualizadas = cuotasContrato.map(cuota => 
        cuota.id_cuota === id_cuota 
          ? { ...cuota, ...resultado.cuota }
          : cuota
      );
      
      setCuotasContrato(cuotasActualizadas);
      alert('✅ ' + resultado.message);
      
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('❌ Error al registrar el pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Recalcular cuotas pendientes (USANDO API REAL)
  const recalcularCuotas = async () => {
    if (!contratoSeleccionado) return;

    try {
      setLoading(true);
      
      // Pedir configuración al usuario
      const nuevaFrecuencia = prompt('Ingrese la nueva frecuencia (mensual, quincenal, semanal):', 'mensual');
      const nuevoTotalCuotas = prompt('Ingrese el nuevo total de cuotas:', '6');
      
      if (!nuevaFrecuencia || !nuevoTotalCuotas) {
        alert('Se requieren ambos valores para el recálculo');
        return;
      }

      const resultado = await apiCuotas.recalcularCuotasPendientes(
        contratoSeleccionado.id_contrato, 
        {
          nueva_frecuencia: nuevaFrecuencia,
          nuevo_total_cuotas: nuevoTotalCuotas
        }
      );

      alert('✅ ' + resultado.message);
      
      // Recargar las cuotas actualizadas
      await cargarCuotasContrato(contratoSeleccionado.id_contrato);
      
    } catch (error) {
      console.error('Error recalculando cuotas:', error);
      alert('❌ Error al recalcular: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generar reporte (puedes expandir esta función)
  const generarReporte = async (contratoId) => {
    try {
      const contrato = contratos.find(c => c.id_contrato === contratoId);
      if (!contrato) return;

      const cuotasData = await apiCuotas.getCuotasPorContrato(contratoId);
      const cuotasPagadas = cuotasData.filter(c => c.estado_cuota === 'Pagado').length;
      const totalCuotas = cuotasData.length;
      
      alert(`📊 Reporte de ${contrato.numero_contrato}\nCuotas pagadas: ${cuotasPagadas}/${totalCuotas}\nEmprendedor: ${contrato.cedula_emprendedor}`);
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  // Vista: Lista de Contratos
  if (vista === 'contratos') {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        {menuOpen && <Menu />}

        <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
          <Header toggleMenu={toggleMenu} />
          
          <main className="flex-1 p-6 bg-gray-50">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                  <i className="bx bx-file-alt text-3xl text-indigo-600"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Gestión de Contratos</h1>
                  <p className="text-gray-600">Administra los contratos y cuotas de los emprendedores</p>
                </div>
              </div>
              
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
            </div>

            {/* Tarjetas de resumen */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Contratos */}
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

              {/* Emprendedores Activos */}
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

              {/* Cuotas Pendientes */}
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

              {/* Total Recaudado */}
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

            {/* Lista de Contratos */}
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
                            onClick={() => cargarCuotasContrato(contrato.id_contrato)}
                            disabled={loading}
                          >
                            <i className="bx bx-show mr-1"></i> Ver Cuotas
                          </button>
                          <button 
                            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors text-sm"
                            onClick={() => generarReporte(contrato.id_contrato)}
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
          </main>

          <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} IFEMI & UPTYAB. Panel de Administración
          </footer>
        </div>
      </div>
    );
  }

  // Vista: Detalle de Cuotas
  if (vista === 'detalle' && contratoSeleccionado) {
    const cuotasPagadas = cuotasContrato.filter(c => c.estado_cuota === 'Pagado');
    const cuotasPendientes = cuotasContrato.filter(c => c.estado_cuota === 'Pendiente');
    
    // Calcular total pagado
    const totalPagado = cuotasPagadas.reduce((sum, c) => {
      return sum + parseFloat(c.monto || 0);
    }, 0);
    
    const montoTotal = parseFloat(contratoSeleccionado.monto_devolver || 0);

    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        {menuOpen && <Menu />}

        <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
          <Header toggleMenu={toggleMenu} />
          
          <main className="flex-1 p-6 bg-gray-50">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <button 
                  className="bg-white p-2 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer"
                  onClick={() => setVista('contratos')}
                  disabled={loading}
                >
                  <i className="bx bx-arrow-back text-xl text-indigo-600"></i>
                </button>
                <div className="bg-white p-3 rounded-full shadow-md">
                  <i className="bx bx-credit-card text-2xl text-indigo-600"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Cuotas de {contratoSeleccionado.cedula_emprendedor}
                  </h1>
                  <p className="text-gray-600">Contrato: {contratoSeleccionado.numero_contrato}</p>
                </div>
              </div>
              
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
            </div>

            {/* Resumen del Contrato */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Contrato</h2>
                    <p className="text-2xl font-bold text-indigo-600">${montoTotal}</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <i className="bx bx-file text-xl text-indigo-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Pagado</h2>
                    <p className="text-2xl font-bold text-green-600">${totalPagado.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <i className="bx bx-check-circle text-xl text-green-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Pendiente</h2>
                    <p className="text-2xl font-bold text-amber-600">${(montoTotal - totalPagado).toFixed(2)}</p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-full">
                    <i className="bx bx-time text-xl text-amber-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Progreso</h2>
                    <p className="text-2xl font-bold text-purple-600">{cuotasPagadas.length}/{cuotasContrato.length}</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <i className="bx bx-trending-up text-xl text-purple-600"></i>
                  </div>
                </div>
              </div>
            </section>

            {/* Lista de Cuotas */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Detalle de Cuotas {loading && <span className="text-sm text-gray-500">(Cargando...)</span>}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Semana</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Monto</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha Pago</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuotasContrato.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-600">
                          No hay cuotas registradas para este contrato
                        </td>
                      </tr>
                    ) : (
                      cuotasContrato.map(cuota => (
                        <tr key={cuota.id_cuota} className="border-b border-gray-100 hover:bg-gray-50">
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
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {cuota.fecha_pagada 
                              ? cuota.fecha_pagada
                              : '-'
                            }
                          </td>
                          <td className="py-3 px-4">
                            {cuota.estado_cuota === 'Pendiente' && (
                              <button
                                className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-700 transition-colors text-sm"
                                onClick={() => registrarPagoManual(cuota.id_cuota, 'transferencia')}
                                disabled={loading}
                              >
                                <i className="bx bx-check mr-1"></i> Pagar
                              </button>
                            )}
                            {cuota.estado_cuota === 'Pagado' && (
                              <span className="text-green-600 text-sm flex items-center">
                                <i className="bx bx-check-circle mr-1"></i> Pagada
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} IFEMI & UPTYAB. Gestión de Cuotas
          </footer>
        </div>
      </div>
    );
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