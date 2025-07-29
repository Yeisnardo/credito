import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { updateSolicitud } from "../services/api_solicitud";
import { getRequerimientos } from "../services/api_requerimientos";
import { getTodosRequerimientosEmprendedor } from "../services/api_requerimiento_emprendedor";

// Funciones para cargar datos
const fetchPersonasRegistradas = async () => {
  try {
    const data = await getTodosRequerimientosEmprendedor();
    return data;
  } catch (error) {
    console.error("Error cargando personas registradas:", error);
    return [];
  }
};

const fetchDetallesPersona = async (id_req) => {
  try {
    const data = await getTodosRequerimientosEmprendedor(id_req);
    return data;
  } catch (error) {
    console.error("Error cargando detalles:", error);
    return null;
  }
};

const Aprobacion = () => {
  const navigate = useNavigate();

  const [personasRegistradas, setPersonasRegistradas] = useState([]);
  const [menuOpen, setMenuOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [requerimientos, setRequerimientos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Carga de requerimientos
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

  // Carga de personas
  useEffect(() => {
    fetchPersonasRegistradas().then((data) => setPersonasRegistradas(data));
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const verDetalles = async (persona) => {
    setPersonaSeleccionada(persona);
    const detalles = await fetchDetallesPersona(persona.cedula_emprendedor);
    setResultado(detalles);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setPersonaSeleccionada(null);
    setResultado(null);
  };

  const aprobarPersona = async (cedula) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas aprobar a esta persona?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateSolicitud(cedula, { estatus: "Aprobada" });
          setPersonasRegistradas((prev) =>
            prev.map((p) =>
              p.cedula_emprendedor === cedula
                ? { ...p, estatus: "Aprobada" }
                : p
            )
          );
          Swal.fire(
            "¡Aprobada!",
            "La solicitud ha sido aprobada correctamente.",
            "success"
          );
        } catch (error) {
          console.error("Error aprobando solicitud:", error);
          Swal.fire("¡Error!", "No se pudo aprobar la solicitud.", "error");
        }
      }
    });
  };

  const rechazarPersona = (persona) => {
    Swal.fire({
      title: "Rechazar solicitud",
      input: "textarea",
      inputLabel: "Motivo del rechazo",
      inputPlaceholder: "Escribe el motivo del rechazo...",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    }).then(async (result) => {
      if (result.isConfirmed && result.value.trim() !== "") {
        try {
          await updateSolicitud(persona.cedula_emprendedor, {
            estatus: "Rechazada",
            motivo_rechazo: result.value,
          });
          setPersonasRegistradas((prev) =>
            prev.map((p) =>
              p.cedula_emprendedor === persona.cedula_emprendedor
                ? { ...p, estatus: "Rechazada", motivo_rechazo: result.value }
                : p
            )
          );
          Swal.fire("Rechazada", "La solicitud ha sido rechazada.", "success");
        } catch (error) {
          console.error("Error rechazando solicitud:", error);
          Swal.fire("¡Error!", "No se pudo rechazar la solicitud.", "error");
        }
      } else if (result.isConfirmed && result.value.trim() === "") {
        Swal.fire("Error", "Debes escribir un motivo para rechazar.", "error");
      }
    });
  };

  // Filtrado de solicitudes
  const filteredPersonas = personasRegistradas.filter((persona) => {
    const estadoMatch =
      filtroEstado === "todos" ||
      persona.estatus.toLowerCase() === filtroEstado;
    const searchMatch =
      persona.nombre_completo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      persona.cedula_emprendedor
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return estadoMatch && searchMatch;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <main className=" flex-1 overflow-y-auto mt-9 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12 px-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer">
                <i className="bx bx-check-circle text-3xl text-gray-900"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Revisión y Aprobación</h1>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 px-4">
            <select
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de personas */}
          <div className="grid gap-6 px-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPersonas.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 font-semibold text-lg py-8">
                No hay personas que coincidan con los filtros.
              </p>
            ) : (
              filteredPersonas.map((persona) => (
                <div
                  key={persona.cedula_emprendedor}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transform transition duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {persona.nombre_completo}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Estado:{" "}
                      <span
                        className={`font-semibold ${
                          persona.estatus === "aprobada"
                            ? "text-green-600"
                            : persona.estatus === "rechazada"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {persona.estatus}
                      </span>
                    </p>
                    {persona.estatus === "rechazada" && (
                      <p className="text-sm text-gray-400 mt-1 italic text-center max-w-xs">
                        Motivo: {persona.motivo_rechazo}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center space-x-3">
                    <button
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-500 transition"
                      onClick={() => verDetalles(persona)}
                    >
                      Ver detalles
                    </button>
                    {persona.estatus !== "aprobada" && (
                      <>
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-500 transition"
                          onClick={() => aprobarPersona(persona.cedula_emprendedor)}
                        >
                          Aprobar
                        </button>
                        <button
                          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-500 transition"
                          onClick={() => rechazarPersona(persona)}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Modal detalles */}
        {modalOpen && personaSeleccionada && (
          <div className=" bg-black/50 backdrop backdrop-opacity-60 fixed inset-0 bg-black bg-opacity-100 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-6xl w-full p-6 relative shadow-xl overflow-y-auto max-h-[90vh]">
              {/* Botón cerrar */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                onClick={cerrarModal}
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Título */}
              <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                Detalles de {personaSeleccionada.nombre_completo}
              </h3>

              {/* Contenido de detalles */}
              {resultado ? (
                Array.isArray(resultado) ? (
                  resultado.map((req, index) => (
                    <div
                      key={index}
                      className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Datos del emprendimiento */}
                      <h4 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">
                        Datos del Emprendimiento
                      </h4>
                      <div className="space-y-2 mb-4">
                        <p>
                          <span className="font-semibold text-gray-600">Nombre:</span>{" "}
                          {req.nombre_emprendimiento}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-600">Sector:</span>{" "}
                          {req.tipo_sector}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-600">Tipo de Negocio:</span>{" "}
                          {req.tipo_negocio}
                        </p>
                      </div>

                      {/* Requerimientos */}
                      <h4 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-700">
                        Requerimientos seleccionados
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto p-2 bg-white rounded-xl border border-gray-200 shadow-inner">
                        {requerimientos.map((r) => (
                          <div
                            key={r.id_requerimientos}
                            className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                          >
                            <label className="inline-flex items-center cursor-pointer mr-2">
                              <input
                                type="checkbox"
                                checked={req.opt_requerimiento?.includes(r.id_requerimientos)}
                                readOnly
                                className="peer sr-only"
                              />
                              <div className="w-11 h-6 bg-gray-300 rounded-full peer-focus:outline-none peer-checked:bg-indigo-600 transition-colors duration-200 relative">
                                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 peer-checked:translate-x-5"></div>
                              </div>
                            </label>
                            <span className="text-gray-700">{r.nombre_requerimiento}</span>
                          </div>
                        ))}
                      </div>

                      {/* Motivo */}
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full table-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border px-4 py-2 text-left text-gray-600 font-semibold">
                                Motivo
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="border px-4 py-3 text-gray-800">{req.motivo}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  // Datos individuales
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300 mb-8 max-w-2xl mx-auto">
                    <h4 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">
                      Detalle del requerimiento
                    </h4>
                    <div className="space-y-2 mb-4">
                      <p>
                        <span className="font-semibold text-gray-600">ID:</span> {resultado.id_req}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-600">Cédula:</span> {resultado.cedula_emprendedor}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-600">Requerimientos:</span>{" "}
                        {Array.isArray(resultado.opt_requerimiento)
                          ? resultado.opt_requerimiento.join(", ")
                          : ""}
                      </p>
                    </div>
                    {/* Motivo */}
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full table-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-4 py-2 text-left text-gray-600 font-semibold">
                              Motivo
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="border px-4 py-3 text-gray-800">{resultado.motivo}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-center text-gray-400 mt-8">Cargando detalles...</p>
              )}
            </div>
          </div>
        )}

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-100 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} &nbsp; <strong>IFEMI & UPTYAB</strong>. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Aprobacion;