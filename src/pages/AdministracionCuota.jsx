import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiCuotas from "../services/api_cuotas";

// Importación CORREGIDA de Tabler Icons - solo los que existen
import { 
  TbX,
  TbDownload,
  TbFile,
  TbUser,
  TbClock,
  TbCurrencyDollar,
  TbRefresh,
  TbEye,
  TbChartBar,
  TbCalendar,
  TbCheck,
  TbCircleCheck,
  TbAlertCircle,
  TbClockHour4,
  TbFileText,
  TbCreditCard,
  TbArrowBack,
  TbLoader
} from 'react-icons/tb';

// Componente para visualizar el comprobante
const VisualizarComprobante = ({ comprobantePath, onClose }) => {
  if (!comprobantePath) return null;

  console.log('Visualizando comprobante:', comprobantePath);

  const baseUrl = 'http://localhost:5000';
  const comprobanteUrl = comprobantePath.startsWith('http') 
    ? comprobantePath 
    : `${baseUrl}${comprobantePath}`;

  console.log('URL completa:', comprobanteUrl);

  const esPDF = comprobanteUrl.toLowerCase().endsWith('.pdf');
  const esImagen = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(comprobanteUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Comprobante de Pago</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {comprobantePath}
            </span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <TbX size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-auto">
          {esPDF ? (
            <div className="w-full h-96">
              <iframe
                src={comprobanteUrl}
                className="w-full h-full border-0"
                title="Comprobante PDF"
              />
              <div className="mt-2 text-center text-sm text-gray-500">
                Vista previa de PDF: {comprobanteUrl}
              </div>
            </div>
          ) : esImagen ? (
            <div className="flex flex-col items-center">
              <img
                src={comprobanteUrl}
                alt="Comprobante de pago"
                className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  console.error('Error cargando imagen:', e);
                  e.target.style.display = 'none';
                }}
              />
              <div className="mt-2 text-center text-sm text-gray-500">
                Vista previa de imagen: {comprobanteUrl}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TbFile size={48} className="text-gray-400 mb-4 mx-auto" />
              <p className="text-gray-600">Formato de archivo no soportado para vista previa</p>
              <p className="text-sm text-gray-500 mt-2">Ruta: {comprobantePath}</p>
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

// Componente de Tarjetas de Estadísticas
const StatsCards = ({ stats }) => (
  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-indigo-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Contratos</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalContratos}</p>
          <p className="text-gray-500 text-sm">Contratos activos</p>
        </div>
        <div className="bg-indigo-100 p-2 rounded-full">
          <TbFile size={24} className="text-indigo-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-green-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Emprendedores Activos</h2>
          <p className="text-3xl font-bold text-green-600">{stats.emprendedoresActivos}</p>
          <p className="text-gray-500 text-sm">Con contratos activos</p>
        </div>
        <div className="bg-green-100 p-2 rounded-full">
          <TbUser size={24} className="text-green-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-amber-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Cuotas Pendientes</h2>
          <p className="text-3xl font-bold text-amber-600">{stats.cuotasPendientes}</p>
          <p className="text-gray-500 text-sm">Por cobrar</p>
        </div>
        <div className="bg-amber-100 p-2 rounded-full">
          <TbClock size={24} className="text-amber-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-purple-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Recaudado</h2>
          <p className="text-3xl font-bold text-purple-600">${stats.totalRecaudado.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">Monto total</p>
        </div>
        <div className="bg-purple-100 p-2 rounded-full">
          <TbCurrencyDollar size={24} className="text-purple-600" />
        </div>
      </div>
    </div>
  </section>
);

// Componente de Lista de Contratos
const ContratosList = ({ contratos, loading, onVerCuotas, onGenerarReporte, onRefresh }) => (
  <section className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Contratos Activos {loading && <span className="text-sm text-gray-500">(Cargando...)</span>}
      </h2>
      <div className="flex space-x-3">
        <button 
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
          onClick={onRefresh}
          disabled={loading}
        >
          <TbRefresh className="mr-2" size={16} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
    </div>

    <div className="space-y-4">
      {contratos.length === 0 ? (
        <div className="text-center py-8">
          <TbFile size={48} className="text-gray-400 mb-4 mx-auto" />
          <p className="text-gray-600">No hay contratos activos</p>
        </div>
      ) : (
        contratos.map(contrato => (
          <div key={contrato.id_contrato} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {contrato.cedula_emprendedor} - {contrato.numero_contrato}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contrato.estatus === 'aceptado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contrato.estatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <TbCalendar className="mr-2" size={16} />
                    Desde: {new Date(contrato.fecha_desde).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <TbCurrencyDollar className="mr-2" size={16} />
                    Monto: ${contrato.monto_devolver}
                  </div>
                  <div className="flex items-center">
                    <TbCalendar className="mr-2" size={16} />
                    Hasta: {new Date(contrato.fecha_hasta).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors text-sm"
                  onClick={() => onVerCuotas(contrato.id_contrato)}
                  disabled={loading}
                >
                  <TbEye className="mr-1" size={14} />
                  Ver Cuotas
                </button>
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors text-sm"
                  onClick={() => onGenerarReporte(contrato.id_contrato)}
                >
                  <TbChartBar className="mr-1" size={14} />
                  Reporte
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);

// Componente para mostrar el estado del cronómetro
const EstadoCronometro = ({ cuota }) => {
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

  const getDiasRestantesStyle = (dias) => {
    if (dias <= 0) return "text-red-600 font-bold";
    if (dias <= 3) return "text-orange-600 font-semibold";
    if (dias <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  const getDiasMorosidadStyle = (dias) => {
    if (dias <= 0) return "text-gray-600";
    if (dias <= 7) return "text-orange-600 font-semibold";
    if (dias <= 30) return "text-red-600 font-semibold";
    return "text-red-700 font-bold";
  };

  if (cuota.estado_cuota === "Pagado") {
    return (
      <span className="text-green-600 font-semibold flex items-center text-xs">
        <TbCircleCheck size={14} className="mr-1" />
        Pagado
      </span>
    );
  }
  
  if (diasRest > 0) {
    return (
      <span className={`font-semibold ${getDiasRestantesStyle(diasRest)} flex items-center text-xs`}>
        <TbClock size={14} className="mr-1" />
        {diasRest} días
      </span>
    );
  }
  
  if (diasMora > 0) {
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

const calcularDiasPorFrecuencia = (frecuencia) => {
  switch (frecuencia?.toLowerCase()) {
    case 'diario':
      return 1;
    case 'semanal':
      return 7;
    case 'quincenal':
      return 15;
    case 'mensual':
      return 30;
    default:
      return 7; // Por defecto semanal
  }
};

const generarNombreCuota = (numeroCuota, frecuencia) => {
  switch (frecuencia?.toLowerCase()) {
    case 'diario':
      return `Día ${numeroCuota}`;
    case 'semanal':
      return `Semana ${numeroCuota}`;
    case 'quincenal':
      return `Quincena ${numeroCuota}`;
    case 'mensual':
      return `Mes ${numeroCuota}`;
    default:
      return `Cuota ${numeroCuota}`;
  }
};

// Componente de Tabla de Cuotas
const CuotasTable = ({ cuotasContrato, loading, onConfirmarPago, onRechazarPago, contratoSeleccionado }) => {
  const [comprobanteVisible, setComprobanteVisible] = useState(null);

  const verComprobante = (comprobantePath) => {
    setComprobanteVisible(comprobantePath);
  };

  const cerrarComprobante = () => {
    setComprobanteVisible(null);
  };

  const extraerNumeroCuota = (textoSemana) => {
    if (!textoSemana) return 0;
    const match = textoSemana.match(/Semana\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  };

  const cuotasOrdenadas = [...cuotasContrato].sort((a, b) => {
    const numA = extraerNumeroCuota(a.semana);
    const numB = extraerNumeroCuota(b.semana);
    return numA - numB;
  });

  const cuotasPorConfirmar = cuotasOrdenadas.filter(cuota => 
    cuota.estado_cuota === 'Pagado' && cuota.confirmacionifemi === 'A Recibido'
  );

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

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      {comprobanteVisible && (
        <VisualizarComprobante 
          comprobantePath={comprobanteVisible}
          onClose={cerrarComprobante}
        />
      )}

      {cuotasPorConfirmar.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <TbClockHour4 size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Pagos por Confirmar</h3>
                <p className="text-blue-600 text-sm">
                  {cuotasPorConfirmar.length} pago(s) esperando confirmación
                </p>
              </div>
            </div>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {cuotasPorConfirmar.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Semana</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Monto</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Fecha Pago</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Comprobante</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuotasPorConfirmar.map(cuota => (
                  <tr key={cuota.id_cuota} className="border-b border-blue-100 hover:bg-blue-100">
                    <td className="py-3 px-4 text-sm text-blue-800">{cuota.semana}</td>
                    <td className="py-3 px-4 text-sm text-blue-800">${cuota.monto}</td>
                    <td className="py-3 px-4 text-sm text-blue-800">
                      {cuota.fecha_pagada ? formatearFecha(cuota.fecha_pagada) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <BotonVerComprobante 
                        comprobantePath={cuota.comprobante}
                        onVerComprobante={verComprobante}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-700 transition-colors text-sm"
                          onClick={() => onConfirmarPago(cuota.id_cuota)}
                          disabled={loading}
                        >
                          <TbCheck className="mr-1" size={14} />
                          Confirmar
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-red-700 transition-colors text-sm"
                          onClick={() => onRechazarPago(cuota.id_cuota)}
                          disabled={loading}
                        >
                          <TbX className="mr-1" size={14} />
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Todas las Cuotas {loading && <span className="text-sm text-gray-500">(Cargando...)</span>}
          </h3>
          {contratoSeleccionado?.morosidad && (
            <div className="text-sm text-orange-600 font-medium">
              Tasa de mora: {contratoSeleccionado.morosidad}% diario
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Semana</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Período</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Monto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Confirmación</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha Pago</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Comprobante</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Días Mora</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Interés Mora</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuotasOrdenadas.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-600">
                    No hay cuotas registradas para este contrato
                  </td>
                </tr>
              ) : (
                cuotasOrdenadas.map(cuota => {
                  const diasMora = calcularDiasMora(cuota.fecha_hasta);
                  const interesMora = calcularInteresMora(cuota.monto, diasMora);
                  
                  return (
                    <tr 
                      key={cuota.id_cuota} 
                      className={`
                        border-b border-gray-100 hover:bg-gray-50
                        ${cuota.confirmacionifemi === 'Confirmado' ? 'bg-green-50' : ''}
                        ${cuota.confirmacionifemi === 'Rechazado' ? 'bg-red-50' : ''}
                        ${cuota.confirmacionifemi === 'A Recibido' ? 'bg-blue-50' : ''}
                        ${diasMora > 0 && cuota.estado_cuota === 'Pendiente' ? 'bg-red-50' : ''}
                      `}
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-800 font-semibold">{cuota.semana}</div>
                        <div className="text-xs text-gray-500">ID: {cuota.id_cuota}</div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          <div className="flex items-center text-green-600 mb-1">
                            <TbCalendar size={12} className="mr-1" />
                            <span className="font-medium">Desde:</span>
                            <span className="ml-1">{formatearFecha(cuota.fecha_desde)}</span>
                          </div>
                          <div className="flex items-center text-red-600">
                            <TbCalendar size={12} className="mr-1" />
                            <span className="font-medium">Hasta:</span>
                            <span className="ml-1">{formatearFecha(cuota.fecha_hasta)}</span>
                          </div>
                          <div className="mt-1">
                            <EstadoCronometro cuota={cuota} />
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 text-sm text-gray-800 font-semibold">
                        ${cuota.monto}
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
                      
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {cuota.fecha_pagada ? (
                          <div className="text-green-600 font-medium">
                            {formatearFecha(cuota.fecha_pagada)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <BotonVerComprobante 
                          comprobantePath={cuota.comprobante}
                          onVerComprobante={verComprobante}
                        />
                      </td>
                      
                      <td className="py-3 px-4">
                        {diasMora > 0 ? (
                          <div className="text-center">
                            <span className="text-red-600 font-semibold text-sm">{diasMora}</span>
                            <div className="text-xs text-red-500">días</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-green-600 font-semibold text-sm">0</span>
                            <div className="text-xs text-green-500">días</div>
                          </div>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        {interesMora > 0 ? (
                          <div className="text-center">
                            <span className="text-red-600 font-semibold text-sm">${interesMora.toFixed(2)}</span>
                            <div className="text-xs text-red-500">
                              {diasMora}d × {contratoSeleccionado?.morosidad}%
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-green-600 font-semibold text-sm">$0.00</span>
                            <div className="text-xs text-green-500">sin mora</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
  {cuota.cuota_gracia ? (
    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
      Gracia
    </span>
  ) : (
    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
      Normal
    </span>
  )}
</td>
                      
                      <td className="py-3 px-4">
                        {cuota.estado_cuota === 'Pagado' && cuota.confirmacionifemi === 'A Recibido' && (
                          <div className="flex flex-col space-y-2">
                            <button
                              className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors text-sm w-full"
                              onClick={() => onConfirmarPago(cuota.id_cuota)}
                              disabled={loading}
                            >
                              <TbCheck className="mr-1" size={14} />
                              Confirmar Pago
                            </button>
                            <button
                              className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors text-sm w-full"
                              onClick={() => onRechazarPago(cuota.id_cuota)}
                              disabled={loading}
                            >
                              <TbX className="mr-1" size={14} />
                              Rechazar Pago
                            </button>
                          </div>
                        )}

                        {cuota.estado_cuota === 'Pagado' && (!cuota.confirmacionifemi || cuota.confirmacionifemi === 'En Espera') && (
                          <div className="flex flex-col space-y-2">
                            <button
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-sm w-full"
                              onClick={() => onConfirmarPago(cuota.id_cuota)}
                              disabled={loading}
                            >
                              <TbCheck className="mr-1" size={14} />
                              Confirmar Pago
                            </button>
                            <span className="text-blue-600 text-xs text-center">
                              Esperando confirmación
                            </span>
                          </div>
                        )}
                        
                        {cuota.confirmacionifemi === 'Confirmado' && (
                          <div className="text-center">
                            <span className="text-green-600 text-sm flex items-center justify-center mb-1">
                              <TbCircleCheck className="mr-1" size={14} />
                              Confirmado
                            </span>
                            <button
                              className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                              onClick={() => onRechazarPago(cuota.id_cuota)}
                              disabled={loading}
                            >
                              Revertir
                            </button>
                          </div>
                        )}
                        
                        {cuota.confirmacionifemi === 'Rechazado' && (
                          <div className="text-center">
                            <span className="text-red-600 text-sm flex items-center justify-center mb-1">
                              <TbX className="mr-1" size={14} />
                              Rechazado
                            </span>
                            <button
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                              onClick={() => onConfirmarPago(cuota.id_cuota)}
                              disabled={loading}
                            >
                              Confirmar
                            </button>
                          </div>
                        )}
                        
                        {cuota.estado_cuota === 'Pendiente' && (
                          <div className="text-center">
                            <span className={`text-sm flex items-center justify-center mb-1 ${
                              diasMora > 0 ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              <TbAlertCircle className="mr-1" size={14} />
                              {diasMora > 0 ? 'En mora' : 'Pendiente de pago'}
                            </span>
                            {diasMora > 0 && (
                              <div className="text-xs text-red-500">
                                {diasMora} días de retraso
                              </div>
                            )}
                          </div>
                        )}

                        {cuota.estado_cuota === 'Pagado' && cuota.confirmacionifemi !== 'Confirmado' && (
                          <button
                            className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors text-sm w-full mt-1"
                            onClick={() => onConfirmarPago(cuota.id_cuota)}
                            disabled={loading}
                          >
                            <TbCheck className="mr-1" size={14} />
                            {cuota.confirmacionifemi === 'A Recibido' ? 'Confirmar' : 'Marcar como Confirmado'}
                          </button>
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

// Componente Principal AdminDashboard
const AdminDashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [cuotasContrato, setCuotasContrato] = useState([]);
  const [vista, setVista] = useState('contratos');
  const [stats, setStats] = useState({
    totalContratos: 0,
    emprendedoresActivos: 0,
    cuotasPendientes: 0,
    totalRecaudado: 0
  });
  const [loading, setLoading] = useState(false);
  
  const [contratosRecalculados, setContratosRecalculados] = useState(() => {
    const saved = localStorage.getItem('contratosRecalculados');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('contratosRecalculados', JSON.stringify([...contratosRecalculados]));
  }, [contratosRecalculados]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem('cedula_usuario');
        if (cedula) {
          const usuario = {
            nombre_completo: "Administrador Principal",
            rol: "Administrador",
            estatus: "Activo"
          };
          setUserState(usuario);
          if (setUser) setUser(usuario);
          
          await cargarDatosReales();
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    
    if (!user) fetchUserData();
  }, [setUser, user]);

  const extraerNumeroCuota = (textoCuota) => {
    if (!textoCuota) return 1;
    const match = textoCuota.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const calcularFechasCuotas = (contratoData, cuotasData) => {
    if (!contratoData) return cuotasData;

    const fechaInicioContrato = new Date(contratoData.fecha_desde);
    const frecuencia = contratoData.frecuencia_pago_contrato;
    const diasPorPeriodo = calcularDiasPorFrecuencia(frecuencia);
    
    const cuotasConFechas = [];
    
    cuotasData.forEach((cuota) => {
      if (cuota.fecha_desde && cuota.fecha_hasta) {
        cuotasConFechas.push(cuota);
        return;
      }

      const numeroCuota = extraerNumeroCuota(cuota.semana);
      
      const fechaDesde = new Date(fechaInicioContrato);
      fechaDesde.setDate(fechaInicioContrato.getDate() + ((numeroCuota - 1) * diasPorPeriodo));
      
      const fechaHasta = new Date(fechaDesde);
      fechaHasta.setDate(fechaDesde.getDate() + diasPorPeriodo);

      const nombreCuota = generarNombreCuota(numeroCuota, frecuencia);

      cuotasConFechas.push({
        ...cuota,
        semana: nombreCuota,
        fecha_desde: fechaDesde.toISOString().split('T')[0],
        fecha_hasta: fechaHasta.toISOString().split('T')[0]
      });
    });

    return cuotasConFechas;
  };

  const cargarCuotasContrato = async (id_contrato) => {
    try {
      setLoading(true);
      
      const contrato = contratos.find(c => c.id_contrato === id_contrato);
      if (!contrato) {
        alert('Contrato no encontrado');
        return;
      }

      const cuotasData = await apiCuotas.getCuotasPorContrato(id_contrato);
      
      const cuotasConFechas = calcularFechasCuotas(contrato, cuotasData);
      
      setCuotasContrato(cuotasConFechas);
      setContratoSeleccionado(contrato);
      setVista('detalle');
      
    } catch (error) {
      console.error('Error cargando cuotas:', error);
      alert('Error al cargar las cuotas del contrato');
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosReales = async () => {
    try {
      setLoading(true);
      
      const estadisticas = await apiCuotas.getEstadisticasDashboard();
      setStats({
        totalContratos: estadisticas.totalContratos,
        emprendedoresActivos: estadisticas.emprendedoresActivos,
        cuotasPendientes: estadisticas.cuotasPendientes,
        totalRecaudado: estadisticas.totalRecaudado
      });

      const contratosData = await apiCuotas.getContratos();
      setContratos(contratosData);
      
    } catch (error) {
      console.error('Error cargando datos reales:', error);
      alert('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const confirmarPago = async (id_cuota) => {
    try {
      setLoading(true);
      
      const confirmar = window.confirm('¿Está seguro de confirmar este pago?');
      if (!confirmar) {
        setLoading(false);
        return;
      }
      
      const resultado = await apiCuotas.confirmarPagoIFEMI(id_cuota);
      
      const cuotasActualizadas = cuotasContrato.map(cuota => 
        cuota.id_cuota === id_cuota 
          ? { ...cuota, confirmacionifemi: 'Confirmado' }
          : cuota
      );
      
      setCuotasContrato(cuotasActualizadas);
      alert('✅ Pago confirmado exitosamente');
      
    } catch (error) {
      console.error('Error confirmando pago:', error);
      alert('❌ Error al confirmar el pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const rechazarPago = async (id_cuota) => {
    try {
      setLoading(true);
      
      const motivo = prompt('Ingrese el motivo del rechazo:');
      if (!motivo) {
        setLoading(false);
        return;
      }
      
      const confirmar = window.confirm('¿Está seguro de rechazar este pago?');
      if (!confirmar) {
        setLoading(false);
        return;
      }
      
      const resultado = await apiCuotas.rechazarPagoIFEMI(id_cuota, motivo);
      
      const cuotasActualizadas = cuotasContrato.map(cuota => 
        cuota.id_cuota === id_cuota 
          ? { 
              ...cuota, 
              confirmacionifemi: 'Rechazado',
              estado_cuota: 'Pendiente',
              fecha_pagada: null
            }
          : cuota
      );
      
      setCuotasContrato(cuotasActualizadas);
      alert('✅ Pago rechazado exitosamente');
      
    } catch (error) {
      console.error('Error rechazando pago:', error);
      alert('❌ Error al rechazar el pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const recalcularCuotas = async () => {
  if (!contratoSeleccionado) return;

  try {
    setLoading(true);
    
    const confirmar = window.confirm(
      `¿Está seguro de recalcular las cuotas pendientes?\n\n` +
      `Configuración del contrato:\n` +
      `• Total de cuotas: ${contratoSeleccionado.cuotas}\n` +
      `• Cuotas de gracia: ${contratoSeleccionado.gracia || 0}\n` +
      `• Cuotas ya pagadas: ${cuotasContrato.filter(c => c.estado_cuota === 'Pagado').length}\n` +
      `• Cuotas de gracia usadas: ${cuotasContrato.filter(c => c.cuota_gracia && c.estado_cuota === 'Pagado').length}\n\n` +
      `Esta acción eliminará todas las cuotas pendientes y las recreará considerando las cuotas de gracia disponibles.`
    );

    if (!confirmar) {
      setLoading(false);
      return;
    }

    const resultado = await apiCuotas.recalcularCuotasPendientes(
      contratoSeleccionado.id_contrato
    );

    // Mostrar resumen detallado
    if (resultado.resumen) {
      alert(`✅ ${resultado.message}\n\n` +
        `Resumen del recálculo:\n` +
        `• Cuotas con gracia aplicadas: ${resultado.resumen.cuotas_con_gracia}\n` +
        `• Cuotas normales: ${resultado.resumen.cuotas_normales}\n` +
        `• Monto por cuota normal: $${resultado.resumen.monto_cuota_normal}\n` +
        `• Total nuevas cuotas: ${resultado.resumen.nuevas_cuotas_pendientes}\n` +
        `• Saldo pendiente: $${resultado.resumen.saldo_pendiente}`);
    } else {
      alert('✅ ' + resultado.message);
    }
    
    await cargarCuotasContrato(contratoSeleccionado.id_contrato);
    
  } catch (error) {
    console.error('Error recalculando cuotas:', error);
    alert('❌ Error al recalcular: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const fueRecalculado = (idContrato) => {
    return contratosRecalculados.has(idContrato);
  };

  const generarReporte = async (contratoId) => {
    try {
      const contrato = contratos.find(c => c.id_contrato === contratoId);
      if (!contrato) return;

      const cuotasData = await apiCuotas.getCuotasPorContrato(contratoId);
      const cuotasPagadas = cuotasData.filter(c => c.estado_cuota === 'Pagado').length;
      const cuotasConfirmadas = cuotasData.filter(c => c.confirmacionifemi === 'Confirmado').length;
      const totalCuotas = cuotasData.length;
      
      alert(`📊 Reporte de ${contrato.numero_contrato}\n
        Cuotas pagadas: ${cuotasPagadas}/${totalCuotas}\n
        Cuotas confirmadas: ${cuotasConfirmadas}\n
        Emprendedor: ${contrato.cedula_emprendedor}`);
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  const HeaderSection = ({ title, subtitle, showBackButton = false, children }) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        {showBackButton && (
          <button 
            className="bg-white p-2 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer"
            onClick={() => setVista('contratos')}
            disabled={loading}
          >
            <TbArrowBack size={20} className="text-indigo-600" />
          </button>
        )}
        <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
          <TbFileText size={24} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );

  const Footer = ({ text = "Panel de Administración" }) => (
    <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
      © {new Date().getFullYear()} IFEMI & UPTYAB. {text}
    </footer>
  );

  const renderVistaContratos = () => (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        <Header toggleMenu={toggleMenu} />
        
        <main className="flex-1 p-6 bg-gray-50">
          <HeaderSection
            title="Gestión de Contratos"
            subtitle="Administra los contratos y cuotas de los emprendedores"
          >
            <div className="flex space-x-3">
              <button 
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
                onClick={cargarDatosReales}
                disabled={loading}
              >
                <TbRefresh className="mr-2" size={16} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </HeaderSection>

          <StatsCards stats={stats} />
          <ContratosList 
            contratos={contratos}
            loading={loading}
            onVerCuotas={cargarCuotasContrato}
            onGenerarReporte={generarReporte}
            onRefresh={cargarDatosReales}
          />
        </main>

        <Footer />
      </div>
    </div>
  );

  const renderVistaDetalle = () => {
    if (!contratoSeleccionado) return null;

    const cuotasPagadas = cuotasContrato.filter(c => c.estado_cuota === 'Pagado');
    const cuotasConfirmadas = cuotasContrato.filter(c => c.confirmacionifemi === 'Confirmado');
    const cuotasPorConfirmar = cuotasContrato.filter(c => 
      c.estado_cuota === 'Pagado' && c.confirmacionifemi === 'A Recibido'
    );
    
    const totalPagado = cuotasPagadas.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0);
    const montoTotal = parseFloat(contratoSeleccionado.monto_devolver || 0);

    const contratoStats = [
      { label: "Total Contrato", value: `$${montoTotal}`, color: "indigo", icon: TbFile },
      { label: "Pagado", value: `$${totalPagado.toFixed(2)}`, color: "green", icon: TbCircleCheck },
      { label: "Pendiente", value: `$${(montoTotal - totalPagado).toFixed(2)}`, color: "amber", icon: TbClock },
      { label: "Por Confirmar", value: `${cuotasPorConfirmar.length}`, color: "blue", icon: TbClockHour4 }
    ];

    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        {menuOpen && <Menu />}

        <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
          <Header toggleMenu={toggleMenu} />
          
          <main className="flex-1 p-6 bg-gray-50">
            <HeaderSection
              title={`Cuotas de ${contratoSeleccionado.cedula_emprendedor}`}
              subtitle={`Contrato: ${contratoSeleccionado.numero_contrato}`}
              showBackButton={true}
            >
              <div className="flex space-x-3">
                <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                  <TbDownload className="mr-2" size={16} />
                  Exportar
                </button>
                
                  <button 
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-amber-600 transition-colors"
                    onClick={recalcularCuotas}
                    disabled={loading}
                  >
                    <TbRefresh className="mr-2" size={16} />
                    {loading ? 'Procesando...' : 'Generar cuotas'}
                  </button>
              </div>
            </HeaderSection>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {contratoStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-${stat.color}-500`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</h2>
                        <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                      </div>
                      <div className={`bg-${stat.color}-100 p-2 rounded-full`}>
                        <IconComponent size={20} className={`text-${stat.color}-600`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <CuotasTable 
              cuotasContrato={cuotasContrato}
              loading={loading}
              onConfirmarPago={confirmarPago}
              onRechazarPago={rechazarPago}
              contratoSeleccionado={contratoSeleccionado}
            />
          </main>

          <Footer text="Gestión de Cuotas" />
        </div>
      </div>
    );
  };

  if (vista === 'contratos') {
    return renderVistaContratos();
  }

  if (vista === 'detalle' && contratoSeleccionado) {
    return renderVistaDetalle();
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <TbLoader className="animate-spin text-4xl text-indigo-600 mb-4 mx-auto" />
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;