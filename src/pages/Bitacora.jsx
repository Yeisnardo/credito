import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from '../services/api_usuario';
import { getBitacora, getBitacoraFiltrada } from '../services/api_bitacora';

// Importar Tabler Icons
import {
  TbHome,
  TbSearch,
  TbChevronLeft,
  TbChevronRight,
  TbFilter,
  TbRefresh
} from "react-icons/tb";

const Bitacora = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [bitacoraData, setBitacoraData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [pagination, setPagination] = useState({
    total: 0,
    paginas: 0
  });

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

  // Cargar datos reales de la bitácora
  const fetchBitacoraData = async (pagina = 1) => {
    try {
      setLoading(true);
      const offset = (pagina - 1) * itemsPerPage;
      
      let filtros = {
        limite: itemsPerPage,
        offset: offset
      };

      if (searchTerm) {
        filtros.accion = searchTerm;
      }

      const response = await getBitacoraFiltrada(filtros);
      
      setBitacoraData(response.registros || []);
      setPagination(response.paginacion || { total: 0, paginas: 0 });
      setCurrentPage(pagina);
    } catch (error) {
      console.error('Error cargando bitácora:', error);
      // En caso de error, mostrar datos vacíos
      setBitacoraData([]);
      setPagination({ total: 0, paginas: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitacoraData(1);
  }, []);

  // Efecto para buscar cuando cambia el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBitacoraData(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    fetchBitacoraData(1);
  };

  const paginate = (pageNumber) => {
    fetchBitacoraData(pageNumber);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getTipoAccion = (accion) => {
    if (accion.includes('SESION')) return 'Autenticación';
    if (accion.includes('CREAR') || accion.includes('REGISTRAR')) return 'Creación';
    if (accion.includes('ACTUALIZAR') || accion.includes('MODIFICAR')) return 'Modificación';
    if (accion.includes('ELIMINAR')) return 'Eliminación';
    if (accion.includes('CONSULTAR') || accion.includes('OBTENER')) return 'Consulta';
    if (accion.includes('DESCARGAR') || accion.includes('EXPORTAR')) return 'Descarga';
    return 'General';
  };

  const getColorTipo = (tipo) => {
    switch (tipo) {
      case 'Autenticación': return 'bg-blue-100 text-blue-800';
      case 'Consulta': return 'bg-green-100 text-green-800';
      case 'Modificación': return 'bg-yellow-100 text-yellow-800';
      case 'Creación': return 'bg-purple-100 text-purple-800';
      case 'Eliminación': return 'bg-red-100 text-red-800';
      case 'Descarga': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              <div 
                className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <TbHome size={24} className="text-gray-700" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Bitácora del Sistema</h1>
            </div>
          </div>

          {/* Sección de Bitácora */}
          <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <h2 className="text-2xl font-semibold text-gray-800">Registros de Actividad</h2>
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <TbRefresh size={16} />
                  <span>Actualizar</span>
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <div className="relative flex items-center">
                  <TbFilter className="absolute left-3 text-gray-400" size={16} />
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
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
                    placeholder="Buscar por acción..."
                    value={searchTerm}
                    onChange={handleSearch}
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
                      Rol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          <span className="ml-2">Cargando registros...</span>
                        </div>
                      </td>
                    </tr>
                  ) : bitacoraData.length > 0 ? (
                    bitacoraData.map((item) => {
                      const tipo = getTipoAccion(item.accion);
                      return (
                        <tr key={item.id_bitacora} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.accion}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getColorTipo(tipo)}`}>
                              {tipo}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.nombre_completo || item.cedula_usuario || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.rol || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.detalles ? (
                              typeof item.detalles === 'object' 
                                ? JSON.stringify(item.detalles)
                                : item.detalles
                            ) : 'Sin detalles'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron registros en la bitácora.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.paginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, pagination.total)}
                  </span> de <span className="font-medium">{pagination.total}</span> resultados
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
                    {Array.from({ length: pagination.paginas }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.paginas || 
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      )
                      .map((page, index, array) => {
                        // Agregar puntos suspensivos para paginas largas
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && <span className="px-2">...</span>}
                            <button
                              onClick={() => paginate(page)}
                              className={`px-3 py-1 rounded-md text-sm ${
                                currentPage === page 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === pagination.paginas}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      currentPage === pagination.paginas 
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