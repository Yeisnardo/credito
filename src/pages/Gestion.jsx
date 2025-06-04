import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

// Datos ejemplo
const solicitudesEjemplo = [
  {
    id: 1,
    solicitante: "Juan Pérez",
    monto: 10000,
    montoDepositado: 0,
    estado: "Aprobado",
    contrato: "IFEMI/CRED-001/23",
    detalles: {
      emprendimiento: "Tienda de ropa",
      requerimientos: "Documentos, garantías",
    },
    depositos: [],
  },
  {
    id: 2,
    solicitante: "María Gómez",
    monto: 5000,
    montoDepositado: 0,
    estado: "Pendiente",
    contrato: null,
    detalles: {
      emprendimiento: "Restaurante",
      requerimientos: "Permisos, comprobantes",
    },
    depositos: [],
  },
];

const Depositos = () => {
  const navigate = useNavigate();

  // Estados
  const [menuOpen, setMenuOpen] = useState(true);
  const [solicitudes, setSolicitudes] = useState(solicitudesEjemplo);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mostrarModalDepositar, setMostrarModalDepositar] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [contadorSecuencial, setContadorSecuencial] = useState(2);

  const añoActual = new Date().getFullYear().toString().slice(-2);

  // Variables de conversión y cálculos
  const tasaEuroBCV = 104.51;
  const [montoEuroIngresado, setMontoEuroIngresado] = useState("");
  const [montoBsCalculado, setMontoBsCalculado] = useState(0);
  const [montoACancelar, setMontoACancelar] = useState(0);
  const [monto10Porciento, setMonto10Porciento] = useState(0);
  const [montoDevolver, setMontoDevolver] = useState(0);
  const [referenciaBancaria, setReferenciaBancaria] = useState("");
  const [fechaPago, setFechaPago] = useState("");

  // Actualiza cálculos en tiempo real
  useEffect(() => {
    const euroNum = parseFloat(montoEuroIngresado);
    if (!isNaN(euroNum) && euroNum > 0) {
      setMontoBsCalculado(euroNum * tasaEuroBCV);
      setMontoACancelar(euroNum / 18);
      const diezPorc = euroNum * 0.10;
      setMonto10Porciento(diezPorc);
      setMontoDevolver(euroNum + diezPorc);
    } else {
      setMontoBsCalculado(0);
      setMontoACancelar(0);
      setMonto10Porciento(0);
      setMontoDevolver(0);
    }
  }, [montoEuroIngresado]);

  // Oculta mensaje de éxito tras 2 segundos
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  // Funciones
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleVerDetalles = (s) => {
    setSolicitudSeleccionada(s);
    setMostrarModalDetalles(true);
  };

  const handleCerrarModalDetalles = () => setMostrarModalDetalles(false);

  const handleAprobar = () => {
    if (solicitudSeleccionada) {
      const secuencialStr = String(contadorSecuencial).padStart(3, "0");
      const contratoNumero = `IFEMI/CRED-${secuencialStr}/${añoActual}`;

      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === solicitudSeleccionada.id
            ? { ...s, estado: "Aprobado", contrato: contratoNumero, montoDepositado: 0 }
            : s
        )
      );
      setContadorSecuencial((prev) => prev + 1);

      Swal.fire({
        icon: "success",
        title: "¡Solicitud aprobada!",
        text: `Número de contrato: ${contratoNumero}`,
        timer: 2000,
        showConfirmButton: false,
      });
      handleCerrarModalDetalles();
    }
  };

  const handleAbrirDeposito = (s) => {
    setSolicitudSeleccionada(s);
    setMontoEuroIngresado("");
    setReferenciaBancaria("");
    setFechaPago(new Date().toLocaleDateString());
    setMostrarModalDepositar(true);
  };

  const handleCerrarModalDepositar = () => {
    setMostrarModalDepositar(false);
    setMontoEuroIngresado("");
    setReferenciaBancaria("");
  };

  const handleDepositar = () => {
    if (!solicitudSeleccionada) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha seleccionado ninguna solicitud.",
      });
      return;
    }

    const monto = parseFloat(montoEuroIngresado);
    if (isNaN(monto) || monto <= 0) {
      Swal.fire({
        icon: "error",
        title: "Monto inválido",
        text: "Por favor ingresa un monto válido en euros mayor a cero.",
      });
      return;
    }
    if (!/^\d{5}$/.test(referenciaBancaria)) {
      Swal.fire({
        icon: "error",
        title: "Referencia inválida",
        text: "Por favor ingresa los últimos 5 dígitos de la referencia bancaria.",
      });
      return;
    }

    // Añadir depósito con estado 'no confirmado'
    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === solicitudSeleccionada.id
          ? {
              ...s,
              montoDepositado: s.montoDepositado + monto,
              depositos: [
                ...s.depositos,
                { monto, fecha: fechaPago, referenciaBancaria, confirmado: false },
              ],
            }
          : s
      )
    );

    // Mostrar mensaje de éxito
    setMensajeExito(`Has depositado ${monto} € (Bs.${montoBsCalculado.toFixed(2)})`);

    // Cerrar modal
    handleCerrarModalDepositar();
  };

  const handleConfirmarDeposito = (index) => {
    setSolicitudes((prev) =>
      prev.map((s) => {
        if (s.id !== solicitudSeleccionada.id) return s;
        const nuevosDepositos = s.depositos.map((dep, i) => {
          if (i !== index) return dep;
          return { ...dep, confirmado: true };
        });
        return { ...s, depositos: nuevosDepositos };
      })
    );
  };

  const solicitudesAprobadas = solicitudes.filter((s) => s.estado === "Aprobado");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header toggleMenu={toggleMenu} />

        <div className="pt-20 px-8">
          {/* Mensaje de éxito */}
          {mensajeExito && (
            <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">{mensajeExito}</div>
          )}

          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-credit-card text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Gestor de Créditos y Depósitos</h1>
            </div>
          </header>

          {/* Lista de solicitudes aprobadas */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Solicitudes Aprobadas para Depositar</h2>
            {solicitudesAprobadas.length === 0 ? (
              <p>No hay solicitudes aprobadas aún.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {solicitudesAprobadas.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl relative"
                  >
                    <div className="absolute top-4 right-4 text-gray-400 text-xl">
                      <i className="bx bx-user-circle"></i>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
                      <i className="bx bx-user text-blue-500"></i>
                      <span>{s.solicitante}</span>
                    </h2>
                    <p className="mb-2">
                      <strong>Contrato:</strong> {s.contrato}
                    </p>
                    <p className="mb-2">
                      <strong>Monto total:</strong> {s.monto}
                    </p>
                    <p className="mb-2">
                      <strong>Monto depositado:</strong> {s.montoDepositado}
                    </p>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded flex items-center space-x-2 hover:bg-blue-600 transition"
                        onClick={() => handleVerDetalles(s)}
                      >
                        <i className="bx bx-show"></i>
                        <span>Ver detalles</span>
                      </button>
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded flex items-center space-x-2 hover:bg-green-600 transition"
                        onClick={() => handleAbrirDeposito(s)}
                      >
                        <i className="bx bx-dollar-circle"></i>
                        <span>Depositar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Modal detalles */}
          {mostrarModalDetalles && solicitudSeleccionada && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              style={{
                background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative overflow-y-auto max-h-full">
                <button
                  className="absolute top-2 right-2 text-gray-600 text-xl"
                  onClick={handleCerrarModalDetalles}
                >
                  ✖
                </button>
                <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <i className="bx bx-info-circle"></i>
                  <span>Detalles de {solicitudSeleccionada.solicitante}</span>
                </h2>
                {/* Datos */}
                <p>
                  <strong>Emprendimiento:</strong> {solicitudSeleccionada.detalles.emprendimiento}
                </p>
                <p>
                  <strong>Requerimientos:</strong> {solicitudSeleccionada.detalles.requerimientos}
                </p>
                <p>
                  <strong>Número de contrato:</strong> {solicitudSeleccionada.contrato}
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
                <p>
                  <strong>Monto total:</strong> {solicitudSeleccionada.monto}
                </p>
                <p>
                  <strong>Monto depositado:</strong> {solicitudSeleccionada.montoDepositado}
                </p>

                {/* Historial de depósitos */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Historial de depósitos</h3>
                  {solicitudSeleccionada.depositos.length === 0 ? (
                    <p>No hay depósitos realizados aún.</p>
                  ) : (
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-2 py-1">Monto</th>
                          <th className="border border-gray-300 px-2 py-1">Fecha</th>
                          <th className="border border-gray-300 px-2 py-1">Referencia</th>
                          {/* Nueva columna */}
                          <th className="border border-gray-300 px-2 py-1">Confirmación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudSeleccionada.depositos.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="border border-gray-300 px-2 py-1 text-center">
                              No hay depósitos realizados aún.
                            </td>
                          </tr>
                        ) : (
                          solicitudSeleccionada.depositos.map((dep, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 px-2 py-1 text-center">{dep.monto}</td>
                              <td className="border border-gray-300 px-2 py-1">{dep.fecha}</td>
                              <td className="border border-gray-300 px-2 py-1">{dep.referenciaBancaria || "-"}</td>
                              {/* Confirmación */}
                              <td className="border border-gray-300 px-2 py-1 text-center">
                                {dep.confirmado ? (
                                  <span className="text-green-600 font-semibold">Confirmado</span>
                                ) : (
                                  <button
                                    className="bg-red-400 text-white px-2 py-1 rounded text-sm"
                                    onClick={() => handleConfirmarDeposito(index)}
                                  >
                                    Deposito no Confirmado
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Acciones */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={handleCerrarModalDetalles}
                  >
                    Cancelar
                  </button>
                  {solicitudSeleccionada.estado === "Aprobado" && (
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-green-700 transition"
                      onClick={() => handleAbrirDeposito(solicitudSeleccionada)}
                    >
                      <i className="bx bx-dollar-circle"></i>
                      <span>Depositar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal para ingresar monto en euros */}
          {mostrarModalDepositar && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              style={{
                background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-600 text-xl"
                  onClick={handleCerrarModalDepositar}
                >
                  ✖
                </button>
                <h2 className="text-xl font-bold mb-4">Ingresa monto en euros</h2>
                {/* Input monto en euros */}
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Monto en euros"
                  value={montoEuroIngresado}
                  onChange={(e) => setMontoEuroIngresado(e.target.value)}
                />
                {/* Input referencia bancaria */}
                <input
                  type="text"
                  maxLength={5}
                  pattern="\d{5}"
                  className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Últimos 5 dígitos referencia bancaria"
                  value={referenciaBancaria}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setReferenciaBancaria(val.slice(0, 5));
                  }}
                />
                {/* Cálculos */}
                <div className="mb-4">
                  <p>
                    <strong>Monto en euros:</strong> €{montoEuroIngresado || "0"}
                  </p>
                  <p>
                    <strong>Equivale en Bs.:</strong> Bs.{montoBsCalculado.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  </p>
                  <p>
                    <strong>Monto a cancelar (€/18):</strong> €{montoACancelar.toFixed(2)}
                  </p>
                  <p>
                    <strong>10% del monto:</strong> €{monto10Porciento.toFixed(2)}
                  </p>
                  <p>
                    <strong>Monto a devolver:</strong> €{montoDevolver.toFixed(2)}
                  </p>
                  <p>
                    <strong>Fecha de pago:</strong> {fechaPago}
                  </p>
                </div>
                {/* Botones */}
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={handleCerrarModalDepositar}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-green-700 transition"
                    onClick={handleDepositar}
                  >
                    <i className="bx bx-dollar"></i>
                    <span>Depositar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Depositos;