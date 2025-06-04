import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Perfil = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true); // controla si el menu está abierto

  // Estados para las solicitudes y modal
  const [solicitudes, setSolicitudes] = useState([
    {
      id: 1,
      solicitante: "Juan Pérez",
      contrato: null,
      estado: "Pendiente",
      foto: "https://via.placeholder.com/150", // foto ejemplo
      detalles: {
        emprendimiento: "Tienda en línea",
        requerimientos: "Inversión en publicidad y desarrollo web",
        datosPersonales: {
          nombre: "Juan Pérez",
          email: "juan.perez@example.com",
          telefono: "123456789",
          direccion: "Calle Falsa 123",
        },
      },
    },
    {
      id: 2,
      solicitante: "María Gómez",
      contrato: "CONTR-1234",
      estado: "Aprobado",
      foto: "https://via.placeholder.com/150", // foto ejemplo
      detalles: {
        emprendimiento: "App móvil",
        requerimientos: "Desarrollo de backend y diseño UI/UX",
        datosPersonales: {
          nombre: "María Gómez",
          email: "maria.gomez@example.com",
          telefono: "987654321",
          direccion: "Avenida Siempre Viva 742",
        },
      },
    },
  ]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  // Estado para el buscador
  const [busqueda, setBusqueda] = useState("");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleVerDetalles = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setSolicitudSeleccionada(null);
  };

  // Filtrar solicitudes según la búsqueda
  const solicitudesFiltradas = solicitudes.filter((s) =>
    s.solicitante.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menú */}
      {menuOpen && <Menu />}

      {/* Contenido */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <div className="pt-20 px-8">
          {/* Título y buscador */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-group text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Perfiles de emprendedores
              </h1>
            </div>
          </header>

          {/* Input de búsqueda con label */}
          <div className="mb-6 max-w-4xl mx-auto flex flex-col items-start space-y-2">
            <label
              htmlFor="buscarSolicitante"
              className="text-gray-700 font-semibold"
            >
              Buscar Emprendedor
            </label>
            <div className="w-full flex items-center space-x-4">
              <input
                id="buscarSolicitante"
                type="text"
                placeholder="Buscar..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* Lista filtrada */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {solicitudesFiltradas.map((s) => (
              <div
                key={s.id}
                className="bg-white p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
              >
                {/* Imagen de la solicitud */}
                <div className="flex justify-center mb-4">
                  <img
                    src={s.foto}
                    alt={`Foto de ${s.solicitante}`}
                    className="w-24 h-24 object-cover rounded-full border-2 border-gray-300"
                  />
                </div>
                {/* Nombre del solicitante */}
                <h2 className="text-xl font-semibold mb-2 text-center">
                  {s.solicitante}
                </h2>
                <p className="mb-2">
                  <strong>Contrato:</strong>{" "}
                  {s.contrato ? s.contrato : "Pendiente"}
                </p>
                <p className="mb-2">
                  <strong>Estado:</strong> {s.estado}
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleVerDetalles(s)}
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Modal detalles */}
          {mostrarModal && solicitudSeleccionada && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              style={{
                background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-600"
                  onClick={handleCerrarModal}
                >
                  ✖
                </button>
                <h2 className="text-xl font-bold mb-4">
                  Datos del Emprendedor y Emprendimiento
                </h2>
                {/* Datos del emprendedor */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Datos Personales
                  </h3>
                  <p>
                    <strong>Nombre:</strong>{" "}
                    {solicitudSeleccionada.detalles.datosPersonales.nombre}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {solicitudSeleccionada.detalles.datosPersonales.email}
                  </p>
                  <p>
                    <strong>Teléfono:</strong>{" "}
                    {solicitudSeleccionada.detalles.datosPersonales.telefono}
                  </p>
                  <p>
                    <strong>Dirección:</strong>{" "}
                    {solicitudSeleccionada.detalles.datosPersonales.direccion}
                  </p>
                </div>
                {/* Datos del emprendimiento */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Emprendimiento</h3>
                  <p>
                    <strong>Nombre:</strong>{" "}
                    {solicitudSeleccionada.detalles.emprendimiento}
                  </p>
                  <p>
                    <strong>Requerimientos:</strong>{" "}
                    {solicitudSeleccionada.detalles.requerimientos}
                  </p>
                </div>
                {/* Cerrar botón */}
                <div className="mt-4 flex justify-end">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={handleCerrarModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Perfil;
