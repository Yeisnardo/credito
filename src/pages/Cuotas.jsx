import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiCuotas from "../services/api_cuotas";
import {
  generarReciboPagoProfesional,
  generarResumenUsuario,
} from "../pdf/reciboPago";
import Swal from "sweetalert2";
// Importar las funciones de PDF que necesitas
import { generarFiniquito } from "../pdf/finiquito";
import { generarMetodosPago } from "../pdf/metodos_d_pagos";

// Importar Tabler Icons
import {
  TbHome,
  TbClock,
  TbHistory,
  TbFileText,
  TbCreditCard,
  TbBuildingBank,
  TbRefresh,
  TbDownload,
  TbEye,
  TbCheck,
  TbX,
  TbAlertCircle,
  TbCalendar,
  TbCalendarEvent,
  TbTrendingUp,
  TbTrendingDown,
  TbMinus,
  TbConfetti,
  TbTransfer,
  TbCalendarPlus,
  TbCalendarMinus,
  TbCopyright,
  TbUser,
  TbCurrencyDollar,
  TbId,
  TbCoin,
  TbArrowRight,
  TbChevronRight,
  TbCurrencyBitcoin,
  TbStar,
  TbAlertTriangle,
  TbGift,
  TbInfoCircle,
  TbChartBar,
  TbCircleCheck,
  TbClockHour4,
  TbFile,
} from "react-icons/tb";

// =============================================
// FUNCIONES AUXILIARES
// =============================================

// Función para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para extraer número de cuota
const extraerNumeroCuota = (textoCuota) => {
  if (!textoCuota) {
    return 1;
  }
  
  const matchFinal = textoCuota.match(/(\d+)$/);
  if (matchFinal) {
    return parseInt(matchFinal[1]);
  }
  
  const matchCualquiera = textoCuota.match(/(\d+)/);
  if (matchCualquiera) {
    return parseInt(matchCualquiera[1]);
  }
  
  return 1;
};

// En determinarTipoCuota, verifica que la lógica sea correcta
const determinarTipoCuota = (cuota, contratoSeleccionado) => {
  // Prioridad 1: Usar el campo tipo_cuota si existe en la base de datos
  if (cuota.tipo_cuota) {
    return cuota.tipo_cuota;
  }
  
  // Prioridad 2: Usar el campo cuota_gracia si existe
  if (cuota.cuota_gracia !== undefined && cuota.cuota_gracia !== null) {
    return cuota.cuota_gracia ? 'gracia' : 'obligatoria';
  }
  
  // Prioridad 3: Determinar por número de cuota (lógica existente)
  if (!contratoSeleccionado) return 'obligatoria';
  
  const numeroCuota = extraerNumeroCuota(cuota.semana);
  const totalCuotas = parseInt(contratoSeleccionado.cuotas) || 0;
  const cuotasGracia = parseInt(contratoSeleccionado.gracia) || 0;
  const cuotasObligatorias = totalCuotas - cuotasGracia;
  
  // CORRECCIÓN: Asegurar que las cuotas de gracia sean las últimas
  return numeroCuota > cuotasObligatorias ? 'gracia' : 'obligatoria';
};

// Función para generar nombre de cuota
const generarNombreCuota = (numeroCuota, frecuencia) => {
  switch (frecuencia?.toLowerCase()) {
    case "diario":
      return `Día ${numeroCuota}`;
    case "semanal":
      return `Semana ${numeroCuota}`;
    case "quincenal":
      return `Quincena ${numeroCuota}`;
    case "mensual":
      return `Mes ${numeroCuota}`;
    default:
      return `Cuota ${numeroCuota}`;
  }
};

// Función para formatear nombre de cuota
const formatearNombreCuota = (textoSemana, contrato) => {
  const numero = extraerNumeroCuota(textoSemana);
  if (numero > 0) {
    const frecuencia = contrato?.frecuencia_pago_contrato || "semanal";
    return generarNombreCuota(numero, frecuencia);
  }
  return textoSemana;
};

// =============================================
// COMPONENTES AUXILIARES PARA LA TABLA
// =============================================

