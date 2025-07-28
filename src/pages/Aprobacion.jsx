import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

import { getRequerimientos } from "../services/api_requerimientos";

import {
  
  getTodosRequerimientosEmprendedor
} from "../services/api_requerimiento_emprendedor";

// Función para cargar personas registradas desde tu API real
const fetchPersonasRegistradas = async () => {
  try {
    const data = await getTodosRequerimientosEmprendedor();
    return data; // Ajusta si tu API devuelve otro formato
  } catch (error) {
    console.error("Error cargando personas registradas:", error);
    return [];
  }
};

// Función para cargar detalles de una persona específica
const fetchDetallesPersona = async (id_req) => {
  try {
    const data = await getTodosRequerimientosEmprendedor(id_req);
    return data; // Ajusta si tu API devuelve array o un objeto
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

  // Carga de requerimientos globales
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

  // Carga de personas registradas
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

  const aprobarPersona = (cedula) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas aprobar a esta persona?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "rounded-lg shadow-lg",
        confirmButton:
          "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg",
        cancelButton:
          "bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Aprobado!",
          text: "La persona ha sido aprobada.",
          icon: "success",
        });
        // Aquí deberías hacer la llamada API para actualizar en backend
        // Y actualizar en frontend
        setPersonasRegistradas((prev) =>
          prev.map((p) =>
            p.cedula_emprendedor === cedula
              ? { ...p, estado: "aprobada" }
              : p
          )
        );
        // Llamada API para actualizar en backend (si corresponde)
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="p-8 flex-1 overflow-y-auto">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transition duration-300 cursor-pointer">
                <i className="bx bx-check-circle text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Revision y aprobacion
              </h1>
            </div>
          </div>

          {/* Lista de personas */}
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Requerimietos y solicitud de credito
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personasRegistradas.length === 0 ? (
              <p className="text-center col-span-full text-gray-500">
                No hay personas registradas.
              </p>
            ) : (
              personasRegistradas.map((persona) => (
                <div
                  key={persona.cedula_emprendedor}
                  className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {persona.nombre_completo}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Estado:{" "}
                      <span
                        className={`font-semibold ${
                          persona.estatus === "aprobada"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {persona.estatus}
                      </span>
                    </p>
                  </div>
                  <div className="flex space-x-3 justify-end">
                    <button
                      className="bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md transition"
                      onClick={() => verDetalles(persona)}
                    >
                      Ver detalles de solicitud
                    </button>
                    {persona.estado !== "aprobada" && (
                      <button
                        className="bg-blue-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                        onClick={() => aprobarPersona(persona.cedula_emprendedor)}
                      >
                        Aprobar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Modal detalles */}
        {modalOpen && personaSeleccionada && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
    <div className="bg-white rounded-xl max-w-5xl w-full p-6 relative shadow-xl overflow-y-auto h-[90vh]">
      
      {/* Botón cerrar */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        onClick={cerrarModal}
        aria-label="Cerrar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Título */}
      <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Detalles de {personaSeleccionada.nombre_completo}
      </h3>

      {/* Contenido */}
      {resultado ? (
        Array.isArray(resultado) ? (
          resultado.map((req, index) => (
            <div key={index} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              
              {/* Datos del emprendimiento */}
              <h4 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Datos del Emprendimiento</h4>
              <div className="space-y-2 mb-4">
                <p>
                  <span className="font-semibold text-gray-600">Nombre del emprendimiento:</span> {req.nombre_emprendimiento}
                </p>
                <p>
                  <span className="font-semibold text-gray-600">Tipo de sector:</span> {req.tipo_sector}
                </p>
                <p>
                  <span className="font-semibold text-gray-600">Tipo de Negocio:</span> {req.tipo_negocio}
                </p>
              </div>

              {/* Requerimientos visuales */}
              <h4 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Requerimientos seleccionados</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto p-2 bg-white rounded-xl shadow-inner border border-gray-200">
                {requerimientos.map((r) => (
                  <div key={r.id_requerimientos} className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
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
                    <label className="text-gray-700">{r.nombre_requerimiento}</label>
                  </div>
                ))}
              </div>

              {/* Tabla motivo */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full table-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left text-gray-600 font-semibold">Motivo</th>
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
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 max-w-2xl mx-auto">
            <h4 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Detalle del requerimiento</h4>
            <div className="space-y-2 mb-4">
              <p>
                <span className="font-semibold text-gray-600">ID:</span> {resultado.id_req}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Cédula:</span> {resultado.cedula_emprendedor}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Requerimientos:</span> {Array.isArray(resultado.opt_requerimiento) ? resultado.opt_requerimiento.join(", ") : ""}
              </p>
            </div>

            {/* Tabla motivo */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full table-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-left text-gray-600 font-semibold">Motivo</th>
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
        <p className="text-center text-gray-500 mt-8">Cargando detalles...</p>
      )}
    </div>
  </div>
)}

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Aprobacion;