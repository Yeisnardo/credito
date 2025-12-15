import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getUsuarioPorCedula } from "../services/api_usuario";
import {
  getContratosPorCedulaEmprendedor,
  aceptarContrato,
} from "../services/api_contrato";
import { visualizarContratoPdf, descargarContratoPdf } from '../pdf/contrato';

// Importar Tabler Icons
import {
  TbFileText,
  TbCheck,
  TbListCheck,
  TbFileDescription,
  TbShieldCheck,
  TbInfoCircle,
  TbArrowBack,
  TbX,
  TbDownload,
  TbEye,
  TbCalendar,
  TbCalendarEvent,
  TbTrendingUp,
  TbCreditCard,
  TbCoin,
  TbBarcode,
  TbBook,
  TbRefresh
} from 'react-icons/tb';

// Componentes internos para mejor organización
const LoadingState = () => (
  <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 font-sans items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Cargando contratos...</p>
    </div>
  </div>
);

const SuccessState = ({ navigate }) => (
  <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-center border border-green-200/50">
    <div className="relative inline-flex mb-6">
      <div className="absolute inset-0 bg-green-400/20 blur-lg rounded-full"></div>
      <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
        <TbCheck size={32} className="text-white" />
      </div>
    </div>
    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent mb-4">
      ¡Contrato Aceptado Exitosamente!
    </h2>
    <p className="text-gray-600 mb-6 text-lg">
      Su contrato ha sido aceptado y procesado correctamente.
    </p>
    <button
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
      onClick={() => navigate("/dashboard")}
    >
      Ir al Dashboard
    </button>
  </div>
);

const NoContractsState = ({ navigate }) => (
  <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-200">
    <div className="relative inline-flex mb-6">
      <div className="absolute inset-0 bg-gray-400/20 blur-lg rounded-full"></div>
      <div className="relative bg-gradient-to-br from-gray-500 to-gray-600 p-4 rounded-2xl shadow-lg">
        <TbFileText size={32} className="text-white" />
      </div>
    </div>
    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-4">
      No hay contratos pendientes
    </h2>
    <p className="text-gray-600 mb-6 text-lg">
      Actualmente no tiene contratos pendientes de aceptación.
    </p>
    <button
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
      onClick={() => navigate("/dashboard")}
    >
      Volver al Dashboard
    </button>
  </div>
);

