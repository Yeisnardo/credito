import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Menu = ({ onClose }) => {
  const activeClassName = "bg-gray-300 text-black font-semibold shadow-lg";

  // Estados para los submenús, con persistencia en localStorage
  const [isRequerimientosOpen, setIsRequerimientosOpen] = useState(() => {
    return JSON.parse(localStorage.getItem("isRequerimientosOpen")) || false;
  });
  const [isHistorialOpen, setIsHistorialOpen] = useState(() => {
    return JSON.parse(localStorage.getItem("isHistorialOpen")) || false;
  });
  const [isGestionEmprendOpen, setIsGestionEmprendOpen] = useState(() => {
    return JSON.parse(localStorage.getItem("isGestionEmprendOpen")) || false;
  });

  const menuRef = useRef(null);

  // Guardar en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("isRequerimientosOpen", JSON.stringify(isRequerimientosOpen));
  }, [isRequerimientosOpen]);
  useEffect(() => {
    localStorage.setItem("isHistorialOpen", JSON.stringify(isHistorialOpen));
  }, [isHistorialOpen]);
  useEffect(() => {
    localStorage.setItem("isGestionEmprendOpen", JSON.stringify(isGestionEmprendOpen));
  }, [isGestionEmprendOpen]);

  // Función para cerrar submenús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsRequerimientosOpen(false);
        setIsHistorialOpen(false);
        setIsGestionEmprendOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleRequerimientos = () => setIsRequerimientosOpen(!isRequerimientosOpen);
  const toggleHistorial = () => setIsHistorialOpen(!isHistorialOpen);
  const toggleGestionEmprend = () => setIsGestionEmprendOpen(!isGestionEmprendOpen);

  return (
    <aside
      ref={menuRef}
      className="w-64 bg-gray-100 text-gray-800 fixed inset-y-0 left-0 z-50 border-r border-gray-900 shadow-lg rounded-r-lg"
    >
      {/* Contenedor */}
      <div className="h-full overflow-y-auto p-6 flex flex-col justify-between font-serif mt-18">
        {/* Encabezado */}
        <div>

          {/* Navegación */}
          <nav className="space-y-4">

            {/* Enlace: Inicio */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive ? activeClassName : "hover:bg-gray-200"
                }`
              }
              onClick={onClose}
            >
              <i className="bx bx-home text-2xl mr-3"></i>
              <span className="text-md font-semibold">Inicio</span>
            </NavLink>

            {/* Solicitudes y Requerimientos */}
            <div>
              <button
                onClick={toggleRequerimientos}
                className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <i className="bx bx-file text-2xl mr-3"></i>
                <span className="flex-1 text-md font-semibold">Modulo de Solicitud de Credito</span>
                {/* Cambio de color del ícono cuando está abierto */}
                <i
                  className={`bx transition-transform duration-300 ${
                    isRequerimientosOpen ? "bx-chevron-up text-blue-500" : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {/* Submenú con animación */}
              {isRequerimientosOpen && (
                <div className="ml-6 mt-2 space-y-2 transition-all duration-300 max-h-60 overflow-hidden">
                  <NavLink
                    to="/Requeri_solicit"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-300 text-black font-semibold" : "hover:bg-gray-300"
                      }`
                    }
                    onClick={onClose}
                  >
                    Requerimientos y solicitud
                  </NavLink>
                  <NavLink
                    to="/Contrato"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-300 text-black font-semibold" : "hover:bg-gray-300"
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
                className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <i className="bx bx-folder-open text-2xl mr-3"></i>
                <span className="flex-1 text-md font-semibold">Historial y Reporte de cuotas</span>
                <i
                  className={`bx transition-transform duration-300 ${
                    isHistorialOpen ? "bx-chevron-up text-blue-500" : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {isHistorialOpen && (
                <div className="ml-6 mt-2 space-y-2 transition-all duration-300 max-h-60 overflow-hidden">
                  <NavLink
                    to="/depositos"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-300 text-black font-semibold" : "hover:bg-gray-300"
                      }`
                    }
                    onClick={onClose}
                  >
                    Historial de Depositos
                  </NavLink>
                  <NavLink
                    to="/cuotas"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-300 text-black font-semibold" : "hover:bg-gray-300"
                      }`
                    }
                    onClick={onClose}
                  >
                    Reporte de Cuotas
                  </NavLink>
                </div>
              )}
            </div>

            {/* Enlaces adicionales */}
            <NavLink
              to="/Aprobacion"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive ? activeClassName : "hover:bg-gray-200"
                }`
              }
              onClick={onClose}
            >
              <i className="bx bx-check-circle text-2xl mr-3"></i>
              <span className="text-md font-semibold">Modulo de Revicion y Aprobacion</span>
            </NavLink>

            <NavLink
              to="/Gestion"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive ? activeClassName : "hover:bg-gray-200"
                }`
              }
              onClick={onClose}
            >
              <i className="bx bx-credit-card text-2xl mr-3"></i>
              <span className="text-md font-semibold">Modulo Asignacion de Contraro</span>
            </NavLink>

            <NavLink
              to="/Fondo"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive ? activeClassName : "hover:bg-gray-200"
                }`
              }
              onClick={onClose}
            >
              <i className="bx bx-money-withdraw text-2xl mr-3"></i>
              <span className="text-md font-semibold">Fondo Financiero de Crédito</span>
            </NavLink>


            <NavLink
              to="/confirmacionCuota"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive ? activeClassName : "hover:bg-gray-200"
                }`
              }
              onClick={onClose}
            >
              <i className="bx bx-credit-card text-2xl mr-3"></i>
              <span className="text-md font-semibold">Modulo de Gestion de Creditos</span>
            </NavLink>

            <NavLink
              to="/amortizacion"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive ? activeClassName : "hover:bg-gray-200"
                }`
              }
              onClick={onClose}
            >
              <i className="bx bx-money-withdraw text-2xl mr-3"></i>
              <span className="text-md font-semibold">Modulo de Morosidada</span>
            </NavLink>

            {/* Configuración */}
            <div>
              <button
                onClick={toggleGestionEmprend}
                className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <i className="bx bx-cog text-2xl mr-3"></i>
                <span className="flex-1 text-md font-semibold">Configuración</span>
                <i
                  className={`bx transition-transform duration-300 ${
                    isGestionEmprendOpen ? "bx-chevron-up text-blue-500" : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {isGestionEmprendOpen && (
                <div className="ml-6 mt-2 space-y-2 transition-all duration-300 max-h-60 overflow-hidden">
                  <NavLink
                    to="/Usuario"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-300 text-black font-semibold" : "hover:bg-gray-300"
                      }`
                    }
                    onClick={onClose}
                  >
                    Gestión de Usuarios
                  </NavLink>
                  <NavLink
                    to="/Emprendimiento"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-300 text-black font-semibold" : "hover:bg-gray-300"
                      }`
                    }
                    onClick={onClose}
                  >
                    Registro de Clasificación Emprendimiento
                  </NavLink>
                  <NavLink
                    to="/Requerimientos"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-300 text-black font-semibold" : "hover:bg-gray-300"
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

        {/* Pie de página */}
        <div className="mt-8 text-center text-sm text-gray-500 italic">
          © {new Date().getFullYear()} TuInstitución. Todos los derechos reservados.
        </div>
      </div>
    </aside>
  );
};

export default Menu;