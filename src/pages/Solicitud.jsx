import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Solicitud = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser ] = useState({ id: 101, nombre: "Juan Pérez" });

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

  const handleSolicitud = () => {
    Swal.fire({
      title: 'Solicitud de Crédito',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.4; font-size: 19px;">
          <h3 style="text-align: center; margin-bottom: 15px;">Solicitud de Crédito</h3>
          <p style="margin: 4px 0 2px; font-weight: 900;">Cédula de Identidad:</p>
          <input id="cedula" class="swal2-input" placeholder="Ingrese su cédula" readonly value="${user.id}" style="width: 90%; margin-bottom: 8px; padding: 6px 8px; font-size: 14px;"/>
          
          <p style="margin: 4px 0 2px; font-weight: 600;">Nombre del Solicitante:</p>
          <input id="nombre" class="swal2-input" placeholder="Ingrese su nombre" readonly value="${user.nombre}" style="width: 90%; margin-bottom: 8px; padding: 6px 8px; font-size: 14px;"/>
          
          <p style="margin: 4px 0 2px; font-weight: 600;">Motivo:</p>
          <textarea id="comentario" class="swal2-textarea" placeholder="Agregue su comentario" style="width: 90%; height: 70px; font-size: 14px; padding: 6px 8px;"></textarea>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const comentario = Swal.getInput('comentario').value;
        if (!comentario) {
          Swal.showValidationMessage('Por favor ingrese un motivo');
        }
        return { comentario };
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const { comentario } = result.value;
        // Aquí puedes agregar la lógica para enviar la solicitud al backend
        Swal.fire({
          icon: 'success',
          title: 'Solicitud enviada',
          text: 'Su solicitud de crédito ha sido enviada exitosamente.',
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Menú lateral */}
      {menuOpen && <Menu />}

      {/* Contenedor principal con transición de margen */}
      <div className={`flex-1 flex flex-col w-full transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header con botón para toggle del menú */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          {/* Encabezado con icono y título */}
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg text-white flex items-center justify-center transition-transform hover:scale-105 hover:shadow-xl">
              <i className="bx bx-user-circle text-3xl"></i>
            </div>
            <h1 className="ml-4 text-4xl font-bold text-gray-800 tracking-wide">Mis Solicitudes</h1>
          </div>

          {/* Botón destacado para nueva solicitud */}
          <div className="mb-6">
            <button
              onClick={handleSolicitud}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition transform hover:scale-105"
            >
              <i className="bx bx-plus-circle mr-2"></i> Nueva Solicitud
            </button>
          </div>

          {/* Tarjeta con tabla de solicitudes */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transition-shadow hover:shadow-2xl">
            <h2 className="text-3xl font-semibold mb-6 border-b pb-3 border-gray-200 text-gray-800">Solicitudes de Crédito</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max table-auto border-collapse border-spacing-2 border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50 rounded-t-lg">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200">Motivo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudesCredito
                    .filter((s) => s.userId === user?.id)
                    .map((sol) => (
                      <tr key={sol.id} className="hover:bg-gray-50 transition duration-200 ease-in-out">
                        {/* ID */}
                        <td className="px-4 py-3 text-gray-700 font-medium">{sol.id}</td>

                        {/* Motivo y botón info */}
                        <td className="px-4 py-3 flex items-center space-x-3">
                          {sol.estatus !== 'Pendiente' ? (
                            <>
                              <span className="text-gray-600 max-w-xs truncate">{sol.motivo || 'Sin motivo'}</span>
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
                              onClick={() =>
                                Swal.fire({
                                  icon: 'warning',
                                  title: 'Pendiente',
                                  text: 'Aún no hay motivo registrado.',
                                })
                              }
                              className="text-gray-400 hover:text-gray-600 transition"
                              title="Motivo pendiente"
                            >
                              <i className="bx bx-info-circle text-xl"></i>
                            </button>
                          )}
                        </td>

                        {/* Estado con badges coloridas */}
                        <td className="px-4 py-3 text-center">
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

        {/* Pie de página elegante */}
        <footer className="mt-auto p-4 bg-gray-200 border-t border-gray-300 text-center text-gray-600 text-sm rounded-t-lg shadow-inner">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Solicitud;

