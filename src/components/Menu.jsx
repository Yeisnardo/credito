import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Importar Tabler Icons
import {
  TbHome,
  TbFileText,
  TbFolderOpen,
  TbWallet,
  TbCheckbox,
  TbCreditCard,
  TbBook,
  TbCalendar,
  TbSettings,
  TbUsers,
  TbBuildingStore,
  TbListDetails,
  TbFileDescription,
  TbChevronDown,
  TbChevronUp,
  TbChevronRight,
  TbUser,
  TbCreditCardOff,
  TbDatabaseExport
} from 'react-icons/tb';

const Menu = ({ onClose }) => {
  // Colores mejorados con mejor contraste y armonía
  const activeClassName = "bg-indigo-100 text-indigo-800 shadow-lg";
  const hoverClassName = "hover:bg-indigo-100 hover:text-indigo-800";
  const submenuHoverClassName = "hover:bg-indigo-50 hover:text-indigo-700";

  // Estados para los submenús con persistencia en localStorage
  const [openSubmenus, setOpenSubmenus] = useState({
    requerimientos: JSON.parse(localStorage.getItem("isRequerimientosOpen")) || false,
    historial: JSON.parse(localStorage.getItem("isHistorialOpen")) || false,
    gestionEmprend: JSON.parse(localStorage.getItem("isGestionEmprendOpen")) || false
  });

  const menuRef = useRef(null);
  const linkRefs = useRef({});
  const location = useLocation();

  // Cargar usuario logueado desde localStorage
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  // Estructura del menú por roles
  const menuItems = {
    // Items visibles para todos los usuarios autenticados
    comunes: [
      {
        path: "/dashboard",
        icon: TbHome,
        label: "Pagina principal",
        roles: ["Emprendedor", "Credito1", "Credito2", "Administrador"]
      }
    ],

    // Items específicos para Emprendedor
    emprendedor: [
      {
        type: "submenu",
        key: "requerimientos",
        icon: TbFileText,
        label: "Solicitud de crédito",
        roles: ["Emprendedor"],
        subitems: [
          { path: "/Requeri_solicit", label: "Requerimientos y motivo" },
          { path: "/Contrato", label: "Mi Contrato" }
        ]
      },
      {
        type: "submenu",
        key: "historial",
        icon: TbFolderOpen,
        label: "Seguimiento de crédito",
        roles: ["Emprendedor"],
        subitems: [
          { path: "/depositos", label: "Historial de depósitos" },
          { path: "/cuotas", label: "Reporte de cuotas" }
        ]
      },
      {
        path: "/Banco",
        icon: TbWallet,
        label: "Mi banco",
        roles: ["Emprendedor"]
      }
    ],

    // Items para roles de Crédito y Administrador
    administracion: [
      {
        path: "/Aprobacion",
        icon: TbCheckbox,
        label: "Revisión y aprobación de solicitud",
        roles: ["Credito2", "Administrador"]
      },
      {
        path: "/Gestion",
        icon: TbCreditCard,
        label: "Gestión de contrato",
        roles: ["Credito1", "Administrador"]
      },
      {
        path: "/Bitacora",
        icon: TbBook,
        label: "Bitácora",
        roles: ["Administrador"]
      },
      {
        path: "/AdministracionCuota",
        icon: TbCalendar,
        label: "Administración de cuotas",
        roles: ["Administrador", "Credito1"]
      },
      {
        path: "/Respaldo",
        icon: TbDatabaseExport,
        label: "Respaldo de la base de datos",
        roles: ["Administrador", "Credito1"]
      }
    ],

    // Configuración solo para Administrador
    configuracion: [
      {
        type: "submenu",
        key: "gestionEmprend",
        icon: TbSettings,
        label: "Configuración",
        roles: ["Administrador"],
        subitems: [
          { path: "/Usuario", label: "Gestión de Usuarios" },
          { path: "/Emprendimiento", label: "Clasificación Emprendimiento" },
          { path: "/Requerimientos", label: "Requerimientos" },
          { path: "/FormatoContrato", label: "Configuracion de contrato" }
        ]
      }
    ]
  };

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
    Object.keys(openSubmenus).forEach(key => {
      localStorage.setItem(`is${key.charAt(0).toUpperCase() + key.slice(1)}Open`, 
        JSON.stringify(openSubmenus[key]));
    });
  }, [openSubmenus]);

  // Cerrar submenús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenSubmenus({
          requerimientos: false,
          historial: false,
          gestionEmprend: false
        });
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Función para renderizar items del menú
  const renderMenuItem = (item) => {
    if (!puedeVer(item.roles)) return null;

    if (item.type === "submenu") {
      const IconComponent = item.icon;
      return (
        <div key={item.key}>
          <button
            onClick={() => toggleSubmenu(item.key)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
              openSubmenus[item.key] 
                ? "bg-indigo-100 text-indigo-800" 
                : `text-gray-700 ${hoverClassName}`
            }`}
          >
            <IconComponent size={20} className="mr-3" />
            <span className="flex-1 text-sm font-medium text-left">
              {item.label}
            </span>
            {openSubmenus[item.key] ? <TbChevronUp size={16} /> : <TbChevronDown size={16} />}
          </button>
          
          {openSubmenus[item.key] && (
            <div className="ml-6 mt-1 space-y-1 transition-all duration-300 overflow-hidden">
              {item.subitems.map((subitem) => (
                <div key={subitem.path} ref={setLinkRef(subitem.path)}>
                  <NavLink
                    to={subitem.path}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                        isActive
                          ? "bg-indigo-100 text-indigo-800 font-medium"
                          : `text-gray-600 ${submenuHoverClassName}`
                      }`
                    }
                    onClick={onClose}
                  >
                    <TbChevronRight size={12} className="inline mr-2" />
                    {subitem.label}
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const IconComponent = item.icon;
    return (
      <div key={item.path} ref={setLinkRef(item.path)}>
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive 
                ? activeClassName 
                : `text-gray-700 ${hoverClassName}`
            }`
          }
          onClick={onClose}
        >
          <IconComponent size={20} className="mr-3" />
          <span className="text-sm font-medium">{item.label}</span>
        </NavLink>
      </div>
    );
  };

  return (
    <aside
      ref={menuRef}
      className="w-64 bg-gradient-to-b from-gray-50 to-white text-gray-800 fixed inset-y-0 left-0 z-50 shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto"
    >
      {/* Logo y nombre de la app */}
      <div className="p-5 border-b border-indigo-200 flex items-center justify-center mt-14">
        <div className="bg-indigo-100 p-2 rounded-lg shadow-sm mr-2">
          <TbCreditCardOff size={24} className="text-gray-900" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Sistema de Microcréditos</h2>
      </div>

      {/* Información del usuario */}
      {usuarioLogueado && (
        <div className="p-4 border-b border-indigo-200 flex items-center">
          <div className="bg-gray-900 rounded-full h-10 w-10 flex items-center justify-center mr-3">
            <TbUser size={20} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="font-medium truncate text-gray-800">
              {usuarioLogueado.nombre_completo || "Usuario"}
            </p>
            <p className="text-blue-500 text-xs capitalize">
              {usuarioLogueado.rol || "Rol"}
            </p>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="p-4">
        <nav className="space-y-1">
          {/* Items comunes */}
          {menuItems.comunes.map(renderMenuItem)}
          
          {/* Separador visual si hay items de emprendedor */}
          {puedeVer(["Emprendedor"]) && menuItems.emprendedor.length > 0 && (
            <div className="pt-2">
              {menuItems.emprendedor.map(renderMenuItem)}
            </div>
          )}

          {/* Items de administración */}
          {(puedeVer(["Credito1", "Credito2", "Administrador"])) && (
            <div className="pt-2 border-t border-gray-100">
              {menuItems.administracion.map(renderMenuItem)}
            </div>
          )}

          {/* Configuración */}
          {puedeVer(["Administrador"]) && (
            <div className="pt-2 border-t border-gray-100">
              {menuItems.configuracion.map(renderMenuItem)}
            </div>
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