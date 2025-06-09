import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_usuario"; // Asegúrate de importar tu archivo de API

const Dashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true); // controla si el menu está abierto
  const [user, setUser ] = useState(null); // Estado para almacenar la información del usuario

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    // Simulación de inicio de sesión y obtención de datos del usuario
    const fetchUserData = async () => {
      try {
        const response = await api.getUsuario(); // Llama a la API para obtener los usuarios
        // Aquí puedes establecer el usuario que deseas mostrar, por ejemplo, el primero
        if (response.length > 0) {
          setUser (response[0]); // Establece el primer usuario como el usuario actual
        }
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        // Manejo de errores, redirigir o mostrar un mensaje
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menú condicional */}
      {menuOpen && <Menu />}

      {/* Contenido principal, con margen para header y menu */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        {/* Header con botón para abrir/cerrar menu */}
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Contenido debajo del header */}
        <div className="pt-20 px-8">
          {/* Encabezado con título y botón */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-home text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Inicio</h1>
            </div>
          </header>

          {/* Sección de tarjetas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tarjeta 1 */}
            <div className="bg-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out hover:shadow-xl">
              <div className="p-6 flex items-center space-x-4">
                <i className="bx bx-user-circle text-4xl text-[#07142A]"></i>
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-[#07142A]">
                    Resumen de usuario
                  </h2>
                  <p className="text-gray-700 mb-2">Nombre: {user?.nombre }</p>
                  <p className="text-gray-700">
                    Status:{" "}
                    <span className="font-semibold text-green-500">Activo</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out hover:shadow-xl">
              <div className="p-6 flex items-center space-x-4">
                <i className="bx bx-chart bar-chart text-4xl text-[#07142A]"></i>
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-[#07142A]">
                    Estadísticas
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      Mensajes enviados:{" "}
                      <span className="font-semibold">120</span>
                    </p>
                    <p className="text-gray-700">
                      Sesiones hoy: <span className="font-semibold">5</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out hover:shadow-xl">
              <div className="p-6 flex items-center space-x-4">
                <i className="bx bx-cog text-4xl text-[#07142A]"></i>
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-[#07142A]">
                    Configuraciones
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Perfil</li>
                    <li>Seguridad</li>
                    <li>Notificaciones</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* Pie de página */}
        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
