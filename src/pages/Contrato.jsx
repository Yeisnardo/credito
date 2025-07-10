import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
// import api, { getUsuarioPorCedula } from "../services/api_usuario"; // Ya no es necesario en esta versión

const Contrato = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [contratos, setContratos] = useState([]); // Contratos del usuario
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Datos ficticios del usuario
        const usuarioFicticio = {
          id: 1,
          nombre: "Juan Pérez",
          email: "juan.perez@example.com",
          cedula: "1234567890",
        };
        setUserState(usuarioFicticio);
        if (setUser) setUser(usuarioFicticio);

        // Datos ficticios de contratos
        const contratosFicticios = [
          {
            id: "C-1001",
            nombre: "Contrato de Arrendamiento",
            email: "arrendador@example.com",
            estado: "Activo",
          },
          {
            id: "C-1002",
            nombre: "Contrato de Servicios",
            email: "servicios@example.com",
            estado: "Pendiente",
          },
          {
            id: "C-1003",
            nombre: "Contrato de Compra",
            email: "comprador@example.com",
            estado: "Finalizado",
          },
        ];

        // Simular retraso
        setTimeout(() => {
          setContratos(contratosFicticios);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setLoading(false);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

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
                Mis Contratos
              </h1>
            </div>
          </div>

          {/* Lista de Contratos del Usuario */}
          <section className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-300 pb-2">
              Lista de Contratos
            </h2>
            {loading ? (
              <p className="text-center text-gray-500">Cargando...</p>
            ) : contratos.length > 0 ? (
              <table className="min-w-full text-left divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase tracking-wide">
                      N° Contrato
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Estatus del Depósito
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
                  {contratos.map((contrato, index) => (
                    <tr
                      key={contrato.id}
                      className={`transition-all duration-200 hover:bg-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-800">{contrato.id}</td>
                      <td className="px-4 py-3 text-gray-800">{contrato.nombre}</td>
                      <td className="px-4 py-3 text-gray-800">{contrato.email}</td>
                      <td className="px-4 py-3 text-gray-800">{contrato.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500">No hay contratos disponibles</p>
            )}
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

export default Contrato;