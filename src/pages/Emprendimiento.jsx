import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../assets/css/style.css"; // ajusta si es necesario
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_clasificacion";

// Componente para mostrar cada sector
const SectorCard = ({ sector, negocios, onRegistrarNegocio }) => (
  <div className="bg-white p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
    <h2 className="text-xl font-semibold mb-2 text-center">{sector.sector}</h2>
    <div className="flex justify-end space-x-2 mt-4">
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        onClick={() => onRegistrarNegocio(sector.sector)}
      >
        Registrar Negocio
      </button>
    </div>
    <h3 className="mt-4 font-semibold">Negocios Asociados:</h3>
    {negocios && negocios.length === 0 ? (
      <p className="text-gray-600">No hay negocios registrados.</p>
    ) : (
      <ul className="list-disc list-inside mt-2">
        {negocios && negocios.map((negocio, index) => (
          <li key={index} className="text-gray-700">{negocio}</li>
        ))}
      </ul>
    )}
  </div>
);

const App = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [sectores, setSectores] = useState([]); // Estado para los sectores
  const [nuevoSector, setNuevoSector] = useState(""); // Nuevo sector
  const [nuevoNegocio, setNuevoNegocio] = useState(""); // Nuevo negocio

  // Cargar sectores desde API
  useEffect(() => {
    const fetchSectores = async () => {
      try {
        const data = await api.getClasificaciones();
        setSectores(data.map(item => ({ sector: item.sector, negocios: item.negocio ? [item.negocio] : [] })));
      } catch (err) {
        Swal.fire("Error", "No se pudieron cargar los sectores: " + err.message, "error");
      }
    };
    fetchSectores();
  }, []);

  // Registrar sector y negocio en API y estado local
  const handleRegistrarSector = async () => {
    const sectorTrimmed = nuevoSector.trim();
    const negocioTrimmed = nuevoNegocio.trim();
    
    if (sectorTrimmed === "") {
      Swal.fire("Error", "Ingrese un sector válido.", "error");
      return;
    }
    
    try {
      await api.createClasificacion({ sector: sectorTrimmed, negocio: negocioTrimmed });
      setSectores(prev => [...prev, { sector: sectorTrimmed, negocios: [negocioTrimmed] }]);
      Swal.fire("¡Listo!", `Sector "${sectorTrimmed}" y negocio "${negocioTrimmed}" registrados.`, "success");
      setNuevoSector("");
      setNuevoNegocio("");
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar en la API: " + err.message, "error");
    }
  };

  // Registrar negocio en el sector seleccionado
  const handleRegistrarNegocio = (sector) => {
    Swal.fire({
      title: `Registrar Negocio en ${sector}`,
      input: 'text',
      inputPlaceholder: 'Ingrese el nombre del negocio',
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: (negocio) => {
        if (!negocio) {
          Swal.showValidationMessage('Por favor ingrese un nombre de negocio');
        }
        return negocio;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const negocioTrimmed = result.value.trim();
        if (negocioTrimmed) {
          const updatedSectores = sectores.map(s => {
            if (s.sector === sector) {
              return { ...s, negocios: [...s.negocios, negocioTrimmed] };
            }
            return s;
          });
          setSectores(updatedSectores);
          Swal.fire("¡Listo!", `Negocio "${negocioTrimmed}" registrado en ${sector}.`, "success");
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {menuOpen && <Menu />}
      <div className={`flex-1 flex flex-col ${menuOpen ? "ml-0 md:ml-64" : ""}`}>
        {/* Header */}
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Contenido principal */}
        <div className="pt-20 px-8 overflow-y-auto flex-1">
          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-home text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestor de Clasificación de Emprendimiento
              </h1>
            </div>
          </header>

          {/* Barra de búsqueda y creación de sector */}
          <div className="mb-6 max-w-4xl mx-auto flex items-center space-x-4">
            {/* Crear nuevo sector */}
            <input
              type="text"
              placeholder="Nuevo sector"
              className="border border-gray-300 rounded px-3 py-2"
              value={nuevoSector}
              onChange={(e) => setNuevoSector(e.target.value)}
            />
            <input
              type="text"
              placeholder="Nuevo negocio"
              className="border border-gray-300 rounded px-3 py-2"
              value={nuevoNegocio}
              onChange={(e) => setNuevoNegocio(e.target.value)}
            />
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full shadow-lg transition"
              onClick={handleRegistrarSector}
            >
              + Nuevo sector y negocio
            </button>
          </div>

          {/* Mostrar sectores registrados */}
          <div className="mb-4 max-w-4xl mx-auto">
            <h3 className="font-semibold mb-2">Sectores Registrados:</h3>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sectores.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">
                  No se encontraron sectores registrados.
                </p>
              ) : (
                sectores.map((sector, index) => (
                  <SectorCard
                    key={index}
                    sector={sector}
                    negocios={sector.negocios}
                    onRegistrarNegocio={handleRegistrarNegocio}
                  />
                ))
              )}
            </section>
          </div>
        </div>

        {/* Pie de página */}
        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default App;
