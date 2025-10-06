import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiconfiguracionDesdeAPI from "../services/api_configuracion_contratos";

const ConfiguracionDesdeAPIContrato = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [configuracion, setConfiguracion] = useState({
    id: null,
    moneda: "DOP",
    porcentaje_flat: "",
    porcentaje_interes: "",
    porcentaje_mora: "",
    numero_cuotas: "",
    frecuencia_pago: "diario",
    dias_personalizados: "",
    cuotasGracia: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [historial, setHistorial] = useState([]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const data = await apiconfiguracionDesdeAPI.getConfiguracion();
        if (data) {
          setConfiguracion({
            id: data.id,
            moneda: data.moneda,
            porcentaje_flat: data.porcentaje_flat,
            porcentaje_interes: data.porcentaje_interes,
            porcentaje_mora: data.porcentaje_mora,
            numero_cuotas: data.numero_cuotas,
            frecuencia_pago: data.frecuencia_pago,
            dias_personalizados: data.dias_personalizados,
            cuotasGracia: data.cuotasGracia
          });
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
        setMensaje("Error al cargar la configuración desde la API");
        setTipoMensaje("error");
      } finally {
        setLoading(false);
      }
    };
    cargarConfiguracion();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      ["porcentaje_flat", "porcentaje_interes", "porcentaje_mora", "numero_cuotas", "días_personalizados", "cuotasGracia"].includes(name)
    ) {
      const numValue = value === "" ? "" : Number(value);
      setConfiguracion((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setConfiguracion((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!configuracion.moneda) {
      setMensaje("Por favor, seleccione una moneda válida");
      setTipoMensaje("error");
      return;
    }

    try {
      let savedConfig;
      if (configuracion.id) {
        await apiconfiguracionDesdeAPI.updateConfiguracion(configuracion.id, configuracion);
        savedConfig = { ...configuracion };
        setMensaje("Configuración actualizada correctamente");
      } else {
        const nuevo = await apiconfiguracionDesdeAPI.createConfiguracion(configuracion);
        savedConfig = { ...configuracion, id: nuevo.id };
        setConfiguracion(savedConfig);
        setMensaje("Configuración creada correctamente");
      }
      setTipoMensaje("success");

      const nuevoHistorial = {
        fecha: new Date().toLocaleString(),
        datos: savedConfig,
      };
      setHistorial((prev) => [nuevoHistorial, ...prev]);

      setTimeout(() => {
        setMensaje("");
        setTipoMensaje("");
      }, 3000);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      setMensaje("Error al guardar la configuración");
      setTipoMensaje("error");
    }
  };

  const calcularRangoFechasPorCuota = () => {
    const { numero_cuotas, frecuencia_pago, dias_personalizados, cuotasGracia } = configuracion;
    const fechaInicio = new Date();
    const rangos = [];
    const cuotas = Number(numero_cuotas) || 0;
    const cuotasGraciaNum = Number(cuotasGracia) || 0;
    const diasPersonalizadosNum = Number(dias_personalizados) || 0;

    for (let i = 1; i <= cuotas + cuotasGraciaNum; i++) {
      const desde = new Date(fechaInicio);
      const hasta = new Date(fechaInicio);
      const offset = i <= cuotasGraciaNum ? 0 : i - cuotasGraciaNum;

      switch (frecuencia_pago) {
        case "diario":
          desde.setDate(fechaInicio.getDate() + (offset - 1));
          hasta.setDate(fechaInicio.getDate() + (offset || 1));
          break;
        case "semanal":
          desde.setDate(fechaInicio.getDate() + ((offset - 1) * 7));
          hasta.setDate(fechaInicio.getDate() + (offset * 7));
          break;
        case "quincenal":
          desde.setDate(fechaInicio.getDate() + ((offset - 1) * 15));
          hasta.setDate(fechaInicio.getDate() + (offset * 15));
          break;
        case "mensual":
          desde.setMonth(fechaInicio.getMonth() + (offset - 1));
          hasta.setMonth(fechaInicio.getMonth() + offset);
          break;
        case "personalizado":
          desde.setDate(fechaInicio.getDate() + ((offset - 1) * diasPersonalizadosNum));
          hasta.setDate(fechaInicio.getDate() + (offset * diasPersonalizadosNum));
          break;
        default:
          desde.setMonth(fechaInicio.getMonth() + (offset - 1));
          hasta.setMonth(fechaInicio.getMonth() + offset);
      }

      rangos.push({
        cuota: i,
        tipo: i <= cuotasGraciaNum ? "Gracia" : "Pago",
        desde: desde.toLocaleDateString(),
        hasta: hasta.toLocaleDateString(),
      });
    }
    return rangos;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600 text-lg">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Menú lateral */}
      {menuOpen && <Menu />}

      {/* Contenedor principal */}
      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <main className="flex-1 p-6 bg-gray-50">
          {/* Encabezado y botón */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
            {/* Título y descripción */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-cog text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Configuración de Contrato</h1>
                <p className="text-gray-600">Configure los parámetros para los contratos de crédito</p>
              </div>
            </div>
            {/* Botón volver */}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
            >
              <i className="bx bx-arrow-back mr-2"></i> Volver al Dashboard
            </button>
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                tipoMensaje === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {mensaje}
            </div>
          )}

          {/* Grid formulario y vista previa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Parámetros del Contrato</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Moneda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    name="moneda"
                    value={configuracion.moneda}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="DOP">Peso Dominicano (DOP)</option>
                    <option value="USD">Dólar Estadounidense (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>

                {/* Porcentaje Flat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje Flat (%)</label>
                  <input
                    type="number"
                    name="porcentaje_flat"
                    value={configuracion.porcentaje_flat}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Porcentaje Interés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Interés (%)</label>
                  <input
                    type="number"
                    name="porcentaje_interes"
                    value={configuracion.porcentaje_interes}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Porcentaje Mora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Mora (%)</label>
                  <input
                    type="number"
                    name="porcentaje_mora"
                    value={configuracion.porcentaje_mora}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Número de Cuotas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cuotas</label>
                  <input
                    type="number"
                    name="numero_cuotas"
                    value={configuracion.numero_cuotas}
                    onChange={handleChange}
                    min="1"
                    max="60"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Cuotas de Gracia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuotas de Gracia</label>
                  <input
                    type="number"
                    name="cuotasGracia"
                    value={configuracion.cuotasGracia}
                    onChange={handleChange}
                    min="0"
                    max={configuracion.numero_cuotas || 0}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Frecuencia de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia de Pago</label>
                  <select
                    name="frecuencia_pago"
                    value={configuracion.frecuencia_pago}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal (15 días)</option>
                    <option value="mensual">Mensual</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>

                {/* Días personalizados, solo si es personalizado */}
                {configuracion.frecuencia_pago === "personalizado" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Días entre pagos</label>
                    <input
                      type="number"
                      name="días_personalizados"
                      value={configuracion.días_personalizados}
                      onChange={handleChange}
                      min="1"
                      max="90"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Botón guardar */}
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Guardar Configuración
                </button>
              </form>
            </div>

            {/* Vista previa */}
            <div className="bg-white rounded-xl shadow-sm p-6 overflow-y-auto max-h-[80vh]">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Vista Previa</h2>
              {/* Resumen configuración */}
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Resumen de Configuración</h3>
                <p><strong>Moneda:</strong> {configuracion.moneda}</p>
                <p><strong>Porcentaje Flat:</strong> {configuracion.porcentaje_flat || "N/A"}</p>
                <p><strong>Interés:</strong> {configuracion.porcentaje_interes || "N/A"}</p>
                <p><strong>Porcentaje Mora:</strong> {configuracion.porcentaje_mora || "N/A"}</p>
                <p><strong>Número de Cuotas:</strong> {configuracion.numero_cuotas}</p>
                <p><strong>Cuotas de Gracia:</strong> {configuracion.cuotasGracia}</p>
                <p>
                  <strong>Frecuencia de Pago:</strong> {
                    configuracion.frecuencia_pago
                      ? {
                        diario: "Diario",
                        semanal: "Semanal",
                        quincenal: "Quincenal (15 días)",
                        mensual: "Mensual",
                        personalizado: `Personalizado (cada ${configuracion.dias_personalizados} días)`
                      }[configuracion.frecuencia_pago] || configuracion.frecuencia_pago
                      : "N/A"
                  }
                </p>
              </div>

              {/* Tabla rangos */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Cuota</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Tipo</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Desde</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Hasta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calcularRangoFechasPorCuota().map((rango) => (
                      <tr key={rango.cuota} className={`border-b border-gray-200 ${rango.tipo === "Gracia" ? "bg-amber-50" : ""}`}>
                        <td className="border border-gray-300 px-2 py-1">{rango.cuota}</td>
                        <td className="border border-gray-300 px-2 py-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              rango.tipo === "Gracia" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {rango.tipo}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-2 py-1">{rango.desde}</td>
                        <td className="border border-gray-300 px-2 py-1">{rango.hasta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Información importante */}
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Información Importante</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Esta configuración se aplicará a todos los nuevos contratos de crédito. Los cambios no afectarán los contratos existentes.
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Nota:</strong> El porcentaje flat se aplica una vez al monto principal, mientras que el interés se calcula periódicamente sobre el saldo pendiente.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Cuotas de Gracia:</strong> Durante las cuotas de gracia, el cliente solo paga intereses (si aplica) pero no se reduce el capital. El pago de capital comienza después del período de gracia.
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Historial en tabla con cada dato en columna */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Cambios</h2>
            {historial.length === 0 ? (
              <p className="text-gray-600">No hay cambios registrados aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Fecha</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Moneda</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Flat %</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Interés %</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Mora %</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Cuotas</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Gracia</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium text-gray-600 uppercase">Frecuencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((entry, index) => {
                      const datos = entry.datos;
                      return (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="border border-gray-300 px-2 py-1 text-sm">{entry.fecha}</td>
                          <td className="border border-gray-300 px-2 py-1">{datos.moneda}</td>
                          <td className="border border-gray-300 px-2 py-1">{datos.porcentaje_flat}</td>
                          <td className="border border-gray-300 px-2 py-1">{datos.porcentaje_interes}</td>
                          <td className="border border-gray-300 px-2 py-1">{datos.porcentaje_mora}</td>
                          <td className="border border-gray-300 px-2 py-1">{datos.numero_cuotas}</td>
                          <td className="border border-gray-300 px-2 py-1">{datos.cuotasGracia}</td>
                          <td className="border border-gray-300 px-2 py-1">{datos.frecuencia_pago}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
        {/* Pie */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default ConfiguracionDesdeAPIContrato;