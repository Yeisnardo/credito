import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

import { getRequerimientos } from "../services/api_requerimientos";
import { getTodosRequerimientosEmprendedor } from "../services/api_requerimiento_emprendedor";
import { updateRequerimientoEmprendedor } from "../services/api_requerimiento_emprendedor";
import { updateSolicitud } from "../services/api_solicitud";
import apiArchivo from "../services/api_archivo";

// Componente Modal para visualizar imagen
const ModalImagen = ({ imagenUrl, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl transition-all hover:scale-110 bg-black/50 p-2 rounded-lg z-10"
        >
          <i className="bx bx-x"></i>
        </button>

        {/* Controles de imagen */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg flex items-center gap-4 z-10">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = imagenUrl;
              link.download = `documento-${Date.now()}.jpg`;
              link.click();
            }}
            className="hover:text-blue-300 transition-colors flex items-center gap-2"
          >
            <i className="bx bx-download"></i>
            Descargar
          </button>
          <button
            onClick={() => window.open(imagenUrl, '_blank')}
            className="hover:text-green-300 transition-colors flex items-center gap-2"
          >
            <i className="bx bx-link-external"></i>
            Abrir en nueva pestaña
          </button>
        </div>

        {/* Imagen */}
        <div className="w-full h-full flex items-center justify-center p-8">
          <img 
            src={imagenUrl} 
            alt="Documento en pantalla completa" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar imagen del documento - MEJORADO
const ImagenDocumento = ({ cedulaEmprendedor, idReq }) => {
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState(null);
  const [modalImagen, setModalImagen] = useState(false);

  const cargarImagen = async () => {
    if (!cedulaEmprendedor) {
      setErrorImagen("No hay cédula de emprendedor disponible");
      return;
    }
    
    setCargandoImagen(true);
    setErrorImagen(null);
    setImagenArchivo(null);
    
    try {
      console.log('🔍 Buscando imagen para cédula:', cedulaEmprendedor);
      
      const archivos = await apiArchivo.getArchivoPorCedulaEmprendedor(cedulaEmprendedor);
      console.log('📁 Archivos obtenidos:', archivos);
      
      if (archivos && archivos.length > 0) {
        // Buscar archivo que coincida con el id_req si se proporciona
        let archivo = idReq 
          ? archivos.find(a => a.id_req === idReq) 
          : archivos[0];
        
        // Si no encuentra por id_req, tomar el más reciente
        if (!archivo) {
          archivo = archivos[0];
          console.log('⚠️ Usando archivo más reciente');
        }
        
        console.log('🎯 Archivo seleccionado:', archivo);
        
        let urlImagen = null;
        
        // Priorizar la URL proporcionada por el backend
        if (archivo.url) {
          urlImagen = archivo.url;
        } 
        // Si tenemos el nombre del archivo, construir URL
        else if (archivo.archivo) {
          urlImagen = apiArchivo.obtenerUrlImagen 
            ? apiArchivo.obtenerUrlImagen(archivo.archivo)
            : `http://localhost:5000/uploads/${archivo.archivo}`;
        }
        
        if (urlImagen) {
          console.log('🖼️ URL de imagen construida:', urlImagen);
          
          // Verificar que la imagen sea accesible
          const response = await fetch(urlImagen, { method: 'HEAD' });
          if (response.ok) {
            setImagenArchivo(urlImagen);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } else {
          throw new Error("No se pudo generar la URL de la imagen");
        }
      } else {
        throw new Error("No se encontraron archivos para este emprendedor");
      }
      
    } catch (error) {
      console.error("❌ Error al cargar la imagen:", error);
      setErrorImagen(`Error: ${error.message || "No se pudo cargar la imagen"}`);
    } finally {
      setCargandoImagen(false);
    }
  };

  useEffect(() => {
    if (cedulaEmprendedor) {
      cargarImagen();
    }
  }, [cedulaEmprendedor, idReq]);

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <i className="bx bx-image text-gray-600"></i>
        <h3 className="font-semibold text-gray-800">Imagen del Documento</h3>
        {imagenArchivo && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">
            <i className="bx bx-check"></i> Disponible
          </span>
        )}
        {errorImagen && (
          <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full ml-2">
            <i className="bx bx-error"></i> Error
          </span>
        )}
      </div>
      
      {cargandoImagen ? (
        <div className="flex justify-center items-center py-8 flex-col">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <span className="text-gray-600 text-sm">Cargando imagen...</span>
        </div>
      ) : errorImagen ? (
        <div className="text-center text-gray-500 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <i className="bx bx-error text-2xl mb-2 text-amber-500"></i>
          <p className="text-sm font-medium mb-1">No se pudo cargar la imagen</p>
          <p className="text-xs text-gray-400 mb-3">{errorImagen}</p>
          <button 
            onClick={cargarImagen}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium py-1 px-3 rounded-lg transition-all flex items-center gap-1 mx-auto"
          >
            <i className="bx bx-refresh"></i>
            Reintentar
          </button>
        </div>
      ) : imagenArchivo ? (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-300 p-3 flex justify-center cursor-pointer group relative overflow-hidden"
            onClick={() => setModalImagen(true)}>
            <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <img 
              src={imagenArchivo} 
              alt="Documento adjunto" 
              className="max-w-full h-auto max-h-48 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                console.error("Error cargando imagen en img tag");
                setErrorImagen("La imagen está corrupta o no es accesible");
                setImagenArchivo(null);
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/50 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm">
                <i className="bx bx-zoom-in"></i>
                <span>Haz clic para ampliar</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => setModalImagen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all flex items-center gap-1"
            >
              <i className="bx bx-zoom-in"></i>
              Ver imagen
            </button>
            <button
              onClick={() => window.open(imagenArchivo, '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all flex items-center gap-1"
            >
              <i className="bx bx-link-external"></i>
              Abrir en pestaña
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = imagenArchivo;
                link.download = `documento-${cedulaEmprendedor}-${Date.now()}.jpg`;
                link.click();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all flex items-center gap-1"
            >
              <i className="bx bx-download"></i>
              Descargar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <i className="bx bx-image-alt text-2xl mb-2 opacity-50"></i>
          <p className="text-sm font-medium mb-1">No hay imagen disponible</p>
          <p className="text-xs">No se encontraron documentos adjuntos</p>
        </div>
      )}

      {/* Modal para imagen en pantalla completa */}
      <ModalImagen
        imagenUrl={imagenArchivo}
        isOpen={modalImagen}
        onClose={() => setModalImagen(false)}
      />
    </div>
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
    // Filtrar por cédula
    return data.filter(item => item.cedula_emprendedor === cedula);
  } catch (error) {
    console.error("Error cargando detalles:", error);
    return null;
  }
};

const Aprobacion = () => {
  const navigate = useNavigate();

  const [personasRegistradas, setPersonasRegistradas] = useState([]);
  const [menuOpen, setMenuOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [requerimientos, setRequerimientos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Carga de personas - CORREGIDO
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPersonasRegistradas();
        // Usar 'vereficacion' de la base de datos
        const personasConVerificados = data.map((p) => ({
          ...p,
          requerimientosVerificados: p.vereficacion || [],
        }));
        setPersonasRegistradas(personasConVerificados);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Función para cargar detalles - CORREGIDA
  const verDetalles = async (persona) => {
    setPersonaSeleccionada(persona);
    setLoading(true);
    try {
      const detalles = await fetchDetallesPersona(persona.cedula_emprendedor);
      
      // Usar el campo 'vereficacion' de la base de datos
      const detallesConVerificados = detalles.map((detalle) => ({
        ...detalle,
        requerimientosVerificados: detalle.vereficacion || [],
      }));

      setResultado(detallesConVerificados);
      setModalOpen(true);
    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir imagen en nueva pestaña - NUEVA FUNCIÓN
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
          Swal.fire('Error', 'No se pudo obtener la URL de la imagen', 'error');
        }
      } else {
        Swal.fire('Sin archivos', 'No se encontraron archivos para este emprendedor', 'info');
      }
    } catch (error) {
      console.error('Error al abrir imagen:', error);
      Swal.fire('Error', 'No se pudo cargar la imagen', 'error');
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setPersonaSeleccionada(null);
    setResultado(null);
  };

  const aprobarPersona = async (cedula) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas aprobar a esta persona?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Actualizar el estado en el backend
          await updateSolicitud(cedula, { estatus: "Aprobada" });

          // Actualizar el estado local
          setPersonasRegistradas((prev) =>
            prev.map((p) =>
              p.cedula_emprendedor === cedula
                ? { ...p, estatus: "Aprobada" }
                : p
            )
          );

          // Cerrar el modal después de aprobar
          cerrarModal();

          Swal.fire(
            "¡Aprobada!",
            "La solicitud ha sido aprobada correctamente.",
            "success"
          );
        } catch (error) {
          console.error("Error aprobando solicitud:", error);
          Swal.fire("¡Error!", "No se pudo aprobar la solicitud.", "error");
        }
      }
    });
  };

  const rechazarPersona = (persona) => {
    Swal.fire({
      title: "Rechazar solicitud",
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
          // Actualizar el estado en el backend
          await updateRequerimientoEmprendedor(persona.cedula_emprendedor, {
            estatus: "Rechazada",
            motivo_rechazo: result.value,
          });

          // Actualizar el estado local
          setPersonasRegistradas((prev) =>
            prev.map((p) =>
              p.cedula_emprendedor === persona.cedula_emprendedor
                ? { ...p, estatus: "Rechazada", motivo_rechazo: result.value }
                : p
            )
          );

          // Cerrar el modal después de rechazar
          cerrarModal();

          Swal.fire("Rechazada", "La solicitud ha sido rechazada.", "success");
        } catch (error) {
          console.error("Error rechazando solicitud:", error);
          Swal.fire("¡Error!", "No se pudo rechazar la solicitud.", "error");
        }
      }
    });
  };

  // Función para enviar requerimientos verificados - CORREGIDA
  const handleEnviarRequerimientosVerificados = async () => {
    if (!personaSeleccionada || !resultado) {
      Swal.fire("Error", "No hay datos para guardar.", "error");
      return;
    }

    try {
      // Actualizar cada requerimiento del resultado
      for (const req of resultado) {
        await updateRequerimientoEmprendedor(req.id_req, {
          vereficacion: req.requerimientosVerificados || [],
        });
      }

      // Actualizar el estado local
      setPersonasRegistradas((prev) =>
        prev.map((p) =>
          p.cedula_emprendedor === personaSeleccionada.cedula_emprendedor
            ? {
                ...p,
                requerimientosVerificados: resultado.flatMap(
                  (r) => r.requerimientosVerificados || []
                ),
              }
            : p
        )
      );

      Swal.fire(
        "Éxito",
        "Requerimientos verificados guardados correctamente.",
        "success"
      );
    } catch (error) {
      console.error("Error guardando requerimientos verificados:", error);
      Swal.fire(
        "Error",
        "No se pudieron guardar los requerimientos verificados.",
        "error"
      );
    }
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
        return "bg-green-100 text-green-800";
      case "rechazada":
        return "bg-red-100 text-red-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                <i className="bx bx-check-circle text-3xl text-indigo-600"></i>
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
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg transition"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Estadísticas */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <i className="bx bx-group text-2xl text-blue-600"></i>
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
                  <i className="bx bx-check-circle text-2xl text-green-600"></i>
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
                  <i className="bx bx-time-five text-2xl text-yellow-600"></i>
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
          </div>

          {/* Lista de personas */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Cargando solicitudes...</p>
              </div>
            ) : filteredPersonas.length === 0 ? (
              <div className="p-8 text-center">
                <i className="bx bx-search-alt text-4xl text-gray-300 mb-4"></i>
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
                        key={persona.cedula_emprendedor}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-800 font-medium">
                                {persona.nombre_completo?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {persona.nombre_completo}
                              </div>
                              <div className="text-sm text-gray-500">
                                {persona.nombre_emprendimiento}
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
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition"
                              onClick={() => verDetalles(persona)}
                            >
                              Detalles
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition"
                              onClick={() => abrirImagenEnPestaña(persona)}
                              title="Abrir imagen en nueva pestaña"
                            >
                              <i className="bx bx-image"></i>
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

        {/* Modal detalles - CORREGIDO */}
        {modalOpen && personaSeleccionada && (
          <div className="bg-black/75 fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col transform transition-transform duration-300 scale-100">
              {/* Header del modal */}
              <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Detalles de {personaSeleccionada.nombre_completo}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Información completa de la solicitud
                  </p>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-full"
                  onClick={cerrarModal}
                  aria-label="Cerrar"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="overflow-y-auto flex-1 p-8 bg-gray-50/50">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">
                      Cargando detalles...
                    </p>
                  </div>
                ) : resultado ? (
                  Array.isArray(resultado) ? (
                    <>
                      {resultado.map((req, index) => (
                        <div
                          key={index}
                          className="mb-8 last:mb-0 bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          {/* Información básica */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                  Nombre del emprendimiento
                                </label>
                                <p className="text-gray-900 font-medium text-lg">
                                  {req.nombre_emprendimiento ||
                                    "No especificado"}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                  Tipo de negocio
                                </label>
                                <p className="text-gray-900 font-medium">
                                  {req.tipo_negocio || "No especificado"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                  Sector
                                </label>
                                <p className="text-gray-900 font-medium">
                                  {req.tipo_sector || "No especificado"}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                  Cédula
                                </label>
                                <p className="text-gray-900 font-mono font-medium">
                                  {req.cedula_emprendedor}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Imagen del documento */}
                          <div className="mb-6">
                            <ImagenDocumento 
                              cedulaEmprendedor={req.cedula_emprendedor}
                              idReq={req.id_req}
                            />
                          </div>

                          {/* Separador */}
                          <div className="border-t border-gray-200 my-6"></div>

                          {/* Requerimientos - CORREGIDO */}
                          <div className="mb-6">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 block">
                              Requerimientos seleccionados
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {requerimientos
                                .filter((r) =>
                                  req.opt_requerimiento?.includes(
                                    r.id_requerimientos
                                  )
                                )
                                .map((r, idx) => {
                                  const estaVerificado = req.requerimientosVerificados?.includes(r.id_requerimientos);
                                  return (
                                    <div
                                      key={r.id_requerimientos}
                                      className={`flex items-center p-4 rounded-lg border transition-colors duration-200 ${
                                        estaVerificado 
                                          ? "bg-green-50 border-green-200" 
                                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition duration-200"
                                        checked={estaVerificado || false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setResultado((prev) => {
                                            if (!prev) return prev;
                                            return prev.map((item) => {
                                              if (
                                                item.cedula_emprendedor !==
                                                req.cedula_emprendedor
                                              )
                                                return item;
                                              return {
                                                ...item,
                                                requerimientosVerificados: checked
                                                  ? [
                                                      ...(item.requerimientosVerificados ||
                                                        []),
                                                      r.id_requerimientos,
                                                    ]
                                                  : (
                                                      item.requerimientosVerificados ||
                                                      []
                                                    ).filter(
                                                      (id) =>
                                                        id !== r.id_requerimientos
                                                    ),
                                              };
                                            });
                                          });
                                        }}
                                      />
                                      <div className={`w-3 h-3 rounded-full ml-3 mr-4 flex-shrink-0 ${
                                        estaVerificado ? "bg-green-500" : "bg-indigo-500"
                                      }`}></div>
                                      <span className={`font-medium ${
                                        estaVerificado ? "text-green-700" : "text-gray-700"
                                      }`}>
                                        {r.nombre_requerimiento}
                                        {estaVerificado && (
                                          <span className="text-green-600 text-xs ml-2">✓ Verificado</span>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          {/* Motivo */}
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 block">
                              Motivo de la solicitud
                            </label>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {req.motivo ||
                                  "No se proporcionó un motivo específico."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Botón para guardar requerimientos verificados */}
                      <div className="mt-8 flex justify-end">
                        <button
                          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          onClick={handleEnviarRequerimientosVerificados}
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Guardar Requerimientos Verificados
                          </span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                            Cédula
                          </label>
                          <p className="text-gray-900 font-mono font-medium text-lg">
                            {resultado.cedula_emprendedor}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                            Requerimientos
                          </label>
                          <p className="text-gray-900 font-medium">
                            {Array.isArray(resultado.opt_requerimiento)
                              ? resultado.opt_requerimiento.join(", ")
                              : "No especificado"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Imagen del documento para resultado único */}
                      <div className="mb-6">
                        <ImagenDocumento 
                          cedulaEmprendedor={resultado.cedula_emprendedor}
                          idReq={resultado.id_req}
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 block">
                          Motivo
                        </label>
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {resultado.motivo ||
                              "No se proporcionó un motivo específico."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">
                      No se encontraron detalles.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="px-8 py-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                <button
                  onClick={cerrarModal}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Cerrar
                </button>

                {personaSeleccionada.estatus !== "aprobada" && (
                  <div className="flex space-x-4">
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      onClick={() =>
                        aprobarPersona(personaSeleccionada.cedula_emprendedor)
                      }
                    >
                      <span className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Aprobar
                      </span>
                    </button>
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      onClick={() => rechazarPersona(personaSeleccionada)}
                    >
                      <span className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Rechazar
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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