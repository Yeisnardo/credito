import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiConfig from "../services/api_configuracion_contratos"; // Tu API de configuración
import api, { getUsuarioPorCedula } from '../services/api_usuario';

// Función auxiliar para generar cuotas
const generarCuotas = (config, totalMonto = 0, startDate = new Date()) => {
  const cuotasGeneradas = [];
  const {
    numero_cuotas,
    cuotasGracia,
    frecuencia_pago,
    dias_personalizados,
  } = config;

  const cuotasObligatorias = parseInt(numero_cuotas);
  const cuotasNoObligatorias = parseInt(cuotasGracia);
  
  // Si no hay monto, todas las cuotas serán de $0.00
  const montoPorCuota = totalMonto > 0 ? totalMonto / cuotasObligatorias : 0;

  // Función para calcular fechas
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
      semana: `Semana ${i}`,
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
      semana: `Semana ${index}`,
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

const Cuota = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);
  const [stats, setStats] = useState({});
  const [modalMorosidad, setModalMorosidad] = useState(false);
  const [cuotaMorosidad, setCuotaMorosidad] = useState(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState("");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Función para obtener usuario y generar cuotas
  const fetchUser = async () => {
    const cedula = localStorage.getItem('cedula_usuario');
    if (!cedula) return;

    const usuario = await getUsuarioPorCedula(cedula);
    if (usuario) {
      setUserState(usuario);
      if (setUser) setUser(usuario);

      // Obtener configuración
      const config = await apiConfig.getConfiguracion();

      if (config) {
        setConfiguracion(config);
        // Generar cuotas sin monto (todas en $0.00)
        const cuotasGeneradas = generarCuotas(config);
        setCuotas(cuotasGeneradas);
      } else {
        const defaultConfig = {
          numero_cuotas: "5",
          cuotasGracia: "2",
          frecuencia_pago: "semanal"
        };
        setConfiguracion(defaultConfig);
        const cuotasGeneradas = generarCuotas(defaultConfig);
        setCuotas(cuotasGeneradas);
      }

      // Estadísticas
      if (usuario.rol === "Emprendedor") {
        setStats({ creditosActivos: 2, proximosPagos: 1, mensajesNoLeidos: 3 });
      } else if (usuario.rol === "Administrador") {
        setStats({ creditosActivos: 24, proximosPagos: 8, mensajesNoLeidos: 5 });
      } else {
        setStats({ creditosActivos: 12, proximosPagos: 4, mensajesNoLeidos: 2 });
      }
    }
  };

  // Función para actualizar cuotas con monto personalizado
  const actualizarCuotasConMonto = (monto) => {
    if (configuracion && monto > 0) {
      const cuotasActualizadas = generarCuotas(configuracion, parseFloat(monto));
      setCuotas(cuotasActualizadas);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user]);

  // Opcional: recargar configuración si cambia
  useEffect(() => {
    const fetchConfig = async () => {
      const config = await apiConfig.getConfiguracion();
      if (config) {
        setConfiguracion(config);
        // Generar cuotas sin monto
        const cuotasGeneradas = generarCuotas(config);
        setCuotas(cuotasGeneradas);
      }
    };
    fetchConfig();
  }, []);

  const handlePagarCuota = (cuota) => {
    alert(`Ir a pagar cuota ${cuota.semana}`);
    // navigate(`/pago/${cuota.id_cuota}`);
  };

  const handleVerMorosidad = (cuota) => {
    setCuotaMorosidad(cuota);
    setModalMorosidad(true);
  };

  const closeModal = () => {
    setModalMorosidad(false);
    setCuotaMorosidad(null);
  };

  const handleMontoChange = (e) => {
    setMontoPersonalizado(e.target.value);
  };

  const aplicarMontoPersonalizado = () => {
    if (montoPersonalizado && parseFloat(montoPersonalizado) > 0) {
      actualizarCuotasConMonto(montoPersonalizado);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="flex-1 p-6 bg-gray-50">
          {/* Encabezado con cédula y nombre */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-home text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Historial de pago de cuota
                </h1>
                <p className="text-gray-600">
                  Bienvenido/a,{" "}
                  {user?.nombre_completo?.split(" ")[0] || "Usuario"}
                </p>
              </div>
            </div>
            
            {/* Input para monto personalizado */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Ingrese monto total"
                value={montoPersonalizado}
                onChange={handleMontoChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                step="0.01"
              />
              <button
                onClick={aplicarMontoPersonalizado}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Aplicar Monto
              </button>
            </div>
          </div>

          {/* Tabla de cuotas */}
          <section className="mt-8 mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Historial de cuotas
            </h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-md">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Cuota
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Inicio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Final
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Bs
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Fecha de pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Confirmación IFEMI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Morosidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Comprobante
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Pagar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cuotas.map((cuota) => (
                    <tr
                      key={cuota.id_cuota}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cuota.semana}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {cuota.fecha_desde}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {cuota.fecha_hasta}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${cuota.monto}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {cuota.monto_ves}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {cuota.fecha_pagada || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            cuota.estado_cuota === "Pagado"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cuota.estado_cuota}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {cuota.confirmacionIFEMI}
                      </td>
                      {/* Columna Morosidad */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          className="flex items-center justify-center bg-yellow-400 text-white px-3 py-2 rounded hover:bg-yellow-500 transition-colors text-xs font-medium w-full"
                          title="Ver morosidad"
                          onClick={() => handleVerMorosidad(cuota)}
                        >
                          <i className="bx bx-error mr-1"></i>
                        </button>
                      </td>
                      {/* Columna Comprobante */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {cuota.comprobante ? (
                          <button
                            className="flex items-center justify-center bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors text-xs font-medium w-full"
                            onClick={() =>
                              window.open(cuota.comprobante, "_blank")
                            }
                            title="Ver comprobante"
                          >
                            <i className="bx bx-file mr-1"></i>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      {/* Columna Pagar */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {cuota.estado_cuota !== "Pagado" ? (
                          <button
                            className="flex items-center justify-center bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors text-xs font-medium w-full"
                            onClick={() => handlePagarCuota(cuota)}
                            title="Pagar cuota"
                          >
                            <i className="bx bx-wallet mr-1"></i> Pagar
                          </button>
                        ) : (
                          <span className="text-green-600 text-xs">
                            ✓ Pagado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Modal de Morosidad */}
        {modalMorosidad && cuotaMorosidad && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full relative shadow-lg">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl"
                onClick={closeModal}
              >
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-4 text-center">
                Detalle de Morosidad
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>Monto Morosidad:</strong>{" "}
                  {cuotaMorosidad.monto_morosidad}
                </p>
                <p>
                  <strong>Días Morosidad:</strong>{" "}
                  {cuotaMorosidad.dias_mora_cuota}
                </p>
                <p>
                  <strong>Interés Acumulado:</strong>{" "}
                  {cuotaMorosidad.interes_acumulado}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pie */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Cuota;