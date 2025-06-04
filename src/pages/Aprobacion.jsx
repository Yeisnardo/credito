import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const solicitudesEjemplo = [
  {
    id: 1,
    solicitante: "Juan Pérez",
    monto: 10000,
    estado: "Pendiente",
    contrato: null,
    detalles: {
      emprendimiento: "Tienda de ropa",
      requerimientos: "Documentos, garantías",
    },
  },
  {
    id: 2,
    solicitante: "María Gómez",
    monto: 5000,
    estado: "Pendiente",
    contrato: null,
    detalles: {
      emprendimiento: "Restaurante",
      requerimientos: "Permisos, comprobantes",
    },
  },
];

const Aprobacion = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [solicitudes, setSolicitudes] = useState(solicitudesEjemplo);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [contadorSecuencial, setContadorSecuencial] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const añoActual = new Date().getFullYear().toString().slice(-2);

  // Efecto para ocultar el mensaje de éxito en 2 segundos
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => {
        setMensajeExito("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleVerDetalles = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
  };

  const handleAprobarDesdeLista = (s) => {
    setSolicitudSeleccionada(s);
    setMostrarModal(true);
  };

  const handleAprobar = () => {
    if (solicitudSeleccionada) {
      const numeroSecuencial = String(contadorSecuencial).padStart(3, "0");
      const contratoNumero = `IFEMI/CRED-${numeroSecuencial}/${añoActual}`;

      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === solicitudSeleccionada.id
            ? { ...s, estado: "Aprobado", contrato: contratoNumero }
            : s
        )
      );
      setContadorSecuencial((prev) => prev + 1);
      
      // Usar Swal.fire para la alerta de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Solicitud aprobada!',
        text: `Número de contrato: ${contratoNumero}`,
        timer: 2000,
        showConfirmButton: false,
      });
      
      handleCerrarModal();
    }
  };

  // Filtrar solicitudes según la búsqueda
  const solicitudesFiltradas = solicitudes.filter((s) =>
    s.solicitante.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && <Menu />}

      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header toggleMenu={toggleMenu} />

        <div className="pt-20 px-8">

          {/* Mostrar mensaje de éxito */}
          {mensajeExito && (
            <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
              {mensajeExito}
            </div>
          )}

          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-check-circle text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Aprobación de Solicitud de Crédito
              </h1>
            </div>
          </header>

          {/* Buscador */}
          <div className="mb-6 max-w-4xl mx-auto flex flex-col items-start space-y-2">
            <label
              htmlFor="buscarSolicitante"
              className="text-gray-700 font-semibold"
            >
              Buscar Solicitante
            </label>
            <div className="w-full flex items-center space-x-4">
              <input
                id="buscarSolicitante"
                type="text"
                placeholder="Buscar..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de solicitudes */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {solicitudesFiltradas.map((s) => (
              <div
                key={s.id}
                className="bg-white p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl relative"
              >
                {/* Icono en la tarjeta */}
                <div className="absolute top-4 right-4 text-gray-400 text-xl">
                  <i className="bx bx-user-circle"></i>
                </div>
                <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
                  <i className="bx bx-user text-blue-500"></i>
                  <span>{s.solicitante}</span>
                </h2>
                <p className="mb-2">
                  <strong>Contrato:</strong>{" "}
                  {s.contrato ? s.contrato : "Pendiente"}
                </p>
                {/* Estado con color condicional */}
                <p
                  className={`mb-2 font-semibold ${
                    s.estado === "Pendiente" ? "text-red-600" : "text-green-600"
                  } flex items-center space-x-2`}
                >
                  <i
                    className={`bx ${
                      s.estado === "Pendiente"
                        ? "bx-time"
                        : "bx-check-circle"
                    }`}
                  ></i>
                  <span>{s.estado}</span>
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded flex items-center space-x-2 hover:bg-blue-600 transition"
                    onClick={() => handleVerDetalles(s)}
                  >
                    <i className="bx bx-show"></i>
                    <span>Ver detalles</span>
                  </button>
                  {s.estado === "Pendiente" && (
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded flex items-center space-x-2 hover:bg-green-600 transition"
                      onClick={() => handleAprobarDesdeLista(s)}
                    >
                      <i className="bx bx-check"></i>
                      <span>Aprobar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Modal detalles y aprobación */}
        {mostrarModal && solicitudSeleccionada && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            style={{
              background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
            }}
          >
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-600 text-xl"
                onClick={handleCerrarModal}
              >
                ✖
              </button>
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <i className="bx bx-info-circle"></i>
                <span>Detalles de {solicitudSeleccionada.solicitante}</span>
              </h2>
              <p>
                <strong>Emprendimiento:</strong>{" "}
                {solicitudSeleccionada.detalles.emprendimiento}
              </p>
              <p>
                <strong>Requerimientos:</strong>{" "}
                {solicitudSeleccionada.detalles.requerimientos}
              </p>
              <p>
                <strong>Número de contrato:</strong>{" "}
                {solicitudSeleccionada.contrato
                  ? solicitudSeleccionada.contrato
                  : "Pendiente"}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <span
                  className={`font-semibold ${
                    solicitudSeleccionada.estado === "Pendiente"
                      ? "text-red-600"
                      : "text-green-600"
                  } flex items-center space-x-2`}
                >
                  <i
                    className={`bx ${
                      solicitudSeleccionada.estado === "Pendiente"
                        ? "bx-time"
                        : "bx-check-circle"
                    }`}
                  ></i>
                  <span>{solicitudSeleccionada.estado}</span>
                </span>
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={handleCerrarModal}
                >
                  Cancelar
                </button>
                {/* Botón en modal */}
                {solicitudSeleccionada.estado !== "Aprobado" && (
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-green-700 transition"
                    onClick={handleAprobar}
                  >
                    <i className="bx bx-check"></i>
                    <span>Aprobar y asignar contrato</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Aprobacion;