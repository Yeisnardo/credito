import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Solicitud = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);

  // Usuario en sesión (ajustado para ejemplo)
  const [user, setUser ] = useState({ id: 101, nombre: "Juan Pérez" });

  // Datos ficticios de solicitudes de crédito
  const [solicitudesCredito, setSolicitudesCredito] = useState([
    { id: 1, userId: 101, nombre: "Juan Pérez", estado: "Pendiente", motivo: "", estatus: "En revisión" },
    { id: 2, userId: 102, nombre: "Maria Lopez", estado: "Pendiente", motivo: "", estatus: "En revisión" },
    { id: 3, userId: 101, nombre: "Juan Pérez", estado: "Aprobado", motivo: "Cumple requisitos", estatus: "Aprobado" },
    { id: 4, userId: 103, nombre: "Luis Gómez", estado: "Rechazado", motivo: "Falta documentación", estatus: "Rechazado" },
  ]);

  // Funciones para aprobar/rechazar solicitudes
  const aprobarSolicitud = (id) => {
    setSolicitudesCredito((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "Aprobado", estatus: "Aprobado" } : s))
    );
  };

  const rechazarSolicitud = (id) => {
    setSolicitudesCredito((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "Rechazado", estatus: "Rechazado" } : s))
    );
  };

  // Función para mostrar motivo en Swal
  const mostrarMotivo = (motivo) => {
    Swal.fire({
      icon: 'info',
      title: 'Motivo',
      text: motivo || 'No hay motivo registrado.',
      confirmButtonText: 'Cerrar'
    });
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header user={user} toggleMenu={toggleMenu} menuOpen={menuOpen} />

        {/* Contenido principal */}
        <div className="pt-20 px-8">
          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-home text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Inicio</h1>
            </div>
          </header>

          {/* Listado de solicitudes del usuario */}
          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mis Solicitudes de Crédito</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">ID</th>
                    <th className="px-4 py-2 border-b">Estado</th>
                    <th className="px-4 py-2 border-b">Motivo</th>
                    <th className="px-4 py-2 border-b">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesCredito
                    .filter((s) => s.userId === user?.id) // Solo las del usuario en sesión
                    .map((sol) => (
                      <tr key={sol.id} className="hover:bg-gray-100">
                        <td className="px-4 py-2 border-b">{sol.id}</td>
                        <td className="px-4 py-2 border-b">{sol.estado}</td>
                        <td className="px-4 py-2 border-b flex items-center space-x-2">
                          {sol.estado !== "Pendiente" ? (
                            <>
                              <span className="text-gray-600">{sol.motivo || 'Sin motivo'}</span>
                              <button
                                onClick={() => mostrarMotivo(sol.motivo)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Ver motivo"
                              >
                                <i className="bx bx-info-circle text-xl"></i>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                Swal.fire({ icon: 'warning', title: 'Pendiente', text: 'Aún no hay motivo registrado.' })
                              }
                              className="text-gray-400 hover:text-gray-600"
                              title="Motivo pendiente"
                            >
                              <i className="bx bx-info-circle text-xl"></i>
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2 border-b">{sol.estatus}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
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

export default Solicitud;