const ContractSelector = ({ contratos, contratoSeleccionado, onSelectContrato }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-3 border border-gray-100/50">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <TbListCheck size={24} className="text-indigo-600 mr-2" />
      Seleccione un Contrato
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contratos.map((contrato, index) => (
        <div
          key={contrato.id_contrato}
          className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            contratoSeleccionado?.id_contrato === contrato.id_contrato
              ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg"
              : "border-gray-200 hover:border-indigo-300 bg-white hover:shadow-md"
          }`}
          onClick={() => onSelectContrato(contrato)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                contratoSeleccionado?.id_contrato === contrato.id_contrato
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {index + 1}
              </div>
              <h3 className="font-semibold text-gray-800">
                {contrato.numero_contrato || "N/A"}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                contrato.estatus === "Aprobado"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : contrato.estatus === "Pendiente"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}
            >
              {contrato.estatus || "N/A"}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2 font-medium">
            {formatearMonto(contrato.monto_aprob_euro)}
          </p>
          <p className="text-xs text-gray-500 bg-gray-50/50 rounded px-2 py-1">
            Vigencia: {formatearFecha(contrato.fecha_desde)} - {formatearFecha(contrato.fecha_hasta)}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const ContractDetails = ({ contratoSeleccionado, totalContratos, user }) => {
  const detalles = [
    { label: "Número de Contrato", value: contratoSeleccionado?.numero_contrato, icon: TbBarcode },
    { label: "Estado", value: contratoSeleccionado?.estatus, status: true },
    { label: "Monto Aprobado", value: formatearMonto(contratoSeleccionado?.monto_aprob_euro), icon: TbCoin },
    { label: "Monto Aprobado (Bs)", value: formatearMontoBs(contratoSeleccionado?.monto_bs_neto), icon: TbCoin },
    { label: "Fecha de Inicio", value: formatearFecha(contratoSeleccionado?.fecha_desde), icon: TbCalendar },
    { label: "Fecha de Vencimiento", value: formatearFecha(contratoSeleccionado?.fecha_hasta), icon: TbCalendarEvent },
    { label: "Monto a devolver", value: formatearMonto(contratoSeleccionado?.monto_devolver), icon: TbTrendingUp },
    { label: "Cuota semanal", value: formatearMonto(contratoSeleccionado?.monto_semanal), icon: TbCreditCard }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2 border border-gray-100/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <TbFileDescription size={24} className="text-indigo-600 mr-2" />
          Detalles del Contrato
        </h2>
        {totalContratos > 1 && (
          <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full font-medium border border-indigo-200">
            Contrato {contratoSeleccionado ? contratos.findIndex(c => c.id_contrato === contratoSeleccionado.id_contrato) + 1 : 0} de {totalContratos}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {detalles.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:bg-gray-100/50 transition-colors duration-200">
              <div className="flex items-center mb-2">
                {item.icon && <IconComponent size={18} className="text-gray-400 mr-2" />}
                <h3 className="text-sm font-medium text-gray-500">{item.label}</h3>
              </div>
              {item.status ? (
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  item.value === "aceptado" ? "bg-green-100 text-green-800 border border-green-200" :
                  item.value === "Pendiente" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                  "bg-gray-100 text-gray-800 border border-gray-200"
                }`}>
                  {item.value || "N/A"}
                </span>
              ) : (
                <p className="text-lg font-semibold text-gray-800 break-words">{item.value || "N/A"}</p>
              )}
            </div>
          );
        })}
      </div>

      <TermsAndConditions />
      
      {/* Sección de descarga de PDF */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <TbDownload size={16} className="text-gray-400 mr-2" />
          Descargar Contrato
        </h3>
        <div className="flex space-x-2">
          <button 
            className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors text-sm border border-blue-200"
            onClick={() => visualizarContratoPdf(contratoSeleccionado, user)}
            title="Ver contrato antes de descargar"
          >
            <TbEye size={16} className="mr-1" /> Ver PDF
          </button>
          
          <button 
            className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg flex items-center justify-center hover:bg-green-100 transition-colors text-sm border border-green-200"
            onClick={() => descargarContratoPdf(contratoSeleccionado, user)}
            title="Descargar contrato completo"
          >
            <TbDownload size={16} className="mr-1" /> Descargar
          </button>
        </div>
      </div>
    </div>
  );
};

