import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api, { getUsuarioPorCedula } from '../services/api_usuario';
import emprendimientoApi from '../services/api_emprendimiento'; // Ajusta la ruta según tu estructura
import personaApi from '../services/api_persona'; // Ajusta la ruta según tu estructura
import logo from '../assets/imagenes/logo_header.jpg';

// Importar Tabler Icons
import { 
  TbMenu2, 
  TbX, 
  TbSearch, 
  TbBell, 
  TbUser, 
  TbChevronDown,
  TbHome,
  TbLogout,
  TbSettings,
  TbUserCircle,
  TbUserEdit,
  TbBuildingStore,
  TbCheck,
  TbCircle
} from 'react-icons/tb';

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
  usuarioLogueado // Recibir usuarioLogueado como prop
}) => {
  // Función para verificar permisos por rol
  const puedeVer = (rolesPermitidos) => {
    return usuarioLogueado && rolesPermitidos.includes(usuarioLogueado.rol);
  };

  return (
    <div className="py-2">
      <button
        className="w-full px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-md"
        onClick={() => { onConfig(); onClose(); }}
      >
        <TbSettings size={20} className="mr-3" />
        <span>Configuración</span>
      </button>
      <button
        className="w-full px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-md"
        onClick={() => { onVerPerfil(); onClose(); }}
      >
        <TbUserCircle size={20} className="mr-3" />
        <span>Ver Perfil</span>
      </button>
      <button
        className="w-full px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-md"
        onClick={() => { onEditarDatos(); onClose(); }}
      >
        <TbUserEdit size={20} className="mr-3" />
        <span>Datos Personales</span>
      </button>
      {puedeVer(["Emprendedor"]) && (
        <button
          className="w-full px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-md"
          onClick={() => { onEditarEmprendimiento(); onClose(); }}
        >
          <TbBuildingStore size={20} className="mr-3" />
          <span>Mi Emprendimiento</span>
        </button>
      )}
      <div className="border-t border-gray-200 my-2"></div>
      <button
        className="w-full px-4 py-3 flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-md"
        onClick={() => { onCerrarSesion(); onClose(); }}
      >
        <TbLogout size={20} className="mr-3" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
};

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
  
  // Cargar usuario logueado desde localStorage
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario")) || null;
    setUsuarioLogueado(usuario);
  }, []);

  // Función para verificar permisos por rol
  const puedeVer = (rolesPermitidos) => {
    return usuarioLogueado && rolesPermitidos.includes(usuarioLogueado.rol);
  };

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

// Función genérica mejorada para actualizar datos vía API
const handleUpdate = useCallback(async (endpoint, data, successMsg) => {
  try {
    const response = await api.put(endpoint, data);
    
    // Si se actualiza el usuario actual, actualizar el estado
    if (endpoint.includes('/api/usuarios/') && user?.cedula_usuario) {
      const updatedUser = await getUsuarioPorCedula(user.cedula_usuario);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
      }
    }
    
    Swal.fire({
      title: "¡Éxito!",
      text: successMsg,
      icon: "success",
      confirmButtonColor: "#4f46e5",
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar:', error);
    const errorMessage = error.response?.data?.message || "No se pudo actualizar la información";
    
    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#ef4444",
    });
    throw error;
  }
}, [user]);

// Configuración mejorada
const handleAbrirConfiguracion = async () => {
  const { value: option } = await Swal.fire({
    title: "Configuración de Cuenta",
    text: "¿Qué deseas modificar?",
    icon: "question",
    input: "select",
    inputOptions: {
      password: "Cambiar Contraseña",
      user: "Cambiar Nombre de Usuario"
    },
    inputPlaceholder: "Selecciona una opción",
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#6b7280",
    inputValidator: (value) => {
      if (!value) return "Por favor, selecciona una opción";
    },
  });
  
  if (option === "password") await handleCambiarContraseña();
  if (option === "user") await handleCambiarUsuario();
};

