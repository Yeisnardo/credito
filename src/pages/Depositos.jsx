import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Depositos = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [depositos, setDepositos] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Datos ficticios
  const usuarioFicticio = { id: 1, nombre: "Juan Pérez" };
  const depositosFicticios = [
    { id: 101, monto: 1500, fecha: "2023-10-01", confirmado: false },
    { id: 102, monto: 2500, fecha: "2023-10-05", confirmado: false },
    { id: 103, monto: 3000, fecha: "2023-10-10", confirmado: true },
  ];

  useEffect(() => {
    setUser(usuarioFicticio);
    setTimeout(() => {
      setDepositos(depositosFicticios);
      setLoading(false);
    }, 500);
  }, []);

  const confirmarDeposito = (depositoId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿El depósito ya fue recibido?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1F2937", // color gris oscuro
      cancelButtonColor: "#D1D5DB", // gris claro
      confirmButtonText: "Sí, confirmar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setDepositos((prev) =>
          prev.map((dep) =>
            dep.id === depositoId ? { ...dep, confirmado: true } : dep
          )
        );
        Swal.fire(
          "¡Confirmado!",
          "El depósito ha sido marcado como recibido.",
          "success"
        );
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans overflow-hidden">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Contenido principal */}
        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          {/* Encabezado */}
          <div className="flex items-center mb-8 mt-10">
            <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
              <i className="bx bx-wallet text-3xl text-gray-700"></i>
            </div>
            <h1 className="ml-4 text-3xl font-semibold text-gray-800 tracking-wide">
              Mis Depósitos
            </h1>
          </div>

          {/* Tarjeta con lista de depósitos */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 transition-shadow hover:shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 text-gray-700">
              Depósitos Registrados
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-300 h-12 w-12 animate-spin"></div>
              </div>
            ) : depositos.length === 0 ? (
              <p className="text-gray-500 text-center">No tienes depósitos registrados.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl shadow-md bg-gray-50">
                <table className="min-w-full divide-y divide-gray-300 rounded-xl overflow-hidden">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tl-xl">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-xl">
                        Confirmar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {depositos.map((dep) => (
                      <tr
                        key={dep.id}
                        className="hover:bg-gray-50 transition-all duration-200 rounded-lg"
                      >
                        <td className="px-4 py-3 text-gray-700">{dep.id}</td>
                        <td className="px-4 py-3 text-gray-700 font-semibold">
                          ${dep.monto}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{dep.fecha}</td>
                        <td className="px-4 py-3">
                          {dep.confirmado ? (
                            <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full shadow-inner border border-green-200 transition hover:bg-green-200 hover:text-green-900">
                              Recibido
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full shadow-inner border border-red-300 transition hover:bg-red-200 hover:text-red-900">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!dep.confirmado ? (
                            <button
                              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-full shadow-md transform hover:scale-105 transition duration-300"
                              onClick={() => confirmarDeposito(dep.id)}
                            >
                              Recibido
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded-full shadow-inner transition hover:bg-gray-300">
                              Confirmado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-600 text-sm rounded-t-xl shadow-inner">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Depositos;