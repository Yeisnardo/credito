import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from '../services/api_usuario';
import { getContratoPorCedula } from '../services/api_cuotas';

const Cuotas = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [stats, setStats] = useState({
    creditosActivos: 0,
    proximosPagos: 0,
    mensajesNoLeidos: 3,
  });
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [cuotasTabla, setCuotasTabla] = useState([]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

useEffect(() => {
  const fetchUserDataAndContratos = async () => {
    try {
      const cedula = localStorage.getItem('cedula_usuario');
      if (cedula) {
        const usuario = await getUsuarioPorCedula(cedula);
        if (usuario) {
          setUserState(usuario);
          if (setUser ) setUser (usuario);

          const contratosData = await getContratoPorCedula(cedula);
          setContratos(contratosData);

          if (contratosData.length > 0) {
            setContratoSeleccionado(contratosData[0]);
            fetchCuotas(contratosData[0].id_contrato);
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  if (!user) {
    fetchUserDataAndContratos();
  }
}, [user, setUser ]);

const fetchCuotas = async (id_contrato) => {
  try {
    const cuotasReales = await getContratoPorCedula(id_contrato);
    setCuotasTabla(cuotasReales);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    setCuotasTabla([]);
  }
};

const handleContratoChange = (e) => {
  const contratoId = parseInt(e.target.value);
  const contrato = contratos.find(c => c.id_contrato === contratoId);
  setContratoSeleccionado(contrato);
  if (contrato) {
    fetchCuotas(contrato.id_contrato);
  }
};



  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="flex-1 p-6 bg-gray-50">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-home text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Reporta cuota</h1>
                <p className="text-gray-600">Bienvenido/a, {user?.nombre_completo?.split(' ')[0] || 'Usuario'}</p>
              </div>
            </div>
            {/* Botones */}
            <div className="flex space-x-3">
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <i className="bx bx-filter-alt mr-2"></i> Filtros
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
                <i className="bx bx-plus mr-2"></i> Nueva acción
              </button>
            </div>
          </div>

          {/* Selector de contrato */}
          <div className="mb-4">
            <label htmlFor="contratoSelect" className="block mb-2 font-semibold text-gray-700">Selecciona un contrato:</label>
            <select
              id="contratoSelect"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={contratoSeleccionado?.id_contrato || ""}
              onChange={handleContratoChange}
            >
              {contratos.map((contrato) => (
                <option key={contrato.id_contrato} value={contrato.id_contrato}>
                  {contrato.numero_contrato} - {contrato.monto_devolver} (€)
                </option>
              ))}
            </select>
          </div>

          {/* Tabla de cuotas */}
          <section className="mb-8">
            <h2 className="text-xl mb-4 font-semibold">Cuotas (18 Semanas + 2 Opcionales)</h2>
            {contratoSeleccionado ? (
              cuotasTabla.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow text-sm">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Semana</th>
                        <th className="border px-4 py-2">Monto en Euros (€)</th>
                        <th className="border px-4 py-2">Monto en Bs</th>
                        <th className="border px-4 py-2">Fecha Desde</th>
                        <th className="border px-4 py-2">Fecha Hasta</th>
                        <th className="border px-4 py-2">Tiempo Morosidad</th>
                        <th className="border px-4 py-2">% Morosidad</th>
                        <th className="border px-4 py-2">Euro Morosidad</th>
                        <th className="border px-4 py-2">Bs Morosidad</th>
                        <th className="border px-4 py-2">Estado Pago</th>
                        <th className="border px-4 py-2">Estado IFEMI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuotasTabla.map((cuota) => (
                        <tr key={cuota.id_cuota}> {/* Usa la propiedad adecuada como id */}
                          <td className="border px-4 py-2">{cuota.semana}</td>
                          <td className="border px-4 py-2">{cuota.monto_euro}</td>
                          <td className="border px-4 py-2">{cuota.monto_bs}</td>
                          <td className="border px-4 py-2">{cuota.fecha_desde}</td>
                          <td className="border px-4 py-2">{cuota.fecha_hasta}</td>
                          <td className="border px-4 py-2">{cuota.tiempo_morosidad}</td>
                          <td className="border px-4 py-2">{cuota.porcentaje_morosidad}</td>
                          <td className="border px-4 py-2">{cuota.euro_morosidad}</td>
                          <td className="border px-4 py-2">{cuota.bs_morosidad}</td>
                          <td className="border px-4 py-2">{cuota.estado_pago}</td>
                          <td className="border px-4 py-2">{cuota.estado_ifemi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No hay cuotas para este contrato.</p>
              )
            ) : (
              <p>Cargando contrato...</p>
            )}
          </section>

          {/* Pie de página */}
          <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Cuotas;