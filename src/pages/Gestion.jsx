import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { registrarContrato } from "../services/api_contrato";

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
    cincoflat: "",
    diezinteres: "",
    monto_devolver: "",
    monto_semanal: "", // Nuevo campo
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
  const [rateEuroToVES, setRateEuroToVES] = useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEmpleadorId, setSelectedEmpleadorId] = React.useState("");
  const [comprobanteModal, setComprobanteModal] = useState(null);
  const [contratosAgrupados, setContratosAgrupados] = useState({});

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

    // Limpiar error previo
    setDepositoData((prev) => ({
      ...prev,
      sizeError: "",
    }));

    if (file) {
      // Validar tipo de archivo
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setDepositoData((prev) => ({
          ...prev,
          sizeError: "Formato no válido. Solo se aceptan JPG, PNG o GIF.",
        }));
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setDepositoData((prev) => ({
          ...prev,
          sizeError: `La imagen es demasiado grande (${sizeInMB} MB). El tamaño máximo permitido es 5MB.`,
        }));
        return;
      }

      // Crear preview si la imagen es válida
      const reader = new FileReader();
      reader.onload = (e) => {
        setDepositoData((prev) => ({
          ...prev,
          comprobante: file,
          comprobantePreview: e.target.result,
          sizeError: "", // Limpiar error si todo está bien
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // Si no hay archivo, limpiar todo
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
    // Sumamos 20 semanas (20 * 7 días)
    fechahasta.setDate(fechahasta.getDate() + 20 * 7);
    // Formatear fechas (ejemplo: YYYY-MM-DD)
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
  }, [formData.fecha_desde]);

  // Inicializar la fecha desde con la fecha actual
  React.useEffect(() => {
    const hoy = new Date();
    const formatDate = hoy.toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      fecha_desde: formatDate,
    }));
  }, []);

  // Actualizar montos y cálculos cuando monto_aprob_euro cambie
  React.useEffect(() => {
    const montoEuro = parseFloat(formData.monto_aprob_euro);
    if (!isNaN(montoEuro)) {
      const flat5 = (montoEuro * 0.05).toFixed(2);
      const interes10 = (montoEuro * 0.1).toFixed(2);
      const montoDevolverCalc = (montoEuro + parseFloat(interes10)).toFixed(2);
      const montoSemanalCalc = (parseFloat(montoDevolverCalc) / 18).toFixed(2); // Nuevo cálculo

      setFormData((prev) => ({
        ...prev,
        cincoflat: flat5,
        diezinteres: interes10,
        monto_devolver: montoDevolverCalc,
        monto_semanal: montoSemanalCalc, // Actualizar monto semanal
      }));
    } else {
      // Limpia si no es válido
      setFormData((prev) => ({
        ...prev,
        cincoflat: "",
        diezinteres: "",
        monto_devolver: "",
        monto_semanal: "", // Limpiar también el monto semanal
      }));
    }
  }, [formData.monto_aprob_euro]);

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

  const fetchEuroToVESRate = async () => {
    try {
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/EUR"
      );
      const rate = response.data.rates["VES"];
      setRateEuroToVES(rate);
    } catch (error) {
      console.error("Error al obtener la tasa EUR a VES:", error);
    }
  };

  React.useEffect(() => {
    if (rateEuroToVES && formData.monto_aprob_euro) {
      const montoEuro = parseFloat(formData.monto_aprob_euro);
      if (!isNaN(montoEuro)) {
        const montoBolivares = (montoEuro * rateEuroToVES).toFixed(2);
        setFormData((prev) => ({
          ...prev,
          monto_bs: montoBolivares,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          monto_bs: "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        monto_bs: "",
      }));
    }
  }, [formData.monto_aprob_euro, rateEuroToVES]);

  useEffect(() => {
    fetchEuroToVESRate();
  }, []);

  useEffect(() => {
    cargarEmpleadores();
    cargarDepositos();
  }, []);

  const generarNumeroContrato = () => {
    const ano = getAnoActual();
    const secuenciaStr = String(secuencia).padStart(3, "0"); // 001, 002, ...
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

  // Agrega esta función en tu componente (fuera del componente principal)
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
        cincoflat: emprendedor.cincoflat || null,
        diezinteres: emprendedor.diezinteres || null,
        monto_devolver: emprendedor.monto_devolver || null,
        monto_semanal: emprendedor.monto_semanal || null, // Nuevo campo
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
      // La respuesta debe ser un array de depósitos
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

  // Manejar cambios en los campos
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

      // Llamada a la API para asignar contrato
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

      // Actualizar estado local
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

  // Cuando inicies la gestión de contrato:
  const iniciarGestionContrato = (empleador) => {
    setGestionandoContrato(empleador);
    // Cargar datos existentes o vacíos en formData
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
      const respuesta = await registrarContrato(formData);
      // Aquí puedes mostrar una notificación o actualizar el estado
      alert("Contrato registrado con éxito");
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

      // Aquí iría la llamada a la API para guardar en contrato
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
      };

      console.log("Gestionando contrato:", contratoData);

      // Guardar en estado local
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
    // Prellenar el formulario con datos existentes si los hay
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

      // Aquí iría la llamada a la API para guardar en cuenta
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

      // Actualizar estado local
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

      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append("emprendedorId", depositoData.emprendedorId);
      formData.append("cedula_emprendedor", depositoData.cedula_emprendedor);
      formData.append("estado", depositoData.estado);
      formData.append("comprobante", depositoData.comprobante);

      // Enviar a la API
      const response = await fetch("http://localhost:5000/api/deposito", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al registrar depósito");
      }

      const data = await response.json();

      // Actualizar estado local
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

      // Limpiar formulario
      setDepositoData({
        emprendedorId: "",
        estado: "Completado",
        comprobante: null,
        comprobantePreview: null,
      });

      // Limpiar input de archivo
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
  // Modal para ver detalles de contratos gestionados
  const ModalDetalles = ({ empleador, onClose }) => {
    // Obtener todos los contratos para este emprendedor
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
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
                        Monto en euros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto en Bolívares
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        5% FLAT
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contrato.monto_aprob_euro} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.monto_bs} Bs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contrato.cincoflat} €
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
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="flex-1 p-6">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md">
                <i className="bx bx-file text-2xl text-indigo-600"></i>
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

            {/* Tarjeta de tipo de cambio */}
            {rateEuroToVES ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <i className="bx bx-euro text-xl text-indigo-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Tipo de cambio EUR/VES
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      1€ = {rateEuroToVES} Bs
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

          {/* Tabs de navegación */}
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
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <img
                  src={comprobanteModal}
                  alt="Comprobante de pago"
                  className="w-full h-auto max-h-[80vh] object-contain rounded"
                />
              </div>
            </div>
          )}

          {/* Modal de asignación de contrato */}
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
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
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
              {/* Contenido según pestaña activa */}
              {activeTab === "asignacion" && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(contratosAgrupados).length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                        <i className="bx bx-user-x text-4xl text-gray-400 mb-4"></i>
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
                            <i className="bx bx-user text-indigo-600"></i>
                          </div>
                        </div>

                        <div className="mb-4">
                          {grupo.empleador.tieneContrato ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center">
                                <i className="bx bx-check-circle text-green-600 mr-2"></i>
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
                              <i className="bx bx-file-blank mr-2"></i>
                              Asignar contrato
                            </button>
                          )}
                        </div>

                        <button
                          className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center"
                          onClick={() => verDetalles(grupo.empleador)}
                        >
                          <i className="bx bx-show mr-1"></i>
                          Ver detalles
                        </button>
                      </div>
                    ))
                  )}
                </section>
              )}

              {activeTab === "gestion" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Formulario */}
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
                            Monto (Bs)
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
                            5% Flat (€)
                          </label>
                          <input
                            type="text"
                            name="cincoflat"
                            value={formData.cincoflat}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            10% Interés (€)
                          </label>
                          <input
                            type="text"
                            name="diezinteres"
                            value={formData.diezinteres}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            readOnly
                          />
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
                            Monto a devolver dividido en 18 semanas
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

                  {/* Lista de contratos */}
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
                        <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
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
                          <i className="bx bx-folder-open text-4xl text-gray-400 mb-3"></i>
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

                              {/* Listar todos los contratos para este emprendedor */}
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
                                      Estatus: {contrato.estatus}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <button
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                                onClick={() => verDetalles(grupo.empleador)}
                              >
                                <i className="bx bx-show mr-1"></i>
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
                  {Object.keys(contratosAgrupados).length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                        <i className="bx bx-credit-card text-4xl text-gray-400 mb-4"></i>
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
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <i className="bx bx-credit-card text-blue-600"></i>
                          </div>
                        </div>

                        <div className="mb-4">
                          {grupo.empleador.tieneDatosBancarios ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <i className="bx bx-check-circle text-blue-600 mr-2"></i>
                                <span className="text-blue-700 font-medium">
                                  Datos bancarios registrados
                                </span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="font-medium">Banco:</span>{" "}
                                  {grupo.empleador.banco}
                                </p>
                                <p>
                                  <span className="font-medium">Titular:</span>{" "}
                                  {grupo.empleador.nombre_completo_cuenta}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    C.I titular:
                                  </span>{" "}
                                  {grupo.empleador.cedula_titular}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    N° Cuenta:
                                  </span>{" "}
                                  {grupo.empleador.numero_cuenta}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <i className="bx bx-info-circle text-gray-600 mr-2"></i>
                                <span className="text-gray-700">
                                  Sin datos bancarios
                                </span>
                              </div>
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
                  {/* Formulario de registro de depósitos */}
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
                            <i className="bx bx-error-circle align-middle mr-1"></i>
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
                        <i className="bx bx-check-circle mr-2"></i>
                        Registrar Depósito
                      </button>
                    </div>
                  </div>

                  {/* Historial de depósitos */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">
                      Historial de Depósitos
                    </h3>

                    {depositos.length === 0 ? (
                      <div className="text-center py-8">
                        <i className="bx bx-receipt text-4xl text-gray-400 mb-3"></i>
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
                                      <i className="bx bx-image-alt mr-1"></i>
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

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>

      {/* Mostrar modal si hay un empleador seleccionado */}
      {empleadorModal && (
        <ModalDetalles empleador={empleadorModal} onClose={cerrarModal} />
      )}
    </div>
  );
};

export default Gestion;
