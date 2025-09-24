import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getContratoPorId, registrarCuota } from "../services/api_cuotas";
import { getUsuarioPorCedula } from "../services/api_usuario";

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [stats, setStats] = useState({
    creditosActivos: 0,
    proximosPagos: 0,
    mensajesNoLeidos: 3,
  });
  const [cuotas, setCuotas] = useState([]);
  const [rateEuroToVES, setRateEuroToVES] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comprobante, setComprobante] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: "todos",
    orden: "fecha",
  });
  const [cedulaEmprendedor, setCedulaEmprendedor] = useState("");
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState("");
  const [idCuotaC, setIdCuotaC] = useState(""); // Nuevo estado para id_cuota_c

  // Manejar carga de comprobante
  const handleArchivoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setComprobante(e.target.files[0]);
    }
  };

  const handlePagarClick = (cuota) => {
    setCuotaSeleccionada(cuota);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCuotaSeleccionada(null);
    setComprobante(null);
  };

  // Formatear números
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Enviar pago
  const handleConfirmarPago = () => {
    if (!cuotaSeleccionada) return;

    const formData = new FormData();

    // Campos existentes
    formData.append("descripcion", String(cuotaSeleccionada?.descripcion));
    formData.append("monto_euros", String(cuotaSeleccionada?.monto_euros));
    formData.append("monto_ves", String(cuotaSeleccionada?.monto_ves));
    formData.append(
      "fecha_desde_cuota",
      String(cuotaSeleccionada?.fecha_desde_cuota)
    );
    formData.append(
      "fecha_hasta_cuota",
      String(cuotaSeleccionada?.fecha_hasta_cuota)
    );
    // Cambiar estos valores:
    formData.append("estado_cuota", "Pagado"); // se registra como Pagado
    formData.append("confirmacionIFEMI", "En espera"); // visualización como Pendiente
    formData.append(
      "dias_mora_cuota",
      String(cuotaSeleccionada?.dias_mora_cuota)
    );
    formData.append(
      "interes_acumulado",
      String(cuotaSeleccionada?.interes_acumulado)
    );
    formData.append("cedula_emprendedor", String(cedulaEmprendedor));
    formData.append("id_cuota_c", String(idCuotaC));

    if (comprobante) {
      formData.append("comprobante", comprobante);
    }

    registrarCuota(formData)
      .then(() => {
        setCuotas((prev) =>
          prev.map((c) =>
            c.descripcion === cuotaSeleccionada?.descripcion
              ? { ...c, estado_cuota: "Pagado", confirmacionIFEMI: "En espera" }
              : c
          )
        );
        Swal.fire({
          icon: "success",
          title: "Pago confirmado",
          text: `La cuota ${cuotaSeleccionada?.descripcion} ha sido pagada.`,
        });
        handleCloseModal();
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema procesando el pago.",
        });
        handleCloseModal();
      });
  };

  const fetchEuroToVESRate = async () => {
    try {
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/EUR"
      );
      setRateEuroToVES(response.data.rates["VES"]);
    } catch (error) {
      console.error("Error al obtener la tasa EUR a VES:", error);
    }
  };

  useEffect(() => {
    fetchEuroToVESRate();
  }, []);

  // Cargar usuario y cuotas
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            setCedulaEmprendedor(cedula);

            // Ajustar stats según el rol
            if (usuario.rol === "Emprendedor") {
              setStats({
                creditosActivos: 2,
                proximosPagos: 1,
                mensajesNoLeidos: 3,
              });
            } else if (usuario.rol === "Administrador") {
              setStats({
                creditosActivos: 24,
                proximosPagos: 8,
                mensajesNoLeidos: 5,
              });
            } else {
              setStats({
                creditosActivos: 12,
                proximosPagos: 4,
                mensajesNoLeidos: 2,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario por cédula:", error);
      }
    };

    if (!user) {
      fetchUserData();
    }
  }, [setUser, user]);

  // Generar cuotas
  useEffect(() => {
  const fetchAndGenerarCuotas = async () => {
    try {
      setLoading(true);
      const cedula = localStorage.getItem("cedula_usuario");
      if (cedula) {
        const cuotasData = await getContratoPorId(cedula);

        // Obtener id_contrato para id_cuota_c
        if (cuotasData && cuotasData.length > 0 && cuotasData[0].id_contrato) {
          setIdCuotaC(cuotasData[0].id_contrato);
        }

        let montoDevolver = 1000;
        if (cuotasData && cuotasData.length > 0 && cuotasData[0].monto_devolver) {
          montoDevolver = Number(cuotasData[0].monto_devolver);
        }

        const totalSemanas = 20; // Puedes hacer esto dinámico si quieres
        const montoPorCuota = montoDevolver / 18;
        const fechaInicioStr = cuotasData[0]?.fecha_desde;
        const fechaInicio = new Date(fechaInicioStr);
        const cuotasGeneradas = [];

        const formatearFecha = (fecha) => fecha.toISOString().split("T")[0];

        const calcularDiasDeMora = (fechaVencimiento, estado) => {
          if (estado !== "Pendiente") return 0;
          const hoy = new Date();
          const vencimiento = new Date(fechaVencimiento);
          if (hoy <= vencimiento) return 0;
          const diffTime = Math.abs(hoy - vencimiento);
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        const calcularDiasDesdeFechaHasta = (fechaHasta) => {
          const hoy = new Date();
          const vencimiento = new Date(fechaHasta);
          if (hoy <= vencimiento) return 0;
          const diffTime = Math.abs(hoy - vencimiento);
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        for (let i = 0; i < totalSemanas; i++) {
          const fechaDesde = new Date(fechaInicio);
          fechaDesde.setDate(fechaDesde.getDate() + i * 7);
          const fechaHasta = new Date(fechaDesde);
          fechaHasta.setDate(fechaHasta.getDate() + 6);

          const estado = i < 18 ? "Pendiente" : "Gracia";
          const monto = i < 18 ? montoPorCuota.toFixed(2) : "0.00";

          const montoEnVES = (monto * rateEuroToVES).toFixed(2);
          const diasMora = calcularDiasDeMora(formatearFecha(fechaHasta), estado);
          const diasPasados = calcularDiasDesdeFechaHasta(formatearFecha(fechaHasta));
          const interesPorDia = 0.02;
          const montoBaseVES = parseFloat(montoEnVES);
          const montoInteres = montoBaseVES * diasPasados * interesPorDia;

          // Si tienes valores reales en `registro`, debes definir y usar. Si no, elimina o ajusta.
          const estadoReal = "No serve"; // O lo que corresponda
          const confirmacionReal = "En espera"; // O lo que corresponda

          cuotasGeneradas.push({
            descripcion: `Semana ${i + 1}`,
            monto_euros: monto,
            monto_ves: montoEnVES,
            fecha_desde_cuota: formatearFecha(fechaDesde),
            fecha_hasta_cuota: formatearFecha(fechaHasta),
            estado_cuota: estado,
            estado_pago: estadoReal,
            dias_mora_cuota: estado === "Pendiente" ? diasMora : 0,
            interes_acumulado: estado === "Pendiente" ? montoInteres.toFixed(2) : "0.00",
            confirmacionIFEMI: confirmacionReal,
          });
        }
        setCuotas(cuotasGeneradas);
      }
    } catch (error) {
      console.error("Error al generar cuotas:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchAndGenerarCuotas();
}, [rateEuroToVES]);

  // Funciones para toggle y formatear
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Filtrar cuotas
  const cuotasFiltradas = cuotas
    .filter((c) => {
      if (filtros.estado === "todos") return true;
      return c.estado_cuota === filtros.estado; // Cambiado
    })
    .sort((a, b) => {
      if (filtros.orden === "fecha") {
        return new Date(a.fecha_hasta_cuota) - new Date(b.fecha_hasta_cuota); // Cambiado
      } else if (filtros.orden === "monto") {
        return parseFloat(b.monto_euros) - parseFloat(a.monto_euros);
      }
      return 0;
    });

  // Resumen de cuotas
  const resumenCuotas = {
    total: cuotas.length,
    pendientes: cuotas.filter((c) => c.estado_cuota === "Pendiente").length, // Cambiado
    pagadas: cuotas.filter((c) => c.estado_cuota === "Pagado").length, // Cambiado
    enGracia: cuotas.filter((c) => c.estado_cuota === "Gracia").length, // Cambiado
    totalMonto: cuotas.reduce((sum, c) => sum + parseFloat(c.monto_euros), 0),
    totalMora: cuotas.reduce(
      (sum, c) => sum + parseFloat(c.interes_acumulado),
      0
    ),
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-6 bg-gray-50">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-13">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-home text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Reporte de cuotas
                </h1>
                <p className="text-gray-600">
                  Bienvenido/a,{" "}
                  {user?.nombre_completo?.split(" ")[0] || "Usuario"}
                </p>
              </div>
            </div>
          </div>

          {/* --- Sección de Resumen de cuotas --- */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Resumen de Cuotas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total de Cuotas</p>
                <p className="text-2xl font-bold text-blue-800">
                  {resumenCuotas.total}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {resumenCuotas.pendientes}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Pagadas</p>
                <p className="text-2xl font-bold text-green-800">
                  {resumenCuotas.pagadas}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">En Gracia</p>
                <p className="text-2xl font-bold text-purple-800">
                  {resumenCuotas.enGracia}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Monto Total (€)</p>
                <p className="text-xl font-bold text-gray-800">
                  € {formatNumber(resumenCuotas.totalMonto)}
                   
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">
                  Interés de Mora Acumulado (VES)
                </p>
                <p className="text-xl font-bold text-red-800">
                  Bs. {formatNumber(resumenCuotas.totalMora)}
                </p>
              </div>
            </div>
          </div>

          {/* --- Sección Reporte de cuotas --- */}
          <section className="mb-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Encabezado de filtros */}
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Detalle de cuotas
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Gestión y seguimiento de tus cuotas
                  </p>
                </div>
                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* filtro estado */}
                  <div className="relative min-w-[180px]">
                    <select
                      className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg appearance-none pr-8"
                      value={filtros.estado}
                      onChange={(e) =>
                        setFiltros({ ...filtros, estado: e.target.value })
                      }
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="Pendiente">Pendientes</option>
                      <option value="Pagado">Pagadas</option>
                      <option value="Gracia">En gracia</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <i className="bx bx-chevron-down"></i>
                    </div>
                  </div>
                  {/* filtro orden */}
                  <div className="relative min-w-[180px]">
                    <select
                      className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg appearance-none pr-8"
                      value={filtros.orden}
                      onChange={(e) =>
                        setFiltros({ ...filtros, orden: e.target.value })
                      }
                    >
                      <option value="fecha">Ordenar por fecha</option>
                      <option value="monto">Ordenar por monto</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <i className="bx bx-chevron-down"></i>
                    </div>
                  </div>
                  {/* botón exportar */}
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
                    <i className="bx bx-download mr-2"></i> Exportar
                  </button>
                </div>
              </div>
              {/* Contador de resultados */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <span className="text-sm text-gray-500">
                  Mostrando {cuotasFiltradas.length} de {cuotas.length} cuotas
                </span>
              </div>
              {/* Tabla de cuotas */}
              {loading ? (
                <div className="p-8 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semanas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto (€)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto (VES)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Desde
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Hasta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Días Mora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interés Mora (VES)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confirmación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cuotasFiltradas.length > 0 ? (
                        cuotasFiltradas.map((cuota, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {cuota.descripcion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              € {formatNumber(cuota.monto_euros)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              Bs. {formatNumber(cuota.monto_ves)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {cuota.fecha_desde_cuota} {/* Cambiado */}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {cuota.fecha_hasta_cuota} {/* Cambiado */}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {cuota.dias_mora_cuota} {/* Cambiado */}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {formatNumber(cuota.interes_acumulado)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                              <span
                                className={`${
                                  cuota.estado_pago === "Pagado"
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {cuota.estado_pago}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                              <span
                                className={`${
                                  cuota.confirmacionIFEMI === "En espera"
                                    ? "text-yellow-600"
                                    : cuota.confirmacionIFEMI === "Confirmado"
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {cuota.confirmacionIFEMI}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {cuota.estado_cuota !== "Pagado" ? ( // Cambiado
                                <button
                                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                  onClick={() => handlePagarClick(cuota)}
                                >
                                  Pagar
                                </button>
                              ) : (
                                <span className="text-green-500 font-semibold">
                                  Pagada
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="10"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No hay cuotas para mostrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Modal para pagar cuota */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
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
                <h3 className="text-xl font-semibold mb-4">Confirmar Pago</h3>

                {/* Mostrar toda la info de la cuota */}
                {cuotaSeleccionada && (
                  <div className="mb-4">
                    <p className="mb-2">
                      <strong>Cédula Emprendedor:</strong> {cedulaEmprendedor}
                    </p>
                    <p className="mb-2">
                      <strong>ID Cuota C:</strong> {idCuotaC}
                    </p>
                    <p className="mb-2">
                      <strong>Descripción:</strong>{" "}
                      {cuotaSeleccionada.descripcion}
                    </p>
                    <p className="mb-2">
                      <strong>Montos:</strong> €{" "}
                      {formatNumber(cuotaSeleccionada.monto_euros)} | Bs.{" "}
                      {formatNumber(cuotaSeleccionada.monto_ves)}
                    </p>
                    <p className="mb-2">
                      <strong>Fecha Desde:</strong>{" "}
                      {cuotaSeleccionada.fecha_desde_cuota} {/* Cambiado */}
                    </p>
                    <p className="mb-2">
                      <strong>Fecha Hasta:</strong>{" "}
                      {cuotaSeleccionada.fecha_hasta_cuota} {/* Cambiado */}
                    </p>
                    <p className="mb-2">
                      <strong>Estado:</strong> {cuotaSeleccionada.estado_cuota}{" "}
                      {/* Cambiado */}
                    </p>
                    <p className="mb-2">
                      <strong>Días Mora:</strong>{" "}
                      {cuotaSeleccionada.dias_mora_cuota} {/* Cambiado */}
                    </p>
                    <p className="mb-2">
                      <strong>Interés Mora (VES):</strong> Bs.{" "}
                      {formatNumber(cuotaSeleccionada.interes_acumulado)}
                    </p>
                  </div>
                )}

                {/* Subir comprobante */}
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Adjuntar comprobante
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleArchivoChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
                />

                {/* Mostrar totales */}
                <div className="mb-4 mt-4 border-t pt-4">
                  <p className="mb-2 font-semibold">
                    Total a pagar Bs.{" "}
                    {formatNumber(
                      parseFloat(cuotaSeleccionada.monto_ves) +
                        (cuotaSeleccionada.estado_cuota === "Pendiente" // Cambiado
                          ? parseFloat(cuotaSeleccionada.interes_acumulado || 0)
                          : 0)
                    )}
                  </p>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={handleConfirmarPago}
                  >
                    Confirmar Pago
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
        <footer className="p-6 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
