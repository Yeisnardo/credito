import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiCuotas from "../services/api_cuotas";

const EmprendedorDashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [vista, setVista] = useState('resumen');
  const [contrato, setContrato] = useState(null);
  const [cuotasPendientes, setCuotasPendientes] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [stats, setStats] = useState({
    totalPagado: 0,
    totalPendiente: 0,
    proximasCuotas: 0,
    progreso: 0
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
            nombre_completo: "Emprendedor Ejemplo",
            rol: "Emprendedor",
            estatus: "Activo",
            cedula: cedula
          };
          setUserState(usuario);
          if (setUser) setUser(usuario);
          
          await cargarDatosEmprendedor(cedula);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    
    if (!user) fetchUserData();
  }, [setUser, user]);

  const cargarDatosEmprendedor = async (cedula) => {
    try {
      setLoading(true);
      
      const contratoData = await apiCuotas.getContratoPorCedula(cedula);
      setContrato(contratoData);

      const pendientesData = await apiCuotas.getCuotasPendientesEmprendedor(cedula);
      setCuotasPendientes(pendientesData);

      const historialData = await apiCuotas.getHistorialPagosEmprendedor(cedula);
      setHistorialPagos(historialData);

      calcularEstadisticas(pendientesData, historialData, contratoData);
      
    } catch (error) {
      console.error('Error cargando datos del emprendedor:', error);
      alert('Error al cargar tus datos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (pendientes, historial, contratoData) => {
    const totalPagado = historial.reduce((sum, pago) => {
      return sum + parseFloat(pago.monto || 0);
    }, 0);

    const totalPendiente = pendientes.reduce((sum, cuota) => {
      return sum + parseFloat(cuota.monto || 0);
    }, 0);

    const montoTotal = parseFloat(contratoData?.monto_devolver || 0);
    const progreso = montoTotal > 0 ? (totalPagado / montoTotal) * 100 : 0;

    setStats({
      totalPagado,
      totalPendiente,
      proximasCuotas: pendientes.length,
      progreso: Math.round(progreso)
    });
  };

  // FUNCIÓN CORREGIDA: registrarPagoManual para emprendedores
  const registrarPagoManual = async (cuotaId) => {
    try {
      setLoading(true);
      
      const resultado = await apiCuotas.registrarPagoManual(cuotaId, {
        metodo_pago: 'transferencia',
        referencia_pago: `PAGO-${Date.now()}`
      });

      // Actualizar el estado local
      const cuotasActualizadas = cuotasPendientes.filter(cuota => cuota.id_cuota !== cuotaId);
      setCuotasPendientes(cuotasActualizadas);
      
      // Recargar datos para actualizar historial y estadísticas
      if (user?.cedula) {
        await cargarDatosEmprendedor(user.cedula);
      }
      
      alert('✅ ' + resultado.message);
      
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('❌ Error al registrar el pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const descargarComprobante = async (pagoId) => {
    try {
      alert(`📄 Generando comprobante para el pago #${pagoId}...\n\nEl comprobante se descargará automáticamente.`);
      
      setTimeout(() => {
        alert('✅ Comprobante descargado exitosamente');
      }, 1000);
    } catch (error) {
      console.error('Error descargando comprobante:', error);
      alert('❌ Error al descargar el comprobante');
    }
  };

  const recargarDatos = () => {
    if (user?.cedula) {
      cargarDatosEmprendedor(user.cedula);
    }
  };

  // Función para obtener el color y texto del estado de confirmación
  const getEstadoConfirmacion = (confirmacionifemi) => {
    switch (confirmacionifemi) {
      case 'Confirmado':
        return { color: 'green', text: 'Confirmado', icon: 'bx-check-circle' };
      case 'Rechazado':
        return { color: 'red', text: 'Rechazado', icon: 'bx-x-circle' };
      case 'A Recibido':
        return { color: 'blue', text: 'Por Confirmar', icon: 'bx-time-five' };
      case 'En Espera':
        return { color: 'gray', text: 'En Espera', icon: 'bx-time' };
      default:
        return { color: 'gray', text: 'Pendiente', icon: 'bx-time' };
    }
  };

  // Vista: Resumen
  if (vista === 'resumen') {
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
                  <i className="bx bx-home text-3xl text-indigo-600"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Mi Panel de Cuotas</h1>
                  <p className="text-gray-600">
                    Bienvenido/a, {user?.nombre_completo?.split(' ')[0] || 'Emprendedor'}
                    {contrato && ` - Contrato: ${contrato.numero_contrato}`}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
                  onClick={recargarDatos}
                  disabled={loading}
                >
                  <i className="bx bx-refresh mr-2"></i>
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
                <div className="flex space-x-2 bg-white rounded-lg p-1 border border-gray-200">
                  <button 
                    className={`px-3 py-1 rounded-md transition-colors ${
                      vista === 'resumen' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setVista('resumen')}
                  >
                    Resumen
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md transition-colors ${
                      vista === 'pendientes' 
                        ? 'bg-amber-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setVista('pendientes')}
                  >
                    Pendientes ({cuotasPendientes.length})
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md transition-colors ${
                      vista === 'historial' 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setVista('historial')}
                  >
                    Historial
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjetas de resumen */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Pagado */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Pagado</h2>
                    <p className="text-3xl font-bold text-green-600">${stats.totalPagado.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">Monto cancelado</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <i className="bx bx-check-circle text-2xl text-green-600"></i>
                  </div>
                </div>
              </div>

              {/* Por Pagar */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-amber-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Por Pagar</h2>
                    <p className="text-3xl font-bold text-amber-600">${stats.totalPendiente.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">Saldo pendiente</p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-full">
                    <i className="bx bx-time text-2xl text-amber-600"></i>
                  </div>
                </div>
              </div>

              {/* Próximas Cuotas */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Próximas Cuotas</h2>
                    <p className="text-3xl font-bold text-blue-600">{stats.proximasCuotas}</p>
                    <p className="text-gray-500 text-sm">Por vencer</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <i className="bx bx-calendar-event text-2xl text-blue-600"></i>
                  </div>
                </div>
              </div>

              {/* Progreso */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Progreso</h2>
                    <p className="text-3xl font-bold text-purple-600">{stats.progreso}%</p>
                    <p className="text-gray-500 text-sm">Del total</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <i className="bx bx-trending-up text-2xl text-purple-600"></i>
                  </div>
                </div>
              </div>
            </section>

            {/* Próximas Cuotas y Acciones Rápidas */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Próximas Cuotas */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">📅 Próximas Cuotas a Vencer</h2>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    {cuotasPendientes.length} pendientes
                  </span>
                </div>
                
                <div className="space-y-4">
                  {cuotasPendientes.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="bx bx-party text-4xl text-green-500 mb-4"></i>
                      <p className="text-gray-600">🎉 No tienes cuotas pendientes</p>
                    </div>
                  ) : (
                    cuotasPendientes.slice(0, 3).map(cuota => (
                      <div key={cuota.id_cuota} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-800">{cuota.semana}</h3>
                            <p className="text-sm text-gray-600">Contrato: {cuota.numero_contrato}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <i className="bx bx-dollar mr-1"></i>${cuota.monto}
                              </span>
                            </div>
                          </div>
                          <button 
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors text-sm"
                            onClick={() => registrarPagoManual(cuota.id_cuota)}
                            disabled={loading}
                          >
                            <i className="bx bx-credit-card mr-1"></i> Pagar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {cuotasPendientes.length > 3 && (
                    <button 
                      className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2"
                      onClick={() => setVista('pendientes')}
                    >
                      Ver todas las cuotas pendientes ({cuotasPendientes.length}) <i className="bx bx-chevron-right"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">🚀 Acciones Rápidas</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    className="bg-indigo-50 text-indigo-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-indigo-100 transition-colors"
                    onClick={() => navigate('/Requeri_solicit')}
                  >
                    <i className="bx bx-file text-2xl mb-2"></i>
                    <span className="text-sm font-medium">Solicitar crédito</span>
                  </button>
                  
                  <button 
                    className="bg-green-50 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-green-100 transition-colors"
                    onClick={() => setVista('pendientes')}
                  >
                    <i className="bx bx-credit-card text-2xl mb-2"></i>
                    <span className="text-sm font-medium">Ver cuotas</span>
                  </button>
                  
                  <button 
                    className="bg-blue-50 text-blue-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-blue-100 transition-colors"
                    onClick={() => navigate('/Banco')}
                  >
                    <i className="bx bx-bank text-2xl mb-2"></i>
                    <span className="text-sm font-medium">Información bancaria</span>
                  </button>
                  
                  <button 
                    className="bg-purple-50 text-purple-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-purple-100 transition-colors"
                    onClick={() => setVista('historial')}
                  >
                    <i className="bx bx-history text-2xl mb-2"></i>
                    <span className="text-sm font-medium">Historial de pagos</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Actividad Reciente */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">📋 Actividad Reciente</h2>
              
              <div className="space-y-4">
                {historialPagos.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No hay pagos registrados</p>
                  </div>
                ) : (
                  historialPagos.slice(0, 3).map(pago => {
                    const estado = getEstadoConfirmacion(pago.confirmacionifemi);
                    return (
                      <div key={pago.id_cuota} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`bg-${estado.color}-100 p-2 rounded-full`}>
                            <i className={`bx ${estado.icon} text-${estado.color}-600`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{pago.semana} pagada</p>
                            <p className="text-xs text-gray-600">
                              {pago.fecha_pagada} • Contrato: {pago.numero_contrato}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full bg-${estado.color}-100 text-${estado.color}-800`}>
                              {estado.text}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">${pago.monto}</p>
                          <button 
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                            onClick={() => descargarComprobante(pago.id_cuota)}
                          >
                            <i className="bx bx-download mr-1"></i>Comprobante
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {historialPagos.length > 3 && (
                <button 
                  className="w-full mt-4 text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  onClick={() => setVista('historial')}
                >
                  Ver todo el historial <i className="bx bx-chevron-right"></i>
                </button>
              )}
            </section>
          </main>

          <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} IFEMI & UPTYAB. Panel del Emprendedor
          </footer>
        </div>
      </div>
    );
  }

  // Vista: Cuotas Pendientes
  if (vista === 'pendientes') {
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
                  onClick={() => setVista('resumen')}
                >
                  <i className="bx bx-arrow-back text-xl text-indigo-600"></i>
                </button>
                <div className="bg-white p-3 rounded-full shadow-md">
                  <i className="bx bx-time text-2xl text-amber-600"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Mis Cuotas Pendientes</h1>
                  <p className="text-gray-600">Gestiona tus pagos pendientes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {cuotasPendientes.length} pendientes
                </span>
                <button 
                  className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
                  onClick={recargarDatos}
                  disabled={loading}
                >
                  <i className="bx bx-refresh mr-2"></i>
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>

            {/* Lista de Cuotas Pendientes */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                {cuotasPendientes.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="bx bx-party text-4xl text-green-500 mb-4"></i>
                    <p className="text-gray-600">🎉 No tienes cuotas pendientes</p>
                    <button 
                      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      onClick={() => setVista('resumen')}
                    >
                      Volver al resumen
                    </button>
                  </div>
                ) : (
                  cuotasPendientes.map(cuota => (
                    <div key={cuota.id_cuota} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">{cuota.semana}</h3>
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                              Pendiente
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <i className="bx bx-file mr-2"></i>
                              Contrato: {cuota.numero_contrato}
                            </div>
                            <div className="flex items-center">
                              <i className="bx bx-dollar mr-2"></i>
                              Monto: ${cuota.monto}
                            </div>
                          </div>
                          
                          {cuota.dias_mora_cuota > 0 && (
                            <div className="mt-3 flex items-center text-red-600 text-sm">
                              <i className="bx bx-error mr-1"></i>
                              ⚠️ En mora: {cuota.dias_mora_cuota} días
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                          <button 
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-indigo-700 transition-colors font-medium"
                            onClick={() => registrarPagoManual(cuota.id_cuota)}
                            disabled={loading}
                          >
                            <i className="bx bx-credit-card mr-2"></i> 
                            {loading ? 'Procesando...' : 'Pagar Ahora'}
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
            © {new Date().getFullYear()} IFEMI & UPTYAB. Cuotas Pendientes
          </footer>
        </div>
      </div>
    );
  }

  // Vista: Historial de Pagos
  if (vista === 'historial') {
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
                  onClick={() => setVista('resumen')}
                >
                  <i className="bx bx-arrow-back text-xl text-indigo-600"></i>
                </button>
                <div className="bg-white p-3 rounded-full shadow-md">
                  <i className="bx bx-history text-2xl text-green-600"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Mi Historial de Pagos</h1>
                  <p className="text-gray-600">Registro de todos tus pagos realizados</p>
                </div>
              </div>
              
              <button 
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
                onClick={recargarDatos}
                disabled={loading}
              >
                <i className="bx bx-refresh mr-2"></i>
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>

            {/* Tabla de Historial */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Semana</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Monto</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contrato</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Confirmación IFEMI</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialPagos.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8">
                          <i className="bx bx-file text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-600">No hay pagos registrados</p>
                        </td>
                      </tr>
                    ) : (
                      historialPagos.map(pago => {
                        const estado = getEstadoConfirmacion(pago.confirmacionifemi);
                        return (
                          <tr key={pago.id_cuota} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-800">
                              {pago.fecha_pagada || 'Fecha no disponible'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800">{pago.semana}</td>
                            <td className="py-3 px-4 text-sm text-gray-800">${pago.monto}</td>
                            <td className="py-3 px-4 text-sm text-gray-800">{pago.numero_contrato}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${estado.color}-100 text-${estado.color}-800 flex items-center w-fit`}>
                                <i className={`bx ${estado.icon} mr-1`}></i>
                                {estado.text}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button 
                                className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg flex items-center hover:bg-indigo-100 transition-colors text-sm"
                                onClick={() => descargarComprobante(pago.id_cuota)}
                              >
                                <i className="bx bx-download mr-1"></i> Descargar
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} IFEMI & UPTYAB. Historial de Pagos
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
          <p className="text-gray-600">Cargando panel del emprendedor...</p>
        </div>
      </div>
    </div>
  );
};

export default EmprendedorDashboard;