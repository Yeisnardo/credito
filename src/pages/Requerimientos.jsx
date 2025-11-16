import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import {
  createRequerimiento,
  getRequerimientos,
  updateRequerimiento,
  deleteRequerimiento,
} from "../services/api_requerimientos";
import {
  createRequerimientoFiador,
  getRequerimientosFiador,
  updateRequerimientoFiador,
  deleteRequerimientoFiador,
} from '../services/api_requerimientos_fiador';

// Importación de Tabler Icons
import {
  TbSettings,
  TbPlus,
  TbCheck,
  TbList,
  TbPackage,
  TbEdit,
  TbTrash,
  TbX,
  TbInfoCircle,
  TbLoader,
  TbUser,
  TbUsers
} from 'react-icons/tb';

const Requerimientos = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  
  // Estados para requerimientos principales
  const [requerimiento, setRequerimiento] = useState({
    nombre_requerimiento: "",
  });
  const [requerimientosList, setRequerimientosList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  
  // Estados para requerimientos del fiador
  const [requerimientoFiador, setRequerimientoFiador] = useState({
    nombre_reqf: "", // CAMBIADO: usar el nombre correcto del campo
  });
  const [requerimientosFiadorList, setRequerimientosFiadorList] = useState([]);
  const [editFiadorId, setEditFiadorId] = useState(null);
  const [editFiadorNombre, setEditFiadorNombre] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("emprendedor");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cargar requerimientos
  useEffect(() => {
    const fetchRequerimientos = async () => {
      try {
        setLoading(true);
        const [dataRequerimientos, dataFiadores] = await Promise.all([
          getRequerimientos(),
          getRequerimientosFiador()
        ]);
        setRequerimientosList(dataRequerimientos);
        setRequerimientosFiadorList(dataFiadores);
      } catch (error) {
        console.error("Error al obtener requerimientos:", error);
        alert("Error al cargar los requerimientos");
      } finally {
        setLoading(false);
      }
    };
    fetchRequerimientos();
  }, []);

  // Manejar input requerimientos principales
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequerimiento({ ...requerimiento, [name]: value });
  };

  // Manejar input requerimientos fiador
  const handleInputChangeFiador = (e) => {
    const { name, value } = e.target;
    setRequerimientoFiador({ ...requerimientoFiador, [name]: value });
  };

  // Crear requerimiento principal
  const handleSubmitRequerimiento = async (e) => {
    e.preventDefault();
    if (!requerimiento.nombre_requerimiento.trim()) {
      alert("Por favor ingresa un nombre para el requerimiento");
      return;
    }

    try {
      setSubmitting(true);
      const nuevoReq = await createRequerimiento({
        nombre_requerimiento: requerimiento.nombre_requerimiento.trim(),
      });
      setRequerimientosList([nuevoReq, ...requerimientosList]);
      setRequerimiento({ nombre_requerimiento: "" });
    } catch (error) {
      console.error("Error al crear requerimiento:", error);
      alert("Error al crear el requerimiento");
    } finally {
      setSubmitting(false);
    }
  };

  // Crear requerimiento fiador - CORREGIDO
  const handleSubmitRequerimientoFiador = async (e) => {
    e.preventDefault();
    if (!requerimientoFiador.nombre_reqf.trim()) {
      alert("Por favor ingresa un nombre para el requerimiento del fiador");
      return;
    }

    try {
      setSubmitting(true);
      const nuevoReq = await createRequerimientoFiador({
        nombre_reqf: requerimientoFiador.nombre_reqf.trim(),
      });
      setRequerimientosFiadorList([nuevoReq, ...requerimientosFiadorList]);
      setRequerimientoFiador({ nombre_reqf: "" });
    } catch (error) {
      console.error("Error al crear requerimiento del fiador:", error);
      alert("Error al crear el requerimiento del fiador");
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar requerimiento principal
  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el requerimiento "${nombre}"?`)) {
      return;
    }

    try {
      await deleteRequerimiento(id);
      setRequerimientosList(
        requerimientosList.filter((req) => req.id_requerimientos !== id)
      );
      alert("Requerimiento eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar requerimiento:", error);
      alert("Error al eliminar el requerimiento");
    }
  };

  // Eliminar requerimiento fiador
  const handleEliminarFiador = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el requerimiento del fiador "${nombre}"?`)) {
      return;
    }

    try {
      await deleteRequerimientoFiador(id);
      setRequerimientosFiadorList(
        requerimientosFiadorList.filter((req) => req.idr_fiador !== id)
      );
      alert("Requerimiento del fiador eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar requerimiento del fiador:", error);
      alert("Error al eliminar el requerimiento del fiador");
    }
  };

  // Editar requerimiento principal
  const handleEditar = (id, currentNombre) => {
    setEditId(id);
    setEditNombre(currentNombre);
  };

  // Editar requerimiento fiador
  const handleEditarFiador = (id, currentNombre) => {
    setEditFiadorId(id);
    setEditFiadorNombre(currentNombre);
  };

  // Guardar edición principal
  const handleGuardar = async (id) => {
    if (!editNombre.trim()) {
      alert("El nombre del requerimiento no puede estar vacío");
      return;
    }

    try {
      const reqActualizada = await updateRequerimiento(id, {
        nombre_requerimiento: editNombre.trim(),
      });
      setRequerimientosList(
        requerimientosList.map((req) =>
          req.id_requerimientos === id ? reqActualizada : req
        )
      );
      setEditId(null);
      setEditNombre("");
      alert("Requerimiento actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar requerimiento:", error);
      alert("Error al actualizar el requerimiento");
    }
  };

  // Guardar edición fiador
  const handleGuardarFiador = async (id) => {
    if (!editFiadorNombre.trim()) {
      alert("El nombre del requerimiento del fiador no puede estar vacío");
      return;
    }

    try {
      const reqActualizada = await updateRequerimientoFiador(id, {
        nombre_reqf: editFiadorNombre.trim(),
      });
      setRequerimientosFiadorList(
        requerimientosFiadorList.map((req) =>
          req.idr_fiador === id ? reqActualizada : req
        )
      );
      setEditFiadorId(null);
      setEditFiadorNombre("");
      alert("Requerimiento del fiador actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar requerimiento del fiador:", error);
      alert("Error al actualizar el requerimiento del fiador");
    }
  };

  // Cancelar edición principal
  const handleCancelar = () => {
    setEditId(null);
    setEditNombre("");
  };

  // Cancelar edición fiador
  const handleCancelarFiador = () => {
    setEditFiadorId(null);
    setEditFiadorNombre("");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {menuOpen && <Menu />}
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}>
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-6">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 mt-13">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md">
                <TbSettings className="text-indigo-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Gestión de Requerimientos
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Administra los requerimientos de emprendedores y fiadores
                </p>
              </div>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 mb-8 inline-flex">
            <button
              onClick={() => setActiveTab("emprendedor")}
              className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center ${
                activeTab === "emprendedor"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <TbUser className="mr-2" size={18} />
              Emprendedor
            </button>
            <button
              onClick={() => setActiveTab("fiador")}
              className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center ${
                activeTab === "fiador"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <TbUsers className="mr-2" size={18} />
              Fiador
            </button>
          </div>

          {/* Contenido según tab activo */}
          {activeTab === "emprendedor" ? (
            <>
              {/* Sección para registrar requerimiento del emprendedor */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3 border-gray-200 flex items-center">
                  <TbPlus className="mr-2 text-indigo-600" size={20} />
                  Registrar Requerimiento de Emprendedor
                </h2>
                
                <form onSubmit={handleSubmitRequerimiento} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nombre_requerimiento">
                      Nombre del Requerimiento
                    </label>
                    <input
                      type="text"
                      id="nombre_requerimiento"
                      name="nombre_requerimiento"
                      value={requerimiento.nombre_requerimiento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="Ingrese el nombre del requerimiento"
                      disabled={submitting}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting || !requerimiento.nombre_requerimiento.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
                  >
                    {submitting ? (
                      <>
                        <TbLoader className="animate-spin mr-2" size={16} />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <TbCheck className="mr-2" size={16} />
                        Registrar Requerimiento
                      </>
                    )}
                  </button>
                </form>
              </section>

              {/* Tabla de requerimientos del emprendedor */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3 border-gray-200 flex items-center">
                  <TbList className="mr-2 text-indigo-600" size={20} />
                  Requerimientos de Emprendedores
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <TbLoader className="animate-spin text-indigo-600 mx-auto mb-4" size={32} />
                    <p className="text-gray-500">Cargando requerimientos...</p>
                  </div>
                ) : requerimientosList.length === 0 ? (
                  <div className="text-center py-12">
                    <TbPackage className="text-gray-300 mx-auto mb-3" size={48} />
                    <p className="text-gray-500">No hay requerimientos registrados</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Comienza agregando tu primer requerimiento
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <TbList className="inline mr-1" size={14} />
                            Nombre del Requerimiento
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <TbSettings className="inline mr-1" size={14} />
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requerimientosList.map((req) => (
                          <tr key={req.id_requerimientos} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editId === req.id_requerimientos ? (
                                <input
                                  type="text"
                                  value={editNombre}
                                  onChange={(e) => setEditNombre(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-gray-800 font-medium">
                                  {req.nombre_requerimiento}
                                </span>
                              )}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center space-x-2">
                                {editId === req.id_requerimientos ? (
                                  <>
                                    <button
                                      onClick={() => handleGuardar(req.id_requerimientos)}
                                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
                                      title="Guardar"
                                    >
                                      <TbCheck size={16} />
                                    </button>
                                    <button
                                      onClick={handleCancelar}
                                      className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md transition-colors"
                                      title="Cancelar"
                                    >
                                      <TbX size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditar(req.id_requerimientos, req.nombre_requerimiento)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
                                      title="Editar"
                                    >
                                      <TbEdit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleEliminar(req.id_requerimientos, req.nombre_requerimiento)}
                                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
                                      title="Eliminar"
                                    >
                                      <TbTrash size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {requerimientosList.length > 0 && (
                  <div className="mt-4 text-sm text-gray-500 flex items-center">
                    <TbInfoCircle className="mr-1" size={14} />
                    Total: {requerimientosList.length} requerimiento{requerimientosList.length !== 1 ? 's' : ''}
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              {/* Sección para registrar requerimiento del fiador - CORREGIDO */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3 border-gray-200 flex items-center">
                  <TbPlus className="mr-2 text-indigo-600" size={20} />
                  Registrar Requerimiento de Fiador
                </h2>
                
                <form onSubmit={handleSubmitRequerimientoFiador} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nombre_reqf">
                      Nombre del Requerimiento del Fiador
                    </label>
                    <input
                      type="text"
                      id="nombre_reqf"
                      name="nombre_reqf"
                      value={requerimientoFiador.nombre_reqf}
                      onChange={handleInputChangeFiador}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="Ingrese el nombre del requerimiento del fiador"
                      disabled={submitting}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting || !requerimientoFiador.nombre_reqf.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
                  >
                    {submitting ? (
                      <>
                        <TbLoader className="animate-spin mr-2" size={16} />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <TbCheck className="mr-2" size={16} />
                        Registrar Requerimiento
                      </>
                    )}
                  </button>
                </form>
              </section>

              {/* Tabla de requerimientos del fiador */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3 border-gray-200 flex items-center">
                  <TbList className="mr-2 text-indigo-600" size={20} />
                  Requerimientos de Fiadores
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <TbLoader className="animate-spin text-indigo-600 mx-auto mb-4" size={32} />
                    <p className="text-gray-500">Cargando requerimientos...</p>
                  </div>
                ) : requerimientosFiadorList.length === 0 ? (
                  <div className="text-center py-12">
                    <TbPackage className="text-gray-300 mx-auto mb-3" size={48} />
                    <p className="text-gray-500">No hay requerimientos de fiadores registrados</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Comienza agregando tu primer requerimiento de fiador
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <TbList className="inline mr-1" size={14} />
                            Nombre del Requerimiento
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <TbSettings className="inline mr-1" size={14} />
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requerimientosFiadorList.map((req) => (
                          <tr key={req.idr_fiador} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editFiadorId === req.idr_fiador ? (
                                <input
                                  type="text"
                                  value={editFiadorNombre}
                                  onChange={(e) => setEditFiadorNombre(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-gray-800 font-medium">
                                  {req.nombre_reqf}
                                </span>
                              )}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center space-x-2">
                                {editFiadorId === req.idr_fiador ? (
                                  <>
                                    <button
                                      onClick={() => handleGuardarFiador(req.idr_fiador)}
                                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
                                      title="Guardar"
                                    >
                                      <TbCheck size={16} />
                                    </button>
                                    <button
                                      onClick={handleCancelarFiador}
                                      className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md transition-colors"
                                      title="Cancelar"
                                    >
                                      <TbX size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditarFiador(req.idr_fiador, req.nombre_reqf)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
                                      title="Editar"
                                    >
                                      <TbEdit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleEliminarFiador(req.idr_fiador, req.nombre_reqf)}
                                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
                                      title="Eliminar"
                                    >
                                      <TbTrash size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {requerimientosFiadorList.length > 0 && (
                  <div className="mt-4 text-sm text-gray-500 flex items-center">
                    <TbInfoCircle className="mr-1" size={14} />
                    Total: {requerimientosFiadorList.length} requerimiento{requerimientosFiadorList.length !== 1 ? 's' : ''} de fiador
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        {/* Pie de página */}
        <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Requerimientos;