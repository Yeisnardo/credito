// src/components/Menu.jsx
import { NavLink } from "react-router-dom";

const Menu = ({ onClose }) => {
  const activeClassName = "bg-gray-300"; // Clase para el estado activo

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen p-4 fixed top-0 left-0 z-50">
      <nav className="flex flex-col space-y-4 mt-16">
        {/* Inicio */}
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

        {/* Gestión de Amortización */}
        <NavLink
          to="/amortizacion"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-money-withdraw mr-3 text-xl"></i>
          <span>Solicitud de Credito</span>
        </NavLink>

        {/* Gestión de Amortización */}
        <NavLink
          to="/amortizacion"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-money-withdraw mr-3 text-xl"></i>
          <span>Historial de Depositos</span>
        </NavLink>

        {/* Gestión de Amortización */}
        <NavLink
          to="/amortizacion"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-money-withdraw mr-3 text-xl"></i>
          <span>Reporte de Cuotas</span>
        </NavLink>

        {/* Usuarios */}
        <NavLink
          to="/Usuario"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-user mr-3 text-xl"></i>
          <span>Gestión de Usuarios</span>
        </NavLink>

        {/* Perfil Financiero */}
        <NavLink
          to="/Perfil_emprendedores"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-group mr-3 text-xl"></i>
          <span>Perfiles de Emprendedores</span>
        </NavLink>

        {/* Registro de Emprendimiento */}
        <NavLink
          to="/Emprendimiento" // Ensure this route is correct
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-store mr-3 text-xl"></i> {/* New icon for Emprendimiento */}
          <span>Registro de Emprendimiento</span>
        </NavLink>

        {/* Aprobación de Solicitud */}
        <NavLink
          to="/Aprobacion"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-check-circle mr-3 text-xl"></i>
          <span>Aprobación de Solicitud de Credito</span>
        </NavLink>

        {/* Fondos */}
        <NavLink
          to="/Fondo"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-money-withdraw mr-3 text-xl"></i>
          <span>Fondo Financiero de Credito</span>
        </NavLink>

        {/* Gestión de Crédito */}
        <NavLink
          to="/Gestion"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-credit-card mr-3 text-xl"></i>
          <span>Gestor de Crédito</span>
        </NavLink>

        {/* Gestión de Amortización */}
        <NavLink
          to="/amortizacion"
          className={({ isActive }) =>
            `flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors duration-200 ${
              isActive ? activeClassName : ""
            }`
          }
          onClick={onClose}
        >
          <i className="bx bx-money-withdraw mr-3 text-xl"></i>
          <span>Gestión de Amortización</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Menu;
