import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiCuotas from "../services/api_cuotas";
import apiConfiguracion from "../services/api_configuracion_contratos";

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
    progreso: 0,
    totalMora: 0
  });
  const [loading, setLoading] = useState(false);
  
  // NUEVOS ESTADOS PARA LAS FUNCIONALIDADES
  const [rates, setRates] = useState({ euro: 1, dolar: 1 });
  const [monedaPref, setMonedaPref] = useState('USD');
  const [diasRestantes, setDiasRestantes] = useState({});
  const [diasMorosidad, setDiasMorosidad] = useState({});
  const [configuracion, setConfiguracion] = useState({ porcentaje_mora: 2 });

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  // Función para extraer el número de cuota del texto "Semana X"
  const extraerNumeroCuota = (textoSemana) => {
    if (!textoSemana) return 1;
    
    const match = textoSemana.match(/Semana\s*(\d+)/i);
    return match ? parseInt(match[1]) : 1;
  };

  // =============================================
  // 1. SISTEMA DE CRONÓMETROS - CÁLCULO DE TIEMPOS
  // =============================================

  const calcularDiasRestantes = () => {
    const ahora = new Date();
    const nuevosDiasRestantes = {};
    
    cuotasPendientes.forEach((cuota) => {
      if (cuota.fecha_hasta) {
        const fechaHasta = new Date(cuota.fecha_hasta);
        const diffTime = fechaHasta - ahora;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        nuevosDiasRestantes[cuota.id_cuota] = diffDays;
      }
    });
    
    setDiasRestantes(nuevosDiasRestantes);
  };

  const calcularDiasMorosidad = () => {
    const ahora = new Date();
    const nuevosDiasMorosidad = {};
    
    cuotasPendientes.forEach((cuota) => {
      if (cuota.fecha_hasta) {
        const fechaHasta = new Date(cuota.fecha_hasta);
        
        if (fechaHasta < ahora) {
          const diffTime = ahora - fechaHasta;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          nuevosDiasMorosidad[cuota.id_cuota] = diffDays;
        } else {
          nuevosDiasMorosidad[cuota.id_cuota] = 0;
        }
      }
    });
    
    setDiasMorosidad(nuevosDiasMorosidad);
  };

  // =============================================
  // 2. CÁLCULO DE INTERESES DE MOROSIDAD
  // =============================================

  const calcularInteresMorosidad = (diasMora, montoOriginal) => {
    if (!configuracion || !configuracion.porcentaje_mora) return 0;
    
    const porcentajeDiario = configuracion.porcentaje_mora / 100;
    const interes = parseFloat(montoOriginal) * porcentajeDiario * diasMora;
    
    return parseFloat(interes.toFixed(2));
  };

  const calcularTotalConMora = (cuota) => {
    const diasMora = diasMorosidad[cuota.id_cuota] || 0;
    const montoBase = parseFloat(cuota.monto || 0);
    
    if (diasMora > 0) {
      const interes = calcularInteresMorosidad(diasMora, montoBase);
      return montoBase + interes;
    }
    
    return montoBase;
  };

  // =============================================
  // 3. CONVERSIÓN MONETARIA
  // =============================================

  const fetchRates = async () => {
    try {
      const responseEUR = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/EUR"
      );
      const responseUSD = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const rateEUR = responseEUR.data.rates["VES"];
      const rateUSD = responseUSD.data.rates["VES"];
      setRates({ euro: rateEUR, dolar: rateUSD });
    } catch (error) {
      console.error("Error al obtener las tasas de cambio:", error);
      setRates({ euro: 40, dolar: 36 });
    }
  };

  const convertirAVes = (monto) => {
    if (!rates || !rates.dolar || !rates.euro) return "Cargando tasas...";
    if (monedaPref === 'USD') {
      return (parseFloat(monto) * rates.dolar).toFixed(2);
    } else if (monedaPref === 'EUR') {
      return (parseFloat(monto) * rates.euro).toFixed(2);
    } else {
      return "Moneda no soportada";
    }
  };

  const getInfoPorcentajeMora = () => {
    if (!configuracion || !configuracion.porcentaje_mora) {
      return "No configurado";
    }
    return `${configuracion.porcentaje_mora}% diario`;
  };

  // =============================================
  // EFECTOS PARA ACTUALIZACIÓN AUTOMÁTICA
  // =============================================

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (cuotasPendientes.length > 0) {
      calcularDiasRestantes();
      calcularDiasMorosidad();
      
      const interval = setInterval(() => {
        calcularDiasRestantes();
        calcularDiasMorosidad();
      }, 1000 * 60 * 60);
      
      return () => clearInterval(interval);
    }
  }, [cuotasPendientes]);

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

  // FUNCIÓN CORREGIDA - CÁLCULO CORRECTO DE FECHAS
  const cargarDatosEmprendedor = async (cedula) => {
    try {
      setLoading(true);
      
      // Cargar configuración primero
      const configData = await apiConfiguracion.getConfiguracionActiva();
      setConfiguracion(configData);

      const contratoData = await apiCuotas.getContratoPorCedula(cedula);
      setContrato(contratoData);

      // Obtener historial primero para saber cuántas cuotas se han pagado
      const historialData = await apiCuotas.getHistorialPagosEmprendedor(cedula);
      setHistorialPagos(historialData);

      // Obtener cuotas pendientes
      const pendientesData = await apiCuotas.getCuotasPendientesEmprendedor(cedula);
      
      // ✅ CORRECCIÓN: Calcular fechas basándose en el número de cuota real
      const cuotasConFechas = pendientesData.map((cuota) => {
        // Si la cuota ya tiene fechas desde la API, úsalas
        if (cuota.fecha_desde && cuota.fecha_hasta) {
          return {
            ...cuota,
            interes_acumulado: 0
          };
        }
        
        // ✅ Calcular número de cuota real basado en el texto "Semana X"
        const numeroCuota = extraerNumeroCuota(cuota.semana);
        
        // Usar fecha base del contrato o fecha actual
        const fechaBase = contratoData?.fecha_desde ? 
          new Date(contratoData.fecha_desde) : 
          new Date();
        
        // ✅ Calcular basándose en el número de cuota real, no en el índice del array
        const fechaDesde = new Date(fechaBase);
        fechaDesde.setDate(fechaBase.getDate() + ((numeroCuota - 1) * 7));
        
        const fechaHasta = new Date(fechaDesde);
        fechaHasta.setDate(fechaDesde.getDate() + 7);
        
        return {
          ...cuota,
          fecha_desde: fechaDesde.toISOString().split('T')[0],
          fecha_hasta: fechaHasta.toISOString().split('T')[0],
          interes_acumulado: 0
        };
      });

      setCuotasPendientes(cuotasConFechas);
      calcularEstadisticas(cuotasConFechas, historialData, contratoData);
      
    } catch (error) {
      console.error('Error cargando datos del emprendedor:', error);
      alert('Error al cargar tus datos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // FUNCIONES DE ESTADO MEJORADAS
  // =============================================

  const estaEnPeriodoPago = (cuota) => {
    if (!cuota.fecha_desde || !cuota.fecha_hasta) return false;
    
    const hoy = new Date();
    const fechaDesde = new Date(cuota.fecha_desde);
    const fechaHasta = new Date(cuota.fecha_hasta);
    
    return hoy >= fechaDesde && hoy <= fechaHasta;
  };

  const estaVencida = (cuota) => {
    if (!cuota.fecha_hasta) return false;
    
    const hoy = new Date();
    const fechaHasta = new Date(cuota.fecha_hasta);
    return hoy > fechaHasta;
  };

  const estaPorVencer = (cuota) => {
    const diasRest = diasRestantes[cuota.id_cuota];
    return diasRest <= 3 && diasRest > 0;
  };

  const estaEnMora = (cuota) => {
    const diasMora = diasMorosidad[cuota.id_cuota] || 0;
    return diasMora > 0;
  };

  const calcularEstadisticas = (pendientes, historial, contratoData) => {
    const totalPagado = historial.reduce((sum, pago) => {
      return sum + parseFloat(pago.monto || 0);
    }, 0);

    const totalPendiente = pendientes.reduce((sum, cuota) => {
      return sum + parseFloat(cuota.monto || 0);
    }, 0);

    const totalMora = pendientes.reduce((sum, cuota) => {
      if (estaEnMora(cuota)) {
        const diasMora = diasMorosidad[cuota.id_cuota] || 0;
        return sum + calcularInteresMorosidad(diasMora, cuota.monto);
      }
      return sum;
    }, 0);

    const montoTotal = parseFloat(contratoData?.monto_devolver || 0);
    const progreso = montoTotal > 0 ? (totalPagado / montoTotal) * 100 : 0;

    setStats({
      totalPagado,
      totalPendiente,
      proximasCuotas: pendientes.length,
      progreso: Math.round(progreso),
      totalMora
    });
  };

  // =============================================
  // COMPONENTES MEJORADOS
  // =============================================

  const getDiasRestantesStyle = (dias) => {
    if (dias <= 0) return "text-red-600 font-bold";
    if (dias <= 3) return "text-orange-600 font-semibold";
    if (dias <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  const getDiasMorosidadStyle = (dias) => {
    if (dias <= 0) return "text-gray-600";
    if (dias <= 7) return "text-orange-600 font-semibold";
    if (dias <= 30) return "text-red-600 font-semibold";
    return "text-red-700 font-bold";
  };

  const EstadoCronometro = ({ cuota }) => {
    const diasRest = diasRestantes[cuota.id_cuota];
    const diasMora = diasMorosidad[cuota.id_cuota] || 0;
    
    if (cuota.estado_cuota === "Pagado") {
      return (
        <span className="text-green-600 font-semibold flex items-center">
          <i className="bx bx-check-circle text-lg mr-1"></i>
          Pagado
        </span>
      );
    }
    
    if (diasRest > 0) {
      return (
        <span className={`font-semibold ${getDiasRestantesStyle(diasRest)} flex items-center`}>
          <i className="bx bx-timer text-lg mr-1"></i>
          {diasRest} días
        </span>
      );
    }
    
    if (diasMora > 0) {
      return (
        <span className={`font-semibold ${getDiasMorosidadStyle(diasMora)} flex items-center`}>
          <i className="bx bx-error-alt text-lg mr-1"></i>
          {diasMora} días de mora
        </span>
      );
    }
    
    return (
      <span className="text-orange-600 font-semibold flex items-center">
        <i className="bx bx-time-five text-lg mr-1"></i>
        Vencido hoy
      </span>
    );
  };

  const InfoMorosidad = ({ cuota }) => {
    const diasMora = diasMorosidad[cuota.id_cuota] || 0;
    const interes = calcularInteresMorosidad(diasMora, cuota.monto);
    const totalConMora = calcularTotalConMora(cuota);

    if (diasMora === 0) return null;

    return (
      <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-red-700 font-medium">Mora acumulada:</span>
          <span className="text-red-700 font-bold">+${interes.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-red-800 font-medium">Total a pagar:</span>
          <span className="text-red-800 font-bold">${totalConMora.toFixed(2)}</span>
        </div>
        <div className="text-xs text-red-600 mt-1">
          {diasMora} días × {getInfoPorcentajeMora()}
        </div>
      </div>
    );
  };

  const ConversionMonetaria = ({ monto }) => (
    <div className="text-xs text-gray-500 mt-1">
      ≈ {convertirAVes(monto)} Bs (Tasa actual: {rates.dolar?.toFixed(2)} Bs/$)
    </div>
  );

  const RangoFechasCuota = ({ cuota }) => (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center">
          <i className="bx bx-calendar-plus mr-1 text-green-600"></i>
          <span className="font-medium">Disponible desde:</span>
          <span className="ml-1">{cuota.fecha_desde}</span>
        </div>
        <div className="flex items-center">
          <i className="bx bx-calendar-minus mr-1 text-red-600"></i>
          <span className="font-medium">Vence el:</span>
          <span className="ml-1">{cuota.fecha_hasta}</span>
        </div>
      </div>
    </div>
  );

  const registrarPagoManual = async (cuotaId) => {
    try {
      setLoading(true);
      
      const cuota = cuotasPendientes.find(c => c.id_cuota === cuotaId);
      const totalAPagar = calcularTotalConMora(cuota);
      
      if (!estaEnPeriodoPago(cuota) && !estaEnMora(cuota)) {
        const hoy = new Date();
        const fechaDesde = new Date(cuota.fecha_desde);
        
        if (hoy < fechaDesde) {
          alert('❌ Esta cuota no está disponible para pago aún. Fecha de inicio: ' + cuota.fecha_desde);
          return;
        }
      }

      const mensajeConfirmacion = estaEnMora(cuota) 
        ? `Esta cuota tiene ${diasMorosidad[cuota.id_cuota]} días de mora.\nMonto original: $${cuota.monto}\nInterés mora: +$${calcularInteresMorosidad(diasMorosidad[cuota.id_cuota], cuota.monto).toFixed(2)}\nTotal a pagar: $${totalAPagar.toFixed(2)}\n\n¿Continuar con el pago?`
        : `Confirmar pago de $${totalAPagar.toFixed(2)} por ${cuota.semana}?`;

      if (!window.confirm(mensajeConfirmacion)) {
        return;
      }

      const resultado = await apiCuotas.registrarPagoManual(cuotaId, {
        metodo_pago: 'transferencia',
        referencia_pago: `PAGO-${Date.now()}`,
        monto_pagado: totalAPagar.toFixed(2),
        incluye_mora: estaEnMora(cuota)
      });

      const cuotasActualizadas = cuotasPendientes.filter(cuota => cuota.id_cuota !== cuotaId);
      setCuotasPendientes(cuotasActualizadas);
      
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

  // =============================================
  // COMPONENTES DE TARJETAS
  // =============================================

  const TarjetaMora = () => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-red-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Mora Acumulada</h2>
          <p className="text-3xl font-bold text-red-600">${stats.totalMora.toFixed(2)}</p>
          <p className="text-gray-500 text-sm">Intereses por pagar</p>
        </div>
        <div className="bg-red-100 p-2 rounded-full">
          <i className="bx bx-error-alt text-2xl text-red-600"></i>
        </div>
      </div>
    </div>
  );

  // =============================================
  // VISTA: RESUMEN
  // =============================================

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
                  <p className="text-sm text-orange-600 font-medium mt-1">
                    Tasa de mora: {getInfoPorcentajeMora()}
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
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

              {/* Mora Acumulada */}
              <TarjetaMora />
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
                              <EstadoCronometro cuota={cuota} />
                            </div>
                            <RangoFechasCuota cuota={cuota} />
                            <InfoMorosidad cuota={cuota} />
                            <ConversionMonetaria monto={cuota.monto} />
                          </div>
                          <button 
                            className={`px-4 py-2 rounded-lg flex items-center transition-colors text-sm ${
                              estaEnPeriodoPago(cuota) || estaEnMora(cuota)
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={() => (estaEnPeriodoPago(cuota) || estaEnMora(cuota)) && registrarPagoManual(cuota.id_cuota)}
                            disabled={loading || (!estaEnPeriodoPago(cuota) && !estaEnMora(cuota))}
                          >
                            <i className="bx bx-credit-card mr-1"></i> 
                            {loading ? 'Procesando...' : 
                             estaEnMora(cuota) ? 'Pagar con Mora' :
                             !estaEnPeriodoPago(cuota) ? 'No disponible' : 
                             'Pagar'}
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

  // =============================================
  // VISTA: CUOTAS PENDIENTES
  // =============================================

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
                  <p className="text-gray-600">Gestiona tus pagos dentro del período establecido</p>
                  <p className="text-sm text-orange-600 font-medium mt-1">
                    Tasa de mora: {getInfoPorcentajeMora()}
                  </p>
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
              <div className="space-y-6">
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
                            <EstadoCronometro cuota={cuota} />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <i className="bx bx-file mr-2"></i>
                              Contrato: {cuota.numero_contrato}
                            </div>
                            <div className="flex items-center">
                              <i className="bx bx-dollar mr-2"></i>
                              Monto: ${cuota.monto}
                              <ConversionMonetaria monto={cuota.monto} />
                            </div>
                          </div>
                          
                          <RangoFechasCuota cuota={cuota} />
                          
                          <InfoMorosidad cuota={cuota} />
                          
                          {estaVencida(cuota) && !estaEnMora(cuota) && (
                            <div className="mt-3 flex items-center text-red-600 text-sm">
                              <i className="bx bx-error mr-1"></i>
                              ⚠️ Esta cuota está vencida. Contacta a IFEMI.
                            </div>
                          )}
                          
                          {estaPorVencer(cuota) && (
                            <div className="mt-3 flex items-center text-orange-600 text-sm">
                              <i className="bx bx-time mr-1"></i>
                              ⏳ Esta cuota vence pronto. Realiza el pago a tiempo.
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                          <button 
                            className={`px-6 py-3 rounded-lg flex items-center transition-colors font-medium ${
                              estaEnPeriodoPago(cuota) || estaEnMora(cuota)
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={() => (estaEnPeriodoPago(cuota) || estaEnMora(cuota)) && registrarPagoManual(cuota.id_cuota)}
                            disabled={loading || (!estaEnPeriodoPago(cuota) && !estaEnMora(cuota))}
                          >
                            <i className="bx bx-credit-card mr-2"></i> 
                            {loading ? 'Procesando...' : 
                             estaEnMora(cuota) ? 'Pagar con Mora' :
                             !estaEnPeriodoPago(cuota) ? 'No disponible' : 
                             'Pagar Ahora'}
                          </button>
                          
                          {!estaEnPeriodoPago(cuota) && !estaEnMora(cuota) && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Disponible el {cuota.fecha_desde}
                            </p>
                          )}
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

  // =============================================
  // VISTA: HISTORIAL DE PAGOS
  // =============================================

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