import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Swal from "sweetalert2";

import { getUsuarioPorCedula } from "../services/api_usuario";
import { getRequerimientos } from "../services/api_requerimientos";
import { getRequerimientosFiador } from "../services/api_requerimientos_fiador";
import {
  createRequerimientoEmprendedor,
  getRequerimientoEmprendedor,
} from "../services/api_requerimiento_emprendedor";
import {
  createSolicitud,
  getSolicitudPorCedula,
} from "../services/api_solicitud";
import apiArchivo from "../services/api_archivo";
import { createFiador, getFiadorPorIdReq } from "../services/api_fiador_solicitud";

// Importar Tabler Icons
import {
  TbX,
  TbCheck,
  TbCalendar,
  TbFile,
  TbCalendarEvent,
  TbFolder,
  TbEdit,
  TbListCheck,
  TbCloudUpload,
  TbMessage,
  TbBulb,
  TbSend,
  TbLoader,
  TbChevronRight,
  TbChevronLeft,
  TbArrowBack,
  TbPlus,
  TbCalendarTime,
  TbFileText,
  TbRefresh,
  TbZoomIn,
  TbDownload,
  TbInfoCircle,
  TbAlertCircle,
  TbPhoto,
  TbCircleCheck,
  TbUser,
  TbId,
  TbPhone,
  TbMail
} from "react-icons/tb";

