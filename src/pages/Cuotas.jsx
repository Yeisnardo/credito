import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from "../services/api_usuario";
import { getContratoPorId, registrarCuota } from "../services/api_cuotas";

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [stats, setStats] = useState({
    creditosActivos: 0,
    proximosPagos: 0,
    mensajesNoLeidos: 3,
  });
  const [mensaje, setMensaje] = useState("");
  const [cuotas, setCuotas] = useState([]);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    cantidadSemanas: "",
    monto_semnal: "",
    semana: "",
    fecha_desde: "",
    fecha_hasta: "",
    estado: "Pendiente",
    diasMora: "0",
    interesAcumulado: "0",
    confirmacionIFEMI: "Pendiente",
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [semanasFormulario, setSemanasFormulario] = useState([
    "2023-W45",
    "2023-W46",
    "2023-W47",
    "2023-W48",
  ]);
  const [loading, setLoading] = useState(false);

  // Variables de configuración
  const idConfiguracion = "TU_ID_CONFIGURACION"; // reemplaza con tu valor
  const id_cuota_c = "TU_ID_CUOTA"; // reemplaza con tu valor

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            const contrato = await getContratoPorId(cedula);
            if (contrato && contrato.cuotas) {
              setCuotas(contrato.cuotas);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  const handleChangeMonto = (e) => {
    setFormData({ ...formData, monto_semnal: parseFloat(e.target.value) });
  };

  const handleChangeCantidadSemanas = (e) => {
    const cantidad = parseInt(e.target.value);
    setFormData({ ...formData, cantidadSemanas: cantidad });
    if (cantidad > semanasFormulario.length) {
      const adicionales = Array(cantidad - semanasFormulario.length).fill("");
      setSemanasFormulario((prev) => [...prev, ...adicionales]);
    } else {
      setSemanasFormulario((prev) => prev.slice(0, cantidad));
    }
  };

  const handleGenerarCuotas = async () => {
    setLoading(true);
    setMensaje("");

    try {
      if (semanasFormulario.some((semana) => !semana.trim())) {
        setMensaje("Error: Todas las semanas deben tener un valor");
        setLoading(false);
        return;
      }

      // Preparar el payload con solo los campos específicos
      const cuotasPayload = semanasFormulario.map((semana, index) => ({
        id_cuota_c: `CUOTA-${Date.now()}-${index}`,
        cedula_emprendedor: user?.cedula,
        idConfiguracion: "1",
        semana: `Cuota correspondiente a la semana ${semana}`,
        monto_euros: formData.monto_semnal,
        monto_ves: formData.monto_semnal * 35,
      }));

      // Enviar cada cuota
      for (const cuota of cuotasPayload) {
        await registrarCuota(cuota);
      }

      setMensaje(`¡Éxito! Se han generado ${cuotasPayload.length} cuotas.`);
      setMostrarFormulario(false);
      // Actualizar la lista de cuotas
      const contrato = await getContratoPorId(user?.cedula);
      if (contrato && contrato.cuotas) {
        setCuotas(contrato.cuotas);
      }
    } catch (error) {
      console.error("Error al generar cuotas:", error);
      setMensaje("Error al generar las cuotas. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleMostrarFormulario = () => {
    setMostrarFormulario(true);
  };

  const cancelarGeneracion = () => {
    setMostrarFormulario(false);
    setMensaje("");
    setSemanasFormulario(["2023-W45", "2023-W46", "2023-W47", "2023-W48"]);
    setFormData({
      cantidadSemanas: 4,
      monto_semnal: 50,
      semana: "",
      fecha_desde: "",
      fecha_hasta: "",
      estado: "Pendiente",
      diasMora: "0",
      interesAcumulado: "0",
      confirmacionIFEMI: "Pendiente",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-6 bg-gray-50">
          {/* Encabezado y bienvenida */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-home text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Panel Principal</h1>
                <p className="text-gray-600">
                  Bienvenido/a, {user?.nombre_completo?.split(" ")[0] || "Usuario"}
                </p>
                {user?.cedula && (
                  <p className="text-gray-500 text-sm">Cédula: {user.cedula}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Créditos activos */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <i className="bx bx-credit-card text-2xl text-blue-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{stats.creditosActivos}</h3>
                <p className="text-gray-600">Créditos activos</p>
              </div>
            </div>
            {/* Próximos pagos */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <i className="bx bx-calendar-event text-2xl text-green-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{stats.proximosPagos}</h3>
                <p className="text-gray-600">Próximos pagos</p>
              </div>
            </div>
            {/* Mensajes no leídos */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <i className="bx bx-envelope text-2xl text-purple-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{stats.mensajesNoLeidos}</h3>
                <p className="text-gray-600">Mensajes no leídos</p>
              </div>
            </div>
          </div>

          {/* Sección de acciones y últimas cuotas */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Acciones rápidas</h2>
              {!mostrarFormulario ? (
                <button
                  className="bg-yellow-50 text-yellow-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-yellow-100 transition-colors w-full"
                  onClick={handleMostrarFormulario}
                >
                  <i className="bx bx-money-withdrawal text-2xl mb-2"></i>
                  <span className="text-sm font-medium">Configurar y Generar cuotas</span>
                </button>
              ) : (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="mb-4 font-semibold text-lg text-gray-800">Configurar cuotas</h3>
                  {/* Formulario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Monto */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Monto por semana (€)
                      </label>
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={formData.monto_semnal}
                        onChange={handleChangeMonto}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  {/* Otros campos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Fecha Desde */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Fecha Desde</label>
                      <input
                        type="date"
                        value={formData.fecha_desde}
                        onChange={(e) => setFormData({ ...formData, fecha_desde: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {/* Fecha Hasta */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Fecha Hasta</label>
                      <input
                        type="date"
                        value={formData.fecha_hasta}
                        onChange={(e) => setFormData({ ...formData, fecha_hasta: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Estado</label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagada">Pagada</option>
                        <option value="Vencida">Vencida</option>
                      </select>
                    </div>
                    {/* Días Mora */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Días de Mora</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.diasMora}
                        onChange={(e) => setFormData({ ...formData, diasMora: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {/* Interés Acumulado */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Interés Acumulado</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.interesAcumulado}
                        onChange={(e) => setFormData({ ...formData, interesAcumulado: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {/* Confirmación IFEMI */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Confirmación IFEMI</label>
                      <select
                        value={formData.confirmacionIFEMI}
                        onChange={(e) => setFormData({ ...formData, confirmacionIFEMI: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                      </select>
                    </div>
                  </div>
                  {/* Botones */}
                  <div className="mt-6 flex space-x-3">
                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                      onClick={handleGenerarCuotas}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="bx bx-loader-alt animate-spin mr-2"></i>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-check-circle mr-2"></i>
                          Confirmar y Generar
                        </>
                      )}
                    </button>
                    <button
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                      onClick={cancelarGeneracion}
                    >
                      Cancelar
                    </button>
                  </div>
                  {/* Mensaje */}
                  {mensaje && (
                    <div
                      className={`mt-4 p-3 rounded-md ${
                        mensaje.includes("Error")
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {mensaje}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Últimas cuotas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Últimas cuotas</h2>
              {cuotas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semana</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cuotas.slice(0, 5).map((cuota, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {cuota.semana?.split("semana ")[1] || "N/A"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            €{cuota.monto_semana}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                cuota.estado_cuota === "Pagada"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {cuota.estado_cuota}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="bx bx-file-blank text-4xl mb-2 opacity-50"></i>
                  <p>No hay cuotas registradas</p>
                </div>
              )}
              {cuotas.length > 5 && (
                <button
                  className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800"
                  onClick={() => navigate("/cuotas")}
                >
                  Ver todas las cuotas
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;