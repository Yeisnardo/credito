import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Perfil = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [solicitudes, setSolicitudes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Cargar solicitudes desde la API en montaje
  useEffect(() => {
  const fetchSolicitudes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/solicitudes');
      if (!response.ok) throw new Error("Error en la respuesta");
      const data = await response.json();
      setSolicitudes(data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las solicitudes.',
      });
    }
  };
  fetchSolicitudes();
}, []);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleVerDetalles = (s) => {
    const detallesHtml = `
      <h3 style="margin-top:10px; font-weight:700;">Datos Personales</h3>
      <p><strong>Nombre:</strong> ${s.detalles.datosPersonales.nombre}</p>
      <p><strong>Email:</strong> ${s.detalles.datosPersonales.email}</p>
      <p><strong>Teléfono:</strong> ${s.detalles.datosPersonales.telefono}</p>
      <p><strong>Dirección:</strong> ${s.detalles.datosPersonales.direccion}</p>
      <h3 style="margin-top:10px; font-weight:700;">Emprendimiento</h3>
      <p><strong>Nombre:</strong> ${s.detalles.emprendimiento}</p>
      <p><strong>Requerimientos:</strong> ${s.detalles.requerimientos}</p>
    `;

    Swal.fire({
      title: `Detalles de ${s.solicitante}`,
      html: detallesHtml,
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      icon: "info",
      confirmButtonColor: "#3b82f6",
    });
  };

  // Filtrar solicitudes según búsqueda
  const solicitudesFiltradas = solicitudes.filter((s) =>
    s.solicitante.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 font-sans">
      {/* Menú lateral */}
      {menuOpen && <Menu />}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 transition-all duration-300">
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <div className="pt-12 px-6 md:px-12 pb-8 flex-1 overflow-y-auto">
          {/* Encabezado y buscador */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            {/* Título e icono */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-indigo-400 to-purple-500 p-4 rounded-full shadow-lg text-white hover:scale-105 transform transition-transform cursor-pointer">
                <i className="bx bx-group text-3xl"></i>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-800">Perfiles de emprendedores</h1>
            </div>
            {/* Buscador */}
            <div className="w-full md:w-1/3">
              <label
                htmlFor="buscarSolicitante"
                className="block mb-2 text-gray-700 font-semibold"
              >
                Buscar Emprendedor
              </label>
              <div className="relative">
                <input
                  id="buscarSolicitante"
                  type="text"
                  placeholder="Buscar..."
                  className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="bx bx-search text-gray-400 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de solicitudes */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {solicitudesFiltradas.length > 0 ? (
              solicitudesFiltradas.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300 p-6 flex flex-col"
                >
                  {/* Foto */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={s.foto}
                      alt={`Foto de ${s.solicitante}`}
                      className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                  {/* Nombre */}
                  <h2 className="text-xl font-semibold mb-2 text-center text-gray-800">{s.solicitante}</h2>
                  {/* Contrato y Estado */}
                  <div className="mb-4 text-center">
                    <p className="text-sm text-gray-600">
                      <strong>Contrato:</strong> {s.contrato ? s.contrato : "Pendiente"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Estado:</strong> {s.estado}
                    </p>
                  </div>
                  {/* Botón detalles */}
                  <div className="mt-auto flex justify-center">
                    <button
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full shadow hover:scale-105 transform transition"
                      onClick={() => handleVerDetalles(s)}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500 text-lg mt-12">
                No hay solicitudes que coincidan
              </p>
            )}
          </section>
        </div>

        {/* Pie */}
        <footer className="mt-auto p-4 bg-gray-100 border-t border-gray-300 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Perfil;