const TermsAndConditions = () => {
  const terminos = [
    "El prestatario se compromete a devolver el monto total del crédito más los intereses establecidos en el plazo acordado.",
    "El incumplimiento en los pagos generará intereses moratorios según lo establecido en la ley.",
    "El contrato estará sujeto a las condiciones generales establecidas por la entidad financiera.",
    "Cualquier modificación al contrato deberá ser aprobada por ambas partes por escrito.",
    "El prestatario se obliga a utilizar los fondos exclusivamente para los fines establecidos en la solicitud de crédito.",
    "La entidad financiera se reserva el derecho de verificar el uso de los fondos en cualquier momento durante la vigencia del contrato."
  ];

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <TbBook size={20} className="text-indigo-600 mr-2" />
        Términos y Condiciones
      </h3>
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6 rounded-xl border border-gray-200/50 max-h-80 overflow-y-auto custom-scrollbar">
        {terminos.map((termino, index) => (
          <div key={index} className="flex items-start mb-4 last:mb-0">
            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
              {index + 1}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{termino}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AcceptancePanel = ({ 
  contratoSeleccionado, 
  terminosAceptados, 
  aceptando, 
  onAceptarContrato, 
  onToggleTerminos, 
  navigate 
}) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50">
    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
      <TbShieldCheck size={24} className="text-indigo-600 mr-2" />
      Confirmación
    </h2>
    
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-start">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
          <TbInfoCircle size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-blue-800 font-semibold mb-1">
            Verifique cuidadosamente
          </p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Asegúrese de haber leído y comprendido todos los términos del contrato antes de aceptar.
          </p>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <label className="flex items-start p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors duration-200 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 mr-3 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
          checked={terminosAceptados}
          onChange={onToggleTerminos}
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          He leído y acepto los términos y condiciones del contrato. 
          Entiendo que estoy obligado a cumplir con todas las cláusulas establecidas 
          y reconozco que esta aceptación tiene carácter vinculante.
        </span>
      </label>
    </div>

    <div className="space-y-3">
      <button
        className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
          !terminosAceptados || aceptando
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
        }`}
        onClick={onAceptarContrato}
        disabled={!terminosAceptados || aceptando}
      >
        {aceptando ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Procesando...
          </div>
        ) : (
          <>
            <TbCheck size={18} className="mr-2" /> 
            Aceptar Contrato
          </>
        )}
      </button>
      
      <button
        className="w-full border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all duration-300"
        onClick={() => navigate(-1)}
      >
        <TbX size={18} className="mr-2" /> Cancelar
      </button>
    </div>

    {contratoSeleccionado?.estatus !== "Aceptado" && (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          
          ¿Necesita ayuda?
        </h3>
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          Si tiene dudas sobre los términos del contrato, contacte a su asesor financiero.
        </p>
        <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center font-medium transition-colors duration-200">
          Contactar soporte
        </button>
      </div>
    )}
  </div>
);

// Funciones de utilidad
const formatearMonto = (monto) => {
  return monto
    ? `€ ${Number(monto).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "N/A";
};

const formatearMontoBs = (monto) => {
  return monto
    ? `Bs. ${Number(monto).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "N/A";
};

const formatearFecha = (fecha) => {
  return fecha ? new Date(fecha).toLocaleDateString("es-ES", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "N/A";
};

// Componente principal
const AceptacionContrato = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [contratoAceptado, setContratoAceptado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aceptando, setAceptando] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cargar datos del usuario y contratos
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            const contratosUsuario = await getContratosPorCedulaEmprendedor(cedula);
            setContratos(contratosUsuario);
            if (contratosUsuario.length > 0) {
              setContratoSeleccionado(contratosUsuario[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!user) fetchUserData();
  }, [setUser, user]);

  // Función para aceptar el contrato
  const handleAceptarContrato = async () => {
    if (!contratoSeleccionado) return;
    
    try {
      setAceptando(true);
      const datosAceptacion = {
        aceptado: true,
        fecha_aceptacion: new Date().toISOString(),
      };

      await aceptarContrato(contratoSeleccionado.id_contrato, datosAceptacion);

      const contratosActualizados = contratos.map((contrato) => {
        if (contrato.id_contrato === contratoSeleccionado.id_contrato) {
          return {
            ...contrato,
            estatus: "aceptado",
          };
        }
        return contrato;
      });

      setContratos(contratosActualizados);
      setContratoAceptado(true);

      setTimeout(() => {
        navigate("/Contrato");
      }, 2000);
    } catch (error) {
      console.error("Error al aceptar el contrato:", error);
      alert("Error al aceptar el contrato. Intente nuevamente.");
    } finally {
      setAceptando(false);
    }
  };

  const handleSelectContrato = (contrato) => {
    setContratoSeleccionado(contrato);
    setTerminosAceptados(false);
  };

  const handleToggleTerminos = (e) => {
    setTerminosAceptados(e.target.checked);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 font-sans">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-0 lg:ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 mt-16 sm:mt-12">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 md:mb-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white p-3 sm:p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border border-indigo-100">
                  <TbFileText size={24} className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-indigo-700 bg-clip-text text-transparent">
                  Aceptación de Contrato
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Revise y acepte los términos de su contrato de financiamiento
                </p>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                className="bg-white border border-gray-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                onClick={() => navigate(-1)}
              >
                <TbArrowBack size={16} className="mr-2" /> Volver
              </button>
            </div>
          </div>

          {contratoAceptado ? (
            <SuccessState navigate={navigate} />
          ) : contratos.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {contratos.length > 1 && (
                <div className="xl:col-span-3">
                  <ContractSelector
                    contratos={contratos}
                    contratoSeleccionado={contratoSeleccionado}
                    onSelectContrato={handleSelectContrato}
                  />
                </div>
              )}

              <div className={`${contratos.length > 1 ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
                <ContractDetails
                  contratoSeleccionado={contratoSeleccionado}
                  totalContratos={contratos.length}
                  user={user}
                />
              </div>

              {contratoSeleccionado?.estatus !== "aceptado" && (
                <div className={`${contratos.length > 1 ? 'xl:col-span-3' : 'xl:col-span-2'}`}>
                  <AcceptancePanel
                    contratoSeleccionado={contratoSeleccionado}
                    terminosAceptados={terminosAceptados}
                    aceptando={aceptando}
                    onAceptarContrato={handleAceptarContrato}
                    onToggleTerminos={handleToggleTerminos}
                    navigate={navigate}
                  />
                </div>
              )}
            </div>
          ) : (
            <NoContractsState navigate={navigate} />
          )}
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 sm:p-6 bg-white border-t border-gray-200 text-center text-xs sm:text-sm text-gray-600">
          <div className="max-w-4xl mx-auto">
            <p>© {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AceptacionContrato;