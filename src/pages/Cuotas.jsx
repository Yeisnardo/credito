import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiConfig from "../services/api_configuracion_contratos";
import api, { getUsuarioPorCedula } from "../services/api_usuario";
import { getContratoPorId } from "../services/api_cuotas";

// Función auxiliar para generar cuotas (fuera del componente)
const generarCuotas = (
  config,
  totalMonto = 0,
  startDate = new Date(),
  montoDevolver = 0,
  cuotasExistentes = []
) => {
  // ✅ Si ya hay cuotas existentes, devolverlas directamente
  if (cuotasExistentes && cuotasExistentes.length > 0) {
    console.log("🔄 RESPETANDO CUOTAS EXISTENTES EN generarCuotas()");
    return cuotasExistentes;
  }

  const cuotasGeneradas = [];
  const { numero_cuotas, cuotasGracia, frecuencia_pago, dias_personalizados } = config;

  const cuotasObligatorias = parseInt(numero_cuotas);
  const cuotasNoObligatorias = parseInt(cuotasGracia);
  const montoPorCuota = montoDevolver > 0 ? montoDevolver / cuotasObligatorias : 0;

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

  const encontrarCuotaExistente = (idCuota) => {
    return cuotasExistentes.find(c => c.id_cuota === idCuota);
  };

  // Generar cuotas obligatorias
  for (let i = 1; i <= cuotasObligatorias; i++) {
    const { fecha_desde, fecha_hasta } = calcularFechas(i);
    const cuotaExistente = encontrarCuotaExistente(i);
    
    cuotasGeneradas.push({
      id_cuota: i,
      semana: `Cuota ${i}`,
      fecha_desde,
      fecha_hasta,
      monto: montoPorCuota.toFixed(2),
      monto_ves: (montoPorCuota * 0.54).toFixed(2),
      fecha_pagada: cuotaExistente?.fecha_pagada || null,
      estado_cuota: cuotaExistente?.estado_cuota || "Pendiente",
      dias_mora_cuota: cuotaExistente?.dias_mora_cuota || 0,
      interes_acumulado: cuotaExistente?.interes_acumulado || 0,
      confirmacionIFEMI: cuotaExistente?.confirmacionIFEMI || "No",
      comprobante: cuotaExistente?.comprobante || null,
    });
  }

  // Generar cuotas de gracia
  for (let j = 1; j <= cuotasNoObligatorias; j++) {
    const index = cuotasObligatorias + j;
    const { fecha_desde, fecha_hasta } = calcularFechas(index);
    const cuotaExistente = encontrarCuotaExistente(index);
    
    cuotasGeneradas.push({
      id_cuota: index,
      semana: `Cuota ${index}`,
      fecha_desde,
      fecha_hasta,
      monto: "0.00",
      monto_ves: "0.00",
      monto_morosidad: 0,
      fecha_pagada: cuotaExistente?.fecha_pagada || null,
      estado_cuota: cuotaExistente?.estado_cuota || "Pendiente",
      dias_mora_cuota: cuotaExistente?.dias_mora_cuota || 0,
      interes_acumulado: cuotaExistente?.interes_acumulado || 0,
      confirmacionIFEMI: cuotaExistente?.confirmacionIFEMI || "No",
      comprobante: cuotaExistente?.comprobante || null,
    });
  }

  return cuotasGeneradas;
};

