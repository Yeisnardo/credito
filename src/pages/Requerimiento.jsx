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
  const [user, setUser ] = useState(null);
  const [solicitudesCredito, setSolicitudesCredito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cedula_emprendimiento, setCedula_emprendimiento] = useState("");
  const [fecha, setFecha] = useState(""); // yyyy-mm-dd
  const [motivo, setMotivo] = useState(""); // Added motivo state
  const [preguntas, setPreguntas] = useState([
    { id: 0, texto: "Carta de Motivo para Solicitar Crédito", respuesta: false },
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
  const [nuevoRequerimiento, setNuevoRequerimiento] = useState(""); // State for new requirement
  const [resultados, setResultados] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Requerimientos, 2: Motivo, 3: Confirmación
  const [isUpdating, setIsUpdating] = useState(false); // Estado para manejar la actualización

  const toggleMenu = () => setMenuOpen((prev) => !prev);

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

  useEffect(() => {
    if (!user || !cedula_emprendimiento) return;
    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        const data = await getSolicitudes();
        setSolicitudesCredito(data);
        // Verificar si hay registros guardados
        const existing = await api.getRequerimiento(cedula_emprendimiento);
        if (existing) {
          setResultados(existing);
          setMostrarResultados(true);
          setIsUpdating(true); // Indicar que se está actualizando
          // Cargar datos existentes en el formulario
          setFecha(existing.fecha || "");
          setMotivo(existing.motivo || "");
          setPreguntas((prevPreguntas) =>
            prevPreguntas.map((pregunta) => ({
              ...pregunta,
              respuesta: existing[pregunta.texto.replace(/ /g, "_").toLowerCase()] === "si",
            }))
          );
        } else {
          setIsUpdating(false); // No hay registro, es nuevo
        }
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
  }, [user, cedula_emprendimiento]);

  const handleSubmit = async () => {
    // Validaciones
    if (!cedula_emprendimiento || cedula_emprendimiento.length < 6 || cedula_emprendimiento.length > 8) {
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

    // Datos para guardar
    const requerimientoData = {
      cedula_requerimiento: cedula_emprendimiento,
      fecha: fecha,
      motivo: motivo,
      carta_solicitud: preguntas[0].respuesta ? "si" : "no",
      postulacion_UBCH: preguntas[1].respuesta ? "si" : "no",
      certificado_emprender: preguntas[2].respuesta ? "si" : "no",
      registro_municipal: preguntas[3].respuesta ? "si" : "no",
      carta_residencia: preguntas[4].respuesta ? "si" : "no",
      copia_cedula: preguntas[5].respuesta ? "si" : "no",
      rif_personal: preguntas[6].respuesta ? "si" : "no",
      fotos_emprendimiento: preguntas[7].respuesta ? "si" : "no",
      rif_emprendimiento: preguntas[8].respuesta ? "si" : "no",
      referencia_bancaria: preguntas[9].respuesta ? "si" : "no",
    };

    try {
      if (isUpdating) {
        await api.updateRequerimiento(cedula_emprendimiento, requerimientoData);
      } else {
        await api.createRequerimiento(requerimientoData);
      }

      // Crear solicitud
      const nuevaSolicitud = {
        cedula_solicitud: cedula_emprendimiento,
        motivo: motivo,
        estatus: "Pendiente",
      };
      await createSolicitud(nuevaSolicitud);

      Swal.fire({
        icon: 'success',
        title: 'Solicitud Enviada',
        text: 'Su solicitud ha sido enviada correctamente.',
      });
      handleNewRequest(); // Resetea formulario
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al guardar los datos. Intente nuevamente.",
      });
    }
  };

  const handleUpdateRequirements = () => {
    // Mostrar formulario en Swal para actualizar requerimientos
    const requirementsForm = `
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        ${preguntas.map((pregunta, index) => `
          <div style="margin-bottom: 10px;">
            <input 
              type="checkbox" 
              id="req-${pregunta.id}" 
              ${pregunta.respuesta ? 'checked' : ''}
              style="margin-right: 10px;"
            >
            <label for="req-${pregunta.id}">${pregunta.texto}</label>
          </div>
        `).join('')}
      </div>
    `;

    Swal.fire({
      title: 'Actualizar Requerimientos',
      html: requirementsForm,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar actualización',
      cancelButtonText: 'Cancelar',
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
            carta_solicitud: updatedPreguntas[0].respuesta ? "si" : "no",
            postulacion_UBCH: updatedPreguntas[1].respuesta ? "si" : "no",
            certificado_emprender: updatedPreguntas[2].respuesta ? "si" : "no",
            registro_municipal: updatedPreguntas[3].respuesta ? "si" : "no",
            carta_residencia: updatedPreguntas[4].respuesta ? "si" : "no",
            copia_cedula: updatedPreguntas[5].respuesta ? "si" : "no",
            rif_personal: updatedPreguntas[6].respuesta ? "si" : "no",
            fotos_emprendimiento: updatedPreguntas[7].respuesta ? "si" : "no",
            rif_emprendimiento: updatedPreguntas[8].respuesta ? "si" : "no",
            referencia_bancaria: updatedPreguntas[9].respuesta ? "si" : "no",
          };
          await api.updateRequerimiento(cedula_emprendimiento, requerimientoData);
          setPreguntas(updatedPreguntas);
          Swal.fire('Actualizado!', 'Los requerimientos han sido actualizados correctamente.', 'success');
        } catch (error) {
          console.error("Error al actualizar:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar. Intente nuevamente.',
          });
        }
      }
    });
  };

  const handleVerResultados = async () => {
    if (!cedula_emprendimiento) {
      Swal.fire({
        icon: "warning",
        title: "Cédula no proporcionada",
        text: "Por favor, ingrese su cédula para ver los resultados.",
      });
      return;
    }
    try {
      const resultadosData = await api.getRequerimiento(cedula_emprendimiento);
      if (resultadosData) {
        setResultados(resultadosData);
        setMostrarResultados(true);
      } else {
        Swal.fire({
          icon: "info",
          title: "Sin resultados",
          text: "No se encontraron resultados para la cédula proporcionada.",
        });
        setMostrarResultados(false);
      }
    } catch (error) {
      console.error("Error al obtener resultados:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al obtener los resultados. Intente nuevamente.",
      });
    }
  };

  const handleCheckboxChange = (id) => {
    setPreguntas((prevPreguntas) =>
      prevPreguntas.map((pregunta) =>
        pregunta.id === id ? { ...pregunta, respuesta: !pregunta.respuesta } : pregunta
      )
    );
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleNewRequest = () => {
    setMotivo("");
    setFecha("");
    setPreguntas(preguntas.map(p => ({ ...p, respuesta: false })));
    setCurrentStep(1);
    setMostrarResultados(false);
    setIsUpdating(false);
  };

  const handleShowRequirements = () => {
    const requirementsText = preguntas.map((pregunta) => {
      return `${pregunta.texto}: ${resultados[pregunta.texto.replace(/ /g, "_").toLowerCase()] ? "si" : "no"}`;
    }).join("\n");
    Swal.fire({
      title: 'Requerimientos Actuales',
      text: requirementsText,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  };

  const handleAddRequirement = () => {
    if (!nuevoRequerimiento.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Requerimiento vacío',
        text: 'Por favor, ingrese un requerimiento.',
      });
      return;
    }
    const newRequirement = {
      id: preguntas.length,
      texto: nuevoRequerimiento,
      respuesta: true,
    };
    setPreguntas((prevPreguntas) => [...prevPreguntas, newRequirement]);
    setNuevoRequerimiento("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {menuOpen && <Menu />}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        <Header toggleMenu={toggleMenu} />

        <header className="flex items-center justify-between mb-4 mt-9 px-6">
          <div className="flex items-center justify-between mb-8 mt-10">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
                <i className="bx bx-home text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Solicitud de Crédito</h1>
            </div>
          </div>
        </header>

        <section>
          <div className="max-w-4xl mx-auto px-4">
            {/* Mostrar el formulario si no hay registros */}
            {mostrarResultados ? (
              <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
                <h2 className="text-2xl font-bold mb-6">Resultados de Solicitud</h2>
                <div>
                  <p><strong>Cédula:</strong> {resultados.cedula_requerimiento}</p>
                  <p><strong>Fecha:</strong> {resultados.fecha}</p>
                  <h3 className="text-lg font-semibold mt-4">Requerimientos:</h3>
                  <ul className="list-disc list-inside mt-2">
                    {preguntas.map((pregunta) => (
                      <li key={pregunta.id}>
                        <strong>{pregunta.texto}:</strong> {resultados[pregunta.texto.replace(/ /g, "_").toLowerCase()] ? "Sí" : "No"}
                      </li>
                    ))}
                  </ul>
                  <p><strong>Motivo:</strong> {resultados.motivo}</p>
                </div>
                <div className="flex space-x-4 justify-end mt-6">
                  {/* Botón para mostrar requerimientos en Swal */}
                  <button
                    onClick={handleShowRequirements}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Ver Requerimientos
                  </button>
                  
                  {/* Botón para continuar */}
                  <button
                    onClick={handleUpdateRequirements}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Actualizar Requerimientos
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Renderizar el formulario paso a paso */}
                {currentStep === 1 && (
                  <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
                    <h2 className="text-2xl font-bold mb-6">1. Requerimientos Obligatorios</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Cédula de Identidad *
                        </label>
                        <input
                          type="text"
                          value={cedula_emprendimiento}
                          onChange={(e) => setCedula_emprendimiento(e.target.value)}
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
                        <div key={pregunta.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
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

                    {/* Formulario para agregar nuevo requerimiento */}
                    <div className="mb-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Agregar nuevo requerimiento
                      </label>
                      <input
                        type="text"
                        value={nuevoRequerimiento}
                        onChange={(e) => setNuevoRequerimiento(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded lg"
                        placeholder="Ingrese el nuevo requerimiento"
                      />
                      <button
                        onClick={handleAddRequirement}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Agregar Requerimiento
                      </button>
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

                {/* Step 2: Motivo */}
                {currentStep === 2 && (
                  <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
                    <h2 className="text-2xl font-bold mb-6">2. Motivo de la Solicitud</h2>
                    
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
                        className="py-3 px-6 rounded-lg font-semibold text-gray-700 transition-colors duration-300 bg-gray-200 hover:bg-gray-300">
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
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default CombinedComponent;