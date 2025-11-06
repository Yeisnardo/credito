import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_clasificacion";

// Importación CORREGIDA de Tabler Icons - solo los que existen
import {
  TbCategory,
  TbCategory2,
  TbPlus,
  TbBuilding,
  TbInbox,
  TbLoader,
  TbEdit,
  TbTrash
} from 'react-icons/tb';

// Componente para mostrar cada sector
const SectorCard = ({ 
  sector, 
  clasificaciones, 
  onRegistrarNegocio, 
  onVerDetalles, 
  onEditarSector, 
  onEliminarSector 
}) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between border border-gray-100">
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
          <TbCategory2 className="text-indigo-600" size={24} />
        </div>
        <div className="flex space-x-2">
          <button
            className="text-indigo-600 hover:text-indigo-800 p-1 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEditarSector(sector);
            }}
            title="Editar sector"
          >
            <TbEdit size={18} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEliminarSector(sector, clasificaciones);
            }}
            title="Eliminar sector"
          >
            <TbTrash size={18} />
          </button>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-3 text-center text-indigo-700 truncate" title={sector}>
        {sector}
      </h2>
      <p className="text-gray-500 text-sm text-center mb-4">
        {clasificaciones.filter(c => c.negocio).length} negocio{clasificaciones.filter(c => c.negocio).length !== 1 ? 's' : ''}
      </p>
    </div>
    <div className="flex flex-col space-y-2">
      <button
        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition text-sm font-medium"
        onClick={() => onRegistrarNegocio(sector)}
      >
        + Negocio
      </button>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition text-sm font-medium"
        onClick={() => onVerDetalles(sector, clasificaciones)}
      >
        Ver Detalles
      </button>
    </div>
  </div>
);

