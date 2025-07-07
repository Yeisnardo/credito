import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_requerimiento";
import { createSolicitud, getSolicitudes } from "../services/api_solicitud";
import { getUsuarioPorCedula } from "../services/api_usuario";

const CombinedComponent = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [solicitudesCredito, setSolicitudesCredito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cedula_emprendimiento, setCedula_emprendimiento] = useState("");
  const [fecha, setFecha] = useState(""); // yyyy-mm-dd
  const [motivo, setMotivo] = useState(""); // Motivo
  const [preguntas, setPreguntas] = useState([
    {
      id: 0,
      texto: "Carta de Motivo para Solicitar Crédito",
      respuesta: false,
    },
    { id: 1, texto: "Postulación UBCH", respuesta: false },
    { id: 2, texto: "Certificado de emprender juntos", respuesta: false },
    { id: 3, texto: "Registro Municipal", respuesta: false },
    { id: 4, texto: "Carta de residencia", respuesta: false },
    { id: 5, texto: "Copia de cédula", respuesta: false },
    { id: 6, texto: "RIF personal", respuesta: false },
    { id: 7, texto: "Fotos del emprendimiento", respuesta: false },
    { id: 8, texto: "RIF de emprendimiento", respuesta: false },
    { id: 9, texto: "Referencia bancaria", respuesta: false },
  ]);
  const [resultados, setResultados] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Requerimientos, 2: Motivo, 3: Confirmación
  const [isUpdating, setIsUpdating] = useState(false); // Estado para manejar la actualización

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUser(usuario);
            setCedula_emprendimiento(usuario.cedula_usuario);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch solicitudes y requerimientos
  useEffect(() => {
    if (!user || !cedula_emprendimiento) return;

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

    const fetchRequerimientos = async () => {
      try {
        const existing = await api.getRequerimiento(cedula_emprendimiento);
        if (existing && Object.keys(existing).length > 0) {
          setResultados(existing);
          setMostrarResultados(true);
          setIsUpdating(true);
          setFecha(existing.fecha || "");
          setMotivo(existing.motivo || "");
          setPreguntas((prevPreguntas) =>
            prevPreguntas.map((pregunta) => ({
              ...pregunta,
              respuesta:
                existing[pregunta.texto.replace(/ /g, "_").toLowerCase()] ===
                "si",
            }))
          );
        } else {
          setResultados(null);
          setMostrarResultados(false);
          setPreguntas((prevPreguntas) =>
            prevPreguntas.map((pregunta) => ({
              ...pregunta,
              respuesta: false,
            }))
          );
          setIsUpdating(false);
        }
      } catch (error) {
        console.error("Error al obtener requerimientos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los requerimientos. Intente nuevamente.",
        });
      }
    };

    // Call the fetch functions
    fetchSolicitudes();
    fetchRequerimientos();
  }, [user, cedula_emprendimiento]);

  // Función para mostrar los resultados (esto lo puedes usar en tu UI)
  const getResultadosBooleanos = () => {
    if (!resultados) return {};
    return {
      copia_cedula: resultados.copia_cedula,
      carta_solicitud: resultados.carta_solicitud,
      postulacion_UBCH: resultados.postulacion_UBCH,
      certificado_emprender: resultados.certificado_emprender,
      registro_municipal: resultados.registro_municipal,
      carta_residencia: resultados.carta_residencia,
      rif_personal: resultados.rif_personal,
      fotos_emprendimiento: resultados.fotos_emprendimiento,
      rif_emprendimiento: resultados.rif_emprendimiento,
      referencia_bancaria: resultados.referencia_bancaria,
    };
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    if (
      !cedula_emprendimiento ||
      cedula_emprendimiento.length < 6 ||
      cedula_emprendimiento.length > 8
    ) {
      alert("La cédula debe tener entre 6 y 8 dígitos numéricos");
      return;
    }
    if (!fecha) {
      alert("Por favor, selecciona la fecha");
      return;
    }
    if (!motivo.trim()) {
      alert("Por favor, ingrese el motivo de la solicitud");
      return;
    }

    const requerimientoData = {
      cedula_requerimiento: cedula_emprendimiento,
      fecha: fecha,
      motivo: motivo,
      copia_cedula: resultados.copia_cedula,
      carta_solicitud: resultados.carta_solicitud,
      postulacion_UBCH: resultados.postulacion_UBCH,
      certificado_emprender: resultados.certificado_emprender,
      registro_municipal: resultados.registro_municipal,
      carta_residencia: resultados.carta_residencia,
      rif_personal: resultados.rif_personal,
      fotos_emprendimiento: resultados.fotos_emprendimiento,
      rif_emprendimiento: resultados.rif_emprendimiento,
      referencia_bancaria: resultados.referencia_bancaria,
    };

    try {
      if (isUpdating) {
        await api.updateRequerimiento(cedula_emprendimiento, requerimientoData);
      } else {
        await api.createRequerimiento(requerimientoData);
      }

      const nuevaSolicitud = {
        cedula_solicitud: cedula_emprendimiento,
        motivo: motivo,
        estatus: "Pendiente",
      };
      await createSolicitud(nuevaSolicitud);

      Swal.fire({
        icon: "success",
        title: "Solicitud Enviada",
        text: "Su solicitud ha sido enviada correctamente.",
      });
      handleNewRequest();
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al guardar los datos. Intente nuevamente.",
      });
    }
  };

  // Función para actualizar requisitos
  const handleUpdateRequirements = () => {
    const requirementsForm = `
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        ${preguntas
          .map(
            (pregunta) => `
          <div style="margin-bottom: 10px;">
            <input 
              type="checkbox" 
              id="req-${pregunta.id}" 
              ${pregunta.respuesta ? "checked" : ""}
              style="margin-right: 10px;"
            >
            <label for="req-${pregunta.id}">${pregunta.texto}</label>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    Swal.fire({
      title: "Actualizar Requerimientos",
      html: requirementsForm,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar actualización",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const updatedPreguntas = [...preguntas].map((pregunta, index) => ({
          ...pregunta,
          respuesta: checkboxes[index].checked,
        }));
        return updatedPreguntas;
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const updatedPreguntas = result.value;
          const requerimientoData = {
            cedula_requerimiento: cedula_emprendimiento,
            fecha: fecha,
            motivo: motivo,
            copia_cedula: resultados.copia_cedula,
            carta_solicitud: resultados.carta_solicitud,
            postulacion_UBCH: resultados.postulacion_UBCH,
            certificado_emprender: resultados.certificado_emprender,
            registro_municipal: resultados.registro_municipal,
            carta_residencia: resultados.carta_residencia,
            rif_personal: resultados.rif_personal,
            fotos_emprendimiento: resultados.fotos_emprendimiento,
            rif_emprendimiento: resultados.rif_emprendimiento,
            referencia_bancaria: resultados.referencia_bancaria,
          };
          await api.updateRequerimiento(
            cedula_emprendimiento,
            requerimientoData
          );
          setPreguntas(updatedPreguntas);
          Swal.fire(
            "Actualizado!",
            "Los requerimientos han sido actualizados correctamente.",
            "success"
          );
        } catch (error) {
          console.error("Error al actualizar:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ocurrió un error al actualizar. Intente nuevamente.",
          });
        }
      }
    });
  };

  // Función para manejar cambio en los checkboxes
  const handleCheckboxChange = (id) => {
    setPreguntas((prevPreguntas) =>
      prevPreguntas.map((p) =>
        p.id === id ? { ...p, respuesta: !p.respuesta } : p
      )
    );
  };

  // Navegación entre pasos
  const handlePreviousStep = () => setCurrentStep(currentStep - 1);
  const handleNextStep = () => setCurrentStep(currentStep + 1);

  // Reiniciar formulario para nueva solicitud
  const handleNewRequest = () => {
    setMotivo("");
    setFecha("");
    setPreguntas(preguntas.map((p) => ({ ...p, respuesta: false })));
    setCurrentStep(1);
    setMostrarResultados(false);
    setIsUpdating(false);
  };

  // Aquí puedes renderizar tu componente y usar getResultadosBooleanos() para mostrar los datos en forma booleana
  const resultadosBooleanos = getResultadosBooleanos();

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <header className="flex items-center justify-between mb-4 mt-9 px-6">
          <div className="flex items-center justify-between mb-8 mt-10">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
                <i className="bx bx-home text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Solicitud de Crédito
              </h1>
            </div>
          </div>
        </header>

        <section>
          <div className="max-w-4xl mx-auto px-4">
            {mostrarResultados ? (
              <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
                <h2 className="text-2xl font-bold mb-6">
                  Resultados de Solicitud
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Cédula
                    </h3>
                    <p className="text-lg font-semibold">
                      {resultados.cedula_requerimiento}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Fecha
                    </h3>
                    <p className="text-lg font-semibold">{resultados.fecha}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Motivo
                    </h3>
                    <p className="text-lg font-semibold">
                      {resultados.motivo || "No especificado"}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold">Documentos Requeridos</h3>
                <div className="space-y-4">
                  {preguntas.map((pregunta) => (
                    <div className="flex items-center mb-2" key={pregunta.id}>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          pregunta.respuesta
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {pregunta.respuesta ? (
                          <span
                            role="img"
                            aria-label="check"
                            className="text-lg"
                          >
                            ✔️
                          </span>
                        ) : (
                          <span
                            role="img"
                            aria-label="cross"
                            className="text-lg"
                          >
                            ❌
                          </span>
                        )}
                      </div>
                      <span className="ml-3 font-medium">{pregunta.texto}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    onClick={handleNewRequest}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Nueva Solicitud
                  </button>
                  <button
                    onClick={handleUpdateRequirements}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Actualizar Documentos
                  </button>
                </div>
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
                    <h2 className="text-2xl font-bold mb-6">
                      1. Requerimientos Obligatorios
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Cédula de Identidad *
                        </label>
                        <input
                          type="text"
                          value={cedula_emprendimiento}
                          onChange={(e) =>
                            setCedula_emprendimiento(e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                          required
                          placeholder="6-8 dígitos numéricos"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Fecha para traer los requerimientos (dd/mm/aaaa) *
                      </label>
                      <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      {preguntas.map((pregunta) => (
                        <div
                          key={pregunta.id}
                          className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <input
                            type="checkbox"
                            checked={pregunta.respuesta}
                            onChange={() => handleCheckboxChange(pregunta.id)}
                            className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <label className="ml-4 text-lg font-medium cursor-pointer text-gray-800">
                            {pregunta.texto}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleNextStep}
                        className="py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-300 bg-blue-600 hover:bg-blue-700"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
                    <h2 className="text-2xl font-bold mb-6">
                      2. Motivo de la Solicitud
                    </h2>

                    <div className="mb-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Explique el motivo de su solicitud *
                      </label>
                      <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg h-32"
                        placeholder="Describa el motivo de su solicitud de crédito..."
                        required
                      ></textarea>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={handlePreviousStep}
                        className="py-3 px-6 rounded-lg font-semibold text-gray-700 transition-colors duration-300 bg-gray-200 hover:bg-gray-300"
                      >
                        Atrás
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-300 bg-blue-600 hover:bg-blue-700"
                      >
                        Enviar Solicitud
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <footer className="mt-auto py-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default CombinedComponent;
