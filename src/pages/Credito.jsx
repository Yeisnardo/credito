import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiUsuario from "../services/api_usuario"; // Tu API

const Credito = ({ menuOpenProp, setUser: setUserInParent }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    comentario: "",
  });

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiUsuario.getUsuario();
        if (response && response.length > 0) {
          const usuario = response[0];
          setUserState(usuario);
          setUserInParent(usuario);
          setFormData(prevFormData => ({
            ...prevFormData,
            nombre: usuario.nombre_usuario || "", // Assuming the API returns 'nombre_usuario'
            apellido: usuario.apellido_usuario || "", // Assuming the API returns 'apellido_usuario'
            cedula: usuario.cedula_usuario || "" // Assuming the API returns 'cedula_usuario'
          }));
        }
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };
    if (!user) fetchUserData();
  }, [user, setUserInParent]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEnviar = () => {
    Swal.fire({
      icon: "success",
      title: "Solicitud enviada",
      text: "Su solicitud de crédito ha sido enviada exitosamente.",
    });
    // Aquí puedes agregar lógica para enviar el formulario a tu backend
  };

  const handleCancelar = () => {
    Swal.fire({
      icon: "warning",
      title: "Cancelar",
      text: "¿Está seguro que desea cancelar?",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData({ nombre: "", apellido: "", cedula: "", comentario: "" });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {/* Menú condicional */}
      {menuOpen && <Menu />}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Contenido principal con encabezado y formulario */}
        <div className="p-8 flex-1">
          {/* Encabezado con título y logo */}
          <header className="flex items-center justify-between mb-8 mt-10 p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-money-withdraw text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Solicitud de Credito
              </h1>
            </div>
          </header>

          {/* Formulario */}
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            {/* Título del formulario */}
            <h2 className="text-2xl font-bold mb-6 text-center">
              Motivo de Solicitud de Credito
            </h2>

            {/* Cédula */}
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700 flex items-center">
                <i className="bx bx-id-card mr-2"></i> Cédula de Identidad
              </label>
              <input
                type="text"
                name="cedula"
                value={user ? user.cedula_usuario : ""} // Use formData.cedula
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ingrese su cédula"
                readOnly // Make it read-only
              />
            </div>

            {/* Nombre */}
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700 flex items-center">
                <i className="bx bx-user mr-2"></i> Nombre del Solicitate
              </label>
              <input
                type="text"
                name="nombre"
                value={user ? user.nombre : ""} // Use formData.nombre
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ingrese su nombre"
                readOnly // Make it read-only
              />
            </div>

            {/* Comentario */}
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700 flex items-center">
                <i className="bx bx-message-rounded-detail mr-2"></i> Motivo
              </label>
              <textarea
                name="comentario"
                value={formData.comentario}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Agregue su comentario"
                rows={4}
              ></textarea>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleCancelar}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviar}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Credito;
