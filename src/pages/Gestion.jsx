import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getCreditos } from "../services/api_credito"; // Asegúrate que funciona

const Gestion = () => {
  const navigate = useNavigate();

  // Estados
  const [menuOpen, setMenuOpen] = useState(true);
  const [personasAprobadas, setPersonasAprobadas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]); // Si tienes solicitudes en tu sistema
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mostrarModalDepositar, setMostrarModalDepositar] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [contadorSecuencial, setContadorSecuencial] = useState(2);

  // Variables de fecha y cálculo
  const añoActual = new Date().getFullYear().toString().slice(-2);
  const tasaEuroBCV = 104.51;

  const [montoEuroIngresado, setMontoEuroIngresado] = useState("");
  const [montoBsCalculado, setMontoBsCalculado] = useState(0);
  const [montoACancelar, setMontoACancelar] = useState(0);
  const [monto10Porciento, setMonto10Porciento] = useState(0);
  const [montoDevolver, setMontoDevolver] = useState(0);
  const [referenciaBancaria, setReferenciaBancaria] = useState("");
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  const [fechaDesde, setFechaDesde] = useState(new Date());
  const [fechaHasta, setFechaHasta] = useState(null);

  // Cargar créditos aprobados
  useEffect(() => {
    const fetchAprobadas = async () => {
      try {
        const data = await getCreditos();
        console.log("Datos cargados:", data); // Ver qué campos vienen
        setPersonasAprobadas(data);
      } catch (error) {
        console.error("Error cargando personas aprobadas:", error);
      }
    };
    fetchAprobadas();
  }, []);

  // Filtrar solicitudes aprobadas (si tienes solicitudes)
  const solicitudesAprobadas = solicitudes.filter((s) =>
    personasAprobadas.some((p) => p.cedula === s.cedula)
  );

  // Calcular fecha hasta (18 semanas después)
  useEffect(() => {
    const fecha = new Date(fechaDesde);
    fecha.setDate(fecha.getDate() + 18 * 7);
    setFechaHasta(fecha);
  }, [fechaDesde]);

  // Funciones de interfaz
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
      setSolicitudes(prev =>
        prev.map((s) =>
          s.id === solicitudSeleccionada.id
            ? {
                ...s,
                estado: "Aprobado",
                contrato: contratoNumero,
                montoDepositado: 0,
              }
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

  // Modal depósito
  const handleAbrirDeposito = (s) => {
    setSolicitudSeleccionada(s);
    setMontoEuroIngresado("");
    setReferenciaBancaria("");
    setFechaPago(new Date().toISOString().slice(0, 10));
    setMostrarModalDepositar(true);
  };

  const handleCerrarModalDepositar = () => {
    setMostrarModalDepositar(false);
    setMontoEuroIngresado("");
    setReferenciaBancaria("");
  };

  // Simula API depósito
  const enviarDeposito = async (depositoData) => {
    try {
      // Aquí deberías llamar a tu API real, por ejemplo:
      // await api.createCredito(depositoData);
      Swal.fire({ icon: "success", title: "Deposito registrado" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Error al registrar depósito" });
    }
  };

  const handleDepositar = async () => {
    if (!solicitudSeleccionada) {
      Swal.fire({ icon: "error", title: "Error", text: "No se ha seleccionado ninguna solicitud." });
      return;
    }

    const monto = parseFloat(montoEuroIngresado);
    if (isNaN(monto) || monto <= 0) {
      Swal.fire({ icon: "error", title: "Monto inválido", text: "Ingresa un monto válido en euros mayor a cero." });
      return;
    }

    if (!/^\d{5}$/.test(referenciaBancaria)) {
      Swal.fire({ icon: "error", title: "Referencia inválida", text: "Ingresa los últimos 5 dígitos de la referencia bancaria." });
      return;
    }

    const depositoData = {
      cedula_credito: solicitudSeleccionada.cedula,
      referencia: referenciaBancaria,
      monto_euros: monto,
      monto_bs: parseFloat(montoBsCalculado.toFixed(2)),
      diez_euros: parseFloat(monto10Porciento.toFixed(2)),
      fecha_desde: fechaDesde.toISOString().slice(0, 10),
      fecha_hasta: fechaHasta ? fechaHasta.toISOString().slice(0, 10) : null,
      fecha_pago: fechaPago,
    };

    await enviarDeposito(depositoData);
    handleCerrarModalDepositar();
    setMensajeExito(`Has depositado ${monto} € (Bs.${montoBsCalculado.toFixed(2)})`);
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

  // Render
  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header toggleMenu={toggleMenu} />

        <div className="pt-20 px-8">
          {/* Mensaje */}
          {mensajeExito && (
            <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
              {mensajeExito}
            </div>
          )}

          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-credit-card text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestor de Créditos
              </h1>
            </div>
          </header>

          {/* Solicitudes aprobadas */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Solicitudes Aprobadas para Depositar</h2>
            {personasAprobadas.length === 0 ? (
              <p>No hay solicitudes aprobadas aún.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {personasAprobadas.map((s) => (
                  <div
                    key={s.cedula}
                    className="bg-white p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl relative"
                  >
                    {/* Icono */}
                    <div className="absolute top-4 right-4 text-gray-400 text-xl">
                      <i className="bx bx-user-circle"></i>
                    </div>
                    {/* Datos */}
                    <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
                      <i className="bx bx-user text-blue-500"></i>
                      <span>{s.nombre_apellido || s.nombre_completo || s.cedula}</span>
                    </h2>
                    <p className="mb-2">
                      <strong>Contrato:</strong> {s.contrato}
                    </p>
                    <p className="mb-2">
                      <strong>Monto en Euros:</strong> {s.monto_euros}
                    </p>
                    <p className="mb-2">
                      <strong>Monto en Bs:</strong> {s.monto_bs}
                    </p>
                    <p className="mb-2">
                      <strong>Monto depositado:</strong> {s.montoDepositado}
                    </p>
                    {/* Botones */}
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
                {/* Botón cerrar */}
                <button
                  className="absolute top-2 right-2 text-gray-600 text-xl"
                  onClick={handleCerrarModalDetalles}
                >
                  ✖
                </button>
                {/* Título */}
                <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <i className="bx bx-info-circle"></i>
                  <span>Detalles de {solicitudSeleccionada.nombre_apellido}</span>
                </h2>
                {/* Datos */}
                <p>
                  <strong>Emprendimiento:</strong>{" "}
                  {solicitudSeleccionada.detalles?.emprendimiento || "-"}
                </p>
                <p>
                  <strong>Requerimientos:</strong>{" "}
                  {solicitudSeleccionada.detalles?.requerimientos || "-"}
                </p>
                <p>
                  <strong>Número de contrato:</strong>{" "}
                  {solicitudSeleccionada.contrato}
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      solicitudSeleccionada.estado === "Pendiente"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    <i
                      className={`bx ${
                        solicitudSeleccionada.estado === "Pendiente"
                          ? "bx-time"
                          : "bx-check-circle"
                      }`}
                    ></i>
                    {solicitudSeleccionada.estado}
                  </span>
                </p>
                <p>
                  <strong>Monto en Euros:</strong> {solicitudSeleccionada.monto_euros}
                </p>
                <p>
                  <strong>Monto en Bs:</strong> {solicitudSeleccionada.monto_bs}
                </p>

                {/* Historial de depósitos */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Historial de depósitos
                  </h3>
                  {solicitudSeleccionada.depositos?.length === 0 ? (
                    <p>No hay depósitos realizados aún.</p>
                  ) : (
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-2 py-1">Monto en Euros</th>
                          <th className="border border-gray-300 px-2 py-1">Fecha</th>
                          <th className="border border-gray-300 px-2 py-1">Referencia</th>
                          <th className="border border-gray-300 px-2 py-1">Confirmación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudSeleccionada.depositos?.map((dep, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-2 py-1 text-center">{dep.monto_euros}</td>
                            <td className="border border-gray-300 px-2 py-1">{dep.fecha}</td>
                            <td className="border border-gray-300 px-2 py-1">{dep.referenciaBancaria || "-"}</td>
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
                        ))}
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

          {/* Modal monto en euros */}
          {mostrarModalDepositar && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              style={{
                background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
              }}
            >
              <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full relative">
                {/* Cerrar */}
                <button
                  className="absolute top-2 right-2 text-gray-600 text-xl"
                  onClick={handleCerrarModalDepositar}
                >
                  ✖
                </button>
                {/* Título */}
                <h2 className="text-xl font-bold mb-4">Ingresa monto en euros</h2>
                {/* Fechas */}
                <div className="mb-4">
                  <p>
                    <strong>Fecha Desde:</strong> {fechaDesde.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Fecha Hasta (18 semanas):</strong>{" "}
                    {fechaHasta ? fechaHasta.toLocaleDateString() : "-"}
                  </p>
                </div>
                {/* Input monto en euros */}
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Monto en euros"
                  value={montoEuroIngresado}
                  onChange={(e) => setMontoEuroIngresado(e.target.value)}
                />
                {/* Referencia bancaria */}
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
                    <strong>Monto en euros:</strong> € {montoEuroIngresado || "0"}
                  </p>
                  <p>
                    <strong>Equivale en Bs.:</strong> Bs.{" "}
                    {montoBsCalculado.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>Monto a cancelar (€/18):</strong> €{" "}
                    {montoACancelar.toFixed(2)}
                  </p>
                  <p>
                    <strong>10% del monto:</strong> € {monto10Porciento.toFixed(2)}
                  </p>
                  <p>
                    <strong>Monto a devolver:</strong> € {montoDevolver.toFixed(2)}
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

export default Gestion;