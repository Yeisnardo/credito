import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Swal from "sweetalert2";

import { getUsuarioPorCedula } from "../services/api_usuario";
import { getRequerimientos } from "../services/api_requerimientos";
import {
  createRequerimientoEmprendedor,
  getRequerimientoEmprendedor,
} from "../services/api_requerimiento_emprendedor";
import { createSolicitud } from "../services/api_solicitud"; // Corrige si el nombre es diferente

const RequireSolicit = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimientos, setRequerimientos] = useState([]);

  const [formData, setFormData] = useState({
    cedula_emprendedor: "",
    opt_requerimiento: [],
  });

  const [step, setStep] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [resultado, setResultado] = useState(null); // Para mostrar datos

  // Funciones para navegar
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);
  const handleMotivoChange = (e) => setMotivo(e.target.value);
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
              cedula_emprendedor: usuario.cedula_usuario || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
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
    const valNum = Number(value);
    if (type === "checkbox") {
      setFormData((prev) => {
        const newOpt = checked
          ? [...prev.opt_requerimiento, valNum]
          : prev.opt_requerimiento.filter((id) => id !== valNum);
        return { ...prev, opt_requerimiento: newOpt };
      });
    }
  };

  const enviarRequerimiento = async () => {
    try {
      // Primero, crea la solicitud
      const solicitudPayload = {
        cedula_emprendedor: formData.cedula_emprendedor,
        motivo,
        estatus: "Pendiente",
      };
      const solicitudResponse = await createSolicitud(solicitudPayload);
      const id_req = solicitudResponse.id_req; // Asegúrate que tu API devuelve esto

      // Luego, crea el requerimiento del emprendedor usando la misma cedula
      await createRequerimientoEmprendedor({
        cedula_emprendedor: formData.cedula_emprendedor,
        opt_requerimiento: formData.opt_requerimiento,
      });

      // Opcional: obtener el dato combinado para mostrar
      const datos = await getRequerimientoEmprendedor(id_req);
      setResultado(datos);

      Swal.fire(
        "¡Enviado!",
        "Requerimiento y solicitud enviados correctamente",
        "success"
      );
    } catch (error) {
      console.error("Error al enviar:", error);
      Swal.fire("¡Error!", "Hubo un error al enviar", "error");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviarRequerimiento();
  };

  // Función para volver a formulario
  const handleVolver = () => {
    setResultado(null);
    setMotivo("");
    setFormData({
      cedula_emprendedor: user?.cedula_usuario || "",
      opt_requerimiento: [],
    });
    setStep(1);
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

          {/* Aquí condicionalmente mostrar resultados o formulario */}
          {resultado ? (
            // Si hay resultados, mostrar los detalles
            <div className="mt-8 p-4 bg-white rounded shadow border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">
                Detalles del Requerimiento y Solicitud
              </h3>
              <p>
                <strong>ID Requerimiento:</strong> {resultado.id_req}
              </p>
              <p>
                <strong>Cédula Requerimiento:</strong>{" "}
                {resultado.cedula_emprendedor}
              </p>
              <p>
                <strong>Requisitos Seleccionados:</strong>{" "}
                {resultado.opt_requerimiento.join(", ")}
              </p>
              <p>
                <strong>Motivo:</strong> {motivo}
              </p>
              <p>
                <strong>Estado:</strong> {resultado.estatus}
              </p>
              {/* Botón para volver al formulario y hacer otra solicitud */}
              <button
                onClick={handleVolver}
                className="mt-4 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
              >
                Hacer otra solicitud
              </button>
            </div>
          ) : (
            // Si no hay resultados, mostrar formulario y mensaje
            <>
              {/* Mostrar el formulario solo si hay requerimientos */}
              {requerimientos.length > 0 ? (
                <section className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-200 mt-1 ease-in-out border-t-4 border-[#0F3C5B]">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-300 pb-2">
                    {step === 1
                      ? "Seleccione los Requisitos"
                      : "Motivo de Solicitud de Crédito"}
                  </h2>
                  <form
                    className="space-y-4"
                    onSubmit={
                      step === 2
                        ? handleSubmit
                        : (e) => {
                            e.preventDefault();
                            handleNext();
                          }
                    }
                  >
                    {step === 1 ? (
                      <>
                        <div>
                          <label
                            htmlFor="requerimientos"
                            className="block mb-2 text-gray-700 font-medium"
                          >
                            Por favor, indique los requisitos que posee.
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto rounded-xl p-4">
                            {requerimientos.map((req) => (
                              <div
                                key={req.id_requerimientos}
                                className="flex items-center mb-2" // Añadido flex y alineación
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
                        {/* Botón Siguiente */}
                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            onClick={handleNext}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300"
                          >
                            Siguiente
                          </button>
                        </div>
                      </>
                    ) : (
                      // Paso 2: Motivo
                      <>
                        <div>
                          <label
                            htmlFor="motivo"
                            className="block mb-2 text-gray-700 font-medium"
                          >
                            Motivo de solicitud de crédito
                          </label>
                          <textarea
                            id="motivo"
                            value={motivo}
                            onChange={handleMotivoChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={4}
                            placeholder="Escribe el motivo..."
                            required
                          />
                        </div>
                        {/* Botones */}
                        <div className="flex justify-between mt-4">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="bg-gray-400 hover:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300"
                          >
                            Anterior
                          </button>
                          <button
                            type="submit"
                            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300"
                          >
                            Enviar
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </section>
              ) : (
                <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <p className="text-gray-600 mb-4">
                    No hay requerimientos disponibles.
                  </p>
                </div>
              )}
            </>
          )}
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