const App = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [nuevoSector, setNuevoSector] = useState("");
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [nuevoNegocio, setNuevoNegocio] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormSector, setMostrarFormSector] = useState(false);

  // Agrupar clasificaciones por sector
  const sectoresAgrupados = clasificaciones.reduce((acc, item) => {
    if (item.sector) {
      if (!acc[item.sector]) acc[item.sector] = [];
      acc[item.sector].push(item);
    }
    return acc;
  }, {});

  // Cargar clasificaciones desde API
  const cargarClasificaciones = async () => {
    try {
      setCargando(true);
      const data = await api.getClasificaciones();
      setClasificaciones(data);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los sectores: " + err.message, "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClasificaciones();
  }, []);

  // Función para registrar un sector
  const handleRegistrarSector = async () => {
    const sectorTrimmed = nuevoSector.trim();
    if (!sectorTrimmed) {
      return Swal.fire("Error", "Ingrese un sector válido.", "error");
    }

    try {
      await api.createClasificacion({ sector: sectorTrimmed, negocio: null });
      await cargarClasificaciones(); // Recargar datos
      Swal.fire("¡Éxito!", `Sector "${sectorTrimmed}" registrado.`, "success");
      setNuevoSector("");
      setMostrarFormSector(false);
      setSectorSeleccionado(sectorTrimmed);
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar en la API: " + err.message, "error");
    }
  };

  // Función para agregar negocio a un sector
  const handleRegistrarNegocio = async (sector) => {
    const negocioTrimmed = nuevoNegocio.trim();
    if (!negocioTrimmed) {
      return Swal.fire("Error", "Ingrese un nombre de negocio válido.", "error");
    }

    try {
      await api.createClasificacion({ sector, negocio: negocioTrimmed });
      await cargarClasificaciones(); // Recargar datos
      Swal.fire("¡Éxito!", `Negocio "${negocioTrimmed}" agregado a ${sector}.`, "success");
      setNuevoNegocio("");
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar el negocio: " + err.message, "error");
    }
  };

  // Función para editar un negocio
  const handleEditarNegocio = async (clasificacion, nuevoNombre) => {
    try {
      await api.updateClasificacion(clasificacion.id_clasificacion, {
        sector: clasificacion.sector,
        negocio: nuevoNombre
      });
      await cargarClasificaciones(); // Recargar datos
      return true;
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar el negocio: " + err.message, "error");
      return false;
    }
  };

  // NUEVA FUNCIÓN: Editar sector
  const handleEditarSector = async (sectorActual) => {
    const { value: nuevoNombreSector } = await Swal.fire({
      title: 'Editar Sector',
      input: 'text',
      inputValue: sectorActual,
      inputLabel: 'Nuevo nombre del sector',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value.trim()) {
          return 'Por favor ingrese un nombre válido';
        }
        if (value === sectorActual) {
          return 'El nombre es igual al actual';
        }
      }
    });

    if (nuevoNombreSector) {
      try {
        // Obtener todas las clasificaciones de este sector
        const clasificacionesDelSector = clasificaciones.filter(c => c.sector === sectorActual);
        
        // Actualizar cada clasificación con el nuevo nombre del sector
        const promises = clasificacionesDelSector.map(clasificacion => 
          api.updateClasificacion(clasificacion.id_clasificacion, {
            sector: nuevoNombreSector.trim(),
            negocio: clasificacion.negocio
          })
        );
        
        await Promise.all(promises);
        await cargarClasificaciones(); // Recargar datos
        Swal.fire('¡Éxito!', `Sector actualizado a "${nuevoNombreSector}"`, 'success');
      } catch (err) {
        Swal.fire("Error", "No se pudo actualizar el sector: " + err.message, "error");
      }
    }
  };

  // NUEVA FUNCIÓN: Eliminar sector
  const handleEliminarSector = async (sector, clasificacionesSector) => {
    const tieneNegocios = clasificacionesSector.some(c => c.negocio);
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Eliminar el sector "${sector}"?${
        tieneNegocios ? '<br><strong class="text-red-600">¡ADVERTENCIA! Este sector tiene negocios asociados que también serán eliminados.</strong>' : ''
      }`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // Eliminar todas las clasificaciones de este sector
        const promises = clasificacionesSector.map(clasificacion => 
          api.deleteClasificacion(clasificacion.id_clasificacion)
        );
        
        await Promise.all(promises);
        await cargarClasificaciones(); // Recargar datos
        Swal.fire('Eliminado', `El sector "${sector}" ha sido eliminado.`, 'success');
      } catch (err) {
        Swal.fire("Error", "No se pudo eliminar el sector: " + err.message, "error");
      }
    }
  };

  // Función para eliminar un negocio
  const handleEliminarNegocio = async (clasificacion) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar el negocio "${clasificacion.negocio}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteClasificacion(clasificacion.id_clasificacion);
        await cargarClasificaciones(); // Recargar datos
        Swal.fire('Eliminado', 'El negocio ha sido eliminado.', 'success');
      } catch (err) {
        Swal.fire("Error", "No se pudo eliminar el negocio: " + err.message, "error");
      }
    }
  };

  // Ver detalles del sector
  const handleVerDetalles = (sector, clasificacionesSector) => {
    const negocios = clasificacionesSector.filter(c => c.negocio);
    
    Swal.fire({
      title: `Detalles de ${sector}`,
      html: `
        <div class="text-left">
          <div class="flex justify-between items-center mb-4">
            <p><strong class="text-indigo-700">Sector:</strong> ${sector}</p>
            <div class="flex space-x-2">
              <button class="edit-sector-btn px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition">Editar Sector</button>
            </div>
          </div>
          <p class="mb-2"><strong class="text-indigo-700">Negocios (${negocios.length}):</strong></p>
          <ul class="max-h-60 overflow-y-auto mb-4">
            ${negocios.length > 0 ? negocios.map((clasificacion, index) => `
              <li class="py-2 border-b border-gray-100 flex justify-between items-center">
                <span>${clasificacion.negocio}</span>
                <div class="flex space-x-2">
                  <button class="edit-btn px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition" data-id="${clasificacion.id_clasificacion}">Editar</button>
                  <button class="delete-btn px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition" data-id="${clasificacion.id_clasificacion}">Eliminar</button>
                </div>
              </li>
            `).join("") : "<li class='text-gray-500 py-2'>No hay negocios registrados</li>"}
          </ul>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '600px',
      didOpen: () => {
        // Evento para editar sector desde el modal de detalles
        document.querySelector('.edit-sector-btn').onclick = async () => {
          Swal.close(); // Cerrar el modal de detalles primero
          await handleEditarSector(sector);
        };

        // Eventos para editar cada negocio
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = async () => {
            const idClasificacion = btn.dataset.id;
            const clasificacion = clasificaciones.find(c => c.id_clasificacion == idClasificacion);
            
            if (!clasificacion) return;

            const { value: newName } = await Swal.fire({
              title: 'Editar Negocio',
              input: 'text',
              inputValue: clasificacion.negocio,
              showCancelButton: true,
              confirmButtonText: 'Guardar',
              cancelButtonText: 'Cancelar',
              inputValidator: (value) => {
                if (!value.trim()) {
                  return 'Por favor ingrese un nombre válido';
                }
              }
            });

            if (newName) {
              const success = await handleEditarNegocio(clasificacion, newName.trim());
              if (success) {
                Swal.close(); // Cerrar el modal de detalles
              }
            }
          };
        });

        // Eventos para eliminar cada negocio
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = async () => {
            const idClasificacion = btn.dataset.id;
            const clasificacion = clasificaciones.find(c => c.id_clasificacion == idClasificacion);
            
            if (!clasificacion) return;

            await handleEliminarNegocio(clasificacion);
            Swal.close(); // Cerrar el modal de detalles
          };
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Menú lateral */}
      {menuOpen && <Menu />}
      
      {/* Contenedor principal */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? "ml-0 md:ml-64" : ""}`}>
        {/* Header */}
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-y-auto mt-14">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <TbCategory className="text-indigo-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Clasificación de Emprendimientos</h1>
                <p className="text-gray-500 text-sm">Gestiona sectores y negocios</p>
              </div>
            </div>
            
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
              onClick={() => setMostrarFormSector(!mostrarFormSector)}
            >
              <TbPlus size={20} />
              <span>{mostrarFormSector ? 'Cancelar' : 'Nuevo Sector'}</span>
            </button>
          </div>

          {/* Formulario de ingreso de sector */}
          {mostrarFormSector && (
            <section className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
                <TbPlus className="mr-2" size={20} />
                Agregar Nuevo Sector
              </h2>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre del sector"
                  className="border border-gray-300 rounded-lg px-4 py-3 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={nuevoSector}
                  onChange={(e) => setNuevoSector(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegistrarSector()}
                />
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
                  onClick={handleRegistrarSector}
                >
                  Registrar Sector
                </button>
              </div>
            </section>
          )}

          {/* Formulario para agregar negocio */}
          {Object.keys(sectoresAgrupados).length > 0 && (
            <section className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
                <TbBuilding className="mr-2" size={20} />
                Agregar Negocio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={sectorSeleccionado}
                    onChange={(e) => setSectorSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccione un sector</option>
                    {Object.keys(sectoresAgrupados).map((sector, index) => (
                      <option key={index} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Negocio</label>
                  <input
                    type="text"
                    placeholder="Nombre del negocio"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={nuevoNegocio}
                    onChange={(e) => setNuevoNegocio(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sectorSeleccionado && handleRegistrarNegocio(sectorSeleccionado)}
                    disabled={!sectorSeleccionado}
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleRegistrarNegocio(sectorSeleccionado)}
                    disabled={!sectorSeleccionado || !nuevoNegocio.trim()}
                  >
                    Agregar Negocio
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Mostrar sectores */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Sectores Registrados</h3>
              <span className="text-sm text-gray-500">
                {Object.keys(sectoresAgrupados).length} sector{Object.keys(sectoresAgrupados).length !== 1 ? 'es' : ''}
              </span>
            </div>
            
            {cargando ? (
              <div className="flex justify-center items-center py-12">
                <TbLoader className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : Object.keys(sectoresAgrupados).length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <TbInbox className="text-gray-300 mx-auto mb-3" size={48} />
                <p className="text-gray-500">No hay sectores registrados</p>
                <button 
                  className="text-indigo-600 hover:text-indigo-800 mt-2 font-medium"
                  onClick={() => setMostrarFormSector(true)}
                >
                  Crear primer sector
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.entries(sectoresAgrupados).map(([sector, clasificacionesSector], index) => (
                  <SectorCard
                    key={index}
                    sector={sector}
                    clasificaciones={clasificacionesSector}
                    onRegistrarNegocio={() => {
                      setSectorSeleccionado(sector);
                      // Enfocar el input de negocio
                      setTimeout(() => {
                        document.querySelector('input[placeholder="Nombre del negocio"]')?.focus();
                      }, 100);
                    }}
                    onVerDetalles={handleVerDetalles}
                    onEditarSector={handleEditarSector}
                    onEliminarSector={handleEliminarSector}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Pie de página */}
        <footer className="bg-white text-gray-600 p-4 text-center border-t border-gray-200 text-sm">
          &copy; {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default App;