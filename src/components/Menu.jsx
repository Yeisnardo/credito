import { NavLink, useLocation } from "react-router-dom";
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
  const linkRefs = useRef({});
  const location = useLocation();

  // Guardar en localStorage cuando cambien los estados
  useEffect(() => {
    localStorage.setItem(
      "isRequerimientosOpen",
      JSON.stringify(isRequerimientosOpen)
    );
  }, [isRequerimientosOpen]);
  useEffect(() => {
    localStorage.setItem("isHistorialOpen", JSON.stringify(isHistorialOpen));
  }, [isHistorialOpen]);
  useEffect(() => {
    localStorage.setItem(
      "isGestionEmprendOpen",
      JSON.stringify(isGestionEmprendOpen)
    );
  }, [isGestionEmprendOpen]);

  // Cerrar submenús al hacer clic fuera
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

  // Scroll hacia el elemento activo cuando cambia la ruta
  useEffect(() => {
    const path = location.pathname;
    const element = linkRefs.current[path];
    if (element && element.scrollIntoView) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [location]);

  // Función para asignar refs a los enlaces
  const setLinkRef = (path) => (el) => {
    if (el) linkRefs.current[path] = el;
  };

  const toggleRequerimientos = () =>
    setIsRequerimientosOpen(!isRequerimientosOpen);
  const toggleHistorial = () => setIsHistorialOpen(!isHistorialOpen);
  const toggleGestionEmprend = () =>
    setIsGestionEmprendOpen(!isGestionEmprendOpen);

  return (
    <aside
      ref={menuRef}
      className="w-64 bg-white text-gray-800 fixed inset-y-0 left-0 z-50 border-r border-gray-300 shadow-lg rounded-r-lg transition-transform duration-300 ease-in-out"
    >
      {/* Contenedor principal */}
      <div className="h-full overflow-y-auto p-6 flex flex-col justify-between font-serif mt-18">
        {/* Navegación */}
        <div>
          <nav className="space-y-4">
            {/* Inicio */}
            <div ref={setLinkRef("/dashboard")}>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-1 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive ? activeClassName : "hover:bg-gray-100"
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-home text-2xl mr-3"></i>
                <span className="text-md font-semibold">Inicio</span>
              </NavLink>
            </div>

            {/* Solicitud de crédito */}
            <div>
              {/* Menú de Solicitud de crédito */}
              <button
                onClick={toggleRequerimientos}
                className="w-full flex items-center px-1 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer focus:outline-none"
              >
                <i className="bx bx-file text-2xl mr-3"></i>
                <span className="flex-1 text-md font-semibold text-left">
                  Solicitud de crédito
                </span>
                <i
                  className={`bx transition-transform duration-300 ${
                    isRequerimientosOpen
                      ? "bx-chevron-up text-blue-500"
                      : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {isRequerimientosOpen && (
                <div className="ml-6 mt-2 space-y-2 transition-all duration-300 max-h-60 overflow-hidden">
                  {/* Requerimientos y motivo de solicitud */}
                  <div ref={setLinkRef("/Requeri_solicit")}>
                    <NavLink
                      to="/Requeri_solicit"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                      onClick={onClose}
                    >
                      Requerimientos y motivo de solicitud
                    </NavLink>
                  </div>
                  {/* Mi Contrato */}
                  <div ref={setLinkRef("/Contrato")}>
                    <NavLink
                      to="/Contrato"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                      onClick={onClose}
                    >
                      Mi Contrato
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Control de seguimiento de crédito */}
            <div>
              <button
                onClick={toggleHistorial}
                className="w-full flex items-center px-1 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer focus:outline-none"
              >
                <i className="bx bx-folder-open text-2xl mr-3"></i>
                <span className="flex-1 text-md font-semibold text-left">
                  Control de seguimiento de crédito
                </span>
                <i
                  className={`bx transition-transform duration-300 ${
                    isHistorialOpen
                      ? "bx-chevron-up text-blue-500"
                      : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {isHistorialOpen && (
                <div className="ml-6 mt-2 space-y-2 transition-all duration-300 max-h-60 overflow-hidden">
                  <div ref={setLinkRef("/depositos")}>
                    <NavLink
                      to="/depositos"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                      onClick={onClose}
                    >
                      Historial de crédito depositado
                    </NavLink>
                  </div>
                  <div ref={setLinkRef("/cuotas")}>
                    <NavLink
                      to="/cuotas"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                      onClick={onClose}
                    >
                      Reporte de cuotas
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Enlaces adicionales */}
            <div ref={setLinkRef("/Aprobacion")}>
              <NavLink
                to="/Aprobacion"
                className={({ isActive }) =>
                  `flex items-center px-1 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive ? activeClassName : "hover:bg-gray-100"
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-check-circle text-2xl mr-3"></i>
                <span className="text-md font-semibold">
                  Modulo de revisión y aprobación
                </span>
              </NavLink>
            </div>

            <div ref={setLinkRef("/Gestion")}>
              <NavLink
                to="/Gestion"
                className={({ isActive }) =>
                  `flex items-center px-1 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive ? activeClassName : "hover:bg-gray-100"
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-credit-card text-2xl mr-3"></i>
                <span className="text-md font-semibold">
                  Modulo Asignación de Contrato
                </span>
              </NavLink>
            </div>

            <div ref={setLinkRef("/Fondo")}>
              <NavLink
                to="/Fondo"
                className={({ isActive }) =>
                  `flex items-center px-1 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive ? activeClassName : "hover:bg-gray-100"
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-money-withdraw text-2xl mr-3"></i>
                <span className="text-md font-semibold">
                  Fondo Financiero de Crédito
                </span>
              </NavLink>
            </div>

            <div ref={setLinkRef("/confirmacionCuota")}>
              <NavLink
                to="/confirmacionCuota"
                className={({ isActive }) =>
                  `flex items-center px-1 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive ? activeClassName : "hover:bg-gray-100"
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-credit-card text-2xl mr-3"></i>
                <span className="text-md font-semibold">
                  Modulo de Gestión de Créditos
                </span>
              </NavLink>
            </div>

            <div ref={setLinkRef("/amortizacion")}>
              <NavLink
                to="/amortizacion"
                className={({ isActive }) =>
                  `flex items-center px-1 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive ? activeClassName : "hover:bg-gray-100"
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-money-withdraw text-2xl mr-3"></i>
                <span className="text-md font-semibold">
                  Modulo de Morosidad
                </span>
              </NavLink>
            </div>

            {/* Configuración */}
            <div>
              <button
                onClick={toggleGestionEmprend}
                className="w-full flex items-center px-1 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer focus:outline-none"
              >
                <i className="bx bx-cog text-2xl mr-3"></i>
                <span className="flex-1 text-md font-semibold text-left">
                  Configuración
                </span>
                <i
                  className={`bx transition-transform duration-300 ${
                    isGestionEmprendOpen
                      ? "bx-chevron-up text-blue-500"
                      : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {isGestionEmprendOpen && (
                <div className="ml-6 mt-2 space-y-2 transition-all duration-300 max-h-60 overflow-hidden">
                  <div ref={setLinkRef("/Usuario")}>
                    <NavLink
                      to="/Usuario"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                      onClick={onClose}
                    >
                      Gestión de Usuarios
                    </NavLink>
                  </div>
                  <div ref={setLinkRef("/Emprendimiento")}>
                    <NavLink
                      to="/Emprendimiento"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                      onClick={onClose}
                    >
                      Registro de Clasificación Emprendimiento
                    </NavLink>
                  </div>
                  <div ref={setLinkRef("/Requerimientos")}>
                    <NavLink
                      to="/Requerimientos"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                      onClick={onClose}
                    >
                      Requerimientos
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Pie de página */}
        <div className="mt-8 text-center text-sm text-gray-500 italic">
          © {new Date().getFullYear()} TuInstitución. Todos los derechos
          reservados.
        </div>
      </div>
    </aside>
  );
};

export default Menu;
