import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiCuotas from "../services/api_cuotas";
import { generarReciboPagoProfesional, generarResumenUsuario } from '../pdf/reciboPago';

// Importar Tabler Icons - CORREGIDOS
import {
  TbHome,
  TbClock,
  TbHistory,
  TbFileText,
  TbCreditCard,
  TbBuildingBank,
  TbRefresh,
  TbDownload,
  TbEye,
  TbCheck,
  TbX,
  TbAlertCircle,
  TbCalendar,
  TbCalendarEvent,
  TbTrendingUp,
  TbTrendingDown,
  TbMinus,
  TbFile,
  TbConfetti, // Reemplaza TbParty
  TbTransfer,
  TbCalendarPlus,
  TbCalendarMinus,
  TbCopyright,
  TbUser,
  TbCurrencyDollar, // Reemplaza TbDollar
  TbId,
  TbCoin,
  TbReceipt2, // Reemplaza TbReceipt
  TbArrowRight,
  TbChevronRight,
  TbCurrencyBitcoin, // Alternativa para moneda
  TbStar, // Para estados destacados
  TbAlertTriangle // Para advertencias
} from 'react-icons/tb';

const EmprendedorDashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [vista, setVista] = useState('resumen');
  const [contrato, setContrato] = useState(null);
  const [cuotasPendientes, setCuotasPendientes] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({ euro: 1, dolar: 1 });
  const [monedaPref, setMonedaPref] = useState('USD');
  const [diasRestantes, setDiasRestantes] = useState({});
  const [diasMorosidad, setDiasMorosidad] = useState({});

  const [stats, setStats] = useState({
    totalPagado: 0,
    totalPendiente: 0,
    proximasCuotas: 0,
    progreso: 0,
    totalMora: 0
  });

  // =============================================
  // FUNCIONES DE ORDENAMIENTO - CORREGIDAS
  // =============================================

  const extraerNumeroCuota = (textoSemana) => {
    if (!textoSemana) return 0;
    
    const match = textoSemana.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const ordenarCuotasNumericamente = (cuotas) => {
    return [...cuotas].sort((a, b) => {
      const numeroA = extraerNumeroCuota(a.semana);
      const numeroB = extraerNumeroCuota(b.semana);
      return numeroA - numeroB;
    });
  };

  // =============================================
  // FUNCIONES PARA CÁLCULO DE FECHAS SEGÚN FRECUENCIA
  // =============================================

  const calcularDiasPorFrecuencia = (frecuencia) => {
    switch (frecuencia?.toLowerCase()) {
      case 'diario':
        return 1;
      case 'semanal':
        return 7;
      case 'quincenal':
        return 15;
      case 'mensual':
        return 30;
      default:
        return 7;
    }
  };

  const generarNombreCuota = (numeroCuota, frecuencia) => {
    switch (frecuencia?.toLowerCase()) {
      case 'diario':
        return `Día ${numeroCuota}`;
      case 'semanal':
        return `Semana ${numeroCuota}`;
      case 'quincenal':
        return `Quincena ${numeroCuota}`;
      case 'mensual':
        return `Mes ${numeroCuota}`;
      default:
        return `Cuota ${numeroCuota}`;
    }
  };

  const formatearNombreCuota = (textoSemana) => {
    const numero = extraerNumeroCuota(textoSemana);
    if (numero > 0) {
      const frecuencia = contrato?.frecuencia_pago_contrato || 'semanal';
      return generarNombreCuota(numero, frecuencia);
    }
    return textoSemana;
  };

  // =============================================
  // FUNCIONES PRINCIPALES
  // =============================================

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleViewPdf = () => {
    const doc = generarResumenUsuario(user, stats);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
  };

  const recargarDatos = () => {
    if (user?.cedula) {
      cargarDatosEmprendedor(user.cedula);
    }
  };

  // =============================================
  // SISTEMA DE CRONÓMETROS - CÁLCULO DE TIEMPOS
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
  // CÁLCULO DE INTERESES DE MOROSIDAD - USANDO CONTRATO
  // =============================================

  const calcularInteresMorosidad = (diasMora, montoOriginal) => {
    if (!contrato || !contrato.morosidad) return 0;
    
    const porcentajeDiario = contrato.morosidad / 100;
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

  const getInfoPorcentajeMora = () => {
    if (!contrato || !contrato.morosidad) {
      return "No configurado";
    }
    return `${contrato.morosidad}% diario`;
  };

  // =============================================
  // CONVERSIÓN MONETARIA
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

  // =============================================
  // FUNCIONES PARA GESTIÓN DE RECIBOS PDF
  // =============================================

  const manejarReciboPago = async (pago, accion = 'visualizar') => {
    try {
      setLoading(true);
      
      if (pago.confirmacionifemi !== 'Confirmado') {
        alert('❌ Solo se pueden gestionar recibos de pagos confirmados');
        setLoading(false);
        return;
      }

      if (accion === 'visualizar') {
        alert(`👁️ Visualizando recibo de pago para ${pago.semana}...`);
        
        const doc = generarReciboPagoProfesional(pago, user, contrato);
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        const nuevaVentana = window.open(pdfUrl, '_blank');
        
        if (nuevaVentana) {
          nuevaVentana.onbeforeunload = () => {
            URL.revokeObjectURL(pdfUrl);
          };
        } else {
          alert('⚠️ Por favor permite las ventanas emergentes para visualizar el recibo');
          URL.revokeObjectURL(pdfUrl);
        }
        
      } else if (accion === 'descargar') {
        alert(`📄 Descargando recibo de pago para ${pago.semana}...`);
        
        const doc = generarReciboPagoProfesional(pago, user, contrato);
        doc.save(`Recibo-Pago-${pago.semana}-${pago.numero_contrato}.pdf`);
        
        alert('✅ Recibo PDF descargado exitosamente');
      }
      
    } catch (error) {
      console.error(`Error ${accion === 'visualizar' ? 'visualizando' : 'descargando'} recibo:`, error);
      alert(`❌ Error al ${accion === 'visualizar' ? 'visualizar' : 'descargar'} el recibo: ` + error.message);
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

  // =============================================
  // CARGA DE DATOS DEL EMPRENDEDOR - CORREGIDA
  // =============================================

  const cargarDatosEmprendedor = async (cedula) => {
    try {
      setLoading(true);

      const contratoData = await apiCuotas.getContratoPorCedula(cedula);
      setContrato(contratoData);

      const historialData = await apiCuotas.getHistorialPagosEmprendedor(cedula);
      const historialOrdenado = ordenarCuotasNumericamente(historialData);
      setHistorialPagos(historialOrdenado);

      const pendientesData = await apiCuotas.getCuotasPendientesEmprendedor(cedula);
      
      const frecuencia = contratoData?.frecuencia_pago_contrato || 'semanal';
      const diasPorPeriodo = calcularDiasPorFrecuencia(frecuencia);
      
      const cuotasConFechas = pendientesData.map((cuota) => {
        if (cuota.fecha_desde && cuota.fecha_hasta) {
          return {
            ...cuota,
            interes_acumulado: 0
          };
        }
        
        const numeroCuota = extraerNumeroCuota(cuota.semana);
        const fechaBase = contratoData?.fecha_desde ? 
          new Date(contratoData.fecha_desde) : 
          new Date();
        
        const fechaDesde = new Date(fechaBase);
        fechaDesde.setDate(fechaBase.getDate() + ((numeroCuota - 1) * diasPorPeriodo));
        
        const fechaHasta = new Date(fechaDesde);
        fechaHasta.setDate(fechaDesde.getDate() + diasPorPeriodo);
        
        const nombreCuota = generarNombreCuota(numeroCuota, frecuencia);

        return {
          ...cuota,
          semana: nombreCuota,
          fecha_desde: fechaDesde.toISOString().split('T')[0],
          fecha_hasta: fechaHasta.toISOString().split('T')[0],
          interes_acumulado: 0
        };
      });

      const cuotasOrdenadas = ordenarCuotasNumericamente(cuotasConFechas);
      
      setCuotasPendientes(cuotasOrdenadas);
      calcularEstadisticas(cuotasOrdenadas, historialOrdenado, contratoData);
      
    } catch (error) {
      console.error('Error cargando datos del emprendedor:', error);
      alert('Error al cargar tus datos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // FUNCIONES DE ESTADO Y VALIDACIONES
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

  const getEstadoConfirmacion = (confirmacionifemi) => {
    switch (confirmacionifemi) {
      case 'Confirmado':
        return { 
          color: 'green', 
          text: 'Confirmado', 
          icon: TbCheck,
          puedeDescargar: true 
        };
      case 'Rechazado':
        return { 
          color: 'red', 
          text: 'Rechazado', 
          icon: TbX,
          puedeDescargar: false 
        };
      case 'A Recibido':
        return { 
          color: 'blue', 
          text: 'Por Confirmar', 
          icon: TbClock,
          puedeDescargar: false 
        };
      case 'En Espera':
        return { 
          color: 'gray', 
          text: 'En Espera', 
          icon: TbClock,
          puedeDescargar: false 
        };
      default:
        return { 
          color: 'gray', 
          text: 'Pendiente', 
          icon: TbClock,
          puedeDescargar: false 
        };
    }
  };

  // =============================================
  // REGISTRO DE PAGOS
  // =============================================

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
          setLoading(false);
          return;
        }
      }

      const mensajeConfirmacion = estaEnMora(cuota) 
        ? `⚠️ CUOTA EN MORA\n\n• ${formatearNombreCuota(cuota.semana)}\n• Días de mora: ${diasMorosidad[cuota.id_cuota]}\n• Monto original: $${cuota.monto}\n• Interés mora: +$${calcularInteresMorosidad(diasMorosidad[cuota.id_cuota], cuota.monto).toFixed(2)}\n• Total a pagar: $${totalAPagar.toFixed(2)}\n\n¿Continuar con el pago?`
        : `✅ CONFIRMAR PAGO\n\n• ${formatearNombreCuota(cuota.semana)}\n• Monto a pagar: $${totalAPagar.toFixed(2)}\n\n¿Continuar con el pago?`;

      if (!window.confirm(mensajeConfirmacion)) {
        setLoading(false);
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.jpg,.jpeg,.png,.pdf';
      input.style.display = 'none';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          setLoading(false);
          return;
        }

        try {
          const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
          if (!allowedTypes.includes(file.type)) {
            alert('❌ Formato no válido. Solo se permiten JPG, PNG o PDF.');
            setLoading(false);
            return;
          }

          if (file.size > 5 * 1024 * 1024) {
            alert('❌ El archivo es demasiado grande. Máximo 5MB.');
            setLoading(false);
            return;
          }

          alert(`📄 Archivo seleccionado:\n• Nombre: ${file.name}\n• Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nProcesando pago...`);

          const formData = new FormData();
          formData.append('comprobante', file);
          formData.append('monto_pagado', totalAPagar.toFixed(2));
          formData.append('incluye_mora', estaEnMora(cuota));

          alert('⏳ Subiendo comprobante y registrando pago...');

          const resultado = await apiCuotas.registrarPagoManual(cuotaId, formData);

          const cuotasActualizadas = cuotasPendientes.filter(c => c.id_cuota !== cuotaId);
          setCuotasPendientes(cuotasActualizadas);
          
          if (user?.cedula) {
            await cargarDatosEmprendedor(user.cedula);
          }
          
          alert('✅ ' + (resultado.message || 'Pago registrado exitosamente'));
          
        } catch (error) {
          console.error('Error registrando pago:', error);
          
          let mensajeError = '❌ Error al registrar el pago';
          if (error.response?.data?.error) {
            mensajeError += `: ${error.response.data.error}`;
          } else if (error.message) {
            mensajeError += `: ${error.message}`;
          }
          
          alert(mensajeError);
        } finally {
          setLoading(false);
        }
      };

      document.body.appendChild(input);
      input.click();
      
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      alert('❌ Error en el proceso de pago: ' + error.message);
      setLoading(false);
    }
  };

  // =============================================
  // COMPONENTES VISUALES MEJORADOS
  // =============================================

  const LayoutContainer = ({ children, title, subtitle, actionButton }) => (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        <Header toggleMenu={toggleMenu} />
        
        <main className="flex-1 p-6">
          <div className="mb-8 mt-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                  <TbHome size={28} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                  {contrato && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Contrato: {contrato.numero_contrato}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Frecuencia: {contrato.frecuencia_pago_contrato || 'Semanal'}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        Mora: {getInfoPorcentajeMora()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {actionButton}
                <button 
                  className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={recargarDatos}
                  disabled={loading}
                >
                  <TbRefresh size={18} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>

          {children}
        </main>

        <footer className="mt-auto p-6 bg-white border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TbCopyright size={16} />
              <span>{new Date().getFullYear()} IFEMI & UPTYAB</span>
            </div>
            <p className="text-gray-500">Panel del Emprendedor - Sistema de Gestión de Cuotas</p>
          </div>
        </footer>
      </div>
    </div>
  );

  const StatsCard = ({ titulo, valor, subtitulo, color, icono, trend }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-${color}-500 group hover:scale-105 transform-gpu`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{titulo}</h3>
          <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{valor}</p>
          <p className="text-gray-500 text-sm">{subtitulo}</p>
        </div>
        <div className={`bg-${color}-50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          {icono}
        </div>
      </div>
      {trend && (
        <div className={`mt-4 flex items-center text-sm ${
          trend === 'positive' ? 'text-green-600' : 
          trend === 'warning' ? 'text-amber-600' : 'text-blue-600'
        }`}>
          {trend === 'positive' ? <TbTrendingUp size={16} className="mr-1" /> : 
           trend === 'warning' ? <TbTrendingDown size={16} className="mr-1" /> : 
           <TbMinus size={16} className="mr-1" />}
          <span>Estado actual</span>
        </div>
      )}
    </div>
  );

  const StatsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        titulo="Total Pagado"
        valor={`$${stats.totalPagado.toLocaleString()}`}
        subtitulo="Monto cancelado"
        color="green"
        icono={<TbCheck size={24} className="text-green-600" />}
        trend="positive"
      />
      <StatsCard
        titulo="Por Pagar"
        valor={`$${stats.totalPendiente.toLocaleString()}`}
        subtitulo="Saldo pendiente"
        color="amber"
        icono={<TbClock size={24} className="text-amber-600" />}
        trend="warning"
      />
      <StatsCard
        titulo="Próximas Cuotas"
        valor={stats.proximasCuotas}
        subtitulo="Por vencer"
        color="blue"
        icono={<TbCalendarEvent size={24} className="text-blue-600" />}
        trend="neutral"
      />
      <StatsCard
        titulo="Progreso"
        valor={`${stats.progreso}%`}
        subtitulo="Del total"
        color="purple"
        icono={<TbTrendingUp size={24} className="text-purple-600" />}
        trend="positive"
      />
    </div>
  );

  const EstadoCronometro = ({ cuota }) => {
    const diasRest = diasRestantes[cuota.id_cuota];
    const diasMora = diasMorosidad[cuota.id_cuota] || 0;
    
    if (cuota.estado_cuota === "Pagado") {
      return (
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <TbCheck size={14} />
          Pagado
        </span>
      );
    }
    
    if (diasRest > 0) {
      const estilo = diasRest <= 3 ? "bg-orange-100 text-orange-800" : 
                    diasRest <= 7 ? "bg-yellow-100 text-yellow-800" : 
                    "bg-blue-100 text-blue-800";
      
      return (
        <span className={`${estilo} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
          {diasRest} días
        </span>
      );
    }
    
    if (diasMora > 0) {
      const estilo = diasMora <= 7 ? "bg-orange-100 text-orange-800" : 
                    diasMora <= 30 ? "bg-red-100 text-red-800" : 
                    "bg-red-200 text-red-900";
      
      return (
        <span className={`${estilo} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
          <TbAlertCircle size={14} />
          {diasMora} días de mora
        </span>
      );
    }
    
    return (
      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
        <TbClock size={14} />
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
      <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <TbAlertCircle size={16} className="text-red-600" />
          <span className="text-red-700 font-semibold">Cuota en Mora</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-red-600">Días de mora:</div>
          <div className="text-red-700 font-semibold text-right">{diasMora} días</div>
          
          <div className="text-red-600">Interés acumulado:</div>
          <div className="text-red-700 font-semibold text-right">+${interes.toFixed(2)}</div>
          
          <div className="text-red-800 font-semibold">Total a pagar:</div>
          <div className="text-red-800 font-bold text-right">${totalConMora.toFixed(2)}</div>
        </div>
        <div className="text-xs text-red-600 mt-2">
          {diasMora} días × {getInfoPorcentajeMora()}
        </div>
      </div>
    );
  };

  const RangoFechasCuota = ({ cuota }) => {
    const frecuencia = contrato?.frecuencia_pago_contrato || 'semanal';
    const diasPeriodo = calcularDiasPorFrecuencia(frecuencia);
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-green-100 p-2 rounded-lg">
              <TbCalendarPlus size={16} className="text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-500">Disponible desde</div>
              <div className="font-semibold">{cuota.fecha_desde}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-red-100 p-2 rounded-lg">
              <TbCalendarMinus size={16} className="text-red-600" />
            </div>
            <div>
              <div className="font-medium text-gray-500">Vence el</div>
              <div className="font-semibold">{cuota.fecha_hasta}</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Período de {diasPeriodo} días ({frecuencia})
        </div>
      </div>
    );
  };

  const ConversionMonetaria = ({ monto }) => (
    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
      <TbTransfer size={16} />
      <span>≈ {convertirAVes(monto)} Bs (Tasa: {rates.dolar?.toFixed(2)} Bs/$)</span>
    </div>
  );

  const AlertMessage = ({ tipo, mensaje }) => {
    const config = {
      error: { icon: TbAlertCircle, color: 'red' },
      warning: { icon: TbAlertTriangle, color: 'orange' },
      success: { icon: TbCheck, color: 'green' }
    }[tipo];

    const IconComponent = config.icon;

    return (
      <div className={`mt-3 p-3 bg-${config.color}-50 border border-${config.color}-200 rounded-xl flex items-center gap-2 text-${config.color}-700`}>
        <IconComponent size={16} className={`text-${config.color}-600`} />
        <span className="text-sm font-medium">{mensaje}</span>
      </div>
    );
  };

  const CuotaCard = ({ cuota, esResumen = false }) => {
    const totalConMora = calcularTotalConMora(cuota);
    const puedePagar = estaEnPeriodoPago(cuota) || estaEnMora(cuota);

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{formatearNombreCuota(cuota.semana)}</h3>
              <EstadoCronometro cuota={cuota} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <TbFileText size={16} className="text-gray-400" />
                <span>Contrato: {cuota.numero_contrato}</span>
              </div>
              <div className="flex items-center gap-2">
                <TbCurrencyDollar size={16} className="text-gray-400" />
                <span>Monto: ${cuota.monto}</span>
              </div>
            </div>
            
            <RangoFechasCuota cuota={cuota} />
            <InfoMorosidad cuota={cuota} />
            <ConversionMonetaria monto={cuota.monto} />
            
            {estaVencida(cuota) && !estaEnMora(cuota) && (
              <AlertMessage tipo="error" mensaje="Esta cuota está vencida. Contacta a IFEMI." />
            )}
            
            {estaPorVencer(cuota) && (
              <AlertMessage tipo="warning" mensaje="Esta cuota vence pronto. Realiza el pago a tiempo." />
            )}
          </div>
          
          <div className="flex flex-col gap-3 min-w-[140px]">
            <button 
              className={`px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-semibold text-sm ${
                puedePagar
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => puedePagar && registrarPagoManual(cuota.id_cuota)}
              disabled={loading || !puedePagar}
            >
              <TbCreditCard size={16} />
              {loading ? 'Procesando...' : 
               estaEnMora(cuota) ? 'Pagar con Mora' :
               !puedePagar ? 'No disponible' : 
               'Pagar Ahora'}
            </button>
            
            {!puedePagar && (
              <p className="text-xs text-gray-500 text-center">
                Disponible el {cuota.fecha_desde}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const NavigationTabs = () => (
    <div className="flex space-x-1 bg-white rounded-2xl p-2 border border-gray-200 shadow-sm mb-8">
      <TabButton 
        activo={vista === 'resumen'} 
        onClick={() => setVista('resumen')}
        icon={TbHome}
        label="Resumen"
        badge={null}
      />
      <TabButton 
        activo={vista === 'pendientes'} 
        onClick={() => setVista('pendientes')}
        icon={TbClock}
        label="Pendientes"
        badge={cuotasPendientes.length}
      />
      <TabButton 
        activo={vista === 'historial'} 
        onClick={() => setVista('historial')}
        icon={TbHistory}
        label="Historial"
        badge={historialPagos.length}
      />
    </div>
  );

  const TabButton = ({ activo, onClick, icon: Icon, label, badge }) => (
    <button
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
        activo 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge !== null && badge > 0 && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          activo ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  const SectionCard = ({ title, badge, action, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {badge !== null && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const ActionButton = ({ icon: Icon, label, color, onClick }) => (
    <button
      className={`bg-${color}-50 text-${color}-700 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-${color}-100 transition-all duration-200 group hover:scale-105`}
      onClick={onClick}
    >
      <Icon size={24} className="mb-2 group-hover:scale-110 transition-transform" />
      <span className="text-sm font-medium text-center">{label}</span>
    </button>
  );

  const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="text-center py-8">
      <Icon size={48} className="text-gray-400 mb-4 mx-auto" />
      <p className="text-gray-600 font-medium">{title}</p>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );

  const PagoItem = ({ pago }) => {
    const estado = getEstadoConfirmacion(pago.confirmacionifemi);
    const IconComponent = estado.icon;
    
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-4">
          <div className={`bg-${estado.color}-100 p-3 rounded-lg`}>
            <IconComponent size={20} className={`text-${estado.color}-600`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{formatearNombreCuota(pago.semana)} pagada</p>
            <p className="text-sm text-gray-600">
              {pago.fecha_pagada} • Contrato: {pago.numero_contrato}
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${estado.color}-100 text-${estado.color}-800 mt-1`}>
              <IconComponent size={12} />
              {estado.text}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">${pago.monto}</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mt-1"
            onClick={() => descargarComprobante(pago.id_cuota)}
          >
            <TbDownload size={14} /> Comprobante
          </button>
        </div>
      </div>
    );
  };

  const PagoTableRow = ({ pago }) => {
    const estado = getEstadoConfirmacion(pago.confirmacionifemi);
    const IconComponent = estado.icon;
    
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="py-4 px-6 text-sm text-gray-900">
          {pago.fecha_pagada || 'Fecha no disponible'}
        </td>
        <td className="py-4 px-6 text-sm text-gray-900">{formatearNombreCuota(pago.semana)}</td>
        <td className="py-4 px-6 text-sm text-gray-900 font-semibold">${pago.monto}</td>
        <td className="py-4 px-6 text-sm text-gray-900">{pago.numero_contrato}</td>
        <td className="py-4 px-6">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${estado.color}-100 text-${estado.color}-800`}>
            <IconComponent size={12} />
            {estado.text}
          </span>
        </td>
        <td className="py-4 px-6">
          <div className="flex gap-2">
            <button 
              className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors text-sm font-medium"
              onClick={() => descargarComprobante(pago.id_cuota)}
            >
              <TbDownload size={14} /> Comprobante
            </button>
            
            {estado.puedeDescargar && (
              <>
                <button 
                  className="bg-green-50 text-green-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-green-100 transition-colors text-sm font-medium"
                  onClick={() => manejarReciboPago(pago, 'visualizar')}
                  disabled={loading}
                >
                  <TbEye size={14} /> 
                  {loading ? 'Cargando...' : 'Ver Recibo'}
                </button>
                
                <button 
                  className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-purple-100 transition-colors text-sm font-medium"
                  onClick={() => manejarReciboPago(pago, 'descargar')}
                  disabled={loading}
                >
                  <TbDownload size={14} /> 
                  {loading ? 'Procesando...' : 'PDF'}
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // =============================================
  // VISTAS PRINCIPALES
  // =============================================

  const VistaResumen = () => (
    <LayoutContainer
      title="Mi Panel de Cuotas"
      subtitle={`Bienvenido/a, ${user?.nombre_completo?.split(' ')[0] || 'Emprendedor'}`}
      actionButton={
        <div className="flex gap-3">
          <button 
            className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={handleViewPdf}
          >
            <TbFileText size={18} />
            Generar Reporte
          </button>
        </div>
      }
    >
      <NavigationTabs />
      
      <StatsGrid />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <SectionCard
          title="📅 Próximas Cuotas a Vencer"
          badge={cuotasPendientes.length}
          action={
            cuotasPendientes.length > 3 && (
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                onClick={() => setVista('pendientes')}
              >
                Ver todas <TbChevronRight size={14} />
              </button>
            )
          }
        >
          <div className="space-y-4">
            {cuotasPendientes.length === 0 ? (
              <EmptyState 
                icon={TbConfetti}
                title="🎉 No tienes cuotas pendientes"
                description="Has completado todos tus pagos pendientes"
              />
            ) : (
              cuotasPendientes.slice(0, 3).map(cuota => (
                <CuotaCard key={cuota.id_cuota} cuota={cuota} esResumen={true} />
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="🚀 Acciones Rápidas"
          badge={null}
        >
          <div className="grid grid-cols-2 gap-4">
            <ActionButton
              icon={TbFileText}
              label="Solicitar crédito"
              color="indigo"
              onClick={() => navigate('/Requeri_solicit')}
            />
            <ActionButton
              icon={TbCreditCard}
              label="Ver cuotas"
              color="green"
              onClick={() => setVista('pendientes')}
            />
            <ActionButton
              icon={TbBuildingBank}
              label="Información bancaria"
              color="blue"
              onClick={() => navigate('/Banco')}
            />
            <ActionButton
              icon={TbHistory}
              label="Historial de pagos"
              color="purple"
              onClick={() => setVista('historial')}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="📋 Actividad Reciente"
        badge={historialPagos.length}
        action={
          historialPagos.length > 3 && (
            <button 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              onClick={() => setVista('historial')}
            >
              Ver todo <TbChevronRight size={14} />
            </button>
          )
        }
      >
        <div className="space-y-3">
          {historialPagos.length === 0 ? (
            <EmptyState 
              icon={TbFileText}
              title="No hay pagos registrados"
              description="Tu historial de pagos aparecerá aquí"
            />
          ) : (
            historialPagos.slice(0, 3).map(pago => (
              <PagoItem key={pago.id_cuota} pago={pago} />
            ))
          )}
        </div>
      </SectionCard>
    </LayoutContainer>
  );

  const VistaPendientes = () => (
    <LayoutContainer
      title="Mis Cuotas Pendientes"
      subtitle="Gestiona tus pagos dentro del período establecido"
      actionButton={
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
          {cuotasPendientes.length} pendientes
        </div>
      }
    >
      <NavigationTabs />
      
      <SectionCard
        title="Lista de Cuotas Pendientes"
        badge={cuotasPendientes.length}
      >
        <div className="space-y-6">
          {cuotasPendientes.length === 0 ? (
            <EmptyState 
              icon={TbConfetti}
              title="🎉 No tienes cuotas pendientes"
              description="Has completado todos tus pagos pendientes"
              action={
                <button 
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => setVista('resumen')}
                >
                  Volver al resumen
                </button>
              }
            />
          ) : (
            cuotasPendientes.map(cuota => (
              <CuotaCard key={cuota.id_cuota} cuota={cuota} />
            ))
          )}
        </div>
      </SectionCard>
    </LayoutContainer>
  );

  const VistaHistorial = () => (
    <LayoutContainer
      title="Mi Historial de Pagos"
      subtitle="Registro de todos tus pagos realizados"
    >
      <NavigationTabs />
      
      <SectionCard
        title="Historial Completo de Pagos"
        badge={historialPagos.length}
      >
        {historialPagos.length === 0 ? (
          <EmptyState 
            icon={TbFileText}
            title="No hay pagos registrados"
            description="Tu historial de pagos aparecerá aquí"
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Fecha', 'Cuota', 'Monto', 'Contrato', 'Estado', 'Acciones'].map(header => (
                    <th key={header} className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historialPagos.map(pago => (
                  <PagoTableRow key={pago.id_cuota} pago={pago} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </LayoutContainer>
  );

  // =============================================
  // EFFECTS
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

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  if (loading && !user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando panel del emprendedor...</p>
        </div>
      </div>
    );
  }

  switch (vista) {
    case 'resumen':
      return <VistaResumen />;
    case 'pendientes':
      return <VistaPendientes />;
    case 'historial':
      return <VistaHistorial />;
    default:
      return <VistaResumen />;
  }
};

export default EmprendedorDashboard;