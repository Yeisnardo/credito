import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from "../services/api_usuario";
import {
  getDepositosPorCedula,
  updateDepositoPorId,
} from "../services/api_deposito";

const Deposito = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [depositosPendientes, setDepositosPendientes] = useState([]);
  const [depositoSeleccionado, setDepositoSeleccionado] = useState(null);
  const [comprobanteModal, setComprobanteModal] = useState(null); // Nuevo estado para modal

  // Función para alternar el menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Cargar datos del usuario y depósitos al montar componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula_usuario = localStorage.getItem("cedula_usuario");
        if (cedula_usuario) {
          const usuario = await getUsuarioPorCedula(cedula_usuario);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            const depositos = await getDepositosPorCedula(cedula_usuario);
            console.log("Depósitos cargados:", depositos);
            setDepositosPendientes(depositos);
          }
        }
      } catch (error) {
        console.error("Error al obtener depósitos por cédula:", error);
      }
    };

    if (!user) fetchUserData();
  }, [setUser, user]);

  // Función para confirmar depósito
  const handleConfirmarDeposito = (deposito) => {
    setDepositoSeleccionado(deposito);
    Swal.fire({
      title: "¿Estás seguro de confirmar este depósito?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        confirmarDeposito();
      }
    });
  };

  // Función que confirma el depósito
  const confirmarDeposito = async () => {
  try {
    console.log("Confirmando depósito:", depositoSeleccionado);
    if (!depositoSeleccionado) return;

    // Actualizar el estado del depósito en la API a "Recibido" usando id_deposito
    await updateDepositoPorId(depositoSeleccionado.id_deposito, "Recibido");

    // Actualizar localmente la lista
    setDepositosPendientes((prevDepositos) =>
      prevDepositos.map((d) =>
        d.id_deposito === depositoSeleccionado.id_deposito
          ? { ...d, estado: "Recibido" }
          : d
      )
    );

    Swal.fire("¡Éxito!", "Depósito confirmado como recibido", "success");
    setDepositoSeleccionado(null);
  } catch (error) {
    console.error("Error al confirmar el depósito:", error);
    Swal.fire("Error", "Error al confirmar el depósito", "error");
  }
};

  // Función para abrir modal de comprobante
  const handleVerComprobante = (url) => {
    setComprobanteModal(url);
  };

  // Función para cerrar modal
  const cerrarModal = () => {
    setComprobanteModal(null);
  };

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
        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-home text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Aceptación de transferencia del crédito
              </h1>
            </div>
          </div>

          {/* Tabla de depósitos por confirmar */}
          <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              transferencia del crédito
            </h2>
            {depositosPendientes.length === 0 ? (
              <div className="text-center py-8">
                <i className="bx bx-check-circle text-6xl text-green-500 mb-4"></i>
                <p className="text-gray-600 text-lg">
                  No hay depósitos pendientes por confirmar
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {depositosPendientes.map((deposito) => (
                      <tr key={deposito.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {deposito.estado}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                          {/* Botón para confirmar depósito */}
                          <button
                            onClick={() => handleConfirmarDeposito(deposito)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
                          >
                            Confirmar
                          </button>
                          {/* Botón para visualizar comprobante */}
                          {deposito.comprobante && (
                            <button
                              onClick={() => {
                                const comprobanteUrl = deposito.comprobante
                                  ? `http://localhost:5000${deposito.comprobante}`
                                  : null;
                                handleVerComprobante(comprobanteUrl);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
                            >
                              Ver Comprobante
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>

      {/* Modal para ver comprobante */}
      {comprobanteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={cerrarModal}
            >
              ✖
            </button>
            <img
              src={comprobanteModal}
              alt="Comprobante de pago"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposito;