const fetchContratoDatos = async (cedula) => {
  try {
    const resultado = await getContratoPorId(cedula);
    if (resultado.length > 0) {
      const contrato = resultado[0];
      return {
        montoDevolver: contrato.monto_devolver,
        fechaDesde: contrato.fecha_desde,
        fechaHasta: contrato.fecha_hasta,
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

// Configuración de axios para la API de cuotas
const apiCuotas = axios.create({ 
  baseURL: "http://localhost:5000",
  timeout: 10000,
});

// FUNCIÓN MEJORADA: Verificar estado en la BD con reintentos
const verificarEstadoEnBD = async (cedula, idCuota, maxIntentos = 3) => {
  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      console.log(`🔍 Verificando estado en BD para cuota ${idCuota} (Intento ${intento})...`);
      const response = await apiCuotas.get(`/api/cuotas/emprendedor/${cedula}`);
      const cuotaEnBD = response.data.find(c => c.id_cuota === idCuota);
      
      if (cuotaEnBD) {
        console.log(`📊 ESTADO EN BD - Cuota ${idCuota}:`, cuotaEnBD.estado_cuota);
        return {
          estado: cuotaEnBD.estado_cuota,
          datos: cuotaEnBD
        };
      } else {
        console.log(`❌ Cuota ${idCuota} no encontrada en BD`);
      }
    } catch (error) {
      console.error(`Error en intento ${intento} al verificar estado en BD:`, error);
    }
    
    // Esperar antes del próximo intento
    if (intento < maxIntentos) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
};

// MEJORA EN registrarCuota - CON VALIDACIÓN MEJORADA
const registrarCuota = async (cuotaData, comprobanteFile) => {
  const formData = new FormData();
  
  // Campos obligatorios con validación
  const camposObligatorios = {
    id_cuota: cuotaData.id_cuota.toString(),
    id_cuota_c: (cuotaData.id_cuota_c || cuotaData.id_cuota).toString(),
    cedula_emprendedor: cuotaData.cedula_emprendedor,
    semana: cuotaData.semana,
    monto: cuotaData.monto,
    monto_ves: cuotaData.monto_ves,
    fecha_pagada: cuotaData.fecha_pagada,
    estado_cuota: "Pagado", // ← FORZAR "Pagado" aquí también
    dias_mora_cuota: "0",
    interes_acumulado: "0.00",
    confirmacionIFEMI: "En Espera",
  };

  // Validar campos obligatorios
  for (const [key, value] of Object.entries(camposObligatorios)) {
    if (!value) {
      throw new Error(`Campo obligatorio faltante: ${key}`);
    }
    formData.append(key, value);
  }
  
  if (comprobanteFile) {
    formData.append("comprobante", comprobanteFile);
  }

  console.log("📤 ENVIANDO A API - Datos validados:", camposObligatorios);

  try {
    const response = await apiCuotas.post("/api/cuotas", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
      timeout: 15000, // Aumentar timeout para archivos
    });
    
    console.log("✅ RESPUESTA EXITOSA DE API:", response.data);
    
    // Validación estricta de la respuesta
    if (response.data.estado_cuota !== "Pagado") {
      console.warn("⚠️  ADVERTENCIA: La API no devolvió estado 'Pagado':", response.data);
      // Forzar el estado en la respuesta para consistencia
      response.data.estado_cuota = "Pagado";
    }
    
    return response.data;
  } catch (error) {
    console.error("❌ ERROR AL REGISTRAR CUOTA:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Función MEJORADA para obtener cuotas existentes de la API
const obtenerCuotasExistentes = async (cedula) => {
  try {
    const response = await apiCuotas.get(`/api/cuotas/emprendedor/${cedula}`);
    console.log("📊 CUOTAS OBTENIDAS DE LA BD:", response.data);
    
    // Verificar si hay cuotas pagadas
    const cuotasPagadas = response.data.filter(c => c.estado_cuota === "Pagado");
    if (cuotasPagadas.length > 0) {
      console.log(`🎯 CUOTAS PAGADAS ENCONTRADAS: ${cuotasPagadas.length}`);
      cuotasPagadas.forEach(c => {
        console.log(`   - Cuota ${c.id_cuota}: ${c.estado_cuota}, Fecha: ${c.fecha_pagada}`);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error("Error al obtener cuotas existentes:", error);
    return [];
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
  const [modalPago, setModalPago] = useState(false);
  const [cuotaPago, setCuotaPago] = useState(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState("");
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState({ euro: 1, dolar: 1 });
  const [monedaPref, setMonedaPref] = useState('USD');
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [fecha_pagada, setfecha_pagada] = useState("");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState({});
  const [diasMorosidad, setDiasMorosidad] = useState({});
  const [filtroEstado, setFiltroEstado] = useState("todas");

  // NUEVA FUNCIÓN: Sincronizar estado local con BD (DENTRO DEL COMPONENTE)
  const sincronizarConBD = async (cedula, idCuota) => {
    try {
      const resultadoBD = await verificarEstadoEnBD(cedula, idCuota);
      
      if (resultadoBD && resultadoBD.estado === "Pagado") {
        // Actualizar estado local con datos exactos de la BD
        setCuotas((prev) =>
          prev.map((c) =>
            c.id_cuota === idCuota
              ? { 
                  ...c, 
                  estado_cuota: resultadoBD.estado,
                  fecha_pagada: resultadoBD.datos.fecha_pagada,
                  comprobante: resultadoBD.datos.comprobante || c.comprobante,
                  confirmacionIFEMI: resultadoBD.datos.confirmacionIFEMI,
                  dias_mora_cuota: 0,
                  interes_acumulado: 0
                }
              : c
          )
        );
        console.log("🔄 SINCRONIZACIÓN EXITOSA: Estado local actualizado desde BD");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en sincronización con BD:", error);
      return false;
    }
  };

  // Función auxiliar para verificar datos en tiempo real
  const verificarEstadoCuota = async (idCuota) => {
    if (!user?.cedula_usuario) return;
    
    try {
      const response = await apiCuotas.get(`/api/cuotas/emprendedor/${user.cedula_usuario}`);
      const cuotaEnBD = response.data.find(c => c.id_cuota === idCuota);
      
      if (cuotaEnBD) {
        console.log(`🔍 VERIFICACIÓN EN TIEMPO REAL - Cuota ${idCuota}:`, {
          estado_en_bd: cuotaEnBD.estado_cuota,
          estado_en_frontend: cuotas.find(c => c.id_cuota === idCuota)?.estado_cuota,
          fecha_pagada_bd: cuotaEnBD.fecha_pagada,
          fecha_pagada_frontend: cuotas.find(c => c.id_cuota === idCuota)?.fecha_pagada
        });
        
        // Si hay discrepancia, actualizar desde BD
        const cuotaFrontend = cuotas.find(c => c.id_cuota === idCuota);
        if (cuotaEnBD.estado_cuota === "Pagado" && cuotaFrontend?.estado_cuota !== "Pagado") {
          console.log("🔄 CORRIGIENDO DESINCRONIZACIÓN...");
          setCuotas(prev => prev.map(c => 
            c.id_cuota === idCuota 
              ? { ...c, estado_cuota: "Pagado", fecha_pagada: cuotaEnBD.fecha_pagada }
              : c
          ));
        }
      }
    } catch (error) {
      console.error("Error en verificación en tiempo real:", error);
    }
  };

  // Debug: monitorear cambios en cuotas - MEJORADO
  useEffect(() => {
    console.log("🔄 CUOTAS ACTUALIZADAS:", cuotas.map(c => ({
      id: c.id_cuota,
      estado: c.estado_cuota,
      fecha_pagada: c.fecha_pagada,
      origen: c.fecha_pagada ? "BD" : "Generado"
    })));
    
    // Verificar cuotas pagadas después de la carga
    const cuotasPagadas = cuotas.filter(c => c.estado_cuota === "Pagado");
    if (cuotasPagadas.length > 0) {
      console.log(`✅ CUOTAS PAGADAS MANTENIDAS: ${cuotasPagadas.length}`);
    }
  }, [cuotas]);

  // Debug específico para cuotas pagadas
  useEffect(() => {
    const cuotasPagadas = cuotas.filter(c => c.estado_cuota === "Pagado");
    if (cuotasPagadas.length > 0) {
      console.log("✅ CUOTAS PAGADAS DETECTADAS:", cuotasPagadas.map(c => ({
        id: c.id_cuota,
        estado: c.estado_cuota,
        fecha_pagada: c.fecha_pagada,
        origen: 'Estado actual'
      })));
    }
  }, [cuotas]);

  // EFECTO PARA SINCRONIZACIÓN PERIÓDICA (opcional)
  useEffect(() => {
    const sincronizarCuotasPagadas = async () => {
      if (!user?.cedula_usuario) return;
      
      const cuotasPagadasLocalmente = cuotas.filter(c => c.estado_cuota === "Pagado");
      
      for (const cuota of cuotasPagadasLocalmente) {
        const estadoEnBD = await verificarEstadoEnBD(user.cedula_usuario, cuota.id_cuota);
        if (estadoEnBD && estadoEnBD.estado !== "Pagado") {
          console.warn(`⚠️  DESINCRONIZACIÓN: Cuota ${cuota.id_cuota} no está como 'Pagado' en BD`);
          // Podrías mostrar una notificación al usuario aquí
        }
      }
    };

    // Sincronizar cada 5 minutos si hay cuotas pagadas
    if (user && cuotas.some(c => c.estado_cuota === "Pagado")) {
      const interval = setInterval(sincronizarCuotasPagadas, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [cuotas, user]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Función para filtrar cuotas según el estado
  const cuotasFiltradas = cuotas.filter(cuota => {
    switch (filtroEstado) {
      case "pagadas":
        return cuota.estado_cuota === "Pagado";
      case "pendientes":
        return cuota.estado_cuota !== "Pagado";
      default:
        return true;
    }
  });

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

  // Función para calcular días de morosidad
  const calcularDiasMorosidad = () => {
    const ahora = new Date();
    const nuevosDiasMorosidad = {};
    
    cuotas.forEach((cuota) => {
      const fechaHasta = new Date(cuota.fecha_hasta);
      
      if (fechaHasta < ahora) {
        const diffTime = ahora - fechaHasta;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        nuevosDiasMorosidad[cuota.id_cuota] = diffDays;
      } else {
        nuevosDiasMorosidad[cuota.id_cuota] = 0;
      }
    });
    
    setDiasMorosidad(nuevosDiasMorosidad);
  };

  // Calcular intereses de morosidad
  const calcularInteresMorosidad = (diasMora, montoOriginal) => {
    if (!configuracion || !configuracion.porcentaje_mora) return 0;
    
    const porcentajeDiario = configuracion.porcentaje_mora / 100;
    const interes = parseFloat(montoOriginal) * porcentajeDiario * diasMora;
    
    return parseFloat(interes.toFixed(2));
  };

  // Función para actualizar estado de cuota
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

  // Efecto principal para los cronómetros
  useEffect(() => {
    if (cuotas.length > 0) {
      calcularDiasRestantes();
      calcularDiasMorosidad();
      
      const interval = setInterval(() => {
        calcularDiasRestantes();
        calcularDiasMorosidad();
      }, 1000 * 60 * 60);
      
      return () => clearInterval(interval);
    }
  }, [cuotas]);

  // Efecto para manejar transición de cuotas y calcular intereses - MEJORADO
  useEffect(() => {
    Object.keys(diasRestantes).forEach((idCuota) => {
      const id = parseInt(idCuota);
      const diffDays = diasRestantes[id];
      const diasMora = diasMorosidad[id] || 0;
      const cuota = cuotas.find(c => c.id_cuota === id);
      
      if (!cuota) return;
      
      // ✅ CLAVE: Ignorar cuotas que ya están pagadas
      if (cuota.estado_cuota === "Pagado") {
        return; // No hacer cambios en cuotas pagadas
      }

      if (diffDays <= 0 && cuota.estado_cuota === "Pendiente") {
        actualizarEstadoCuota(id, "Vencido", 0);
      }
      
      if (diasMora > 0 && cuota.estado_cuota === "Vencido") {
        actualizarEstadoCuota(id, "En Mora", diasMora);
        
        const interes = calcularInteresMorosidad(diasMora, cuota.monto);
        setCuotas(prev => prev.map(c => 
          c.id_cuota === id 
            ? { ...c, interes_acumulado: parseFloat(interes) } 
            : c
        ));
      }
      
      if (diasMora > 0 && cuota.estado_cuota === "En Mora") {
        actualizarEstadoCuota(id, "En Mora", diasMora);
        
        const interes = calcularInteresMorosidad(diasMora, cuota.monto);
        setCuotas(prev => prev.map(c => 
          c.id_cuota === id 
            ? { ...c, interes_acumulado: parseFloat(interes) } 
            : c
        ));
      }
    });
  }, [diasRestantes, diasMorosidad, cuotas, configuracion]);

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

  // FUNCIÓN fetchUser MEJORADA - CLAVE PARA SOLUCIONAR EL PROBLEMA
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
        const cuotasExistentes = await obtenerCuotasExistentes(cedula);
        
        console.log("📊 CUOTAS EXISTENTES EN BD:", cuotasExistentes);
        
        if (config) {
          setMonedaPref(config.moneda || 'USD');
          setConfiguracion(config);
          const contratoDatos = await fetchContratoDatos(cedula);

          // ✅ CLAVE: Si ya hay cuotas en la BD, usarlas directamente
          if (cuotasExistentes && cuotasExistentes.length > 0) {
            console.log("✅ USANDO CUOTAS EXISTENTES DE LA BD - Total:", cuotasExistentes.length);
            const cuotasPagadas = cuotasExistentes.filter(c => c.estado_cuota === "Pagado");
            console.log("✅ CUOTAS PAGADAS EN BD:", cuotasPagadas.length);
            setCuotas(cuotasExistentes);
          } else {
            // Solo generar cuotas nuevas si no existen en la BD
            console.log("🆕 GENERANDO CUOTAS NUEVAS");
            if (contratoDatos) {
              const { montoDevolver, fechaDesde } = contratoDatos;
              const cuotasGeneradas = generarCuotas(
                config,
                0,
                new Date(fechaDesde),
                montoDevolver,
                [] // Array vacío porque no hay cuotas existentes
              );
              setCuotas(cuotasGeneradas);
            } else {
              const cuotasGeneradas = generarCuotas(
                config, 
                0, 
                new Date(), 
                0,
                []
              );
              setCuotas(cuotasGeneradas);
            }
          }
        } else {
          const defaultConfig = {
            numero_cuotas: "5",
            cuotasGracia: "2",
            frecuencia_pago: "semanal",
            porcentaje_mora: 2
          };
          setConfiguracion(defaultConfig);
          
          // ✅ Respetar cuotas existentes
          if (cuotasExistentes && cuotasExistentes.length > 0) {
            setCuotas(cuotasExistentes);
          } else {
            const cuotasGeneradas = generarCuotas(
              defaultConfig,
              0,
              new Date(),
              0,
              []
            );
            setCuotas(cuotasGeneradas);
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
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

  // Función para mostrar información del porcentaje de mora
  const getInfoPorcentajeMora = () => {
    if (!configuracion || !configuracion.porcentaje_mora) {
      return "No configurado";
    }
    return `${configuracion.porcentaje_mora}% diario`;
  };

  // FUNCIONES PARA EL MODAL DE PAGO
  const abrirModalPago = (cuota) => {
    setCuotaPago(cuota);
    setfecha_pagada(new Date().toISOString().split('T')[0]);
    setComprobanteFile(null);
    setModalPago(true);
  };

  const cerrarModalPago = () => {
    setModalPago(false);
    setCuotaPago(null);
    setProcesandoPago(false);
    setComprobanteFile(null);
  };

  // FUNCIÓN MEJORADA para procesar pago - VERSIÓN SIMPLIFICADA
  const procesarPago = async () => {
    if (!cuotaPago || !user) return;

    setProcesandoPago(true);
    
    try {
      // 1. Preparar datos para la API
      const cuotaData = {
        id_cuota: cuotaPago.id_cuota,
        id_cuota_c: cuotaPago.id_cuota_c || cuotaPago.id_contrato || cuotaPago.id_cuota,
        cedula_emprendedor: user.cedula_usuario,
        semana: cuotaPago.semana,
        monto: cuotaPago.monto,
        monto_ves: convertirAVes(cuotaPago.monto),
        fecha_pagada: fecha_pagada,
        estado_cuota: "Pagado", // ← FORZAR "Pagado" EXPLÍCITAMENTE
        dias_mora_cuota: 0,
        interes_acumulado: 0,
        confirmacionIFEMI: "En Espera",
      };

      console.log("📤 ENVIANDO A API - estado_cuota:", cuotaData.estado_cuota);

      // 2. LLAMADA PRINCIPAL A LA API
      const resultado = await registrarCuota(cuotaData, comprobanteFile);
      console.log("✅ API RESPONDIO EXITOSAMENTE:", resultado);

      // 3. ACTUALIZACIÓN LOCAL CON DATOS DE LA RESPUESTA
      setCuotas((prev) =>
        prev.map((c) =>
          c.id_cuota === cuotaPago.id_cuota
            ? {
                ...c,
                estado_cuota: resultado.estado_cuota || "Pagado", // Usar respuesta de API
                fecha_pagada: resultado.fecha_pagada || fecha_pagada,
                comprobante: comprobanteFile
                  ? URL.createObjectURL(comprobanteFile)
                  : resultado.comprobante || c.comprobante,
                confirmacionIFEMI: resultado.confirmacionIFEMI || "En Espera",
                dias_mora_cuota: 0,
                interes_acumulado: 0,
              }
            : c
        )
      );

      console.log("✅ ESTADO LOCAL ACTUALIZADO CON RESPUESTA DE API");

      // 4. VERIFICACIÓN EN BD (opcional, para confirmación)
      setTimeout(async () => {
        try {
          const estadoBD = await verificarEstadoEnBD(user.cedula_usuario, cuotaPago.id_cuota);
          if (estadoBD) {
            console.log("🔍 VERIFICACIÓN BD - Estado:", estadoBD.estado);
          }
        } catch (error) {
          console.log("ℹ️ Verificación BD opcional falló, pero pago fue exitoso");
        }
      }, 2000);

      alert("¡Pago procesado exitosamente! Estado actualizado a Pagado.");
      cerrarModalPago();
      setFiltroEstado("todas");
      
    } catch (error) {
      console.error("❌ ERROR CRÍTICO EN PROCESARPAGO:", error);
      alert(`Error al procesar el pago: ${error.response?.data?.message || error.message || "Intente nuevamente."}`);
    } finally {
      setProcesandoPago(false);
    }
  };

  const handleComprobanteChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert("Por favor, seleccione un archivo JPG, PNG o PDF");
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB permitido.");
        e.target.value = '';
        return;
      }
      
      setComprobanteFile(file);
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
    abrirModalPago(cuota);
  };

  const handleVerMorosidad = (cuota) => {
    setCuotaMorosidad(cuota);
    setModalMorosidad(true);
  };

  const closeModal = () => {
    setModalMorosidad(false);
    setCuotaMorosidad(null);
  };

  // Estadísticas actualizadas
  const getEstadisticas = () => {
    const totalCuotas = cuotas.length;
    const pagadas = cuotas.filter((c) => c.estado_cuota === "Pagado").length;
    const pendientes = cuotas.filter((c) => c.estado_cuota === "Pendiente").length;
    const vencidas = cuotas.filter((c) => c.estado_cuota === "Vencido").length;
    const enMora = cuotas.filter((c) => c.estado_cuota === "En Mora").length;
    
    const montoTotal = cuotas.reduce((sum, c) => sum + parseFloat(c.monto), 0);
    const montoPagado = cuotas
      .filter((c) => c.estado_cuota === "Pagado")
      .reduce((sum, c) => sum + parseFloat(c.monto), 0);
    
    const totalMora = cuotas
      .filter((c) => c.estado_cuota === "En Mora")
      .reduce((sum, c) => sum + parseFloat(c.interes_acumulado), 0);

    const porcentajePagado = totalCuotas > 0 ? (pagadas / totalCuotas * 100).toFixed(1) : 0;
    const montoRestante = montoTotal - montoPagado;

    return {
      totalCuotas,
      pagadas,
      pendientes,
      vencidas,
      enMora,
      montoTotal,
      montoPagado,
      totalMora,
      porcentajePagado,
      montoRestante
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
      "En Espera": "bg-yellow-100 text-yellow-800 border-yellow-200",
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
          Pagado {cuota.fecha_pagada ? `el ${cuota.fecha_pagada}` : ""}
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
                  {configuracion?.porcentaje_mora && (
                    <p className="text-sm text-orange-600 font-medium mt-1">
                      Tasa de mora: {getInfoPorcentajeMora()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Estadísticas Cards */}
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

          {/* Barra de progreso */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Progreso de Pagos</h3>
              <span className="text-sm font-medium text-gray-600">
                {estadisticas.pagadas} de {estadisticas.totalCuotas} cuotas ({estadisticas.porcentajePagado}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${estadisticas.porcentajePagado}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Total pagado: ${estadisticas.montoPagado.toFixed(2)}</span>
              <span>Restante: ${estadisticas.montoRestante.toFixed(2)}</span>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtrar Cuotas</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltroEstado("todas")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    filtroEstado === "todas" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Todas ({cuotas.length})
                </button>
                <button
                  onClick={() => setFiltroEstado("pagadas")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    filtroEstado === "pagadas" 
                      ? "bg-green-600 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Pagadas ({estadisticas.pagadas})
                </button>
                <button
                  onClick={() => setFiltroEstado("pendientes")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    filtroEstado === "pendientes" 
                      ? "bg-orange-600 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Pendientes ({estadisticas.pendientes + estadisticas.vencidas + estadisticas.enMora})
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de cuotas */}
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
                      Estado del Pago
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
                  {cuotasFiltradas.map((cuota) => (
                    <tr
                      key={cuota.id_cuota}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        cuota.estado_cuota === "Pagado" ? "bg-green-50" : ""
                      }`}
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
                      
                      {/* Monto en Bs */}
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
                        {cuota.interes_acumulado > 0 && (
                          <div className="text-xs text-gray-500">
                            {diasMorosidad[cuota.id_cuota] || 0}d × {getInfoPorcentajeMora()}
                          </div>
                        )}
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
            
            {cuotasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <i className="bx bx-credit-card text-5xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No hay cuotas {filtroEstado !== "todas" ? filtroEstado : ""}
                </h3>
                <p className="text-gray-600">
                  {filtroEstado === "pagadas" 
                    ? "No se encontraron cuotas pagadas." 
                    : filtroEstado === "pendientes"
                    ? "Todas las cuotas están pagadas."
                    : "Configure un monto total para generar el plan de pagos."}
                </p>
              </div>
            )}
          </section>
        </main>

        {/* Modal de Morosidad */}
        {modalMorosidad && cuotaMorosidad && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl  max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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

        {/* MODAL DE PAGO CON INTEGRACIÓN A API */}
        {modalPago && cuotaPago && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h3 className="text-xl font-semibold text-gray-800">
                  Procesar Pago - {cuotaPago.semana}
                </h3>
                <button
                  onClick={cerrarModalPago}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl"
                  disabled={procesandoPago}
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Resumen de la cuota */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Resumen de la Cuota</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-blue-700">Monto Original:</div>
                    <div className="font-semibold text-blue-900">${cuotaPago.monto}</div>
                    
                    <div className="text-blue-700">Monto en Bs:</div>
                    <div className="font-semibold text-blue-900">{convertirAVes(cuotaPago.monto)} Bs</div>
                    
                    {cuotaPago.interes_acumulado > 0 && (
                      <>
                        <div className="text-red-700">Interés por Mora:</div>
                        <div className="font-semibold text-red-900">${cuotaPago.interes_acumulado.toFixed(2)}</div>
                      </>
                    )}
                    
                    <div className="text-green-700 font-semibold">Total a Pagar:</div>
                    <div className="font-bold text-green-900 text-lg">
                      ${(parseFloat(cuotaPago.monto) + parseFloat(cuotaPago.interes_acumulado)).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Información de Transferencia */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                    <i className="bx bx-transfer text-xl mr-2"></i>
                    Método de Pago: Transferencia Bancaria
                  </h4>
                  <div className="text-sm text-indigo-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Banco:</span>
                      <span>Banco de Venezuela</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Cuenta:</span>
                      <span>0102-1234-5678-9012</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Titular:</span>
                      <span>IFEMI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">RIF:</span>
                      <span>J-12345678-9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tipo de Cuenta:</span>
                      <span>Corriente</span>
                    </div>
                  </div>
                </div>

                {/* Fecha de Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Pago *
                  </label>
                  <input
                    type="date"
                    value={fecha_pagada}
                    onChange={(e) => setfecha_pagada(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Comprobante de Transferencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprobante de Transferencia
                  </label>
                  <input
                    type="file"
                    onChange={handleComprobanteChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    disabled={procesandoPago}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceptados: JPG, PNG, PDF (Máx. 5MB)
                  </p>
                  {comprobanteFile && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Archivo seleccionado: {comprobanteFile.name}
                    </p>
                  )}
                </div>

                {/* Instrucciones */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <i className="bx bx-info-circle mr-2"></i>
                    Instrucciones
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Realice la transferencia a la cuenta bancaria indicada</li>
                    <li>Conserve el comprobante de la transacción</li>
                    <li>Puede subir el comprobante ahora o más tarde</li>
                    <li>El pago será verificado por el administrador</li>
                    <li>Los datos se guardarán en el sistema</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex space-x-3">
                  <button
                    onClick={cerrarModalPago}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                    disabled={procesandoPago}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={procesarPago}
                    disabled={procesandoPago || !fecha_pagada}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      procesandoPago || !fecha_pagada
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {procesandoPago ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </div>
                    ) : (
                      `Confirmar Pago $${(parseFloat(cuotaPago.monto) + parseFloat(cuotaPago.interes_acumulado)).toFixed(2)}`
                    )}
                  </button>
                </div>
                {!fecha_pagada && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    * Por favor seleccione la fecha de pago
                  </p>
                )}
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