import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { registrarContrato } from "../services/api_contrato";
import apiconfiguracionDesdeAPI from "../services/api_configuracion_contratos";

// Importar SOLO iconos que SÍ existen en Tabler Icons
import {
  TbFile,
  TbUser,
  TbSearch,
  TbX,
  TbCheck,
  TbFolder,
  TbReceipt,
  TbPhoto,
  TbCircleCheck,
  TbAlertCircle,
  TbFileText,
  TbCalendar,
  TbCurrencyDollar,
  TbEye,
  TbBuildingBank,
  TbCoin,
} from "react-icons/tb";;

const Gestion = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("asignacion");
  const [empleadores, setEmpleadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secuencia, setSecuencia] = useState(1);
  const [empleadorModal, setEmpleadorModal] = useState(null);
  const [formData, setFormData] = useState({
    numero_contrato: "",
    cedula_emprendedor: "",
    monto_aprob_euro: "",
    monto_bs: "",
    monto_bs_neto: "",
    monto_restado: "",
    cincoflat: "",
    diezinteres: "",
    monto_devolver: "",
    monto_semanal: "",
    monto_cuota: "",
    frecuencia_pago_contrato: "",
    cuotas: "",
    gracia: "",
    interes: "",
    morosidad: "",
    dias_personalizados: "",
    fecha_desde: "",
    fecha_hasta: "",
    estatus: "Pendiente",
    banco: "",
    cedulaTitular: "",
    nombreCompleto: "",
    numeroCuenta: "",
  });
  const [depositoData, setDepositoData] = useState({
    emprendedorId: "",
    cedula_emprendedor: "",
    estado: "Pendiente",
    comprobante: null,
    comprobantePreview: null,
    sizeError: "",
  });
  const [asignandoContrato, setAsignandoContrato] = useState(null);
  const [gestionandoContrato, setGestionandoContrato] = useState(null);
  const [editandoBancarios, setEditandoBancarios] = useState(null);
  const [contratosAsignados, setContratosAsignados] = useState({});
  const [contratosGestionados, setContratosGestionados] = useState({});
  const [depositos, setDepositos] = useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEmpleadorId, setSelectedEmpleadorId] = React.useState("");
  const [comprobanteModal, setComprobanteModal] = useState(null);
  const [contratosAgrupados, setContratosAgrupados] = useState({});
  const [rates, setRates] = useState({ euro: null, dolar: null });
  const [configuracion, setConfiguracion] = useState(null);

  // Cargar configuración al montar
  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const data = await apiconfiguracionDesdeAPI.getConfiguracion();
        setConfiguracion(data);

        console.log("Configuración cargada:", data);

        // Establecer todos los valores desde la configuración con nombres correctos
        setFormData((prev) => ({
          ...prev,
          frecuencia_pago_contrato: data.frecuencia_pago || "Semanal",
          cuotas: data.numero_cuotas || "No definida",
          gracia: data.cuotasgracias || "No definida",
          interes: data.porcentaje_interes || "No definida",
          morosidad: data.porcentaje_mora || "No definida",
        }));
      } catch (error) {
        console.error("Error cargando configuración", error);
        setFormData((prev) => ({
          ...prev,
          frecuencia_pago_contrato: "Semanal",
          cuotas: "No definida",
          gracia: "No definida",
          interes: "No definida",
          morosidad: "No definida",
        }));
      }
    };
    fetchConfiguracion();
  }, []);

  // Cargar tasas de cambio
  useEffect(() => {
    fetchRates();
  }, []);

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

  // Función para calcular montos en Bs según configuración
  useEffect(() => {
    if (
      !rates.euro ||
      !rates.dolar ||
      !formData.monto_aprob_euro ||
      !configuracion
    )
      return;

    const montoEuro = parseFloat(formData.monto_aprob_euro);
    if (isNaN(montoEuro)) {
      setFormData((prev) => ({
        ...prev,
        monto_bs: "",
        monto_bs_neto: "",
        monto_restado: "",
      }));
      return;
    }

    const tasa =
      configuracion.moneda === "USD"
        ? rates.dolar
        : configuracion.moneda === "EUR"
        ? rates.euro
        : 1;

    const porcentajeFlat = parseFloat(configuracion.porcentaje_flat) || 0;

    // Calcular monto total en Bs
    const montoBsTotal = (montoEuro * tasa).toFixed(2);

    // Calcular el monto restado (flat) en Bs
    const montoRestado = ((montoEuro * tasa * porcentajeFlat) / 100).toFixed(2);

    // Calcular monto neto en Bs (restando el flat)
    const montoBsNeto = (
      parseFloat(montoBsTotal) - parseFloat(montoRestado)
    ).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      monto_bs: montoBsTotal,
      monto_bs_neto: montoBsNeto,
      monto_restado: montoRestado,
    }));
  }, [formData.monto_aprob_euro, rates, configuracion]);

  // Agrupar contratos por cédula de emprendedor
  useEffect(() => {
    if (empleadores.length > 0) {
      const agrupados = empleadores.reduce((acc, empleador) => {
        const cedula = empleador.cedula;
        if (!acc[cedula]) {
          acc[cedula] = {
            empleador: empleador,
            contratos: [],
          };
        }
        acc[cedula].contratos.push(empleador);
        return acc;
      }, {});
      setContratosAgrupados(agrupados);
    }
  }, [empleadores]);

  // Actualizar montos y cálculos cuando monto_aprob_euro cambie
  useEffect(() => {
    if (configuracion && formData.monto_aprob_euro) {
      const montoEuro = parseFloat(formData.monto_aprob_euro);
      const porcentajeFlat = parseFloat(configuracion.porcentaje_flat) || 0;
      const porcentajeInteres =
        parseFloat(configuracion.porcentaje_interes) || 0;
      const porcentajeMorosidad =
        parseFloat(configuracion.porcentaje_mora) || 0;
      const numeroCuotas = parseFloat(configuracion.numero_cuotas) || 18;

      if (!isNaN(montoEuro)) {
        const flatAmount = ((montoEuro * porcentajeFlat) / 100).toFixed(2);
        const interesAmount = ((montoEuro * porcentajeInteres) / 100).toFixed(
          2
        );
        const montoDevolver = (montoEuro + parseFloat(interesAmount)).toFixed(
          2
        );
        const montoSemanal = (parseFloat(montoDevolver) / numeroCuotas).toFixed(
          2
        );
        const morosidadAmount = (
          (montoEuro * porcentajeMorosidad) /
          100
        ).toFixed(2);

        setFormData((prev) => ({
          ...prev,
          diezinteres: interesAmount,
          monto_devolver: montoDevolver,
          monto_semanal: montoSemanal,
          monto_cuota: montoSemanal,
          // Mantener los valores de configuración
          cuotas: configuracion.numero_cuotas || "No definida",
          gracia: configuracion.cuotasgracias || "No definida",
          interes: configuracion.porcentaje_interes || "No definida",
          morosidad: configuracion.porcentaje_mora || "No definida",
        }));
      }
    }
  }, [formData.monto_aprob_euro, configuracion]);

  const handleVerComprobante = (url) => {
    setComprobanteModal(url);
  };

  const cerrarModalComprobante = () => {
    setComprobanteModal(null);
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setDepositoData((prev) => ({
      ...prev,
      sizeError: "",
    }));

    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setDepositoData((prev) => ({
          ...prev,
          sizeError: "Formato no válido. Solo se aceptan JPG, PNG o GIF.",
        }));
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setDepositoData((prev) => ({
          ...prev,
          sizeError: `La imagen es demasiado grande (${sizeInMB} MB). El tamaño máximo permitido es 5MB.`,
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setDepositoData((prev) => ({
          ...prev,
          comprobante: file,
          comprobantePreview: e.target.result,
          sizeError: "",
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setDepositoData((prev) => ({
        ...prev,
        comprobante: null,
        comprobantePreview: null,
        sizeError: "",
      }));
    }
  };

  // Función para calcular fechas
  const calcularFechas = (fechaInicioStr) => {
    const fechaInicio = new Date(fechaInicioStr);
    const fechahasta = new Date(fechaInicio);
    const numeroCuotas = parseFloat(configuracion?.numero_cuotas) || 18;
    const frecuencia = configuracion?.frecuencia_pago || "Semanal";

    // Calcular fecha final basado en la frecuencia y número de cuotas
    if (frecuencia === "diario") {
      fechahasta.setDate(fechahasta.getDate() + numeroCuotas * 1);
    } else if (frecuencia === "semanal") {
      fechahasta.setDate(fechahasta.getDate() + numeroCuotas * 7);
    } else if (frecuencia === "quincenal") {
      fechahasta.setDate(fechahasta.getDate() + numeroCuotas * 15);
    } else if (frecuencia === "mensual") {
      fechahasta.setMonth(fechahasta.getMonth() + numeroCuotas);
    } else {
      // Por defecto semanal o para Personalizado (usaremos semanal como base)
      fechahasta.setDate(fechahasta.getDate() + numeroCuotas * 7);
    }

    const formatDate = (date) => date.toISOString().split("T")[0];

    return {
      desde: formatDate(fechaInicio),
      hasta: formatDate(fechahasta),
    };
  };

  // Cuando la fechaDesde cambie, actualizar fecha_hasta
  React.useEffect(() => {
    if (formData.fecha_desde) {
      const { desde, hasta } = calcularFechas(formData.fecha_desde);
      setFormData((prev) => ({
        ...prev,
        fecha_hasta: hasta,
      }));
    }
  }, [formData.fecha_desde, configuracion]);

  // Inicializar la fecha desde con la fecha actual
  React.useEffect(() => {
    const hoy = new Date();
    const formatDate = hoy.toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      fecha_desde: formatDate,
    }));
  }, []);

  // Función para manejar el cambio en el select de empleadores
  const handleEmpleadorChange = (e) => {
    const selectedId = e.target.value;
    setSelectedEmpleadorId(selectedId);

    const empleadorSeleccionado = empleadores.find(
      (emp) => emp.id === selectedId
    );

    if (empleadorSeleccionado) {
      setFormData((prev) => ({
        ...prev,
        cedula_emprendedor: empleadorSeleccionado.cedula || "",
        numero_contrato: empleadorSeleccionado.numeroContrato || "",
      }));
      setDepositoData((prev) => ({
        ...prev,
        cedula_emprendedor: empleadorSeleccionado.cedula || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        cedula_emprendedor: "",
      }));
      setDepositoData((prev) => ({
        ...prev,
        cedula_emprendedor: "",
      }));
    }
  };

  // Función para manejar cambios en el buscador
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    cargarEmpleadores();
    cargarDepositos();
  }, []);

  const generarNumeroContrato = () => {
    const ano = getAnoActual();
    const secuenciaStr = String(secuencia).padStart(3, "0");
    const numeroContrato = `IFEMI/CRED-${secuenciaStr}-${ano}`;
    return numeroContrato;
  };

  const asignarNuevoContrato = () => {
    const nuevoNumero = generarNumeroContrato();
    setSecuencia((prev) => prev + 1);
    return nuevoNumero;
  };

  const getAnoActual = () => {
    const year = new Date().getFullYear();
    return year.toString().slice(-2);
  };

  const obtenerEmprendedoresAprobados = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/solicitudes/estatus/aprobada"
      );
      if (!response.ok) {
        throw new Error(`Respuesta no ok: ${response.status}`);
      }
      const data = await response.json();
      return data.map((emprendedor) => ({
        id: emprendedor.cedula,
        nombre: `${emprendedor.nombre_completo}`,
        detalle: emprendedor.detalle_proyecto || "Sin detalles",
        cedula: emprendedor.cedula,
        tieneContrato: !!emprendedor.numero_contrato,
        numeroContrato: emprendedor.numero_contrato || null,
        tieneDatosBancarios: false,
        datosBancarios: null,
        cedula_emprendedor: formData.cedula_emprendedor,
        numero_contrato: emprendedor.numero_contrato,
        monto_aprob_euro: emprendedor.monto_aprob_euro || null,
        monto_bs: emprendedor.monto_bs || null,
        monto_bs_neto: emprendedor.monto_bs_neto || null,
        monto_restado: emprendedor.monto_restado || null,
        diezinteres: emprendedor.diezinteres || null,
        monto_devolver: emprendedor.monto_devolver || null,
        monto_semanal: emprendedor.monto_semanal || null,
        monto_cuota: emprendedor.monto_cuota || null,
        frecuencia_pago_contrato:
          emprendedor.frecuencia_pago_contrato ||
          configuracion?.frecuencia_pago ||
          "Semanal",
        cuotas:
          emprendedor.cuotas || configuracion?.numero_cuotas || "No definida",
        gracia:
          emprendedor.gracia || configuracion?.cuotasgracias || "No definida",
        interes:
          emprendedor.interes ||
          configuracion?.porcentaje_interes ||
          "No definida",
        morosidad:
          emprendedor.morosidad ||
          configuracion?.porcentaje_mora ||
          "No definida",
        dias_personalizados: emprendedor.dias_personalizados || null,
        fecha_desde: emprendedor.fecha_desde || null,
        fecha_hasta: emprendedor.fecha_hasta || null,
        estatus: emprendedor.estatus || null,

        cedula_titular: emprendedor.cedula_titular || null,
        nombre_completo_cuenta: emprendedor.nombre_completo_cuenta || null,
        banco: emprendedor.banco || null,
        numero_cuenta: emprendedor.numero_cuenta || null,
      }));
    } catch (error) {
      console.error("Error en obtenerEmprendedoresAprobados:", error);
      throw error;
    }
  };

  const cargarEmpleadores = async () => {
    try {
      const data = await obtenerEmprendedoresAprobados();
      setEmpleadores(data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando emprendedores:", error);
      setLoading(false);
      alert(
        "Error al cargar los emprendedores. Por favor, intenta nuevamente."
      );
    }
  };

  const cargarDepositos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/deposito");
      const depositosData = response.data;

      const depositosConDatos = depositosData.map((deposito) => {
        const empleador = empleadores.find(
          (e) => e.cedula === deposito.cedula_emprendedor
        );
        const comprobanteUrl = deposito.comprobante
          ? `http://localhost:5000${deposito.comprobante}`
          : null;

        return {
          ...deposito,
          nombre: deposito.nombre_completo || "Nombre desconocido",
          comprobante: comprobanteUrl,
        };
      });

      setDepositos(depositosConDatos);
    } catch (error) {
      console.error("Error cargando depósitos:", error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDepositoChange = (e) => {
    const { name, value } = e.target;
    setDepositoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const iniciarAsignacionContrato = (empleador) => {
    const numeroContrato = asignarNuevoContrato();
    setAsignandoContrato(empleador);
    setFormData((prev) => ({
      ...prev,
      cedulaEmprendedor: empleador.cedula,
      numeroContrato: numeroContrato,
    }));
  };

  const cancelarAsignacion = () => {
    setAsignandoContrato(null);
    setFormData((prev) => ({
      ...prev,
      numeroContrato: "",
      cedulaEmprendedor: "",
    }));
  };

  const confirmarAsignacionContrato = async () => {
    try {
      if (!formData.numeroContrato) {
        alert("Por favor ingrese el número de contrato");
        return;
      }

      const response = await fetch("http://localhost:5000/api/contratos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cedula_emprendedor: formData.cedulaEmprendedor,
          numero_contrato: formData.numeroContrato,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al asignar contrato");
      }

      const data = await response.json();

      const updatedEmpleadores = empleadores.map((e) =>
        e.cedula === formData.cedula_emprendedor
          ? {
              ...e,
              tieneContrato: true,
              numeroContrato: formData.numero_contrato,
            }
          : e
      );

      setEmpleadores(updatedEmpleadores);
      setContratosAsignados((prev) => ({
        ...prev,
        [asignandoContrato.id]: formData.numeroContrato,
      }));

      setAsignandoContrato(null);
      setFormData((prev) => ({
        ...prev,
        numeroContrato: "",
        cedulaEmprendedor: "",
      }));

      alert("Contrato asignado exitosamente");
    } catch (error) {
      console.error("Error asignando contrato:", error);
      alert("Error al asignar contrato");
    }
  };

  const iniciarGestionContrato = (empleador) => {
    setGestionandoContrato(empleador);
    const contratoExistente = contratosGestionados[empleador.cedula];
    setFormData({
      montoAprobEuro: contratoExistente?.monto_aprob_euro || "",
      montoBs: contratoExistente?.monto_bs || "",
      cincoFlat: contratoExistente?.cincoflat || "",
      diezInteres: contratoExistente?.diezinteres || "",
      montoDevolver: contratoExistente?.monto_devolver || "",
      montoSemana: contratoExistente?.monto_semanal || "",
      fechaDesde: contratoExistente?.fecha_desde || "",
      fechaHasta: contratoExistente?.fecha_hasta || "",
      estatus: contratoExistente?.estatus || "Pendiente",
    });
  };

  const handleGuardarContrato = async () => {
    try {
      // Preparar datos según la configuración
      const contratoData = {
        ...formData,
        monto_bs_neto: formData.monto_bs_neto,
        monto_restado: formData.monto_restado,
        frecuencia_pago_contrato:
          configuracion?.frecuencia_pago === "Personalizado"
            ? "Personalizado"
            : configuracion?.frecuencia_pago || "Semanal",
        dias_personalizados:
          configuracion?.frecuencia_pago === "Personalizado"
            ? formData.dias_personalizados
            : null,
        cuotas: configuracion?.numero_cuotas || "No definida",
        gracia: configuracion?.cuotasgracias || "No definida",
        interes: configuracion?.porcentaje_interes || "No definida",
        morosidad: configuracion?.porcentaje_mora || "No definida",
        monto_cuota: formData.monto_cuota || formData.monto_semanal,
      };

      console.log("Enviando contrato:", contratoData);

      const respuesta = await registrarContrato(contratoData);
      alert("Contrato registrado con éxito");

      // Limpiar formulario
      setFormData((prev) => ({
        ...prev,
        monto_aprob_euro: "",
        monto_bs: "",
        monto_bs_neto: "",
        monto_restado: "",
        diezinteres: "",
        monto_devolver: "",
        monto_semanal: "",
        monto_cuota: "",
        dias_personalizados: "",
        // Mantener los valores de configuración
        cuotas: configuracion?.numero_cuotas || "No definida",
        gracia: configuracion?.cuotasgracias || "No definida",
        interes: configuracion?.porcentaje_interes || "No definida",
        morosidad: configuracion?.porcentaje_mora || "No definida",
      }));
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el contrato");
    }
  };

  const cancelarGestion = () => {
    setGestionandoContrato(null);
  };

  const confirmarGestionContrato = async () => {
    try {
      if (
        !formData.montoAprobEuro ||
        !formData.fechaDesde ||
        !formData.fechaHasta
      ) {
        alert("Por favor complete los campos obligatorios");
        return;
      }

      const contratoData = {
        numero_contrato: formData.numero_contrato,
        cedula_emprendedor: formData.cedula_emprendedor,
        monto_aprob_euro: formData.monto_aprob_euro,
        monto_bs: formData.monto_bs,
        cincoflat: formData.cincoflat,
        diezinteres: formData.diezinteres,
        monto_devolver: formData.monto_devolver,
        monto_semanal: formData.monto_semanal,
        fecha_desde: formData.fecha_desde,
        fecha_hasta: formData.fecha_hasta,
        estatus: formData.estatus,

        frecuencia_pago_contrato:
          configuracion?.frecuencia_pago === "Personalizado"
            ? "Personalizado"
            : configuracion?.frecuencia_pago || "Semanal",
        dias_personalizados:
          configuracion?.frecuencia_pago === "Personalizado"
            ? formData.dias_personalizados
            : null,
      };

      console.log("Gestionando contrato:", contratoData);

      setContratosGestionados((prev) => ({
        ...prev,
        [gestionandoContrato.id]: contratoData,
      }));

      setGestionandoContrato(null);
      alert("Contrato gestionado exitosamente");
    } catch (error) {
      console.error("Error gestionando contrato:", error);
      alert("Error al gestionar contrato");
    }
  };

  const iniciarEdicionBancarios = (empleador) => {
    setEditandoBancarios(empleador);
    setFormData((prev) => ({
      ...prev,
      banco: empleador.datosBancarios?.banco || "",
      cedulaTitular:
        empleador.datosBancarios?.cedulaTitular || empleador.cedula,
      nombreCompleto:
        empleador.datosBancarios?.nombreCompleto || empleador.nombre,
      numeroCueta: empleador.datosBancarios?.numeroCuenta || "",
    }));
  };

  const cancelarEdicionBancarios = () => {
    setEditandoBancarios(null);
  };

  const confirmarDatosBancarios = async () => {
    try {
      if (
        !formData.banco ||
        !formData.cedulaTitular ||
        !formData.nombreCompleto ||
        !formData.numeroCuenta
      ) {
        alert("Por favor complete todos los campos bancarios");
        return;
      }

      const datosBancarios = {
        banco: formData.banco,
        cedula_titular: formData.cedulaTitular,
        nombre_completo: formData.nombreCompleto,
        numero_cuenta: formData.numeroCuenta,
      };

      console.log("Guardando datos bancarios:", {
        cedula_emprendedor: editandoBancarios.cedula,
        ...datosBancarios,
      });

      const updatedEmpleadores = empleadores.map((e) =>
        e.id === editandoBancarios.id
          ? {
              ...e,
              tieneDatosBancarios: true,
              datosBancarios: datosBancarios,
            }
          : e
      );

      setEmpleadores(updatedEmpleadores);
      setEditandoBancarios(null);

      alert("Datos bancarios guardados exitosamente");
    } catch (error) {
      console.error("Error guardando datos bancarios:", error);
      alert("Error al guardar datos bancarios");
    }
  };

  // Registrar depósito
  const registrarDeposito = async () => {
    try {
      if (!depositoData.comprobante) {
        alert("Adjunta el comprobante");
        return;
      }

      const formData = new FormData();
      formData.append("emprendedorId", depositoData.emprendedorId);
      formData.append("cedula_emprendedor", depositoData.cedula_emprendedor);
      formData.append("estado", depositoData.estado);
      formData.append("comprobante", depositoData.comprobante);

      const response = await fetch("http://localhost:5000/api/deposito", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al registrar depósito");
      }

      const data = await response.json();

      const emprendedor = empleadores.find(
        (e) => e.id === parseInt(depositoData.emprendedorId)
      );

      const nuevoDeposito = {
        id: data.id || Date.now(),
        emprendedorId: parseInt(depositoData.emprendedorId),
        fecha: new Date().toISOString().split("T")[0],
        estado: depositoData.estado,
        comprobante: data.comprobante,
      };

      setDepositos((prev) => [...prev, nuevoDeposito]);

      setDepositoData({
        emprendedorId: "",
        estado: "Completado",
        comprobante: null,
        comprobantePreview: null,
      });

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      alert("Depósito registrado exitosamente");
    } catch (error) {
      console.error("Error registrando depósito:", error);
      alert("Error al registrar depósito");
    }
  };

  const verDetalles = (empleador) => {
    setEmpleadorModal(empleador);
  };

  const cerrarModal = () => {
    setEmpleadorModal(null);
  };

  // Modal para ver detalles de contratos gestionados
  const ModalDetalles = ({ empleador, onClose }) => {
    const contratosDelEmpleador = empleadores.filter(
      (e) => e.cedula === empleador.cedula
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Detalles de {empleador.nombre}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onClose}
            >
              <TbX size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Información Básica
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-600">Cédula:</span>{" "}
                  {empleador.cedula}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Contratos:</span>{" "}
                  {contratosDelEmpleador.length}
                </p>
              </div>
            </div>

            {empleador.tieneDatosBancarios && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Información Bancaria
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <p>
                    <span className="font-medium text-gray-600">Banco:</span>{" "}
                    {empleador.datosBancarios.banco}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Número de Cuenta:
                    </span>{" "}
                    {empleador.datosBancarios.numeroCuenta}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Titular:</span>{" "}
                    {empleador.datosBancarios.nombreCompleto}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Cédula del Titular:
                    </span>{" "}
                    {empleador.datosBancarios.cedulaTitular}
                  </p>
                </div>
              </div>
            )}
          </div>

          {contratosDelEmpleador.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <h3 className="text-lg font-semibold bg-gray-50 px-6 py-3 border-b border-gray-200">
                Detalles de los Contratos ({contratosDelEmpleador.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Contrato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frecuencia Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto en euros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto en Bolívares
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto Neto (Bs)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {configuracion?.porcentaje_flat || 0}% FLAT (Bs)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        10% Interés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto a devolver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto semanal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto cuota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cuotas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gracia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Morosidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Desde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hasta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estatus
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contratosDelEmpleador.map((contrato, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {contrato.numero_contrato ||
                            contrato.numeroContrato ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.frecuencia_pago_contrato}
                          {contrato.frecuencia_pago_contrato ===
                            "Personalizado" &&
                            contrato.dias_personalizados && (
                              <div className="text-xs text-gray-400">
                                ({contrato.dias_personalizados})
                              </div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contrato.monto_aprob_euro} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.monto_bs} Bs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.monto_bs_neto || "N/A"} Bs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.cincoflat} Bs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.diezinteres} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {contrato.monto_devolver} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.monto_semanal} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.monto_cuota} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.cuotas}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.gracia} días
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.interes}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.morosidad}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.fecha_desde}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.fecha_hasta}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              contrato.estatus === "Aprobada"
                                ? "bg-green-100 text-green-800"
                                : contrato.estatus === "Pendiente"
                                ? "bg-red-100 text-red-800"
                                : contrato.estatus === "Activo"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {contrato.estatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay contratos gestionados para este emprendedor.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50  mt-15">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md">
                <TbFile size={24} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Gestión de contratos
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Administra los contratos de los emprendedores
                </p>
              </div>
            </div>

            {rates.euro && rates.dolar ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    {configuracion?.moneda === "USD" ? (
                      <TbCurrencyDollar size={20} className="text-indigo-600" />
                    ) : (
                      <TbCurrencyDollar size={20} className="text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Tipo de cambio{" "}
                      {configuracion?.moneda === "USD" ? "USD/VES" : "EUR/VES"}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      1{configuracion?.moneda === "USD" ? "$" : "€"} ={" "}
                      {configuracion?.moneda === "USD"
                        ? rates.dolar
                        : rates.euro}{" "}
                      Bs
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-6 w-32 bg-gray-300 rounded"></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <nav className="flex overflow-x-auto">
              {["asignacion", "gestion", "bancarios", "depositos"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "asignacion" && "Asignación de Contratos"}
                    {tab === "gestion" && "Gestión de Contratos"}
                    {tab === "bancarios" && "Datos Bancarios"}
                    {tab === "depositos" && "Gestión de Depósitos"}
                  </button>
                )
              )}
            </nav>
          </div>

          {comprobanteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto relative">
                <button
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 bg-white rounded-full p-1 shadow-md"
                  onClick={cerrarModalComprobante}
                >
                  <TbX size={20} />
                </button>
                <img
                  src={comprobanteModal}
                  alt="Comprobante de pago"
                  className="w-full h-auto max-h-[80vh] object-contain rounded"
                />
              </div>
            </div>
          )}

          {asignandoContrato && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Asignar contrato
                  </h2>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={cancelarAsignacion}
                  >
                    <TbX size={24} />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Asignando contrato a{" "}
                  <strong>{asignandoContrato.nombre}</strong>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de contrato
                    </label>
                    <input
                      type="text"
                      name="numero_contrato"
                      value={formData.numeroContrato}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ej: CTO-001"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={cancelarAsignacion}
                    >
                      Cancelar
                    </button>
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      onClick={confirmarAsignacionContrato}
                    >
                      Asignar Contrato
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "asignacion" && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(contratosAgrupados).length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                        <TbUser size={48} className="text-gray-400 mb-4 mx-auto" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                          No hay emprendedores registrados
                        </h3>
                        <p className="text-gray-500">
                          Todos los emprendedores aprobados aparecerán aquí
                        </p>
                      </div>
                    </div>
                  ) : (
                    Object.values(contratosAgrupados).map((grupo) => (
                      <div
                        key={grupo.empleador.cedula}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {grupo.empleador.nombre}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Cédula: {grupo.empleador.cedula}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Contratos: {grupo.contratos.length}
                            </p>
                          </div>
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <TbUser size={20} className="text-indigo-600" />
                          </div>
                        </div>

                        <div className="mb-4">
                          {grupo.empleador.tieneContrato ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center">
                                <TbCircleCheck size={16} className="text-green-600 mr-2" />
                                <span className="text-green-700 font-medium">
                                  Contrato asignado
                                </span>
                              </div>
                              <p className="text-green-600 text-sm mt-1">
                                {grupo.empleador.numeroContrato}
                              </p>
                            </div>
                          ) : (
                            <button
                              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                              onClick={() =>
                                iniciarAsignacionContrato(grupo.empleador)
                              }
                            >
                              <TbFileText size={16} className="mr-2" />
                              Asignar contrato
                            </button>
                          )}
                        </div>

                        <button
                          className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center"
                          onClick={() => verDetalles(grupo.empleador)}
                        >
                          <TbEye size={16} className="mr-1" />
                          Ver detalles
                        </button>
                      </div>
                    ))
                  )}
                </section>
              )}

              {activeTab === "gestion" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                      Gestión de Contrato
                    </h2>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleGuardarContrato();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seleccionar emprendedor
                        </label>
                        <select
                          value={selectedEmpleadorId}
                          onChange={handleEmpleadorChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">
                            -- Selecciona un emprendedor --
                          </option>
                          {Object.values(contratosAgrupados).map((grupo) => (
                            <option
                              key={grupo.empleador.id}
                              value={grupo.empleador.id}
                            >
                              {grupo.empleador.nombre} -{" "}
                              {grupo.empleador.cedula}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto aprobado (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="monto_aprob_euro"
                            value={formData.monto_aprob_euro}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto (Bs) - Total
                          </label>
                          <input
                            type="text"
                            name="monto_bs"
                            value={formData.monto_bs}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto Neto (Bs) - Menos{" "}
                            {configuracion?.porcentaje_flat || 0}% Flat
                          </label>
                          <input
                            type="text"
                            name="monto_bs_neto"
                            value={formData.monto_bs_neto}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Monto total menos el{" "}
                            {configuracion?.porcentaje_flat || 0}% de flat
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {configuracion?.porcentaje_flat || 0}% Monto Restado
                            (Bs)
                          </label>
                          <input
                            type="text"
                            name="monto_restado"
                            value={formData.monto_restado}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Monto descontado por concepto de flat
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto a devolver (€)
                          </label>
                          <input
                            type="text"
                            name="monto_devolver"
                            value={formData.monto_devolver}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto semanal (€)
                          </label>
                          <input
                            type="text"
                            name="monto_semanal"
                            value={formData.monto_semanal}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Monto a devolver dividido en{" "}
                            {configuracion?.numero_cuotas || 18} cuotas
                          </p>
                        </div>

                        {/* Nuevos campos que toman valores de la configuración */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto de Cuota (€)
                          </label>
                          <input
                            type="text"
                            name="monto_cuota"
                            value={formData.monto_cuota}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Cuotas
                          </label>
                          <input
                            type="text"
                            name="cuotas"
                            value={formData.cuotas}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Configuración del sistema:{" "}
                            {configuracion?.numero_cuotas || "No definida"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Período de Gracia (días)
                          </label>
                          <input
                            type="text"
                            name="gracia"
                            value={formData.gracia}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Configuración del sistema:{" "}
                            {configuracion?.cuotasgracias || "No definida"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tasa de Interés (%)
                          </label>
                          <input
                            type="text"
                            name="interes"
                            value={formData.interes}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Configuración del sistema:{" "}
                            {configuracion?.porcentaje_interes || "No definida"}
                            %
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tasa de Morosidad (%)
                          </label>
                          <input
                            type="text"
                            name="morosidad"
                            value={formData.morosidad}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Configuración del sistema:{" "}
                            {configuracion?.porcentaje_mora || "No definida"}%
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frecuencia de Pago
                          </label>

                          {configuracion?.frecuencia_pago ===
                          "Personalizado" ? (
                            <div>
                              <input
                                type="text"
                                name="dias_personalizados"
                                value={formData.dias_personalizados}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ej: Lunes, Miércoles, Viernes"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Especifica los días de pago según la
                                configuración personalizada
                              </p>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="text"
                                value={
                                  configuracion?.frecuencia_pago ||
                                  "No definida"
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                                readOnly
                              />
                              <input
                                type="hidden"
                                name="frecuencia_pago_contrato"
                                value={
                                  configuracion?.frecuencia_pago || "Semanal"
                                }
                              />
                            </div>
                          )}

                          <p className="text-xs text-blue-600 mt-1">
                            Configuración actual:{" "}
                            {configuracion?.frecuencia_pago || "No definida"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha desde
                          </label>
                          <input
                            type="date"
                            name="fecha_desde"
                            value={formData.fecha_desde}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha hasta
                          </label>
                          <input
                            type="date"
                            name="fecha_hasta"
                            value={formData.fecha_hasta}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estatus
                          </label>
                          <select
                            name="estatus"
                            value={formData.estatus}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Activo">Activo</option>
                            <option value="Completado">Completado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          onClick={cancelarGestion}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Guardar Contrato
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Contratos Asignados
                      </h2>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Buscar emprendedor..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                        <TbSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.values(contratosAgrupados)
                        .filter((grupo) => grupo.empleador.tieneContrato)
                        .filter(
                          (grupo) =>
                            grupo.empleador.nombre
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            grupo.empleador.cedula.includes(searchTerm)
                        ).length === 0 ? (
                        <div className="text-center py-8">
                          <TbFolderOpen size={48} className="text-gray-400 mb-3 mx-auto" />
                          <p className="text-gray-500">
                            No hay contratos asignados
                          </p>
                        </div>
                      ) : (
                        Object.values(contratosAgrupados)
                          .filter((grupo) => grupo.empleador.tieneContrato)
                          .filter(
                            (grupo) =>
                              grupo.empleador.nombre
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              grupo.empleador.cedula.includes(searchTerm)
                          )
                          .map((grupo) => (
                            <div
                              key={grupo.empleador.cedula}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-800">
                                  {grupo.empleador.nombre}
                                </h3>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {grupo.contratos.length} contrato(s)
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                Cédula: {grupo.empleador.cedula}
                              </p>

                              <div className="mb-3">
                                {grupo.contratos.map((contrato, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-2 rounded border mb-2"
                                  >
                                    <p className="text-sm font-medium text-indigo-600">
                                      {contrato.numeroContrato}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Frecuencia:{" "}
                                      {contrato.frecuencia_pago_contrato}
                                      {contrato.frecuencia_pago_contrato ===
                                        "Personalizado" &&
                                        contrato.dias_personalizados && (
                                          <span>
                                            {" "}
                                            ({contrato.dias_personalizados})
                                          </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Estatus: {contrato.estatus}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <button
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                                onClick={() => verDetalles(grupo.empleador)}
                              >
                                <TbEye size={16} className="mr-1" />
                                Ver detalles del contrato
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "bancarios" && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empleadores.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">
                        No hay emprendedores registrados.
                      </p>
                    </div>
                  ) : (
                    empleadores.map((empleador) => (
                      <div
                        key={empleador.id}
                        className="bg-white rounded-xl shadow-lg p-4 border-t-4 relative"
                        style={{ borderColor: "#0F3C5B" }}
                      >
                        <h2 className="text-xl font-semibold mb-2">
                          {empleador.nombre}
                        </h2>

                        <div className="mb-4">
                          {empleador ? (
                            <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md">
                              <p className="font-semibold">
                                Datos bancarios registrados
                              </p>
                              <p className="text-sm mt-1">
                                <strong>C.I titular:</strong>{" "}
                                {empleador.cedula_titular}
                              </p>
                              <p className="text-sm mt-1">
                                <strong>Banco:</strong> {empleador.banco}
                              </p>
                              <p className="text-sm">
                                <strong>Titular:</strong>{" "}
                                {empleador.nombre_completo_cuenta}
                              </p>
                              <p className="text-sm">
                                <strong>N° Cuenta:</strong>{" "}
                                {empleador.numero_cuenta}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md">
                              <p className="font-semibold">
                                Sin datos bancarios
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </section>
              )}

              {activeTab === "depositos" && (
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">
                      Registrar nuevo depósito
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seleccionar emprendedor
                        </label>
                        <select
                          value={selectedEmpleadorId}
                          onChange={handleEmpleadorChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">
                            -- Selecciona un emprendedor --
                          </option>
                          {Object.values(contratosAgrupados).map((grupo) => (
                            <option
                              key={grupo.empleador.id}
                              value={grupo.empleador.id}
                            >
                              {grupo.empleador.nombre} -{" "}
                              {grupo.empleador.cedula}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comprobante de pago
                        </label>
                        <div className="mb-2 text-xs text-gray-500">
                          Formatos: JPG, PNG, GIF. Máximo: 5MB
                        </div>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {depositoData.sizeError && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            <TbErrorCircle className="align-middle mr-1" size={16} />
                            {depositoData.sizeError}
                          </div>
                        )}

                        {depositoData.comprobantePreview && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">
                              Vista previa:
                            </p>
                            <img
                              src={depositoData.comprobantePreview}
                              alt="Comprobante de pago"
                              className="w-full h-48 object-contain border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {depositoData.comprobante.name} -
                              {formatFileSize(depositoData.comprobante.size)}
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                        onClick={registrarDeposito}
                        disabled={!depositoData.comprobante}
                      >
                        <TbCircleCheck size={16} className="mr-2" />
                        Registrar Depósito
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">
                      Historial de Depósitos
                    </h3>

                    {depositos.length === 0 ? (
                      <div className="text-center py-8">
                        <TbReceipt size={48} className="text-gray-400 mb-3 mx-auto" />
                        <p className="text-gray-500">
                          No hay depósitos registrados
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Emprendedor
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Comprobante
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {depositos.map((deposito) => (
                              <tr
                                key={deposito.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {deposito.nombre}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {deposito.cedula_emprendedor}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      deposito.estado === "Verificado"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {deposito.estado}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {deposito.comprobante ? (
                                    <button
                                      onClick={() =>
                                        handleVerComprobante(
                                          deposito.comprobante
                                        )
                                      }
                                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                                    >
                                      <TbPhoto size={16} className="mr-1" />
                                      Ver comprobante
                                    </button>
                                  ) : (
                                    <span className="text-gray-500 text-sm">
                                      Sin comprobante
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>

      {empleadorModal && (
        <ModalDetalles empleador={empleadorModal} onClose={cerrarModal} />
      )}
    </div>
  );
};

export default Gestion;