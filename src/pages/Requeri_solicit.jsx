import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from "../services/api_usuario";
import { getRequerimientos } from "../services/api_requerimientos";
import { createRequerimientoEmprendedor } from "../services/api_requerimiento_emprendedor";

const RequireSolicit = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimientos, setRequerimientos] = useState([]);

  const [formData, setFormData] = useState({
    cedula_requerimiento: "",
    opt_requerimiento: [],
  });

  // Función para alternar el menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Obtener usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            setFormData((prev) => ({
              ...prev,
              cedula_requerimiento: usuario.cedula_usuario || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario por cédula:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Obtener requerimientos
  useEffect(() => {
    const fetchRequerimientos = async () => {
      try {
        const data = await getRequerimientos();
        setRequerimientos(data);
      } catch (error) {
        console.error("Error al obtener requerimientos:", error);
      }
    };
    fetchRequerimientos();
  }, []);

  const handleInputChange = (e) => {
    const { value, type, checked } = e.target;
    const valueAsNumber = Number(value);

    if (type === "checkbox") {
      setFormData((prevData) => {
        const newOptRequerimiento = checked
          ? [...prevData.opt_requerimiento, valueAsNumber]
          : prevData.opt_requerimiento.filter((id) => id !== valueAsNumber);
        return {
          ...prevData,
          opt_requerimiento: newOptRequerimiento,
        };
      });
    }
  };

  const enviarRequerimiento = async () => {
    try {
      const payload = {
        cedula_requerimiento: formData.cedula_requerimiento,
        opt_requerimiento: formData.opt_requerimiento,
      };
      console.log("Enviando payload:", payload);
      await createRequerimientoEmprendedor(payload);
      alert("Requerimiento enviado correctamente");
    } catch (error) {
      console.error("Error enviando el requerimiento:", error);
      alert("Hubo un error al enviar");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviarRequerimiento();
  };

  return (
    <div className="flex min-h-screen bg-gray-300 font-serif">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-file text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Solicitud de Credito
              </h1>
            </div>
          </div>

          {/* Formulario */}
          <section className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-200 mt-1 ease-in-out border-t-4 border-[#0F3C5B]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-300 pb-2">
              Formulario de Documentación y Solicitud de Solicitud
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Cédula */}
              <div style={{ display: "none" }}>
                <label
                  htmlFor="cedula_requerimiento"
                  className="block mb-2 text-gray-700 font-medium"
                >
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  id="cedula_requerimiento"
                  name="cedula_requerimiento"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition hover:bg-gray-100"
                  placeholder="Ingresa tu cédula"
                  value={user?.cedula_usuario || ""}
                  readOnly
                  required
                />
              </div>

              {/* Requerimientos */}
              <div>
                <label
                  htmlFor="requerimientos"
                  className="block mb-2 text-gray-700 font-medium"
                >
                  Por favor, indique los requisitos que posee.
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50">
                  {requerimientos.map((req) => (
                    <div
                      key={req.id_requerimientos}
                      className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id={`requerimiento-${req.id_requerimientos}`}
                        name="opt_requerimiento"
                        value={req.id_requerimientos}
                        checked={formData.opt_requerimiento.includes(
                          req.id_requerimientos
                        )}
                        onChange={handleInputChange}
                        className="h-6 w-6 border-2 border-gray-300 rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                      />
                      <label
                        htmlFor={`requerimiento-${req.id_requerimientos}`}
                        className="ml-3 text-gray-700 font-medium"
                      >
                        {req.nombre_requerimiento}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón */}
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300"
                >
                  Enviar
                </button>
              </div>
            </form>
          </section>
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-100 border-t border-gray-300 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
};

export default RequireSolicit;
