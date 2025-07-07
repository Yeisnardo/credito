import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from 'axios';

const Perfil = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [perfil, setPerfil] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Cargar perfiles desde API
  useEffect(() => {
    const fetchPerfiles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/perfiles");
        setPerfil(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPerfiles();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleVerDetalles = (s) => {
    const detallesHtml = `
      <h3 class="font-semibold mt-4 mb-2 text-[#374151]">Datos Personales</h3>
      <p><strong>Nombre:</strong> ${s.detalles.datosPersonales.nombre}</p>
      <p><strong>Email:</strong> ${s.detalles.datosPersonales.email}</p>
      <p><strong>Teléfono:</strong> ${s.detalles.datosPersonales.telefono}</p>
      <p><strong>Dirección:</strong> ${s.detalles.datosPersonales.direccion}</p>
      <h3 class="font-semibold mt-6 mb-2 text-[#374151]">Emprendimiento</h3>
      <p><strong>Nombre:</strong> ${s.detalles.emprendimiento}</p>
      <p><strong>Requerimientos:</strong> ${s.detalles.requerimientos}</p>
    `;

    Swal.fire({
      title: `Detalles de ${s.solicitante}`,
      html: detallesHtml,
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      icon: "info",
      confirmButtonColor: "#3b82f6", // azul de Tailwind para botones
    });
  };

  const perfilesFiltrados = perfil.filter((s) =>
    s.solicitante.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif overflow-hidden">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="pt-16 px-8 max-w-7xl mx-auto w-full">
          {/* Encabezado y búsqueda */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-full shadow-lg text-white hover:scale-105 transform transition-transform duration-300 cursor-pointer">
                <i className="bx bx-group text-3xl"></i>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-800 select-none">
                Perfiles de emprendedores
              </h1>
            </div>
            <div className="w-full md:w-1/3">
              <label
                htmlFor="buscarSolicitante"
                className="block mb-2 text-gray-700 font-semibold select-none"
              >
                Buscar Emprendedor
              </label>
              <div className="relative">
                <input
                  id="buscarSolicitante"
                  type="text"
                  placeholder="Buscar..."
                  className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition duration-300"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="bx bx-search text-gray-400 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de perfiles */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {perfilesFiltrados.length > 0 ? (
              perfilesFiltrados.map((s) => (
                <article
                  key={s.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col"
                  tabIndex={0}
                  aria-label={`Perfil de ${s.solicitante}`}
                >
                  <div className="flex justify-center mb-5">
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-center text-gray-800">
                    {s.solicitante}
                  </h2>
                  <div className="mb-6 text-center text-gray-600 text-sm">
                    <p>
                      <span className="font-semibold">Contrato:</span>{" "}
                      {s.contrato ?? "Pendiente"}
                    </p>
                    <p>
                      <span className="font-semibold">Estado:</span> {s.estado}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVerDetalles(s)}
                    className="mt-auto bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label={`Ver detalles de ${s.solicitante}`}
                  >
                    Ver detalles
                  </button>
                </article>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500 text-lg mt-12 select-none">
                No hay perfiles que coincidan
              </p>
            )}
          </section>
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-600 text-sm rounded-t-xl shadow-inner select-none">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Perfil;