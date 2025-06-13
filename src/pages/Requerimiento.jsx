import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_requerimiento";
import { getUsuarioPorCedula } from '../services/api_usuario';

const Encuesta = ({ menuOpenProp, }) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(menuOpenProp ?? true);
  const [user, setUser] = useState(null);
  const setUserInParent = setUser ?? (() => {});

  const [cedula_emprendimiento, setCedula_emprendimiento] = useState("");
  const [fecha, setFecha] = useState(""); // yyyy-mm-dd
  const [fechaCita, setFechaCita] = useState(""); // dd/mm/aaaa

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

  const [resultados, setResultados] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Función para mostrar resultados
  const handleVerResultados = async () => {
    if (cedula_emprendimiento) {
      try {
        const data = await api.getRequerimiento(cedula_emprendimiento);
        if (data) {
          setResultados(data);
          setMostrarResultados(true);
        } else {
          alert("No se encontraron resultados para esa cédula");
        }
      } catch (error) {
        alert("Error al obtener resultados");
        console.error(error);
      }
    } else {
      alert("Por favor, ingresa la cédula para ver resultados");
    }
  };

  // Cargar usuario y datos existentes al montar
  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const cedula = localStorage.getItem('cedula_usuario');
      if (cedula) {
        const usuario = await getUsuarioPorCedula(cedula);
        if (usuario) {
          setUser(usuario);
          setUserInParent(usuario);
          setCedula_emprendimiento(usuario.cedula_usuario);
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario por cédula:', error);
    }
  };

  // Solo ejecutar si no hay un usuario en estado
  if (!user) {
    fetchUserData();
  }
}, [user, setUser, setUserInParent]);

