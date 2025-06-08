import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Solicitud = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState({ id: 101, nombre: "Juan Pérez" });

  const [solicitudesCredito, setSolicitudesCredito] = useState([
    { id: 1, userId: 101, nombre: "Juan Pérez", motivo: "", estatus: "En revisión" },
    { id: 2, userId: 102, nombre: "Maria Lopez", motivo: "", estatus: "En revisión" },
    { id: 3, userId: 101, nombre: "Juan Pérez", motivo: "Cumple requisitos", estatus: "Aprobado" },
    { id: 4, userId: 103, nombre: "Luis Gómez", motivo: "Falta documentación", estatus: "Rechazado" },
  ]);
  
  const mostrarMotivo = (motivo) => {
    Swal.fire({
      icon: 'info',
      title: 'Motivo',
      text: motivo || 'No hay motivo registrado.',
      confirmButtonText: 'Cerrar',
    });
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans overflow-hidden">
      {menuOpen && <Menu />}
      <div className={`flex-1 flex flex-col w-full transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        <Header user={user} toggleMenu={toggleMenu} menuOpen={menuOpen} />

        {/* Contenido principal */}
        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          {/* Encabezado */}
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg text-white flex items-center justify-center">
              <i className="bx bx-user-circle text-3xl"></i>
            </div>
            <h1 className="ml-4 text-3xl font-semibold text-gray-700">Mis Solicitudes</h1>
          </div>

          {/* Tarjeta de la tabla */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-200 text-gray-700">
              Solicitudes de Crédito
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudesCredito
                    .filter((s) => s.userId === user?.id)
                    .map((sol) => (
                      <tr key={sol.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-700">{sol.id}</td>
                        <td className="px-4 py-3 flex items-center space-x-2">
                          {sol.estatus !== "Pendiente" ? (
                            <>
                              <span className="text-gray-600">{sol.motivo || "Sin motivo"}</span>
                              <button
                                onClick={() => mostrarMotivo(sol.motivo)}
                                className="text-blue-500 hover:text-blue-700 transition"
                                title="Ver motivo"
                              >
                                <i className="bx bx-info-circle text-xl"></i>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => Swal.fire({ icon: 'warning', title: 'Pendiente', text: 'Aún no hay motivo registrado.' })}
                              className="text-gray-400 hover:text-gray-600 transition"
                              title="Motivo pendiente"
                            >
                              <i className="bx bx-info-circle text-xl"></i>
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 capitalize text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              sol.estatus === 'Aprobado'
                                ? 'bg-green-100 text-green-700'
                                : sol.estatus === 'Rechazado'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {sol.estatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
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

export default Solicitud;