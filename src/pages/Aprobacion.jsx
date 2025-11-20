import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Importar Tabler Icons
import {
  TbX,
  TbCheck,
  TbPhoto,
  TbDownload,
  TbExternalLink,
  TbRefresh,
  TbZoomIn,
  TbUser,
  TbFileText,
  TbSearch,
  TbCircleCheck,
  TbClock,
  TbAlertCircle,
  TbChevronLeft,
  TbChevronRight,
  TbShield,
  TbCalendar,
  TbMail,
  TbPhone,
  TbId,
  TbEdit,
  TbListCheck,
  TbFolder,
  TbInfoCircle,
  TbLoader,
} from "react-icons/tb";

import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

import { getRequerimientos } from "../services/api_requerimientos";
import { getTodosRequerimientosEmprendedor } from "../services/api_requerimiento_emprendedor";
import { updateRequerimientoEmprendedor } from "../services/api_requerimiento_emprendedor";
import { updateSolicitudPorIdReq } from "../services/api_solicitud";
import apiArchivo from "../services/api_archivo";
import { getFiadorPorIdReq } from "../services/api_fiador_solicitud";

// Componente DetallesSolicitud mejorado
const DetallesSolicitud = ({ 
  personaSeleccionada, 
  resultado, 
  requerimientos, 
  onClose,
  onAprobar,
  onRechazar,
  onGuardarVerificados 
}) => {
  const [imagenIndex, setImagenIndex] = useState(0);
  const [archivos, setArchivos] = useState([]);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [resultadoLocal, setResultadoLocal] = useState([]);
  const [archivosFiador, setArchivosFiador] = useState([]);
  const [mostrarModalImagen, setMostrarModalImagen] = useState(false);
  const [cargandoFiador, setCargandoFiador] = useState(false);

  // Sincronizar resultadoLocal con el resultado prop
  useEffect(() => {
    if (resultado) {
      setResultadoLocal([...resultado]);
    }
  }, [resultado]);

  const cargarImagenesPersona = async () => {
    if (!personaSeleccionada?.cedula_emprendedor) return;
    
    setCargandoImagen(true);
    try {
      let archivosEncontrados = [];
      
      // Buscar por id_req si está disponible
      if (personaSeleccionada.id_req) {
        try {
          archivosEncontrados = await apiArchivo.getArchivosByReq(personaSeleccionada.id_req);
        } catch (error) {
          console.log('Buscando por cédula...');
          archivosEncontrados = await apiArchivo.getArchivoPorCedulaEmprendedor(personaSeleccionada.cedula_emprendedor);
        }
      } else {
        archivosEncontrados = await apiArchivo.getArchivoPorCedulaEmprendedor(personaSeleccionada.cedula_emprendedor);
      }
      
      if (archivosEncontrados && archivosEncontrados.length > 0) {
        const archivosConUrl = await Promise.all(
          archivosEncontrados.map(async (archivo) => {
            let urlImagen = null;
            
            if (archivo.url) {
              urlImagen = archivo.url;
            } else if (archivo.archivo) {
              urlImagen = apiArchivo.obtenerUrlImagen 
                ? apiArchivo.obtenerUrlImagen(archivo.archivo)
                : `http://localhost:5000/uploads/${archivo.archivo}`;
            }
            
            if (urlImagen) {
              try {
                const response = await fetch(urlImagen, { method: 'HEAD' });
                if (response.ok) {
                  return { 
                    ...archivo, 
                    urlImagen, 
                    tipo: 'emprendedor',
                    nombre: archivo.nombre || `Documento Emprendedor - ${archivo.id || ''}`
                  };
                }
              } catch (error) {
                console.error('Error al verificar imagen:', error);
              }
            }
            return null;
          })
        );

        const archivosValidos = archivosConUrl.filter(archivo => archivo !== null);
        setArchivos(archivosValidos);
      }
    } catch (error) {
      console.error("Error al cargar las imágenes:", error);
    } finally {
      setCargandoImagen(false);
    }
  };

  // 🔥 FUNCIÓN PARA CARGAR ARCHIVOS DEL FIADOR
  const cargarArchivosFiador = async () => {
    if (!resultadoLocal[0]?.fiador) return;
    
    setCargandoFiador(true);
    try {
      const fiador = resultadoLocal[0].fiador;
      const archivosFiadorEncontrados = [];

      // Buscar archivos del fiador
      if (fiador.foto_rif_fiscal) {
        const urlFiador = `http://localhost:5000/uploads/fiadores/${fiador.foto_rif_fiscal}`;
        
        try {
          const response = await fetch(urlFiador, { method: 'HEAD' });
          if (response.ok) {
            archivosFiadorEncontrados.push({
              urlImagen: urlFiador,
              nombre: `RIF Fiscal - ${fiador.nombre_completo_fiador}`,
              tipo: 'fiador',
              descripcion: 'Documento RIF/Fiscal del Fiador'
            });
          }
        } catch (error) {
          console.error('Error al verificar archivo del fiador:', error);
        }
      }

      setArchivosFiador(archivosFiadorEncontrados);
    } catch (error) {
      console.error('Error cargando archivos del fiador:', error);
    } finally {
      setCargandoFiador(false);
    }
  };

  useEffect(() => {
    if (personaSeleccionada) {
      cargarImagenesPersona();
    }
  }, [personaSeleccionada]);

  useEffect(() => {
    if (resultadoLocal.length > 0 && resultadoLocal[0].fiador) {
      cargarArchivosFiador();
    }
  }, [resultadoLocal]);

  // 🔥 COMBINAR ARCHIVOS DEL EMPRENDEDOR Y DEL FIADOR
  const todosLosArchivos = [...archivos, ...archivosFiador];

  const siguienteImagen = () => {
    if (todosLosArchivos.length > 0) {
      const nuevoIndex = (imagenIndex + 1) % todosLosArchivos.length;
      setImagenIndex(nuevoIndex);
    }
  };

  const anteriorImagen = () => {
    if (todosLosArchivos.length > 0) {
      const nuevoIndex = (imagenIndex - 1 + todosLosArchivos.length) % todosLosArchivos.length;
      setImagenIndex(nuevoIndex);
    }
  };

  const seleccionarImagen = (index) => {
    setImagenIndex(index);
  };

  const descargarImagen = async () => {
    if (todosLosArchivos[imagenIndex]?.urlImagen) {
      try {
        const link = document.createElement('a');
        link.href = todosLosArchivos[imagenIndex].urlImagen;
        link.download = `documento-${personaSeleccionada.id_req}-${imagenIndex + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error al descargar:', error);
        Swal.fire({
          title: "Error",
          text: "No se pudo descargar el documento",
          icon: "error",
          confirmButtonColor: "#dc2626"
        });
      }
    }
  };

  // Función para manejar el cambio en los checkboxes
  const handleCheckboxChange = (reqId, personaReq) => {
    setResultadoLocal(prev => {
      return prev.map(item => {
        if (item.id_req === personaReq.id_req) {
          const verificadosActuales = item.requerimientosVerificados || [];
          const estaVerificado = verificadosActuales.includes(reqId);
          
          const nuevosVerificados = estaVerificado
            ? verificadosActuales.filter(id => id !== reqId)
            : [...verificadosActuales, reqId];
          
          return {
            ...item,
            requerimientosVerificados: nuevosVerificados
          };
        }
        return item;
      });
    });
  };

  // Función para guardar los verificados
  const handleGuardarVerificados = async () => {
    try {
      // Actualizar cada requerimiento en la base de datos
      for (const req of resultadoLocal) {
        await updateRequerimientoEmprendedor(req.id_req, {
          verificacion: req.requerimientosVerificados || [],
        });
      }

      // Llamar a la función del padre para actualizar el estado global
      if (onGuardarVerificados) {
        onGuardarVerificados(resultadoLocal);
      }

      Swal.fire({
        title: "Éxito",
        text: "Requerimientos verificados guardados correctamente.",
        icon: "success",
        confirmButtonColor: "#0F3C5B",
        timer: 2000
      });
    } catch (error) {
      console.error("Error guardando requerimientos verificados:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron guardar los requerimientos verificados.",
        icon: "error",
        confirmButtonColor: "#dc2626"
      });
    }
  };

  if (!personaSeleccionada) return null;

  const getEstadoConfig = (estado) => {
    const config = {
      "Aprobada": { 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        badge: "bg-emerald-500",
        icon: TbCircleCheck,
      },
      "Rechazada": { 
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: TbX, 
        badge: "bg-rose-500"
      },
      "Pendiente": { 
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: TbClock,
        badge: "bg-amber-500"
      }
    };
    return config[estado] || config["Pendiente"];
  };

  const estadoConfig = getEstadoConfig(personaSeleccionada.estatus);
  const EstadoIcon = estadoConfig.icon || TbInfoCircle;

  return (
    <>
      {/* Modal para imagen ampliada */}
      {mostrarModalImagen && todosLosArchivos[imagenIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setMostrarModalImagen(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
            >
              <TbX size={32} />
            </button>
            <img 
              src={todosLosArchivos[imagenIndex].urlImagen} 
              alt={todosLosArchivos[imagenIndex].nombre}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                onClick={descargarImagen}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
              >
                <TbDownload size={16} />
                Descargar
              </button>
              <button
                onClick={() => setMostrarModalImagen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
              >
                <TbX size={16} />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detalles de la solicitud */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 animate-fade-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Detalles de {personaSeleccionada.nombre_completo}
              </h2>
              <p className="text-blue-100">
                Solicitud #{personaSeleccionada.id_req} - {todosLosArchivos.length} documento(s) adjunto(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  cargarImagenesPersona();
                  cargarArchivosFiador();
                }}
                className="text-white/80 hover:text-white p-2 rounded-lg bg-white/10 transition-all hover:scale-110"
                title="Recargar documentos"
              >
                <TbRefresh size={20} />
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-2 rounded-lg bg-white/10 transition-all hover:scale-110"
              >
                <TbX size={24} />
              </button>
            </div>
          </div>
          <div className="absolute -bottom-4 left-6">
            <span className={`${estadoConfig.badge} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2`}>
              <EstadoIcon size={16} />
              {personaSeleccionada.estatus || "Pendiente"}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TbUser size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emprendimiento</p>
                  <p className="font-semibold text-gray-800">
                    {personaSeleccionada.nombre_emprendimiento || "No especificado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TbId size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cédula</p>
                  <p className="font-semibold text-gray-800">
                    {personaSeleccionada.cedula_emprendedor}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <TbFileText size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de Negocio</p>
                  <p className="font-semibold text-gray-800">
                    {personaSeleccionada.tipo_negocio || "No especificado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <TbCalendar size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha Solicitud</p>
                  <p className="font-semibold text-gray-800">
                    {personaSeleccionada.fecha_creacion ? 
                      new Date(personaSeleccionada.fecha_creacion).toLocaleDateString('es-ES') : 
                      "No especificada"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 🔥 SECCIÓN DEL FIADOR MEJORADA */}
          {resultadoLocal[0]?.fiador && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <TbShield size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-800">Información del Fiador</h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full ml-2">
                  Garante
                </span>
                {cargandoFiador && (
                  <TbLoader size={16} className="animate-spin text-blue-500" />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="font-semibold text-gray-800">
                    {resultadoLocal[0].fiador.nombre_completo_fiador}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-sm text-gray-500">Cédula</p>
                  <p className="font-semibold text-gray-800">
                    {resultadoLocal[0].fiador.cedula_fiador}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-semibold text-gray-800">
                    {resultadoLocal[0].fiador.telefono_fiador}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-sm text-gray-500">Correo</p>
                  <p className="font-semibold text-gray-800">
                    {resultadoLocal[0].fiador.correo_fiador || "No especificado"}
                  </p>
                </div>
              </div>
              
              {/* Estado de verificación del fiador */}
              <div className="mt-4 bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Estado de Verificación</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      resultadoLocal[0].fiador.verificacion_fiador === 'Aprobado' 
                        ? 'bg-green-100 text-green-800'
                        : resultadoLocal[0].fiador.verificacion_fiador === 'Rechazado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {resultadoLocal[0].fiador.verificacion_fiador === 'Aprobado' && <TbCheck size={14} className="mr-1" />}
                      {resultadoLocal[0].fiador.verificacion_fiador === 'Rechazado' && <TbX size={14} className="mr-1" />}
                      {resultadoLocal[0].fiador.verificacion_fiador || 'Pendiente'}
                    </span>
                  </div>
                  {archivosFiador.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      {archivosFiador.length} documento(s)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sección del carrusel de documentos */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TbPhoto size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-800">Documentos Adjuntos</h3>
                {todosLosArchivos.length > 0 && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">
                    <TbCheck size={12} /> {todosLosArchivos.length} documento(s)
                  </span>
                )}
                {cargandoImagen && (
                  <TbLoader size={16} className="animate-spin text-blue-500" />
                )}
              </div>
              {todosLosArchivos.length > 0 && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  {imagenIndex + 1} / {todosLosArchivos.length}
                  {todosLosArchivos[imagenIndex]?.tipo === 'fiador' && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      Fiador
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {cargandoImagen ? (
              <div className="flex justify-center items-center py-12 flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                <span className="text-gray-600">Cargando documentos...</span>
              </div>
            ) : todosLosArchivos.length > 0 ? (
              <div className="space-y-4">
                {/* Carrusel principal */}
                <div className="relative bg-white rounded-lg border border-gray-300 p-4">
                  {/* Controles del carrusel */}
                  {todosLosArchivos.length > 1 && (
                    <>
                      <button
                        onClick={anteriorImagen}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
                      >
                        <TbChevronLeft size={20} />
                      </button>
                      <button
                        onClick={siguienteImagen}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
                      >
                        <TbChevronRight size={20} />
                      </button>
                    </>
                  )}
                  
                  {/* Indicador de tipo de documento */}
                  {todosLosArchivos[imagenIndex]?.tipo === 'fiador' && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        📋 Documento del Fiador
                      </span>
                    </div>
                  )}
                  
                  {/* Imagen principal */}
                  <div 
                    className="flex justify-center cursor-pointer"
                    onClick={() => setMostrarModalImagen(true)}
                  >
                    <img 
                      src={todosLosArchivos[imagenIndex]?.urlImagen} 
                      alt={todosLosArchivos[imagenIndex]?.nombre || `Documento ${imagenIndex + 1}`}
                      className="max-w-full h-auto max-h-96 object-contain rounded-lg hover:shadow-lg transition-shadow"
                    />
                  </div>
                  
                  {/* Indicadores */}
                  {todosLosArchivos.length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      {todosLosArchivos.map((archivo, index) => (
                        <button
                          key={index}
                          onClick={() => seleccionarImagen(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === imagenIndex 
                              ? archivo.tipo === 'fiador' 
                                ? "bg-blue-600 scale-125" 
                                : "bg-blue-600 scale-125"
                              : archivo.tipo === 'fiador'
                              ? "bg-blue-300 hover:bg-blue-400"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                          title={archivo.nombre}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Información del documento actual */}
                <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm font-medium text-gray-800">
                    {todosLosArchivos[imagenIndex]?.nombre || `Documento ${imagenIndex + 1}`}
                    {todosLosArchivos[imagenIndex]?.tipo === 'fiador' && (
                      <span className="text-blue-600 ml-2">(Fiador)</span>
                    )}
                  </p>
                  {todosLosArchivos[imagenIndex]?.descripcion && (
                    <p className="text-xs text-gray-600 mt-1">
                      {todosLosArchivos[imagenIndex].descripcion}
                    </p>
                  )}
                </div>

                {/* Controles de acción */}
                <div className="flex justify-center gap-3 flex-wrap">
                  <button 
                    onClick={descargarImagen}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    <TbDownload size={16} />
                    Descargar actual
                  </button>
                  <button 
                    onClick={() => setMostrarModalImagen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    <TbZoomIn size={16} />
                    Ver en grande
                  </button>
                  <button 
                    onClick={() => {
                      cargarImagenesPersona();
                      cargarArchivosFiador();
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    <TbRefresh size={16} />
                    Recargar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <TbPhoto size={32} className="mb-3 opacity-50 mx-auto" />
                <p className="text-lg font-medium mb-2">No hay documentos disponibles</p>
                <p className="text-sm">No se encontraron documentos adjuntos</p>
              </div>
            )}
          </div>

          {/* Requerimientos y detalles */}
          {resultadoLocal && Array.isArray(resultadoLocal) && resultadoLocal.map((req, index) => (
            <div key={req.id_req} className="space-y-4">
              {/* Requerimientos seleccionados */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <TbListCheck size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Requerimientos Seleccionados</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {req.opt_requerimiento?.length || 0} seleccionados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requerimientos
                    .filter((r) =>
                      req.opt_requerimiento?.includes(r.id_requerimientos)
                    )
                    .map((r, idx) => {
                      const estaVerificado = req.requerimientosVerificados?.includes(r.id_requerimientos);
                      return (
                        <div
                          key={r.id_requerimientos}
                          className={`flex items-center p-4 rounded-lg border transition-colors duration-200 cursor-pointer ${
                            estaVerificado 
                              ? "bg-green-50 border-green-200 hover:bg-green-100" 
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                          onClick={() => handleCheckboxChange(r.id_requerimientos, req)}
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition duration-200 cursor-pointer"
                            checked={estaVerificado || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(r.id_requerimientos, req);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className={`w-3 h-3 rounded-full ml-3 mr-4 flex-shrink-0 ${
                            estaVerificado ? "bg-green-500" : "bg-indigo-500"
                          }`}></div>
                          <span className={`font-medium ${
                            estaVerificado ? "text-green-700" : "text-gray-700"
                          }`}>
                            {r.nombre_requerimiento}
                            {estaVerificado && (
                              <span className="text-green-600 text-xs ml-2 flex items-center gap-1">
                                <TbCheck size={10} />
                                Verificado
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Motivo de la solicitud */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <TbEdit size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Motivo de la Solicitud</h3>
                </div>
                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border">
                  {req.motivo || "No se especificó motivo"}
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <TbInfoCircle size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Información Adicional</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p><strong>ID Requerimiento:</strong> {req.id_req}</p>
                    <p><strong>Cédula Emprendedor:</strong> {req.cedula_emprendedor}</p>
                  </div>
                  <div>
                    <p><strong>Fecha de Creación:</strong> {req.fecha_creacion ? new Date(req.fecha_creacion).toLocaleString('es-ES') : "No especificada"}</p>
                    <p><strong>Requerimientos Verificados:</strong> {(req.requerimientosVerificados?.length || 0)} de {req.opt_requerimiento?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer del carrusel */}
        <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-medium py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <TbX size={16} />
            Cerrar Detalles
          </button>

          {/* 🔥 MODIFICACIÓN: Mostrar botones solo si NO está aprobada */}
          {personaSeleccionada.estatus !== "aprobada" && personaSeleccionada.estatus !== "Aprobada" && (
            <div className="flex space-x-4">
              <button
                onClick={handleGuardarVerificados}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <TbCheck size={16} />
                Guardar Verificados
              </button>
              <button
                onClick={() => onAprobar(personaSeleccionada)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <TbCheck size={16} />
                Aprobar Solicitud
              </button>
              <button
                onClick={() => onRechazar(personaSeleccionada)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <TbX size={16} />
                Rechazar Solicitud
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Funciones para cargar datos
const fetchPersonasRegistradas = async () => {
  try {
    const data = await getTodosRequerimientosEmprendedor();
    return data;
  } catch (error) {
    console.error("Error cargando personas registradas:", error);
    return [];
  }
};

const fetchDetallesPersona = async (cedula) => {
  try {
    const data = await getTodosRequerimientosEmprendedor();
    const filtrados = data.filter(item => item.cedula_emprendedor === cedula);
    return eliminarDuplicados(filtrados, 'id_req');
  } catch (error) {
    console.error("Error cargando detalles:", error);
    return null;
  }
};

// Función para eliminar duplicados
const eliminarDuplicados = (datos, clave = 'id_req') => {
  const seen = new Set();
  return datos.filter(item => {
    const duplicate = seen.has(item[clave]);
    seen.add(item[clave]);
    return !duplicate;
  });
};

const Aprobacion = () => {
  const navigate = useNavigate();

  const [personasRegistradas, setPersonasRegistradas] = useState([]);
  const [menuOpen, setMenuOpen] = useState(true);
  const [requerimientos, setRequerimientos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recargando, setRecargando] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [cedulaFiltro, setCedulaFiltro] = useState("");

  // Carga de requerimientos
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

  // Carga de personas - VERSIÓN CORREGIDA
  const cargarPersonasRegistradas = async () => {
    setRecargando(true);
    try {
      const data = await fetchPersonasRegistradas();
      console.log('📊 Datos crudos de API:', data);
      console.log('🔢 Total registros antes de eliminar duplicados:', data.length);
      
      // Eliminar duplicados por id_req
      const datosUnicos = eliminarDuplicados(data, 'id_req');
      console.log('✅ Datos después de eliminar duplicados:', datosUnicos);
      console.log('🔢 Registros únicos:', datosUnicos.length);
      
      // Usar 'verificacion' en lugar de 'vereficacion'
      const personasConVerificados = datosUnicos.map((p) => ({
        ...p,
        requerimientosVerificados: p.verificacion || [],
      }));
      
      setPersonasRegistradas(personasConVerificados);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setRecargando(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPersonasRegistradas();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Función para cargar detalles - CORREGIDA CON FIADOR
  const verDetalles = async (persona) => {
    setPersonaSeleccionada(persona);
    setLoading(true);
    try {
      const detalles = await fetchDetallesPersona(persona.cedula_emprendedor);
      
      // 🔥 FILTRADO CRÍTICO: Mostrar SOLO la solicitud específica del id_req seleccionado
      const detallesFiltrados = detalles.filter(detalle => 
        detalle.id_req === persona.id_req
      );
      
      console.log('🎯 Detalles filtrados por id_req:', {
        id_req_seleccionado: persona.id_req,
        detalles_encontrados: detallesFiltrados.length,
        todos_los_detalles: detalles.length
      });

      // 🔥 CARGAR DATOS DEL FIADOR
      let datosFiador = null;
      try {
        // Intentar obtener fiador por id_req
        datosFiador = await getFiadorPorIdReq(persona.id_req);
        console.log('📋 Datos del fiador:', datosFiador);
      } catch (error) {
        console.log('⚠️ No se encontró fiador para esta solicitud:', error);
      }

      // Usar el campo 'verificacion' de la base de datos
      const detallesConVerificados = detallesFiltrados.map((detalle) => ({
        ...detalle,
        requerimientosVerificados: detalle.verificacion || [],
        fiador: datosFiador // 🔥 Añadir datos del fiador
      }));

      setResultado(detallesConVerificados);
    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir imagen en nueva pestaña
  const abrirImagenEnPestaña = async (persona) => {
    try {
      const archivos = await apiArchivo.getArchivoPorCedulaEmprendedor(persona.cedula_emprendedor);
      
      if (archivos && archivos.length > 0) {
        const archivo = archivos[0];
        let urlImagen = null;
        
        if (archivo.url) {
          urlImagen = archivo.url;
        } else if (archivo.archivo) {
          urlImagen = apiArchivo.obtenerUrlImagen 
            ? apiArchivo.obtenerUrlImagen(archivo.archivo)
            : `http://localhost:5000/uploads/${archivo.archivo}`;
        }
        
        if (urlImagen) {
          window.open(urlImagen, '_blank');
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo obtener la URL de la imagen',
            icon: 'error',
            confirmButtonColor: '#dc2626'
          });
        }
      } else {
        Swal.fire({
          title: 'Sin archivos',
          text: 'No se encontraron archivos para este emprendedor',
          icon: 'info',
          confirmButtonColor: '#0F3C5B'
        });
      }
    } catch (error) {
      console.error('Error al abrir imagen:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la imagen',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const cerrarDetalles = () => {
    setPersonaSeleccionada(null);
    setResultado(null);
  };

  // Función para actualizar los requerimientos verificados
  const handleGuardarVerificados = (nuevosResultados) => {
    // Actualizar el estado local
    setResultado(nuevosResultados);
    
    // Actualizar también en la lista principal
    setPersonasRegistradas(prev => 
      prev.map(p => {
        if (p.id_req === personaSeleccionada.id_req) {
          return {
            ...p,
            requerimientosVerificados: nuevosResultados.flatMap(r => r.requerimientosVerificados || [])
          };
        }
        return p;
      })
    );
  };

  // Funciones para aprobar y rechazar
  const aprobarPersona = async (persona) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas aprobar la solicitud #${persona.id_req} de ${persona.nombre_completo}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log('🎯 Aprobando solicitud por id_req:', {
            id_req: persona.id_req,
            nombre: persona.nombre_completo,
            cedula: persona.cedula_emprendedor
          });

          await updateSolicitudPorIdReq(persona.id_req, { 
            estatus: "Aprobada"
          });

          // Actualizar el estado local - SOLO la solicitud específica
          setPersonasRegistradas((prev) =>
            prev.map((p) =>
              p.id_req === persona.id_req
                ? { ...p, estatus: "Aprobada" }
                : p
            )
          );

          // Cerrar el carrusel después de aprobar
          cerrarDetalles();

          Swal.fire({
            title: "¡Aprobada!",
            text: `La solicitud #${persona.id_req} ha sido aprobada correctamente.`,
            icon: "success",
            confirmButtonColor: "#0F3C5B",
            timer: 3000
          });
        } catch (error) {
          console.error("❌ Error aprobando solicitud:", error);
          Swal.fire({
            title: "¡Error!", 
            text: `No se pudo aprobar la solicitud: ${error.response?.data?.message || error.message}`, 
            icon: "error",
            confirmButtonColor: "#dc2626"
          });
        }
      }
    });
  };

  const rechazarPersona = async (persona) => {
    Swal.fire({
      title: `Rechazar solicitud #${persona.id_req}`,
      input: "textarea",
      inputLabel: "Motivo del rechazo",
      inputPlaceholder: "Escribe el motivo del rechazo...",
      inputAttributes: {
        "aria-label": "Escribe el motivo del rechazo",
      },
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      showLoaderOnConfirm: true,
      preConfirm: (motivo) => {
        if (!motivo || motivo.trim() === "") {
          Swal.showValidationMessage("Debes escribir un motivo para rechazar.");
          return false;
        }
        return motivo;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          console.log('🎯 Rechazando solicitud por id_req:', {
            id_req: persona.id_req,
            nombre: persona.nombre_completo,
            motivo: result.value
          });

          await updateSolicitudPorIdReq(persona.id_req, {
            estatus: "Rechazada",
            motivo_rechazo: result.value
          });

          // Actualizar el estado local - SOLO la solicitud específica
          setPersonasRegistradas((prev) =>
            prev.map((p) =>
              p.id_req === persona.id_req
                ? { ...p, estatus: "Rechazada", motivo_rechazo: result.value }
                : p
            )
          );

          // Cerrar el carrusel después de rechazar
          cerrarDetalles();

          Swal.fire({
            title: "Rechazada", 
            text: `La solicitud #${persona.id_req} ha sido rechazada.`, 
            icon: "success",
            confirmButtonColor: "#0F3C5B",
            timer: 3000
          });
        } catch (error) {
          console.error("❌ Error rechazando solicitud:", error);
          Swal.fire({
            title: "¡Error!", 
            text: `No se pudo rechazar la solicitud: ${error.response?.data?.message || error.message}`, 
            icon: "error",
            confirmButtonColor: "#dc2626"
          });
        }
      }
    });
  };

  // Filtrado de solicitudes
  const filteredPersonas = personasRegistradas.filter((persona) => {
    const estadoMatch =
      filtroEstado === "todos" ||
      persona.estatus?.toLowerCase() === filtroEstado;

    const searchMatch =
      persona.nombre_completo
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      persona.cedula_emprendedor
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      persona.nombre_emprendimiento
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const cedulaMatch =
      cedulaFiltro.trim() === "" ||
      persona.cedula_emprendedor?.includes(cedulaFiltro.trim());

    return estadoMatch && searchMatch && cedulaMatch;
  });

  // Función para obtener clase de color según estado
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "aprobada":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rechazada":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto mt-9 bg-gray-100 p-6">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer">
                <TbCircleCheck size={32} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Revisión y Aprobación
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Gestiona las solicitudes de los emprendedores
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={cargarPersonasRegistradas}
                disabled={recargando}
                className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <TbRefresh size={20} className={recargando ? "animate-spin" : ""} />
                {recargando ? "Recargando..." : "Recargar"}
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por nombre
                </label>
                <input
                  type="text"
                  placeholder="Nombre del emprendedor"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por cédula
                </label>
                <input
                  type="text"
                  placeholder="Número de cédula"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  value={cedulaFiltro}
                  onChange={(e) => setCedulaFiltro(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFiltroEstado("todos");
                    setSearchTerm("");
                    setCedulaFiltro("");
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <TbX size={16} />
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total solicitudes */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <TbUser size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total solicitudes</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {personasRegistradas.length}
                  </h3>
                </div>
              </div>
            </div>
            {/* Aprobadas */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <TbCircleCheck size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Aprobadas</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {
                      personasRegistradas.filter(
                        (p) => p.estatus?.toLowerCase() === "aprobada"
                      ).length
                    }
                  </h3>
                </div>
              </div>
            </div>
            {/* Pendientes */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <TbClock size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pendientes</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {
                      personasRegistradas.filter(
                        (p) => p.estatus?.toLowerCase() === "pendiente"
                      ).length
                    }
                  </h3>
                </div>
              </div>
            </div>
            {/* Rechazadas */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <TbX size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rechazadas</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {
                      personasRegistradas.filter(
                        (p) => p.estatus?.toLowerCase() === "rechazada"
                      ).length
                    }
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Mostrar carrusel si hay una persona seleccionada */}
          {personaSeleccionada && (
            <DetallesSolicitud
              personaSeleccionada={personaSeleccionada}
              resultado={resultado}
              requerimientos={requerimientos}
              onClose={cerrarDetalles}
              onAprobar={aprobarPersona}
              onRechazar={rechazarPersona}
              onGuardarVerificados={handleGuardarVerificados}
            />
          )}

          {/* Lista de personas */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Cargando solicitudes...</p>
              </div>
            ) : filteredPersonas.length === 0 ? (
              <div className="p-8 text-center">
                <TbSearch size={48} className="text-gray-300 mb-4 mx-auto" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-500">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Emprendedor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Cédula
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPersonas.map((persona) => (
                      <tr
                        key={`${persona.cedula_emprendedor}-${persona.id_req}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <TbUser className="text-indigo-800" size={18} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {persona.nombre_completo}
                              </div>
                              <div className="text-sm text-gray-500">
                                {persona.nombre_emprendimiento}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {persona.id_req}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {persona.cedula_emprendedor}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              persona.estatus
                            )}`}
                          >
                            {persona.estatus}
                          </span>
                          {persona.estatus === "rechazada" &&
                            persona.motivo_rechazo && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                Motivo: {persona.motivo_rechazo}
                              </div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition flex items-center gap-1"
                              onClick={() => verDetalles(persona)}
                            >
                              <TbFileText size={14} />
                              Detalles
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition flex items-center gap-1"
                              onClick={() => abrirImagenEnPestaña(persona)}
                              title="Abrir imagen en nueva pestaña"
                            >
                              <TbPhoto size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paginación */}
          {filteredPersonas.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 rounded-b-xl sm:px-6 mt-2">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {filteredPersonas.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium">
                      {filteredPersonas.length}
                    </span>{" "}
                    resultados
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} <strong>IFEMI & UPTYAB</strong>. Todos
          los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Aprobacion;