import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
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
      title: '¿Estás seguro?',
      text: "¿El depósito ya fue recibido?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setDepositos((prev) => prev.map((dep) =>
          dep.id === depositoId ? { ...dep, confirmado: true } : dep
        ));
        Swal.fire('¡Confirmado!', 'El depósito ha sido marcado como recibido.', 'success');
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
      {menuOpen && <Menu />}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}>
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Contenido principal */}
        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          {/* Encabezado */}
          <div className="flex items-center mb-8 mt-10">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg text-white flex items-center justify-center">
              <i className="bx bx-wallet text-3xl"></i>
            </div>
            <h1 className="ml-4 text-3xl font-semibold text-gray-700">Mis Depósitos</h1>
          </div>

          {/* Tarjeta de depósitos */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-200 text-gray-700">
              Depósitos Realizados
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 animate-spin"></div>
              </div>
            ) : depositos.length === 0 ? (
              <p className="text-gray-500 text-center">No tienes depósitos registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-md">
                  <thead className="bg-gray-50 rounded-t-lg">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200 rounded-tl-lg">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200 rounded-tr-lg">Confirmar</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 rounded-b-lg">
                    {depositos.map(dep => (
                      <tr key={dep.id} className="hover:bg-gray-50 transition duration-200">
                        <td className="px-4 py-3 text-gray-700 border-b">{dep.id}</td>
                        <td className="px-4 py-3 text-gray-700 border-b">${dep.monto}</td>
                        <td className="px-4 py-3 text-gray-700 border-b">{dep.fecha}</td>
                        <td className="px-4 py-3 border-b">
                          {dep.confirmado ? (
                            <span className="inline-block px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full shadow-sm">
                              Recibido
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 border border-yellow-200 rounded-full shadow-sm">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 border-b text-center">
                          {!dep.confirmado ? (
                            <button
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-full shadow-lg transition-transform transform hover:scale-105"
                              onClick={() => confirmarDeposito(dep.id)}
                            >
                              Recibido
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full shadow-sm transition-all hover:bg-green-200 hover:text-green-900">
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
        <footer className="mt-auto p-4 bg-gray-200 border-t border-gray-300 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Depositos;