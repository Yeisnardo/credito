import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { createSolicitud, getSolicitudes } from "../services/api_solicitud";
import { getUsuarioPorCedula } from "../services/api_usuario";

const Solicitud = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [solicitudesCredito, setSolicitudesCredito] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUser(usuario);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        const data = await getSolicitudes();
        setSolicitudesCredito(data);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las solicitudes. Intente nuevamente.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, [user]);

  const mostrarMotivo = (motivo) => {
    Swal.fire({
      icon: "info",
      title: "Motivo",
      text: motivo || "No hay motivo registrado.",
      confirmButtonText: "Cerrar",
    });
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSolicitud = () => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Usuario no identificado",
        text: "Por favor, inicie sesión o recargue la página.",
      });
      return;
    }
    Swal.fire({
      title: "Solicitud de Crédito",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4; font-size: 19px;">
        <h3 style="text-align: center; margin-bottom: 15px;">Solicitud de Crédito</h3>
        <p style="margin: 4px 0 2px; font-weight: 900;">Cédula:</p>
        <input id="cedula" class="swal2-input" placeholder="Ingrese su cédula" value="${user.cedula_usuario || ''}" style="width: 90%; margin-bottom: 8px; padding: 6px 8px; font-size: 14px;" />
        
        <p style="margin: 4px 0 2px; font-weight: 600;">Nombre del Solicitante:</p>
        <input id="nombre" class="swal2-input" placeholder="Ingrese su nombre" readonly value="${user.nombre || ''}" style="width: 90%; margin-bottom: 8px; padding: 6px 8px; font-size: 14px;" />
        
        <p style="margin: 4px 0 2px; font-weight: 600;">Motivo:</p>
        <textarea id="motivo" class="swal2-textarea" placeholder="Agregue su comentario" style="width: 90%; height: 70px; font-size: 14px; padding: 6px 8px;"></textarea>
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const motivoInput = Swal.getPopup().querySelector("#motivo").value.trim();
        const cedulaInput = Swal.getPopup().querySelector("#cedula").value.trim();
        if (!motivoInput || !cedulaInput) {
          Swal.showValidationMessage("La cédula y el motivo son obligatorios");
        }
        return { motivo: motivoInput, cedula_solicitud: cedulaInput };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { motivo, cedula_solicitud } = result.value;
        try {
          const nuevaSolicitud = {
            cedula_solicitud: cedula_solicitud,
            motivo: motivo,
            estatus: "Pendiente",
          };
          await createSolicitud(nuevaSolicitud);
          Swal.fire({
            icon: "success",
            title: "Solicitud enviada",
            text: "Su solicitud de crédito ha sido enviada exitosamente.",
          });
          setSolicitudesCredito((prev) => [
            ...prev,
            { ...nuevaSolicitud, id: prev.length + 1 },
          ]);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al enviar su solicitud. Intente nuevamente.",
          });
        }
      }
    });
  };

  const solicitudesUsuario = solicitudesCredito.filter(
    (s) => s.cedula_solicitud === user?.cedula_usuario
  );

  const estatusColor = (estatus) => {
    switch (estatus?.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "aprobado":
        return "bg-green-100 text-green-800";
      case "rechazado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans overflow-hidden">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col w-full transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />
        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg text-white flex items-center justify-center transition-transform hover:scale-105 hover:shadow-xl">
              <i className="bx bx-user-circle text-3xl"></i>
            </div>
            <h1 className="ml-4 text-4xl font-bold text-gray-800 tracking-wide">
              Mis Solicitudes
            </h1>
          </div>
          <div className="mb-6">
            <button
              onClick={handleSolicitud}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition transform hover:scale-105"
              aria-label="Crear nueva solicitud"
            >
              <i className="bx bx-plus-circle mr-2"></i> Nueva Solicitud
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transition-shadow hover:shadow-2xl border border-gray-200">
            <h2 className="text-3xl font-semibold mb-6 border-b pb-3 border-gray-200 text-gray-800">
              Solicitudes de Crédito
            </h2>
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-300 shadow-sm">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide select-none"
                    >
                      Cédula de Solicitud
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide select-none"
                    >
                      Motivo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide select-none"
                    >
                      Estatus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {solicitudesUsuario.map((sol, index) => (
                    <tr
                      key={sol.id || sol.cedula_solicitud + sol.motivo + index}
                      className={`transition-colors duration-300 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-indigo-50 cursor-pointer`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium border-r border-gray-200">
                        {sol.cedula_solicitud}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-600 flex items-center space-x-3 border-r border-gray-200">
                        <span>{sol.motivo || "Sin motivo"}</span>
                        <button
                          onClick={() => mostrarMotivo(sol.motivo)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                          title="Ver motivo"
                          aria-label={`Ver motivo: ${sol.motivo}`}
                        >
                          <i className="bx bx-info-circle text-xl"></i>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${estatusColor(
                            sol.estatus
                          )}`}
                        >
                          {sol.estatus || "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <footer className="mt-auto p-4 bg-gray-200 border-t border-gray-300 text-center text-gray-600 text-sm rounded-t-lg shadow-inner">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Solicitud;

