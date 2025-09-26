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
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-400 border-2 border-gray-300"
            } font-semibold shadow-md`}
          >
            {stepNumber}
          </div>
          <span className="text-sm mt-1 font-medium text-gray-700">
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
  // Agregar otros datos, incluyendo id_req
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
    <div>
      <label className="block mb-3 text-gray-700 font-medium text-lg">
        Por favor, indique los requisitos que posee:
      </label>

      <label className="block mb-3 text-gray-700 font-medium text-lg">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAllChange}
          className="mr-2"
        />
        Seleccionar todos
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto rounded-xl p-4 bg-gray-50 border border-gray-200">
        {requerimientos.map((req) => (
          <div
            key={req.id_requerimientos}
            className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <label className="flex items-center cursor-pointer w-full">
              <div className="relative">
                <input
                  type="checkbox"
                  id={`requerimiento-${req.id_requerimientos}`}
                  name="opt_requerimiento"
                  value={req.id_requerimientos}
                  checked={formData.opt_requerimiento.includes(
                    req.id_requerimientos
                  )}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-md border-2 ${
                    formData.opt_requerimiento.includes(req.id_requerimientos)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                  } transition-colors`}
                >
                  {formData.opt_requerimiento.includes(
                    req.id_requerimientos
                  ) && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="ml-3 text-gray-700 font-medium">
                {req.nombre_requerimiento}
              </span>
            </label>
          </div>
        ))}
      </div>
      {errors.opt_requerimiento && (
        <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-3 mt-2 transition-all">
          <svg
            className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-600 text-sm font-medium">
            {errors.opt_requerimiento}
          </p>
        </div>
      )}
    </div>
    <div className="flex justify-end mt-6">
      <button
        type="button"
        onClick={handleNext}
        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
        disabled={formData.opt_requerimiento.length === 0}
      >
        Siguiente
        <i className="bx bx-chevron-right ml-2 text-xl"></i>
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
    <div>
      <label
        htmlFor="archivo"
        className="block mb-3 text-gray-700 font-medium text-lg"
      >
        Adjunte el archivo PDF con los documentos seleccionados
      </label>
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
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
      />
      {errors.archivo && (
        <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-3 mt-2 transition-all">
          <svg
            className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-600 text-sm font-medium">{errors.archivo}</p>
        </div>
      )}
    </div>
    <div className="mt-4">
      <label className="block mb-2 text-gray-700 font-medium">
        Fecha para llevar los documentos:
      </label>
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
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
      />
      {errors.fecha_llevar && (
        <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-3 mt-2 transition-all">
          <svg
            className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-600 text-sm font-medium">
            {errors.fecha_llevar}
          </p>
        </div>
      )}
    </div>
    <div className="flex justify-between mt-6">
      <button
        type="button"
        onClick={handleBack}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 flex items-center"
      >
        <i className="bx bx-chevron-left mr-2 text-xl"></i>
        Anterior
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
        disabled={!formData.archivo || !formData.fecha_llevar}
      >
        Siguiente
        <i className="bx bx-chevron-right ml-2 text-xl"></i>
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
    <div>
      <label
        htmlFor="motivo"
        className="block mb-3 text-gray-700 font-medium text-lg"
      >
        Motivo de solicitud de crédito
      </label>
      <textarea
        id="motivo"
        value={motivo}
        onChange={handleMotivoChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
        rows={5}
        placeholder="Describa detalladamente el motivo de su solicitud de crédito..."
      />
      {errors.motivo && (
        <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-3 mt-2 transition-all">
          <svg
            className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-600 text-sm font-medium">{errors.motivo}</p>
        </div>
      )}
    </div>
    <div className="flex justify-between mt-6">
      <button
        type="button"
        onClick={handleBack}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 flex items-center"
      >
        <i className="bx bx-chevron-left mr-2 text-xl"></i>
        Anterior
      </button>
      <button
        type="submit"
        disabled={loading || !motivo.trim()}
        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed flex items-center"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Procesando...
          </>
        ) : (
          <>
            Enviar Solicitud
            <i className="bx bx-send ml-2 text-xl"></i>
          </>
        )}
      </button>
    </div>
  </>
);

