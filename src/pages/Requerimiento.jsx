import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from "../services/api_usuario";
import api, {getRequerimientos , updateRequerimiento, createRequerimientoEmprendedor} from '../services/api_required';

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimientos, setRequerimientos] = useState([]);

  const [selectedRequerimientos, setSelectedRequerimientos] = useState([]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    motivo: "",
  });

  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultado, setResultado] = useState(null); // {motivo, estatus}
  const [registros, setRegistros] = useState([]);

  // Función para alternar el menú lateral
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Navegar a la siguiente etapa del formulario
  const handleNext = () => {
    if (step === 1 && selectedRequerimientos.length === 0) {
      alert("Por favor, selecciona al menos un requerimiento para continuar.");
      return;
    }
    if (step < 2) setStep(step + 1);
  };

  // Volver a la etapa anterior
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cargar usuario al montar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario por cédula:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Función para cargar requerimientos
  const fetchRequerimientos = async () => {
    try {
      const data = await getRequerimientos();
      setRequerimientos(data);
    } catch (error) {
      console.error("Error fetching requerimientos:", error);
    }
  };

  useEffect(() => {
    fetchRequerimientos();
  }, []);

  // Manejar selección de requerimientos
  const handleRequerimientoSelect = (id_requerimientos) => {
    if (selectedRequerimientos.includes(id_requerimientos)) {
      setSelectedRequerimientos((prev) =>
        prev.filter((req) => req !== id_requerimientos)
      );
    } else {
      setSelectedRequerimientos((prev) => [...prev, id_requerimientos]);
    }
  };

  // Enviar formulario
  const handleEnviar = () => {
    if (selectedRequerimientos.length === 0) {
      alert("Debes seleccionar al menos un requerimiento.");
      return;
    }
    const dataToSend = {
      ...formData,
      requerimientos: selectedRequerimientos,
      estatus: "Pendiente",
    };
    setRegistros([...registros, dataToSend]);
    setResultado({ motivo: dataToSend.motivo, estatus: dataToSend.estatus });
    setMostrarResultado(true);
  };

  // Volver al formulario para editar
  const handleVolverFormulario = () => {
    setMostrarResultado(false);
    setStep(1);
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      motivo: "",
    });
    setSelectedRequerimientos([]);
  };

  // Agregar o editar motivo desde vista de resultados
  const handleAgregarMotivo = () => {
    Swal.fire({
      title: "Añadir Nuevo Motivo",
      input: "text",
      inputLabel: "Escribe el nuevo motivo",
      inputPlaceholder: "Nuevo motivo",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setResultado((prev) => ({ ...prev, motivo: result.value }));
        Swal.fire("¡Motivo actualizado!", result.value, "success");
      }
    });
  };

  // Actualizar requerimientos
  const handleActualizarRequerimientos = () => {
    fetchRequerimientos();
    Swal.fire(
      "Requerimientos Actualizados",
      "Se recargaron los requerimientos.",
      "success"
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-950 font-sans">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />
        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-11">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 cursor-pointer">
                <i className="bx bx-file text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Solicitud de Crédito
              </h1>
            </div>
          </div>

          {/* Vista condicional */}
          {!mostrarResultado ? (
            <section className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-2">
              {/* Formulario */}
              <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center space-x-2">
                <i className="bx bx-edit-alt text-2xl"></i>
                <span>Formulario de Solicitud</span>
              </h2>

              {step === 1 && (
                <div className="mb-6 animate-fadeIn">
                  <h3 className="mb-4 text-xl font-semibold text-gray-700 flex items-center space-x-2">
                    <span>Requerimientos disponibles</span>
                  </h3>
                  {requerimientos.length > 0 ? (
                    <ul className="space-y-4">
                      {requerimientos.map((req) => (
                        <li
                          key={req.id_requerimientos}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg hover:bg-gray-50 transition duration-200"
                        >
                          <label
                            htmlFor={`req-${req.id_requerimientos}`}
                            className="flex items-center cursor-pointer flex-1"
                          >
                            {/* Checkbox */}
                            <div className="relative">
                              <input
                                type="checkbox"
                                id={`req-${req.id_requerimientos}`}
                                checked={selectedRequerimientos.includes(
                                  req.id_requerimientos
                                )}
                                onChange={() =>
                                  handleRequerimientoSelect(
                                    req.id_requerimientos
                                  )
                                }
                                className="absolute opacity-0 w-0 h-0"
                              />
                              {/* Caja visual */}
                              <div
                                className={`w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded transition ${
                                  selectedRequerimientos.includes(
                                    req.id_requerimientos
                                  )
                                    ? "bg-blue-600 border-blue-600"
                                    : "bg-white"
                                }`}
                              >
                                {selectedRequerimientos.includes(
                                  req.id_requerimientos
                                ) && (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="ml-3 text-gray-800 font-medium">
                              {req.nombre_requerimiento}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">Cargando requerimientos...</p>
                  )}

                  {/* Botón Siguiente */}
                  <div className="mt-6 flex justify-end">
                    <button
                      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleNext}
                      disabled={selectedRequerimientos.length === 0}
                    >
                      <i className="bx bx-right-arrow-alt mr-2"></i> Siguiente
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Motivo */}
                  <div className="mb-4 flex items-center justify-between">
                    <label className="block mb-1 text-gray-600 font-medium">
                      Motivo de la solicitud de crédito
                    </label>
                  </div>
                  <textarea
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition h-32 resize-none"
                    placeholder="Escribe aquí el motivo de tu solicitud..."
                  />

                  {/* Botones */}
                  <div className="flex justify-between pt-4">
                    <button
                      className="flex items-center bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                      onClick={handleBack}
                    >
                      <i className="bx bx-left-arrow-alt mr-2"></i> Anterior
                    </button>
                    <button
                      className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      onClick={handleEnviar}
                    >
                      <i className="bx bx-send mr-2"></i> Enviar
                    </button>
                  </div>
                </div>
              )}
            </section>
          ) : (
            // Vista de resultados
            <section className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-7 overflow-hidden">
              {/* Encabezado con botones */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-700 flex items-center space-x-2">
                  <i className="bx bx-check-circle text-2xl"></i>
                  <span>Resultado de la Solicitud</span>
                </h2>
                <div className="flex space-x-2">
                  {/* Botón Actualizar Requerimientos */}
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition flex items-center"
                    onClick={handleActualizarRequerimientos}
                  >
                    <i className="bx bx-refresh mr-2"></i> Actualizar Reqs
                  </button>
                  {/* Botón Añadir Motivo */}
                  <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition flex items-center"
                    onClick={handleAgregarMotivo}
                  >
                    <i className="bx bx-plus mr-2"></i> Añadir Motivo
                  </button>
                </div>
              </div>

              {/* Tabla Resultado */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full min-w-max table-auto border-collapse border border-gray-300 rounded-lg shadow-md">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Estatus</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">{resultado.estatus}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {/* Ver Motivo */}
                        <button
                          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
                          onClick={() => {
                            Swal.fire({
                              title: "Motivo de la Solicitud",
                              text: resultado.motivo,
                              icon: "info",
                              confirmButtonColor: "#4F46E5",
                            });
                          }}
                        >
                          Ver Motivo
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Lista de requerimientos */}
              <h3 className="text-lg font-semibold mb-2">Requerimientos:</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {requerimientos.map((req) => (
                  <li
                    key={req.id_requerimientos}
                    className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                  >
                    {selectedRequerimientos.includes(req.id_requerimientos) ? (
                      <span
                        className="text-green-500 text-xl mr-3"
                        title="Seleccionado"
                      >
                        ✔️
                      </span>
                    ) : (
                      <span
                        className="text-red-500 text-xl mr-3"
                        title="No seleccionado"
                      >
                        ❌
                      </span>
                    )}
                    <span className="text-gray-700">{req.nombre_requerimiento}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;