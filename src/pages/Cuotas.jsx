import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiConfig from "../services/api_configuracion_contratos";
import api, { getUsuarioPorCedula } from "../services/api_usuario";
import { getContratoPorId } from "../services/api_cuotas";

// Función auxiliar para generar cuotas (sin cambios)
const generarCuotas = (
  config,
  totalMonto = 0,
  startDate = new Date(),
  montoDevolver = 0
) => {
  const cuotasGeneradas = [];
  const { numero_cuotas, cuotasGracia, frecuencia_pago, dias_personalizados } =
    config;

  const cuotasObligatorias = parseInt(numero_cuotas);
  const cuotasNoObligatorias = parseInt(cuotasGracia);

  const montoPorCuota =
    montoDevolver > 0 ? montoDevolver / cuotasObligatorias : 0;

  const calcularFechas = (index) => {
    let diasIntervalo;
    switch (frecuencia_pago) {
      case "diario":
        diasIntervalo = index - 1;
        break;
      case "semanal":
        diasIntervalo = 7 * (index - 1);
        break;
      case "quincenal":
        diasIntervalo = 15 * (index - 1);
        break;
      case "mensual":
        diasIntervalo = 30 * (index - 1);
        break;
      case "personalizado":
        diasIntervalo = (dias_personalizados || 1) * (index - 1);
        break;
      default:
        diasIntervalo = 7 * (index - 1);
    }

    const fechaDesde = new Date(startDate);
    fechaDesde.setDate(fechaDesde.getDate() + diasIntervalo);

    const fechaHasta = new Date(fechaDesde);
    let duracionCuota;
    switch (frecuencia_pago) {
      case "diario":
        duracionCuota = 1;
        break;
      case "semanal":
        duracionCuota = 7;
        break;
      case "quincenal":
        duracionCuota = 15;
        break;
      case "mensual":
        duracionCuota = 30;
        break;
      case "personalizado":
        duracionCuota = dias_personalizados || 1;
        break;
      default:
        duracionCuota = 7;
    }
    fechaHasta.setDate(fechaDesde.getDate() + duracionCuota - 1);

    const formatoFecha = (date) => date.toISOString().split("T")[0];

    return {
      fecha_desde: formatoFecha(fechaDesde),
      fecha_hasta: formatoFecha(fechaHasta),
    };
  };

  // Generar cuotas obligatorias
  for (let i = 1; i <= cuotasObligatorias; i++) {
    const { fecha_desde, fecha_hasta } = calcularFechas(i);
    cuotasGeneradas.push({
      id_cuota: i,
      semana: `Cuota ${i}`,
      fecha_desde,
      fecha_hasta,
      monto: montoPorCuota.toFixed(2),
      monto_ves: (montoPorCuota * 0.54).toFixed(2),
      monto_morosidad: 0,
      fecha_pagada: null,
      estado_cuota: "Pendiente",
      dias_mora_cuota: 0,
      interes_acumulado: 0,
      confirmacionIFEMI: "No",
      comprobante: null,
    });
  }

  // Generar cuotas de gracia
  for (let j = 1; j <= cuotasNoObligatorias; j++) {
    const index = cuotasObligatorias + j;
    const { fecha_desde, fecha_hasta } = calcularFechas(index);
    cuotasGeneradas.push({
      id_cuota: index,
      semana: `Cuota ${index}`,
      fecha_desde,
      fecha_hasta,
      monto: "0.00",
      monto_ves: "0.00",
      monto_morosidad: 0,
      fecha_pagada: null,
      estado_cuota: "Pendiente",
      dias_mora_cuota: 0,
      interes_acumulado: 0,
      confirmacionIFEMI: "No",
      comprobante: null,
    });
  }

  return cuotasGeneradas;
};

