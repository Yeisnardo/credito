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
  const [user, setUser ] = useState(null);
  const [solicitudesCredito, setSolicitudesCredito] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUser (usuario);
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
        return "bg-red-200 text-red-800";
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
        className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}
      >
        <Header toggleMenu={toggleMenu} />

        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center mb-8 mt-10">
            <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
              <i className="bx bx-file text-3xl text-gray-700"></i>
            </div>
            <h1 className="ml-4 text-3xl font-semibold text-gray-800 tracking-wide">
              Mis Solicitudes
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 transition-shadow hover:shadow-xl">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-300 h-12 w-12 animate-spin"></div>
              </div>
            ) : solicitudesUsuario.length === 0 ? (
              <p className="text-gray-500 text-center">No tienes solicitudes registradas.</p>
            ) : (
              solicitudesUsuario.map((sol, index) => (
                <div key={sol.id || `${sol.cedula_solicitud}-${index}`} className="flex justify-between items-center bg-gray-50 rounded-lg p-4 mb-4 shadow-md border border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Solicitud #{index + 1}</h3>
                    <p className="text-gray-600">Cédula: {sol.cedula_solicitud}</p>
                    <p className="text-gray-600">Motivo: {sol.motivo || "Sin motivo"}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${estatusColor(sol.estatus)}`}>
                    {sol.estatus || "Pendiente"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-600 text-sm rounded-t-xl shadow-inner">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Solicitud;
