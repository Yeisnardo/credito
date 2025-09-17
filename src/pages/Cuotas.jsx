import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getContratoPorId } from "../services/api_cuotas";
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
    orden: "fecha"
  });

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

  const handleConfirmarPago = () => {
    const formData = new FormData();
    formData.append('cuotaDescripcion', cuotaSeleccionada?.descripcion);
    if (comprobante) {
      formData.append('comprobante', comprobante);
    }

    // Simulación de envío
    axios.post('/api/pagos', formData)
      .then(() => {
        setCuotas(prevCuotas =>
          prevCuotas.map(cuota =>
            cuota.descripcion === cuotaSeleccionada?.descripcion
              ? { ...cuota, estado: "Pagado" }
              : cuota
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Pago Confirmado',
          text: `La cuota de ${cuotaSeleccionada?.descripcion} ha sido marcada como pagada.`,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-xl'
          }
        });
        handleCloseModal();
      })
      .catch((error) => {
        console.error('Error al subir comprobante:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al procesar tu pago.',
        });
        handleCloseModal();
      });
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

  useEffect(() => {
    fetchEuroToVESRate();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            if (usuario.rol === "Emprendedor") {
              setStats({ creditosActivos: 2, proximosPagos: 1, mensajesNoLeidos: 3 });
            } else if (usuario.rol === "Administrador") {
              setStats({ creditosActivos: 24, proximosPagos: 8, mensajesNoLeidos: 5 });
            } else {
              setStats({ creditosActivos: 12, proximosPagos: 4, mensajesNoLeidos: 2 });
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario por cédula:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  const calcularDiasDesdeFechaHasta = (fechaHasta) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaHasta);
    if (hoy <= vencimiento) return 0;
    const diffTime = Math.abs(hoy - vencimiento);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calcularDiasDeMora = (fechaVencimiento, estado) => {
    if (estado !== "Pendiente") return 0;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    if (hoy <= vencimiento) return 0;
    const diffTime = Math.abs(hoy - vencimiento);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchAndGenerarCuotas = async () => {
      try {
        setLoading(true);
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const cuotasData = await getContratoPorId(cedula);
          let montoDevolver = 1000;

          if (Array.isArray(cuotasData) && cuotasData.length > 0 && cuotasData[0].monto_devolver) {
            montoDevolver = Number(cuotasData[0].monto_devolver);
          }

          const totalSemanas = 20;
          const montoPorCuota = montoDevolver / 18;
          const fechaInicioStr = cuotasData[0]?.fecha_desde || '2024-01-01';
          const fechaInicio = new Date(fechaInicioStr);
          const cuotasGeneradas = [];
          const formatearFecha = (fecha) => fecha.toISOString().split('T')[0];

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

            cuotasGeneradas.push({
              descripcion: `Semana ${i + 1}`,
              monto_euros: monto,
              monto_ves: montoEnVES,
              fecha_desde: formatearFecha(fechaDesde),
              fecha_hasta: formatearFecha(fechaHasta),
              estado: estado,
              dias_mora: diasMora,
              interes_acumulado: montoInteres.toFixed(2),
              confirmacionIFEMI: "Pendiente",
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Función para formatear números con separadores de miles
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Filtrar cuotas según los filtros aplicados
  const cuotasFiltradas = cuotas.filter(cuota => {
    if (filtros.estado === "todos") return true;
    return cuota.estado === filtros.estado;
  }).sort((a, b) => {
    if (filtros.orden === "fecha") {
      return new Date(a.fecha_hasta) - new Date(b.fecha_hasta);
    } else if (filtros.orden === "monto") {
      return parseFloat(b.monto_euros) - parseFloat(a.monto_euros);
    }
    return 0;
  });

  // Calcular resumen de cuotas
  const resumenCuotas = {
    total: cuotas.length,
    pendientes: cuotas.filter(c => c.estado === "Pendiente").length,
    pagadas: cuotas.filter(c => c.estado === "Pagado").length,
    enGracia: cuotas.filter(c => c.estado === "Gracia").length,
    totalMonto: cuotas.reduce((sum, c) => sum + parseFloat(c.monto_euros), 0),
    totalMora: cuotas.reduce((sum, c) => sum + parseFloat(c.interes_acumulado), 0)
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
                <h1 className="text-3xl font-bold text-gray-800">Reporte de cuotas</h1>
                <p className="text-gray-600">Bienvenido/a, {user?.nombre_completo?.split(' ')[0] || 'Usuario'}</p>
              </div>
            </div>
            
            
          </div>

          {/* Resumen de cuotas */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen de Cuotas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total de Cuotas</p>
                <p className="text-2xl font-bold text-blue-800">{resumenCuotas.total}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-800">{resumenCuotas.pendientes}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Pagadas</p>
                <p className="text-2xl font-bold text-green-800">{resumenCuotas.pagadas}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">En Gracia</p>
                <p className="text-2xl font-bold text-purple-800">{resumenCuotas.enGracia}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Monto Total (€)</p>
                <p className="text-xl font-bold text-gray-800">€ {formatNumber(resumenCuotas.totalMonto)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Interés de Mora Acumulado (VES)</p>
                <p className="text-xl font-bold text-red-800">Bs. {formatNumber(resumenCuotas.totalMora)}</p>
              </div>
            </div>
          </div>

          {/* Reporte de cuotas */}
          <section className="mb-8">
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    {/* Encabezado de la sección */}
    <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Detalle de cuotas</h2>
        <p className="text-sm text-gray-500 mt-1">Gestión y seguimiento de tus cuotas</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtro por estado */}
        <div className="relative min-w-[180px]">
          <select 
            className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors appearance-none pr-8"
            value={filtros.estado}
            onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
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
        
        {/* Filtro por orden */}
        <div className="relative min-w-[180px]">
          <select 
            className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors appearance-none pr-8"
            value={filtros.orden}
            onChange={(e) => setFiltros({...filtros, orden: e.target.value})}
          >
            <option value="fecha">Ordenar por fecha</option>
            <option value="monto">Ordenar por monto</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <i className="bx bx-chevron-down"></i>
          </div>
        </div>
        
        {/* Botón de exportar */}
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors whitespace-nowrap">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto (€)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto (VES)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Desde</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Hasta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Mora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interés Mora (VES)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cuotasFiltradas.length > 0 ? (
              cuotasFiltradas.map((cuota, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cuota.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">€ {formatNumber(cuota.monto_euros)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Bs. {formatNumber(cuota.monto_ves)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{cuota.fecha_desde}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{cuota.fecha_hasta}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {cuota.dias_mora > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {cuota.dias_mora} días
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Bs. {formatNumber(cuota.interes_acumulado)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cuota.estado === "Pagado"
                          ? "bg-green-100 text-green-800"
                          : cuota.estado === "Gracia"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {cuota.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cuota.confirmacionIFEMI === "Pagado"
                          ? "bg-green-100 text-green-800"
                          : cuota.confirmacionIFEMI === "Confirmado"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {cuota.confirmacionIFEMI}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {cuota.confirmacionIFEMI !== "Pagado" && cuota.estado !== "Gracia" && (
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        onClick={() => handlePagarClick(cuota)}
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-sm">No hay cuotas que coincidan con los filtros aplicados.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
</section>
        </main>

        {/* Modal de pago */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl transform transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Confirmar Pago</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-150"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">¿Deseas pagar la siguiente cuota?</p>
                <p className="font-semibold text-gray-800">{cuotaSeleccionada?.descripcion}</p>
              </div>
              
              {/* Campo para subir comprobante */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar comprobante</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleArchivoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100"
                />
              </div>
              
              {/* Detalles y totales */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto en Euros:</span>
                  <span className="font-medium">€ {cuotaSeleccionada?.monto_euros}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto en Bolívares:</span>
                  <span className="font-medium">Bs. {formatNumber(cuotaSeleccionada?.monto_ves)}</span>
                </div>
                {cuotaSeleccionada?.dias_mora > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Interés por mora:</span>
                    <span>Bs. {formatNumber(cuotaSeleccionada?.interes_acumulado)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total a pagar:</span>
                    <span>Bs. {formatNumber((parseFloat(cuotaSeleccionada?.monto_ves || 0) + parseFloat(cuotaSeleccionada?.interes_acumulado || 0)))}</span>
                  </div>
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleConfirmarPago}
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-auto p-6 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;