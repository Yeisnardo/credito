import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from '../services/api_usuario';

const Dashboard = ({ setUser  }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);

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
            if (setUser ) setUser (usuario);
          }
        }
      } catch (error) {
        console.error('Error al obtener usuario por cédula:', error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser , user]);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Menú lateral */}
      {menuOpen && <Menu />}

      {/* Contenido principal */}
      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <main className="flex-1 p-8 bg-gray-50">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-10">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
                <i className="bx bx-home text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Inicio</h1>
            </div>
          </div>

          {/* Tarjetas de resumen */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tarjeta 1 */}
            <div className="bg-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out border-t-4 border-blue-500 hover:shadow-xl">
              <div className="p-6 flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <i className="bx bx-user-circle text-4xl text-blue-700"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">Resumen de usuario</h2>
                  <p className="text-gray-600 mb-1">
                    <strong>Nombre:</strong> {user?.nombre || "Cargando..."}
                  </p>
                  <p className="text-gray-600">
                    <strong>Estatus:</strong> <span className="font-semibold text-green-600">{user?.estatus || "Cargando..."}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out border-t-4 border-purple-500 hover:shadow-xl">
              <div className="p-6 flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <i className="bx bx-chart text-4xl text-purple-700"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">Estadísticas</h2>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <strong>Mensajes enviados:</strong> <span className="font-semibold">120</span>
                    </p>
                    <p>
                      <strong>Sesiones hoy:</strong> <span className="font-semibold">5</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out border-t-4 border-green-500 hover:shadow-xl">
              <div className="p-6 flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <i className="bx bx-cog text-4xl text-green-700"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">Configuraciones</h2>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Perfil</li>
                    <li>Seguridad</li>
                    <li>Notificaciones</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
