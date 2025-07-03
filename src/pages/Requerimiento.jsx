import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

// Servicios
import { getRequerimientos } from "../services/api_requerimientos";
import { createRequerimientoEmprendedor, getRequerimientoById } from "../services/api_required";
import { getUsuarioPorCedula } from "../services/api_usuario";

const Dashboard = ({ setUser  }) => {
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
  const [resultado, setResultado] = useState({ motivo: "", estatus: "" });
  const [registros, setRegistros] = useState([]);

  // Funciones
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNext = () => {
    if (step === 1 && selectedRequerimientos.length === 0) {
      alert("Por favor, selecciona al menos un requerimiento para continuar.");
      return;
    }
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cargar usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser ) setUser (usuario);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario por cédula:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser , user]);

  // Cargar requerimientos
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

  const handleRequerimientoSelect = (req) => {
    const exists = selectedRequerimientos.some(
      (r) => r.id_requerimientos === req.id_requerimientos
    );
    if (exists) {
      setSelectedRequerimientos((prev) =>
        prev.filter((r) => r.id_requerimientos !== req.id_requerimientos)
      );
    } else {
      setSelectedRequerimientos((prev) => [
        ...prev,
        {
          id_requerimientos: req.id_requerimientos,
          nombre: req.nombre_requerimiento,
        },
      ]);
    }
  };

  const handleEnviar = async () => {
    if (selectedRequerimientos.length === 0) {
      alert("Debes seleccionar al menos un requerimiento.");
      return;
    }

    const cedulaUsuario =
      user?.cedula_usuario || localStorage.getItem("cedula_usuario");

    const requerimientosConOptRequerimiento = selectedRequerimientos
      .filter((r) => r.id_requerimientos != null)
      .map((r) => ({
        id_requerimientos: r.id_requerimientos,
        cedula_requerimiento: cedulaUsuario,
        opt_requerimiento: r.id_requerimientos,
      }));

    const dataToSend = {
      ...formData,
      requerimientos: requerimientosConOptRequerimiento,
      estatus: "Pendiente",
      cedula_requerimiento: cedulaUsuario,
    };

    try {
      await createRequerimientoEmprendedor(dataToSend);
      Swal.fire(
        "¡Enviado!",
        "Tu requerimiento ha sido registrado correctamente.",
        "success"
      );
      setRegistros((prev) => [...prev, dataToSend]);
      setResultado({ motivo: dataToSend.motivo, estatus: dataToSend.estatus });
      setMostrarResultado(true);
    } catch (error) {
      console.error("Error al enviar requerimiento:", error);
      Swal.fire(
        "Error",
        "Hubo un problema al enviar tu requerimiento. Inténtalo nuevamente.",
        "error"
      );
    }
  };

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

  const handleActualizarRequerimientos = async () => {
    await fetchRequerimientos();
    Swal.fire(
      "Requerimientos Actualizados",
      "Se recargaron los requerimientos.",
      "success"
    );
  };

  const requerimientosSeleccionados = requerimientos.filter((req) =>
    selectedRequerimientos.some(
      (r) => r.id_requerimientos === req.id_requerimientos
    )
  );

  // NUEVO: Función para ver detalles del requerimiento usando API
  const handleVerRequerimiento = async (id_requerimientos) => {
    try {
      const requerimiento = await getRequerimientoById(id_requerimientos);
      Swal.fire({
        title: 'Detalle del Requerimiento',
        html: `
          <p><strong>ID:</strong> ${requerimiento.id_requerimientos}</p>
          <p><strong>Nombre:</strong> ${requerimiento.nombre_requerimiento}</p>
          <p><strong>Descripción:</strong> ${requerimiento.descripcion || 'No disponible'}</p>
        `,
        icon: 'info',
        width: 600,
        confirmButtonColor: '#4F46E5'
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo obtener el requerimiento.', 'error');
    }
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

          {/* Mostrar formulario o resultado */}
          {!mostrarResultado ? (
            <section className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-2">
              {/* Título */}
              <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center space-x-2">
                <i className="bx bx-edit-alt text-2xl"></i>
                <span>Formulario de Solicitud</span>
              </h2>

              {/* Paso 1: Requerimientos */}
              {step === 1 && (
                <div className="mb-6 animate-fadeIn">
                  {/* Cédula y Título */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
                      <span>Requerimientos disponibles</span>
                    </h3>
                    <input
                      type="text"
                      value={user?.cedula_usuario || "Cargando..."}
                      disabled
                      className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-300 shadow-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Lista de requerimientos */}
                  {requerimientos.length > 0 ? (
                    <ul className="space-y-4 max-h-64 overflow-y-auto">
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
                                checked={selectedRequerimientos.some(
                                  (r) =>
                                    r.id_requerimientos ===
                                    req.id_requerimientos
                                )}
                                onChange={() => handleRequerimientoSelect(req)}
                                className="absolute opacity-0 w-0 h-0"
                                value={req.id_requerimientos}
                              />
                              <div
                                className={`w-6 h-6 flex items-center justify-center border-2 rounded transition ${
                                  selectedRequerimientos.some(
                                    (r) =>
                                      r.id_requerimientos ===
                                      req.id_requerimientos
                                  )
                                    ? "bg-blue-600 border-blue-600"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {selectedRequerimientos.some(
                                  (r) =>
                                    r.id_requerimientos ===
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
                            {/* Nombre */}
                            <span className="ml-3 text-gray-800 font-medium">
                              {req.nombre_requerimiento}
                            </span>
                            {/* Botón para ver detalles */}
                            <button
                              className="ml-2 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                              onClick={() => handleVerRequerimiento(req.id_requerimientos)}
                            >
                              Ver detalles
                            </button>
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

              {/* Paso 2: Motivo */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Motivo */}
                  <div className="mb-4 flex items-center justify-between">
                    <label className="block mb-1 text-gray-600 font-medium">
                      Motivo de la solicitud
                    </label>
                  </div>
                  <textarea
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition h-32 resize-none"
                    placeholder="Escribe aquí..."
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
            // Resultado
            <section className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-7 overflow-hidden">
              {/* Encabezado */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-700 flex items-center space-x-2">
                  <i className="bx bx-check-circle text-2xl"></i>
                  <span>Resultado de la Solicitud</span>
                </h2>
                {/* Acciones */}
                <div className="flex space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition flex items-center"
                    onClick={handleActualizarRequerimientos}
                  >
                    <i className="bx bx-refresh mr-2"></i> Actualizar Reqs
                  </button>
                  <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition flex items-center"
                    onClick={handleAgregarMotivo}
                  >
                    <i className="bx bx-plus mr-2"></i> Añadir Motivo
                  </button>
                </div>
              </div>

              {/* Requerimientos seleccionados */}
              {requerimientosSeleccionados.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Requerimientos Seleccionados:
                  </h4>
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {requerimientosSeleccionados.map((req) => (
                      <li
                        key={req.id_requerimientos}
                        className="flex items-center px-2 py-1 rounded-lg bg-gray-50"
                      >
                        <span className="text-green-500 mr-2">✔️</span>
                        <span>{req.nombre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tabla con motivo y estatus */}
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

              {/* Lista de requerimientos en pantalla */}
              <h3 className="text-lg font-semibold mb-2">Requerimientos:</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {requerimientos.map((req) => (
                  <li
                    key={req.id_requerimientos}
                    className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                  >
                    {selectedRequerimientos.some(
                      (r) => r.id_requerimientos === req.id_requerimientos
                    ) ? (
                      <span className="text-green-500 text-xl mr-3" title="Seleccionado">
                        ✔️
                      </span>
                    ) : (
                      <span className="text-red-500 text-xl mr-3" title="No seleccionado">
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