import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import {
  createRequerimiento,
  getRequerimientos,
  updateRequerimiento,
  deleteRequerimiento,
} from "../services/api_requerimientos";

const Requerimientos = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimiento, setRequerimiento] = useState({
    nombre_requerimiento: "",
  });
  const [requerimientosList, setRequerimientosList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cargar usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario por cédula:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Cargar requerimientos
  useEffect(() => {
    const fetchRequerimientos = async () => {
      try {
        const data = await getRequerimientos();
        setRequerimientosList(data);
      } catch (error) {
        console.error("Error al obtener requerimientos:", error);
      }
    };
    fetchRequerimientos();
  }, []);

  // Manejar input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequerimiento({ ...requerimiento, [name]: value });
  };

  // Crear requerimiento
  const handleSubmitRequerimiento = async (e) => {
    e.preventDefault();
    try {
      const nuevoReq = await createRequerimiento({
        nombre_requerimiento: requerimiento.nombre_requerimiento,
      });
      setRequerimientosList([nuevoReq, ...requerimientosList]);
      setRequerimiento({ nombre_requerimiento: "" });
    } catch (error) {
      console.error("Error al crear requerimiento:", error);
    }
  };

  // Eliminar requerimiento
  const handleEliminar = async (id) => {
    try {
      await deleteRequerimiento(id);
      setRequerimientosList(
        requerimientosList.filter((req) => req.id_requerimientos !== id)
      );
    } catch (error) {
      console.error("Error al eliminar requerimiento:", error);
    }
  };

  // Editar requerimiento
  const handleEditar = (id, currentNombre) => {
    setEditId(id);
    setEditNombre(currentNombre);
  };

  // Guardar edición
  const handleGuardar = async (id) => {
    try {
      const reqActualizada = await updateRequerimiento(id, {
        nombre_requerimiento: editNombre,
      });
      setRequerimientosList(
        requerimientosList.map((req) =>
          req.id_requerimientos === id ? reqActualizada : req
        )
      );
      setEditId(null);
      setEditNombre("");
    } catch (error) {
      console.error("Error al actualizar requerimiento:", error);
    }
  };

  // Cancelar edición
  const handleCancelar = () => {
    setEditId(null);
    setEditNombre("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif transition-all duration-300">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-8 bg-gray-50">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-11 px-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-cog text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Configuración de Requerimientos
              </h1>
            </div>
          </div>

          {/* Sección para registrar requerimiento */}
          <section className="mb-12 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Registrar Requerimiento
            </h2>
            <form onSubmit={handleSubmitRequerimiento} className="space-y-4">
              <div>
                <label
                  className="block mb-1 font-semibold text-gray-600"
                  htmlFor="nombre_requerimiento"
                >
                  Nombre del Requerimiento
                </label>
                <input
                  type="text"
                  id="nombre_requerimiento"
                  name="nombre_requerimiento"
                  value={requerimiento.nombre_requerimiento}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Ingrese nombre del requerimiento"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Registrar Requerimiento
              </button>
            </form>
          </section>

          {/* Tabla de requerimientos con edición */}
          <section className="flex-1 p-8 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2 border-gray-300">
              Listado de Requerimientos
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-600 font-medium uppercase tracking-wider text-sm">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-center text-gray-600 font-medium uppercase tracking-wider text-sm">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requerimientosList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="2"
                        className="px-6 py-4 text-center text-gray-400"
                      >
                        No hay requerimientos registrados.
                      </td>
                    </tr>
                  ) : (
                    requerimientosList.map((req) => (
                      <tr
                        key={req.id_requerimientos}
                        className="hover:bg-gray-100 transition duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editId === req.id_requerimientos ? (
                            <input
                              type="text"
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            />
                          ) : (
                            <span className="text-gray-800">
                              {req.nombre_requerimiento}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-3">
                          {editId === req.id_requerimientos ? (
                            <>
                              <button
                                onClick={() =>
                                  handleGuardar(req.id_requerimientos)
                                }
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={handleCancelar}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleEditar(
                                    req.id_requerimientos,
                                    req.nombre_requerimiento
                                  )
                                }
                                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() =>
                                  handleEliminar(req.id_requerimientos)
                                }
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition"
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
};

export default Requerimientos;
