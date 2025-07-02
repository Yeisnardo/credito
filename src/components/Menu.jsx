import { NavLink } from "react-router-dom";
import { useState } from "react";

const Menu = ({ onClose }) => {
  const activeClassName = "bg-gray-200";

  const [isRequerimientosOpen, setIsRequerimientosOpen] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);
  const [isGestionEmprendOpen, setIsGestionEmprendOpen] = useState(false);

  const toggleRequerimientos = () => setIsRequerimientosOpen(!isRequerimientosOpen);
  const toggleHistorial = () => setIsHistorialOpen(!isHistorialOpen);
  const toggleGestionEmprend = () => setIsGestionEmprendOpen(!isGestionEmprendOpen);

  return (
    <aside className="w-68 bg-white shadow-lg fixed inset-y-0 left-0 z-50 rounded-r-lg">
      {/* Contenedor con scroll */}
      <div className="h-full overflow-y-auto p-6 flex flex-col">
        {/* Logo o Encabezado */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700">Menú Principal</h2>
        </div>

        {/* Navegación */}
        <nav className="flex-1 flex flex-col space-y-4 text-gray-700 font-medium">

          {/* Inicio */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition cursor-pointer ${
                isActive ? activeClassName : "hover:bg-gray-100"
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-home text-xl mr-4 text-gray-600"></i>
            <span className="text-base">Inicio</span>
          </NavLink>

          {/* Solicitud de Credito */}
          <div>
            <button
              onClick={toggleRequerimientos}
              className="flex items-center p-3 rounded-lg w-full transition cursor-pointer hover:bg-gray-100"
            >
              <i className="bx bx-file text-xl mr-4 text-gray-600"></i>
              <span className="flex-1 text-base text-left">Solicitud de Credito</span>
              <i className={`bx transition-transform duration-300 ${isRequerimientosOpen ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
            </button>
            {isRequerimientosOpen && (
              <div className="ml-8 mt-2 space-y-2 animate-fade-in">
                <NavLink
                  to="/Requerimiento"
                  className={({ isActive }) =>
                    `block p-2 rounded-lg transition cursor-pointer ${
                      isActive ? activeClassName : "hover:bg-gray-100"
                    }`
                  }
                  onClick={onClose}
                >
                  Requerimientos y solicitud
                </NavLink>
                <NavLink
                  to="/Contrato"
                  className={({ isActive }) =>
                    `block p-2 rounded-lg transition cursor-pointer ${
                      isActive ? activeClassName : "hover:bg-gray-100"
                    }`
                  }
                  onClick={onClose}
                >
                  Mi Contrato
                </NavLink>
              </div>
            )}
          </div>

          {/* Historial y Reporte */}
          <div>
            <button
              onClick={toggleHistorial}
              className="flex items-center p-3 rounded-lg w-full transition cursor-pointer hover:bg-gray-100"
            >
              <i className="bx bx-folder-open text-xl mr-4 text-gray-600"></i>
              <span className="flex-1 text-base text-left">Historial y Reporte</span>
              <i className={`bx transition-transform duration-300 ${isHistorialOpen ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
            </button>
            {isHistorialOpen && (
              <div className="ml-8 mt-2 space-y-2 animate-fade-in">
                <NavLink
                  to="/depositos"
                  className={({ isActive }) =>
                    `block p-2 rounded-lg transition cursor-pointer ${
                      isActive ? activeClassName : "hover:bg-gray-100"
                    }`
                  }
                  onClick={onClose}
                >
                  Historial de Depositos
                </NavLink>
                <NavLink
                  to="/cuotas"
                  className={({ isActive }) =>
                    `block p-2 rounded-lg transition cursor-pointer ${
                      isActive ? activeClassName : "hover:bg-gray-100"
                    }`
                  }
                  onClick={onClose}
                >
                  Reporte de Cuotas
                </NavLink>
              </div>
            )}
          </div>

          

          {/* Otros enlaces */}
          <NavLink
            to="/Aprobacion"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition cursor-pointer ${
                isActive ? activeClassName : "hover:bg-gray-100"
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-check-circle text-xl mr-4 text-gray-600"></i>
            <span className="text-base">Aprobación de Solicitud de Crédito</span>
          </NavLink>

          <NavLink
            to="/Fondo"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition cursor-pointer ${
                isActive ? activeClassName : "hover:bg-gray-100"
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-money-withdraw text-xl mr-4 text-gray-600"></i>
            <span className="text-base">Fondo Financiero de Crédito</span>
          </NavLink>

          <NavLink
            to="/Gestion"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition cursor-pointer ${
                isActive ? activeClassName : "hover:bg-gray-100"
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-credit-card text-xl mr-4 text-gray-600"></i>
            <span className="text-base">Gestor de Crédito</span>
          </NavLink>

          <NavLink
            to="/confirmacionCuota"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition cursor-pointer ${
                isActive ? activeClassName : "hover:bg-gray-100"
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-credit-card text-xl mr-4 text-gray-600"></i>
            <span className="text-base">Confirmación de Cuotas</span>
          </NavLink>

          <NavLink
            to="/amortizacion"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition cursor-pointer ${
                isActive ? activeClassName : "hover:bg-gray-100"
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-money-withdraw text-xl mr-4 text-gray-600"></i>
            <span className="text-base">Gestión de Amortización</span>
          </NavLink>

          {/* Gestión y Emprendimiento */}
          <div>
            <button
              onClick={toggleGestionEmprend}
              className="flex items-center p-3 rounded-lg w-full transition cursor-pointer hover:bg-gray-100"
            >
              <i className="bx bx-cog text-xl mr-4 text-gray-600"></i>
              <span className="flex-1 text-base text-left">Configuracion</span>
              <i className={`bx transition-transform duration-300 ${isGestionEmprendOpen ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
            </button>
            {isGestionEmprendOpen && (
              <div className="ml-8 mt-2 space-y-2 animate-fade-in">
                <NavLink
                  to="/Usuario"
                  className={({ isActive }) =>
                    `block p-2 rounded-lg transition cursor-pointer ${
                      isActive ? activeClassName : "hover:bg-gray-100"
                    }`
                  }
                  onClick={onClose}
                >
                  Gestión de Usuarios
                </NavLink>
                <NavLink
                  to="/Emprendimiento"
                  className={({ isActive }) =>
                    `block p-2 rounded-lg transition cursor-pointer ${
                      isActive ? activeClassName : "hover:bg-gray-100"
                    }`
                  }
                  onClick={onClose}
                >
                  Registro de Clasificación Emprendimiento
                </NavLink>
                <NavLink
                  to="/Requerimientos"
                  className={({ isActive }) =>
                    `block p-2 rounded-lg transition cursor-pointer ${
                      isActive ? activeClassName : "hover:bg-gray-100"
                    }`
                  }
                  onClick={onClose}
                >
                  Requerimientos
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Menu;