const ResultadoSolicitud = ({ resultado, requerimientos, handleVolver }) => {
  // Verificar si resultado es un array o un objeto
  const esArray = Array.isArray(resultado);
  const datos = esArray ? resultado : [resultado];

  // Obtener información de la solicitud
  const solicitud = datos[0]?.solicitud || datos[0] || {};
  const estadoSolicitud = solicitud.estatus || "Pendiente";

  // Obtener requerimientos seleccionados
  const requerimientosSeleccionados = datos
    .filter((item) => item.id_requerimientos)
    .map((item) => {
      const req = requerimientos.find(
        (r) => r.id_requerimientos === item.id_requerimientos
      );
      return req ? req.nombre_requerimiento : "";
    })
    .filter((nombre) => nombre !== "");

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header con gradiente */}
      <div className="text-center mb-10 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 border border-green-200/50 shadow-sm">
        <div className="relative inline-flex mb-5">
          <div className="absolute inset-0 bg-green-400/20 blur-lg rounded-full"></div>
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <i className="bx bx-check-circle text-4xl text-white"></i>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent mb-3">
          ¡Solicitud Enviada con Éxito!
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Hemos recibido tu solicitud de crédito. Te notificaremos a travez del sistema
          una vez que sea procesada.
        </p>
      </div>

      {/* Grid de información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tarjeta de estado */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <i className="bx bx-info-circle text-xl text-blue-600"></i>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">Estado de la Solicitud</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fecha de envío:</span>
                <span className="font-medium">{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estado actual:</span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  estadoSolicitud === "Aprobado" ? "bg-green-100 text-green-800 border border-green-200" :
                  estadoSolicitud === "Rechazado" ? "bg-red-100 text-red-800 border border-red-200" :
                  "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200"
                }`}>
                  {estadoSolicitud}
                </span>
              </div>

              {solicitud.fecha_llevar && (
                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center text-blue-700">
                    <i className="bx bx-calendar-event mr-2"></i>
                    <span className="font-medium">Próxima cita:</span>
                  </div>
                  <span className="text-blue-900 font-semibold">
                    {new Date(solicitud.fecha_llevar).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tarjeta de información personal */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                <i className="bx bx-user text-xl text-purple-600"></i>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">Datos del Solicitante</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <i className="bx bx-id-card text-gray-400 mr-3"></i>
                <div>
                  <div className="text-xs text-gray-500">CÉDULA</div>
                  <div className="font-medium">{solicitud.cedula_emprendedor || "No especificada"}</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <i className="bx bx-bullseye text-gray-400 mr-3"></i>
                <div>
                  <div className="text-xs text-gray-500">MOTIVO DEL CRÉDITO</div>
                  <div className="font-medium">{solicitud.motivo || "No especificado"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requerimientos adjuntados */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
            <i className="bx bx-folder-open text-xl text-indigo-600"></i>
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">Documentos Adjuntados</h3>
        </div>
        
        {requerimientosSeleccionados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requerimientosSeleccionados.map((req, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-green-50/50 border border-green-200/50 hover:bg-green-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="bx bx-check text-green-600 text-sm"></i>
                </div>
                <span className="text-gray-700">{req}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <i className="bx bx-folder text-4xl mb-3 opacity-50"></i>
            <p>No se adjuntaron documentos adicionales</p>
          </div>
        )}
      </div>

      {/* Próximos pasos */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 shadow-sm mb-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mr-3">
            <i className="bx bx-time-five text-xl text-amber-600"></i>
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">Siguientes Pasos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-amber-600 font-bold text-sm">1</span>
            </div>
            <p className="text-gray-700">Revisión de documentación por nuestro equipo especializado</p>
          </div>
          
          <div className="flex items-start space-x-3 p-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-amber-600 font-bold text-sm">2</span>
            </div>
            <p className="text-gray-700">Notificación vía por nuestro sistema con la respuesta</p>
          </div>
          
          <div className="flex items-start space-x-3 p-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-amber-600 font-bold text-sm">3</span>
            </div>
            <p className="text-gray-700">Tiempo estimado de evaluación: 5-10 días hábiles</p>
          </div>
          
          {solicitud.fecha_llevar && (
            <div className="flex items-start space-x-3 p-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-amber-600 font-bold text-sm">4</span>
              </div>
              <p className="text-gray-700">
                Presentación de documentos físicos el{" "}
                <span className="font-semibold text-amber-700">
                  {new Date(solicitud.fecha_llevar).toLocaleDateString('es-ES')}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botón de acción */}
      <div className="text-center">
        <button
          onClick={handleVolver}
          className="group relative bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-white/10 rounded-2xl transform group-hover:scale-110 transition duration-300"></div>
          <i className="bx bx-plus-circle text-xl mr-3 relative z-10"></i>
          <span className="relative z-10">Realizar Nueva Solicitud</span>
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          ¿Necesitas ayuda?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
};

const RequireSolicit = ({ setUser }) => {
  const navigate = useNavigate();

  // Estados
  const [solicitud, setSolicitud] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [requerimientos, setRequerimientos] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [formData, setFormData] = useState({
    cedula_emprendedor: "",
    motivo: "",
    opt_requerimiento: [],
    archivo: null,
    fecha_llevar: "", // Nuevo campo
  });
  const [step, setStep] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Limpia errores al seleccionar requerimientos
  useEffect(() => {
    if (formData.opt_requerimiento.length > 0 && errors.opt_requerimiento) {
      setErrors((prev) => ({ ...prev, opt_requerimiento: "" }));
    }
  }, [formData.opt_requerimiento, errors]);

  // Obtener datos del usuario
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

  // Obtener requerimientos
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
    if (requerimientos.length > 0) {
      const allIds = requerimientos.map((r) => r.id_requerimientos);
      const todosSeleccionados = allIds.every((id) =>
        formData.opt_requerimiento.includes(id)
      );
      setSelectAll(todosSeleccionados);
    }
  }, [requerimientos, formData.opt_requerimiento]);

  // Verificar registros existentes por cédula
  useEffect(() => {
    const verificarRegistrosExistentes = async () => {
      if (user?.cedula_usuario) {
        try {
          const datosExistentes = await getRequerimientoEmprendedor(
            user.cedula_usuario
          );
          if (
            datosExistentes &&
            ((Array.isArray(datosExistentes) && datosExistentes.length > 0) ||
              (!Array.isArray(datosExistentes) &&
                Object.keys(datosExistentes).length > 0))
          ) {
            setResultado(datosExistentes);
            const solicitudData = await getSolicitudPorCedula(
              user.cedula_usuario
            );
            setSolicitud(solicitudData);
          }
        } catch (error) {
          console.error("Error verificando registros existentes:", error);
        }
      }
    };
    if (!resultado) verificarRegistrosExistentes();
  }, [user, resultado]);

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

  // Funciones para manejar pasos del formulario
  const handleNext = () => {
    if (validateForm()) {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // Validar formulario
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

  // Manejar cambios en requerimientos
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

  // Enviar todo en enviarRequerimiento
  const enviarRequerimiento = async () => {
    setLoading(true);
    try {
      // 1. Crear solicitud y obtener id_req
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
      const id_req = solicitudResponse.id_req; // Obtienes el id_req

      // 2. Subir archivo si existe
      if (formData.archivo) {
        const datosArchivo = {
          cedula_emprendedor: formData.cedula_emprendedor,
          fecha_llevar: formData.fecha_llevar,
          id_req: id_req,
        };
        await subirArchivo(formData.archivo, datosArchivo);
      }

      // 3. Crear requerimiento del emprendedor
      await createRequerimientoEmprendedor({
        cedula_emprendedor: formData.cedula_emprendedor,
        opt_requerimiento: formData.opt_requerimiento,
      });

      // 4. Obtener datos completos para mostrar
      const datosCompletos = await getRequerimientoEmprendedor(
        formData.cedula_emprendedor
      );
      const solicitudCompleta = await getSolicitudPorCedula(
        formData.cedula_emprendedor
      );

      // Combinar datos para mostrar en el resultado
      const resultadoCompleto = {
        requerimientos: datosCompletos,
        solicitud: solicitudCompleta,
      };

      setResultado(resultadoCompleto);
      setSolicitud(solicitudCompleta);

      Swal.fire({
        title: "¡Enviado!",
        text: "Requerimiento, archivo y solicitud enviados correctamente",
        icon: "success",
        confirmButtonColor: "#0F3C5B",
        background: "#f8fafc",
        customClass: {
          popup: "rounded-xl shadow-2xl",
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
          popup: "rounded-xl shadow-2xl",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      enviarRequerimiento();
    }
  };

  const handleVolver = () => {
    setResultado(null);
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 font-sans">
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
          {/* Encabezado */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0 mt-12">
            <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
              <i className="bx bx-file text-3xl text-indigo-600"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Solicitud de Credito
              </h1>
              <p className="text-gray-600">
                Complete los siguientes pasos para completar su solicitud
              </p>
            </div>
          </div>

          {/* Indicador de progreso */}
          {!resultado && <ProgressIndicator step={step} />}

          {/* FORMULARIO */}
          {!resultado && requerimientos.length > 0 && (
            <section className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-4">
                {step === 1
                  ? "Seleccione los requerimientos que posee"
                  : step === 2
                  ? "Adjunte los documentos (PDF)"
                  : "Motivo de Solicitud de Crédito"}
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
          )}

          {/* Mostrar resultados */}
          {resultado && (
            <ResultadoSolicitud
              resultado={resultado.requerimientos || resultado}
              requerimientos={requerimientos}
              handleVolver={handleVolver}
            />
          )}
        </main>
        {/* Pie de página */}
        <footer className="mt-auto p-6 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
};

export default RequireSolicit;