// Componente Modal mejorado para visualización de imagen
const ModalDetalles = ({ solicitud, requerimientos, isOpen, onClose }) => {
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState(null);
  const [modalImagen, setModalImagen] = useState({ open: false, imagenUrl: null });

  useEffect(() => {
    if (isOpen && solicitud?.cedula_emprendedor) {
      cargarImagenSolicitud();
    } else {
      setImagenArchivo(null);
      setErrorImagen(null);
    }
  }, [isOpen, solicitud]);

  const cargarImagenSolicitud = async () => {
    if (!solicitud?.cedula_emprendedor || !solicitud?.id_req) {
      setErrorImagen("No hay información completa de la solicitud");
      return;
    }
    
    setCargandoImagen(true);
    setErrorImagen(null);
    setImagenArchivo(null);
    
    try {
      console.log('🔍 Buscando imagen para:', {
        cedula: solicitud.cedula_emprendedor,
        id_req: solicitud.id_req,
        id_contrato: solicitud.id_contrato
      });
      
      let archivos = [];
      
      try {
        archivos = await apiArchivo.getArchivosByReq(solicitud.id_req);
        console.log('📁 Archivos por id_req:', archivos);
      } catch (error) {
        console.log('⚠️ No se encontraron archivos por id_req, buscando por cédula...');
        archivos = await apiArchivo.getArchivoPorCedulaEmprendedor(solicitud.cedula_emprendedor);
        console.log('📁 Archivos por cédula:', archivos);
      }
      
      if (archivos && archivos.length > 0) {
        let archivo = archivos.find(a => a.id_req === solicitud.id_req);
        
        if (!archivo) {
          archivo = archivos[0];
          console.log('⚠️ Usando archivo más reciente en lugar del específico');
        }
        
        console.log('🎯 Archivo seleccionado:', archivo);
        
        let urlImagen = null;
        
        if (archivo.url) {
          urlImagen = archivo.url;
        } else if (archivo.archivo) {
          urlImagen = apiArchivo.obtenerUrlImagen 
            ? apiArchivo.obtenerUrlImagen(archivo.archivo)
            : `http://localhost:5000/uploads/${archivo.archivo}`;
        }
        
        if (urlImagen) {
          console.log('🖼️ URL de imagen construida:', urlImagen);
          
          try {
            const response = await fetch(urlImagen, { method: 'HEAD' });
            if (response.ok) {
              setImagenArchivo(urlImagen);
              setCargandoImagen(false);
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          } catch (fetchError) {
            console.error('❌ Error al verificar imagen:', fetchError);
            throw new Error('La imagen no es accesible desde el servidor');
          }
        } else {
          throw new Error("No se pudo generar la URL de la imagen");
        }
      } else {
        throw new Error("No se encontraron archivos para esta solicitud");
      }
      
    } catch (error) {
      console.error("❌ Error al cargar la imagen:", error);
      setErrorImagen(`Error: ${error.message || "No se pudo cargar la imagen"}`);
      setCargandoImagen(false);
    }
  };

  const abrirModalImagen = (imagenUrl) => {
    setModalImagen({ open: true, imagenUrl });
  };

  const cerrarModalImagen = () => {
    setModalImagen({ open: false, imagenUrl: null });
  };

  if (!isOpen) return null;

  const requerimientosSolicitud = solicitud.requerimientos || [];
  const nombresRequerimientos = requerimientosSolicitud.map(reqId => {
    const req = requerimientos.find(r => r.id_requerimientos === reqId);
    return req ? req.nombre_requerimiento : "";
  }).filter(nombre => nombre !== "");

  const getEstadoConfig = (estado) => {
    const config = {
      "Aprobada": { 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        badge: "bg-emerald-500",
        icon: TbCircleCheck,
      },
      "Rechazado": { 
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: TbX, 
        badge: "bg-rose-500"
      },
      "En revisión": { 
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: TbRefresh,
        badge: "bg-blue-500"
      },
      "Pendiente": { 
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: TbCalendarTime,
        badge: "bg-amber-500"
      }
    };
    return config[estado] || config["Pendiente"];
  };

  const estadoConfig = getEstadoConfig(solicitud.estatus);
  const EstadoIcon = estadoConfig.icon || TbInfoCircle;

  return (
    <>
      {/* Modal principal de detalles */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform animate-scale-in">
          {/* Header del modal */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Detalles completos de tu solicitud
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-2xl transition-all hover:scale-110 bg-white/10 p-1 rounded-lg"
              >
                <TbX size={24} />
              </button>
            </div>
            <div className="absolute -bottom-4 left-6">
              <span className={`${estadoConfig.badge} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2`}>
                <EstadoIcon size={16} />
                {solicitud.estatus || "Pendiente"}
              </span>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-6 space-y-6 mt-4 overflow-y-auto max-h-[70vh]">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TbCalendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de creación</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(solicitud.fecha_creacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TbFile size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Documentos</p>
                    <p className="font-semibold text-gray-800">
                      {nombresRequerimientos.length} adjuntos
                    </p>
                  </div>
                </div>
              </div>

              {solicitud.fecha_llevar && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <TbCalendarEvent size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Próxima cita</p>
                      <p className="font-semibold text-blue-800">
                        {new Date(solicitud.fecha_llevar).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección de imagen del documento */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <TbPhoto size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-800">Imagen del Documento</h3>
                {imagenArchivo && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">
                    <TbCheck size={12} /> Disponible
                  </span>
                )}
                {errorImagen && (
                  <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full ml-2">
                    <TbAlertCircle size={12} /> Error
                  </span>
                )}
              </div>
              
              {cargandoImagen ? (
                <div className="flex justify-center items-center py-12 flex-col">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                  <span className="text-gray-600">Cargando imagen...</span>
                  <span className="text-gray-400 text-sm mt-1">Cédula: {solicitud.cedula_emprendedor}</span>
                </div>
              ) : errorImagen ? (
                <div className="text-center text-gray-500 py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <TbAlertCircle size={32} className="mb-2 text-amber-500 mx-auto" />
                  <p className="text-lg font-medium mb-2">No se pudo cargar la imagen</p>
                  <p className="text-sm text-gray-400 mb-4">{errorImagen}</p>
                  <button 
                    onClick={cargarImagenSolicitud}
                    className="mt-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <TbRefresh size={16} />
                    Reintentar
                  </button>
                </div>
              ) : imagenArchivo ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-300 p-4 flex justify-center cursor-pointer group relative overflow-hidden"
                    onClick={() => abrirModalImagen(imagenArchivo)}>
                    <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <img 
                      src={imagenArchivo} 
                      alt="Documento adjunto" 
                      className="max-w-full h-auto max-h-96 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error("Error cargando imagen en img tag");
                        setErrorImagen("La imagen está corrupta o no es accesible");
                        setImagenArchivo(null);
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/50 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <TbZoomIn size={20} />
                        <span>Haz clic para ampliar</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => abrirModalImagen(imagenArchivo)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                    >
                      <TbZoomIn size={16} />
                      Ver imagen completa
                    </button>
                    <a 
                      href={imagenArchivo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                    >
                      <TbDownload size={16} />
                      Descargar imagen
                    </a>
                    <button 
                      onClick={cargarImagenSolicitud}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                    >
                      <TbRefresh size={16} />
                      Recargar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <TbPhoto size={32} className="mb-3 opacity-50 mx-auto" />
                  <p className="text-lg font-medium mb-2">No hay imagen disponible</p>
                  <p className="text-sm">Esta solicitud no tiene documentos adjuntos</p>
                </div>
              )}
            </div>

            {/* Motivo */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <TbEdit size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-800">Motivo de la solicitud</h3>
              </div>
              <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border">
                {solicitud.motivo || "No se especificó motivo"}
              </p>
            </div>

          </div>

          {/* Footer del modal */}
          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Cerrar Detalles
            </button>
          </div>
        </div>
      </div>

      {/* Modal para visualización de imagen en pantalla completa */}
      {modalImagen.open && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center">
            {/* Botón cerrar */}
            <button
              onClick={cerrarModalImagen}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl transition-all hover:scale-110 bg-black/50 p-2 rounded-lg z-10"
            >
              <TbX size={24} />
            </button>

            {/* Controles de imagen */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg flex items-center gap-4 z-10">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = modalImagen.imagenUrl;
                  link.download = `documento-solicitud-${solicitud.id_contrato}.jpg`;
                  link.click();
                }}
                className="hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                <TbDownload size={16} />
                Descargar
              </button>
              <button
                onClick={cerrarModalImagen}
                className="hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <TbX size={16} />
                Salir de pantalla completa
              </button>
            </div>

            {/* Imagen */}
            <div className="w-full h-full flex items-center justify-center p-8">
              <img 
                src={modalImagen.imagenUrl} 
                alt="Documento en pantalla completa" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={cerrarModalImagen}
              />
            </div>

            {/* Información de la imagen */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm z-10">
              Solicitud #{solicitud.id_contrato} • {new Date(solicitud.fecha_creacion).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Componente Progress Indicator
const ProgressIndicator = ({ step }) => (
  <div className="max-w-2xl mx-auto mb-12">
    <div className="flex items-center justify-between relative">
      <div className="absolute top-4 left-0 right-0 h-2 bg-gray-200 rounded-full -z-10"></div>
      <div
        className="absolute top-4 left-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full -z-10 transition-all duration-700 ease-out"
        style={{
          width: step === 1 ? "0%" : step === 2 ? "25%" : step === 3 ? "50%" : step === 4 ? "75%" : "100%",
        }}
      ></div>
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex flex-col items-center relative">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              step >= stepNumber
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 transform scale-110"
                : "bg-white text-gray-400 border-2 border-gray-300"
            } font-bold text-sm relative z-10`}
          >
            {step >= stepNumber ? (
              <TbCheck size={16} />
            ) : (
              stepNumber
            )}
          </div>
          <span className={`text-xs mt-3 font-semibold transition-all duration-300 ${
            step >= stepNumber ? "text-blue-600" : "text-gray-500"
          }`}>
            {stepNumber === 1 && "Requerimientos"}
            {stepNumber === 2 && "Documentos"}
            {stepNumber === 3 && "Fiador"}
            {stepNumber === 4 && "Motivo"}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Función para subir archivo
const subirArchivo = async (archivo, datosAdicionales) => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  Object.entries(datosAdicionales).forEach(([key, value]) => {
    formData.append(key, value);
  });
  const response = await apiArchivo.crearArchivo(formData);
  return response;
};

// Componente Step 1 - Selección de requerimientos
const Step1Requerimientos = ({
  requerimientos,
  formData,
  errors,
  selectAll,
  handleInputChange,
  handleSelectAllChange,
  handleNext,
}) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <TbListCheck size={32} className="text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Selecciona tus requisitos
      </h3>
      <p className="text-gray-600">
        Marca todos los documentos que tengas disponibles para agilizar tu proceso
      </p>
    </div>

    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-200">
      <label className="flex items-center cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAllChange}
            className="sr-only"
          />
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg ${
            selectAll 
              ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 shadow-lg shadow-blue-200" 
              : "border-gray-400 bg-white group-hover:border-blue-400"
          }`}>
            {selectAll && (
              <TbCheck size={14} className="text-white font-bold" />
            )}
          </div>
        </div>
        <span className="ml-3 text-gray-800 font-semibold text-lg">
          Seleccionar todos los documentos
        </span>
      </label>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 custom-scrollbar">
      {requerimientos.map((req) => (
        <div
          key={req.id_requerimientos}
          className={`flex items-center p-4 rounded-xl transition-all duration-300 cursor-pointer group border-2 ${
            formData.opt_requerimiento.includes(req.id_requerimientos)
              ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-lg shadow-blue-100 transform scale-105"
              : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50"
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
                name="opt_requerimiento"
                value={req.id_requerimientos}
                checked={formData.opt_requerimiento.includes(req.id_requerimientos)}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 transition-all duration-300 group-hover:shadow-lg ${
                  formData.opt_requerimiento.includes(req.id_requerimientos)
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 shadow-lg shadow-blue-200"
                    : "border-gray-400 bg-white group-hover:border-blue-400"
                }`}
              >
                {formData.opt_requerimiento.includes(req.id_requerimientos) && (
                  <TbCheck size={14} className="text-white font-bold" />
                )}
              </div>
            </div>
            <span className="ml-4 text-gray-800 font-medium flex-1">
              {req.nombre_requerimiento}
            </span>
            <TbChevronRight size={20} className={`text-gray-400 group-hover:text-blue-500 transition-colors ${
              formData.opt_requerimiento.includes(req.id_requerimientos) ? "text-blue-500" : ""
            }`} />
          </label>
        </div>
      ))}
    </div>
    
    {errors.opt_requerimiento && (
      <div className="flex items-center bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 mt-4 animate-shake">
        <div className="bg-red-100 p-2 rounded-lg mr-3">
          <TbAlertCircle size={20} className="text-red-500" />
        </div>
        <p className="text-red-700 font-medium">
          {errors.opt_requerimiento}
        </p>
      </div>
    )}

    <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={handleNext}
        disabled={formData.opt_requerimiento.length === 0}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center shadow-lg shadow-blue-200"
      >
        Continuar
        <TbChevronRight size={20} className="ml-2" />
      </button>
    </div>
  </div>
);

// Componente Step 2 - Subida de documentos
const Step2Documentos = ({
  formData,
  errors,
  setFormData,
  setErrors,
  handleBack,
  handleNext,
}) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <TbCloudUpload size={32} className="text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Sube tu imagen
      </h3>
      <p className="text-gray-600">
        Sube una imagen de tus documentos y selecciona una fecha para tu cita presencial
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section para imágenes */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <label className="block mb-4 text-gray-800 font-semibold text-lg">
          <TbPhoto size={20} className="text-blue-600 mr-2 inline" />
          Imagen del documento
        </label>
        <div className="relative">
          <input
            type="file"
            id="archivo"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setFormData((prev) => ({ ...prev, archivo: file }));
              if (errors.archivo) {
                setErrors((prev) => ({ ...prev, archivo: "" }));
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            formData.archivo 
              ? "border-green-400 bg-green-50" 
              : "border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50"
          }`}>
            {formData.archivo ? (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TbCheck size={24} className="text-green-600" />
                </div>
                <p className="text-gray-800 font-semibold mb-1">
                  {formData.archivo.name}
                </p>
                <p className="text-gray-600 text-sm">
                  {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB • Listo para enviar
                </p>
                {/* Vista previa de la imagen */}
                <div className="mt-4 max-w-48 mx-auto cursor-pointer" onClick={() => {
                  const modal = document.createElement('div');
                  modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50';
                  modal.innerHTML = `
                    <div class="relative max-w-4xl max-h-[90vh]">
                      <button class="absolute -top-12 right-0 text-white text-2xl" onclick="this.parentElement.parentElement.remove()">
                        <i class="bx bx-x"></i>
                      </button>
                      <img src="${URL.createObjectURL(formData.archivo)}" class="max-w-full max-h-[90vh] object-contain rounded-lg" />
                    </div>
                  `;
                  modal.onclick = (e) => {
                    if (e.target === modal) modal.remove();
                  };
                  document.body.appendChild(modal);
                }}>
                  <img 
                    src={URL.createObjectURL(formData.archivo)} 
                    alt="Vista previa" 
                    className="w-full h-auto rounded-lg shadow-md max-h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                  <p className="text-blue-600 text-xs mt-2 flex items-center justify-center gap-1">
                    <TbZoomIn size={12} />
                    Haz clic para ver en grande
                  </p>
                </div>
              </>
            ) : (
              <>
                <TbCloudUpload size={40} className="text-blue-500 mb-3 mx-auto" />
                <p className="text-gray-800 font-semibold mb-1">
                  Haz clic para subir tu imagen
                </p>
                <p className="text-gray-500 text-sm">
                  Formatos aceptados: JPG, PNG, WEBP (máx. 10MB)
                </p>
              </>
            )}
          </div>
        </div>
        {errors.archivo && (
          <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <TbAlertCircle size={20} className="text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{errors.archivo}</p>
          </div>
        )}
      </div>

      {/* Date Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <label className="block mb-4 text-gray-800 font-semibold text-lg">
          <TbCalendar size={20} className="text-blue-600 mr-2 inline" />
          Fecha para llevar los documentos
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
            <TbCalendar size={20} />
          </div>
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
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition-all bg-white text-gray-800 font-medium shadow-sm"
          />
        </div>
        {errors.fecha_llevar && (
          <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <TbAlertCircle size={20} className="text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{errors.fecha_llevar}</p>
          </div>
        )}
        
        {formData.fecha_llevar && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
            <p className="text-blue-800 text-sm font-medium flex items-center">
              <TbInfoCircle size={16} className="mr-2" />
              Cita programada para el {new Date(formData.fecha_llevar).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </div>

    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={handleBack}
        className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg shadow-gray-200"
      >
        <TbChevronLeft size={20} className="mr-2" />
        Regresar
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={!formData.archivo || !formData.fecha_llevar}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center shadow-lg shadow-blue-200"
      >
        Continuar
        <TbChevronRight size={20} className="ml-2" />
      </button>
    </div>
  </div>
);

// Componente Step 3 - Registro del Fiador (ACTUALIZADO con lista de requerimientos)
const Step3Fiador = ({
  fiadorData,
  errors,
  setFiadorData,
  setErrors,
  requerimientosFiador,
  handleBack,
  handleNext,
}) => {
  console.log('🔍 Step3Fiador - requerimientosFiador:', requerimientosFiador);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TbUser size={32} className="text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Datos del Fiador
        </h3>
        <p className="text-gray-600">
          Ingresa la información del fiador que avalará tu solicitud de crédito
        </p>
      </div>

      {/* SECCIÓN: Requerimientos del Fiador - MEJORADA */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <label className="block mb-4 text-gray-800 font-semibold text-lg">
          <TbListCheck size={20} className="text-blue-600 mr-2 inline" />
          Requerimientos del Fiador
        </label>
        
        {requerimientosFiador && requerimientosFiador.length > 0 ? (
          <>
            <p className="text-gray-600 mb-4 text-sm">
              El fiador deberá presentar los siguientes documentos:
            </p>
            
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto rounded-2xl p-4 bg-white border border-gray-200 custom-scrollbar">
              {requerimientosFiador.map((req, index) => (
                <div
                  key={req.id_requerimientos_fiador || index}
                  className="flex items-center p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-all duration-300"
                >
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-gray-800 text-sm flex-1">
                    {req.nombre_requerimiento_fiador || `Requerimiento ${index + 1}`}
                  </span>
                  <TbInfoCircle size={16} className="text-gray-400 ml-2" />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-700 text-sm font-medium flex items-center">
                <TbInfoCircle size={16} className="text-amber-500 mr-2" />
                Información importante: El fiador debe presentar estos documentos en la cita programada
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <TbInfoCircle size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No hay requerimientos específicos para el fiador en este momento.
            </p>
          </div>
        )}
      </div>

      {/* Resto del formulario del fiador */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cédula del Fiador */}
          <div>
            <label className="block mb-3 text-gray-800 font-semibold">
              <TbId size={18} className="text-blue-600 mr-2 inline" />
              Cédula del Fiador *
            </label>
            <input
              type="text"
              value={fiadorData.cedula_fiador}
              onChange={(e) => {
                const value = e.target.value;
                setFiadorData(prev => ({ ...prev, cedula_fiador: value }));
                if (errors.cedula_fiador) {
                  setErrors(prev => ({ ...prev, cedula_fiador: "" }));
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition-all bg-white text-gray-800 font-medium"
              placeholder="Ej: 1234567890"
              maxLength={20}
            />
            {errors.cedula_fiador && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <TbAlertCircle size={16} className="mr-1" />
                {errors.cedula_fiador}
              </p>
            )}
          </div>

          {/* Nombre Completo */}
          <div>
            <label className="block mb-3 text-gray-800 font-semibold">
              <TbUser size={18} className="text-blue-600 mr-2 inline" />
              Nombre Completo *
            </label>
            <input
              type="text"
              value={fiadorData.nombre_completo_fiador}
              onChange={(e) => {
                const value = e.target.value;
                setFiadorData(prev => ({ ...prev, nombre_completo_fiador: value }));
                if (errors.nombre_completo_fiador) {
                  setErrors(prev => ({ ...prev, nombre_completo_fiador: "" }));
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition-all bg-white text-gray-800 font-medium"
              placeholder="Ej: Juan Pérez García"
              maxLength={100}
            />
            {errors.nombre_completo_fiador && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <TbAlertCircle size={16} className="mr-1" />
                {errors.nombre_completo_fiador}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block mb-3 text-gray-800 font-semibold">
              <TbPhone size={18} className="text-blue-600 mr-2 inline" />
              Teléfono *
            </label>
            <input
              type="tel"
              value={fiadorData.telefono_fiador}
              onChange={(e) => {
                const value = e.target.value;
                setFiadorData(prev => ({ ...prev, telefono_fiador: value }));
                if (errors.telefono_fiador) {
                  setErrors(prev => ({ ...prev, telefono_fiador: "" }));
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition-all bg-white text-gray-800 font-medium"
              placeholder="Ej: 0412-1234567"
              maxLength={20}
            />
            {errors.telefono_fiador && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <TbAlertCircle size={16} className="mr-1" />
                {errors.telefono_fiador}
              </p>
            )}
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block mb-3 text-gray-800 font-semibold">
              <TbMail size={18} className="text-blue-600 mr-2 inline" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={fiadorData.correo_fiador}
              onChange={(e) => {
                const value = e.target.value;
                setFiadorData(prev => ({ ...prev, correo_fiador: value }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition-all bg-white text-gray-800 font-medium"
              placeholder="Ej: fiador@ejemplo.com"
              maxLength={100}
            />
          </div>
        </div>

        {/* Sección para RIF Fiscal */}
        <div className="mt-6">
          <label className="block mb-4 text-gray-800 font-semibold text-lg">
            <TbFile size={18} className="text-blue-600 mr-2 inline" />
            RIF Fiscal del Fiador (Opcional)
          </label>
          <div className="relative">
            <input
              type="file"
              id="foto_rif_fiscal"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setFiadorData(prev => ({ ...prev, foto_rif_fiscal: file }));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={`border-3 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${
              fiadorData.foto_rif_fiscal 
                ? "border-green-400 bg-green-50" 
                : "border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50"
            }`}>
              {fiadorData.foto_rif_fiscal ? (
                <>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TbCheck size={24} className="text-green-600" />
                  </div>
                  <p className="text-gray-800 font-semibold mb-1">
                    {fiadorData.foto_rif_fiscal.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {(fiadorData.foto_rif_fiscal.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <TbCloudUpload size={40} className="text-blue-500 mb-3 mx-auto" />
                  <p className="text-gray-800 font-semibold mb-1">
                    Haz clic para subir RIF Fiscal
                  </p>
                  <p className="text-gray-500 text-sm">
                    Formatos: JPG, PNG, WEBP (máx. 10MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 font-medium mb-2 flex items-center">
            <TbInfoCircle size={16} className="text-blue-500 mr-2" />
            Información importante sobre el fiador:
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• El fiador debe ser mayor de edad</li>
            <li>• Debe tener ingresos comprobables</li>
            <li>• Será contactado para verificación</li>
            <li>• Debe presentar los documentos listados arriba</li>
            <li>• Los campos marcados con * son obligatorios</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleBack}
          className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg shadow-gray-200"
        >
          <TbChevronLeft size={20} className="mr-2" />
          Regresar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!fiadorData.cedula_fiador || !fiadorData.nombre_completo_fiador || !fiadorData.telefono_fiador}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center shadow-lg shadow-blue-200"
        >
          Continuar
          <TbChevronRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// Componente Step 4 - Motivo de la solicitud
const Step4Motivo = ({
  motivo,
  errors,
  loading,
  handleMotivoChange,
  handleBack,
  handleSubmit,
}) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <TbEdit size={32} className="text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Cuéntanos tu motivo
      </h3>
      <p className="text-gray-600">
        Describe detalladamente para qué necesitas el crédito y cómo lo utilizarás
      </p>
    </div>

    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
      <label className="block mb-4 text-gray-800 font-semibold text-lg">
        <TbMessage size={20} className="text-blue-600 mr-2 inline" />
        Motivo de solicitud
      </label>
      <div className="relative">
        <textarea
          value={motivo}
          onChange={handleMotivoChange}
          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition-all bg-white resize-none text-gray-800 font-medium shadow-sm min-h-40"
          placeholder="Describe aquí el propósito de tu solicitud de crédito, cómo planeas utilizar los fondos, el impacto esperado en tu negocio y cualquier información relevante que nos ayude a entender tu proyecto..."
          maxLength={500}
        />
        <div className={`absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded-full ${
          motivo.length > 450 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
        }`}>
          {motivo.length}/500
        </div>
      </div>
      {errors.motivo && (
        <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <TbAlertCircle size={20} className="text-red-500 mr-3" />
          <p className="text-red-700 font-medium">{errors.motivo}</p>
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
        <p className="text-sm text-gray-600 font-medium mb-2 flex items-center">
          <TbBulb size={16} className="text-amber-500 mr-2" />
          Consejos para una buena descripción:
        </p>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Sé específico sobre el uso del dinero</li>
          <li>• Menciona cómo esto beneficiará tu negocio</li>
          <li>• Incluye montos aproximados si es posible</li>
          <li>• Describe el impacto esperado</li>
        </ul>
      </div>
    </div>

    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={handleBack}
        className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg shadow-gray-200"
      >
        <TbChevronLeft size={20} className="mr-2" />
        Regresar
      </button>
      <button
        type="submit"
        disabled={loading || !motivo.trim()}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none flex items-center shadow-lg shadow-green-200 min-w-32 justify-center"
      >
        {loading ? (
          <>
            <TbLoader size={20} className="animate-spin mr-2" />
            Enviando...
          </>
        ) : (
          <>
            <TbSend size={20} className="mr-2" />
            Enviar Solicitud
          </>
        )}
      </button>
    </div>
  </div>
);

// Componente SolicitudCard con indicador de imagen
const SolicitudCard = ({ solicitud, requerimientos, onVerDetalles }) => {
  const [tieneImagen, setTieneImagen] = useState(false);
  const [verificandoImagen, setVerificandoImagen] = useState(false);

  useEffect(() => {
    verificarImagen();
  }, [solicitud]);

  const verificarImagen = async () => {
    if (!solicitud?.cedula_emprendedor) return;
    
    setVerificandoImagen(true);
    try {
      const archivos = await apiArchivo.getArchivoPorCedulaEmprendedor(solicitud.cedula_emprendedor);
      setTieneImagen(archivos && archivos.length > 0);
    } catch (error) {
      console.error("Error al verificar imagen:", error);
      setTieneImagen(false);
    } finally {
      setVerificandoImagen(false);
    }
  };

  const estadoSolicitud = solicitud.estatus || "Pendiente";
  const fechaSolicitud = solicitud.fecha_creacion || new Date();
  
  const requerimientosSolicitud = solicitud.requerimientos || [];
  const nombresRequerimientos = requerimientosSolicitud.map(reqId => {
    const req = requerimientos.find(r => r.id_requerimientos === reqId);
    return req ? req.nombre_requerimiento : "";
  }).filter(nombre => nombre !== "");

  const getEstadoConfig = (estado) => {
    const config = {
      "Aprobada": { 
        color: "bg-emerald-500 text-white",
        gradient: "from-emerald-500 to-emerald-600",
        icon: TbCircleCheck,
      },
      "Rechazado": { 
        color: "bg-rose-500 text-white",
        icon: TbX,
        gradient: "from-rose-500 to-rose-600"
      },
      "En revisión": { 
        color: "bg-blue-500 text-white",
        icon: TbRefresh,
        gradient: "from-blue-500 to-blue-600"
      },
      "Pendiente": { 
        color: "bg-amber-500 text-white",
        icon: TbCalendarTime,
        gradient: "from-amber-500 to-amber-600"
      }
    };
    return config[estado] || config["Pendiente"];
  };

  const estadoConfig = getEstadoConfig(estadoSolicitud);
  const EstadoIcon = estadoConfig.icon || TbInfoCircle;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 group hover:border-blue-300">
      {/* Header con gradiente */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
            Solicitud #{solicitud.id_contrato || "N/A"}
          </h3>
          <p className="text-gray-500 text-sm flex items-center mt-1">
            <TbCalendar size={14} className="mr-1" />
            {new Date(fechaSolicitud).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`bg-gradient-to-r ${estadoConfig.gradient} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-lg`}>
            <EstadoIcon size={14} className="mr-1" />
            {estadoSolicitud}
          </span>
          {verificandoImagen ? (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <TbLoader size={12} className="animate-spin mr-1" />
              Verificando...
            </span>
          ) : tieneImagen ? (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <TbPhoto size={12} className="mr-1" />
              Con imagen
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <TbX size={12} className="mr-1" />
              Sin imagen
            </span>
          )}
        </div>
      </div>

      {/* Motivo con gradiente de fondo */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
          <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
            {solicitud.motivo || "Sin motivo especificado"}
          </p>
        </div>
      </div>

      {/* Documentos */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <TbFolder size={16} className="text-gray-600 mr-2" />
          <span className="text-gray-700 font-semibold text-sm">Documentos adjuntados:</span>
        </div>
        <div className="space-y-2">
          {nombresRequerimientos.slice(0, 2).map((nombre, idx) => (
            <div key={idx} className="flex items-center text-gray-600 text-sm bg-gray-50 rounded-lg px-3 py-2">
              <TbCheck size={14} className="text-green-500 mr-2" />
              <span className="truncate">{nombre}</span>
            </div>
          ))}
          {nombresRequerimientos.length > 2 && (
            <div className="text-gray-500 text-sm bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
              +{nombresRequerimientos.length - 2} documentos más...
            </div>
          )}
          {nombresRequerimientos.length === 0 && (
            <div className="text-gray-400 text-sm bg-gray-50 rounded-lg px-3 py-2 text-center">
              Sin documentos adjuntos
            </div>
          )}
        </div>
      </div>

      {/* Fecha de cita si existe */}
      {solicitud.fecha_llevar && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center text-blue-700 text-sm">
            <TbCalendarEvent size={14} className="text-blue-600 mr-2" />
            <span className="font-semibold">Próxima cita:</span>
          </div>
          <span className="text-blue-900 font-bold text-sm block mt-1">
            {new Date(solicitud.fecha_llevar).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button 
          onClick={() => onVerDetalles(solicitud)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center text-sm shadow-lg shadow-blue-200"
        >
          <TbZoomIn size={16} className="mr-2" />
          Ver Detalles
        </button>
        <div className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-full">
          ID: {solicitud.id_contrato || "N/A"}
        </div>
      </div>
    </div>
  );
};

// Componente ListaSolicitudes
const ListaSolicitudes = ({ solicitudes, requerimientos, onNuevaSolicitud, onVerDetalles }) => {
  const stats = {
    total: solicitudes.length,
    aprobadas: solicitudes.filter(s => s.estatus === "Aprobada").length,
    pendientes: solicitudes.filter(s => s.estatus === "Pendiente" || !s.estatus).length,
    revision: solicitudes.filter(s => s.estatus === "En revisión").length
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header con estadísticas */}
      <div className="mb-8 mt-11">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <TbFileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Mis solicitudes de crédito
              </h1>
              <p className="text-gray-600">
                Gestiona y revisa el estado de todas tus solicitudes
              </p>
            </div>
          </div>
          <button
            onClick={onNuevaSolicitud}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg shadow-blue-200 whitespace-nowrap"
          >
            <TbPlus size={20} className="mr-2" />
            Nueva Solicitud
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <TbFileText size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Aprobadas</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.aprobadas}</p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <TbCircleCheck size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendientes}</p>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg">
                <TbCalendarTime size={20} className="text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">En Revisión</p>
                <p className="text-2xl font-bold text-blue-600">{stats.revision}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <TbRefresh size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de solicitudes */}
      {solicitudes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {solicitudes.map((solicitud, index) => (
            <SolicitudCard 
              key={solicitud.id_contrato || index}
              solicitud={solicitud}
              requerimientos={requerimientos}
              onVerDetalles={onVerDetalles}
            />
          ))}
        </div>
      ) : (
        // Estado vacío mejorado
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-dashed border-gray-300">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-lg">
              <TbFileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">
              No hay solicitudes
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Aún no has realizado ninguna solicitud de crédito. Comienza creando tu primera solicitud para acceder a los beneficios.
            </p>
            <button
              onClick={onNuevaSolicitud}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center mx-auto shadow-lg shadow-blue-200"
            >
              <TbPlus size={20} className="mr-2" />
              Crear Primera Solicitud
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente FormularioSolicitud
const FormularioSolicitud = ({ 
  requerimientos, 
  requerimientosFiador,
  formData, 
  setFormData, 
  step, 
  setStep, 
  motivo, 
  setMotivo, 
  fiadorData,
  setFiadorData,
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
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (formData.opt_requerimiento.length === 0) {
        newErrors.opt_requerimiento = "Debe seleccionar al menos un requerimiento.";
      }
    } else if (step === 2) {
      if (!formData.archivo) {
        newErrors.archivo = "Debe adjuntar una imagen.";
      } else if (!formData.archivo.type.startsWith('image/')) {
        newErrors.archivo = "El archivo debe ser una imagen (JPG, PNG, WEBP, etc.).";
      }
      if (!formData.fecha_llevar) {
        newErrors.fecha_llevar = "Debe seleccionar la fecha para llevar los documentos.";
      }
    } else if (step === 3) {
      // Validaciones para el fiador
      if (!fiadorData.cedula_fiador.trim()) {
        newErrors.cedula_fiador = "La cédula del fiador es obligatoria.";
      }
      if (!fiadorData.nombre_completo_fiador.trim()) {
        newErrors.nombre_completo_fiador = "El nombre completo del fiador es obligatorio.";
      }
      if (!fiadorData.telefono_fiador.trim()) {
        newErrors.telefono_fiador = "El teléfono del fiador es obligatorio.";
      }
    } else if (step === 4) {
      if (!motivo.trim()) {
        newErrors.motivo = "El campo motivo no puede estar vacío.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStepTitle = (step) => {
    switch(step) {
      case 1: return "Selecciona tus Requerimientos";
      case 2: return "Adjunta tus Documentos";
      case 3: return "Datos del Fiador";
      case 4: return "Motivo de tu Solicitud";
      default: return "";
    }
  };

  const getStepDescription = (step) => {
    switch(step) {
      case 1: return "Elige los documentos que vas a presentar";
      case 2: return "Sube tu archivo y programa tu cita";
      case 3: return "Ingresa la información del fiador";
      case 4: return "Describe el propósito de tu solicitud";
      default: return "";
    }
  };

  const getStepIcon = (step) => {
    switch(step) {
      case 1: return TbListCheck;
      case 2: return TbCloudUpload;
      case 3: return TbUser;
      case 4: return TbEdit;
      default: return TbListCheck;
    }
  };

  const StepIcon = getStepIcon(step);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header del formulario */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 mt-6 gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
            <StepIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Nueva Solicitud
            </h1>
            <p className="text-gray-600">
              Sigue los pasos para completar tu solicitud de crédito
            </p>
          </div>
        </div>
        <button
          onClick={onCancelar}
          className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg shadow-gray-200 border border-gray-300"
        >
          <TbArrowBack size={20} className="mr-2" />
          Volver al Listado
        </button>
      </div>

      {/* Indicador de progreso */}
      <ProgressIndicator step={step} />

      {/* Formulario */}
      <section className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            step === 1 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
          }`}>
            <StepIcon size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {getStepTitle(step)}
            </h2>
            <p className="text-gray-600">
              {getStepDescription(step)}
            </p>
          </div>
        </div>

        <form
          className="space-y-6"
          onSubmit={
            step === 4
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
              setErrors={setErrors}
              handleBack={handleBack}
              handleNext={handleNext}
            />
          )}

          {step === 3 && (
            <Step3Fiador
              fiadorData={fiadorData}
              errors={errors}
              setFiadorData={setFiadorData}
              setErrors={setErrors}
              requerimientosFiador={requerimientosFiador}
              handleBack={handleBack}
              handleNext={handleNext}
            />
          )}

          {step === 4 && (
            <Step4Motivo
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
  const [requerimientosFiador, setRequerimientosFiador] = useState([]);
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
  const [fiadorData, setFiadorData] = useState({
    cedula_fiador: "",
    nombre_completo_fiador: "",
    telefono_fiador: "",
    correo_fiador: "",
    foto_rif_fiscal: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalDetalles, setModalDetalles] = useState({ open: false, solicitud: null });

  // Efectos
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

  // Cargar requerimientos del fiador
  useEffect(() => {
    const fetchRequerimientosFiador = async () => {
      try {
        console.log('🔄 Cargando requerimientos del fiador...');
        const data = await getRequerimientosFiador();
        console.log('📋 Requerimientos del fiador cargados:', data);
        setRequerimientosFiador(data);
      } catch (error) {
        console.error("Error al obtener requerimientos del fiador:", error);
      }
    };
    fetchRequerimientosFiador();
  }, []);

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      if (user?.cedula_usuario) {
        try {
          const datosExistentes = await getRequerimientoEmprendedor(user.cedula_usuario);
          const solicitudesData = await getSolicitudPorCedula(user.cedula_usuario);
          
          console.log('📋 Datos existentes (requerimientos):', datosExistentes);
          console.log('📋 Solicitudes data:', solicitudesData);
          
          let solicitudesCompletas = [];
          
          if (Array.isArray(solicitudesData)) {
            solicitudesCompletas = solicitudesData.map(solicitud => {
              const requerimientoCorrespondiente = datosExistentes.find(
                item => item.id_req === solicitud.id_req
              );
              
              console.log(`🔍 Buscando requerimiento para solicitud ${solicitud.id_contrato}:`, {
                id_req_solicitud: solicitud.id_req,
                requerimiento_encontrado: requerimientoCorrespondiente
              });
              
              let requerimientosSolicitud = [];
              if (requerimientoCorrespondiente && requerimientoCorrespondiente.opt_requerimiento) {
                try {
                  requerimientosSolicitud = JSON.parse(requerimientoCorrespondiente.opt_requerimiento) || [];
                } catch (error) {
                  console.error('Error parseando opt_requerimiento:', error);
                  requerimientosSolicitud = [];
                }
              }
              
              return {
                ...solicitud,
                requerimientos: requerimientosSolicitud,
                id_req: solicitud.id_req
              };
            });
          } else if (solicitudesData) {
            const requerimientoCorrespondiente = datosExistentes.find(
              item => item.id_req === solicitudesData.id_req
            );
            
            let requerimientosSolicitud = [];
            if (requerimientoCorrespondiente && requerimientoCorrespondiente.opt_requerimiento) {
              try {
                requerimientosSolicitud = JSON.parse(requerimientoCorrespondiente.opt_requerimiento) || [];
              } catch (error) {
                console.error('Error parseando opt_requerimiento:', error);
                requerimientosSolicitud = [];
              }
            }
            
            solicitudesCompletas = [{
              ...solicitudesData,
              requerimientos: requerimientosSolicitud,
              id_req: solicitudesData.id_req
            }];
          }
          
          console.log('🔄 Solicitudes completas procesadas:', solicitudesCompletas);
          setSolicitudes(solicitudesCompletas);
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

  // Funciones de manejo
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

  // Función para recargar los datos de las solicitudes
  const recargarDatosSolicitudes = async () => {
    if (user?.cedula_usuario) {
      try {
        const datosExistentes = await getRequerimientoEmprendedor(user.cedula_usuario);
        const solicitudesData = await getSolicitudPorCedula(user.cedula_usuario);
        
        console.log('🔄 Recargando datos - Requerimientos:', datosExistentes);
        console.log('🔄 Recargando datos - Solicitudes:', solicitudesData);
        
        let solicitudesCompletas = [];
        
        if (Array.isArray(solicitudesData)) {
          solicitudesCompletas = solicitudesData.map(solicitud => {
            const requerimientoCorrespondiente = datosExistentes.find(
              item => item.id_req === solicitud.id_req
            );
            
            console.log(`🔍 Recarga - Buscando requerimiento para solicitud ${solicitud.id_contrato}:`, {
              id_req_solicitud: solicitud.id_req,
              requerimiento_encontrado: requerimientoCorrespondiente
            });
            
            let requerimientosSolicitud = [];
            if (requerimientoCorrespondiente && requerimientoCorrespondiente.opt_requerimiento) {
              try {
                requerimientosSolicitud = JSON.parse(requerimientoCorrespondiente.opt_requerimiento) || [];
              } catch (error) {
                console.error('Error parseando opt_requerimiento:', error);
                requerimientosSolicitud = [];
              }
            }
            
            return {
              ...solicitud,
              requerimientos: requerimientosSolicitud,
              id_req: solicitud.id_req
            };
          });
        } else if (solicitudesData) {
          const requerimientoCorrespondiente = datosExistentes.find(
            item => item.id_req === solicitudesData.id_req
          );
          
          let requerimientosSolicitud = [];
          if (requerimientoCorrespondiente && requerimientoCorrespondiente.opt_requerimiento) {
            try {
              requerimientosSolicitud = JSON.parse(requerimientoCorrespondiente.opt_requerimiento) || [];
            } catch (error) {
              console.error('Error parseando opt_requerimiento:', error);
              requerimientosSolicitud = [];
            }
          }
          
          solicitudesCompletas = [{
            ...solicitudesData,
            requerimientos: requerimientosSolicitud,
            id_req: solicitudesData.id_req
          }];
        }
        
        console.log('✅ Solicitudes recargadas:', solicitudesCompletas);
        setSolicitudes(solicitudesCompletas);
      } catch (error) {
        console.error("Error recargando datos:", error);
      }
    }
  };

  // Función para resetear el formulario
  const resetearFormulario = () => {
    setMotivo("");
    setFormData({
      cedula_emprendedor: user?.cedula_usuario || "",
      opt_requerimiento: [],
      archivo: null,
      fecha_llevar: "",
      motivo: "",
    });
    setFiadorData({
      cedula_fiador: "",
      nombre_completo_fiador: "",
      telefono_fiador: "",
      correo_fiador: "",
      foto_rif_fiscal: null,
    });
    setStep(1);
    setErrors({});
  };

const enviarRequerimiento = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    // 1. PRIMERO crear el requerimiento_emprendedor para obtener id_req
    const requerimientoData = {
      cedula_emprendedor: formData.cedula_emprendedor,
      opt_requerimiento: JSON.stringify(formData.opt_requerimiento),
      verificacion: "Pendiente"
    };

    console.log('📤 Creando requerimiento emprendedor:', requerimientoData);
    
    const requerimientoResponse = await createRequerimientoEmprendedor(requerimientoData);
    console.log('✅ Respuesta de requerimiento:', requerimientoResponse);
    
    if (!requerimientoResponse.id_req) {
      throw new Error('No se pudo obtener el id_req del requerimiento creado');
    }
    
    const id_req = requerimientoResponse.id_req;

    // 2. CREAR EL FIADOR CON FORM DATA
    const datosFiador = {
      id_req: id_req,
      cedula_emprendedor: formData.cedula_emprendedor,
      cedula_fiador: fiadorData.cedula_fiador,
      nombre_completo_fiador: fiadorData.nombre_completo_fiador,
      telefono_fiador: fiadorData.telefono_fiador,
      correo_fiador: fiadorData.correo_fiador || null,
      verificacion_fiador: "Pendiente"
    };

    console.log('👤 Creando fiador:', datosFiador);
    
    // ✅ CORREGIDO: Enviar con FormData incluyendo el archivo
    const fiadorResponse = await createFiador(datosFiador, fiadorData.foto_rif_fiscal);
    console.log('✅ Respuesta del fiador:', fiadorResponse);

    // 3. CREAR LA SOLICITUD con el id_req
    const datosSolicitud = {
      cedula_emprendedor: formData.cedula_emprendedor,
      motivo: formData.motivo,
      estatus: "Pendiente",
      id_req: id_req,
      fecha_llevar: formData.fecha_llevar || null
    };

    console.log('📤 Enviando solicitud con id_req:', datosSolicitud);
    
    const solicitudResponse = await createSolicitud(datosSolicitud);
    console.log('✅ Respuesta de solicitud:', solicitudResponse);

    if (!solicitudResponse.id_contrato) {
      throw new Error('No se pudo crear la solicitud');
    }

    // 4. Subir el archivo principal del emprendedor
    if (formData.archivo) {
      const datosArchivo = {
        cedula_emprendedor: formData.cedula_emprendedor,
        fecha_llevar: formData.fecha_llevar,
        id_req: id_req,
        tipo_archivo: "documentos_emprendedor"
      };
      console.log('📁 Subiendo archivo principal');
      await subirArchivo(formData.archivo, datosArchivo);
    }

    // Recargar datos para mostrar la nueva solicitud
    await recargarDatosSolicitudes();

    setMostrarFormulario(false);
    resetearFormulario();

    Swal.fire({
      title: "¡Éxito!",
      text: "Solicitud enviada correctamente con los datos del fiador",
      icon: "success",
      confirmButtonColor: "#0F3C5B",
      background: "#f8fafc",
      customClass: {
        popup: "rounded-2xl shadow-2xl",
        title: "text-xl font-bold",
      },
    });
  } catch (error) {
    console.error("❌ Error al enviar:", error);
    console.error("📋 Detalles del error:", error.response?.data);
    
    Swal.fire({
      title: "¡Error!",
      text: error.response?.data?.message || error.message || "Hubo un error al enviar la solicitud",
      icon: "error",
      confirmButtonColor: "#dc2626",
      background: "#f8fafc",
      customClass: {
        popup: "rounded-2xl shadow-2xl",
        title: "text-xl font-bold",
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
    resetearFormulario();
  };

  const handleVerDetalles = (solicitud) => {
    setModalDetalles({ open: true, solicitud });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
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
              onVerDetalles={handleVerDetalles}
            />
          ) : (
            <FormularioSolicitud
              requerimientos={requerimientos}
              requerimientosFiador={requerimientosFiador}
              formData={formData}
              setFormData={setFormData}
              step={step}
              setStep={setStep}
              motivo={motivo}
              setMotivo={setMotivo}
              fiadorData={fiadorData}
              setFiadorData={setFiadorData}
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
        
        {/* Modal de detalles */}
        <ModalDetalles
          solicitud={modalDetalles.solicitud}
          requerimientos={requerimientos}
          isOpen={modalDetalles.open}
          onClose={() => setModalDetalles({ open: false, solicitud: null })}
        />
        
        {/* Pie de página mejorado */}
        <footer className="mt-auto p-6 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <span className="text-sm">Sistema de Gestión de Créditos</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="text-sm">v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RequireSolicit;