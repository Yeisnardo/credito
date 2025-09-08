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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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

      Swal.fire({
        title: "¡Enviado!",
        text: "Requerimiento y solicitud enviados correctamente",
        icon: "success",
        confirmButtonColor: "#0F3C5B",
        background: "#f8fafc",
        customClass: {
          popup: 'rounded-xl shadow-2xl'
        }
      });
    } catch (error) {
      console.error("Error al enviar:", error);
      Swal.fire({
        title: "¡Error!",
        text: "Hubo un error al enviar",
        icon: "error",
        confirmButtonColor: "#dc2626",
        background: "#f8fafc",
        customClass: {
          popup: 'rounded-xl shadow-2xl'
        }
      });
    } finally {
      setLoading(false);
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 font-sans">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Main contenido */}
        <main className="flex-1 p-6">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-6 mt-8">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <i className="bx bx-file text-3xl text-white"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Solicitud de Crédito
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete los siguientes pasos para solicitar su crédito
                </p>
              </div>
            </div>
          </div>

          {/* Indicador de progreso */}
          {!resultado && (
            <div className="max-w-xl mx-auto mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-3 left-0 right-0 h-1.5 bg-gray-200 rounded-full -z-10"></div>
                <div 
                  className="absolute top-3 left-0 h-1.5 bg-blue-600 rounded-full -z-10 transition-all duration-500"
                  style={{ width: step === 1 ? '0%' : '50%' }}
                ></div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-2 border-blue-600'} font-semibold shadow-md`}>
                    1
                  </div>
                  <span className="text-sm mt-1 font-medium text-gray-700">Requerimientos</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-600 text-white' : step > 2 ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 border-2 border-gray-300'} font-semibold shadow-md`}>
                    2
                  </div>
                  <span className="text-sm mt-1 font-medium text-gray-700">Motivo</span>
                </div>
              </div>
            </div>
          )}

          {/* Si NO hay resultado, formulario */}
          {!resultado && requerimientos.length > 0 && (
            <section className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-4">
                {step === 1
                  ? "Seleccione los requerimientos que posee"
                  : "Motivo de Solicitud de Crédito"}
              </h2>
              <form
                className="space-y-6"
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
                        className="block mb-3 text-gray-700 font-medium text-lg"
                      >
                        Por favor, indique los requisitos que posee:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto rounded-xl p-4 bg-gray-50 border border-gray-200">
                        {requerimientos.map((req) => (
                          <div
                            key={req.id_requerimientos}
                            className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                          >
                            <label className="flex items-center cursor-pointer w-full">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  id={`requerimiento-${req.id_requerimientos}`}
                                  name="opt_requerimiento"
                                  value={req.id_requerimientos}
                                  checked={formData.opt_requerimiento.includes(
                                    req.id_requerimientos
                                  )}
                                  onChange={handleInputChange}
                                  className="sr-only"
                                />
                                <div className={`w-6 h-6 flex items-center justify-center rounded-md border-2 ${formData.opt_requerimiento.includes(req.id_requerimientos) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} transition-colors`}>
                                  {formData.opt_requerimiento.includes(req.id_requerimientos) && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className="ml-3 text-gray-700 font-medium">
                                {req.nombre_requerimiento}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.opt_requerimiento && (
                        <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-3 mt-2 transition-all">
                          <svg
                            className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-red-600 text-sm font-medium">
                            {errors.opt_requerimiento}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
                      >
                        Siguiente
                        <i className="bx bx-chevron-right ml-2 text-xl"></i>
                      </button>
                    </div>
                  </>
                ) : (
                  // Paso 2: Motivo
                  <>
                    <div>
                      <label
                        htmlFor="motivo"
                        className="block mb-3 text-gray-700 font-medium text-lg"
                      >
                        Motivo de solicitud de crédito
                      </label>
                      <textarea
                        id="motivo"
                        value={motivo}
                        onChange={handleMotivoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        rows={5}
                        placeholder="Describa detalladamente el motivo de su solicitud de crédito..."
                      />
                      {errors.motivo && (
                        <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-3 mt-2 transition-all">
                          <svg
                            className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-red-600 text-sm font-medium">
                            {errors.motivo}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 flex items-center"
                      >
                        <i className="bx bx-chevron-left mr-2 text-xl"></i>
                        Anterior
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-75 disabled:transform-none disabled:cursor-not-allowed flex items-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                          </>
                        ) : (
                          <>
                            Enviar Solicitud
                            <i className="bx bx-send ml-2 text-xl"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </section>
          )}

          {/* Mostrar resultados */}
          {resultado && (
            <div className="mt-8 max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-2xl mb-4">
                  <i className="bx bx-check-circle text-3xl"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  Solicitud Registrada Exitosamente
                </h3>
                <p className="text-gray-600">
                  Su solicitud ha sido procesada correctamente
                </p>
              </div>

              {Array.isArray(resultado) ? (
                resultado.length > 0 &&
                resultado.map((req, index) => (
                  <div
                    key={index}
                    className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200"
                  >
                    {/* Requerimientos */}
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                        <i className="bx bx-list-check mr-2 text-blue-600"></i>
                        Requerimientos seleccionados
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                        {requerimientos.map((r) => (
                          <div
                            key={r.id_requerimientos}
                            className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <div className={`w-5 h-5 flex items-center justify-center rounded-md border-2 ${req.opt_requerimiento?.includes(r.id_requerimientos) ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-300'} mr-3`}>
                              {req.opt_requerimiento?.includes(r.id_requerimientos) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-gray-700">
                              {r.nombre_requerimiento}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Información de la solicitud */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <div className="p-4">
                          <div className="flex items-center mb-2">
                            <i className="bx bx-edit text-blue-600 mr-2"></i>
                            <span className="font-semibold text-gray-700">Motivo:</span>
                          </div>
                          <p className="text-gray-600 pl-6">{req.motivo}</p>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center mb-2">
                            <i className="bx bx-stats text-blue-600 mr-2"></i>
                            <span className="font-semibold text-gray-700">Estado:</span>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${req.estatus === 'Aprobado' ? 'bg-green-100 text-green-800' : req.estatus === 'Rechazado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} ml-6`}>
                            {req.estatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Resultado único
                <div className="p-6 bg-gray-50 rounded-2xl shadow-sm border border-gray-200 mb-6">
                  {/* Detalles principales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200">
                      <div className="flex items-center mb-2">
                        <i className="bx bx-id-card text-blue-600 mr-2"></i>
                        <span className="font-semibold text-gray-700">ID:</span>
                      </div>
                      <p className="text-gray-600">{resultado.id_req}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200">
                      <div className="flex items-center mb-2">
                        <i className="bx bx-user text-blue-600 mr-2"></i>
                        <span className="font-semibold text-gray-700">Cédula:</span>
                      </div>
                      <p className="text-gray-600">{resultado.cedula_emprendedor}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200">
                      <div className="flex items-center mb-2">
                        <i className="bx bx-time-five text-blue-600 mr-2"></i>
                        <span className="font-semibold text-gray-700">Fecha:</span>
                      </div>
                      <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Información de la solicitud */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          <i className="bx bx-edit text-blue-600 mr-2"></i>
                          <span className="font-semibold text-gray-700">Motivo:</span>
                        </div>
                        <p className="text-gray-600 pl-6">{resultado.motivo}</p>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          <i className="bx bx-stats text-blue-600 mr-2"></i>
                          <span className="font-semibold text-gray-700">Estado:</span>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${resultado.estatus === 'Aprobado' ? 'bg-green-100 text-green-800' : resultado.estatus === 'Rechazado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} ml-6`}>
                          {resultado.estatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-center mt-8">
                <button
                  onClick={handleVolver}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 inline-flex items-center"
                >
                  <i className="bx bx-plus-circle mr-2"></i>
                  Nueva Solicitud
                </button>
              </div>
            </div>
          )}
        </main>
        {/* Pie de página */}
        <footer className="mt-auto p-6 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default RequireSolicit;