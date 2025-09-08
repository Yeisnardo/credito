import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_clasificacion";

// Componente para mostrar cada sector
const SectorCard = ({ sector, negocios, onRegistrarNegocio, onVerDetalles }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between border border-gray-100">
    <div>
      <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mx-auto mb-3">
        <i className="bx bx-category-alt text-indigo-600 text-xl"></i>
      </div>
      <h2 className="text-xl font-bold mb-3 text-center text-indigo-700 truncate" title={sector}>{sector}</h2>
      <p className="text-gray-500 text-sm text-center mb-4">
        {negocios.length} negocio{negocios.length !== 1 ? 's' : ''}
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
        onClick={() => onVerDetalles(sector, negocios)}
      >
        Ver Detalles
      </button>
    </div>
  </div>
);

const App = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [sectores, setSectores] = useState({});
  const [nuevoSector, setNuevoSector] = useState("");
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [nuevoNegocio, setNuevoNegocio] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormSector, setMostrarFormSector] = useState(false);

  // Cargar y agrupar sectores desde API
  useEffect(() => {
    const fetchSectores = async () => {
      try {
        setCargando(true);
        const data = await api.getClasificaciones();
        const agrupados = data.reduce((acc, item) => {
          if (item.sector) {
            if (!acc[item.sector]) acc[item.sector] = [];
            if (item.negocio) acc[item.sector].push(item.negocio);
          }
          return acc;
        }, {});
        setSectores(agrupados);
      } catch (err) {
        Swal.fire("Error", "No se pudieron cargar los sectores: " + err.message, "error");
      } finally {
        setCargando(false);
      }
    };
    fetchSectores();
  }, []);

  // Función para registrar un sector
  const handleRegistrarSector = async () => {
    const sectorTrimmed = nuevoSector.trim();
    if (!sectorTrimmed) {
      return Swal.fire("Error", "Ingrese un sector válido.", "error");
    }

    try {
      await api.createClasificacion({ sector: sectorTrimmed });
      setSectores(prev => {
        const nuevos = { ...prev };
        if (!nuevos[sectorTrimmed]) nuevos[sectorTrimmed] = [];
        return nuevos;
      });
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
      setSectores(prev => {
        const nuevos = { ...prev };
        if (!nuevos[sector]) nuevos[sector] = [];
        nuevos[sector].push(negocioTrimmed);
        return nuevos;
      });
      Swal.fire("¡Éxito!", `Negocio "${negocioTrimmed}" agregado a ${sector}.`, "success");
      setNuevoNegocio("");
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar el negocio: " + err.message, "error");
    }
  };

  // Ver detalles del sector
  const handleVerDetalles = (sector, negocios) => {
    Swal.fire({
      title: `Detalles de ${sector}`,
      html: `
        <div class="text-left">
          <p class="mb-3"><strong class="text-indigo-700">Sector:</strong> ${sector}</p>
          <p class="mb-2"><strong class="text-indigo-700">Negocios:</strong></p>
          <ul class="max-h-60 overflow-y-auto mb-4">
            ${negocios.length > 0 ? negocios.map((n, index) => `
              <li class="py-2 border-b border-gray-100 flex justify-between items-center">
                <span>${n}</span>
                <button class="edit-btn px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition" data-index="${index}">Editar</button>
              </li>
            `).join("") : "<li class='text-gray-500 py-2'>No hay negocios registrados</li>"}
          </ul>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '600px',
      didOpen: () => {
        // Eventos para editar cada negocio
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = () => {
            const index = parseInt(btn.dataset.index);
            const oldName = negocios[index];

            Swal.fire({
              title: 'Editar Negocio',
              input: 'text',
              inputValue: oldName,
              showCancelButton: true,
              confirmButtonText: 'Guardar',
              cancelButtonText: 'Cancelar',
              preConfirm: (newName) => {
                if (!newName) {
                  Swal.showValidationMessage('Por favor ingrese un nombre válido');
                }
                return newName;
              }
            }).then(({ value }) => {
              if (value) {
                // Actualizar en estado
                setSectores(prev => {
                  const nuevos = { ...prev };
                  nuevos[sector][index] = value.trim();
                  return nuevos;
                });
                // Aquí puedes llamar a la API para guardar la edición si es necesario
                Swal.fire('Guardado', `Negocio actualizado a "${value.trim()}"`, 'success');
              }
            });
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
                <i className="bx bx-category text-2xl text-indigo-600"></i>
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
              <i className="bx bx-plus"></i>
              <span>{mostrarFormSector ? 'Cancelar' : 'Nuevo Sector'}</span>
            </button>
          </div>

          {/* Formulario de ingreso de sector */}
          {mostrarFormSector && (
            <section className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
                <i className="bx bx-plus-circle mr-2"></i>
                Agregar Nuevo Sector
              </h2>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre del sector"
                  className="border border-gray-300 rounded-lg px-4 py-3 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={nuevoSector}
                  onChange={(e) => setNuevoSector(e.target.value)}
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
          {Object.keys(sectores).length > 0 && (
            <section className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
                <i className="bx bx-building mr-2"></i>
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
                    {Object.keys(sectores).map((sector, index) => (
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
                {Object.keys(sectores).length} sector{Object.keys(sectores).length !== 1 ? 'es' : ''}
              </span>
            </div>
            
            {cargando ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : Object.keys(sectores).length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <i className="bx bx-inbox text-4xl text-gray-300 mb-3"></i>
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
                {Object.entries(sectores).map(([sector, negocios], index) => (
                  <SectorCard
                    key={index}
                    sector={sector}
                    negocios={negocios}
                    onRegistrarNegocio={() => {
                      setSectorSeleccionado(sector);
                      document.getElementById('negocio-input')?.focus();
                    }}
                    onVerDetalles={handleVerDetalles}
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