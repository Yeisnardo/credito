import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_requerimiento";
import apiUsuario from "../services/api_usuario";

const Encuesta = ({ menuOpenProp, setUser }) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(menuOpenProp ?? true);
  const [user, setUserState] = useState(null);
  const setUserInParent = setUser ?? (() => {});

  const [respuestas, setRespuestas] = useState([]);
  const [modo, setModo] = useState("registrar"); // "registrar" o "visualizar"
  const [cedulaMostrar, setCedulaMostrar] = useState(""); // Para mostrar cédula en resultados

  // Datos personales
  const [nombre_completo, setNombre_completo] = useState("");
  const [cedula_emprendimiento, setCedula_emprendimiento] = useState("");
  const [fechaCita, setFechaCita] = useState("");

  // Preguntas
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

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Cargar usuario al montar
  // Dentro de useEffect
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiUsuario.getUsuario();
        if (response && response.length > 0) {
          const usuario = response[0];
          setUserState(usuario);
          setUserInParent(usuario);
        }
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };
    if (!user) fetchUserData();
  }, [user, setUser, setUserInParent]);

  const handleCheckboxChange = (id) => {
    if (modo === "registrar") {
      setPreguntas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, respuesta: !p.respuesta } : p))
      );
    }
  };

  const handleNombre_completoChange = (e) => setNombre_completo(e.target.value);
  const handleCedula_emprendimientoChange = (e) =>
    setCedula_emprendimiento(e.target.value);

  const handleFechaChange = (e) => {
    const dateStr = e.target.value; // "yyyy-mm-dd"
    if (dateStr) {
      const [year, month, day] = dateStr.split("-");
      const formattedDate = `${day}/${month}/${year}`;
      setFechaCita(formattedDate);
    } else {
      setFechaCita("");
    }
  };

  const handleSubmitEncuesta = async (e) => {
    e.preventDefault();
    try {
      await api.createPersona({ nombre_completo, cedula_emprendimiento });

      if (cedula_emprendimiento) {
        const existing = await api.getRequerimiento(cedula_emprendimiento);
        if (existing) {
          await api.updateRequerimiento(cedula_emprendimiento, preguntas);
        } else {
          await api.createRequerimiento(cedula_emprendimiento, preguntas);
        }
      }
      alert("Datos guardados correctamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un problema al guardar los datos");
    }
  };

  const handleMostrarResultados = () => {
    setModo("visualizar");
    if (cedula_emprendimiento) {
      api.getRequerimiento(cedula_emprendimiento).then((data) => {
        if (data) {
          if (data.respuestas) {
            setRespuestas(data.respuestas);
          }
          // Guardar la cédula para mostrar
          setCedulaMostrar(data.cedula_requerimiento);
        }
      });
    }
  };

  const handleResponder = () => {
    setModo("registrar");
    // Limpiar respuestas y cédula al responder nuevamente
    setRespuestas([]);
    setCedulaMostrar("");
  };

  useEffect(() => {
    if (respuestas.length > 0) {
      setPreguntas(respuestas);
    }
  }, [respuestas]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-arial text-gray-700">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 max-w-7xl mx-auto px-6 py-8">
        <Header toggleMenu={toggleMenu} />

        {/* Encabezado */}
        <header className="text-center mb-10 mt-9">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Requerimientos Obligatorios
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Queremos conocer qué requerimientos tienes. Además, agenda tu cita
            para traer los requerimientos.
          </p>
        </header>

        {/* Botones principales */}
        {modo === "registrar" && (
          <div className="flex justify-center mb-8 gap-4">
            <button
              onClick={() => setModo("registrar")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                modo === "registrar"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Responder
            </button>
            <button
              onClick={handleMostrarResultados}
              className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-all"
            >
              Mostrar Resultados
            </button>
          </div>
        )}

        {/* Sección principal */}
        {modo === "registrar" ? (
          <section>
            <div className="max-w-4xl mx-auto px-4">
              <form
                className="bg-white p-8 rounded-xl shadow-lg space-y-8"
                onSubmit={handleSubmitEncuesta}
                aria-live="polite"
              >
                {/* Datos personales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="cedula_emprendimiento"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Cédula de Identidad
                    </label>
                    <div className="mb-4">
                      <input
                        type="text"
                        value={user ? user.cedula_usuario : ""}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="nombre_completo"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={user ? user.nombre : ""}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                {/* Fecha cita */}
                <div className="mb-6">
                  <label
                    htmlFor="fecha"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Fecha para traer los requerimientos (dd/mm/aaaa)
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleFechaChange}
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
                      disabled={modo !== "registrar"}
                      aria-checked={pregunta.respuesta}
                      role="checkbox"
                    />
                    <label
                      htmlFor={`pregunta-${pregunta.id}`}
                      className="ml-4 text-lg font-medium cursor-pointer text-gray-800"
                    >
                      {pregunta.texto}
                    </label>
                  </div>
                ))}

                {/* Botón guardar */}
                <button
                  type="submit"
                  className="w-full py-3 mt-8 px-6 rounded-lg font-semibold text-white transition-colors duration-300 bg-blue-600 hover:bg-blue-700"
                >
                  Guardar Respuestas
                </button>
              </form>
            </div>
          </section>
        ) : (
          // Mostrar resultados
          <section>
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Respuestas Registradas
              </h3>
              {/* Mostrar cédula */}
              {cedulaMostrar && (
                <p className="mb-4 font-semibold">
                  Cédula del solicitante: {cedulaMostrar}
                </p>
              )}
              {respuestas.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {respuestas.map((resp) => (
                    <li
                      key={resp.id}
                      className="flex justify-between items-center"
                    >
                      <span className="font-semibold">{resp.texto}</span>
                      <span className="ml-4 font-semibold text-green-600">
                        {resp.respuesta ? "Sí" : "No"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay respuestas registradas.</p>
              )}
              <button
                onClick={handleResponder}
                className="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
              >
                Responder Nuevamente
              </button>
            </div>
          </section>
        )}

        {/* Pie de página */}
        <footer className="mt-auto py-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Encuesta;
