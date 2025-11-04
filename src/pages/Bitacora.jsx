import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from '../services/api_usuario';

// Importar Tabler Icons
import {
  TbHome,
  TbSearch,
  TbChevronLeft,
  TbChevronRight,
} from "react-icons/tb";

const Bitacora = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [bitacoraData, setBitacoraData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");

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
          }
        }
      } catch (error) {
        console.error('Error al obtener usuario por cédula:', error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Datos de ejemplo para la bitácora (en una aplicación real, estos vendrían de una API)
  useEffect(() => {
    // Simular carga de datos de la bitácora
    const mockBitacoraData = [
      { id: 1, fecha: "2023-10-15 08:30:45", accion: "Inicio de sesión", tipo: "Autenticación", usuario: user?.nombre_completo || "Usuario", detalles: "Inicio de sesión exitoso desde navegador Chrome" },
      { id: 2, fecha: "2023-10-15 09:15:22", accion: "Consulta de reportes", tipo: "Consulta", usuario: user?.nombre_completo || "Usuario", detalles: "Generó reporte de ventas del mes" },
      { id: 3, fecha: "2023-10-15 11:40:18", accion: "Actualización de datos", tipo: "Modificación", usuario: user?.nombre_completo || "Usuario", detalles: "Actualizó información del cliente ID: 2456" },
      { id: 4, fecha: "2023-10-14 14:22:37", accion: "Descarga de documento", tipo: "Descarga", usuario: user?.nombre_completo || "Usuario", detalles: "Descargó el archivo 'manual_usuario.pdf'" },
      { id: 5, fecha: "2023-10-14 16:05:59", accion: "Cierre de sesión", tipo: "Autenticación", usuario: user?.nombre_completo || "Usuario", detalles: "Sesión finalizada por inactividad" },
      { id: 6, fecha: "2023-10-13 10:30:15", accion: "Registro nuevo", tipo: "Creación", usuario: user?.nombre_completo || "Usuario", detalles: "Creó nuevo usuario en el sistema" },
      { id: 7, fecha: "2023-10-13 13:45:28", accion: "Eliminación de registro", tipo: "Eliminación", usuario: user?.nombre_completo || "Usuario", detalles: "Eliminó producto del inventario" },
    ];
    
    setBitacoraData(mockBitacoraData);
  }, [user]);

  // Filtrar y paginar datos
  const filteredData = bitacoraData.filter(item => {
    const matchesSearch = item.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.detalles.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "todos" || item.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calcular páginas
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <TbHome size={24} className="text-gray-700" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Bitácora</h1>
            </div>
          </div>

          {/* Sección de Bitácora */}
          <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Bitácora de Actividades</h2>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <div className="relative">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="Autenticación">Autenticación</option>
                    <option value="Consulta">Consulta</option>
                    <option value="Modificación">Modificación</option>
                    <option value="Creación">Creación</option>
                    <option value="Eliminación">Eliminación</option>
                    <option value="Descarga">Descarga</option>
                  </select>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar en bitácora..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                  />
                  <TbSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            </div>

            {/* Tabla de Bitácora */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.accion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.tipo === 'Autenticación' ? 'bg-blue-100 text-blue-800' :
                            item.tipo === 'Consulta' ? 'bg-green-100 text-green-800' :
                            item.tipo === 'Modificación' ? 'bg-yellow-100 text-yellow-800' :
                            item.tipo === 'Creación' ? 'bg-purple-100 text-purple-800' :
                            item.tipo === 'Eliminación' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.usuario}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.detalles}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron registros en la bitácora.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredData.length)}
                  </span> de <span className="font-medium">{filteredData.length}</span> resultados
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      currentPage === 1 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <TbChevronLeft size={16} />
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage === page 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      currentPage === totalPages 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <TbChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Pie */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Bitacora;