import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from "../services/api_usuario";

const Cuotas = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionIFEMI, setMostrarConfirmacionIFEMI] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [cargando, setCargando] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [comentariosIFEMI, setComentariosIFEMI] = useState("");
  const [filaExpandida, setFilaExpandida] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [orden, setOrden] = useState({
    campo: "numeroSemana",
    direccion: "asc",
  });
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [tasaCambio, setTasaCambio] = useState(40);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            await cargarContratos(usuario.id);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario por cédula:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  const calcularMorosidad = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);

    if (hoy < vencimiento) return { dias: 0, horas: 0, porcentaje: 0 };

    const diffTime = Math.abs(hoy - vencimiento);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    const porcentajePorHora = 2 / 24;
    const porcentajeRecargo = diffDays * 2 + diffHours * porcentajePorHora;

    return {
      dias: diffDays,
      horas: diffHours,
      porcentaje: parseFloat(porcentajeRecargo.toFixed(2)),
    };
  };

  useEffect(() => {
    if (
      cuotas.some(
        (cuota) =>
          cuota.estado === "Pendiente" &&
          new Date(cuota.fechaVencimiento) < new Date()
      )
    ) {
      const interval = setInterval(() => {
        const cuotasActualizadas = cuotas.map((cuota) => {
          if (
            cuota.estado === "Pendiente" &&
            new Date(cuota.fechaVencimiento) < new Date()
          ) {
            const morosidad = calcularMorosidad(cuota.fechaVencimiento);
            return {
              ...cuota,
              montoConRecargo: cuota.monto * (1 + morosidad.porcentaje / 100),
              diasMorosidad: morosidad.dias,
              horasMorosidad: morosidad.horas,
              porcentajeRecargo: morosidad.porcentaje,
            };
          }
          return cuota;
        });
        setCuotas(cuotasActualizadas);
        setUltimaActualizacion(new Date());
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [cuotas]);

  useEffect(() => {
    if (mostrarConfirmacion && cuotaSeleccionada) {
      const interval = setInterval(() => {
        const morosidad = calcularMorosidad(cuotaSeleccionada.fechaVencimiento);
        setCuotaSeleccionada((prev) => ({
          ...prev,
          montoConRecargo: prev.monto * (1 + morosidad.porcentaje / 100),
          porcentajeRecargo: morosidad.porcentaje,
          diasMorosidad: morosidad.dias,
          horasMorosidad: morosidad.horas,
        }));
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [mostrarConfirmacion, cuotaSeleccionada]);

  const cargarContratos = async (userId) => {
    setCargando(true);
    try {
      const contratosEjemplo = [
        {
          id: 1,
          numero: "CT-2023-001",
          nombre: "Contrato Emprendimiento A",
          estado: "Activo",
          montoTotal: 5400.0,
          fechaInicio: "2023-08-01",
          semanasTotales: 18,
          semanasGracia: 2,
        },
        {
          id: 2,
          numero: "CT-2023-002",
          nombre: "Contrato Emprendimiento B",
          estado: "Activo",
          montoTotal: 7200.0,
          fechaInicio: "2023-09-01",
          semanasTotales: 18,
          semanasGracia: 2,
        },
        {
          id: 3,
          numero: "CT-2022-005",
          nombre: "Contrato Antiguo",
          estado: "Finalizado",
          montoTotal: 6000.0,
          fechaInicio: "2022-06-01",
          semanasTotales: 18,
          semanasGracia: 2,
        },
      ];
      setContratos(contratosEjemplo);
      const contratoActivo =
        contratosEjemplo.find((c) => c.estado === "Activo") ||
        contratosEjemplo[0];
      if (contratoActivo) {
        setContratoSeleccionado(contratoActivo);
        await cargarCuotas(contratoActivo);
      }
    } catch (error) {
      console.error("Error al cargar contratos:", error);
    } finally {
      setCargando(false);
    }
  };

  const calcularRangoSemana = (fechaInicio, numeroSemana) => {
    const fechaInicioObj = new Date(fechaInicio);
    const fechaDesde = new Date(fechaInicioObj);
    fechaDesde.setDate(fechaInicioObj.getDate() + (numeroSemana - 1) * 7);
    
    const fechaHasta = new Date(fechaDesde);
    fechaHasta.setDate(fechaDesde.getDate() + 6);
    
    return {
      desde: fechaDesde.toISOString().split('T')[0],
      hasta: fechaHasta.toISOString().split('T')[0]
    };
  };

  const calcularFechaVencimiento = (fechaHasta) => {
    const fechaVencimiento = new Date(fechaHasta);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
    return fechaVencimiento.toISOString().split('T')[0];
  };

  const generarCuotasSemanales = (contrato) => {
    const cuotas = [];
    const montoSemanal = contrato.montoTotal / contrato.semanasTotales;
    
    for (let i = 1; i <= contrato.semanasTotales; i++) {
      const rangoSemana = calcularRangoSemana(contrato.fechaInicio, i);
      const fechaVencimiento = calcularFechaVencimiento(rangoSemana.hasta);
      
      const morosidad = calcularMorosidad(fechaVencimiento);
      const montoConRecargo = montoSemanal * (1 + morosidad.porcentaje / 100);
      const montoBolivares = montoConRecargo * tasaCambio;
      
      cuotas.push({
        id: i,
        numeroSemana: i,
        monto: montoSemanal,
        montoConRecargo: montoConRecargo,
        montoBolivares: montoBolivares,
        fechaDesde: rangoSemana.desde,
        fechaHasta: rangoSemana.hasta,
        fechaVencimiento: fechaVencimiento,
        estado: i === 1 ? "Pendiente" : "No vencida",
        descripcion: `Semana ${i}`,
        comprobante: null,
        confirmacionIFEMI: "Pendiente",
        comentariosIFEMI: "",
        diasMorosidad: morosidad.dias,
        horasMorosidad: morosidad.horas,
        porcentajeRecargo: morosidad.porcentaje,
        esSemanaGracia: false,
      });
    }
    
    for (let i = 1; i <= contrato.semanasGracia; i++) {
      const semanaNum = contrato.semanasTotales + i;
      const rangoSemana = calcularRangoSemana(contrato.fechaInicio, semanaNum);
      const fechaVencimiento = calcularFechaVencimiento(rangoSemana.hasta);
      
      cuotas.push({
        id: semanaNum,
        numeroSemana: semanaNum,
        monto: montoSemanal,
        montoConRecargo: montoSemanal,
        montoBolivares: montoSemanal * tasaCambio,
        fechaDesde: rangoSemana.desde,
        fechaHasta: rangoSemana.hasta,
        fechaVencimiento: fechaVencimiento,
        estado: "No vencida",
        descripcion: `Semana de gracia ${i}`,
        comprobante: null,
        confirmacionIFEMI: "Pendiente",
        comentariosIFEMI: "",
        diasMorosidad: 0,
        horasMorosidad: 0,
        porcentajeRecargo: 0,
        esSemanaGracia: true,
      });
    }
    
    return cuotas;
  };

  const cargarCuotas = async (contrato) => {
    setCargando(true);
    try {
      const cuotasGeneradas = generarCuotasSemanales(contrato);
      setCuotas(cuotasGeneradas);
    } catch (error) {
      console.error("Error al cargar cuotas:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleContratoChange = async (e) => {
    const contratoId = parseInt(e.target.value);
    const contrato = contratos.find((c) => c.id === contratoId);
    if (contrato) {
      setContratoSeleccionado(contrato);
      await cargarCuotas(contrato);
      setPaginaActual(1);
    }
  };

  const handleOrdenar = (campo) => {
    setOrden({
      campo,
      direccion:
        orden.campo === campo && orden.direccion === "asc" ? "desc" : "asc",
    });
  };

  const confirmarPago = (cuota) => {
    setCuotaSeleccionada(cuota);
    setMostrarConfirmacion(true);
  };

  const handleComprobanteChange = (e) => {
    setComprobante(e.target.files[0]);
  };

  const procesarPago = () => {
    const cuotasActualizadas = cuotas.map((cuota) =>
      cuota.id === cuotaSeleccionada.id
        ? {
            ...cuota,
            estado: "En verificación",
            comprobante: comprobante ? comprobante.name : "comprobante.pdf",
            confirmacionIFEMI: "Pendiente",
          }
        : cuota
    );
    const siguienteCuotaId = cuotaSeleccionada.id + 1;
    const siguienteCuotaIndex = cuotasActualizadas.findIndex(
      (c) => c.id === siguienteCuotaId
    );
    if (siguienteCuotaIndex !== -1) {
      cuotasActualizadas[siguienteCuotaIndex] = {
        ...cuotasActualizadas[siguienteCuotaIndex],
        estado: "Pendiente",
      };
    }
    setCuotas(cuotasActualizadas);
    setMostrarConfirmacion(false);
    setCuotaSeleccionada(null);
    setComprobante(null);
    alert(
      `Comprobante de pago de $${cuotaSeleccionada.montoConRecargo.toFixed(
        2
      )} enviado para verificación`
    );
  };

  const verDetallesIFEMI = (cuota) => {
    setCuotaSeleccionada(cuota);
    setComentariosIFEMI(cuota.comentariosIFEMI || "");
    setMostrarConfirmacionIFEMI(true);
  };

  const toggleFila = (id) => {
    setFilaExpandida((prev) => (prev === id ? null : id));
  };

  // Componente para los detalles expandidos (INDEPENDIENTE de la tabla)
  const DetallesExpandidos = ({ cuota, estaExpandida }) => {
    if (!estaExpandida) return null;
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg mt-2 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Detalles de pago:</p>
            <p><strong>Semana:</strong> {cuota.fechaDesde} al {cuota.fechaHasta}</p>
            <p><strong>Vence:</strong> {cuota.fechaVencimiento}</p>
            <p><strong>Monto original:</strong> ${cuota.monto.toFixed(2)} (€)</p>
            <p><strong>Monto en Bs:</strong> Bs {cuota.montoBolivares.toFixed(2)}</p>
          </div>
          <div>
            <p><strong>Recargo:</strong> {cuota.porcentajeRecargo}%</p>
            <p><strong>Total a pagar:</strong> ${cuota.montoConRecargo.toFixed(2)} (€)</p>
            <p><strong>Total en Bs:</strong> Bs {(cuota.montoConRecargo * tasaCambio).toFixed(2)}</p>
            {cuota.diasMorosidad > 0 && (
              <p className="text-red-600">
                <strong>Días de morosidad:</strong> {cuota.diasMorosidad}d {cuota.horasMorosidad}h
              </p>
            )}
            {cuota.comprobante && (
              <button
                className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                onClick={() => {
                  /* Lógica para descargar/view comprobante */
                }}
              >
                Ver comprobante
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          {cuota.estado === "Pendiente" && (
            <button
              onClick={() => confirmarPago(cuota)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
            >
              Pagar ahora
            </button>
          )}
          {(cuota.estado === "En verificación" || cuota.estado === "Pagada") && (
            <button
              onClick={() => verDetallesIFEMI(cuota)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
            >
              Ver detalles IFEMI
            </button>
          )}
        </div>
      </div>
    );
  };

  // Filtrado y ordenamiento
  const cuotasFiltradas = (
    filtroEstado === "Todas"
      ? cuotas
      : cuotas.filter((cuota) => cuota.estado === filtroEstado)
  )
    .filter(
      (cuota) =>
        cuota.descripcion
          .toLowerCase()
          .includes(terminoBusqueda.toLowerCase()) ||
        cuota.fechaVencimiento.includes(terminoBusqueda) ||
        cuota.monto.toString().includes(terminoBusqueda)
    )
    .sort((a, b) => {
      if (a[orden.campo] < b[orden.campo])
        return orden.direccion === "asc" ? -1 : 1;
      if (a[orden.campo] > b[orden.campo])
        return orden.direccion === "asc" ? 1 : -1;
      return 0;
    });

  // Paginación
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = cuotasFiltradas.slice(
    indicePrimerElemento,
    indiceUltimoElemento
  );
  const totalPaginas = Math.ceil(cuotasFiltradas.length / elementosPorPagina);

  const cuotasPendientes = cuotas.filter((c) => c.estado === "Pendiente");
  const totalPendiente = cuotasPendientes.reduce(
    (total, c) => total + c.montoConRecargo,
    0
  );
  const cuotasPagadas = cuotas.filter(
    (c) => c.estado === "Pagada" || c.estado === "En verificación"
  );
  const totalPagado = cuotasPagadas.reduce(
    (total, c) => total + c.montoConRecargo,
    0
  );
  const cuotasEnVerificacion = cuotas.filter(
    (c) => c.estado === "En verificación"
  );

  const getEstadoIFEMI = (cuota) => {
    if (cuota.estado === "Pendiente" || cuota.estado === "No vencida")
      return "Pendiente de pago";
    if (cuota.confirmacionIFEMI === "Pendiente") return "En revisión por IFEMI";
    if (cuota.confirmacionIFEMI === "Aprobada") return "Confirmado por IFEMI";
    if (cuota.confirmacionIFEMI === "Rechazada") return "Rechazado por IFEMI";
    return "Sin información";
  };

  const getClaseEstadoIFEMI = (cuota) => {
    if (cuota.estado === "Pendiente" || cuota.estado === "No vencida")
      return "bg-gray-100 text-gray-800";
    if (cuota.confirmacionIFEMI === "Pendiente")
      return "bg-yellow-100 text-yellow-800";
    if (cuota.confirmacionIFEMI === "Aprobada")
      return "bg-green-100 text-green-800";
    if (cuota.confirmacionIFEMI === "Rechazada")
      return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Componente de paginación
  const Paginacion = () => (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-700">
        Mostrando {indicePrimerElemento + 1} a{" "}
        {Math.min(indiceUltimoElemento, cuotasFiltradas.length)} de{" "}
        {cuotasFiltradas.length} resultados
      </div>
      <div className="flex space-x-2 items-center">
        <select
          value={elementosPorPagina}
          onChange={(e) => {
            setElementosPorPagina(Number(e.target.value));
            setPaginaActual(1);
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="5">5 por página</option>
          <option value="10">10 por página</option>
          <option value="20">20 por página</option>
          <option value="50">50 por página</option>
        </select>
        <button
          onClick={() => setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="px-3 py-1 rounded border disabled:opacity-50 text-sm"
        >
          Anterior
        </button>
        <span className="px-3 py-1 text-sm">
          Página {paginaActual} de {totalPaginas}
        </span>
        <button
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 rounded border disabled:opacity-50 text-sm"
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-4 md:p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 mt-10">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-money text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                Gestion de cuota
              </h1>
            </div>
            <div className="text-xs text-gray-500">
              Última actualización: {ultimaActualizacion.toLocaleTimeString()}
            </div>
          </div>

          {/* Selector de contrato */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 md:mb-4">
              Seleccionar Contrato
            </h2>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-grow">
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={contratoSeleccionado?.id || ""}
                  onChange={handleContratoChange}
                  disabled={cargando}
                >
                  {contratos.map((contrato) => (
                    <option key={contrato.id} value={contrato.id}>
                      {contrato.nombre} - {contrato.numero} ({contrato.estado})
                    </option>
                  ))}
                </select>
              </div>
              {contratoSeleccionado && (
                <div className="bg-blue-50 p-2 md:p-3 rounded-md text-sm md:text-base">
                  <p className="text-blue-800">
                    <span className="font-semibold">Monto total:</span> $
                    {contratoSeleccionado.montoTotal.toFixed(2)} |{" "}
                    <span className="font-semibold">Cuota semanal:</span> $
                    {(
                      contratoSeleccionado.montoTotal /
                      contratoSeleccionado.semanasTotales
                    ).toFixed(2)}{" "}
                    | <span className="font-semibold">Semanas:</span>{" "}
                    {contratoSeleccionado.semanasTotales} +{" "}
                    {contratoSeleccionado.semanasGracia} de gracia
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen de cuotas */}
          {contratoSeleccionado && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-8">
              {/* Pendientes */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-3 mr-3">
                    <i className="bx bx-time-five text-2xl text-blue-600"></i>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {cuotasPendientes.length}
                    </p>
                  </div>
                </div>
                <div className="mt-2 md:mt-4">
                  <p className="text-gray-700">
                    Total:{" "}
                    <span className="font-semibold">
                      ${totalPendiente.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
              {/* En verificación */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-yellow-100 p-3 mr-3">
                    <i className="bx bx-loader-alt text-2xl text-yellow-600"></i>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">En verificación</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {cuotasEnVerificacion.length}
                    </p>
                  </div>
                </div>
              </div>
              {/* Pagadas */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-3 mr-3">
                    <i className="bx bx-check-circle text-2xl text-green-600"></i>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Pagadas</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {cuotasPagadas.length}
                    </p>
                  </div>
                </div>
                <div className="mt-2 md:mt-4">
                  <p className="text-gray-700">
                    Total:{" "}
                    <span className="font-semibold">
                      ${totalPagado.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de cuotas */}
          {contratoSeleccionado && (
            <section className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-8">
              {/* Filtros */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 space-y-2 md:space-y-0">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Cuotas Semanales del Contrato
                </h2>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <input
                    type="text"
                    placeholder="Buscar cuota..."
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todas">Todas las cuotas</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="En verificación">En verificación</option>
                    <option value="Pagada">Pagadas</option>
                    <option value="No vencida">No vencidas</option>
                  </select>
                </div>
              </div>

              {/* Barra desplegable en pantallas pequeñas */}
              <div className="block md:hidden mb-2">
                <label htmlFor="limitePagina" className="mr-2 text-sm font-medium text-gray-700">
                  Mostrar:
                </label>
                <select
                  id="limitePagina"
                  value={elementosPorPagina}
                  onChange={(e) => {
                    setElementosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {cargando ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {/* Vista móvil (cards) */}
                  <div className="md:hidden grid gap-4 mb-4">
                    {elementosActuales.map((cuota) => (
                      <div
                        key={cuota.id}
                        className="bg-white rounded-lg shadow p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{cuota.descripcion}</p>
                            <p className="text-sm text-gray-600">
                              Semana: {cuota.fechaDesde} al {cuota.fechaHasta}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              cuota.estado === "Pagada"
                                ? "bg-green-100 text-green-800"
                                : cuota.estado === "En verificación"
                                ? "bg-blue-100 text-blue-800"
                                : cuota.estado === "Pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {cuota.estado}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <p className="text-sm">
                            Monto:{" "}
                            <span className="font-medium">
                              ${cuota.monto.toFixed(2)} (€)
                            </span>
                          </p>
                          <p className="text-sm">
                            En Bs:{" "}
                            <span className="font-medium">
                              Bs {cuota.montoBolivares.toFixed(2)}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFila(cuota.id)}
                          className="mt-2 w-full text-center text-blue-600 text-sm"
                        >
                          {filaExpandida === cuota.id
                            ? "Ocultar detalles"
                            : "Ver detalles"}
                        </button>

                        {/* Detalles expandidos en móvil */}
                        {filaExpandida === cuota.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p>
                                <strong>Vence:</strong> {cuota.fechaVencimiento}
                              </p>
                              <p>
                                <strong>Recargo:</strong>{" "}
                                {cuota.porcentajeRecargo}%
                              </p>
                              <p>
                                <strong>Total a pagar:</strong>{" "}
                                ${cuota.montoConRecargo.toFixed(2)} (€)
                              </p>
                              <p>
                                <strong>En Bs:</strong>{" "}
                                Bs {(cuota.montoConRecargo * tasaCambio).toFixed(2)}
                              </p>
                              <p>
                                <strong>Estado IFEMI:</strong>{" "}
                                {getEstadoIFEMI(cuota)}
                              </p>
                              {cuota.diasMorosidad > 0 && (
                                <p className="col-span-2 text-red-600">
                                  <strong>Días de morosidad:</strong>{" "}
                                  {cuota.diasMorosidad}d {cuota.horasMorosidad}h
                                </p>
                              )}
                              <p className="col-span-2">
                                <strong>Comentarios:</strong>{" "}
                                {cuota.comentariosIFEMI || "Sin comentarios"}
                              </p>
                            </div>
                            <div className="mt-3 flex flex-col space-y-2">
                              {cuota.estado === "Pendiente" &&  (
                                <button
                                  onClick={() => confirmarPago(cuota)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
                                >
                                  Pagar ahora
                                </button>
                              )}
                              {(cuota.estado === "En verificación" ||
                                cuota.estado === "Pagada") && (
                                <button
                                  onClick={() => verDetallesIFEMI(cuota)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
                                >
                                  Ver detalles
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Vista desktop (tabla) */}
                  <div className="hidden md:block overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleOrdenar("numeroSemana")}
                          >
                            Semana{" "}
                            {orden.campo === "numeroSemana" &&
                              (orden.direccion === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rango Semana
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleOrdenar("monto")}
                          >
                            Monto (€){" "}
                            {orden.campo === "monto" &&
                              (orden.direccion === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto (Bs)
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Recargo
                          </th>
                          <th
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleOrdenar("montoConRecargo")}
                          >
                            Total a Pagar (€){" "}
                            {orden.campo === "montoConRecargo" &&
                              (orden.direccion === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado Pago
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Confirmación IFEMI
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {elementosActuales.length > 0 ? (
                          elementosActuales.map((cuota) => (
                            <React.Fragment key={cuota.id}>
                              {/* Fila principal */}
                              <tr className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {cuota.descripcion}
                                  {cuota.esSemanaGracia && (
                                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                      Gracia
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {cuota.fechaDesde} al {cuota.fechaHasta}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  ${cuota.monto.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  Bs {cuota.montoBolivares.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {cuota.diasMorosidad > 0 ? (
                                    <div>
                                      <span className="text-red-600 font-semibold">
                                        {cuota.porcentajeRecargo}%
                                      </span>
                                      <div className="text-xs text-red-500">
                                        ({cuota.diasMorosidad}d{" "}
                                        {cuota.horasMorosidad}h)
                                      </div>
                                      <div className="text-xs text-red-400">
                                        Actualizado ahora mismo
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-green-600">0%</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-semibold">
                                  ${cuota.montoConRecargo.toFixed(2)}
                                  <div className="text-xs text-gray-500">
                                    Bs {(cuota.montoConRecargo * tasaCambio).toFixed(2)}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${
                                      cuota.estado === "Pagada"
                                        ? "bg-green-100 text-green-800"
                                        : cuota.estado === "En verificación"
                                        ? "bg-blue-100 text-blue-800"
                                        : cuota.estado === "Pendiente"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {cuota.estado}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getClaseEstadoIFEMI(
                                      cuota
                                    )}`}
                                  >
                                    {getEstadoIFEMI(cuota)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                  <button
                                    onClick={() => toggleFila(cuota.id)}
                                    className="text-blue-600 text-sm font-semibold hover:underline"
                                  >
                                    {filaExpandida === cuota.id
                                      ? "Ocultar"
                                      : "Ver más"}
                                  </button>
                                </td>
                              </tr>
                              
                              {/* Fila de detalles expandidos (independiente) */}
                              {filaExpandida === cuota.id && (
                                <tr>
                                  <td colSpan={9} className="px-4 py-4">
                                    <DetallesExpandidos 
                                      cuota={cuota} 
                                      estaExpandida={filaExpandida === cuota.id} 
                                    />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="9"
                              className="px-4 py-4 text-center text-sm text-gray-500"
                            >
                              No se encontraron cuotas para este contrato
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  <Paginacion />
                </>
              )}
            </section>
          )}

          {/* Modal de confirmación de pago */}
          {mostrarConfirmacion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Confirmar Pago
                </h3>
                <p className="text-gray-600 mb-2">
                  ¿Estás seguro de que deseas pagar la siguiente cuota?
                </p>
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <p>
                    <strong>Contrato:</strong> {contratoSeleccionado?.nombre}
                  </p>
                  <p>
                    <strong>Descripción:</strong>{" "}
                    {cuotaSeleccionada.descripcion}
                  </p>
                  <p>
                    <strong>Semana:</strong> {cuotaSeleccionada.fechaDesde} al {cuotaSeleccionada.fechaHasta}
                  </p>
                  <p>
                    <strong>Monto original:</strong> $
                    {cuotaSeleccionada.monto.toFixed(2)} (€)
                  </p>
                  <p>
                    <strong>Monto en Bs:</strong> Bs {cuotaSeleccionada.montoBolivares.toFixed(2)}
                  </p>
                  {cuotaSeleccionada.diasMorosidad > 0 && (
                    <>
                      <p>
                        <strong>Recargo por mora:</strong>{" "}
                        {cuotaSeleccionada.porcentajeRecargo}% ($
                        {(
                          cuotaSeleccionada.montoConRecargo -
                          cuotaSeleccionada.monto
                        ).toFixed(2)}
                        )
                      </p>
                      <p className="text-red-600 font-semibold">
                        <strong>Días de morosidad:</strong>{" "}
                        {cuotaSeleccionada.diasMorosidad}d{" "}
                        {cuotaSeleccionada.horasMorosidad}h
                      </p>
                      <p className="text-xs text-red-500 italic">
                        * El recargo aumenta en tiempo real. Pague ahora para
                        evitar incrementos.
                      </p>
                    </>
                  )}
                  <p className="font-bold text-lg mt-2">
                    <strong>Total a pagar:</strong> $
                    {cuotaSeleccionada.montoConRecargo.toFixed(2)} (€)
                  </p>
                  <p>
                    <strong>Total en Bs:</strong> Bs {(cuotaSeleccionada.montoConRecargo * tasaCambio).toFixed(2)}
                  </p>
                  <p>
                    <strong>Vencimiento:</strong>{" "}
                    {cuotaSeleccionada.fechaVencimiento}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir comprobante de pago
                  </label>
                  <input
                    type="file"
                    onChange={handleComprobanteChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setMostrarConfirmacion(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={procesarPago}
                    disabled={!comprobante}
                    className={`px-4 py-2 text-white rounded-md transition-colors duration-300 ${
                      !comprobante
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Enviar para verificación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de confirmación de IFEMI */}
          {mostrarConfirmacionIFEMI && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Confirmación de IFEMI
                </h3>
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <p>
                    <strong>Contrato:</strong> {contratoSeleccionado?.nombre}
                  </p>
                  <p>
                    <strong>Descripción:</strong>{" "}
                    {cuotaSeleccionada.descripcion}
                  </p>
                  <p>
                    <strong>Semana:</strong> {cuotaSeleccionada.fechaDesde} al {cuotaSeleccionada.fechaHasta}
                  </p>
                  <p>
                    <strong>Monto original:</strong> $
                    {cuotaSeleccionada.monto.toFixed(2)} (€)
                  </p>
                  <p>
                    <strong>Monto en Bs:</strong> Bs {cuotaSeleccionada.montoBolivares.toFixed(2)}
                  </p>
                  {cuotaSeleccionada.diasMorosidad > 0 && (
                    <p>
                      <strong>Recargo por mora:</strong>{" "}
                      {cuotaSeleccionada.porcentajeRecargo}%
                    </p>
                  )}
                  <p>
                    <strong>Total pagado:</strong> $
                    {cuotaSeleccionada.montoConRecargo.toFixed(2)} (€)
                  </p>
                  <p>
                    <strong>Total en Bs:</strong> Bs {(cuotaSeleccionada.montoConRecargo * tasaCambio).toFixed(2)}
                  </p>
                  <p>
                    <strong>Vencimiento:</strong>{" "}
                    {cuotaSeleccionada.fechaVencimiento}
                  </p>
                  {cuotaSeleccionada.diasMorosidad > 0 && (
                    <p>
                      <strong>Días de morosidad:</strong>{" "}
                      {cuotaSeleccionada.diasMorosidad}
                    </p>
                  )}
                  <p>
                    <strong>Estado:</strong>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getClaseEstadoIFEMI(
                        cuotaSeleccionada
                      )}`}
                    >
                      {getEstadoIFEMI(cuotaSeleccionada)}
                    </span>
                  </p>
                  {cuotaSeleccionada.comprobante && (
                    <p className="mt-2">
                      <strong>Comprobante:</strong>
                      <a
                        href="#"
                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        {cuotaSeleccionada.comprobante}
                      </a>
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios de IFEMI
                  </label>
                  <textarea
                    value={comentariosIFEMI}
                    onChange={(e) => setComentariosIFEMI(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    readOnly
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setMostrarConfirmacionIFEMI(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Pie */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
};

export default Cuotas;