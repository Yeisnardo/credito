import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api, { getUsuarioPorCedula } from '../services/api_usuario';
import logo from '../assets/imagenes/logo_header.jpg';

// Hook personalizado para logout
const useLogout = () => {
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      // Intentar cerrar sesión en el backend
      await api.post('/api/usuarios/logout');
    } catch (error) {
      console.warn('Error en logout del backend:', error);
      // Continuamos aunque falle el backend
    } finally {
      // Siempre limpiar el frontend
      const itemsToKeep = []; // Items que quieres conservar (si los hay)
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!itemsToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      sessionStorage.clear();

      // Limpiar cookies de autenticación
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes('token') || name.includes('session') || name.includes('auth')) {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      });

      // Redirigir al login
      navigate('/Login', { replace: true });
      
      // Recargar para estado limpio
      setTimeout(() => window.location.reload(), 100);
    }
  }, [navigate]);

  const confirmLogout = useCallback(() => {
    Swal.fire({
      title: 'Cerrar Sesión',
      text: '¿Estás seguro de que quieres salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Cerrando sesión...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        logout();
      }
    });
  }, [logout]);

  return { confirmLogout };
};

// Componente para las opciones del perfil
const PerfilOpciones = ({
  onClose,
  onConfig,
  onVerPerfil,
  onEditarDatos,
  onEditarEmprendimiento,
  onCerrarSesion,
}) => (
  <div className="py-2">
    <button
      className="w-full px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-md"
      onClick={() => { onConfig(); onClose(); }}
    >
      <i className="bx bx-cog text-xl mr-3"></i>
      <span>Configuración</span>
    </button>
    <button
      className="w-full px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-md"
      onClick={() => { onVerPerfil(); onClose(); }}
    >
      <i className="bx bx-user-circle text-xl mr-3"></i>
      <span>Ver Perfil</span>
    </button>
    <button
      className="w-full px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-md"
      onClick={() => { onEditarDatos(); onClose(); }}
    >
      <i className="bx bx-user-pin text-xl mr-3"></i>
      <span>Datos Personales</span>
    </button>
    <button
      className="w-full px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-md"
      onClick={() => { onEditarEmprendimiento(); onClose(); }}
    >
      <i className="bx bx-store-alt text-xl mr-3"></i>
      <span>Mi Emprendimiento</span>
    </button>
    <div className="border-t border-gray-200 my-2"></div>
    <button
      className="w-full px-4 py-3 flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-md"
      onClick={() => { onCerrarSesion(); onClose(); }}
    >
      <i className="bx bx-log-out-circle text-xl mr-3"></i>
      <span>Cerrar Sesión</span>
    </button>
  </div>
);

