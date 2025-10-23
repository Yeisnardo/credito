import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiConfiguracion from "../services/api_configuracion_contratos"; // API actualizada

const ConfiguracionContratos = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuracion, setConfiguracion] = useState({
    id: null,
    moneda: "DOP",
    porcentaje_flat: "",
    porcentaje_interes: "",
    porcentaje_mora: "",
    numero_cuotas: "",
    frecuencia_pago: "mensual",
    dias_personalizados: "",
    cuotasgracias: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [historial, setHistorial] = useState([]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Cargar configuración y historial
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Cargar configuración actual
        const configActual = await apiConfiguracion.getConfiguracionActiva();
        if (configActual) {
          setConfiguracion({
            id: configActual.id,
            moneda: configActual.moneda || "DOP",
            porcentaje_flat: configActual.porcentaje_flat || "",
            porcentaje_interes: configActual.porcentaje_interes || "",
            porcentaje_mora: configActual.porcentaje_mora || "",
            numero_cuotas: configActual.numero_cuotas || "",
            frecuencia_pago: configActual.frecuencia_pago || "mensual",
            dias_personalizados: configActual.dias_personalizados || "",
            cuotasgracias: configActual.cuotasgracias || ""
          });
        }

        // Cargar historial
        const historialData = await apiConfiguracion.getHistorialConfiguracion();
        setHistorial(historialData);
        
      } catch (error) {
        console.error("Error al cargar configuración:", error);
        mostrarMensaje("Error al cargar la configuración", "error");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Mostrar mensajes temporales
  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje("");
      setTipoMensaje("");
    }, 5000);
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (["porcentaje_flat", "porcentaje_interes", "porcentaje_mora", "numero_cuotas", "dias_personalizados", "cuotasgracias"].includes(name)) {
      // Validar que sea número válido
      const numValue = value === "" ? "" : (isNaN(Number(value)) ? "" : Number(value));
      setConfiguracion(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setConfiguracion(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!configuracion.moneda) {
      mostrarMensaje("Por favor, seleccione una moneda válida", "error");
      return false;
    }

    if (!configuracion.numero_cuotas || configuracion.numero_cuotas < 1) {
      mostrarMensaje("El número de cuotas debe ser mayor a 0", "error");
      return false;
    }

    if (configuracion.frecuencia_pago === "personalizado" && (!configuracion.dias_personalizados || configuracion.dias_personalizados < 1)) {
      mostrarMensaje("Debe especificar los días para frecuencia personalizada", "error");
      return false;
    }

    // Validar que cuotas de gracia no sea mayor que número de cuotas
    if (configuracion.cuotasgracias > configuracion.numero_cuotas) {
      mostrarMensaje("Las cuotas de gracia no pueden ser más que el número total de cuotas", "error");
      return false;
    }

    return true;
  };

  // Guardar configuración
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    try {
      setSaving(true);
      
      let resultado;
      if (configuracion.id) {
        // Actualizar configuración existente
        resultado = await apiConfiguracion.updateConfiguracion(configuracion.id, configuracion);
        mostrarMensaje("✅ Configuración actualizada correctamente", "success");
      } else {
        // Crear nueva configuración
        resultado = await apiConfiguracion.createConfiguracion(configuracion);
        setConfiguracion(prev => ({ ...prev, id: resultado.configuracion.id }));
        mostrarMensaje("✅ Configuración creada correctamente", "success");
      }

      // Recargar historial después de guardar
      const historialActualizado = await apiConfiguracion.getHistorialConfiguracion();
      setHistorial(historialActualizado);
      
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      mostrarMensaje("❌ Error al guardar la configuración", "error");
    } finally {
      setSaving(false);
    }
  };

  // Calcular rangos de fechas para vista previa
  const calcularRangoFechasPorCuota = () => {
    const { numero_cuotas, frecuencia_pago, dias_personalizados, cuotasgracias } = configuracion;
    
    if (!numero_cuotas || numero_cuotas < 1) return [];

    const fechaInicio = new Date();
    const rangos = [];
    const cuotas = Number(numero_cuotas);
    const cuotasgraciasNum = Number(cuotasgracias) || 0;

    for (let i = 1; i <= cuotas + cuotasgraciasNum; i++) {
      const desde = new Date(fechaInicio);
      const hasta = new Date(fechaInicio);
      const offset = i <= cuotasgraciasNum ? 0 : i - cuotasgraciasNum;

      switch (frecuencia_pago) {
        case "diario":
          desde.setDate(fechaInicio.getDate() + (offset - 1));
          hasta.setDate(fechaInicio.getDate() + offset);
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
          const dias = Number(dias_personalizados) || 30;
          desde.setDate(fechaInicio.getDate() + ((offset - 1) * dias));
          hasta.setDate(fechaInicio.getDate() + (offset * dias));
          break;
        default:
          desde.setMonth(fechaInicio.getMonth() + (offset - 1));
          hasta.setMonth(fechaInicio.getMonth() + offset);
      }

      rangos.push({
        cuota: i,
        tipo: i <= cuotasgraciasNum ? "Gracia" : "Pago",
        desde: desde.toLocaleDateString('es-ES'),
        hasta: hasta.toLocaleDateString('es-ES'),
      });
    }
    
    return rangos;
  };

  // Obtener texto descriptivo de frecuencia
  const getFrecuenciaTexto = () => {
    const { frecuencia_pago, dias_personalizados } = configuracion;
    const frecuencias = {
      diario: "Diario",
      semanal: "Semanal", 
      quincenal: "Quincenal (15 días)",
      mensual: "Mensual",
      personalizado: `Personalizado (cada ${dias_personalizados} días)`
    };
    return frecuencias[frecuencia_pago] || frecuencia_pago;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="bx bx-loader-circle bx-spin text-4xl text-indigo-600 mb-4"></i>
            <p className="text-gray-600">Cargando configuración...</p>
          </div>
        </div>
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
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-cog text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Configuración de Contratos</h1>
                <p className="text-gray-600">Configure los parámetros para los contratos de crédito</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
              >
                <i className="bx bx-arrow-back mr-2"></i> Volver
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
              >
                <i className="bx bx-dashboard mr-2"></i> Panel Admin
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          {mensaje && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              tipoMensaje === "success" 
                ? "bg-green-50 border-green-500 text-green-700" 
                : "bg-red-50 border-red-500 text-red-700"
            }`}>
              <div className="flex items-center">
                <i className={`bx ${
                  tipoMensaje === "success" ? "bx-check-circle" : "bx-error"
                } mr-2 text-lg`}></i>
                {mensaje}
              </div>
            </div>
          )}

          {/* Grid formulario y vista previa */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Formulario de Configuración */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Parámetros del Contrato</h2>
                {configuracion.id && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Configuración #{configuracion.id}
                  </span>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Moneda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bx bx-dollar-circle mr-1"></i> Moneda
                    </label>
                    <select
                      name="moneda"
                      value={configuracion.moneda}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    >
                      <option value="DOP">Peso Dominicano (DOP)</option>
                      <option value="USD">Dólar Estadounidense (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>

                  {/* Número de Cuotas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bx bx-calendar mr-1"></i> Número de Cuotas
                    </label>
                    <input
                      type="number"
                      name="numero_cuotas"
                      value={configuracion.numero_cuotas}
                      onChange={handleChange}
                      min="1"
                      max="60"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Ej: 12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Porcentaje Flat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bx bx-trending-up mr-1"></i> Flat (%)
                    </label>
                    <input
                      type="number"
                      name="porcentaje_flat"
                      value={configuracion.porcentaje_flat}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Porcentaje Interés */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bx bx-line-chart mr-1"></i> Interés (%)
                    </label>
                    <input
                      type="number"
                      name="porcentaje_interes"
                      value={configuracion.porcentaje_interes}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Porcentaje Mora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bx bx-time mr-1"></i> Mora (%)
                    </label>
                    <input
                      type="number"
                      name="porcentaje_mora"
                      value={configuracion.porcentaje_mora}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Frecuencia de pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bx bx-repost mr-1"></i> Frecuencia de Pago
                    </label>
                    <select
                      name="frecuencia_pago"
                      value={configuracion.frecuencia_pago}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>

                  {/* Cuotas de Gracia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bx bx-gift mr-1"></i> Cuotas de Gracia
                    </label>
                    <input
                      type="number"
                      name="cuotasgracias"
                      value={configuracion.cuotasgracias}
                      onChange={handleChange}
                      min="0"
                      max={configuracion.numero_cuotas || 0}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Días personalizados */}
                {configuracion.frecuencia_pago === "personalizado" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bx bx-calendar-edit mr-1"></i> Días entre Pagos
                    </label>
                    <input
                      type="number"
                      name="dias_personalizados"
                      value={configuracion.dias_personalizados}
                      onChange={handleChange}
                      min="1"
                      max="90"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Ej: 30"
                      required
                    />
                  </div>
                )}

                {/* Botón guardar */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <i className="bx bx-loader-circle bx-spin mr-2"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-save mr-2"></i>
                      {configuracion.id ? 'Actualizar Configuración' : 'Guardar Configuración'}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Vista Previa */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Vista Previa</h2>
              
              {/* Resumen de Configuración */}
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Resumen de Configuración</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="font-medium">Moneda:</span> {configuracion.moneda}</div>
                  <div><span className="font-medium">Flat:</span> {configuracion.porcentaje_flat || '0'}%</div>
                  <div><span className="font-medium">Interés:</span> {configuracion.porcentaje_interes || '0'}%</div>
                  <div><span className="font-medium">Mora:</span> {configuracion.porcentaje_mora || '0'}%</div>
                  <div><span className="font-medium">Cuotas:</span> {configuracion.numero_cuotas || '0'}</div>
                  <div><span className="font-medium">Gracia:</span> {configuracion.cuotasgracias || '0'}</div>
                  <div className="col-span-2">
                    <span className="font-medium">Frecuencia:</span> {getFrecuenciaTexto()}
                  </div>
                </div>
              </div>

              {/* Calendario de Cuotas */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Calendario de Pagos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Cuota</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tipo</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Desde</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Hasta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {calcularRangoFechasPorCuota().slice(0, 6).map((rango) => (
                        <tr key={rango.cuota} className={rango.tipo === "Gracia" ? "bg-amber-50" : ""}>
                          <td className="px-3 py-2 text-sm">{rango.cuota}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              rango.tipo === "Gracia" 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-green-100 text-green-800"
                            }`}>
                              {rango.tipo}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm">{rango.desde}</td>
                          <td className="px-3 py-2 text-sm">{rango.hasta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {calcularRangoFechasPorCuota().length > 6 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Mostrando 6 de {calcularRangoFechasPorCuota().length} cuotas
                    </p>
                  )}
                </div>
              </div>

              {/* Información Importante */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                  <i className="bx bx-info-circle mr-2"></i> Información Importante
                </h3>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Esta configuración se aplica a nuevos contratos</li>
                  <li>• Los contratos existentes no se modifican</li>
                  <li>• Las cuotas de gracia solo pagan intereses</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Historial de Cambios */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Historial de Cambios</h2>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {historial.length} registros
              </span>
            </div>

            {historial.length === 0 ? (
              <div className="text-center py-8">
                <i className="bx bx-time text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No hay cambios registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Moneda</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Flat %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Interés %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Mora %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cuotas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Gracia</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Frecuencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {historial.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(item.fecha_cambio).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.moneda}</td>
                        <td className="px-4 py-3 text-sm">{item.porcentaje_flat}%</td>
                        <td className="px-4 py-3 text-sm">{item.porcentaje_interes}%</td>
                        <td className="px-4 py-3 text-sm">{item.porcentaje_mora}%</td>
                        <td className="px-4 py-3 text-sm">{item.numero_cuotas}</td>
                        <td className="px-4 py-3 text-sm">{item.cuotasgracias || 0}</td>
                        <td className="px-4 py-3 text-sm capitalize">{item.frecuencia_pago}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Sistema de Gestión de Créditos
        </footer>
      </div>
    </div>
  );
};

export default ConfiguracionContratos;