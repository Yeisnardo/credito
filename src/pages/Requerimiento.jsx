import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Encuesta = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [respuestas, setRespuestas] = useState([]);
  const [modo, setModo] = useState("registrar"); // Estado para el modo (registrar/modificar)

  // Estado para las preguntas de la encuesta con boolean answers
  const [preguntas, setPreguntas] = useState([
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    // Simulación de carga de usuario
    setUser ({ id: 1, nombre: "Juan Pérez" });
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleCheckboxChange = (id) => {
    // Solo permitir cambios si estamos en modo modificar
    if (modo === "modificar") {
      setPreguntas((prevPreguntas) =>
        prevPreguntas.map((pregunta) =>
          pregunta.id === id ? { ...pregunta, respuesta: !pregunta.respuesta } : pregunta
        )
      );
    }
  };

  const handleSubmitEncuesta = (e) => {
    e.preventDefault();
    if (modo === "registrar") {
      setRespuestas(preguntas);
      setModo("registrar"); // Enviar y bloquear inputs
    } else if (modo === "modificar") {
      setRespuestas(preguntas);
      alert("Respuestas modificadas con éxito");
      setModo("registrar"); // Volver a bloquear inputs tras modificar
    }
  };

  // Asegurar que preguntas estén sincronizadas con respuestas al cambiar modo
  useEffect(() => {
    if (respuestas.length > 0) {
      setPreguntas(respuestas);
    }
  }, [respuestas]);

  return (
    <div className="flex min-h-screen bg-white">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 max-w-5xl mx-auto px-6 pt-20 pb-20">
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Requerimientos Obligatorios</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Queremos conocer que requerimientos tienes.
          </p>
        </header>

        {/* Botones para cambiar entre modos */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setModo("registrar")}
            className={`px-4 py-2 rounded-lg ${modo === "registrar" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            disabled={modo === "registrar" && respuestas.length === 0} // No puede cambiar a registrar si no hay respuestas
            aria-pressed={modo === "registrar"}
          >
            Resultado del Registro
          </button>
          <button
            onClick={() => setModo("modificar")}
            className={`ml-4 px-4 py-2 rounded-lg ${modo === "modificar" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            disabled={respuestas.length === 0} // Solo habilitar modificar si hay respuestas
            aria-pressed={modo === "modificar"}
          >
            Registrar Respuestas
          </button>
        </div>

        {/* Sección de encuesta */}
        <section>
          <form
            className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto"
            onSubmit={handleSubmitEncuesta}
            aria-live="polite"
          >
            {preguntas.map((pregunta) => (
              <div key={pregunta.id} className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id={`pregunta-${pregunta.id}`}
                  checked={pregunta.respuesta}
                  onChange={() => handleCheckboxChange(pregunta.id)}
                  className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  disabled={modo === "registrar"} // Deshabilitar checkboxes cuando respuestas enviadas (modo registrar)
                  aria-checked={pregunta.respuesta}
                  role="checkbox"
                />
                <label
                  htmlFor={`pregunta-${pregunta.id}`}
                  className={`ml-3 font-semibold select-none ${modo === "registrar" ? "text-gray-600" : "text-gray-700 cursor-pointer"}`}
                >
                  {pregunta.texto}
                </label>
              </div>
            ))}

            <button
              type="submit"
              className={`mt-6 w-full py-3 font-semibold rounded-lg transition-colors duration-300 ${
                modo === "registrar"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              aria-live="polite"
            >
              {modo === "registrar" ? "Pulsa aqui Responder" : "Guardar Cambios"}
            </button>
          </form>

          {respuestas.length > 0 && (
            <div className="mt-12 max-w-3xl mx-auto bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Respuestas Registradas</h3>
              <ul className="list-disc list-inside text-gray-800 space-y-2">
                {respuestas.map((resp) => (
                  <li key={resp.id}>
                    <strong>{resp.texto}</strong>: {resp.respuesta ? "Sí" : "No"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <footer className="mt-auto p-8 text-center text-gray-400 border-t border-gray-200">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Encuesta;
