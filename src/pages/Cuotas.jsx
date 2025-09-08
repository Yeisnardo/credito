import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from '../services/api_usuario';

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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem('cedula_usuario');
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            // Cargar contratos del usuario
            await cargarContratos(usuario.id);
          }
        }
      } catch (error) {
        console.error('Error al obtener usuario por cédula:', error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Cargar contratos del usuario
  const cargarContratos = async (userId) => {
    setCargando(true);
    try {
      // Simulación de datos - en una aplicación real, estos vendrían de una API
      const contratosEjemplo = [
        { id: 1, numero: "CT-2023-001", nombre: "Contrato Emprendimiento A", estado: "Activo", montoTotal: 1500.00 },
        { id: 2, numero: "CT-2023-002", nombre: "Contrato Emprendimiento B", estado: "Activo", montoTotal: 2500.00 },
        { id: 3, numero: "CT-2022-005", nombre: "Contrato Antiguo", estado: "Finalizado", montoTotal: 3000.00 },
      ];
      setContratos(contratosEjemplo);
      
      // Seleccionar el primer contrato activo por defecto
      const contratoActivo = contratosEjemplo.find(c => c.estado === "Activo") || contratosEjemplo[0];
      if (contratoActivo) {
        setContratoSeleccionado(contratoActivo);
        await cargarCuotas(contratoActivo.id);
      }
    } catch (error) {
      console.error('Error al cargar contratos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar cuotas del contrato seleccionado
  const cargarCuotas = async (contratoId) => {
    setCargando(true);
    try {
      // Datos de ejemplo - en una aplicación real, estos vendrían de una API
      let cuotasEjemplo = [];
      
      if (contratoId === 1) {
        cuotasEjemplo = [
          { id: 1, monto: 150.00, fechaVencimiento: "2023-10-15", estado: "Pendiente", descripcion: "Cuota mensual de octubre", comprobante: null, confirmacionIFEMI: "Pendiente", comentariosIFEMI: "" },
          { id: 2, monto: 150.00, fechaVencimiento: "2023-09-15", estado: "Pagada", descripcion: "Cuota mensual de septiembre", comprobante: "comprobante_2.pdf", confirmacionIFEMI: "Aprobada", comentariosIFEMI: "Pago verificado correctamente" },
          { id: 3, monto: 150.00, fechaVencimiento: "2023-08-15", estado: "Pagada", descripcion: "Cuota mensual de agosto", comprobante: "comprobante_3.pdf", confirmacionIFEMI: "Aprobada", comentariosIFEMI: "" },
          { id: 4, monto: 200.00, fechaVencimiento: "2023-11-15", estado: "Pendiente", descripcion: "Cuota mensual con ajuste", comprobante: null, confirmacionIFEMI: "Pendiente", comentariosIFEMI: "" },
        ];
      } else if (contratoId === 2) {
        cuotasEjemplo = [
          { id: 5, monto: 250.00, fechaVencimiento: "2023-10-20", estado: "Pendiente", descripcion: "Primera cuota trimestral", comprobante: null, confirmacionIFEMI: "Pendiente", comentariosIFEMI: "" },
          { id: 6, monto: 250.00, fechaVencimiento: "2023-07-20", estado: "Pagada", descripcion: "Cuota inicial", comprobante: "comprobante_6.pdf", confirmacionIFEMI: "Rechazada", comentariosIFEMI: "El comprobante no coincide con el monto de la cuota" },
        ];
      } else {
        cuotasEjemplo = [
          { id: 7, monto: 300.00, fechaVencimiento: "2022-12-10", estado: "Pagada", descripcion: "Cuota final", comprobante: "comprobante_7.pdf", confirmacionIFEMI: "Aprobada", comentariosIFEMI: "" },
          { id: 8, monto: 300.00, fechaVencimiento: "2022-11-10", estado: "Pagada", descripcion: "Cuota noviembre", comprobante: "comprobante_8.pdf", confirmacionIFEMI: "Aprobada", comentariosIFEMI: "" },
        ];
      }
      
      setCuotas(cuotasEjemplo);
    } catch (error) {
      console.error('Error al cargar cuotas:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleContratoChange = async (e) => {
    const contratoId = parseInt(e.target.value);
    const contrato = contratos.find(c => c.id === contratoId);
    if (contrato) {
      setContratoSeleccionado(contrato);
      await cargarCuotas(contratoId);
    }
  };

  const confirmarPago = (cuota) => {
    setCuotaSeleccionada(cuota);
    setMostrarConfirmacion(true);
  };

  const handleComprobanteChange = (e) => {
    setComprobante(e.target.files[0]);
  };

  const procesarPago = () => {
    // Simular procesamiento de pago
    const cuotasActualizadas = cuotas.map(cuota => 
      cuota.id === cuotaSeleccionada.id 
        ? { 
            ...cuota, 
            estado: "En verificación", 
            comprobante: comprobante ? comprobante.name : "comprobante.pdf",
            confirmacionIFEMI: "Pendiente"
          } 
        : cuota
    );
    
    setCuotas(cuotasActualizadas);
    setMostrarConfirmacion(false);
    setCuotaSeleccionada(null);
    setComprobante(null);
    
    // Aquí normalmente se conectaría con una API de pagos
    alert(`Comprobante de pago de $${cuotaSeleccionada.monto} enviado para verificación`);
  };

  const verDetallesIFEMI = (cuota) => {
    setCuotaSeleccionada(cuota);
    setComentariosIFEMI(cuota.comentariosIFEMI || "");
    setMostrarConfirmacionIFEMI(true);
  };

  const cuotasFiltradas = filtroEstado === "Todas" 
    ? cuotas 
    : cuotas.filter(cuota => cuota.estado === filtroEstado);

  // Calcular resumen de cuotas
  const cuotasPendientes = cuotas.filter(c => c.estado === "Pendiente");
  const totalPendiente = cuotasPendientes.reduce((total, c) => total + c.monto, 0);
  const cuotasPagadas = cuotas.filter(c => c.estado === "Pagada" || c.estado === "En verificación");
  const totalPagado = cuotasPagadas.reduce((total, c) => total + c.monto, 0);
  const cuotasEnVerificacion = cuotas.filter(c => c.estado === "En verificación");

  // Obtener el estado de confirmación de IFEMI para mostrar en la tabla
  const getEstadoIFEMI = (cuota) => {
    if (cuota.estado === "Pendiente") return "Pendiente de pago";
    if (cuota.confirmacionIFEMI === "Pendiente") return "En revisión por IFEMI";
    if (cuota.confirmacionIFEMI === "Aprobada") return "Confirmado por IFEMI";
    if (cuota.confirmacionIFEMI === "Rechazada") return "Rechazado por IFEMI";
    return "Sin información";
  };

  // Obtener clase CSS según el estado de IFEMI
  const getClaseEstadoIFEMI = (cuota) => {
    if (cuota.estado === "Pendiente") return "bg-gray-100 text-gray-800";
    if (cuota.confirmacionIFEMI === "Pendiente") return "bg-yellow-100 text-yellow-800";
    if (cuota.confirmacionIFEMI === "Aprobada") return "bg-green-100 text-green-800";
    if (cuota.confirmacionIFEMI === "Rechazada") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-money text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Gestión de Cuotas</h1>
            </div>
          </div>

          {/* Selector de contrato */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Seleccionar Contrato</h2>
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-grow">
                <select 
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={contratoSeleccionado?.id || ""}
                  onChange={handleContratoChange}
                  disabled={cargando}
                >
                  {contratos.map(contrato => (
                    <option key={contrato.id} value={contrato.id}>
                      {contrato.nombre} - {contrato.numero} ({contrato.estado})
                    </option>
                  ))}
                </select>
              </div>
              {contratoSeleccionado && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Monto total del contrato:</span> ${contratoSeleccionado.montoTotal.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          

          {/* Lista de cuotas */}
          {contratoSeleccionado && (
            <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <h2 className="text-2xl font-semibold text-gray-800">Cuotas del Contrato</h2>
                <div className="flex space-x-4">
                  <select 
                    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todas">Todas las cuotas</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="En verificación">En verificación</option>
                    <option value="Pagada">Pagadas</option>
                  </select>
                </div>
              </div>

              {cargando ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Pago</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmación IFEMI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cuotasFiltradas.length > 0 ? (
                        cuotasFiltradas.map((cuota) => (
                          <tr key={cuota.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cuota.descripcion}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cuota.fechaVencimiento}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${cuota.monto.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${cuota.estado === 'Pagada' ? 'bg-green-100 text-green-800' : 
                                  cuota.estado === 'En verificación' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}>
                                {cuota.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getClaseEstadoIFEMI(cuota)}`}>
                                {getEstadoIFEMI(cuota)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {cuota.estado === 'Pendiente' && (
                                <button
                                  onClick={() => confirmarPago(cuota)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                                >
                                  Pagar ahora
                                </button>
                              )}
                              {(cuota.estado === 'En verificación' || cuota.estado === 'Pagada') && (
                                <button
                                  onClick={() => verDetallesIFEMI(cuota)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                                >
                                  Ver detalles
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            No se encontraron cuotas para este contrato
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Modal de confirmación de pago */}
          {mostrarConfirmacion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirmar Pago</h3>
                <p className="text-gray-600 mb-2">¿Estás seguro de que deseas pagar la siguiente cuota?</p>
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <p><strong>Contrato:</strong> {contratoSeleccionado?.nombre}</p>
                  <p><strong>Descripción:</strong> {cuotaSeleccionada.descripcion}</p>
                  <p><strong>Monto:</strong> ${cuotaSeleccionada.monto.toFixed(2)}</p>
                  <p><strong>Vencimiento:</strong> {cuotaSeleccionada.fechaVencimiento}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subir comprobante de pago</label>
                  <input
                    type="file"
                    onChange={handleComprobanteChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setMostrarConfirmacion(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={procesarPago}
                    disabled={!comprobante}
                    className={`px-4 py-2 text-white rounded-md transition-colors duration-300 ${!comprobante ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Enviar para verificación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de confirmación de IFEMI */}
          {mostrarConfirmacionIFEMI && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirmación de IFEMI</h3>
                
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <p><strong>Contrato:</strong> {contratoSeleccionado?.nombre}</p>
                  <p><strong>Descripción:</strong> {cuotaSeleccionada.descripcion}</p>
                  <p><strong>Monto:</strong> ${cuotaSeleccionada.monto.toFixed(2)}</p>
                  <p><strong>Vencimiento:</strong> {cuotaSeleccionada.fechaVencimiento}</p>
                  <p><strong>Estado:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getClaseEstadoIFEMI(cuotaSeleccionada)}`}>
                      {getEstadoIFEMI(cuotaSeleccionada)}
                    </span>
                  </p>
                  {cuotaSeleccionada.comprobante && (
                    <p className="mt-2">
                      <strong>Comprobante:</strong> 
                      <a href="#" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                        {cuotaSeleccionada.comprobante}
                      </a>
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios de IFEMI</label>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
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
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Cuotas;