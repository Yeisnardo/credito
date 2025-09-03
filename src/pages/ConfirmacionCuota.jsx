import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from '../services/api_usuario';

const TablaCuotas = ({ cuotas, onBack, onConfirmarPago, onVerDetalleMorosidad }) => {
  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto my-4">
      {/* Botón para volver */}
      <button
        onClick={onBack}
        className="mb-4 flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>
      <h2 className="text-xl font-semibold mb-4 text-center">Desglose de cuotas</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Cuota Nº</th>
            <th className="border border-gray-300 px-4 py-2">Monto (USD)</th>
            <th className="border border-gray-300 px-4 py-2">Vencimiento</th>
            <th className="border border-gray-300 px-4 py-2">Estado</th>
            <th className="border border-gray-300 px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuotas.map((cuota) => (
            <tr key={cuota.numeroCuota}>
              <td className="border border-gray-300 px-4 py-2 text-center">{cuota.numeroCuota}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{cuota.monto}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{cuota.vencimiento}</td>
              <td
                className={`border border-gray-300 px-4 py-2 text-center ${
                  cuota.estado === "Pagada" ? "text-green-600 font-semibold" : cuota.estado.toLowerCase() === "morosidad" ? "text-red-600 font-semibold" : "text-gray-600"
                }`}
              >
                {cuota.estado}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {cuota.estado.toLowerCase() === "morosidad" ? (
                  <>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded transition mr-2"
                      onClick={() => onVerDetalleMorosidad(cuota)}
                    >
                      Ver detalles
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded transition"
                      onClick={() => onConfirmarPago(cuota.numeroCuota)}
                    >
                      Confirmar pago
                    </button>
                  </>
                ) : cuota.estado === "Pagada" ? (
                  <span className="text-green-600 font-semibold">Pagada</span>
                ) : (
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded transition"
                    onClick={() => onConfirmarPago(cuota.numeroCuota)}
                  >
                    Confirmar pago
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Loader = () => (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const EmprendedoresCarousel = ({ emprendedores, onVerContratos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(getVisibleItems());

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, emprendedores.length - visibleItems) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= emprendedores.length - visibleItems ? 0 : prev + 1));
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  function getVisibleItems() {
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  }

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentIndex > emprendedores.length - visibleItems) {
      setCurrentIndex(Math.max(0, emprendedores.length - visibleItems));
    }
  }, [visibleItems, emprendedores.length, currentIndex]);

  if (!emprendedores || emprendedores.length === 0) {
    return <p className="text-center text-gray-600 py-8">No hay emprendedores para mostrar.</p>;
  }

  return (
    <div className="w-full overflow-hidden mb-8 relative">
      {emprendedores.length > visibleItems && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Siguiente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${
            (currentIndex * 100) / visibleItems
          }%)`,
          width: `${(emprendedores.length * 100) / visibleItems}%`,
        }}
      >
        {emprendedores.map((emp) => (
          <div
            key={emp.id}
            className="p-2"
            style={{ width: `${(100 / emprendedores.length) * visibleItems}%` }}
          >
            <div className="bg-white rounded-lg shadow-lg p-4 h-full hover:scale-105 transition-transform duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">{emp.nombre}</h3>
              <p className="text-gray-600 mb-1">Cuota Total: {emp.cuota_total} USD</p>
              <p className="text-gray-600 mb-3">Cuota Usada: {emp.cuota_usada} USD</p>
              <p className="text-sm mb-2">Ubicación: {emp.ubicacion}</p>
              <p className="text-sm mb-2">Sector: {emp.sector}</p>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                onClick={() => onVerContratos(emp)}
              >
                Ver contratos
              </button>
            </div>
          </div>
        ))}
      </div>

      {emprendedores.length > visibleItems && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(emprendedores.length / visibleItems) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index * visibleItems)}
                className={`h-3 w-3 rounded-full ${
                  currentIndex >= index * visibleItems &&
                  currentIndex < (index + 1) * visibleItems
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
                aria-label={`Ir a diapositiva ${index + 1}`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [emprendedores, setEmprendedores] = useState([]);
  const [loadingEmprendedores, setLoadingEmprendedores] = useState(true);
  const [errorEmprendedores, setErrorEmprendedores] = useState(null);

  const [showContratos, setShowContratos] = useState(false);
  const [selectedEmprendedor, setSelectedEmprendedor] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(false);

  // Estado para mostrar cuotas
  const [mostrarCuotas, setMostrarCuotas] = useState(false);
  const [cuotas, setCuotas] = useState([]);

  // Estado para carrusel detalles morosidad
  const [detalleMorosidad, setDetalleMorosidad] = useState(null);
  const [indiceDetalle, setIndiceDetalle] = useState(0);
  const [mostrarCarruselMorosidad, setMostrarCarruselMorosidad] = useState(false);

  const handleConfirmarPago = (numeroCuota) => {
    setCuotas((prev) =>
      prev.map((c) =>
        c.numeroCuota === numeroCuota ? { ...c, estado: "Pagada" } : c
      )
    );
  };

  const handleVerDetalleMorosidad = (cuota) => {
    setDetalleMorosidad(cuota);
    setIndiceDetalle(0);
    setMostrarCarruselMorosidad(true);
  };

  const handleSiguienteDetalle = () => {
    if (detalleMorosidad && indiceDetalle < 0) return;
    // Si en un futuro agregas varias cuotas en el carrusel, ajusta esto
    setIndiceDetalle((prev) => prev + 1);
  };

  const handleAnteriorDetalle = () => {
    setIndiceDetalle((prev) => prev - 1);
  };

  const getDetalleActual = () => {
    return detalleMorosidad;
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const generateCuotas = (contrato) => {
    const cuotasArray = [];
    const fechaBase = new Date(contrato.fechaInicio);
    for (let i = 1; i <= contrato.numero; i++) {
      const vencimiento = new Date(fechaBase);
      vencimiento.setMonth(fechaBase.getMonth() + i);
      cuotasArray.push({
        numeroCuota: i,
        monto: (contrato.monto / contrato.numero).toFixed(2),
        vencimiento: vencimiento.toLocaleDateString("es-ES"),
        estado: i <= 3 ? "Pagada" : "Morosidad", // ejemplo
      });
    }
    return cuotasArray;
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const data = [
          {
            id: 1,
            nombre: "Innovatech S.A.",
            cuota_total: 15000,
            cuota_usada: 9000,
            ubicacion: "Bogotá, Colombia",
            sector: "Tecnología / Innovación",
            contacto: {
              email: "contacto@innovatech.com",
              telefono: "+57 310 555 1234",
            },
            descripcion:
              "Empresa dedicada a desarrollo de software y soluciones tecnológicas para pymes.",
          },
          {
            id: 2,
            nombre: "EcoVive",
            cuota_total: 20000,
            cuota_usada: 12000,
            ubicacion: "Medellín, Colombia",
            sector: "Energías Renovables",
            contacto: {
              email: "info@ecovive.com",
              telefono: "+57 310 555 5678",
            },
            descripcion:
              "Empresa especializada en instalación de paneles solares y eficiencia energética.",
          },
          {
            id: 3,
            nombre: "AgroFuturo Ltda.",
            cuota_total: 10000,
            cuota_usada: 3000,
            ubicacion: "Cali, Colombia",
            sector: "Agricultura Sostenible",
            contacto: {
              email: "contacto@agrofuturo.co",
              telefono: "+57 310 555 9101",
            },
            descripcion:
              "Foco en producción agrícola ecológica y exportaciones internacionales.",
          },
          {
            id: 4,
            nombre: "TextilColombia",
            cuota_total: 18000,
            cuota_usada: 11000,
            ubicacion: "Barranquilla, Colombia",
            sector: "Textil / Confección",
            contacto: {
              email: "info@textilcolombia.com",
              telefono: "+57 310 555 2468",
            },
            descripcion:
              "Manufactura textil con enfoque en exportación.",
          },
        ];
        setEmprendedores(data);
      } catch (error) {
        setErrorEmprendedores(
          "Error al cargar emprendedores. Por favor, intente nuevamente."
        );
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
      if (emp.id === 1) {
        setContratos([
          { id: 101, numero: 12, monto: 5000, fechaInicio: "2023-01-15", estado: "Activo" },
          { id: 102, numero: 24, monto: 7000, fechaInicio: "2022-01-15", estado: "Pendiente" },
        ]);
      } else if (emp.id === 2) {
        setContratos([{ id: 201, numero: 6, monto: 8000, fechaInicio: "2023-03-01", estado: "Activo" }]);
      } else if (emp.id === 3) {
        setContratos([
          { id: 301, numero: 9, monto: 3000, fechaInicio: "2022-06-10", estado: "Finalizado" },
          { id: 302, numero: 18, monto: 6000, fechaInicio: "2021-06-10", estado: "Finalizado" },
        ]);
      } else if (emp.id === 4) {
        setContratos([
          { id: 401, numero: 15, monto: 9000, fechaInicio: "2023-02-20", estado: "Activo" },
          { id: 402, numero: 10, monto: 6000, fechaInicio: "2022-08-15", estado: "Finalizado" },
        ]);
      }
      setLoadingContratos(false);
    }, 800);
  };

  const handleCerrarContratos = () => {
    setShowContratos(false);
  };

  const handleVerCuotas = (contrato) => {
    const cuotasData = generateCuotas(contrato);
    setCuotas(cuotasData);
    setMostrarCuotas(true);
  };

  const handleBackToContratos = () => {
    setMostrarCuotas(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Menú */}
      {menuOpen && <Menu />}

      {/* Contenido principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="p-4 md:p-8 flex-1 flex flex-col relative">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-6 md:mb-8 mt-6 md:mt-11">
            <div className="flex items-center space-x-4">
              {/* Icono */}
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition-all duration-300 cursor-pointer">
                <i className="bx bx-money-withdraw text-3xl text-gray-700"></i>
              </div>
              {/* Título */}
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Inicio</h1>
            </div>
          </div>

          {/* Control de cuotas o contratos */}
          {!showContratos ? (
            <>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">
                Control de cuotas de emprendedores
              </h2>
              {loadingEmprendedores ? (
                <Loader />
              ) : errorEmprendedores ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
                  <p>{errorEmprendedores}</p>
                  <button
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <EmprendedoresCarousel
                  emprendedores={emprendedores}
                  onVerContratos={handleVerContratos}
                />
              )}
            </>
          ) : mostrarCuotas ? (
            // Mostrar tabla de cuotas
            <div>
              <TablaCuotas
                cuotas={cuotas}
                onBack={handleBackToContratos}
                onConfirmarPago={handleConfirmarPago}
                onVerDetalleMorosidad={handleVerDetalleMorosidad}
              />
            </div>
          ) : (
            // Mostrar contratos
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
              {/* Botón regresar */}
              <button
                className="mb-4 flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition"
                onClick={handleCerrarContratos}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Regresar
              </button>
              {/* Lista de contratos */}
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">
                Contratos de {selectedEmprendedor?.nombre}
              </h2>
              {loadingContratos ? (
                <Loader />
              ) : contratos.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {contratos.map((contrato) => (
                    <div
                      key={contrato.id}
                      className="bg-gray-50 p-4 rounded-lg shadow hover:bg-gray-100 cursor-pointer transition border border-gray-200"
                      onClick={() => handleVerCuotas(contrato)}
                    >
                      <p className="font-semibold text-gray-800">Contrato #{contrato.id}</p>
                      <p className="text-sm text-gray-600 mt-1">Cuotas: {contrato.numero}</p>
                      <p className="text-sm text-gray-600">Fecha Inicio: {contrato.fechaInicio}</p>
                      <p className="text-sm text-gray-600">Monto: {contrato.monto} USD</p>
                      <p className="text-sm mt-2">
                        Estado:{" "}
                        <span
                          className={`font-semibold ${
                            contrato.estado === "Activo"
                              ? "text-green-600"
                              : contrato.estado === "Pendiente"
                              ? "text-yellow-600"
                              : "text-gray-600"
                          }`}
                        >
                          {contrato.estado}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No hay contratos para este emprendedor.</p>
              )}
            </div>
          )}
        </main>

        {/* Pie */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>

      {/* Carrusel de detalles de morosidad (pantalla completa) */}
      {mostrarCarruselMorosidad && detalleMorosidad && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full relative overflow-hidden">
            {/* botón cerrar */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setMostrarCarruselMorosidad(false)}
            >
              ✖
            </button>
            {/* Título */}
            <h3 className="text-xl font-semibold mb-4 text-center">Detalle de Morosidad</h3>
            {/* Navegación */}
            <div className="flex justify-center items-center space-x-4 mb-4">
              <button
                onClick={handleAnteriorDetalle}
                disabled={indiceDetalle <= 0}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
              >
                ←
              </button>
              <button
                onClick={handleSiguienteDetalle}
                disabled={indiceDetalle >= cuotas.length - 1}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
              >
                →
              </button>
            </div>
            {/* Contenido */}
            <div className="text-center">
              <p>
                <strong>Número de Cuota:</strong> {getDetalleActual().numeroCuota}
              </p>
              <p>
                <strong>Monto:</strong> {getDetalleActual().monto} USD
              </p>
              <p>
                <strong>Vencimiento:</strong> {getDetalleActual().vencimiento}
              </p>
              <p>
                <strong>Estado:</strong> {getDetalleActual().estado}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;