const fetchContratoDatos = async (cedula) => {
  try {
    const resultado = await getContratoPorId(cedula);
    if (resultado.length > 0) {
      const contrato = resultado[0];
      const montoDevolver = contrato.monto_devolver;
      const fechaDesde = contrato.fecha_desde;
      const fechaHasta = contrato.fecha_hasta;
      return {
        montoDevolver,
        fechaDesde,
        fechaHasta,
      };
    } else {
      console.warn("No se encontró contrato para esa cédula.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener contrato:", error);
    return null;
  }
};

const Cuota = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);
  const [modalMorosidad, setModalMorosidad] = useState(false);
  const [cuotaMorosidad, setCuotaMorosidad] = useState(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState("");
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState({ euro: 1, dolar: 1 });
  const [monedaPref, setMonedaPref] = useState('USD');
  
  // Estados para los cronómetros
  const [diasRestantes, setDiasRestantes] = useState({});
  const [diasMorosidad, setDiasMorosidad] = useState({});

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Función para calcular días restantes hasta fecha_hasta
  const calcularDiasRestantes = () => {
    const ahora = new Date();
    const nuevosDiasRestantes = {};
    
    cuotas.forEach((cuota) => {
      const fechaHasta = new Date(cuota.fecha_hasta);
      const diffTime = fechaHasta - ahora;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nuevosDiasRestantes[cuota.id_cuota] = diffDays;
    });
    
    setDiasRestantes(nuevosDiasRestantes);
  };

  // Función para calcular días de morosidad (después de fecha_hasta)
  const calcularDiasMorosidad = () => {
    const ahora = new Date();
    const nuevosDiasMorosidad = {};
    
    cuotas.forEach((cuota) => {
      const fechaHasta = new Date(cuota.fecha_hasta);
      
      if (fechaHasta < ahora) {
        // La cuota está vencida, calcular días de mora
        const diffTime = ahora - fechaHasta;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        nuevosDiasMorosidad[cuota.id_cuota] = diffDays;
      } else {
        // La cuota no está vencida, no hay morosidad
        nuevosDiasMorosidad[cuota.id_cuota] = 0;
      }
    });
    
    setDiasMorosidad(nuevosDiasMorosidad);
  };

  // Función para actualizar estado de cuota y días de mora
  const actualizarEstadoCuota = (id, nuevoEstado, diasMora = null) => {
    setCuotas((prevCuotas) =>
      prevCuotas.map((c) =>
        c.id_cuota === id 
          ? { 
              ...c, 
              estado_cuota: nuevoEstado,
              dias_mora_cuota: diasMora !== null ? diasMora : c.dias_mora_cuota
            } 
          : c
      )
    );
  };

  // Función para calcular intereses de morosidad (puedes personalizar esta lógica)
  const calcularInteresMorosidad = (diasMora, montoOriginal) => {
    // Ejemplo: 1% de interés por día de mora
    const tasaInteresDiaria = 0.01;
    return (parseFloat(montoOriginal) * tasaInteresDiaria * diasMora).toFixed(2);
  };

  // Efecto principal para los cronómetros
  useEffect(() => {
    if (cuotas.length > 0) {
      // Primera carga
      calcularDiasRestantes();
      calcularDiasMorosidad();
      
      const interval = setInterval(() => {
        calcularDiasRestantes();
        calcularDiasMorosidad();
      }, 1000 * 60 * 60); // Actualizar cada hora
      
      return () => clearInterval(interval);
    }
  }, [cuotas]);

  // Efecto para manejar transición de cuotas Pendiente → Vencido → En Mora
  useEffect(() => {
    Object.keys(diasRestantes).forEach((idCuota) => {
      const id = parseInt(idCuota);
      const diffDays = diasRestantes[id];
      const diasMora = diasMorosidad[id] || 0;
      const cuota = cuotas.find(c => c.id_cuota === id);
      
      if (!cuota) return;

      // Si la cuota está pendiente y llegó a la fecha_hasta
      if (diffDays <= 0 && cuota.estado_cuota === "Pendiente") {
        actualizarEstadoCuota(id, "Vencido", 0);
      }
      
      // Si la cuota está vencida y comienza a acumular mora
      if (diasMora > 0 && cuota.estado_cuota === "Vencido") {
        actualizarEstadoCuota(id, "En Mora", diasMora);
        
        // Calcular y actualizar intereses de morosidad
        const interes = calcularInteresMorosidad(diasMora, cuota.monto);
        setCuotas(prev => prev.map(c => 
          c.id_cuota === id 
            ? { ...c, interes_acumulado: parseFloat(interes) } 
            : c
        ));
      }
      
      // Actualizar días de mora continuamente para cuotas en mora
      if (diasMora > 0 && cuota.estado_cuota === "En Mora") {
        actualizarEstadoCuota(id, "En Mora", diasMora);
        
        // Recalcular intereses
        const interes = calcularInteresMorosidad(diasMora, cuota.monto);
        setCuotas(prev => prev.map(c => 
          c.id_cuota === id 
            ? { ...c, interes_acumulado: parseFloat(interes) } 
            : c
        ));
      }
    });
  }, [diasRestantes, diasMorosidad, cuotas]);

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
    }
  };

  const fetchUser = async () => {
    const cedula = localStorage.getItem("cedula_usuario");
    if (!cedula) return;

    try {
      setLoading(true);
      const usuario = await getUsuarioPorCedula(cedula);
      if (usuario) {
        setUserState(usuario);
        if (setUser) setUser(usuario);

        const config = await apiConfig.getConfiguracion();
        if (config && config.moneda) {
          setMonedaPref(config.moneda);
          setConfiguracion(config);
          const contratoDatos = await fetchContratoDatos(cedula);

          if (contratoDatos) {
            const { montoDevolver, fechaDesde } = contratoDatos;
            const cuotasGeneradas = generarCuotas(
              config,
              0,
              new Date(fechaDesde),
              montoDevolver
            );
            setCuotas(cuotasGeneradas);
          } else {
            const cuotasGeneradas = generarCuotas(config, 0, new Date(), 0);
            setCuotas(cuotasGeneradas);
          }
        } else {
          const defaultConfig = {
            numero_cuotas: "5",
            cuotasGracia: "2",
            frecuencia_pago: "semanal",
          };
          setConfiguracion(defaultConfig);
          const cuotasGeneradas = generarCuotas(
            defaultConfig,
            0,
            new Date(),
            0
          );
          setCuotas(cuotasGeneradas);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarCuotasConMonto = (monto) => {
    if (configuracion && monto > 0) {
      const cuotasActualizadas = generarCuotas(
        configuracion,
        parseFloat(monto)
      );
      setCuotas(cuotasActualizadas);
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

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user]);

  const handlePagarCuota = (cuota) => {
    navigate(`/pago/${cuota.id_cuota}`);
  };

  const handleVerMorosidad = (cuota) => {
    setCuotaMorosidad(cuota);
    setModalMorosidad(true);
  };

  const closeModal = () => {
    setModalMorosidad(false);
    setCuotaMorosidad(null);
  };

  const aplicarMontoPersonalizado = () => {
    if (montoPersonalizado && parseFloat(montoPersonalizado) > 0) {
      actualizarCuotasConMonto(montoPersonalizado);
    }
  };

  // Estadísticas actualizadas
  const getEstadisticas = () => {
    const totalCuotas = cuotas.length;
    const pagadas = cuotas.filter((c) => c.estado_cuota === "Pagado").length;
    const pendientes = cuotas.filter(
      (c) => c.estado_cuota === "Pendiente"
    ).length;
    const vencidas = cuotas.filter((c) => c.estado_cuota === "Vencido").length;
    const enMora = cuotas.filter((c) => c.estado_cuota === "En Mora").length;
    const confirmadasIFEMI = cuotas.filter(
      (c) => c.confirmacionIFEMI === "Sí"
    ).length;
    const montoTotal = cuotas.reduce((sum, c) => sum + parseFloat(c.monto), 0);
    const montoPagado = cuotas
      .filter((c) => c.estado_cuota === "Pagado")
      .reduce((sum, c) => sum + parseFloat(c.monto), 0);
    const totalMora = cuotas
      .filter((c) => c.estado_cuota === "En Mora")
      .reduce((sum, c) => sum + parseFloat(c.interes_acumulado), 0);

    return {
      totalCuotas,
      pagadas,
      pendientes,
      vencidas,
      enMora,
      confirmadasIFEMI,
      montoTotal,
      montoPagado,
      totalMora,
    };
  };

  const estadisticas = getEstadisticas();

  const getEstadoBadge = (estado) => {
    const estilos = {
      Pagado: "bg-green-100 text-green-800 border-green-200",
      Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Vencido: "bg-orange-100 text-orange-800 border-orange-200",
      "En Mora": "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          estilos[estado] || "bg-gray-100 text-gray-800"
        }`}
      >
        {estado}
      </span>
    );
  };

  const getConfirmacionIFEMIBadge = (confirmacion) => {
    const estilos = {
      Sí: "bg-green-100 text-green-800 border-green-200",
      No: "bg-red-100 text-red-800 border-red-200",
      Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          estilos[confirmacion] || "bg-gray-100 text-gray-800"
        }`}
      >
        {confirmacion}
      </span>
    );
  };

  // Función para obtener el estilo del contador de días restantes
  const getDiasRestantesStyle = (dias) => {
    if (dias <= 0) return "text-red-600 font-bold";
    if (dias <= 3) return "text-orange-600 font-semibold";
    if (dias <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  // Función para obtener el estilo de los días de morosidad
  const getDiasMorosidadStyle = (dias) => {
    if (dias <= 0) return "text-gray-600";
    if (dias <= 7) return "text-orange-600 font-semibold";
    if (dias <= 30) return "text-red-600 font-semibold";
    return "text-red-700 font-bold";
  };

  // Función para mostrar el estado del cronómetro
  const renderEstadoCronometro = (cuota) => {
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Cargando información de cuotas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0 mt-12">
                <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                  <i className="bx bx-credit-card text-4xl text-indigo-600"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Gestión de Cuotas
                  </h1>
                  <p className="text-gray-600">
                    Bienvenido,{" "}
                    {user?.nombre_completo?.split(" ")[0] || "Usuario"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estadísticas Cards - Actualizada con ambos cronómetros */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {/* Total de cuotas */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Cuotas</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estadisticas.totalCuotas}
                  </p>
                </div>
                <i className="bx bx-list-check text-2xl text-indigo-500"></i>
              </div>
            </div>
            
            {/* Pendientes */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Pendientes</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estadisticas.pendientes}
                  </p>
                </div>
                <i className="bx bx-time text-2xl text-yellow-500"></i>
              </div>
            </div>
            
            {/* Vencidas */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Vencidas</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estadisticas.vencidas}
                  </p>
                </div>
                <i className="bx bx-time-five text-2xl text-orange-500"></i>
              </div>
            </div>
            
            {/* En Mora */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">En Mora</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estadisticas.enMora}
                  </p>
                </div>
                <i className="bx bx-error-alt text-2xl text-red-500"></i>
              </div>
            </div>
            
            {/* Pagadas */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Pagadas</p>
                  <p className="text-lg font-bold text-gray-800">
                    {estadisticas.pagadas}
                  </p>
                </div>
                <i className="bx bx-check-circle text-2xl text-green-500"></i>
              </div>
            </div>
          </div>

          {/* Tabla de cuotas - CON TODAS LAS COLUMNAS INCLUYENDO MONTO EN BS */}
          <section className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuota
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dias Restentes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto Bs
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interés Mora
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confirmación IFEMI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cuotas.map((cuota) => (
                    <tr
                      key={cuota.id_cuota}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {cuota.semana}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {cuota.id_cuota}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            Desde: {cuota.fecha_desde}
                          </p>
                          <p className="text-gray-600">
                            Hasta: {cuota.fecha_hasta}
                          </p>
                        </div>
                      </td>
                      
                      {/* Columna del cronómetro unificado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderEstadoCronometro(cuota)}
                      </td>
                      
                      {/* Monto en USD */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">
                          ${cuota.monto}
                        </span>
                      </td>
                      
                      {/* Monto en Bs - COLUMNA MANTENIDA */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {convertirAVes(cuota.monto)} Bs
                      </td>
                      
                      {/* Interés de mora */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${
                          cuota.interes_acumulado > 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          ${cuota.interes_acumulado.toFixed(2)}
                        </span>
                      </td>
                      
                      {/* Estado de la cuota */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(cuota.estado_cuota)}
                      </td>
                      
                      {/* Confirmación IFEMI */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getConfirmacionIFEMIBadge(cuota.confirmacionIFEMI)}
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleVerMorosidad(cuota)}
                            className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
                            title="Ver morosidad"
                          >
                            <i className="bx bx-error-alt text-lg"></i>
                          </button>
                          
                          {cuota.comprobante ? (
                            <button
                              onClick={() =>
                                window.open(cuota.comprobante, "_blank")
                              }
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                              title="Ver comprobante"
                            >
                              <i className="bx bx-file text-lg"></i>
                            </button>
                          ) : (
                            <span
                              className="p-2 text-gray-400 cursor-not-allowed"
                              title="Sin comprobante"
                            >
                              <i className="bx bx-file text-lg"></i>
                            </span>
                          )}
                          
                          {cuota.estado_cuota !== "Pagado" ? (
                            <button
                              onClick={() => handlePagarCuota(cuota)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                cuota.estado_cuota === "En Mora" 
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : cuota.estado_cuota === "Vencido"
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                              title="Pagar cuota"
                            >
                              <i className="bx bx-credit-card text-lg"></i>
                            </button>
                          ) : (
                            <span
                              className="p-2 bg-green-100 text-green-700 rounded-lg"
                              title="Pagado"
                            >
                              <i className="bx bx-check text-lg"></i>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {cuotas.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <i className="bx bx-credit-card text-5xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No hay cuotas programadas
                </h3>
                <p className="text-gray-600">
                  Configure un monto total para generar el plan de pagos.
                </p>
              </div>
            )}
          </section>
        </main>

        {/* Modal de Morosidad mejorado */}
        {modalMorosidad && cuotaMorosidad && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">
                  Detalles de Morosidad
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl"
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">Estado:</span>
                  <span>{getEstadoBadge(cuotaMorosidad.estado_cuota)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">
                    Cronómetro:
                  </span>
                  <span className="font-semibold">
                    {renderEstadoCronometro(cuotaMorosidad)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium text-yellow-800">
                    Monto Original:
                  </span>
                  <span className="font-semibold text-yellow-900">
                    ${cuotaMorosidad.monto}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">
                    Monto en Bs:
                  </span>
                  <span className="font-semibold text-green-900">
                    {convertirAVes(cuotaMorosidad.monto)} Bs
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-800">
                    Días de Mora:
                  </span>
                  <span className="font-semibold text-red-900">
                    {diasMorosidad[cuotaMorosidad.id_cuota] || 0} días
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-800">
                    Interés Acumulado:
                  </span>
                  <span className="font-semibold text-purple-900">
                    ${cuotaMorosidad.interes_acumulado.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="font-medium text-indigo-800">
                    Total a Pagar:
                  </span>
                  <span className="font-semibold text-indigo-900">
                    ${(parseFloat(cuotaMorosidad.monto) + parseFloat(cuotaMorosidad.interes_acumulado)).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-auto p-6 bg-white border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>
              © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
              reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Cuota;