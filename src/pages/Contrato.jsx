import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from "../services/api_usuario";

const Contrato = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [data, setData] = useState([]); // Estado para los datos de la DataTable

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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

  // Ejemplo de datos para la DataTable
  useEffect(() => {
    // Aquí puedes reemplazar esto con una llamada a tu API para obtener datos reales
    const fetchData = async () => {
      const mockData = [
        {
          id: 1,
          nombre: "Juan Pérez",
          email: "juan@example.com",
          estado: "Activo",
        },
        {
          id: 2,
          nombre: "María Gómez",
          email: "maria@example.com",
          estado: "Inactivo",
        },
        {
          id: 3,
          nombre: "Carlos López",
          email: "carlos@example.com",
          estado: "Activo",
        },
      ];
      setData(mockData);
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-file text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Gestion de Contrato
              </h1>
            </div>
          </div>

          {/* Aquí añadimos la DataTable */}
          <section className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-300 pb-2">
              Lista de Contrato
            </h2>
            <table className="min-w-full text-left divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    N° Contrato
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Estatus del Depostito
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`transition-all duration-200 hover:bg-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-800">{item.id}</td>
                      <td className="px-4 py-3 text-gray-800">{item.nombre}</td>
                      <td className="px-4 py-3 text-gray-800">{item.email}</td>
                      <td className="px-4 py-3 text-gray-800">{item.estado}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-4 text-center text-gray-400 italic"
                    >
                      No hay datos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </main>

        {/* Pie */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
};

export default Contrato;