const Header = ({ toggleMenu, menuOpen }) => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);
  
  // Usar el hook de logout
  const { confirmLogout } = useLogout();

  // Cargar usuario al inicio
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const cedula = localStorage.getItem('cedula_usuario');
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) setUser(usuario);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Cargar notificaciones
  useEffect(() => {
    // Simular carga de notificaciones
    const fakeNotifications = [
      {
        id: 1,
        title: "Solicitud Aprobada",
        message: "Tu solicitud de crédito ha sido aprobada",
        time: "Hace 2 minutos",
        read: false,
        type: "success"
      },
      {
        id: 2,
        title: "Mensaje Nuevo",
        message: "Tienes un nuevo mensaje del administrador",
        time: "Hace 1 hora",
        read: false,
        type: "info"
      },
      {
        id: 3,
        title: "Recordatorio",
        message: "Complete su perfil para mejores recomendaciones",
        time: "Hace 5 horas",
        read: true,
        type: "warning"
      }
    ];
    setNotifications(fakeNotifications);
  }, []);

  // Monitorizar conexión a internet
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función genérica para actualizar datos vía API
  const handleUpdate = useCallback(async (endpoint, data, successMsg) => {
    try {
      await api.put(endpoint, data);
      Swal.fire({
        title: "¡Éxito!",
        text: successMsg,
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
    } catch (error) {
      console.error('Error al actualizar:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  }, []);

  // Configuración (cambiar contraseña o usuario)
  const handleAbrirConfiguracion = async () => {
    const { value } = await Swal.fire({
      title: "Configuración de Cuenta",
      text: "¿Qué deseas modificar?",
      icon: "question",
      input: "radio",
      inputOptions: {
        password: "Contraseña",
        user: "Nombre de Usuario",
      },
      inputValidator: (value) => {
        if (!value) return "Por favor, selecciona una opción";
      },
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
    });
    
    if (value === "password") await handleCambiarContraseña();
    if (value === "user") await handleCambiarUsuario();
  };

  // Cambiar Contraseña
  const handleCambiarContraseña = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Cambiar Contraseña",
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
            <input 
              id="password" 
              type="password" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder="Mínimo 6 caracteres"
              minlength="6"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
            <input 
              id="repeatPassword" 
              type="password" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder="Repite tu contraseña"
            />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const pass = document.getElementById("password").value.trim();
        const repeatPass = document.getElementById("repeatPassword").value.trim();
        
        if (!pass || !repeatPass) {
          Swal.showValidationMessage("Por favor, completa todos los campos");
          return false;
        }
        if (pass.length < 6) {
          Swal.showValidationMessage("La contraseña debe tener al menos 6 caracteres");
          return false;
        }
        if (pass !== repeatPass) {
          Swal.showValidationMessage("Las contraseñas no coinciden");
          return false;
        }
        return { pass };
      },
    });
    
    if (formValues) {
      await handleUpdate(
        `/api/usuarios/${user?.cedula_usuario}`, 
        { clave: formValues.pass }, 
        "Contraseña actualizada correctamente"
      );
    }
  };

  // Cambiar Usuario
  const handleCambiarUsuario = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Cambiar Nombre de Usuario",
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nuevo Usuario</label>
            <input 
              id="usuario" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder="Nuevo nombre de usuario"
              minlength="3"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Usuario</label>
            <input 
              id="repeatUsuario" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder="Repite el nombre de usuario"
            />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const userVal = document.getElementById("usuario").value.trim();
        const repeatUser = document.getElementById("repeatUsuario").value.trim();
        
        if (!userVal || !repeatUser) {
          Swal.showValidationMessage("Por favor, completa todos los campos");
          return false;
        }
        if (userVal.length < 3) {
          Swal.showValidationMessage("El usuario debe tener al menos 3 caracteres");
          return false;
        }
        if (userVal !== repeatUser) {
          Swal.showValidationMessage("Los nombres de usuario no coinciden");
          return false;
        }
        return { user: userVal };
      },
    });
    
    if (formValues) {
      await handleUpdate(
        `/api/usuarios/${user?.cedula_usuario}`, 
        { usuario: formValues.user }, 
        "Nombre de usuario actualizado correctamente"
      );
    }
  };

  // Ver perfil
  const handleVerPerfil = () => {
    Swal.fire({
      title: "Perfil de Usuario",
      html: `
        <div class="max-w-2xl mx-auto">
          <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <!-- Información Personal -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <i class="bx bx-user-circle mr-2 text-indigo-600"></i>
                Información Personal
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span class="font-medium text-gray-600">Cédula:</span> ${user?.cedula_usuario || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Nombre:</span> ${user?.nombre_completo || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Email:</span> ${user?.email || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Teléfono:</span> ${user?.telefono || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Edad:</span> ${user?.edad || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Dirección:</span> ${user?.direccion_actual || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Estado:</span> ${user?.estado || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Municipio:</span> ${user?.municipio || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Tipo Persona:</span> ${user?.tipo_persona || "No especificado"}</div>
              </div>
            </div>
            
            <!-- Información de Cuenta -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <i class="bx bx-user-check mr-2 text-indigo-600"></i>
                Información de Cuenta
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span class="font-medium text-gray-600">Usuario:</span> ${user?.usuario || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Rol:</span> ${user?.rol || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Estatus:</span> 
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user?.estatus?.toLowerCase() === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }">
                    ${user?.estatus || "No especificado"}
                  </span>
                </div>
              </div>
            </div>

            <!-- Información del Emprendimiento -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <i class="bx bx-store-alt mr-2 text-indigo-600"></i>
                Información del Emprendimiento
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span class="font-medium text-gray-600">Nombre:</span> ${user?.nombre_emprendimiento || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Consejo:</span> ${user?.consejo_nombre || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Comuna:</span> ${user?.comuna || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Dirección:</span> ${user?.direccion_emprendimiento || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Tipo Sector:</span> ${user?.tipo_sector || "No especificado"}</div>
                <div><span class="font-medium text-gray-600">Tipo Negocio:</span> ${user?.tipo_negocio || "No especificado"}</div>
              </div>
            </div>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '800px',
      customClass: {
        popup: 'rounded-xl',
      }
    });
  };

  // Editar datos personales
  const handleEditarDatosPersonales = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Datos Personales",
      html: `
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input id="nombre" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.nombre_completo || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Edad</label>
              <input id="edad" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.edad || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input id="telefono" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.telefono || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <input id="email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.email || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input id="direccion" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.direccion_actual || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <input id="estado" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.estado || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Municipio</label>
              <input id="municipio" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.municipio || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Persona</label>
              <input id="tipo_persona" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.tipo_persona || ""}">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Guardar Cambios",
      preConfirm: () => {
        const nombre = document.getElementById("nombre").value.trim();
        const edad = document.getElementById("edad").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const email = document.getElementById("email").value.trim();
        const direccion = document.getElementById("direccion").value.trim();
        const estado = document.getElementById("estado").value.trim();
        const municipio = document.getElementById("municipio").value.trim();
        const tipo_persona = document.getElementById("tipo_persona").value.trim();

        if (!nombre || !email || !edad) {
          Swal.showValidationMessage("Nombre, Edad y Email son obligatorios");
          return false;
        }
        return { nombre_completo: nombre, edad, telefono, email, direccion_actual: direccion, estado, municipio, tipo_persona };
      },
    });
    
    if (formValues) {
      await handleUpdate(
        `/api/persona/${user?.cedula_usuario}`, 
        formValues, 
        "Datos personales actualizados correctamente"
      );
    }
  };

  // Editar emprendimiento
  const handleEditarEmprendimiento = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Emprendimiento",
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Emprendimiento</label>
            <input id="emprendimiento" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.nombre_emprendimiento || ""}"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Sector</label>
            <input id="tipo_sector" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.tipo_sector || ""}"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Negocio</label>
            <input id="tipo_negocio" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.tipo_negocio || ""}"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Dirección del Emprendimiento</label>
            <input id="direccion_emprendimiento" class="w-full px-3 py-2 border border-gray-300 rounded-lg" value="${user?.direccion_emprendimiento || ""}"/>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const emprendimiento = document.getElementById("emprendimiento").value.trim();
        const tipo_sector = document.getElementById("tipo_sector").value.trim();
        const tipo_negocio = document.getElementById("tipo_negocio").value.trim();
        const direccion_emprendimiento = document.getElementById("direccion_emprendimiento").value.trim();

        if (!emprendimiento || !tipo_sector || !tipo_negocio) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }
        return { nombre_emprendimiento: emprendimiento, tipo_sector, tipo_negocio, direccion_emprendimiento };
      },
    });
    
    if (formValues) {
      await handleUpdate(
        `/api/emprendimientos/${user?.cedula_usuario}`, 
        formValues, 
        "Emprendimiento actualizado correctamente"
      );
    }
  };

  // Función de búsqueda
  const handleSearch = (query) => {
    if (query.trim()) {
      // Navegar a página de resultados de búsqueda
      navigate(`/buscar?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
    }
  };

  // Marcar notificación como leída
  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, read: true} : notif
    ));
  };

  // Obtener número de notificaciones no leídas
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <header className="w-full bg-gradient-to-r from-white to-gray-800 shadow-sm border-b border-gray-200 fixed top-0 left-0 z-50 px-3 py-1">
      <div className="flex items-center justify-between">
        {/* Logo y botón de menú */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <i className={`bx text-2xl ${menuOpen ? "bx-x" : "bx-menu"}`}></i>
          </button>
          
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Logo IFEMI"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <h1 className="text-xl font-bold text-gray-800 hidden md:inline">IFEMI</h1>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex-1 max-w-xl mx-4 relative" ref={searchRef}>
          <div className={`relative transition-all duration-300 ${searchOpen ? 'w-full' : 'w-10/12 mx-auto'}`}>
            <input
              type="text"
              placeholder="Buscar..."
              className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${searchOpen ? 'block' : 'hidden'}`}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
            />
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 ${searchOpen ? '' : 'left-1/2 -translate-x-1/2'}`}
            >
              <i className="bx bx-search text-xl"></i>
            </button>
          </div>
        </div>

        {/* Notificaciones y perfil */}
        <div className="flex items-center space-x-3">
          {/* Indicador de conexión */}
          <div className="hidden md:flex items-center mr-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${onlineStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-white">{onlineStatus ? 'En línea' : 'Sin conexión'}</span>
          </div>

          {/* Accesos directos */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Dashboard"
            >
              <i className="bx bx-home text-xl"></i>
            </button>
            <button
              onClick={() => navigate('/solicitudes')}
              className="p-2 text-white hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Solicitudes"
            >
              <i className="bx bx-file text-xl"></i>
            </button>
            <button
              onClick={() => navigate('/mensajes')}
              className="p-2 text-white hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Mensajes"
            >
              <i className="bx bx-chat text-xl"></i>
            </button>
          </div>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-white hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Notificaciones"
            >
              <i className="bx bx-bell text-2xl"></i>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        {unreadNotificationsCount} nuevas
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`mr-3 mt-1 w-2 h-2 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No hay notificaciones
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button 
                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    onClick={() => navigate('/notificaciones')}
                  >
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Perfil del usuario */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              aria-label="Perfil"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <i className="bx bx-user text-xl text-indigo-600"></i>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium truncate max-w-xs">
                  {user?.nombre_completo || "Usuario"}
                </p>
                <p className="text-xs text-indigo-500 capitalize">
                  {user?.rol || "Rol no asignado"}
                </p>
              </div>
              <i className={`bx bx-chevron-down text-xl transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <i className="bx bx-user text-2xl text-indigo-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user?.nombre_completo || "Usuario"}</p>
                      <p className="text-sm text-gray-500">{user?.email || "correo@ejemplo.com"}</p>
                    </div>
                  </div>
                </div>
                
                <PerfilOpciones
                  onClose={() => setProfileMenuOpen(false)}
                  onConfig={handleAbrirConfiguracion}
                  onVerPerfil={handleVerPerfil}
                  onEditarDatos={handleEditarDatosPersonales}
                  onEditarEmprendimiento={handleEditarEmprendimiento}
                  onCerrarSesion={confirmLogout}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;