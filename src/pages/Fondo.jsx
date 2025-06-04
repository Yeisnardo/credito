import { useState } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Swal from "sweetalert2";

const Fondo = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [fondoCapital, setFondoCapital] = useState(0);
  const tasaCambio = 4.5; // 1 dólar = 4.5 Bs

  // Estados de modales
  const [mostrarModalFondo, setMostrarModalFondo] = useState(false);
  const [montoFondo, setMontoFondo] = useState("");
  const [mostrarModalInspeccion, setMostrarModalInspeccion] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [montoAsignar, setMontoAsignar] = useState("");
  const [mostrarModalFormulario, setMostrarModalFormulario] = useState(false);
  const [formEmprendimiento, setFormEmprendimiento] = useState("");
  const [formMonto, setFormMonto] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Funciones de apertura y cierre de modales
  const handleAbrirModalFondo = () => setMostrarModalFondo(true);
  const handleCerrarModalFondo = () => {
    setMostrarModalFondo(false);
    setMontoFondo("");
  };

  const handleAgregarFondo = () => {
    const montoTotal = parseFloat(montoFondo);
    if (isNaN(montoTotal) || montoTotal <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }
    setFondoCapital(fondoCapital + montoTotal);
    handleCerrarModalFondo();
  };

  const handleCerrarModal = () => {
    setMostrarModalFormulario(false);
    setFormEmprendimiento("");
    setFormMonto("");
  };

  const handleEnviarFormulario = () => {
    const montoTotal = parseFloat(formMonto);
    if (isNaN(montoTotal) || montoTotal <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }
    if (!formEmprendimiento.trim()) {
      alert("Por favor ingresa un nombre de emprendimiento válido");
      return;
    }
    if (fondoCapital < montoTotal) {
      alert("Fondo insuficiente para asignar");
      return;
    }
    const nuevoRegistro = {
      id: Date.now(),
      emprendimiento: formEmprendimiento.trim(),
      fondoAsignado: montoTotal,
      fecha: new Date().toLocaleString(),
    };
    setRegistros([nuevoRegistro, ...registros]);
    setFondoCapital(fondoCapital - montoTotal);
    handleCerrarModal();
  };

  const handleInspeccionar = (registro) => {
    setRegistroSeleccionado(registro);
    setMontoAsignar("");
    setMostrarModalInspeccion(true);
  };

  const handleCerrarInspeccion = () => {
    setMostrarModalInspeccion(false);
    setRegistroSeleccionado(null);
  };

  const registrosFiltrados = registros.filter((reg) =>
    reg.emprendimiento.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAsignarDesdeInspeccion = () => {
    const monto = parseFloat(montoAsignar);
    if (isNaN(monto) || monto <= 0) {
      alert("Ingresa un monto válido");
      return;
    }
    if (fondoCapital < monto) {
      alert("Fondo insuficiente");
      return;
    }
    setFondoCapital(fondoCapital - monto);
    const nuevosRegistros = registros.map((reg) => {
      if (reg.id === registroSeleccionado.id) {
        return {
          ...reg,
          fondoAsignado: reg.fondoAsignado + monto,
        };
      }
      return reg;
    });
    setRegistros(nuevosRegistros);
    handleCerrarInspeccion();
  };

  const handleAbrirFormulario = () => setMostrarModalFormulario(true);
  const handleCerrarFormulario = () => {
    setMostrarModalFormulario(false);
    setFormEmprendimiento("");
    setFormMonto("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {isMenuOpen && <Menu />}
      <div className={`flex-1 flex flex-col ${isMenuOpen ? "ml-0 md:ml-64" : "ml-0"}`}>
        <Header toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

        <main className="pt-20 px-8 flex-1 flex-col">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-money-withdraw text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestión de Fondo Financiero de Créditos
              </h1>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out hover:shadow-xl">
              <div className="p-6 flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-[#07142A]">
                    Fondo General en Bolívares
                  </h2>
                  <p className="text-gray-700 mb-2">
                    Saldo Disponible: {fondoCapital.toFixed(2)} Bs
                  </p>
                  <button
                    onClick={handleAbrirModalFondo}
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                  >
                    Agregar Fondo
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="mb-6 max-w-4xl mx-auto flex items-center space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z"
                  />
                </svg>
              </div>
            </div>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full shadow-lg transition"
              onClick={handleAbrirFormulario}
            >
              + Asignar fondo a Emprendimiento
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white max-w-4xl mx-auto mb-20">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: "ID", key: "id" },
                    { label: "Nombre", key: "emprendimiento" },
                    { label: "Fondo Asignado", key: "fondoAsignado" },
                    { label: "Fecha", key: "fecha" },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      className="px-4 py-3 cursor-pointer select-none text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between">{label}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-gray-700 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrosFiltrados.length > 0 ? (
                  registrosFiltrados.map((item) => (
                    <tr key={item.id} className="transition hover:bg-gray-100">
                      <td className="px-4 py-3 text-center text-gray-600">{item.id}</td>
                      <td className="px-4 py-3 text-gray-700">{item.emprendimiento}</td>
                      <td className="px-4 py-3 text-gray-700">{item.fondoAsignado.toFixed(2)} Bs</td>
                      <td className="px-4 py-3">{item.fecha}</td>
                      <td className="px-4 py-3 flex justify-center space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleInspeccionar(item)}
                          aria-label="Detalle"
                        >
                          <i className="bx bx-align-left text-xl"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500 font-semibold">
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* Modal para agregar fondo */}
        {mostrarModalFondo && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4">Agregar Fondo</h2>
              <input
                type="number"
                value={montoFondo}
                onChange={(e) => setMontoFondo(e.target.value)}
                placeholder="Monto a agregar"
                className="border border-gray-300 p-2 rounded w-full mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCerrarModalFondo}
                  className="bg-gray-300 py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAgregarFondo}
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para inspección y asignación */}
        {mostrarModalInspeccion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full overflow-y-auto max-h-full">
              <h2 className="text-xl font-semibold mb-4">Detalle del Registro</h2>
              {registroSeleccionado && (
                <div>
                  <p>
                    <strong>Emprendimiento:</strong> {registroSeleccionado.emprendimiento}
                  </p>
                  <p>
                    <strong>Monto:</strong> {registroSeleccionado.monto.toFixed(2)} Bs
                  </p>
                  <p>
                    <strong>Fondo Asignado:</strong> {registroSeleccionado.fondoAsignado.toFixed(2)} Bs
                  </p>
                  <div className="mt-4">
                    <label className="block mb-1 font-semibold">Monto a Asignar</label>
                    <input
                      type="number"
                      value={montoAsignar}
                      onChange={(e) => setMontoAsignar(e.target.value)}
                      placeholder="Monto"
                      className="border border-gray-300 p-2 rounded w-full"
                    />
                  </div>
                  <button
                    onClick={handleAsignarDesdeInspeccion}
                    className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
                  >
                    Confirmar Asignación
                  </button>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCerrarInspeccion}
                  className="bg-gray-300 py-2 px-4 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para formulario de asignar fondo a emprendimiento */}
        {mostrarModalFormulario && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Asignar Fondo a Emprendimiento</h2>
              <input
                type="text"
                value={formEmprendimiento}
                onChange={(e) => setFormEmprendimiento(e.target.value)}
                placeholder="Nombre del Emprendimiento"
                className="border border-gray-300 p-2 rounded w-full mb-4"
              />
              <input
                type="number"
                value={formMonto}
                onChange={(e) => setFormMonto(e.target.value)}
                placeholder="Monto"
                className="border border-gray-300 p-2 rounded w-full mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCerrarFormulario}
                  className="bg-gray-300 py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarFormulario}
                  className="bg-green-500 text-white py-2 px-4 rounded"
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Fondo;

