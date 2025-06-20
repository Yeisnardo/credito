import { NavLink } from "react-router-dom";

const Menu = ({ onClose }) => {
  const activeClassName = "bg-gray-300";

  return (
    <aside className="w-64 bg-white shadow-lg fixed top-0 left-0 z-50">
      {/* Contenedor con barra de desplazamiento para todo el menú */}
      <div className="h-screen overflow-y-auto p-4">
        {/* Lista de enlaces */}
        <nav className="flex flex-col space-y-2 mt-16">
          {/* Enlace Inicio */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-home mr-3 text-xl"></i>
            <span>Inicio</span>
          </NavLink>

          {/* Enlace Mis Requerimientos */}
          <NavLink
            to="/Requerimiento"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-money-withdraw mr-3 text-xl"></i>
            <span>Mis Requerimientos</span>
          </NavLink>

          {/* Enlace Gestión de Amortización */}
          <NavLink
            to="/solicitud"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-money-withdraw mr-3 text-xl"></i>
            <span>Solicitud de Crédito</span>
          </NavLink>

          {/* Enlace Historial de Depositos */}
          <NavLink
            to="/depositos"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-money-withdraw mr-3 text-xl"></i>
            <span>Historial de Depositos</span>
          </NavLink>

          {/* Enlace Reporte de Cuotas */}
          <NavLink
            to="/cuotas"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-money-withdraw mr-3 text-xl"></i>
            <span>Reporte de Cuotas</span>
          </NavLink>

          {/* Sección Gestión de Usuarios */}
          <NavLink
            to="/Usuario"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-user mr-3 text-xl"></i>
            <span>Gestión de Usuarios</span>
          </NavLink>
          
          {/* Otros enlaces */}
          <NavLink
            to="/Perfil_emprendedores"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-group mr-3 text-xl"></i>
            <span>Perfiles de Emprendedores</span>
          </NavLink>

          <NavLink
            to="/Emprendimiento"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-store mr-3 text-xl"></i>
            <span>Registro de Clasificacion Emprendimiento</span>
          </NavLink>

          {/* Enlaces Otros Menús */}
          <NavLink
            to="/Aprobacion"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-check-circle mr-3 text-xl"></i>
            <span>Aprobación de Solicitud de Crédito</span>
          </NavLink>
          
          <NavLink
            to="/Fondo"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-money-withdraw mr-3 text-xl"></i>
            <span>Fondo Financiero de Crédito</span>
          </NavLink>

          <NavLink
            to="/Gestion"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-credit-card mr-3 text-xl"></i>
            <span>Gestor de Crédito</span>
          </NavLink>

          <NavLink
            to="/confirmacionCuota"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-credit-card mr-3 text-xl"></i>
            <span>Confirmacion de Cuotas</span>
          </NavLink>

          <NavLink
            to="/amortizacion"
            className={({ isActive }) =>
              `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors ${
                isActive ? activeClassName : ""
              }`
            }
            onClick={onClose}
          >
            <i className="bx bx-money-withdraw mr-3 text-xl"></i>
            <span>Gestión de Amortización</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Menu;