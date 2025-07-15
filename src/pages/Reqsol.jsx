import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from '../services/api_usuario';
import { getRequerimientos } from "../services/api_requerimientos";
import { getRequerimientoEmprendedor } from "../services/api_requerimiento_emprendedor";

const Reqsol = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimientos, setRequerimientos] = useState([]);
  const [motivos, setMotivos] = useState([]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    // Simulación de obtención de usuario
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          // Aquí puedes llamar a tu API para obtener usuario si lo necesitas
           const usuario = await getUsuarioPorCedula(cedula);
           setUser(usuario);
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };

    fetchUserData();

    // Obtener requerimientos y motivos del emprendedor
    const cedulaEmprendedor = localStorage.getItem("cedula_usuario") || "123456789"; // ajusta según tu lógica
    const fetchRequerimientosYMotivos = async () => {
      try {
        const data = await getRequerimientoEmprendedor(cedulaEmprendedor);
        // Asumiendo que data tiene estructura { requerimientos: [], motivos: [] }
        setRequerimientos(data.requerimientos || []);
        setMotivos(data.motivos || []);
      } catch (error) {
        console.error("Error al obtener requerimientos o motivos:", error);
      }
    };

    fetchRequerimientosYMotivos();
  }, [setUser]);

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

        {/* Contenido principal */}
        <main className="flex-1 p-8 space-y-8">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform duration-300">
                <i className="bx bx-home text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Inicio</h1>
            </div>
          </div>

          {/* Tarjetas rápidas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Resumen usuario */}
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-[#0F3C5B] hover:scale-105 transform transition duration-300 ease-in-out p-6 flex items-center space-x-4">
              <div className="bg-[#0F3C5B] p-3 rounded-full shadow-md">
                <i className="bx bx-user-circle text-4xl text-white"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-700">
                  Resumen de usuario
                </h2>
                <p className="text-gray-600 mb-1">
                  <strong>Nombre:</strong>{" "}
                  {user?.nombre_completo || "Cargando..."}
                </p>
                <p className="text-gray-600">
                  <strong>Estatus:</strong>{" "}
                  <span className="font-semibold text-green-600">
                    {user?.estatus || "Cargando..."}
                  </span>
                </p>
              </div>
            </div>
            {/* Estadísticas */}
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-[#5B007A] hover:scale-105 transform transition duration-300 ease-in-out p-6 flex items-center space-x-4">
              <div className="bg-[#5B007A] p-3 rounded-full shadow-md">
                <i className="bx bx-chart text-4xl text-white"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-700">
                  Estadísticas
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Mensajes enviados:</strong>{" "}
                    <span className="font-semibold">120</span>
                  </p>
                  <p>
                    <strong>Sesiones hoy:</strong>{" "}
                    <span className="font-semibold">5</span>
                  </p>
                </div>
              </div>
            </div>
            {/* Configuraciones */}
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-[#008000] hover:scale-105 transform transition duration-300 ease-in-out p-6 flex items-center space-x-4">
              <div className="bg-[#008000] p-3 rounded-full shadow-md">
                <i className="bx bx-cog text-4xl text-white"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-700">
                  Configuraciones
                </h2>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Perfil</li>
                  <li>Seguridad</li>
                  <li>Notificaciones</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Requerimientos */}
          <section className="bg-white p-6 rounded-xl shadow-md mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2 border-gray-200">
              Requerimientos
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {requerimientos.length > 0 ? (
                requerimientos.map((req, index) => (
                  <li key={index}>{req}</li>
                ))
              ) : (
                <li>Cargando requerimientos...</li>
              )}
            </ul>
          </section>

          {/* Motivos en tabla */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2 border-gray-200">
              Motivos de Solicitud
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                      Motivo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {motivos.length > 0 ? (
                    motivos.map((motivo) => (
                      <tr key={motivo.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700">{motivo.id}</td>
                        <td className="px-4 py-2 text-gray-700">{motivo.motivo}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-2 text-center text-gray-500"
                      >
                        Cargando motivos...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Pie */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Reqsol;