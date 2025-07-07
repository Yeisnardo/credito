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
    <>
    {/* Google Material Icons CDN */}
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

    <div className="flex min-h-screen bg-gray-50 font-serif overflow-hidden">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col w-full transition-all duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}
      >
        <Header toggleMenu={toggleMenu} />

        {/* Main Content */}
        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg text-white flex items-center justify-center transition-transform hover:scale-105 hover:shadow-xl">
              <i className="material-icons text-3xl">account_circle</i>
            </div>
            <h1 className="ml-4 text-3xl md:text-4xl font-bold text-gray-800 tracking-wide">
              Mis Solicitudes
            </h1>
          </div>

          {/* Button to create new request */}
          <div className="mb-8 flex justify-end">
            <button
              onClick={handleSolicitud}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Crear nueva solicitud"
            >
              <i className="material-icons mr-2 text-xl">add_circle_outline</i>
              <span>Nueva Solicitud</span>
            </button>
          </div>

          {/* Formulario tipo reporte con diseño moderno */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-200 transition-shadow hover:shadow-2xl space-y-8">
            {solicitudesUsuario.length === 0 ? (
              <p className="text-gray-600 text-center text-lg">No hay solicitudes registradas.</p>
            ) : (
              solicitudesUsuario.map((sol, index) => (
                <div
                  key={sol.id || `${sol.cedula_solicitud}-${index}`}
                  className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-xl p-6 shadow-md border border-indigo-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Solicitud #{index + 1}
                    </h3>
                    <div className="text-gray-700 space-y-1">
                      <p className="text-sm md:text-base">
                        <span className="font-semibold">Cédula de Solicitud:</span>{" "}
                        {sol.cedula_solicitud}
                      </p>
                      <p className="text-sm md:text-base max-w-lg truncate cursor-pointer hover:text-indigo-900"
                        onClick={() => mostrarMotivo(sol.motivo)}
                        title={sol.motivo || "Sin motivo registrado"}
                        aria-label={`Ver motivo completo: ${sol.motivo || "Sin motivo registrado"}`}>
                        <span className="font-semibold">Motivo:</span>{" "}
                        {sol.motivo ? sol.motivo.length > 40 ? sol.motivo.slice(0, 40) + "..." : sol.motivo : "Sin motivo"}
                        <i className="material-icons align-middle ml-1 text-indigo-600" style={{ fontSize: "16px" }}>info</i>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-8 flex flex-col items-center">
                    <span
                      className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wide ${
                        sol.estatus?.toLowerCase() === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : sol.estatus?.toLowerCase() === "aprobado"
                          ? "bg-green-100 text-green-800"
                          : sol.estatus?.toLowerCase() === "rechazado"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      aria-label={`Estatus de la solicitud: ${sol.estatus || "Pendiente"}`}
                    >
                      {sol.estatus?.toLowerCase() === "pendiente" && (
                        <i className="material-icons mr-1 text-yellow-600" style={{ fontSize: "18px" }}>
                          schedule
                        </i>
                      )}
                      {sol.estatus?.toLowerCase() === "aprobado" && (
                        <i className="material-icons mr-1 text-green-600" style={{ fontSize: "18px" }}>
                          check_circle
                        </i>
                      )}
                      {sol.estatus?.toLowerCase() === "rechazado" && (
                        <i className="material-icons mr-1 text-red-600" style={{ fontSize: "18px" }}>
                          cancel
                        </i>
                      )}
                      {sol.estatus || "Pendiente"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto p-4 bg-gray-200 border-t border-gray-300 text-center text-gray-600 text-sm rounded-t-lg shadow-inner">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
    </>
  );
};

export default Solicitud;

