import { useState } from "react";
import Swal from "sweetalert2";
import "../assets/css/style.css"; // ajusta si es necesario
import Header from "../components/Header";
import Menu from "../components/Menu";

// Datos de ejemplo
const solicitudesEjemplo = [
  {
    id: 1,
    solicitante: "Manufactura",
    monto: 10000,
    detalles: {
      sector: "Tecnología",
      tipoNegocio: "Tienda",
    },
    emprendimientos: ["App de servicios", "Marketplace tecnológico"],
  },
];

// Componente SectorCard con botón para ver detalles
const SectorCard = ({ sector, onVerDetalles }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
      <h2 className="text-xl font-semibold mb-2 text-center">{sector}</h2>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
          onClick={onVerDetalles}
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [solicitudes, setSolicitudes] = useState(solicitudesEjemplo);
  const [sectores, setSectores] = useState([]); // Estado para los sectores
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarDetalleModal, setMostrarDetalleModal] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);
  const [nuevoEmprendimiento, setNuevoEmprendimiento] = useState("");
  const [nuevoSector, setNuevoSector] = useState(""); // Estado para el nuevo sector
  const [emprendimientoEditado, setEmprendimientoEditado] = useState(""); // Estado para el emprendimiento a editar
  const [indexEmprendimientoEditado, setIndexEmprendimientoEditado] = useState(null); // Índice del emprendimiento a editar

  // Funciones para manejar eventos
  const handleVerDetalles = (s) => {
    setSolicitudDetalle(s);
    setMostrarDetalleModal(true);
    setNuevoEmprendimiento(""); // Limpia el campo de nuevo emprendimiento
    setEmprendimientoEditado(""); // Limpia el campo de edición
    setIndexEmprendimientoEditado(null); // Resetea el índice de edición
  };

  const handleCerrarModal = () => {
    setMostrarDetalleModal(false);
    setSolicitudDetalle(null);
    setNuevoEmprendimiento("");
    setEmprendimientoEditado("");
    setIndexEmprendimientoEditado(null);
  };

  const handleAgregarEmprendimiento = () => {
    if (nuevoEmprendimiento.trim() && solicitudDetalle) {
      const updated = {
        ...solicitudDetalle,
        emprendimientos: [
          ...solicitudDetalle.emprendimientos,
          nuevoEmprendimiento.trim(),
        ],
      };
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setSolicitudDetalle(updated);
      setNuevoEmprendimiento("");
    } else {
      Swal.fire("Error", "Ingrese un emprendimiento válido.", "error");
    }
  };

  const handleEditarEmprendimiento = (index) => {
    setEmprendimientoEditado(solicitudDetalle.emprendimientos[index]);
    setIndexEmprendimientoEditado(index);
  };

  const handleGuardarEdicion = () => {
    if (emprendimientoEditado.trim() && indexEmprendimientoEditado !== null) {
      const updatedEmprendimientos = [...solicitudDetalle.emprendimientos];
      updatedEmprendimientos[indexEmprendimientoEditado] = emprendimientoEditado.trim();

      const updated = {
        ...solicitudDetalle,
        emprendimientos: updatedEmprendimientos,
      };

      setSolicitudes((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setSolicitudDetalle(updated);
      setEmprendimientoEditado("");
      setIndexEmprendimientoEditado(null);
    } else {
      Swal.fire("Error", "Ingrese un emprendimiento válido.", "error");
    }
  };

  const handleRegistrarSector = () => {
    const sectorTrimmed = nuevoSector.trim();
    if (sectorTrimmed === "") {
      Swal.fire("Error", "Ingrese un sector válido.", "error");
      return;
    }
    if (sectores.includes(sectorTrimmed)) {
      Swal.fire("Error", "Este sector ya existe.", "error");
      return;
    }
    setSectores([...sectores, sectorTrimmed]);
    Swal.fire("¡Listo!", `Sector "${sectorTrimmed}" registrado.`, "success");
    setNuevoSector(""); // Limpia input
  };

  // Filtrado de solicitudes
  const solicitudesFiltradas = solicitudes.filter((s) =>
    s.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {menuOpen && <Menu />}
      <div className={`flex-1 flex flex-col ${menuOpen ? "ml-0 md:ml-64" : ""}`}>
        {/* Header */}
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Contenido principal */}
        <div className="pt-20 px-8 overflow-y-auto flex-1">
          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-home text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestor de Clasificación de Emprendimiento
              </h1>
            </div>
          </header>

          {/* Barra búsqueda y botón */}
          <div className="mb-6 max-w-4xl mx-auto flex items-center space-x-4">
            {/* Buscador */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Icono lupa */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z"
                  />
                </svg>
              </div>
            </div>
            {/* Botón crear sector */}
            <input
              type="text"
              placeholder="Nuevo sector"
              className="border border-gray-300 rounded px-3 py-2"
              value={nuevoSector}
              onChange={(e) => setNuevoSector(e.target.value)}
            />
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full shadow-lg transition"
              onClick={handleRegistrarSector}
            >
              + Nuevo sector
            </button>
          </div>

          {/* Mostrar sectores registrados */}
          <div className="mb-4 max-w-4xl mx-auto" >
            <h3 className="font-semibold mb-2">Sectores Registrados:</h3>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6" >
              {sectores.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">
                  No se encontraron sectores registrados.
                </p>
              ) : (
                sectores.map((sector, index) => (
                  <SectorCard
                    key={index}
                    style={{
                background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
              }}
                    sector={sector}
                    onVerDetalles={() => {
                      // Buscamos la solicitud que coincida con el sector para mostrar emprendimientos relacionados
                      // Aquí ajuste: si quieres mostrar emprendimientos específicos del sector, hay que implementar la relación, aquí se asume que mostramos la primera solicitud como ejemplo.
                      const solicitudRelacionada = solicitudes.find((sol) => sol.detalles.sector === sector) || solicitudes[0];
                      handleVerDetalles(solicitudRelacionada);
                    }}
                  />
                ))
              )}
            </section>
          </div>
        </div>

        {/* Modal de detalles */}
        {mostrarDetalleModal && solicitudDetalle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative shadow-lg">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={handleCerrarModal}
                aria-label="Cerrar modal"
              >
                ✖
              </button>
              <h2 className="text-2xl font-semibold mb-4">
                Detalles de {solicitudDetalle.solicitante}
              </h2>
              <h3 className="mt-4 font-semibold">Emprendimientos</h3>
              {solicitudDetalle.emprendimientos.length === 0 ? (
                <p className="text-gray-600">No hay emprendimientos asociados.</p>
              ) : (
                <ul className="list-disc list-inside mt-2">
                  {solicitudDetalle.emprendimientos.map((emprend, index) => (
                    <li
                      key={index}
                      className="text-gray-700 flex justify-between items-center"
                    >
                      <span>{emprend}</span>
                      <button
                        className="ml-2 text-blue-500 hover:underline"
                        onClick={() => handleEditarEmprendimiento(index)}
                      >
                        Editar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {/* Añadir o editar emprendimiento */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder={
                    indexEmprendimientoEditado !== null
                      ? "Editar emprendimiento"
                      : "Nuevo emprendimiento"
                  }
                  className="w-full p-2 border border-gray-300 rounded flex-grow"
                  value={
                    indexEmprendimientoEditado !== null
                      ? emprendimientoEditado
                      : nuevoEmprendimiento
                  }
                  onChange={(e) => {
                    if (indexEmprendimientoEditado !== null) {
                      setEmprendimientoEditado(e.target.value);
                    } else {
                      setNuevoEmprendimiento(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      indexEmprendimientoEditado !== null
                        ? handleGuardarEdicion()
                        : handleAgregarEmprendimiento();
                    }
                  }}
                />
                <button
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow w-full"
                  onClick={
                    indexEmprendimientoEditado !== null
                      ? handleGuardarEdicion
                      : handleAgregarEmprendimiento
                  }
                >
                  {indexEmprendimientoEditado !== null
                    ? "Guardar Edición"
                    : "Agregar Emprendimiento"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default App;