// Componente para visualizar comprobante
const VisualizarComprobante = ({ comprobantePath, onClose }) => {
  if (!comprobantePath) return null;

  const baseUrl = 'http://localhost:5000';
  const comprobanteUrl = comprobantePath.startsWith('http') 
    ? comprobantePath 
    : `${baseUrl}${comprobantePath}`;

  const esPDF = comprobanteUrl.toLowerCase().endsWith('.pdf');
  const esImagen = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(comprobanteUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Comprobante de Pago</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <TbX size={24} />
          </button>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-auto">
          {esPDF ? (
            <div className="w-full h-96">
              <iframe
                src={comprobanteUrl}
                className="w-full h-full border-0"
                title="Comprobante PDF"
              />
            </div>
          ) : esImagen ? (
            <div className="flex flex-col items-center">
              <img
                src={comprobanteUrl}
                alt="Comprobante de pago"
                className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <TbFile size={48} className="text-gray-400 mb-4 mx-auto" />
              <p className="text-gray-600">Formato de archivo no soportado para vista previa</p>
              <a
                href={comprobanteUrl}
                download
                className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <TbDownload className="mr-2" size={16} />
                Descargar Comprobante
              </a>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <a
            href={comprobanteUrl}
            download
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700 transition-colors"
          >
            <TbDownload className="mr-2" size={16} />
            Descargar
          </a>
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Botón para Ver Comprobante
const BotonVerComprobante = ({ comprobantePath, onVerComprobante }) => {
  if (!comprobantePath) {
    return (
      <span className="text-gray-400 text-xs">Sin comprobante</span>
    );
  }

  return (
    <button
      onClick={() => onVerComprobante(comprobantePath)}
      className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-blue-700 transition-colors text-sm"
    >
      <TbEye className="mr-1" size={14} />
      Ver
    </button>
  );
};

// Componente de Tabla de Cuotas para EmprendedorDashboard
const CuotasTableEmprendedor = ({ cuotasContrato, loading, contratoSeleccionado, onRegistrarPago }) => {
  const [comprobanteVisible, setComprobanteVisible] = useState(null);

  const verComprobante = (comprobantePath) => {
    setComprobanteVisible(comprobantePath);
  };

  const cerrarComprobante = () => {
    setComprobanteVisible(null);
  };

  // Ordenar cuotas numéricamente
  const cuotasOrdenadas = [...cuotasContrato].sort((a, b) => {
    const numA = extraerNumeroCuota(a.semana);
    const numB = extraerNumeroCuota(b.semana);
    
    const tipoA = determinarTipoCuota(a, contratoSeleccionado);
    const tipoB = determinarTipoCuota(b, contratoSeleccionado);
    
    if (tipoA === 'gracia' && tipoB !== 'gracia') return 1;
    if (tipoA !== 'gracia' && tipoB === 'gracia') return -1;
    
    return numA - numB;
  });

  const calcularDiasMora = (fechaHasta) => {
    if (!fechaHasta) return 0;
    const hoy = new Date();
    const fechaVencimiento = new Date(fechaHasta);
    const diffTime = hoy - fechaVencimiento;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calcularInteresMora = (monto, diasMora) => {
    if (!contratoSeleccionado || !contratoSeleccionado.morosidad || diasMora <= 0) return 0;
    const porcentajeDiario = parseFloat(contratoSeleccionado.morosidad) / 100;
    return parseFloat(monto) * porcentajeDiario * diasMora;
  };

  // Estadísticas de tipos de cuota
  const cuotasObligatorias = cuotasOrdenadas.filter(c => determinarTipoCuota(c, contratoSeleccionado) === 'obligatoria');
  const cuotasGracia = cuotasOrdenadas.filter(c => determinarTipoCuota(c, contratoSeleccionado) === 'gracia');

  // Función para determinar si una cuota puede pagarse
  const puedePagar = (cuota) => {
    if (!cuota.fecha_desde || !cuota.fecha_hasta) return false;
    
    const hoy = new Date();
    const fechaDesde = new Date(cuota.fecha_desde);
    
    return hoy >= fechaDesde;
  };

  // Componente Estado Cronómetro para Emprendedor
  const EstadoCronometroEmprendedor = ({ cuota }) => {
    const calcularDiasRestantes = (fechaHasta) => {
      if (!fechaHasta) return null;
      const ahora = new Date();
      const fechaVencimiento = new Date(fechaHasta);
      const diffTime = fechaVencimiento - ahora;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const calcularDiasMorosidad = (fechaHasta) => {
      if (!fechaHasta) return 0;
      const ahora = new Date();
      const fechaVencimiento = new Date(fechaHasta);
      
      if (fechaVencimiento < ahora) {
        const diffTime = ahora - fechaVencimiento;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      }
      return 0;
    };

    const diasRest = calcularDiasRestantes(cuota.fecha_hasta);
    const diasMora = calcularDiasMorosidad(cuota.fecha_hasta);
    const tipoCuota = determinarTipoCuota(cuota, contratoSeleccionado);

    if (cuota.estado_cuota === "Pagado") {
      return (
        <span className="text-green-600 font-semibold flex items-center text-xs">
          <TbCircleCheck size={14} className="mr-1" />
          Pagado
        </span>
      );
    }
    
    if (tipoCuota === 'gracia') {
      if (diasRest > 0) {
        return (
          <span className="text-purple-600 font-semibold flex items-center text-xs">
            <TbGift size={14} className="mr-1" />
            {diasRest} días
          </span>
        );
      } else if (diasMora > 0) {
        return (
          <span className="text-purple-600 font-semibold flex items-center text-xs">
            <TbGift size={14} className="mr-1" />
            {diasMora} días mora
          </span>
        );
      } else {
        return (
          <span className="text-purple-600 font-semibold flex items-center text-xs">
            <TbGift size={14} className="mr-1" />
            Cuota de Gracia
          </span>
        );
      }
    }
    
    // Para cuotas obligatorias
    if (diasRest > 0) {
      const getDiasRestantesStyle = (dias) => {
        if (dias <= 3) return "text-orange-600 font-semibold";
        if (dias <= 7) return "text-yellow-600";
        return "text-green-600";
      };

      return (
        <span className={`font-semibold ${getDiasRestantesStyle(diasRest)} flex items-center text-xs`}>
          <TbClock size={14} className="mr-1" />
          {diasRest} días
        </span>
      );
    }
    
    if (diasMora > 0) {
      const getDiasMorosidadStyle = (dias) => {
        if (dias <= 7) return "text-orange-600 font-semibold";
        if (dias <= 30) return "text-red-600 font-semibold";
        return "text-red-700 font-bold";
      };

      return (
        <span className={`font-semibold ${getDiasMorosidadStyle(diasMora)} flex items-center text-xs`}>
          <TbAlertCircle size={14} className="mr-1" />
          {diasMora} días mora
        </span>
      );
    }
    
    return (
      <span className="text-orange-600 font-semibold flex items-center text-xs">
        <TbClockHour4 size={14} className="mr-1" />
        Vencido hoy
      </span>
    );
  };

  return (
    <div>
      {comprobanteVisible && (
        <VisualizarComprobante 
          comprobantePath={comprobanteVisible}
          onClose={cerrarComprobante}
        />
      )}

      {/* SECCIÓN DE ESTADÍSTICAS DE TIPOS DE CUOTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <TbChartBar size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Distribución de Cuotas</h3>
              <p className="text-blue-600 text-sm">
                Resumen por tipo de cuota
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Cuotas</p>
                <p className="text-2xl font-bold text-blue-600">{cuotasOrdenadas.length}</p>
              </div>
              <TbFileText size={24} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Obligatorias</p>
                <p className="text-2xl font-bold text-green-600">
                  {cuotasObligatorias.length}
                </p>
                <p className="text-xs text-gray-500">
                  ${cuotasObligatorias.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0).toFixed(2)}
                </p>
              </div>
              <TbCurrencyDollar size={24} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">De Gracia</p>
                <p className="text-2xl font-bold text-purple-600">
                  {cuotasGracia.length}
                </p>
                <p className="text-xs text-gray-500">
                  ${cuotasGracia.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0).toFixed(2)}
                </p>
              </div>
              <TbGift size={24} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Mis Cuotas {loading && <span className="text-sm text-gray-500">(Cargando...)</span>}
          </h3>
          {contratoSeleccionado && (
            <div className="text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                Obligatorias: {contratoSeleccionado.cuotas - (contratoSeleccionado.gracia || 0)}
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Gracia: {contratoSeleccionado.gracia || 0}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600"># Cuota</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Período</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Monto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Confirmación</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuotasOrdenadas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-600">
                    No hay cuotas registradas para este contrato
                  </td>
                </tr>
              ) : (
                cuotasOrdenadas.map(cuota => {
                  const numeroCuota = extraerNumeroCuota(cuota.semana);
                  const tipoCuota = determinarTipoCuota(cuota, contratoSeleccionado);
                  const diasMora = calcularDiasMora(cuota.fecha_hasta);
                  const interesMora = calcularInteresMora(cuota.monto, diasMora);
                  const totalConMora = parseFloat(cuota.monto) + interesMora;
                  const puedePagarCuota = puedePagar(cuota);
                  
                  return (
                    <tr 
                      key={cuota.id_cuota} 
                      className={`
                        border-b border-gray-100 hover:bg-gray-50
                        ${tipoCuota === 'gracia' ? 'bg-purple-50' : ''}
                        ${cuota.confirmacionifemi === 'Confirmado' ? 'bg-green-50' : ''}
                        ${cuota.confirmacionifemi === 'Rechazado' ? 'bg-red-50' : ''}
                      `}
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm font-semibold text-gray-800">{numeroCuota}</div>
                        <div className="text-xs text-gray-500">ID: {cuota.id_cuota}</div>
                      </td>
<td className="py-3 px-4">
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
    tipoCuota === 'gracia' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800'
  }`}>
    {tipoCuota === 'gracia' ? 'De Gracia' : 'Obligatoria'}
  </span>
</td>
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          <div className="flex items-center text-green-600 mb-1">
                            <TbCalendar size={12} className="mr-1" />
                            <span>Desde: {formatearFecha(cuota.fecha_desde)}</span>
                          </div>
                          <div className="flex items-center text-red-600">
                            <TbCalendar size={12} className="mr-1" />
                            <span>Hasta: {formatearFecha(cuota.fecha_hasta)}</span>
                          </div>
                          <div className="mt-1">
                            <EstadoCronometroEmprendedor cuota={cuota} />
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className={`text-sm font-semibold ${
                          tipoCuota === 'gracia' ? 'text-purple-600' : 'text-gray-800'
                        }`}>
                          ${cuota.monto}
                        </div>
                        {diasMora > 0 && (
                          <div className="text-xs text-red-600">
                            +${interesMora.toFixed(2)} mora
                          </div>
                        )}
                        {tipoCuota === 'gracia' && (
                          <div className="text-xs text-purple-500">Sin costo</div>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cuota.estado_cuota === 'Pagado' 
                            ? 'bg-green-100 text-green-800' 
                            : cuota.estado_cuota === 'Pendiente' && diasMora > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cuota.estado_cuota}
                          {cuota.estado_cuota === 'Pendiente' && diasMora > 0 && ' (En Mora)'}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cuota.confirmacionifemi === 'Confirmado' 
                            ? 'bg-green-100 text-green-800'
                            : cuota.confirmacionifemi === 'A Recibido'
                            ? 'bg-blue-100 text-blue-800'
                            : cuota.confirmacionifemi === 'Rechazado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cuota.confirmacionifemi || 'Pendiente'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {cuota.estado_cuota === 'Pendiente' && puedePagarCuota && (
                          <button
                            className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors text-sm w-full font-semibold ${
                              diasMora > 0
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : tipoCuota === 'gracia'
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            onClick={() => onRegistrarPago(cuota.id_cuota)}
                            disabled={loading}
                          >
                            <TbCreditCard className="mr-1" size={14} />
                            {loading ? 'Procesando...' : 
                             diasMora > 0 ? 'Pagar con Mora' : 
                             tipoCuota === 'gracia' ? 'Pagar Gracia' : 'Pagar'}
                          </button>
                        )}

                        {cuota.estado_cuota === 'Pendiente' && !puedePagarCuota && (
                          <div className="text-center text-xs text-gray-500">
                            Disponible: {formatearFecha(cuota.fecha_desde)}
                          </div>
                        )}

                        {cuota.estado_cuota === 'Pagado' && (
                          <div className="space-y-2">
                            <span className="text-green-600 text-sm flex items-center justify-center">
                              <TbCircleCheck className="mr-1" size={14} />
                              Pagado
                            </span>
                            {cuota.comprobante && (
                              <BotonVerComprobante 
                                comprobantePath={cuota.comprobante}
                                onVerComprobante={verComprobante}
                              />
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =============================================
// COMPONENTE PRINCIPAL EMPRENDEDORDASHBOARD
// =============================================

const EmprendedorDashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [vista, setVista] = useState("resumen");
  const [contrato, setContrato] = useState(null);
  const [cuotasPendientes, setCuotasPendientes] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({ euro: 1, dolar: 1 });
  const [monedaPref, setMonedaPref] = useState("USD");
  const [diasRestantes, setDiasRestantes] = useState({});
  const [diasMorosidad, setDiasMorosidad] = useState({});

  const [stats, setStats] = useState({
    totalPagado: 0,
    totalPendiente: 0,
    proximasCuotas: 0,
    progreso: 0,
    totalMora: 0,
    cuotasObligatoriasPendientes: 0,
    cuotasGraciaPendientes: 0,
  });

  // =============================================
  // FUNCIONES SWEETALERT2
  // =============================================

  const showAlert = (icon, title, text, confirmButtonText = "Aceptar") => {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonText,
      confirmButtonColor: "#3085d6",
      background: "#ffffff",
      color: "#333333",
    });
  };

  const showSuccess = (title, text = "") => {
    return showAlert("success", title, text);
  };

  const showError = (title, text = "") => {
    return showAlert("error", title, text);
  };

  const showWarning = (title, text = "") => {
    return showAlert("warning", title, text);
  };

  const showInfo = (title, text = "") => {
    return showAlert("info", title, text);
  };

  const showLoading = (title = "Cargando...") => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const closeLoading = () => {
    Swal.close();
  };

  const showConfirm = (
    title,
    text,
    confirmButtonText = "Sí, continuar",
    cancelButtonText = "Cancelar"
  ) => {
    return Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText,
      cancelButtonText,
      background: "#ffffff",
      color: "#333333",
    });
  };

  // =============================================
  // FUNCIONES PARA LOS BOTONES
  // =============================================

  const verFiniquito = () => {
    const cuotasObligatoriasPendientes = cuotasPendientes.filter(cuota => 
      determinarTipoCuota(cuota, contrato) === 'obligatoria'
    );

    if (cuotasObligatoriasPendientes.length > 0) {
      showError(
        "❌ Finiquito no disponible",
        `No puedes generar el finiquito con ${cuotasObligatoriasPendientes.length} cuota(s) obligatoria(s) pendiente(s)`
      );
      return;
    }

    if (stats.totalPagado <= 0) {
      showError(
        "❌ Finiquito no disponible",
        "No hay pagos registrados para generar el finiquito"
      );
      return;
    }

    try {
      showLoading("📄 Generando documento de finiquito...");

      const doc = generarFiniquito(user, contrato, stats);
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      closeLoading();

      const nuevaVentana = window.open(pdfUrl, "_blank");

      if (nuevaVentana) {
        nuevaVentana.onbeforeunload = () => {
          URL.revokeObjectURL(pdfUrl);
        };
      } else {
        showWarning(
          "⚠️ Ventanas emergentes bloqueadas",
          "Por favor permite las ventanas emergentes para visualizar el documento"
        );
        URL.revokeObjectURL(pdfUrl);
      }

      showSuccess(
        "✅ Finiquito generado",
        "Documento de finiquito generado exitosamente. ¡Felicidades por completar todos tus pagos!"
      );
    } catch (error) {
      console.error("Error generando finiquito:", error);
      closeLoading();
      showError("❌ Error", "Error al generar el documento de finiquito");
    }
  };

  const verMetodosPago = () => {
    try {
      showLoading("💳 Generando información de métodos de pago...");

      const doc = generarMetodosPago(user, contrato);
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      closeLoading();

      const nuevaVentana = window.open(pdfUrl, "_blank");

      if (nuevaVentana) {
        nuevaVentana.onbeforeunload = () => {
          URL.revokeObjectURL(pdfUrl);
        };
      } else {
        showWarning(
          "⚠️ Ventanas emergentes bloqueadas",
          "Por favor permite las ventanas emergentes para visualizar los métodos de pago"
        );
        URL.revokeObjectURL(pdfUrl);
      }

      showSuccess(
        "✅ Métodos de pago",
        "Información de métodos de pago generada exitosamente"
      );
    } catch (error) {
      console.error("Error generando métodos de pago:", error);
      closeLoading();
      showError(
        "❌ Error",
        "Error al generar la información de métodos de pago"
      );
    }
  };

  // =============================================
  // FUNCIONES DE ORDENAMIENTO MEJORADAS
  // =============================================

  const ordenarCuotasNumericamente = (cuotas) => {
    return [...cuotas].sort((a, b) => {
      const numA = extraerNumeroCuota(a.semana);
      const numB = extraerNumeroCuota(b.semana);
      
      const tipoA = determinarTipoCuota(a, contrato);
      const tipoB = determinarTipoCuota(b, contrato);
      
      if (tipoA === 'gracia' && tipoB !== 'gracia') return 1;
      if (tipoA !== 'gracia' && tipoB === 'gracia') return -1;
      
      return numA - numB;
    });
  };

  // =============================================
  // FUNCIONES PARA CÁLCULO DE FECHAS
  // =============================================

  const calcularDiasPorFrecuencia = (frecuencia) => {
    switch (frecuencia?.toLowerCase()) {
      case "diario":
        return 1;
      case "semanal":
        return 7;
      case "quincenal":
        return 15;
      case "mensual":
        return 30;
      default:
        return 7;
    }
  };

  // =============================================
  // SISTEMA DE CRONÓMETROS
  // =============================================

  const calcularDiasRestantes = (cuotas = cuotasPendientes) => {
    const ahora = new Date();
    const nuevosDiasRestantes = {};

    cuotas.forEach((cuota) => {
      if (cuota.fecha_hasta) {
        const fechaHasta = new Date(cuota.fecha_hasta);
        const diffTime = fechaHasta - ahora;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        nuevosDiasRestantes[cuota.id_cuota] = diffDays;
      }
    });

    setDiasRestantes(nuevosDiasRestantes);
    return nuevosDiasRestantes;
  };

  const calcularDiasMorosidad = (cuotas = cuotasPendientes) => {
    const ahora = new Date();
    const nuevosDiasMorosidad = {};

    cuotas.forEach((cuota) => {
      if (cuota.fecha_hasta) {
        const fechaHasta = new Date(cuota.fecha_hasta);

        if (fechaHasta < ahora) {
          const diffTime = ahora - fechaHasta;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          nuevosDiasMorosidad[cuota.id_cuota] = diffDays;
        } else {
          nuevosDiasMorosidad[cuota.id_cuota] = 0;
        }
      }
    });

    setDiasMorosidad(nuevosDiasMorosidad);
    return nuevosDiasMorosidad;
  };

  // =============================================
  // CÁLCULO DE INTERESES DE MOROSIDAD
  // =============================================

  const calcularInteresMorosidad = (diasMora, montoOriginal) => {
    if (!contrato || !contrato.morosidad) return 0;

    const porcentajeDiario = contrato.morosidad / 100;
    const interes = parseFloat(montoOriginal) * porcentajeDiario * diasMora;

    return parseFloat(interes.toFixed(2));
  };

  const calcularTotalConMora = (cuota) => {
    const tipoCuota = determinarTipoCuota(cuota, contrato);
    
    const diasMora = diasMorosidad[cuota.id_cuota] || 0;
    const montoBase = parseFloat(cuota.monto || 0);

    if (diasMora > 0) {
      const interes = calcularInteresMorosidad(diasMora, montoBase);
      return montoBase + interes;
    }

    return montoBase;
  };

  const getInfoPorcentajeMora = () => {
    if (!contrato || !contrato.morosidad) {
      return "No configurado";
    }
    return `${contrato.morosidad}% diario`;
  };

  // =============================================
  // FUNCIONES PRINCIPALES
  // =============================================

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleViewPdf = () => {
    const doc = generarResumenUsuario(user, stats);
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
  };

  const recargarDatos = () => {
    if (user?.cedula) {
      cargarDatosEmprendedor(user.cedula);
    }
  };

  // =============================================
  // CONVERSIÓN MONETARIA
  // =============================================

  const fetchRates = async () => {
    try {
      const responseEUR = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/EUR"
      );
      const responseUSD = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const rateEUR = responseEUR.data.rates["VES"];
      const rateUSD = responseUSD.data.rates["VES"];
      setRates({ euro: rateEUR, dolar: rateUSD });
    } catch (error) {
      console.error("Error al obtener las tasas de cambio:", error);
      setRates({ euro: 40, dolar: 36 });
    }
  };

  const convertirAVes = (monto) => {
    if (!rates || !rates.dolar || !rates.euro) return "Cargando tasas...";
    if (monedaPref === "USD") {
      return (parseFloat(monto) * rates.dolar).toFixed(2);
    } else if (monedaPref === "EUR") {
      return (parseFloat(monto) * rates.euro).toFixed(2);
    } else {
      return "Moneda no soportada";
    }
  };

  // =============================================
  // FUNCIONES PARA GESTIÓN DE RECIBOS PDF
  // =============================================

  const manejarReciboPago = async (pago, accion = "visualizar") => {
    try {
      setLoading(true);

      if (pago.confirmacionifemi !== "Confirmado") {
        showError(
          "❌ Acción no disponible",
          "Solo se pueden gestionar recibos de pagos confirmados"
        );
        setLoading(false);
        return;
      }

      if (accion === "visualizar") {
        showInfo(
          `👁️ Visualizando recibo`,
          `Recibo de pago para ${pago.semana}`
        );

        const doc = generarReciboPagoProfesional(pago, user, contrato);
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const nuevaVentana = window.open(pdfUrl, "_blank");

        if (nuevaVentana) {
          nuevaVentana.onbeforeunload = () => {
            URL.revokeObjectURL(pdfUrl);
          };
        } else {
          showWarning(
            "⚠️ Ventanas emergentes bloqueadas",
            "Por favor permite las ventanas emergentes para visualizar el recibo"
          );
          URL.revokeObjectURL(pdfUrl);
        }
      } else if (accion === "descargar") {
        showLoading(`📄 Descargando recibo de pago para ${pago.semana}...`);

        const doc = generarReciboPagoProfesional(pago, user, contrato);
        doc.save(`Recibo-Pago-${pago.semana}-${pago.numero_contrato}.pdf`);

        closeLoading();
        showSuccess(
          "✅ Recibo descargado",
          "Recibo PDF descargado exitosamente"
        );
      }
    } catch (error) {
      console.error(
        `Error ${
          accion === "visualizar" ? "visualizando" : "descargando"
        } recibo:`,
        error
      );
      closeLoading();
      showError(
        "❌ Error",
        `Error al ${
          accion === "visualizar" ? "visualizar" : "descargar"
        } el recibo: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const descargarComprobante = async (pagoId) => {
    try {
      showLoading("📄 Generando comprobante...");

      setTimeout(() => {
        closeLoading();
        showSuccess(
          "✅ Comprobante descargado",
          "Comprobante descargado exitosamente"
        );
      }, 1000);
    } catch (error) {
      console.error("Error descargando comprobante:", error);
      closeLoading();
      showError("❌ Error", "Error al descargar el comprobante");
    }
  };

  // =============================================
  // CARGA DE DATOS DEL EMPRENDEDOR MEJORADA
  // =============================================

  const cargarDatosEmprendedor = async (cedula) => {
  try {
    setLoading(true);
    showLoading("Cargando datos del emprendedor...");

    const contratoData = await apiCuotas.getContratoPorCedula(cedula);
    setContrato(contratoData);

    const historialData = await apiCuotas.getHistorialPagosEmprendedor(cedula);
    const historialOrdenado = ordenarCuotasNumericamente(historialData);
    setHistorialPagos(historialOrdenado);

    const pendientesData = await apiCuotas.getCuotasPendientesEmprendedor(cedula);

    const frecuencia = contratoData?.frecuencia_pago_contrato || "semanal";
    const diasPorPeriodo = calcularDiasPorFrecuencia(frecuencia);

    const cuotasConFechas = pendientesData.map((cuota) => {
      if (cuota.fecha_desde && cuota.fecha_hasta) {
        return {
          ...cuota,
          interes_acumulado: 0,
        };
      }

      const numeroCuota = extraerNumeroCuota(cuota.semana);
      const fechaBase = contratoData?.fecha_desde
        ? new Date(contratoData.fecha_desde)
        : new Date();

      const fechaDesde = new Date(fechaBase);
      fechaDesde.setDate(
        fechaBase.getDate() + (numeroCuota - 1) * diasPorPeriodo
      );

      const fechaHasta = new Date(fechaDesde);
      fechaHasta.setDate(fechaDesde.getDate() + diasPorPeriodo);

      const nombreCuota = generarNombreCuota(numeroCuota, frecuencia);

      return {
        ...cuota,
        semana: nombreCuota,
        fecha_desde: fechaDesde.toISOString().split("T")[0],
        fecha_hasta: fechaHasta.toISOString().split("T")[0],
        interes_acumulado: 0,
      };
    });

    const cuotasOrdenadas = ordenarCuotasNumericamente(cuotasConFechas);
    setCuotasPendientes(cuotasOrdenadas);

    const nuevosDiasMorosidad = calcularDiasMorosidad(cuotasOrdenadas);
    const nuevosDiasRestantes = calcularDiasRestantes(cuotasOrdenadas);

    // CORRECCIÓN: Recalcular estadísticas con los datos actualizados
    calcularEstadisticas(
      cuotasOrdenadas,
      historialOrdenado,
      contratoData,
      nuevosDiasMorosidad
    );

    closeLoading();
    showSuccess("✅ Datos cargados", "Información actualizada correctamente");
  } catch (error) {
    console.error("Error cargando datos del emprendedor:", error);
    closeLoading();
    showError(
      "❌ Error al cargar datos",
      "Error al cargar tus datos. Por favor intenta nuevamente."
    );
  } finally {
    setLoading(false);
  }
};

  // =============================================
  // FUNCIONES DE ESTADO Y VALIDACIONES
  // =============================================

  const estaEnPeriodoPago = (cuota) => {
    if (!cuota.fecha_desde || !cuota.fecha_hasta) return false;

    const hoy = new Date();
    const fechaDesde = new Date(cuota.fecha_desde);
    const fechaHasta = new Date(cuota.fecha_hasta);

    return hoy >= fechaDesde && hoy <= fechaHasta;
  };

  const estaVencida = (cuota) => {
    if (!cuota.fecha_hasta) return false;

    const hoy = new Date();
    const fechaHasta = new Date(cuota.fecha_hasta);
    return hoy > fechaHasta;
  };

  const estaPorVencer = (cuota) => {
    const diasRest = diasRestantes[cuota.id_cuota];
    return diasRest <= 3 && diasRest > 0;
  };

  const estaEnMora = (cuota) => {
    const diasMora = diasMorosidad[cuota.id_cuota] || 0;
    return diasMora > 0;
  };

  // =============================================
  // CÁLCULO DE ESTADÍSTICAS ACTUALIZADO
  // =============================================

  const calcularEstadisticas = (
  pendientes,
  historial,
  contratoData,
  diasMorosidadData = diasMorosidad
) => {
  const totalPagado = historial.reduce((sum, pago) => {
    return sum + parseFloat(pago.monto || 0);
  }, 0);

  const cuotasObligatoriasPendientes = pendientes.filter(cuota => 
    determinarTipoCuota(cuota, contratoData) === 'obligatoria'
  );
  
  const cuotasGraciaPendientes = pendientes.filter(cuota => 
    determinarTipoCuota(cuota, contratoData) === 'gracia'
  );

  // CORRECCIÓN: Calcular solo el monto pendiente de las cuotas obligatorias
  const totalPendiente = cuotasObligatoriasPendientes.reduce((sum, cuota) => {
    return sum + parseFloat(cuota.monto || 0);
  }, 0);

  const totalMora = pendientes.reduce((sum, cuota) => {
    const diasMora = diasMorosidadData[cuota.id_cuota] || 0;
    if (diasMora > 0) {
      const interes = calcularInteresMorosidad(diasMora, cuota.monto);
      return sum + interes;
    }
    return sum;
  }, 0);

  const montoTotal = parseFloat(contratoData?.monto_devolver || 0);
  
  // CORRECCIÓN: El progreso debe basarse en el monto total del contrato
  const progreso = montoTotal > 0 ? (totalPagado / montoTotal) * 100 : 0;

  setStats({
    totalPagado,
    totalPendiente,
    proximasCuotas: pendientes.length,
    progreso: Math.round(progreso),
    totalMora,
    cuotasObligatoriasPendientes: cuotasObligatoriasPendientes.length,
    cuotasGraciaPendientes: cuotasGraciaPendientes.length
  });
};

  const getEstadoConfirmacion = (confirmacionifemi) => {
    switch (confirmacionifemi) {
      case "Confirmado":
        return {
          color: "green",
          text: "Confirmado",
          icon: TbCheck,
          puedeDescargar: true,
        };
      case "Rechazado":
        return {
          color: "red",
          text: "Rechazado",
          icon: TbX,
          puedeDescargar: false,
        };
      case "A Recibido":
        return {
          color: "blue",
          text: "Por Confirmar",
          icon: TbClock,
          puedeDescargar: false,
        };
      case "En Espera":
        return {
          color: "gray",
          text: "En Espera",
          icon: TbClock,
          puedeDescargar: false,
        };
      default:
        return {
          color: "gray",
          text: "Pendiente",
          icon: TbClock,
          puedeDescargar: false,
        };
    }
  };

  // =============================================
  // REGISTRO DE PAGOS
  // =============================================

  const registrarPagoManual = async (cuotaId) => {
  try {
    setLoading(true);

    const cuota = cuotasPendientes.find((c) => c.id_cuota === cuotaId);
    if (!cuota) {
      showError("❌ Error", "Cuota no encontrada");
      setLoading(false);
      return;
    }

    const tipoCuota = determinarTipoCuota(cuota, contrato);
    const totalAPagar = calcularTotalConMora(cuota);

    // Validar si la cuota está disponible para pago
    if (!estaEnPeriodoPago(cuota) && !estaEnMora(cuota)) {
      const hoy = new Date();
      const fechaDesde = new Date(cuota.fecha_desde);

      if (hoy < fechaDesde) {
        showError(
          "❌ Cuota no disponible",
          `Esta cuota no está disponible para pago aún. Fecha de inicio: ${formatearFecha(cuota.fecha_desde)}`
        );
        setLoading(false);
        return;
      }
    }

    const tipoTexto = tipoCuota === 'gracia' ? 'Cuota de Gracia' : 'Cuota Obligatoria';
    
    // Mensaje de confirmación mejorado
    const mensajeConfirmacion = estaEnMora(cuota)
      ? `⚠️ ${tipoTexto.toUpperCase()} EN MORA\n\n• ${formatearNombreCuota(cuota.semana, contrato)}\n• Días de mora: ${diasMorosidad[cuota.id_cuota]}\n• Monto original: $${cuota.monto}\n• Interés mora: +$${calcularInteresMorosidad(diasMorosidad[cuota.id_cuota], cuota.monto).toFixed(2)}\n• Total a pagar: $${totalAPagar.toFixed(2)}\n\n¿Continuar con el pago?`
      : `✅ CONFIRMAR PAGO - ${tipoTexto.toUpperCase()}\n\n• ${formatearNombreCuota(cuota.semana, contrato)}\n• Monto a pagar: $${totalAPagar.toFixed(2)}\n\n¿Continuar con el pago?`;

    const result = await showConfirm(
      estaEnMora(cuota) ? `⚠️ ${tipoTexto} en Mora` : `✅ Confirmar Pago - ${tipoTexto}`,
      mensajeConfirmacion,
      "Sí, pagar ahora",
      "Cancelar"
    );

    if (!result.isConfirmed) {
      setLoading(false);
      return;
    }

    // Crear input para selección de archivo
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,.pdf";
    input.style.display = "none";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        setLoading(false);
        return;
      }

      try {
        // Validar tipo de archivo
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
          showError(
            "❌ Formato no válido",
            "Solo se permiten archivos JPG, PNG o PDF."
          );
          setLoading(false);
          return;
        }

        // Validar tamaño de archivo
        if (file.size > 5 * 1024 * 1024) {
          showError(
            "❌ Archivo muy grande",
            "El archivo es demasiado grande. Máximo 5MB."
          );
          setLoading(false);
          return;
        }

        showInfo(
          "📄 Archivo seleccionado",
          `• Nombre: ${file.name}\n• Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nProcesando pago...`
        );

        // Preparar datos para enviar
        const formData = new FormData();
        formData.append("comprobante", file);
        formData.append("monto_pagado", totalAPagar.toFixed(2));
        formData.append("incluye_mora", estaEnMora(cuota));

        showLoading("⏳ Subiendo comprobante y registrando pago...");

        // Registrar pago en el backend
        const resultado = await apiCuotas.registrarPagoManual(cuotaId, formData);

        // ACTUALIZACIÓN INMEDIATA DEL ESTADO LOCAL - CORREGIDO
        const cuotasActualizadas = cuotasPendientes.filter((c) => c.id_cuota !== cuotaId);
        setCuotasPendientes(cuotasActualizadas);

        // Crear objeto de pago registrado para el historial
        const pagoRegistrado = {
          ...cuota,
          id_cuota: cuotaId,
          estado_cuota: 'Pagado',
          fecha_pagada: new Date().toISOString().split('T')[0],
          monto: totalAPagar.toFixed(2),
          confirmacionifemi: 'A Recibido',
          comprobante: resultado.comprobante || file.name,
          numero_contrato: contrato?.numero_contrato || 'N/A'
        };

        // Actualizar historial inmediatamente
        setHistorialPagos(prev => [pagoRegistrado, ...prev]);

        // Recalcular estadísticas inmediatamente con los nuevos datos
        const nuevosDiasMorosidad = calcularDiasMorosidad(cuotasActualizadas);
        const nuevosDiasRestantes = calcularDiasRestantes(cuotasActualizadas);
        
        calcularEstadisticas(
          cuotasActualizadas,
          [pagoRegistrado, ...historialPagos], // Incluir el nuevo pago en el historial
          contrato,
          nuevosDiasMorosidad
        );

        closeLoading();
        
        // Mostrar mensaje de éxito con información del pago
        showSuccess(
          "✅ Pago registrado exitosamente",
          `• ${formatearNombreCuota(cuota.semana, contrato)}\n• Monto: $${totalAPagar.toFixed(2)}\n• Estado: En espera de confirmación\n\nEl comprobante ha sido enviado para verificación.`
        );

      } catch (error) {
        console.error("Error registrando pago:", error);
        closeLoading();

        let mensajeError = "Error al registrar el pago";
        if (error.response?.data?.error) {
          mensajeError += `: ${error.response.data.error}`;
        } else if (error.message) {
          mensajeError += `: ${error.message}`;
        }

        showError("❌ Error en el pago", mensajeError);
      } finally {
        setLoading(false);
        
        // Limpiar el input del DOM
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }
    };

    // Agregar input al DOM y simular click
    document.body.appendChild(input);
    input.click();

    // Limpieza automática después de un tiempo
    setTimeout(() => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    }, 30000); // 30 segundos para dar tiempo a seleccionar archivo

  } catch (error) {
    console.error("Error en el proceso de pago:", error);
    closeLoading();
    showError("❌ Error", "Error en el proceso de pago: " + error.message);
    setLoading(false);
  }
};

  // =============================================
  // COMPONENTES VISUALES MEJORADOS
  // =============================================

  const LayoutContainer = ({ children, title, subtitle, actionButton }) => (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-6">
          <div className="mb-8 mt-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                  <TbHome size={28} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                  {contrato && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Contrato: {contrato.numero_contrato}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Frecuencia:{" "}
                        {contrato.frecuencia_pago_contrato || "Semanal"}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        Mora: {getInfoPorcentajeMora()}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        Gracia: {contrato.gracia || 0} cuotas
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <button
                    className={`${
                      stats.cuotasObligatoriasPendientes > 0
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    } px-4 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md`}
                    onClick={verFiniquito}
                    disabled={stats.cuotasObligatoriasPendientes > 0}
                    title={
                      stats.cuotasObligatoriasPendientes > 0
                        ? `Completa los pagos obligatorios pendientes (${stats.cuotasObligatoriasPendientes}) para generar el finiquito`
                        : "Generar certificado de finiquito"
                    }
                  >
                    <TbCheck size={18} />
                    {stats.cuotasObligatoriasPendientes > 0
                      ? "Finiquito (Pendiente)"
                      : "Finiquito"}
                    {stats.cuotasObligatoriasPendientes > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.cuotasObligatoriasPendientes}
                      </span>
                    )}
                  </button>

                  <button
                    className="bg-blue-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={verMetodosPago}
                  >
                    <TbCreditCard size={18} />
                    Métodos Pago
                  </button>
                </div>

                {actionButton}
                <button
                  className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={recargarDatos}
                  disabled={loading}
                >
                  <TbRefresh
                    size={18}
                    className={loading ? "animate-spin" : ""}
                  />
                  {loading ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </div>
          </div>

          {children}
        </main>

        <footer className="mt-auto p-6 bg-white border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TbCopyright size={16} />
              <span>{new Date().getFullYear()} IFEMI & UPTYAB</span>
            </div>
            <p className="text-gray-500">
              Panel del Emprendedor - Sistema de Gestión de Cuotas
            </p>
          </div>
        </footer>
      </div>
    </div>
  );

  const StatsCard = ({ titulo, valor, subtitulo, color, icono, trend, badge }) => (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-${color}-500 group hover:scale-105 transform-gpu`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-700">{titulo}</h3>
            {badge && (
              <span className={`bg-${badge.color}-100 text-${badge.color}-800 px-2 py-1 rounded-full text-xs font-medium`}>
                {badge.text}
              </span>
            )}
          </div>
          <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{valor}</p>
          <p className="text-gray-500 text-sm">{subtitulo}</p>
        </div>
        <div
          className={`bg-${color}-50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
        >
          {icono}
        </div>
      </div>
      {trend && (
        <div
          className={`mt-4 flex items-center text-sm ${
            trend === "positive"
              ? "text-green-600"
              : trend === "warning"
              ? "text-amber-600"
              : "text-blue-600"
          }`}
        >
          {trend === "positive" ? (
            <TbTrendingUp size={16} className="mr-1" />
          ) : trend === "warning" ? (
            <TbTrendingDown size={16} className="mr-1" />
          ) : (
            <TbMinus size={16} className="mr-1" />
          )}
          <span>Estado actual</span>
        </div>
      )}
    </div>
  );

  const StatsGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatsCard
      titulo="Total Pagado"
      valor={`$${stats.totalPagado.toLocaleString()}`}
      subtitulo="Monto cancelado"
      color="green"
      icono={<TbCheck size={24} className="text-green-600" />}
      trend="positive"
    />
    <StatsCard
      titulo="Por Pagar"
      valor={`$${stats.totalPendiente.toLocaleString()}`}
      subtitulo="Saldo pendiente obligatorio"
      color="amber"
      icono={<TbClock size={24} className="text-amber-600" />}
      trend="warning"
      badge={{
        text: `${stats.cuotasObligatoriasPendientes} cuotas`,
        color: 'amber'
      }}
    />
    <StatsCard
      titulo="Próximas Cuotas"
      valor={stats.proximasCuotas}
      subtitulo="Total pendientes"
      color="blue"
      icono={<TbCalendarEvent size={24} className="text-blue-600" />}
      trend="neutral"
      badge={{
        text: `${stats.cuotasGraciaPendientes} gracia`,
        color: 'purple'
      }}
    />
    <StatsCard
      titulo="Progreso"
      valor={`${stats.progreso}%`}
      subtitulo="Del total del contrato"
      color="indigo"
      icono={<TbTrendingUp size={24} className="text-indigo-600" />}
      trend="positive"
    />
  </div>
);

  // COMPONENTE EMPTYSTATE
  const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="text-center py-8">
      <Icon size={48} className="text-gray-400 mb-4 mx-auto" />
      <p className="text-gray-600 font-medium">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );

  const NavigationTabs = () => (
    <div className="flex space-x-1 bg-white rounded-2xl p-2 border border-gray-200 shadow-sm mb-8">
      <TabButton
        activo={vista === "resumen"}
        onClick={() => setVista("resumen")}
        icon={TbHome}
        label="Resumen"
        badge={null}
      />
      <TabButton
        activo={vista === "pendientes"}
        onClick={() => setVista("pendientes")}
        icon={TbClock}
        label="Pendientes"
        badge={cuotasPendientes.length}
      />
      <TabButton
        activo={vista === "historial"}
        onClick={() => setVista("historial")}
        icon={TbHistory}
        label="Historial"
        badge={historialPagos.length}
      />
    </div>
  );

  const TabButton = ({ activo, onClick, icon: Icon, label, badge }) => (
    <button
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
        activo
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      }`}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge !== null && badge > 0 && (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            activo ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );

  const SectionCard = ({ title, badge, action, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {badge !== null && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const ActionButton = ({ icon: Icon, label, color, onClick }) => (
    <button
      className={`bg-${color}-50 text-${color}-700 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-${color}-100 transition-all duration-200 group hover:scale-105`}
      onClick={onClick}
    >
      <Icon
        size={24}
        className="mb-2 group-hover:scale-110 transition-transform"
      />
      <span className="text-sm font-medium text-center">{label}</span>
    </button>
  );

  const PagoItem = ({ pago }) => {
    const estado = getEstadoConfirmacion(pago.confirmacionifemi);
    const IconComponent = estado.icon;

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-4">
          <div className={`bg-${estado.color}-100 p-3 rounded-lg`}>
            <IconComponent size={20} className={`text-${estado.color}-600`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {formatearNombreCuota(pago.semana, contrato)} pagada
            </p>
            <p className="text-sm text-gray-600">
              {pago.fecha_pagada} • Contrato: {pago.numero_contrato}
            </p>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${estado.color}-100 text-${estado.color}-800 mt-1`}
            >
              <IconComponent size={12} />
              {estado.text}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">${pago.monto}</p>
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mt-1"
            onClick={() => descargarComprobante(pago.id_cuota)}
          >
            <TbDownload size={14} /> Comprobante
          </button>
        </div>
      </div>
    );
  };

  const PagoTableRow = ({ pago }) => {
    const estado = getEstadoConfirmacion(pago.confirmacionifemi);
    const IconComponent = estado.icon;

    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="py-4 px-6 text-sm text-gray-900">
          {pago.fecha_pagada || "Fecha no disponible"}
        </td>
        <td className="py-4 px-6 text-sm text-gray-900">
          {formatearNombreCuota(pago.semana, contrato)}
        </td>
        <td className="py-4 px-6 text-sm text-gray-900 font-semibold">
          ${pago.monto}
        </td>
        <td className="py-4 px-6 text-sm text-gray-900">
          {pago.numero_contrato}
        </td>
        <td className="py-4 px-6">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${estado.color}-100 text-${estado.color}-800`}
          >
            <IconComponent size={12} />
            {estado.text}
          </span>
        </td>
        <td className="py-4 px-6">
          <div className="flex gap-2">
            <button
              className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors text-sm font-medium"
              onClick={() => descargarComprobante(pago.id_cuota)}
            >
              <TbDownload size={14} /> Comprobante
            </button>

            {estado.puedeDescargar && (
              <>
                <button
                  className="bg-green-50 text-green-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-green-100 transition-colors text-sm font-medium"
                  onClick={() => manejarReciboPago(pago, "visualizar")}
                  disabled={loading}
                >
                  <TbEye size={14} />
                  {loading ? "Cargando..." : "Ver Recibo"}
                </button>

                <button
                  className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-purple-100 transition-colors text-sm font-medium"
                  onClick={() => manejarReciboPago(pago, "descargar")}
                  disabled={loading}
                >
                  <TbDownload size={14} />
                  {loading ? "Procesando..." : "PDF"}
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // =============================================
  // VISTAS PRINCIPALES
  // =============================================

  const VistaResumen = () => (
    <LayoutContainer
      title="Mi Panel de Cuotas"
      subtitle={`Bienvenido/a, ${
        user?.nombre_completo?.split(" ")[0] || "Emprendedor"
      }`}
      actionButton={
        <div className="flex gap-3">
          <button
            className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={handleViewPdf}
          >
            <TbFileText size={18} />
            Generar Reporte
          </button>
        </div>
      }
    >
      <NavigationTabs />

      <StatsGrid />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <SectionCard
          title="📅 Próximas Cuotas a Vencer"
          badge={cuotasPendientes.length}
          action={
            cuotasPendientes.length > 3 && (
              <button
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                onClick={() => setVista("pendientes")}
              >
                Ver todas <TbChevronRight size={14} />
              </button>
            )
          }
        >
          <div className="space-y-4">
            {cuotasPendientes.length === 0 ? (
              <EmptyState
                icon={TbConfetti}
                title="🎉 No tienes cuotas pendientes"
                description="Has completado todos tus pagos pendientes"
              />
            ) : (
              cuotasPendientes.slice(0, 3).map((cuota) => (
                <div key={cuota.id_cuota} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {formatearNombreCuota(cuota.semana, contrato)}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      determinarTipoCuota(cuota, contrato) === 'gracia' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {determinarTipoCuota(cuota, contrato) === 'gracia' ? 'Gracia' : 'Obligatoria'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Monto: ${cuota.monto}</div>
                    <div>Vence: {formatearFecha(cuota.fecha_hasta)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard 
          title="📊 Distribución de Cuotas" 
          badge={null}
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-600">
                {cuotasPendientes.filter(c => determinarTipoCuota(c, contrato) === 'obligatoria').length}
              </div>
              <div className="text-sm text-blue-700">Obligatorias Pendientes</div>
              <div className="text-xs text-blue-600 mt-1">
                Total: {contrato?.cuotas - (contrato?.gracia || 0)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-purple-600">
                {cuotasPendientes.filter(c => determinarTipoCuota(c, contrato) === 'gracia').length}
              </div>
              <div className="text-sm text-purple-700">Gracia Pendientes</div>
              <div className="text-xs text-purple-600 mt-1">
                Total: {contrato?.gracia || 0}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span><span className="font-semibold">Cuotas Obligatorias:</span> Pago requerido</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span><span className="font-semibold">Cuotas de Gracia:</span> Disponibles para pago</span>
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="🚀 Acciones Rápidas"
        badge={null}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton
            icon={TbFileText}
            label="Solicitar crédito"
            color="indigo"
            onClick={() => navigate("/Requeri_solicit")}
          />
          <ActionButton
            icon={TbCreditCard}
            label="Ver cuotas"
            color="green"
            onClick={() => setVista("pendientes")}
          />
          <ActionButton
            icon={TbBuildingBank}
            label="Información bancaria"
            color="blue"
            onClick={() => navigate("/Banco")}
          />
          <ActionButton
            icon={TbHistory}
            label="Historial de pagos"
            color="purple"
            onClick={() => setVista("historial")}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="📋 Actividad Reciente"
        badge={historialPagos.length}
        action={
          historialPagos.length > 3 && (
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              onClick={() => setVista("historial")}
            >
              Ver todo <TbChevronRight size={14} />
            </button>
          )
        }
      >
        <div className="space-y-3">
          {historialPagos.length === 0 ? (
            <EmptyState
              icon={TbFileText}
              title="No hay pagos registrados"
              description="Tu historial de pagos aparecerá aquí"
            />
          ) : (
            historialPagos
              .slice(0, 3)
              .map((pago) => <PagoItem key={pago.id_cuota} pago={pago} />)
          )}
        </div>
      </SectionCard>
    </LayoutContainer>
  );

  const VistaPendientes = () => (
    <LayoutContainer
      title="Mis Cuotas Pendientes"
      subtitle="Gestiona tus pagos dentro del período establecido"
      actionButton={
        <div className="flex gap-2">
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
            {stats.cuotasObligatoriasPendientes} obligatorias
          </div>
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
            {stats.cuotasGraciaPendientes} gracia
          </div>
        </div>
      }
    >
      <NavigationTabs />

      <CuotasTableEmprendedor 
        cuotasContrato={cuotasPendientes}
        loading={loading}
        contratoSeleccionado={contrato}
        onRegistrarPago={registrarPagoManual}
      />
    </LayoutContainer>
  );

  const VistaHistorial = () => (
    <LayoutContainer
      title="Mi Historial de Pagos"
      subtitle="Registro de todos tus pagos realizados"
    >
      <NavigationTabs />

      <SectionCard
        title="Historial Completo de Pagos"
        badge={historialPagos.length}
      >
        {historialPagos.length === 0 ? (
          <EmptyState
            icon={TbFileText}
            title="No hay pagos registrados"
            description="Tu historial de pagos aparecerá aquí"
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Fecha",
                    "Cuota",
                    "Monto",
                    "Contrato",
                    "Estado",
                    "Acciones",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left py-4 px-6 text-sm font-semibold text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historialPagos.map((pago) => (
                  <PagoTableRow key={pago.id_cuota} pago={pago} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </LayoutContainer>
  );

  // =============================================
  // EFFECTS
  // =============================================

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (cuotasPendientes.length > 0) {
      calcularDiasRestantes();
      calcularDiasMorosidad();

      const interval = setInterval(() => {
        calcularDiasRestantes();
        calcularDiasMorosidad();
      }, 1000 * 60 * 60);

      return () => clearInterval(interval);
    }
  }, [cuotasPendientes]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = {
            nombre_completo: "Emprendedor Ejemplo",
            rol: "Emprendedor",
            estatus: "Activo",
            cedula: cedula,
          };
          setUserState(usuario);
          if (setUser) setUser(usuario);

          await cargarDatosEmprendedor(cedula);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    if (!user) fetchUserData();
  }, [setUser, user]);

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  if (loading && !user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Cargando panel del emprendedor...
          </p>
        </div>
      </div>
    );
  }

  switch (vista) {
    case "resumen":
      return <VistaResumen />;
    case "pendientes":
      return <VistaPendientes />;
    case "historial":
      return <VistaHistorial />;
    default:
      return <VistaResumen />;
  }
};

export default EmprendedorDashboard;