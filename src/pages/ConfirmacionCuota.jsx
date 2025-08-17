import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from '../services/api_usuario';

// Componente para carrusel de emprendedores (sin flechas)
const EmprendedoresCarousel = ({ emprendedores, onVerContratos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, emprendedores.length - 1));
  };

  if (!emprendedores || emprendedores.length === 0) {
    return <p className="text-center text-gray-600">No hay emprendedores para mostrar.</p>;
  }

  return (
    <div className="w-full overflow-hidden mb-8 relative">
      {/* Carrusel de emprendedores */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 270}px)` }}
      >
        {emprendedores.map((emp) => (
          <div
            key={emp.id}
            className="min-w-[250px] bg-white rounded-lg shadow-lg p-4 mx-2 hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">{emp.nombre}</h3>
            <p className="text-gray-600 mb-1">Cuota Total: {emp.cuota_total}</p>
            <p className="text-gray-600 mb-3">Cuota Usada: {emp.cuota_usada}</p>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              onClick={() => onVerContratos(emp)}
            >
              Ver contratos
            </button>
          </div>
        ))}
      </div>
      {/* Eliminados los botones de flechas */}
    </div>
  );
};

// Modal para mostrar número de cuotas
const CuotasModal = ({ isOpen, onClose, numeroCuotas }) => {
  if (!isOpen) return null;

  return (
    <div className="bg-black/50 backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-lg animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4 text-center">Número de cuotas</h2>
        <div className="text-4xl font-bold text-center text-blue-600">{numeroCuotas}</div>
        <button
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition mt-6"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();

  // Estados y funciones como antes...
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [emprendedores, setEmprendedores] = useState([]);
  const [loadingEmprendedores, setLoadingEmprendedores] = useState(true);
  const [errorEmprendedores, setErrorEmprendedores] = useState(null);

  const [showContratos, setShowContratos] = useState(false);
  const [selectedEmprendedor, setSelectedEmprendedor] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [numeroCuotas, setNumeroCuotas] = useState(0);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();

    const fetchEmprendedores = async () => {
      setLoadingEmprendedores(true);
      try {
        const data = [
          { id: 1, nombre: "Empresa A", cuota_total: 1000, cuota_usada: 600 },
          { id: 2, nombre: "Empresa B", cuota_total: 2000, cuota_usada: 1500 },
          { id: 3, nombre: "Empresa C", cuota_total: 1500, cuota_usada: 300 },
        ];
        setEmprendedores(data);
      } catch (error) {
        setErrorEmprendedores("Error al cargar emprendedores");
      } finally {
        setLoadingEmprendedores(false);
      }
    };
    fetchEmprendedores();
  }, [setUser]);

  const handleVerContratos = (emp) => {
    setSelectedEmprendedor(emp);
    fetchContratos(emp);
    setShowContratos(true);
  };

  const fetchContratos = (emp) => {
    setLoadingContratos(true);
    setTimeout(() => {
      setContratos([
        { id: 1, numero: 12 },
        { id: 2, numero: 24 },
      ]);
      setLoadingContratos(false);
    }, 500);
  };

  const handleCerrarContratos = () => {
    setShowContratos(false);
  };

  const handleOpenModal = (numero) => {
    setNumeroCuotas(numero);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Menú */}
      {menuOpen && <Menu />}

      {/* Contenido principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="p-8 flex-1 flex flex-col">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-11">
            <div className="flex items-center space-x-4">
              {/* Icono */}
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition-all duration-300 cursor-pointer">
                <i className="bx bx-money-withdraw text-3xl text-gray-700"></i>
              </div>
              {/* Título */}
              <h1 className="text-3xl font-semibold text-gray-800">Inicio</h1>
            </div>
          </div>

          {/* Contenido de cuotas o contratos */}
          {!showContratos ? (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Control de cuotas de emprendedores
              </h2>
              {loadingEmprendedores ? (
                <div className="flex justify-center py-8">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                </div>
              ) : errorEmprendedores ? (
                <p className="text-red-500 text-center">{errorEmprendedores}</p>
              ) : (
                <EmprendedoresCarousel
                  emprendedores={emprendedores}
                  onVerContratos={handleVerContratos}
                />
              )}
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Botón regresar */}
              <button
                className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition"
                onClick={handleCerrarContratos}
              >
                &#8592; Regresar
              </button>
              {/* Lista de contratos */}
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Contratos de {selectedEmprendedor?.nombre}
              </h2>
              {loadingContratos ? (
                <div className="flex justify-center py-8">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                </div>
              ) : contratos.length > 0 ? (
                contratos.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="bg-gray-50 p-4 mb-3 rounded-lg shadow hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => handleOpenModal(contrato.numero)}
                  >
                    <p className="font-semibold text-gray-800">
                      Contrato #{contrato.id} - Cuotas: {contrato.numero}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No hay contratos.</p>
              )}
            </div>
          )}
        </main>

        {/* Modal */}
        <CuotasModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          numeroCuotas={numeroCuotas}
        />

        {/* Pie */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;

/* Nota: La eliminación de las flechas simplifica el carrusel a solo desplazar con el usuario (puede ser con swipe en dispositivos móviles) */