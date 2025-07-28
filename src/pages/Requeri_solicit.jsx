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
import {
  createSolicitud,
  getSolicitudPorCedula,
} from "../services/api_solicitud";

const RequireSolicit = ({ setUser }) => {
  const navigate = useNavigate();

  // Estados
  const [solicitud, setSolicitud] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimientos, setRequerimientos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [formData, setFormData] = useState({
    cedula_emprendedor: "",
    motivo: "",
    opt_requerimiento: [],
  });
  const [step, setStep] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState({}); // Para validaciones

  // Limpia errores al seleccionar requerimientos
  useEffect(() => {
    if (formData.opt_requerimiento.length > 0 && errors.opt_requerimiento) {
      setErrors((prev) => ({ ...prev, opt_requerimiento: "" }));
    }
  }, [formData.opt_requerimiento, errors]);

  // Obtener datos del usuario
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

  // Verificar registros existentes por cédula
  useEffect(() => {
    const verificarRegistrosExistentes = async () => {
      if (user?.cedula_usuario) {
        try {
          const datosExistentes = await getRequerimientoEmprendedor(
            user.cedula_usuario
          );
          if (
            datosExistentes &&
            ((Array.isArray(datosExistentes) && datosExistentes.length > 0) ||
              (!Array.isArray(datosExistentes) &&
                Object.keys(datosExistentes).length > 0))
          ) {
            setResultado(datosExistentes);
            const solicitudData = await getSolicitudPorCedula(
              user.cedula_usuario
            );
            setSolicitud(solicitudData);
          }
        } catch (error) {
          console.error("Error verificando registros existentes:", error);
        }
      }
    };
    if (!resultado) verificarRegistrosExistentes();
  }, [user, resultado]);

  // Funciones para manejar pasos del formulario
  const handleNext = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    if (step === 1) {
      if (formData.opt_requerimiento.length === 0) {
        newErrors.opt_requerimiento =
          "Debe seleccionar al menos un requerimiento.";
      }
    }
    if (step === 2) {
      if (!motivo.trim()) {
        newErrors.motivo = "El campo motivo no puede estar vacío.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en requerimientos
  const handleInputChange = (e) => {
    const { value, type, checked } = e.target;
    const valNum = Number(value);
    setFormData((prev) => {
      let newOpt;
      if (type === "checkbox") {
        newOpt = checked
          ? [...prev.opt_requerimiento, valNum]
          : prev.opt_requerimiento.filter((id) => id !== valNum);
      } else {
        newOpt = prev.opt_requerimiento;
      }
      if (newOpt.length > 0 && errors.opt_requerimiento) {
        setErrors((prevErrors) => ({ ...prevErrors, opt_requerimiento: "" }));
      }
      return { ...prev, opt_requerimiento: newOpt };
    });
  };

  const handleMotivoChange = (e) => {
    const value = e.target.value;
    setMotivo(value);
    setFormData((prev) => ({ ...prev, motivo: value }));
  };

  // Enviar requerimiento y solicitud
  const enviarRequerimiento = async () => {
    try {
      // Crear solicitud
      const solicitudPayload = {
        cedula_emprendedor: formData.cedula_emprendedor,
        motivo: formData.motivo,
        estatus: "Pendiente",
      };
      const solicitudResponse = await createSolicitud(solicitudPayload);
      const id_req = solicitudResponse.id_req;

      // Crear requerimiento_emprendedor
      await createRequerimientoEmprendedor({
        cedula_emprendedor: formData.cedula_emprendedor,
        opt_requerimiento: formData.opt_requerimiento,
      });

      // Actualizar resultado
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
    if (validateForm()) {
      enviarRequerimiento();
    }
  };

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
        {/* Header */}
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Main contenido */}
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

          {/* Si NO hay resultado, formulario */}
          {!resultado && requerimientos.length > 0 && (
            <section className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-200 mt-1 border-t-4 border-[#0F3C5B]">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-300 pb-2">
                {step === 1
                  ? "Seleccione los requerimientos que posee"
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
                            className="flex items-center mb-2"
                          >
                            <label
                              htmlFor={`requerimiento-${req.id_requerimientos}`}
                              className="ml-3 text-gray-700 font-medium"
                            >
                              {req.nombre_requerimiento}
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.opt_requerimiento && (
                        <div className="flex items-center bg-red-50 border border-red-200 rounded-lg p-2 mt-1 transition-transform transform hover:scale-105">
                          {/* Icono advertencia */}
                          <svg
                            className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v2m0 4h.01M12 3a9 9 0 00-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 00-9-9z"
                            />
                          </svg>
                          <p className="text-red-600 text-sm font-medium">
                            {errors.opt_requerimiento}
                          </p>
                        </div>
                      )}
                    </div>
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
                      />
                      {errors.motivo && (
                        <div className="flex items-center bg-red-50 border border-red-200 rounded-lg p-2 mt-1 transition-transform transform hover:scale-105">
                          {/* Icono advertencia */}
                          <svg
                            className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v2m0 4h.01M12 3a9 9 0 00-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 00-9-9z"
                            />
                          </svg>
                          <p className="text-red-600 text-sm font-medium">
                            {errors.motivo}
                          </p>
                        </div>
                      )}
                    </div>
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
          )}

          {/* Mostrar resultados */}
          {resultado && (
            <div className="mt-8 max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-3xl font-semibold mb-8 text-center text-gray-800">
                Detalles de Requerimientos y Solicitudes
              </h3>

              {Array.isArray(resultado) ? (
                resultado.length > 0 &&
                resultado.map((req, index) => (
                  <div
                    key={index}
                    className="mb-10 p-6 bg-gray-50 rounded-xl shadow-md border border-gray-200"
                  >
                    {/* Requerimientos */}
                    <div className="mb-6">
                      {/* Oculto pero accesible para SEO */}
                      <p
                        className="mb-2 text-sm text-gray-500"
                        style={{ display: "none" }}
                      >
                        <span className="font-semibold text-gray-700">
                          Requerimientos:
                        </span>{" "}
                        {Array.isArray(req.opt_requerimiento)
                          ? req.opt_requerimiento.join(", ")
                          : ""}
                      </p>
                      {/* Lista visual */}
                      <h4 className="text-xl font-semibold mb-3 text-gray-700">
                        Requerimientos seleccionados
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-4 bg-white rounded-xl shadow-md border border-gray-300">
                        {requerimientos.map((r) => (
                          <div
                            key={r.id_requerimientos}
                            className="flex items-center p-2 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={req.opt_requerimiento?.includes(
                                  r.id_requerimientos
                                )}
                                readOnly
                                className="peer hidden"
                              />
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={req.opt_requerimiento?.includes(
                                    r.id_requerimientos
                                  )}
                                  readOnly
                                  className="peer sr-only"
                                />
                                <div className="w-11 h-6 bg-red-700 rounded-full peer-focus:outline-none peer-checked:bg-blue-700 transition-colors duration-200 relative">
                                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 peer-checked:translate-x-10"></div>
                                </div>
                              </label>
                              {/* Opcional: Agregar un efecto visual en hover o cuando esté checked */}
                            </div>
                            <label className="ml-3 text-gray-700 font-medium hover:text-blue-600 transition-colors cursor-pointer">
                              {r.nombre_requerimiento}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tabla Motivo y Estado */}
                    <div className="overflow-x-auto mt-6">
                      <table className="w-full min-w-max border border-gray-300 rounded-xl shadow-sm bg-white">
                        <thead className="bg-gray-100 rounded-t-xl">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-xl">
                              Motivo
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 rounded-tr-xl">
                              Estado
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="border border-gray-300 px-4 py-3">
                              {req.motivo}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800">
                              {req.estatus}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                // Resultado único
                <div className="p-6 bg-gray-50 rounded-xl shadow-md border border-gray-200 mb-8 transition-transform hover:scale-105">
                  {/* Detalles principales */}
                  <div className="mb-4">
                    <p className="mb-2 text-gray-600">
                      <span className="font-semibold text-gray-700">ID:</span>{" "}
                      {resultado.id_req}
                    </p>
                    <p className="mb-2 text-gray-600">
                      <span className="font-semibold text-gray-700">
                        Cédula:
                      </span>{" "}
                      {resultado.cedula_emprendedor}
                    </p>
                    <p className="mb-2 text-gray-600">
                      <span className="font-semibold text-gray-700">
                        Requerimientos:
                      </span>{" "}
                      {Array.isArray(resultado.opt_requerimiento)
                        ? resultado.opt_requerimiento.join(", ")
                        : ""}
                    </p>
                  </div>

                  {/* Tabla Motivo y Estado */}
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full min-w-max border border-gray-300 rounded-xl shadow-sm bg-white">
                      <thead className="bg-gray-100 rounded-t-xl">
                        <tr>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-xl">
                            Motivo
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 rounded-tr-xl">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="border border-gray-300 px-4 py-3">
                            {resultado.motivo}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800">
                            {resultado.estatus}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
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
