import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Swal from "sweetalert2";

import { getUsuarioPorCedula } from "../services/api_usuario";
import { getRequerimientos } from "../services/api_requerimientos";
import {
  createRequerimientoEmprendedor,
  getRequerimientoEmprendedor,
} from "../services/api_requerimiento_emprendedor";
import {
  createSolicitud,
  getSolicitudPorCedula,
} from "../services/api_solicitud";
import apiArchivo from "../services/api_archivo";

// Componente Modal para detalles
const ModalDetalles = ({ solicitud, requerimientos, isOpen, onClose }) => {
  if (!isOpen) return null;

  const requerimientosSolicitud = solicitud.requerimientos || [];
  const nombresRequerimientos = requerimientosSolicitud.map(reqId => {
    const req = requerimientos.find(r => r.id_requerimientos === reqId);
    return req ? req.nombre_requerimiento : "";
  }).filter(nombre => nombre !== "");

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Aprobado":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rechazado":
        return "bg-red-100 text-red-800 border-red-200";
      case "En revisión":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pendiente":
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "Aprobado":
        return "bx-check-circle";
      case "Rechazado":
        return "bx-x-circle";
      case "En revisión":
        return "bx-time";
      case "Pendiente":
      default:
        return "bx-hourglass";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Detalles de Solicitud #{solicitud.id_req || "N/A"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Estado</label>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(solicitud.estatus)} flex items-center border mt-1 w-fit`}>
                <i className={`bx ${getEstadoIcon(solicitud.estatus)} mr-1`}></i>
                {solicitud.estatus || "Pendiente"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Fecha de creación</label>
              <p className="text-sm text-gray-800 mt-1">
                {new Date(solicitud.fecha_creacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Motivo completo */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Motivo de la solicitud</label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-800 leading-relaxed">
                {solicitud.motivo || "No se especificó motivo"}
              </p>
            </div>
          </div>

          {/* Documentos requeridos */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-3">Documentos adjuntados</label>
            <div className="space-y-2">
              {nombresRequerimientos.map((nombre, index) => (
                <div key={index} className="flex items-center bg-green-50 rounded-lg p-3 border border-green-200">
                  <i className="bx bx-check text-green-500 mr-3"></i>
                  <span className="text-sm text-gray-800">{nombre}</span>
                </div>
              ))}
              {nombresRequerimientos.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4 bg-gray-50 rounded-lg border border-gray-200">
                  No se adjuntaron documentos
                </div>
              )}
            </div>
          </div>

          {/* Fecha de cita */}
          {solicitud.fecha_llevar && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <i className="bx bx-calendar text-blue-500 text-xl mr-3"></i>
                <div>
                  <p className="text-sm font-medium text-blue-800">Próxima cita programada</p>
                  <p className="text-sm text-blue-900">
                    {new Date(solicitud.fecha_llevar).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium text-gray-500">ID de Solicitud</label>
              <p className="text-gray-800">{solicitud.id_req || "N/A"}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-500">Total de documentos</label>
              <p className="text-gray-800">{nombresRequerimientos.length} documentos</p>
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componentes internos para mejor organización
const ProgressIndicator = ({ step }) => (
  <div className="max-w-xl mx-auto mb-8">
    <div className="flex items-center justify-between relative">
      <div className="absolute top-3 left-0 right-0 h-1.5 bg-gray-200 rounded-full -z-10"></div>
      <div
        className="absolute top-3 left-0 h-1.5 bg-blue-600 rounded-full -z-10 transition-all duration-500"
        style={{
          width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
        }}
      ></div>
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= stepNumber
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-400 border-2 border-gray-300"
            } font-semibold text-sm`}
          >
            {stepNumber}
          </div>
          <span className="text-xs mt-1 font-medium text-gray-700">
            {stepNumber === 1 && "Requerimientos"}
            {stepNumber === 2 && "Documentos"}
            {stepNumber === 3 && "Motivo"}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const subirArchivo = async (archivo, datosAdicionales) => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  Object.entries(datosAdicionales).forEach(([key, value]) => {
    formData.append(key, value);
  });
  const response = await apiArchivo.crearArchivo(formData);
  return response;
};

const Step1Requerimientos = ({
  requerimientos,
  formData,
  errors,
  selectAll,
  handleInputChange,
  handleSelectAllChange,
  handleNext,
}) => (
  <>
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Selecciona tus requisitos
        </h3>
        <p className="text-gray-600 text-sm">
          Marca todos los documentos que tengas disponibles
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAllChange}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              selectAll 
                ? "bg-blue-600 border-blue-600" 
                : "border-gray-400 bg-white"
            }`}>
              {selectAll && (
                <i className="bx bx-check text-white text-xs"></i>
              )}
            </div>
          </div>
          <span className="ml-2 text-gray-700 font-medium text-base">
            Seleccionar todos
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto rounded-lg p-4 bg-gray-50 border border-gray-200">
        {requerimientos.map((req) => (
          <div
            key={req.id_requerimientos}
            className={`flex items-center p-3 rounded-md transition-all cursor-pointer ${
              formData.opt_requerimiento.includes(req.id_requerimientos)
                ? "bg-blue-50 border border-blue-200"
                : "bg-white border border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => {
              const event = {
                target: {
                  type: "checkbox",
                  value: req.id_requerimientos,
                  checked: !formData.opt_requerimiento.includes(req.id_requerimientos)
                }
              };
              handleInputChange(event);
            }}
          >
            <label className="flex items-center cursor-pointer w-full">
              <div className="relative">
                <input
                  type="checkbox"
                  id={`requerimiento-${req.id_requerimientos}`}
                  name="opt_requerimiento"
                  value={req.id_requerimientos}
                  checked={formData.opt_requerimiento.includes(req.id_requerimientos)}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-all ${
                    formData.opt_requerimiento.includes(req.id_requerimientos)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-400 bg-white"
                  }`}
                >
                  {formData.opt_requerimiento.includes(req.id_requerimientos) && (
                    <i className="bx bx-check text-white text-xs"></i>
                  )}
                </div>
              </div>
              <span className="ml-3 text-gray-700 text-sm">
                {req.nombre_requerimiento}
              </span>
            </label>
          </div>
        ))}
      </div>
      {errors.opt_requerimiento && (
        <div className="flex items-center bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
          <i className="bx bx-error-circle text-red-500 mr-2"></i>
          <p className="text-red-600 text-sm font-medium">
            {errors.opt_requerimiento}
          </p>
        </div>
      )}
    </div>
    <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={handleNext}
        disabled={formData.opt_requerimiento.length === 0}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
      >
        Continuar
        <i className="bx bx-chevron-right ml-1 text-base"></i>
      </button>
    </div>
  </>
);

const Step2Documentos = ({
  formData,
  errors,
  setFormData,
  handleBack,
  handleNext,
}) => (
  <>
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Adjunta tus documentos
        </h3>
        <p className="text-gray-600 text-sm">
          Sube el archivo PDF y selecciona una fecha para tu cita
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <label
          htmlFor="archivo"
          className="block mb-3 text-gray-700 font-medium text-base"
        >
          Documento PDF
        </label>
        <div className="relative">
          <input
            type="file"
            id="archivo"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files[0];
              setFormData((prev) => ({ ...prev, archivo: file }));
              if (errors.archivo) {
                setErrors((prev) => ({ ...prev, archivo: "" }));
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-white transition-all hover:border-blue-500 hover:bg-blue-50">
            <i className="bx bx-cloud-upload text-2xl text-blue-500 mb-2"></i>
            <p className="text-gray-700 font-medium text-sm mb-1">
              {formData.archivo ? formData.archivo.name : "Haz clic para subir tu archivo PDF"}
            </p>
            <p className="text-gray-500 text-xs">
              {formData.archivo ? 
                `Tamaño: ${(formData.archivo.size / 1024 / 1024).toFixed(2)} MB` : 
                "Formatos aceptados: PDF (máx. 10MB)"}
            </p>
          </div>
        </div>
        {errors.archivo && (
          <div className="flex items-center bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <i className="bx bx-error-circle text-red-500 mr-2"></i>
            <p className="text-red-600 text-sm font-medium">{errors.archivo}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <label className="block mb-3 text-gray-700 font-medium text-base">
          Fecha para llevar los documentos
        </label>
        <div className="relative">
          <i className="bx bx-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
          <input
            type="date"
            value={formData.fecha_llevar}
            onChange={(e) => {
              const fecha = e.target.value;
              setFormData((prev) => ({ ...prev, fecha_llevar: fecha }));
              if (errors.fecha_llevar) {
                setErrors((prev) => ({ ...prev, fecha_llevar: "" }));
              }
            }}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white text-sm"
          />
        </div>
        {errors.fecha_llevar && (
          <div className="flex items-center bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <i className="bx bx-error-circle text-red-500 mr-2"></i>
            <p className="text-red-600 text-sm font-medium">{errors.fecha_llevar}</p>
          </div>
        )}
      </div>
    </div>
    <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={handleBack}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition-all flex items-center text-sm"
      >
        <i className="bx bx-chevron-left mr-1 text-base"></i>
        Regresar
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={!formData.archivo || !formData.fecha_llevar}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
      >
        Continuar
        <i className="bx bx-chevron-right ml-1 text-base"></i>
      </button>
    </div>
  </>
);

const Step3Motivo = ({
  motivo,
  errors,
  loading,
  handleMotivoChange,
  handleBack,
  handleSubmit,
}) => (
  <>
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Cuéntanos tu motivo
        </h3>
        <p className="text-gray-600 text-sm">
          Describe detalladamente para qué necesitas el crédito
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <label
          htmlFor="motivo"
          className="block mb-3 text-gray-700 font-medium text-base"
        >
          Motivo de solicitud
        </label>
        <div className="relative">
          <textarea
            id="motivo"
            value={motivo}
            onChange={handleMotivoChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white resize-none text-sm"
            rows={5}
            placeholder="Describe aquí el propósito de tu solicitud de crédito, cómo planeas utilizar los fondos y cualquier información relevante que nos ayude a entender tu proyecto..."
          />
          <div className="absolute bottom-2 right-2 text-gray-400 text-xs">
            {motivo.length}/500
          </div>
        </div>
        {errors.motivo && (
          <div className="flex items-center bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <i className="bx bx-error-circle text-red-500 mr-2"></i>
            <p className="text-red-600 text-sm font-medium">{errors.motivo}</p>
          </div>
        )}
      </div>
    </div>
    <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={handleBack}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition-all flex items-center text-sm"
      >
        <i className="bx bx-chevron-left mr-1 text-base"></i>
        Regresar
      </button>
      <button
        type="submit"
        disabled={loading || !motivo.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center text-sm"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Enviando...
          </>
        ) : (
          <>
            <i className="bx bx-send mr-1 text-base"></i>
            Enviar Solicitud
          </>
        )}
      </button>
    </div>
  </>
);

// Componente individual para cada tarjeta de solicitud
const SolicitudCard = ({ solicitud, requerimientos }) => {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  
  const estadoSolicitud = solicitud.estatus || "Pendiente";
  const fechaSolicitud = solicitud.fecha_creacion || new Date();
  
  const requerimientosSolicitud = solicitud.requerimientos || [];
  const nombresRequerimientos = requerimientosSolicitud.map(reqId => {
    const req = requerimientos.find(r => r.id_requerimientos === reqId);
    return req ? req.nombre_requerimiento : "";
  }).filter(nombre => nombre !== "");

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Aprobado":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rechazado":
        return "bg-red-100 text-red-800 border-red-200";
      case "En revisión":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pendiente":
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "Aprobado":
        return "bx-check-circle";
      case "Rechazado":
        return "bx-x-circle";
      case "En revisión":
        return "bx-time";
      case "Pendiente":
      default:
        return "bx-hourglass";
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Header de la tarjeta */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-gray-800 text-base">
              Solicitud #{solicitud.id_req || "N/A"}
            </h3>
            <p className="text-gray-500 text-xs">
              {new Date(fechaSolicitud).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(estadoSolicitud)} flex items-center border`}>
            <i className={`bx ${getEstadoIcon(estadoSolicitud)} mr-1`}></i>
            {estadoSolicitud}
          </div>
        </div>

        {/* Motivo */}
        <div className="mb-3">
          <p className="text-gray-600 text-sm line-clamp-2">
            {solicitud.motivo || "Sin motivo especificado"}
          </p>
        </div>

        {/* Documentos adjuntados */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-700 text-xs mb-2">Documentos:</h4>
          <div className="space-y-1">
            {nombresRequerimientos.slice(0, 3).map((nombre, idx) => (
              <div key={idx} className="flex items-center text-gray-600 text-xs">
                <i className="bx bx-check text-green-500 mr-1"></i>
                <span className="truncate">{nombre}</span>
              </div>
            ))}
            {nombresRequerimientos.length > 3 && (
              <div className="text-gray-500 text-xs">
                +{nombresRequerimientos.length - 3} más...
              </div>
            )}
            {nombresRequerimientos.length === 0 && (
              <div className="text-gray-400 text-xs">Sin documentos</div>
            )}
          </div>
        </div>

        {/* Fecha de cita */}
        {solicitud.fecha_llevar && (
          <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center text-blue-700 text-xs">
              <i className="bx bx-calendar-event mr-1"></i>
              <span className="font-medium">Próxima cita:</span>
            </div>
            <span className="text-blue-900 font-semibold text-xs">
              {new Date(solicitud.fecha_llevar).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}

        {/* Footer de la tarjeta */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <button 
            onClick={() => setMostrarDetalles(true)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
          >
            <i className="bx bx-show mr-1"></i>
            Ver detalles
          </button>
          <div className="text-gray-400 text-xs">
            ID: {solicitud.id_req || "N/A"}
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      <ModalDetalles
        solicitud={solicitud}
        requerimientos={requerimientos}
        isOpen={mostrarDetalles}
        onClose={() => setMostrarDetalles(false)}
      />
    </>
  );
};

// Componente para mostrar la lista de solicitudes
const ListaSolicitudes = ({ solicitudes, requerimientos, onNuevaSolicitud }) => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header con botón de nueva solicitud */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 mt-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <i className="bx bx-file text-xl text-blue-600"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mis Solicitudes de Crédito
            </h1>
            <p className="text-gray-600 text-sm">
              Gestiona y revisa el estado de todas tus solicitudes
            </p>
          </div>
        </div>
        <button
          onClick={onNuevaSolicitud}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all flex items-center text-sm"
        >
          <i className="bx bx-plus-circle mr-2"></i>
          Nueva Solicitud
        </button>
      </div>

      {/* Grid de solicitudes */}
      {solicitudes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {solicitudes.map((solicitud, index) => (
            <SolicitudCard 
              key={solicitud.id_req || index}
              solicitud={solicitud}
              requerimientos={requerimientos}
            />
          ))}
        </div>
      ) : (
        // Estado cuando no hay solicitudes
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
              <i className="bx bx-file-blank text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay solicitudes
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Aún no has realizado ninguna solicitud de crédito. Comienza creando tu primera solicitud.
            </p>
            <button
              onClick={onNuevaSolicitud}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all flex items-center mx-auto text-sm"
            >
              <i className="bx bx-plus-circle mr-2"></i>
              Crear Primera Solicitud
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente del formulario de solicitud
const FormularioSolicitud = ({ 
  requerimientos, 
  formData, 
  setFormData, 
  step, 
  setStep, 
  motivo, 
  setMotivo, 
  errors, 
  setErrors, 
  loading, 
  selectAll, 
  setSelectAll,
  handleInputChange,
  handleSelectAllChange,
  handleMotivoChange,
  handleSubmit,
  onCancelar
}) => {
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (step === 1) {
      if (formData.opt_requerimiento.length === 0) {
        newErrors.opt_requerimiento =
          "Debe seleccionar al menos un requerimiento.";
      }
    } else if (step === 2) {
      if (!formData.archivo) {
        newErrors.archivo = "Debe adjuntar un archivo PDF.";
      } else if (formData.archivo.type !== "application/pdf") {
        newErrors.archivo = "El archivo debe ser en formato PDF.";
      }
      if (!formData.fecha_llevar) {
        newErrors.fecha_llevar =
          "Debe seleccionar la fecha para llevar los documentos.";
      }
    } else if (step === 3) {
      if (!motivo.trim()) {
        newErrors.motivo = "El campo motivo no puede estar vacío.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header del formulario */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <i className="bx bx-edit-alt text-xl text-blue-600"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Nueva Solicitud
            </h1>
            <p className="text-gray-600 text-sm">
              Sigue los pasos para completar tu solicitud
            </p>
          </div>
        </div>
        <button
          onClick={onCancelar}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all flex items-center text-sm border border-gray-300"
        >
          <i className="bx bx-arrow-back mr-1"></i>
          Volver al Listado
        </button>
      </div>

      {/* Indicador de progreso */}
      <ProgressIndicator step={step} />

      {/* Formulario */}
      <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-4">
          {step === 1
            ? "Selecciona tus Requerimientos"
            : step === 2
            ? "Adjunta tus Documentos"
            : "Motivo de tu Solicitud"}
        </h2>
        <form
          className="space-y-6"
          onSubmit={
            step === 3
              ? handleSubmit
              : (e) => {
                  e.preventDefault();
                  handleNext();
                }
          }
        >
          {step === 1 && (
            <Step1Requerimientos
              requerimientos={requerimientos}
              formData={formData}
              errors={errors}
              selectAll={selectAll}
              handleInputChange={handleInputChange}
              handleSelectAllChange={handleSelectAllChange}
              handleNext={handleNext}
            />
          )}

          {step === 2 && (
            <Step2Documentos
              formData={formData}
              errors={errors}
              setFormData={setFormData}
              handleBack={handleBack}
              handleNext={handleNext}
            />
          )}

          {step === 3 && (
            <Step3Motivo
              motivo={motivo}
              errors={errors}
              loading={loading}
              handleMotivoChange={handleMotivoChange}
              handleBack={handleBack}
              handleSubmit={handleSubmit}
            />
          )}
        </form>
      </section>
    </div>
  );
};

// Componente principal
const RequireSolicit = ({ setUser }) => {
  const navigate = useNavigate();

  // Estados
  const [solicitudes, setSolicitudes] = useState([]);
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimientos, setRequerimientos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    cedula_emprendedor: "",
    motivo: "",
    opt_requerimiento: [],
    archivo: null,
    fecha_llevar: "",
  });
  const [step, setStep] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Efectos y funciones
  useEffect(() => {
    if (formData.opt_requerimiento.length > 0 && errors.opt_requerimiento) {
      setErrors((prev) => ({ ...prev, opt_requerimiento: "" }));
    }
  }, [formData.opt_requerimiento, errors]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            setFormData((prev) => ({
              ...prev,
              cedula_emprendedor: usuario.cedula_usuario || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  useEffect(() => {
    const fetchRequerimientos = async () => {
      try {
        const data = await getRequerimientos();
        setRequerimientos(data);
      } catch (error) {
        console.error("Error al obtener requerimientos:", error);
      }
    };
    fetchRequerimientos();
  }, []);

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      if (user?.cedula_usuario) {
        try {
          const datosExistentes = await getRequerimientoEmprendedor(
            user.cedula_usuario
          );
          
          if (datosExistentes && Array.isArray(datosExistentes) && datosExistentes.length > 0) {
            const solicitudesData = await getSolicitudPorCedula(user.cedula_usuario);
            
            if (Array.isArray(solicitudesData)) {
              const solicitudesCompletas = solicitudesData.map(solicitud => {
                const requerimientosSolicitud = datosExistentes
                  .filter(item => item.id_req === solicitud.id_req)
                  .map(item => item.id_requerimientos);
                
                return {
                  ...solicitud,
                  requerimientos: requerimientosSolicitud
                };
              });
              
              setSolicitudes(solicitudesCompletas);
            } else if (solicitudesData) {
              const requerimientosSolicitud = datosExistentes
                .filter(item => item.id_req === solicitudesData.id_req)
                .map(item => item.id_requerimientos);
              
              setSolicitudes([{
                ...solicitudesData,
                requerimientos: requerimientosSolicitud
              }]);
            }
          }
        } catch (error) {
          console.error("Error obteniendo solicitudes:", error);
        }
      }
    };
    obtenerSolicitudes();
  }, [user]);

  useEffect(() => {
    if (requerimientos.length > 0) {
      const allIds = requerimientos.map((r) => r.id_requerimientos);
      const todosSeleccionados = allIds.every((id) =>
        formData.opt_requerimiento.includes(id)
      );
      setSelectAll(todosSeleccionados);
    }
  }, [requerimientos, formData.opt_requerimiento]);

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allIds = requerimientos.map((r) => r.id_requerimientos);
      setFormData((prev) => ({ ...prev, opt_requerimiento: allIds }));
    } else {
      setFormData((prev) => ({ ...prev, opt_requerimiento: [] }));
    }
  };

  const handleInputChange = (e) => {
    const { value, type, checked } = e.target;
    const valNum = Number(value);
    setFormData((prev) => {
      let newOpt;
      if (type === "checkbox") {
        newOpt = checked
          ? [...prev.opt_requerimiento, valNum]
          : prev.opt_requerimiento.filter((id) => id !== valNum);
      } else {
        newOpt = prev.opt_requerimiento;
      }
      if (newOpt.length > 0 && errors.opt_requerimiento) {
        setErrors((prevErrors) => ({ ...prevErrors, opt_requerimiento: "" }));
      }
      return { ...prev, opt_requerimiento: newOpt };
    });
  };

  const handleMotivoChange = (e) => {
    const value = e.target.value;
    setMotivo(value);
    setFormData((prev) => ({ ...prev, motivo: value }));
    if (errors.motivo) {
      setErrors((prev) => ({ ...prev, motivo: "" }));
    }
  };

  const enviarRequerimiento = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataSolicitud = new FormData();
      formDataSolicitud.append(
        "cedula_emprendedor",
        formData.cedula_emprendedor
      );
      formDataSolicitud.append("motivo", formData.motivo);
      formDataSolicitud.append("estatus", "Pendiente");
      if (formData.fecha_llevar) {
        formDataSolicitud.append("fecha_llevar", formData.fecha_llevar);
      }
      const solicitudResponse = await createSolicitud(formDataSolicitud);
      const id_req = solicitudResponse.id_req;

      if (formData.archivo) {
        const datosArchivo = {
          cedula_emprendedor: formData.cedula_emprendedor,
          fecha_llevar: formData.fecha_llevar,
          id_req: id_req,
        };
        await subirArchivo(formData.archivo, datosArchivo);
      }

      await createRequerimientoEmprendedor({
        cedula_emprendedor: formData.cedula_emprendedor,
        opt_requerimiento: formData.opt_requerimiento,
        id_req: id_req
      });

      const datosCompletos = await getRequerimientoEmprendedor(
        formData.cedula_emprendedor
      );
      const solicitudesCompletas = await getSolicitudPorCedula(
        formData.cedula_emprendedor
      );

      let nuevasSolicitudes = [];
      
      if (Array.isArray(solicitudesCompletas)) {
        nuevasSolicitudes = solicitudesCompletas.map(solicitud => {
          const requerimientosSolicitud = datosCompletos
            .filter(item => item.id_req === solicitud.id_req)
            .map(item => item.id_requerimientos);
          
          return {
            ...solicitud,
            requerimientos: requerimientosSolicitud
          };
        });
      } else if (solicitudesCompletas) {
        const requerimientosSolicitud = datosCompletos
          .filter(item => item.id_req === solicitudesCompletas.id_req)
          .map(item => item.id_requerimientos);
        
        nuevasSolicitudes = [{
          ...solicitudesCompletas,
          requerimientos: requerimientosSolicitud
        }];
      }

      setSolicitudes(nuevasSolicitudes);
      setMostrarFormulario(false);

      setMotivo("");
      setFormData({
        cedula_emprendedor: user?.cedula_usuario || "",
        opt_requerimiento: [],
        archivo: null,
        fecha_llevar: "",
        motivo: "",
      });
      setStep(1);
      setErrors({});

      Swal.fire({
        title: "¡Éxito!",
        text: "Solicitud enviada correctamente",
        icon: "success",
        confirmButtonColor: "#0F3C5B",
        background: "#f8fafc",
        customClass: {
          popup: "rounded-lg shadow-lg",
          title: "text-lg font-bold",
        },
      });
    } catch (error) {
      console.error("Error al enviar:", error);
      Swal.fire({
        title: "¡Error!",
        text: "Hubo un error al enviar la solicitud",
        icon: "error",
        confirmButtonColor: "#dc2626",
        background: "#f8fafc",
        customClass: {
          popup: "rounded-lg shadow-lg",
          title: "text-lg font-bold",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaSolicitud = () => {
    setMostrarFormulario(true);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setMotivo("");
    setFormData({
      cedula_emprendedor: user?.cedula_usuario || "",
      opt_requerimiento: [],
      archivo: null,
      fecha_llevar: "",
      motivo: "",
    });
    setStep(1);
    setErrors({});
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Main contenido */}
        <main className="flex-1 p-6">
          {!mostrarFormulario ? (
            <ListaSolicitudes
              solicitudes={solicitudes}
              requerimientos={requerimientos}
              onNuevaSolicitud={handleNuevaSolicitud}
            />
          ) : (
            <FormularioSolicitud
              requerimientos={requerimientos}
              formData={formData}
              setFormData={setFormData}
              step={step}
              setStep={setStep}
              motivo={motivo}
              setMotivo={setMotivo}
              errors={errors}
              setErrors={setErrors}
              loading={loading}
              selectAll={selectAll}
              setSelectAll={setSelectAll}
              handleInputChange={handleInputChange}
              handleSelectAllChange={handleSelectAllChange}
              handleMotivoChange={handleMotivoChange}
              handleSubmit={enviarRequerimiento}
              onCancelar={handleCancelarFormulario}
            />
          )}
        </main>
        
        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default RequireSolicit;