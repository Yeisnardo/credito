import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Amortizacion = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [emprendimiento, setEmprendimiento] = useState("");
  const [monto, setMonto] = useState(1000);
  const [tipoPago, setTipoPago] = useState("Dólares");
  const [referencia, setReferencia] = useState("");
  const [deudaRestante, setDeudaRestante] = useState(0);

  // Lista de registros
  const [registros, setRegistros] = useState([]);

  // Modal para nuevo
  const [mostrarModal, setMostrarModal] = useState(false);

  // Modal inspección
  const [mostrarModalInspeccion, setMostrarModalInspeccion] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  // Busqueda
  const [busqueda, setBusqueda] = useState("");

  // Funciones
  const handleNuevo = () => setMostrarModal(true);
  const handleCerrarModal = () => {
    setMostrarModal(false);
    setNombre(""); setApellido(""); setCedula(""); setEmprendimiento("");
    setMonto(1000); setTipoPago("Dólares"); setReferencia(""); setDeudaRestante(0);
  };

  const handleCargar = () => {
    const montoTotal = parseFloat(monto);
    if (isNaN(montoTotal)) {
      alert("Por favor ingresa un monto válido");
      return;
    }
    const pago = montoTotal - deudaRestante;
    const montoConInteres = deudaRestante > 0 ? montoTotal * 1.02 : montoTotal;

    const nuevoRegistro = {
      id: Date.now(),
      nombre,
      apellido,
      cedula,
      emprendimiento,
      monto: montoTotal,
      montoConInteres,
      tipoPago,
      referencia,
      deudaRestante: pago,
      fecha: new Date().toLocaleString(),
      // Datos ficticios adicionales
      numeroCuota: Math.floor(Math.random() * 10) + 1, // Número de cuota aleatorio
      montoTotalConInteres: montoConInteres
    };
    setRegistros([nuevoRegistro, ...registros]);
    handleCerrarModal();
  };

  const handleInspeccionar = (registro) => {
    setRegistroSeleccionado(registro);
    setMostrarModalInspeccion(true);
  };
  const handleCerrarInspeccion = () => {
    setMostrarModalInspeccion(false);
    setRegistroSeleccionado(null);
  };

  const registrosFiltrados = registros.filter(
    (reg) =>
      reg.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      reg.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      reg.cedula.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menu */}
      {isMenuOpen && <Menu />}
      {/* Contenedor principal */}
      <div className={`flex-1 flex flex-col ${isMenuOpen ? "ml-0 md:ml-64" : "ml-0"}`}>
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="pt-20 px-8 flex-1 flex flex-col">
          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-money-withdraw text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Gestion de Amortizacion</h1>
            </div>
          </header>

          {/* Buscador y botón */}
          <div className="flex items-center mb-4 gap-2 md:gap-4 flex-col md:flex-row">
            <input
              type="text"
              placeholder="Buscar..."
              className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
              onClick={handleNuevo}
            >
              <i className="bx bx-plus mr-2"></i> Nuevo
            </button>
          </div>

          {/* Modal para nuevo */}
          {mostrarModal && (
            <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-md overflow-y-auto max-h-screen">
                <h2 className="text-xl font-semibold mb-4 text-center">Nuevo Amortización</h2>
                {/* Formulario */}
                {/*... (igual que en el código original, omitido por brevedad) ...*/}
                {/* Aquí va el formulario igual al anterior */}
                {/* ... */}
                {/* Botones */}
                {/* ... */}
              </div>
            </div>
          )}

          {/* Tabla */}
          <section className="overflow-x-auto mt-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-2 py-1">Nombre</th>
                  <th className="border border-gray-300 px-2 py-1">Apellido</th>
                  <th className="border border-gray-300 px-2 py-1">Cédula</th>
                  <th className="border border-gray-300 px-2 py-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-2">No hay registros</td>
                  </tr>
                ) : (
                  registrosFiltrados.map((reg) => (
                    <tr key={reg.id}>
                      <td className="border border-gray-300 px-2 py-1">{reg.nombre}</td>
                      <td className="border border-gray-300 px-2 py-1">{reg.apellido}</td>
                      <td className="border border-gray-300 px-2 py-1">{reg.cedula}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          onClick={() => handleInspeccionar(reg)}
                        >
                          Inspeccionar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </main>

        {/* Pie */}
        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>

      {/* Modal inspección */}
      {mostrarModalInspeccion && registroSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto max-h-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-4 overflow-y-auto max-h-screen">
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
              Detalles del Pago
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos básicos */}
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="bg-blue-500 p-4 rounded-full shadow-lg text-white text-3xl">
                  <i className="bx bx-box"></i>
                </div>
                <div>
                  <p className="font-semibold"><strong>Nombre:</strong> {registroSeleccionado.nombre}</p>
                  <p className="font-semibold"><strong>Apellido:</strong> {registroSeleccionado.apellido}</p>
                  <p className="font-semibold"><strong>Cédula:</strong> {registroSeleccionado.cedula}</p>
                  <p className="font-semibold"><strong>Emprendimiento:</strong> {registroSeleccionado.emprendimiento}</p>
                </div>
              </div>
              {/* Datos adicionales ficticios */}
              <div className="space-y-2 text-gray-700">
                <p><strong>Número de Cuota:</strong> 5</p>
                <p><strong>Monto con Interés (2%):</strong> ${(registroSeleccionado.montoConInteres).toFixed(2)}</p>
                <p><strong>Monto Total de la Cuota:</strong> ${(registroSeleccionado.montoTotalConInteres).toFixed(2)}</p>
                <p><strong>Deuda Pendiente:</strong> ${registroSeleccionado.deudaRestante.toFixed(2)}</p>
                <p><strong>Fecha del Pago:</strong> {registroSeleccionado.fecha}</p>
              </div>
            </div>
            {/* Botón Cerrar */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={handleCerrarInspeccion}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Amortizacion;