// Cambiar Contraseña - VERSIÓN SIMPLIFICADA Y FUNCIONAL
const handleCambiarContraseña = async () => {
  const { value: formValues } = await Swal.fire({
    title: "Cambiar Contraseña",
    html: `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
          <input 
            id="currentPassword" 
            type="password" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            placeholder="Ingresa tu contraseña actual"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
          <input 
            id="newPassword" 
            type="password" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            placeholder="Mínimo 6 caracteres"
            minlength="6"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
          <input 
            id="confirmPassword" 
            type="password" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            placeholder="Repite tu nueva contraseña"
            required
          />
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#6b7280",
    preConfirm: () => {
      const currentPass = document.getElementById("currentPassword").value;
      const newPass = document.getElementById("newPassword").value;
      const confirmPass = document.getElementById("confirmPassword").value;
      
      if (!currentPass || !newPass || !confirmPass) {
        Swal.showValidationMessage("Por favor, completa todos los campos");
        return false;
      }
      
      if (newPass.length < 6) {
        Swal.showValidationMessage("La nueva contraseña debe tener al menos 6 caracteres");
        return false;
      }
      
      if (newPass !== confirmPass) {
        Swal.showValidationMessage("Las nuevas contraseñas no coinciden");
        return false;
      }
      
      return { 
        currentPassword: currentPass,
        newPassword: newPass 
      };
    },
  });
  
  if (formValues) {
    try {
      // Verificar contraseña actual primero
      const verifyResponse = await api.verifyPassword(user?.cedula_usuario, formValues.currentPassword);
      
      if (!verifyResponse.valid) {
        Swal.fire({
          title: "Error",
          text: "La contraseña actual es incorrecta",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
        return;
      }
      
      // Actualizar contraseña usando la nueva función
      await api.updatePassword(user?.cedula_usuario, formValues.newPassword);
      
      Swal.fire({
        title: "¡Éxito!",
        text: "Contraseña actualizada correctamente",
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cambiar la contraseña. Verifica tu contraseña actual.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  }
};

// Cambiar Usuario - VERSIÓN CORREGIDA
const handleCambiarUsuario = async () => {
  const { value: newUsername } = await Swal.fire({
    title: "Cambiar Nombre de Usuario",
    input: "text",
    inputLabel: "Nuevo nombre de usuario",
    inputValue: user?.usuario || "",
    inputPlaceholder: "Ingresa tu nuevo nombre de usuario",
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#6b7280",
    inputValidator: (value) => {
      if (!value) {
        return "Por favor, ingresa un nombre de usuario";
      }
      if (value.length < 3) {
        return "El usuario debe tener al menos 3 caracteres";
      }
      if (value === user?.usuario) {
        return "Este es tu nombre de usuario actual";
      }
    }
  });
  
  if (newUsername) {
    try {
      // Actualizar solo el nombre de usuario
      await api.updateUsuario(user?.cedula_usuario, { 
        usuario: newUsername,
        rol: user?.rol,
        estatus: user?.estatus
      });
      
      // Actualizar el usuario en el estado local
      const updatedUser = await getUsuarioPorCedula(user.cedula_usuario);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
      }
      
      Swal.fire({
        title: "¡Éxito!",
        text: "Nombre de usuario actualizado correctamente",
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
      
    } catch (error) {
      console.error('Error al cambiar usuario:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cambiar el nombre de usuario",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
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
                <div class="mr-2 text-indigo-600">👤</div>
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
                <div class="mr-2 text-indigo-600">✓</div>
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
                <div class="mr-2 text-indigo-600">🏪</div>
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
  // Editar datos personales - VERSIÓN CORREGIDA CON API PERSONA
const handleEditarDatosPersonales = async () => {
  const { value: formValues } = await Swal.fire({
    title: "Editar Datos Personales",
    html: `
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
            <input 
              id="nombre" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.nombre_completo || ""}"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Edad *</label>
            <input 
              id="edad" 
              type="number" 
              min="18" 
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.edad || ""}"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input 
              id="telefono" 
              type="tel" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.telefono || ""}"
            >
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico *</label>
            <input 
              id="email" 
              type="email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.email || ""}"
              required
            >
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <input 
              id="direccion" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.direccion_actual || ""}"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <input 
              id="estado" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.estado || ""}"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Municipio</label>
            <input 
              id="municipio" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.municipio || ""}"
            >
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Persona *</label>
            <select 
              id="tipo_persona" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="Natural" ${user?.tipo_persona === 'Natural' ? 'selected' : ''}>Natural</option>
              <option value="Jurídica" ${user?.tipo_persona === 'Jurídica' ? 'selected' : ''}>Jurídica</option>
              <option value="Emprendedor" ${user?.tipo_persona === 'Emprendedor' ? 'selected' : ''}>Emprendedor</option>
            </select>
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
      const tipo_persona = document.getElementById("tipo_persona").value;

      // Validaciones
      if (!nombre) {
        Swal.showValidationMessage("El nombre completo es obligatorio");
        return false;
      }
      if (!edad || edad < 18 || edad > 100) {
        Swal.showValidationMessage("La edad debe estar entre 18 y 100 años");
        return false;
      }
      if (!email) {
        Swal.showValidationMessage("El correo electrónico es obligatorio");
        return false;
      }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        Swal.showValidationMessage("Por favor ingresa un email válido");
        return false;
      }
      if (!tipo_persona) {
        Swal.showValidationMessage("El tipo de persona es obligatorio");
        return false;
      }

      return { 
        nombre_completo: nombre, 
        edad: parseInt(edad), 
        telefono, 
        email, 
        direccion_actual: direccion, 
        estado, 
        municipio,
        tipo_persona 
      };
    },
  });
  
  if (formValues) {
    try {
      // Importar la API de persona (asegúrate de tener esta importación al inicio del archivo)
      // import personaApi from '../services/api_persona';
      
      // Usar la API específica para actualizar persona
      await personaApi.updatePersona(user?.cedula_usuario, formValues);
      
      // Actualizar el usuario en el estado local
      const updatedUser = await getUsuarioPorCedula(user.cedula_usuario);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
      }
      
      Swal.fire({
        title: "¡Éxito!",
        text: "Datos personales actualizados correctamente",
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
      
    } catch (error) {
      console.error('Error al actualizar datos personales:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron actualizar los datos personales",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  }
};

  // Editar emprendimiento
  // Editar emprendimiento - VERSIÓN CORREGIDA CON API EMPRENDIMIENTOS
const handleEditarEmprendimiento = async () => {
  const { value: formValues } = await Swal.fire({
    title: "Editar Emprendimiento",
    html: `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Emprendimiento *</label>
          <input 
            id="nombre_emprendimiento" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            value="${user?.nombre_emprendimiento || ""}"
            placeholder="Ingresa el nombre de tu emprendimiento"
            required
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Sector *</label>
            <select 
              id="tipo_sector" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Selecciona un sector</option>
              <option value="Comercio" ${user?.tipo_sector === 'Comercio' ? 'selected' : ''}>Comercio</option>
              <option value="Servicios" ${user?.tipo_sector === 'Servicios' ? 'selected' : ''}>Servicios</option>
              <option value="Producción" ${user?.tipo_sector === 'Producción' ? 'selected' : ''}>Producción</option>
              <option value="Agroindustria" ${user?.tipo_sector === 'Agroindustria' ? 'selected' : ''}>Agroindustria</option>
              <option value="Tecnología" ${user?.tipo_sector === 'Tecnología' ? 'selected' : ''}>Tecnología</option>
              <option value="Artesanía" ${user?.tipo_sector === 'Artesanía' ? 'selected' : ''}>Artesanía</option>
              <option value="Turismo" ${user?.tipo_sector === 'Turismo' ? 'selected' : ''}>Turismo</option>
              <option value="Otro" ${user?.tipo_sector === 'Otro' ? 'selected' : ''}>Otro</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Negocio *</label>
            <select 
              id="tipo_negocio" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="Microempresa" ${user?.tipo_negocio === 'Microempresa' ? 'selected' : ''}>Microempresa</option>
              <option value="Pequeña Empresa" ${user?.tipo_negocio === 'Pequeña Empresa' ? 'selected' : ''}>Pequeña Empresa</option>
              <option value="Emprendimiento Individual" ${user?.tipo_negocio === 'Emprendimiento Individual' ? 'selected' : ''}>Emprendimiento Individual</option>
              <option value="Cooperativa" ${user?.tipo_negocio === 'Cooperativa' ? 'selected' : ''}>Cooperativa</option>
              <option value="Asociación" ${user?.tipo_negocio === 'Asociación' ? 'selected' : ''}>Asociación</option>
              <option value="Otro" ${user?.tipo_negocio === 'Otro' ? 'selected' : ''}>Otro</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Consejo Comunal *</label>
            <input 
              id="consejo_nombre" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.consejo_nombre || ""}"
              placeholder="Nombre del consejo comunal"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Comuna *</label>
            <input 
              id="comuna" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value="${user?.comuna || ""}"
              placeholder="Nombre de la comuna"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Dirección del Emprendimiento *</label>
          <input 
            id="direccion_emprendimiento" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            value="${user?.direccion_emprendimiento || ""}"
            placeholder="Dirección completa del emprendimiento"
            required
          />
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Guardar Cambios",
    preConfirm: () => {
      const nombre_emprendimiento = document.getElementById("nombre_emprendimiento").value.trim();
      const tipo_sector = document.getElementById("tipo_sector").value;
      const tipo_negocio = document.getElementById("tipo_negocio").value;
      const consejo_nombre = document.getElementById("consejo_nombre").value.trim();
      const comuna = document.getElementById("comuna").value.trim();
      const direccion_emprendimiento = document.getElementById("direccion_emprendimiento").value.trim();

      // Validaciones
      if (!nombre_emprendimiento) {
        Swal.showValidationMessage("El nombre del emprendimiento es obligatorio");
        return false;
      }
      if (!tipo_sector) {
        Swal.showValidationMessage("El tipo de sector es obligatorio");
        return false;
      }
      if (!tipo_negocio) {
        Swal.showValidationMessage("El tipo de negocio es obligatorio");
        return false;
      }
      if (!consejo_nombre) {
        Swal.showValidationMessage("El consejo comunal es obligatorio");
        return false;
      }
      if (!comuna) {
        Swal.showValidationMessage("La comuna es obligatoria");
        return false;
      }
      if (!direccion_emprendimiento) {
        Swal.showValidationMessage("La dirección del emprendimiento es obligatoria");
        return false;
      }

      return { 
        nombre_emprendimiento, 
        tipo_sector, 
        tipo_negocio, 
        consejo_nombre, 
        comuna, 
        direccion_emprendimiento 
      };
    },
  });
  
  if (formValues) {
    try {
      // Importar la API de emprendimientos (asegúrate de tener esta importación al inicio del archivo)
      // import emprendimientoApi from '../services/api_emprendimientos';
      
      // Usar la API específica para actualizar emprendimiento
      await emprendimientoApi.updateEmprendimiento(user?.cedula_usuario, formValues);
      
      // Actualizar el usuario en el estado local
      const updatedUser = await getUsuarioPorCedula(user.cedula_usuario);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
      }
      
      Swal.fire({
        title: "¡Éxito!",
        text: "Emprendimiento actualizado correctamente",
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
      
    } catch (error) {
      console.error('Error al actualizar emprendimiento:', error);
      const errorMessage = error.response?.data?.error || "No se pudo actualizar el emprendimiento";
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
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
            {menuOpen ? <TbX size={24} /> : <TbMenu2 size={24} />}
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

        {/* Notificaciones y perfil */}
        <div className="flex items-center space-x-3">
          {/* Indicador de conexión */}
          <div className="hidden md:flex items-center mr-2">
            <TbCircle size={12} className={`mr-2 ${onlineStatus ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-xs text-white">{onlineStatus ? 'En línea' : 'Sin conexión'}</span>
          </div>

          {/* Accesos directos */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Dashboard"
            >
              <TbHome size={20} />
            </button>
          </div>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-white hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Notificaciones"
            >
              <TbBell size={22} />
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
                          <div className={`mr-3 mt-1 ${notification.read ? 'text-gray-300' : 'text-blue-500'}`}>
                            <TbCircle size={8} fill={notification.read ? 'currentColor' : 'currentColor'} />
                          </div>
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
                <TbUser size={20} className="text-indigo-600" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium truncate max-w-xs">
                  {user?.nombre_completo || "Usuario"}
                </p>
                <p className="text-xs text-indigo-500 capitalize">
                  {user?.rol || "Rol no asignado"}
                </p>
              </div>
              <TbChevronDown size={18} className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <TbUser size={24} className="text-indigo-600" />
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
                  usuarioLogueado={usuarioLogueado}
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