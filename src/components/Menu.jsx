import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Menu = ({ onClose }) => {
  // Colores mejorados con mejor contraste y armonía
  const activeClassName = "bg-gray-900 text-white shadow-lg";
  const hoverClassName = "hover:bg-indigo-100 hover:text-indigo-800";
  const submenuHoverClassName = "hover:bg-indigo-50 hover:text-indigo-700";

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

  // Cargar usuario logueado desde localStorage (o contexto)
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario")) || null;
    setUsuarioLogueado(usuario);
  }, []);

  // Función para verificar permisos por rol
  const puedeVer = (rolesPermitidos) => {
    return usuarioLogueado && rolesPermitidos.includes(usuarioLogueado.rol);
  };

  // Persistir estados de los submenús en localStorage
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

  // Scroll hacia el elemento activo
  useEffect(() => {
    const path = location.pathname;
    const element = linkRefs.current[path];
    if (element && element.scrollIntoView) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [location]);

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
      className="w-64 bg-gradient-to-b from-gray-50 to-white text-gray-800 fixed inset-y-0 left-0 z-50 shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto"
    >
      {/* Logo y nombre de la app */}
      <div className="p-5 border-b border-indigo-200 flex items-center justify-center mt-14">
        <div className="bg-indigo-100 p-2 rounded-lg shadow-sm mr-2">
          <i className="bx bx-credit-card-front text-bg-gray-900 text-2xl"></i>
        </div>
        <h2 className="text-xl font-bold text-bg-gray-900">Sistema de Microcréditos</h2>
      </div>

      {/* Información del usuario */}
      {usuarioLogueado && (
        <div className="p-4 border-b border-indigo-200 flex items-center">
          <div className="bg-gray-900 rounded-full h-10 w-10 flex items-center justify-center mr-3">
            <i className="bx bx-user text-white"></i>
          </div>
          <div className="overflow-hidden">
            <p className="font-medium truncate text-gray-800">{usuarioLogueado.nombre || "Usuario"}</p>
            <p className="text-blue-500 text-xs capitalize">{usuarioLogueado.rol || "Rol"}</p>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="p-4">
        <nav className="space-y-1">
          {/* Inicio - visible para todos */}
          <div ref={setLinkRef("/dashboard")}>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? activeClassName 
                    : `text-gray-700 ${hoverClassName}`
                }`
              }
              onClick={onClose}
            >
              <i className="bx bx-home text-xl mr-3"></i>
              <span className="text-sm font-medium">Inicio</span>
            </NavLink>
          </div>

          {/* Solicitud de crédito - solo roles permitidos */}
          {puedeVer(["Emprendedor"]) && (
            <div>
              {/* Menú de Solicitud de crédito */}
              <button
                onClick={toggleRequerimientos}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
                  isRequerimientosOpen 
                    ? "bg-indigo-100 text-indigo-800" 
                    : `text-gray-700 ${hoverClassName}`
                }`}
              >
                <i className="bx bx-file text-xl mr-3"></i>
                <span className="flex-1 text-sm font-medium text-left">
                  Solicitud de crédito
                </span>
                <i
                  className={`bx transition-transform duration-300 text-lg ${
                    isRequerimientosOpen
                      ? "bx-chevron-up transform rotate-180"
                      : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {isRequerimientosOpen && (
                <div className="ml-6 mt-1 space-y-1 transition-all duration-300 overflow-hidden">
                  {/* Requerimientos y motivo */}
                  <div ref={setLinkRef("/Requeri_solicit")}>
                    <NavLink
                      to="/Requeri_solicit"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                          isActive
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : `text-gray-600 ${submenuHoverClassName}`
                        }`
                      }
                      onClick={onClose}
                    >
                      <i className="bx bx-chevron-right text-xs mr-2"></i>
                      Requerimientos y motivo
                    </NavLink>
                  </div>
                  {/* Mi Contrato */}
                  <div ref={setLinkRef("/Contrato")}>
                    <NavLink
                      to="/Contrato"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                          isActive
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : `text-gray-600 ${submenuHoverClassName}`
                        }`
                      }
                      onClick={onClose}
                    >
                      <i className="bx bx-chevron-right text-xs mr-2"></i>
                      Mi Contrato
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Control de seguimiento de crédito - solo roles permitidos */}
          {puedeVer(["Emprendedor"]) && (
            <div>
              {/* Menú de Control de seguimiento */}
              <button
                onClick={toggleHistorial}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
                  isHistorialOpen 
                    ? "bg-indigo-100 text-indigo-800" 
                    : `text-gray-700 ${hoverClassName}`
                }`}
              >
                <i className="bx bx-folder-open text-xl mr-3"></i>
                <span className="flex-1 text-sm font-medium text-left">
                  Seguimiento de crédito
                </span>
                <i
                  className={`bx transition-transform duration-300 text-lg ${
                    isHistorialOpen
                      ? "bx-chevron-up transform rotate-180"
                      : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {isHistorialOpen && (
                <div className="ml-6 mt-1 space-y-1 transition-all duration-300 overflow-hidden">
                  {/* Opciones */}
                  <div ref={setLinkRef("/depositos")}>
                    <NavLink
                      to="/depositos"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                          isActive
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : `text-gray-600 ${submenuHoverClassName}`
                        }`
                      }
                      onClick={onClose}
                    >
                      <i className="bx bx-chevron-right text-xs mr-2"></i>
                      Historial de depósitos
                    </NavLink>
                  </div>
                  <div ref={setLinkRef("/cuotas")}>
                    <NavLink
                      to="/cuotas"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                          isActive
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : `text-gray-600 ${submenuHoverClassName}`
                        }`
                      }
                      onClick={onClose}
                    >
                      <i className="bx bx-chevron-right text-xs mr-2"></i>
                      Reporte de cuotas
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enlaces que solo ven los emprendedores */}
          {puedeVer(["Emprendedor"]) && (
            <div ref={setLinkRef("/Banco")}>
              <NavLink
                to="/Banco"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? activeClassName 
                      : `text-gray-700 ${hoverClassName}`
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-wallet text-xl mr-3"></i>
                <span className="text-sm font-medium">Mi banco</span>
              </NavLink>
            </div>
          )}

          {/* Revisión y aprobación - solo roles */}
          {puedeVer(["Credito2", "Administrador"]) && (
            <div ref={setLinkRef("/Aprobacion")}>
              <NavLink
                to="/Aprobacion"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? activeClassName 
                      : `text-gray-700 ${hoverClassName}`
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-check-circle text-xl mr-3"></i>
                <span className="text-sm font-medium">Revisión y aprobación</span>
              </NavLink>
            </div>
          )}

          {/* Gestión de contratos - solo Administrador */}
          {puedeVer(["Credito1", "Administrador"]) && (
            <div ref={setLinkRef("/Gestion")}>
              <NavLink
                to="/Gestion"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? activeClassName 
                      : `text-gray-700 ${hoverClassName}`
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-credit-card text-xl mr-3"></i>
                <span className="text-sm font-medium">Gestión de contrato</span>
              </NavLink>
            </div>
          )}

          {/* Fondo financiero - solo Administrador */}
          {puedeVer(["Administrador"]) && (
            <div ref={setLinkRef("/Fondo")}>
              <NavLink
                to="/Fondo"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? activeClassName 
                      : `text-gray-700 ${hoverClassName}`
                  }`
                }
                onClick={onClose}
              >
                <i className="bx bx-money-withdraw text-xl mr-3"></i>
                <span className="text-sm font-medium">Fondo Financiero</span>
              </NavLink>
            </div>
          )}

          {/* Supervisión de cuotas - solo roles permitidos */}
          {puedeVer(["Credito2", "Administrador"]) && (
            <>
              <div ref={setLinkRef("/Bitacora")}>
                <NavLink
                  to="/Bitacora"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? activeClassName 
                        : `text-gray-700 ${hoverClassName}`
                    }`
                  }
                  onClick={onClose}
                >
                  <i className="bx bx-book-alt text-xl mr-3"></i>
                  <span className="text-sm font-medium">Bitácora</span>
                </NavLink>
              </div>
            </>
          )}

          {/* Configuración - solo Administrador */}
          {puedeVer(["Administrador"]) && (
            <>
              {/* Menú de Configuración */}
              <button
                onClick={toggleGestionEmprend}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
                  isGestionEmprendOpen 
                    ? "bg-indigo-100 text-indigo-800" 
                    : `text-gray-700 ${hoverClassName}`
                }`}
              >
                <i className="bx bx-cog text-xl mr-3"></i>
                <span className="flex-1 text-sm font-medium text-left">
                  Configuración
                </span>
                <i
                  className={`bx transition-transform duration-300 text-lg ${
                    isGestionEmprendOpen
                      ? "bx-chevron-up transform rotate-180"
                      : "bx-chevron-down"
                  }`}
                ></i>
              </button>
              {isGestionEmprendOpen && (
                <div className="ml-6 mt-1 space-y-1 transition-all duration-300 overflow-hidden">
                  {/* Opciones en configuración */}
                  <div ref={setLinkRef("/Usuario")}>
                    <NavLink
                      to="/Usuario"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                          isActive
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : `text-gray-600 ${submenuHoverClassName}`
                        }`
                      }
                      onClick={onClose}
                    >
                      <i className="bx bx-chevron-right text-xs mr-2"></i>
                      Gestión de Usuarios
                    </NavLink>
                  </div>
                  <div ref={setLinkRef("/Emprendimiento")}>
                    <NavLink
                      to="/Emprendimiento"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                          isActive
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : `text-gray-600 ${submenuHoverClassName}`
                        }`
                      }
                      onClick={onClose}
                    >
                      <i className="bx bx-chevron-right text-xs mr-2"></i>
                      Clasificación Emprendimiento
                    </NavLink>
                  </div>
                  <div ref={setLinkRef("/Requerimientos")}>
                    <NavLink
                      to="/Requerimientos"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                          isActive
                            ? "bg-indigo-100 text-indigo-800 font-medium"
                            : `text-gray-600 ${submenuHoverClassName}`
                        }`
                      }
                      onClick={onClose}
                    >
                      <i className="bx bx-chevron-right text-xs mr-2"></i>
                      Requerimientos
                    </NavLink>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Pie de página */}
      <div className="p-4 mt-auto border-t border-indigo-200">
        <div className="text-center text-xs text-indigo-600">
          <p>© {new Date().getFullYear()} IFEMI & UPTYAB</p>
          <p className="mt-1">Todos los derechos reservados</p>
        </div>
      </div>
    </aside>
  );
};

export default Menu;