import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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
  const [comprobanteModal, setComprobanteModal] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
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
        Swal.fire("Error", "No se pudieron cargar los depósitos", "error");
      } finally {
        setLoading(false);
      }
    };

    if (!user) fetchUserData();
  }, [setUser, user]);

  const handleConfirmarDeposito = (deposito) => {
    setDepositoSeleccionado(deposito);
    Swal.fire({
      title: "¿Confirmar depósito?",
      text: "Esta acción no se puede deshacer",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      background: "#f8fafc",
      customClass: {
        title: "font-serif text-gray-800",
        confirmButton: "font-medium"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        confirmarDeposito();
      }
    });
  };

  const confirmarDeposito = async () => {
    try {
      if (!depositoSeleccionado) return;

      await updateDepositoPorId(depositoSeleccionado.id_deposito, "Recibido");

      setDepositosPendientes((prevDepositos) =>
        prevDepositos.map((d) =>
          d.id_deposito === depositoSeleccionado.id_deposito
            ? { ...d, estado: "Recibido" }
            : d
        )
      );

      Swal.fire({
        title: "¡Éxito!",
        text: "Depósito confirmado como recibido",
        icon: "success",
        background: "#f8fafc",
        customClass: {
          title: "font-serif text-green-600"
        }
      });
      setDepositoSeleccionado(null);
    } catch (error) {
      console.error("Error al confirmar el depósito:", error);
      Swal.fire("Error", "Error al confirmar el depósito", "error");
    }
  };

  const handleVerComprobante = (url) => {
    setComprobanteModal(url);
  };

  const cerrarModal = () => {
    setComprobanteModal(null);
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      "Pendiente": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Recibido": "bg-green-100 text-green-800 border-green-200",
      "Rechazado": "bg-red-100 text-red-800 border-red-200"
    };
    
    const estilo = estados[estado] || "bg-gray-100 text-gray-800 border-gray-200";
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${estilo}`}>
        {estado}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-serif">
      {menuOpen && <Menu />}
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}>
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8 mt-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <i className="bx bx-credit-card text-4xl text-blue-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Gestión de Transferencias
                </h1>
                <p className="text-gray-600 mt-1">Confirma tus depósitos pendientes</p>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <section className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Transferencias Pendientes
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="bx bx-info-circle"></i>
                <span>{depositosPendientes.length} depósito(s) por confirmar</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Cargando depósitos...</span>
                </div>
              </div>
            ) : depositosPendientes.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-green-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <i className="bx bx-check-circle text-5xl text-green-500"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  ¡Todo al día!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  No hay depósitos pendientes por confirmar en este momento.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Información del Depósito
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {depositosPendientes.map((deposito) => (
                      <tr key={deposito.id_deposito} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Depósito #{deposito.id_deposito}
                            </p>
                            <p className="text-sm text-gray-500">
                              {deposito.fecha_deposito && new Date(deposito.fecha_deposito).toLocaleDateString()}
                            </p>
                            {deposito.monto && (
                              <p className="text-sm font-semibold text-blue-600">
                                ${parseFloat(deposito.monto).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getEstadoBadge(deposito.estado)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleConfirmarDeposito(deposito)}
                              disabled={deposito.estado === "Recibido"}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2"
                            >
                              <i className="bx bx-check"></i>
                              <span>Confirmar</span>
                            </button>
                            
                            {deposito.comprobante && (
                              <button
                                onClick={() => handleVerComprobante(`http://localhost:5000${deposito.comprobante}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2"
                              >
                                <i className="bx bx-image-alt"></i>
                                <span>Comprobante</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-auto p-6 bg-white border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>

      {/* Modal Comprobante */}
      {comprobanteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Comprobante de Pago</h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl"
                onClick={cerrarModal}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto">
              <img
                src={comprobanteModal}
                alt="Comprobante de pago"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTBBQyIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiPkNvbXByb2JhbnRlIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposito;