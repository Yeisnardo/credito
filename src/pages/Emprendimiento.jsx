import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../assets/css/style.css"; // ajusta si es necesario
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_clasificacion";

// Componente para mostrar cada sector
const SectorCard = ({ sector, negocios, onRegistrarNegocio, onVerDetalles }) => (
  <div className="bg-white rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300 p-6 flex flex-col justify-between">
    <div>
      <h2 className="text-2xl font-bold mb-3 text-center text-indigo-600">{sector}</h2>
      <div className="flex justify-center space-x-3 mb-4">
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition"
          onClick={() => onVerDetalles(sector, negocios)}
        >
          Ver Detalles
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [sectores, setSectores] = useState({}); // clave=sector, valor= array de negocios
  const [nuevoSector, setNuevoSector] = useState("");
  const [nuevoNegocio, setNuevoNegocio] = useState("");

  // Cargar y agrupar sectores desde API
  useEffect(() => {
    const fetchSectores = async () => {
      try {
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
      }
    };
    fetchSectores();
  }, []);

  // Agregar nuevo sector y negocio
  const handleRegistrarSector = async () => {
    const sectorTrimmed = nuevoSector.trim();
    const negocioTrimmed = nuevoNegocio.trim();

    if (!sectorTrimmed) {
      return Swal.fire("Error", "Ingrese un sector válido.", "error");
    }

    try {
      await api.createClasificacion({ sector: sectorTrimmed, negocio: negocioTrimmed });
      setSectores(prev => {
        const nuevos = { ...prev };
        if (!nuevos[sectorTrimmed]) nuevos[sectorTrimmed] = [];
        if (negocioTrimmed) nuevos[sectorTrimmed].push(negocioTrimmed);
        return nuevos;
      });
      Swal.fire("¡Listo!", `Sector "${sectorTrimmed}" y negocio "${negocioTrimmed}" registrados.`, "success");
      setNuevoSector("");
      setNuevoNegocio("");
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar en la API: " + err.message, "error");
    }
  };

  // Registrar negocio en sector
  const handleRegistrarNegocio = (sector) => {
    Swal.fire({
      title: `Registrar Negocio en ${sector}`,
      input: "text",
      inputPlaceholder: "Nombre del negocio",
      showCancelButton: true,
      confirmButtonText: "Registrar",
      preConfirm: (negocio) => {
        if (!negocio) {
          Swal.showValidationMessage("Por favor ingrese un nombre válido");
        }
        return negocio;
      },
    }).then(({ value, isConfirmed }) => {
      if (isConfirmed && value) {
        const negocioTrimmed = value.trim();
        setSectores(prev => {
          const nuevos = { ...prev };
          nuevos[sector] = [...nuevos[sector], negocioTrimmed];
          return nuevos;
        });
        Swal.fire("¡Listo!", `Negocio "${negocioTrimmed}" agregado en ${sector}.`, "success");
      }
    });
  };

  // Ver detalles del sector
  const handleVerDetalles = (sector, negocios) => {
  Swal.fire({
    title: `Detalles de ${sector}`,
    html: `
      <p><strong>Sector:</strong> ${sector}</p>
      <p><strong>Negocios:</strong></p>
      <ul style="text-align: left; margin: 0 auto; list-style: disc inside;">
        ${negocios.length > 0 ? negocios.map(n => `<li>${n}</li>`).join("") : "<li>No hay negocios registrados</li>"}
      </ul>
      <div class="mt-4 flex justify-center">
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          onclick="window.dispatchEvent(new CustomEvent('registrarNegocio', {detail: '${sector}'}))"
        >
          Registrar Negocio
        </button>
      </div>
    `,
    showConfirmButton: false,
  });
  
  // Escuchar evento para manejar el clic del botón
  const handleRegisterClick = (e) => {
    if (e.type === 'registrarNegocio') {
      const sector = e.detail;
      handleRegistrarNegocio(sector);
    }
  };

  window.addEventListener('registrarNegocio', handleRegisterClick);

  // Limpieza del evento después de que se cierre
  Swal.getPopup().addEventListener('close', () => {
    window.removeEventListener('registrarNegocio', handleRegisterClick);
  });
};

  return (
    <div className="flex min-h-screen bg-gray-50 font-serif mt-11">
      {/* Menú lateral */}
      {menuOpen && <Menu />}
      {/* Contenedor principal */}
      <div className={`flex-1 flex flex-col ${menuOpen ? "ml-0 md:ml-64" : ""}`}>
        {/* Header */}
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Contenido */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            {/* Encabezado */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
                <i className="bx bx-cog text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Configuracion de Clasificacion de Empredimiento</h1>
            </div>
          </div>
          </header>

          {/* Formulario de ingreso */}
          <section className="mb-8 bg-white p-6 rounded-xl shadow-lg space-y-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Agregar Sector y Negocio</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Nuevo sector"
                className="border border-gray-300 rounded px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={nuevoSector}
                onChange={(e) => setNuevoSector(e.target.value)}
              />
              <input
                type="text"
                placeholder="Nuevo negocio"
                className="border border-gray-300 rounded px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={nuevoNegocio}
                onChange={(e) => setNuevoNegocio(e.target.value)}
              />
            </div>
            <button
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition w-full md:w-auto"
              onClick={handleRegistrarSector}
            >
              + Agregar Sector y Negocio
            </button>
          </section>

          {/* Mostrar sectores */}
          <section className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-semibold mb-6 text-center text-gray-700">Sectores Registrados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.keys(sectores).length === 0 ? (
                <p className="col-span-full text-center text-gray-400 italic">No hay sectores registrados</p>
              ) : (
                Object.entries(sectores).map(([sector, negocios], index) => (
                  <SectorCard
                    key={index}
                    sector={sector}
                    negocios={negocios}
                    onRegistrarNegocio={handleRegistrarNegocio}
                    onVerDetalles={handleVerDetalles}
                  />
                ))
              )}
            </div>
          </section>
        </main>

        {/* Pie de página */}
        <footer className="bg-gray-100 text-gray-600 p-4 text-center border-t border-gray-300 mt-auto">
          &copy; {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default App;