useEffect(() => {
  const fetchUserData = async () => {
    try {
      const cedula = localStorage.getItem('cedula_usuario');
      if (cedula) {
        const usuario = await getUsuarioPorCedula(cedula);
        if (usuario) {
          setUser(usuario);
          setUserInParent(usuario);
          setCedula_emprendimiento(usuario.cedula_usuario);
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario por cédula:', error);
    }
  };

  // Solo ejecutar si no hay un usuario en estado
  if (!user) {
    fetchUserData();
  }
}, [user, setUser, setUserInParent]);

  // Cuando cambie la cédula, buscar datos guardados y cargar respuestas
  useEffect(() => {
    const fetchExistingData = async () => {
      if (cedula_emprendimiento) {
        try {
          const data = await api.getRequerimiento(cedula_emprendimiento);
          if (data) {
            setCedula_emprendimiento(data.cedula_requerimiento);
            setFecha(data.fecha);
            const [year, month, day] = data.fecha.split("-");
            setFechaCita(`${day}/${month}/${year}`);

            const keys = [
              "carta_solicitud",
              "postulacion_UBCH",
              "certificado_emprender",
              "registro_municipal",
              "carta_residencia",
              "copia_cedula",
              "rif_personal",
              "fotos_emprendimiento",
              "rif_emprendimiento",
              "referencia_bancaria",
            ];

            const updatedPreguntas = preguntas.map((p, index) => {
              const key = keys[index];
              return {
                ...p,
                respuesta: data[key] === "Si",
              };
            });
            setPreguntas(updatedPreguntas);
          }
        } catch (error) {
          // No hay datos o error
        }
      }
    };
    fetchExistingData();
  }, [cedula_emprendimiento]);

  // Manejar cambios en las respuestas (checkbox)
  const handleCheckboxChange = (id) => {
    setPreguntas((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, respuesta: !p.respuesta } : p
      )
    );
  };

  // Manejar cambio en la fecha
  const handleFechaChange = (e) => {
    const dateStr = e.target.value; // "yyyy-mm-dd"
    setFecha(dateStr);
    if (dateStr) {
      const [year, month, day] = dateStr.split("-");
      setFechaCita(`${day}/${month}/${year}`);
    } else {
      setFechaCita("");
    }
  };

  // Validar solo números y longitud
  const handleCedulaChange = (e) => {
    const value = e.target.value;
    // Solo números y entre 6 y 8 caracteres
    if (/^\d*$/.test(value) && value.length <= 8) {
      setCedula_emprendimiento(value);
    }
  };

  // Guardar respuestas
  const handleSubmitEncuesta = async (e) => {
    e.preventDefault();

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

    const requerimientoData = {
      cedula_requerimiento: cedula_emprendimiento,
      fecha: fecha,
      carta_solicitud: preguntas[0].respuesta ? "Si" : "No",
      postulacion_UBCH: preguntas[1].respuesta ? "Si" : "No",
      certificado_emprender: preguntas[2].respuesta ? "Si" : "No",
      registro_municipal: preguntas[3].respuesta ? "Si" : "No",
      carta_residencia: preguntas[4].respuesta ? "Si" : "No",
      copia_cedula: preguntas[5].respuesta ? "Si" : "No",
      rif_personal: preguntas[6].respuesta ? "Si" : "No",
      fotos_emprendimiento: preguntas[7].respuesta ? "Si" : "No",
      rif_emprendimiento: preguntas[8].respuesta ? "Si" : "No",
      referencia_bancaria: preguntas[9].respuesta ? "Si" : "No",
    };

    try {
      const existing = await api.getRequerimiento(cedula_emprendimiento);
      if (existing) {
        await api.updateRequerimiento(cedula_emprendimiento, requerimientoData);
      } else {
        await api.createRequerimiento(requerimientoData);
      }
      alert("Datos guardados correctamente");
    } catch (error) {
      console.error("Error al guardar requerimiento:", error);
      alert("Hubo un problema al guardar los datos");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-arial text-gray-700">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 max-w-7xl mx-auto px-6 py-8">
        <Header toggleMenu={toggleMenu} />

        {/* Encabezado con botón para resultados */}
        <header className="flex items-center justify-between mb-4 mt-9">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Requerimientos Obligatorios
          </h1>
          <div className="flex space-x-4">
            {/* Botón para ver resultados */}
            <button
              onClick={handleVerResultados}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Ver Resultados
            </button>
          </div>
        </header>

        {/* Sección principal */}
        <section>
          <div className="max-w-4xl mx-auto px-4">
            {!mostrarResultados ? (
              <form
                className="bg-white p-8 rounded-xl shadow-lg space-y-8"
                onSubmit={handleSubmitEncuesta}
                aria-live="polite"
              >
                {/* Datos personales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="cedula_requerimiento"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Cédula de Identidad *
                    </label>
                    <input
                      type="text"
                      id="cedula_requerimiento"
                      value={cedula_emprendimiento}
                      onChange={handleCedulaChange}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                      required
                      placeholder="6-8 dígitos numéricos"
                    />
                  </div>
                </div>

                {/* Fecha cita */}
                <div className="mb-6">
                  <label
                    htmlFor="fecha"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Fecha para traer los requerimientos (dd/mm/aaaa) *
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    value={fecha}
                    onChange={handleFechaChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {fechaCita && (
                    <p className="mt-2 text-gray-600">
                      Fecha seleccionada: {fechaCita}
                    </p>
                  )}
                </div>

                {/* Preguntas */}
                {preguntas.map((pregunta) => (
                  <div
                    key={pregunta.id}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      id={`pregunta-${pregunta.id}`}
                      checked={pregunta.respuesta}
                      onChange={() => handleCheckboxChange(pregunta.id)}
                      className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`pregunta-${pregunta.id}`}
                      className="ml-4 text-lg font-medium cursor-pointer text-gray-800"
                    >
                      {pregunta.texto}
                    </label>
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full py-3 mt-8 px-6 rounded-lg font-semibold text-white transition-colors duration-300 bg-blue-600 hover:bg-blue-700"
                >
                  Guardar Respuestas
                </button>
              </form>
            ) : (
              // Mostrar resultados
              <div className="bg-white p-8 rounded-xl shadow-lg space-y-4">
                <h2 className="text-2xl font-bold mb-4">Resultados</h2>
                {resultados ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Cédula:</strong> {resultados.cedula_requerimiento}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {resultados.fecha}
                    </p>
                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      Respuestas:
                    </h3>
                    <ul className="list-disc list-inside">
                      {[
                        {
                          label: "Carta de Motivo para Solicitar Crédito",
                          key: "carta_solicitud",
                        },
                        { label: "Postulación UBCH", key: "postulacion_ubch" },
                        {
                          label: "Certificado de emprender juntos",
                          key: "certificado_emprender",
                        },
                        {
                          label: "Registro Municipal",
                          key: "registro_municipal",
                        },
                        {
                          label: "Carta de residencia",
                          key: "carta_residencia",
                        },
                        { label: "Copia de cédula", key: "copia_cedula" },
                        { label: "RIF personal", key: "rif_personal" },
                        {
                          label: "Fotos del emprendimiento",
                          key: "fotos_emprendimiento",
                        },
                        {
                          label: "RIF de emprendimiento",
                          key: "rif_emprendimiento",
                        },
                        {
                          label: "Referencia bancaria",
                          key: "referencia_bancaria",
                        },
                      ].map((item) => (
                        <li key={item.key}>
                          <strong>{item.label}:</strong> {resultados[item.key]}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setMostrarResultados(false)}
                      className="mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                    >
                      Volver
                    </button>
                  </div>
                ) : (
                  <p>No hay resultados para mostrar.</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Pie de página */}
        <footer className="mt-auto py-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Encuesta;