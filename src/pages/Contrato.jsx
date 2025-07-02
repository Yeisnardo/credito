import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from '../services/api_usuario';

const Contrato = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [showContrato, setShowContrato] = useState(false); // Pantalla de aceptación
  const [accepted, setAccepted] = useState(false);
  const [usuarios, setUsuarios] = useState([]); // Lista de usuarios
  const [mostrarTabla, setMostrarTabla] = useState(false); // Mostrar tabla
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [modalContrato, setModalContrato] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cargar usuario al inicio
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem('cedula_usuario');
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            // Si ya aceptó, no mostrar pantalla de aceptación
            if (usuario?.aceptoContrato) {
              setShowContrato(false);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener usuario por cédula:', error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Función para manejar clic en "Ver Contratos"
  const handleVerContratos = () => {
    if (user?.aceptoContrato) {
      // Si ya aceptó, mostrar lista de contratos
      fetchUsuarios();
      setMostrarTabla(true);
    } else {
      // Si no, mostrar pantalla de aceptación
      setShowContrato(true);
    }
  };

  // Función para aceptar contrato
  const handleAceptarContrato = () => {
    // Aquí debes actualizar en la API que aceptó
    setUserState(prev => ({ ...prev, aceptoContrato: true }));
    setShowContrato(false);
    fetchUsuarios();
    setMostrarTabla(true);
  };

  // Simular obtener lista de usuarios
  const fetchUsuarios = () => {
    const data = [
      {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@example.com",
        aceptoContrato: true,
        contrato: "Contrato de Juan Pérez..."
      },
      {
        id: 2,
        nombre: "María López",
        email: "maria@example.com",
        aceptoContrato: false,
        contrato: "Contrato de María López..."
      },
      {
        id: 3,
        nombre: "Carlos Gómez",
        email: "carlos@example.com",
        aceptoContrato: true,
        contrato: "Contrato de Carlos Gómez..."
      }
    ];
    setUsuarios(data);
  };

  const handleVerContrato = (contrato) => {
    setContratoSeleccionado(contrato);
    setModalContrato(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        {/* Pantalla de aceptación */}
        {showContrato && (
          <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Contrato de Servicios</h2>
              <div className="h-64 overflow-y-auto border p-4 mb-4">
                <p>
                  Bienvenido. Por favor, lee y acepta los términos y condiciones para continuar...
                </p>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="aceptar"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="aceptar" className="text-gray-700">
                  Acepto los términos y condiciones del contrato.
                </label>
              </div>
              <button
                disabled={!accepted}
                onClick={handleAceptarContrato}
                className={`w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Confirmar aceptación
              </button>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {!showContrato && (
          <main className="flex-1 p-8 bg-gray-50">
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-8 mt-10">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
                  <i className="bx bx-file text-3xl text-gray-700"></i>
                </div>
                <h1 className="text-3xl font-semibold text-gray-800">Mis Contratos</h1>
              </div>
            </div>

            {/* Botón "Ver Contratos" */}
            <div className="mb-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleVerContratos}
              >
                Ver Contratos
              </button>
            </div>

            {/* Tabla de contratos */}
            {mostrarTabla && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Nombre</th>
                      <th className="border px-4 py-2">Correo</th>
                      <th className="border px-4 py-2">Estatus</th>
                      <th className="border px-4 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td className="border px-4 py-2">{u.nombre}</td>
                        <td className="border px-4 py-2">{u.email}</td>
                        <td className="border px-4 py-2">
                          {u.aceptoContrato ? (
                            <span className="text-green-600 font-semibold">Aceptado</span>
                          ) : (
                            <span className="text-red-600 font-semibold">Pendiente</span>
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
                            onClick={() => handleVerContrato(u.contrato)}
                          >
                            Ver Contrato
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        )}

        {/* Modal para vista de contrato */}
        {modalContrato && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-xl w-full relative">
              <h2 className="text-xl font-semibold mb-4">Contrato</h2>
              <div className="h-64 overflow-y-auto border p-4 mb-4">
                <p>{contratoSeleccionado}</p>
              </div>
              <button
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded"
                onClick={() => setModalContrato(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contrato;