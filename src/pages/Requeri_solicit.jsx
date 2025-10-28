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

// Componente Modal mejorado para visualización de imagen
const ModalDetalles = ({ solicitud, requerimientos, isOpen, onClose }) => {
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState(null);
  const [modalImagen, setModalImagen] = useState({ open: false, imagenUrl: null });

  useEffect(() => {
    if (isOpen && solicitud?.id_req) {
      cargarImagenSolicitud();
    } else {
      setImagenArchivo(null);
      setErrorImagen(null);
    }
  }, [isOpen, solicitud]);

  const cargarImagenSolicitud = async () => {
  if (!solicitud?.id_req) {
    setErrorImagen("No hay ID de solicitud disponible");
    return;
  }
  
  setCargandoImagen(true);
  setErrorImagen(null);
  setImagenArchivo(null);
  
  try {
    console.log('🔍 Buscando imagen para solicitud ID:', solicitud.id_req);
    
    const archivos = await apiArchivo.getArchivoPorCedulaEmprendedor(solicitud.id_req);
    console.log('📁 Archivos obtenidos:', archivos);
    
    if (archivos && archivos.length > 0) {
      const archivo = archivos[0];
      let urlImagen = null;
      
      // Verificar si ya tenemos una URL completa
      if (archivo.url) {
        urlImagen = archivo.url;
      } 
      // Verificar si tenemos una ruta relativa
      else if (archivo.archivo) {
        if (typeof archivo.archivo === 'string') {
          if (archivo.archivo.startsWith('data:image')) {
            // Es un data URL (base64)
            urlImagen = archivo.archivo;
          } else if (archivo.archivo.startsWith('http')) {
            // Ya es una URL completa
            urlImagen = archivo.archivo;
          } else {
            // Es una ruta del servidor, construir URL completa
            urlImagen = apiArchivo.obtenerUrlImagen 
              ? apiArchivo.obtenerUrlImagen(archivo.archivo)
              : (`http://localhost:5000/uploads/1761146329337-73989087.png`);
          }
        }
      }
      
      if (urlImagen) {
        console.log('🖼️ URL de imagen construida:', urlImagen);
        
        // Verificar que la imagen sea accesible
        const response = await fetch(urlImagen, { method: 'HEAD' });
        if (response.ok) {
          setImagenArchivo(urlImagen);
          setCargandoImagen(false);
        } else {
          throw new Error('La imagen no es accesible');
        }
      } else {
        setErrorImagen("No se pudo generar la URL de la imagen");
        setCargandoImagen(false);
      }
    } else {
      setErrorImagen("No se encontraron archivos para esta solicitud");
      setCargandoImagen(false);
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
        icon: "bx-check-circle",
        badge: "bg-emerald-500"
      },
      "Rechazado": { 
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: "bx-x-circle", 
        badge: "bg-rose-500"
      },
      "En revisión": { 
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: "bx-time",
        badge: "bg-blue-500"
      },
      "Pendiente": { 
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: "bx-hourglass",
        badge: "bg-amber-500"
      }
    };
    return config[estado] || config["Pendiente"];
  };

  const estadoConfig = getEstadoConfig(solicitud.estatus);

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
                  Solicitud #{solicitud.id_req || "N/A"}
                </h2>
                <p className="text-blue-100 opacity-90">
                  Detalles completos de tu solicitud
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-2xl transition-all hover:scale-110 bg-white/10 p-1 rounded-lg"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="absolute -bottom-4 left-6">
              <span className={`${estadoConfig.badge} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2`}>
                <i className={`bx ${estadoConfig.icon}`}></i>
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
                    <i className="bx bx-calendar text-blue-600 text-xl"></i>
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
                    <i className="bx bx-file text-green-600 text-xl"></i>
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
                      <i className="bx bx-calendar-event text-blue-600 text-xl"></i>
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

            {/* Sección de imagen del documento MEJORADA */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <i className="bx bx-image text-gray-600"></i>
                <h3 className="font-semibold text-gray-800">Imagen del Documento</h3>
                {imagenArchivo && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">
                    <i className="bx bx-check"></i> Disponible
                  </span>
                )}
              </div>
              
              {cargandoImagen ? (
                <div className="flex justify-center items-center py-12 flex-col">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                  <span className="text-gray-600">Cargando imagen...</span>
                  <span className="text-gray-400 text-sm mt-1">Solicitud: {solicitud.id_req}</span>
                </div>
              ) : errorImagen ? (
                <div className="text-center text-gray-500 py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <i className="bx bx-error text-3xl mb-2 text-amber-500"></i>
                  <p className="text-lg font-medium mb-2">No se pudo cargar la imagen</p>
                  <p className="text-sm text-gray-400">{errorImagen}</p>
                  <button 
                    onClick={cargarImagenSolicitud}
                    className="mt-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <i className="bx bx-refresh"></i>
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
                        <i className="bx bx-zoom-in text-xl"></i>
                        <span>Haz clic para ampliar</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => abrirModalImagen(imagenArchivo)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                    >
                      <i className="bx bx-zoom-in"></i>
                      Ver imagen en pantalla completa
                    </button>
                    <a 
                      href={imagenArchivo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                    >
                      <i className="bx bx-download"></i>
                      Descargar imagen
                    </a>
                    <button 
                      onClick={cargarImagenSolicitud}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                    >
                      <i className="bx bx-refresh"></i>
                      Recargar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <i className="bx bx-image-alt text-4xl mb-3 opacity-50"></i>
                  <p className="text-lg font-medium mb-2">No hay imagen disponible</p>
                  <p className="text-sm">Esta solicitud no tiene documentos adjuntos</p>
                </div>
              )}
            </div>

            {/* Motivo */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <i className="bx bx-edit text-gray-600"></i>
                <h3 className="font-semibold text-gray-800">Motivo de la solicitud</h3>
              </div>
              <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border">
                {solicitud.motivo || "No se especificó motivo"}
              </p>
            </div>

            {/* Documentos requeridos */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <i className="bx bx-folder text-gray-600"></i>
                <h3 className="font-semibold text-gray-800">Documentos adjuntados</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nombresRequerimientos.map((nombre, index) => (
                  <div key={index} className="flex items-center bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <i className="bx bx-check text-green-600"></i>
                    </div>
                    <span className="text-gray-800 font-medium text-sm">{nombre}</span>
                  </div>
                ))}
              </div>
              {nombresRequerimientos.length === 0 && (
                <div className="text-center text-gray-500 py-6 bg-white rounded-lg border border-dashed">
                  <i className="bx bx-file-blank text-3xl mb-2 opacity-50"></i>
                  <p>No se adjuntaron documentos</p>
                </div>
              )}
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
              <i className="bx bx-x"></i>
            </button>

            {/* Controles de imagen */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg flex items-center gap-4 z-10">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = modalImagen.imagenUrl;
                  link.download = `documento-solicitud-${solicitud.id_req}.jpg`;
                  link.click();
                }}
                className="hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                <i className="bx bx-download"></i>
                Descargar
              </button>
              <button
                onClick={cerrarModalImagen}
                className="hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <i className="bx bx-fullscreen"></i>
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
              Solicitud #{solicitud.id_req} • {new Date(solicitud.fecha_creacion).toLocaleDateString()}
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
          width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
        }}
      ></div>
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex flex-col items-center relative">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              step >= stepNumber
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 transform scale-110"
                : "bg-white text-gray-400 border-2 border-gray-300"
            } font-bold text-sm relative z-10`}
          >
            {step >= stepNumber ? (
              <i className="bx bx-check text-sm"></i>
            ) : (
              stepNumber
            )}
          </div>
          <span className={`text-xs mt-3 font-semibold transition-all duration-300 ${
            step >= stepNumber ? "text-blue-600" : "text-gray-500"
          }`}>
            {stepNumber === 1 && "Requerimientos"}
            {stepNumber === 2 && "Documentos"}
            {stepNumber === 3 && "Motivo"}
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
        <i className="bx bx-list-check text-2xl text-blue-600"></i>
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
              <i className="bx bx-check text-white text-sm font-bold"></i>
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
                  <i className="bx bx-check text-white text-sm font-bold"></i>
                )}
              </div>
            </div>
            <span className="ml-4 text-gray-800 font-medium flex-1">
              {req.nombre_requerimiento}
            </span>
            <i className={`bx bx-chevron-right text-gray-400 group-hover:text-blue-500 transition-colors ${
              formData.opt_requerimiento.includes(req.id_requerimientos) ? "text-blue-500" : ""
            }`}></i>
          </label>
        </div>
      ))}
    </div>
    
    {errors.opt_requerimiento && (
      <div className="flex items-center bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 mt-4 animate-shake">
        <div className="bg-red-100 p-2 rounded-lg mr-3">
          <i className="bx bx-error-circle text-red-500 text-xl"></i>
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
        <i className="bx bx-chevron-right ml-2 text-lg"></i>
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
        <i className="bx bx-cloud-upload text-2xl text-blue-600"></i>
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
          <i className="bx bx-image mr-2 text-blue-600"></i>
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
                  <i className="bx bx-check text-green-600 text-2xl"></i>
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
                    <i className="bx bx-zoom-in"></i>
                    Haz clic para ver en grande
                  </p>
                </div>
              </>
            ) : (
              <>
                <i className="bx bx-image-add text-4xl text-blue-500 mb-3"></i>
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
            <i className="bx bx-error-circle text-red-500 mr-3 text-xl"></i>
            <p className="text-red-700 font-medium">{errors.archivo}</p>
          </div>
        )}
      </div>

      {/* Date Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <label className="block mb-4 text-gray-800 font-semibold text-lg">
          <i className="bx bx-calendar mr-2 text-blue-600"></i>
          Fecha para llevar los documentos
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
            <i className="bx bx-calendar text-xl"></i>
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
            <i className="bx bx-error-circle text-red-500 mr-3 text-xl"></i>
            <p className="text-red-700 font-medium">{errors.fecha_llevar}</p>
          </div>
        )}
        
        {formData.fecha_llevar && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
            <p className="text-blue-800 text-sm font-medium flex items-center">
              <i className="bx bx-info-circle mr-2"></i>
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
        <i className="bx bx-chevron-left mr-2 text-lg"></i>
        Regresar
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={!formData.archivo || !formData.fecha_llevar}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center shadow-lg shadow-blue-200"
      >
        Continuar
        <i className="bx bx-chevron-right ml-2 text-lg"></i>
      </button>
    </div>
  </div>
);

// Componente Step 3 - Motivo de la solicitud
const Step3Motivo = ({
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
        <i className="bx bx-edit text-2xl text-blue-600"></i>
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
        <i className="bx bx-message-dots mr-2 text-blue-600"></i>
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
          <i className="bx bx-error-circle text-red-500 mr-3 text-xl"></i>
          <p className="text-red-700 font-medium">{errors.motivo}</p>
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
        <p className="text-sm text-gray-600 font-medium mb-2 flex items-center">
          <i className="bx bx-bulb text-amber-500 mr-2"></i>
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
        <i className="bx bx-chevron-left mr-2 text-lg"></i>
        Regresar
      </button>
      <button
        type="submit"
        disabled={loading || !motivo.trim()}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none flex items-center shadow-lg shadow-green-200 min-w-32 justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            Enviando...
          </>
        ) : (
          <>
            <i className="bx bx-send mr-2 text-lg"></i>
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
    if (!solicitud?.id_req) return;
    
    setVerificandoImagen(true);
    try {
      const archivos = await apiArchivo.getArchivosPorRequerimiento(solicitud.id_req);
      setTieneImagen(archivos && archivos.length > 0 && archivos[0].archivo);
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
        icon: "bx-check-circle",
        gradient: "from-emerald-500 to-emerald-600"
      },
      "Rechazado": { 
        color: "bg-rose-500 text-white",
        icon: "bx-x-circle",
        gradient: "from-rose-500 to-rose-600"
      },
      "En revisión": { 
        color: "bg-blue-500 text-white",
        icon: "bx-time",
        gradient: "from-blue-500 to-blue-600"
      },
      "Pendiente": { 
        color: "bg-amber-500 text-white",
        icon: "bx-hourglass",
        gradient: "from-amber-500 to-amber-600"
      }
    };
    return config[estado] || config["Pendiente"];
  };

  const estadoConfig = getEstadoConfig(estadoSolicitud);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 group hover:border-blue-300">
      {/* Header con gradiente */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
            Solicitud #{solicitud.id_req || "N/A"}
          </h3>
          <p className="text-gray-500 text-sm flex items-center mt-1">
            <i className="bx bx-calendar mr-1"></i>
            {new Date(fechaSolicitud).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`bg-gradient-to-r ${estadoConfig.gradient} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-lg`}>
            <i className={`bx ${estadoConfig.icon} mr-1`}></i>
            {estadoSolicitud}
          </span>
          {verificandoImagen ? (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <i className="bx bx-loader-circle bx-spin mr-1"></i>
              Verificando...
            </span>
          ) : tieneImagen ? (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <i className="bx bx-image mr-1"></i>
              Con imagen
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <i className="bx bx-no-entry mr-1"></i>
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
          <i className="bx bx-folder text-gray-600 mr-2"></i>
          <span className="text-gray-700 font-semibold text-sm">Documentos adjuntados:</span>
        </div>
        <div className="space-y-2">
          {nombresRequerimientos.slice(0, 2).map((nombre, idx) => (
            <div key={idx} className="flex items-center text-gray-600 text-sm bg-gray-50 rounded-lg px-3 py-2">
              <i className="bx bx-check text-green-500 mr-2"></i>
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
            <i className="bx bx-calendar-event mr-2 text-blue-600"></i>
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
          <i className="bx bx-show mr-1"></i>
          Ver Detalles
        </button>
        <div className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-full">
          ID: {solicitud.id_req || "N/A"}
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
      <div className="mb-8 mt-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <i className="bx bx-file text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Mis Solicitudes de Crédito
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
            <i className="bx bx-plus-circle mr-2 text-lg"></i>
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
                <i className="bx bx-file text-blue-600 text-xl"></i>
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
                <i className="bx bx-check-circle text-emerald-600 text-xl"></i>
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
                <i className="bx bx-time text-amber-600 text-xl"></i>
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
                <i className="bx bx-refresh text-blue-600 text-xl"></i>
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
              key={solicitud.id_req || index}
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
              <i className="bx bx-file-blank text-3xl text-gray-400"></i>
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
              <i className="bx bx-plus-circle mr-2 text-lg"></i>
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
        newErrors.archivo = "Debe adjuntar una imagen.";
      } else if (!formData.archivo.type.startsWith('image/')) {
        newErrors.archivo = "El archivo debe ser una imagen (JPG, PNG, WEBP, etc.).";
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
    <div className="max-w-5xl mx-auto">
      {/* Header del formulario */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 mt-6 gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
            <i className="bx bx-edit-alt text-2xl text-white"></i>
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
          <i className="bx bx-arrow-back mr-2"></i>
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
            <i className="bx bx-list-check text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {step === 1
                ? "Selecciona tus Requerimientos"
                : step === 2
                ? "Adjunta tus Documentos"
                : "Motivo de tu Solicitud"}
            </h2>
            <p className="text-gray-600">
              {step === 1
                ? "Elige los documentos que vas a presentar"
                : step === 2
                ? "Sube tu archivo y programa tu cita"
                : "Describe el propósito de tu solicitud"}
            </p>
          </div>
        </div>

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
              setErrors={setErrors}
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
  const [modalDetalles, setModalDetalles] = useState({ open: false, solicitud: null });

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
          popup: "rounded-2xl shadow-2xl",
          title: "text-xl font-bold",
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