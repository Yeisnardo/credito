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
} from '../services/api_requerimientos';

const Requerimientos = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimiento, setRequerimiento] = useState({ nombre_requerimiento: '' });
  const [requerimientosList, setRequerimientosList] = useState([]);
  const [editId, setEditId] = useState(null); // ID en edición
  const [editNombre, setEditNombre] = useState(''); // Nombre en edición

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cargar usuario
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

  // Cargar los requerimientos al montar
  useEffect(() => {
    const fetchRequerimientos = async () => {
      try {
        const data = await getRequerimientos();
        setRequerimientosList(data);
      } catch (error) {
        console.error('Error al obtener requerimientos:', error);
      }
    };
    fetchRequerimientos();
  }, []);

  // Manejar cambio en input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequerimiento({ ...requerimiento, [name]: value });
  };

  // Crear nuevo requerimiento
  const handleSubmitRequerimiento = async (e) => {
    e.preventDefault();
    try {
      const nuevoReq = await createRequerimiento({ nombre_requerimiento: requerimiento.nombre_requerimiento });
      setRequerimientosList([nuevoReq, ...requerimientosList]);
      setRequerimiento({ nombre_requerimiento: '' });
    } catch (error) {
      console.error('Error al crear requerimiento:', error);
    }
  };

  // Eliminar requerimiento
  const handleEliminar = async (id) => {
    try {
      await deleteRequerimiento(id);
      setRequerimientosList(requerimientosList.filter(req => req.id_requerimientos !== id));
    } catch (error) {
      console.error('Error al eliminar requerimiento:', error);
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
      const reqActualizada = await updateRequerimiento(id, { nombre_requerimiento: editNombre });
      setRequerimientosList(requerimientosList.map(req => 
        req.id_requerimientos === id ? reqActualizada : req
      ));
      setEditId(null);
      setEditNombre('');
    } catch (error) {
      console.error('Error al actualizar requerimiento:', error);
    }
  };

  // Cancelar edición
  const handleCancelar = () => {
    setEditId(null);
    setEditNombre('');
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {menuOpen && <Menu />}
      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-8 bg-gray-50">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-11">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
                <i className="bx bx-cog text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Configuracion de Requerimientos</h1>
            </div>
          </div>

          {/* Sección para registrar requerimiento */}
          <section className="mb-12 bg-white p-6 rounded-xl shadow-lg mt-5">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Registrar Requerimiento</h2>
            <form onSubmit={handleSubmitRequerimiento} className="space-y-4 mb-8">
              <div>
                <label className="block mb-1 font-semibold text-gray-600" htmlFor="nombre_requerimiento">Nombre del Requerimiento</label>
                <input
                  type="text"
                  id="nombre_requerimiento"
                  name="nombre_requerimiento"
                  value={requerimiento.nombre_requerimiento}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Registrar Requerimiento
              </button>
            </form>
          </section>

          {/* Tabla de requerimientos con edición */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Listado de Requerimientos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Nombre</th>
                    <th className="border px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requerimientosList.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="border px-4 py-2 text-center text-gray-500">
                        No hay requerimientos registrados.
                      </td>
                    </tr>
                  ) : (
                    requerimientosList.map((req) => (
                      <tr key={req.id_requerimientos}>
                        <td className="border px-4 py-2">
                          {editId === req.id_requerimientos ? (
                            <input
                              type="text"
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="w-full p-1 border border-gray-300 rounded"
                            />
                          ) : (
                            req.nombre_requerimiento
                          )}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {editId === req.id_requerimientos ? (
                            <>
                              <button
                                onClick={() => handleGuardar(req.id_requerimientos)}
                                className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={handleCancelar}
                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditar(req.id_requerimientos, req.nombre_requerimiento)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleEliminar(req.id_requerimientos)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
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

        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Requerimientos;