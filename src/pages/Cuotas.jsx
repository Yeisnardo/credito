import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Cuotas = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Estado de cuotas con campo 'cayo'
  const [cuotas, setCuotas] = useState([
    { id: 1, monto: 100, descripcion: "Cuota 1", pagada: false, cayo: false },
    { id: 2, monto: 200, descripcion: "Cuota 2", pagada: false, cayo: false },
  ]);

  const [semanas, setSemanas] = useState([
    { semana: 1, oportunidad: 1, pagada: false, cuotaId: 1 },
    { semana: 2, oportunidad: 1, pagada: false, cuotaId: 2 },
    { semana: 3, oportunidad: 2, pagada: false, cuotaId: null },
    { semana: 4, oportunidad: 2, pagada: false, cuotaId: null },
  ]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [referencia, setReferencia] = useState("");
  const [fechaPago, setFechaPago] = useState("");

  useEffect(() => {
    // Simulación de carga
    const fetchUserData = async () => {
      try {
        const response = await api.getUsers();
        if (response.length > 0) {
          setUser(response[0]);
        }
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };
    fetchUserData();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const abrirModalPagarCuota = (cuota) => {
    setCuotaSeleccionada(cuota);
    setReferencia("");
    setFechaPago("");
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const enviarPago = () => {
    if (referencia && fechaPago && cuotaSeleccionada) {
      const confirmacion = window.confirm(
        `¿Confirma que desea marcar la cuota "${cuotaSeleccionada.descripcion}" como pagada?`
      );
      if (confirmacion) {
        setCuotas((prev) =>
          prev.map((c) =>
            c.id === cuotaSeleccionada.id ? { ...c, pagada: true } : c
          )
        );
        setSemanas((prev) =>
          prev.map((s) =>
            s.cuotaId === cuotaSeleccionada.id ? { ...s, pagada: true } : s
          )
        );
        cerrarModal();
      }
    } else {
      alert("Por favor ingresa referencia y fecha de pago");
    }
  };

  const confirmarCayo = (id) => {
    setCuotas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, cayo: true } : c))
    );
  };

  const semanasNoPagadas = semanas.filter((s) => !s.pagada);
  const saldoRestante = cuotas
    .filter((c) => !c.pagada)
    .reduce((acc, c) => acc + c.monto, 0);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans overflow-hidden">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <div className="p-8 pt-24 w-full mx-auto">
          {/* Encabezado */}
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg text-white flex items-center justify-center">
              <i className="bx bx-wallet text-3xl"></i>
            </div>
            <h1 className="ml-4 text-4xl font-bold text-gray-700">
              Mis Cuotas
            </h1>
          </div>

          {/* Tarjeta de cuotas */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 text-gray-700">
              Listado de Cuotas
            </h2>
            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-md">
                <thead className="bg-gray-50 rounded-t-lg">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 rounded-tl-lg">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Pagada
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Confirmacion
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cuotas.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 border-b border-gray-200">{c.id}</td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        ${c.monto}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        {c.descripcion}
                      </td>
                      {/* Estado Pagada */}
                      <td className="px-4 py-3 border-b border-gray-200">
                        {!c.pagada ? (
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full shadow-md text-sm transition-transform hover:scale-105"
                            onClick={() => abrirModalPagarCuota(c)}
                          >
                            Pagar
                          </button>
                        ) : (
                          <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full shadow-sm transition hover:bg-green-200 cursor-default">
                            Pagada
                          </span>
                        )}
                      </td>
                      {/* Estado "Cayó" */}
                      <td className="px-4 py-3 border-b border-gray-200 text-center cursor-pointer">
                        {c.cayo ? (
                          <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full shadow-sm transition cursor-default">
                            Confirmado
                          </span>
                        ) : (
                          <span
                            className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 border border-yellow-200 rounded-full shadow-sm transition cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmarCayo(c.id);
                            }}
                          >
                            En espera
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Secciones adicionales */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Semanas no pagadas */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Semanas no pagadas
              </h3>
              {semanasNoPagadas.length === 0 ? (
                <p className="text-green-600 font-semibold">
                  ¡Todas las semanas están pagadas!
                </p>
              ) : (
                <ul className="list-disc list-inside text-gray-700">
                  {semanasNoPagadas.map((s, index) => (
                    <li key={index}>
                      Semana {s.semana} - Oportunidad {s.oportunidad}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Resumen y saldo */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Resumen de Cuotas
              </h3>
              <ul className="mb-4">
                {cuotas.map((c) => (
                  <li key={c.id} className="mb-2">
                    <span className="font-semibold">{c.descripcion}:</span>{" "}
                    Monto ${c.monto} - Estado:{" "}
                    {c.pagada ? "Pagada" : "Pendiente"}
                  </li>
                ))}
              </ul>
              <p className="text-lg font-semibold text-gray-800">
                Saldo restante:{" "}
                <span className="text-red-600">${saldoRestante}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal pagar cuota */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 md:p-8 animate__animated animate__fadeIn">
              <h3 className="text-2xl font-semibold mb-4 text-gray-700">
                Pagar Cuota
              </h3>
              <p className="mb-4 text-gray-600">
                Cuota:{" "}
                <span className="font-semibold">
                  {cuotaSeleccionada?.descripcion}
                </span>{" "}
                - Monto:{" "}
                <span className="font-semibold">
                  ${cuotaSeleccionada?.monto}
                </span>
              </p>
              <div className="mb-4">
                <label className="block mb-1 text-gray-600">Referencia</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-gray-600">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  onClick={enviarPago}
                >
                  Pagar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-100 border-t border-gray-300 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Cuotas;
