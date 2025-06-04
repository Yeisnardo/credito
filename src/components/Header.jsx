import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/imagenes/logo_header.jpg";
import "../assets/css/style.css";

const Header = ({ toggleMenu, menuOpen, user, setUser }) => {
  const navigate = useNavigate();

  // Estados para gestionar menús y perfil
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOnline, setProfileOnline] = useState(true);

  // Funciones para togglear menús
  const handleToggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);
  const handleToggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  // Cerrar sesión con confirmación
  const handleCerrarSesion = () => {
    Swal.fire({
      title: "¿Estás seguro que quieres cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("¡Sesión cerrada!", "", "success");
        setProfileMenuOpen(false);
        navigate("/");
      }
    });
  };

  // Función para abrir configuración (cambiar contraseña o usuario)
  const handleAbrirConfiguracion = async () => {
    const { value } = await Swal.fire({
      title: '¿Qué deseas cambiar?',
      input: 'radio',
      inputOptions: {
        password: 'Contraseña',
        user: 'Usuario',
      },
      inputValidator: (value) => {
        if (!value) return 'Por favor, selecciona una opción';
      },
      showCancelButton: true,
    });

    if (value === 'password') {
      await handleCambiarContraseña();
    } else if (value === 'user') {
      await handleCambiarUsuario();
    }
  };

  // Función para cambiar contraseña
  const handleCambiarContraseña = async () => {
    const { value } = await Swal.fire({
      title: 'Cambiar Contraseña',
      html: `
        <input id="password" type="password" placeholder="Nueva Contraseña" class="swal2-input"/>
        <input id="repeatPassword" type="password" placeholder="Repetir Contraseña" class="swal2-input"/>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const pass = document.getElementById('password').value.trim();
        const repeatPass = document.getElementById('repeatPassword').value.trim();

        if (!pass || !repeatPass) {
          Swal.showValidationMessage('Por favor, completa todos los campos');
          return false;
        }
        if (pass.length < 6) {
          Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
          return false;
        }
        if (pass !== repeatPass) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return false;
        }
        return { pass };
      },
    });
    if (value) {
      Swal.fire('Éxito', 'Su contraseña ha sido actualizada', 'success');
    }
  };

  // Función para cambiar usuario
  const handleCambiarUsuario = async () => {
    const { value } = await Swal.fire({
      title: 'Cambiar Usuario',
      html: `
        <input id="usuario" type="text" placeholder="Nuevo Usuario" class="swal2-input"/>
        <input id="repeatUsuario" type="text" placeholder="Repetir Usuario" class="swal2-input"/>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const userVal = document.getElementById('usuario').value.trim();
        const repeatUser = document.getElementById('repeatUsuario').value.trim();

        if (!userVal || !repeatUser) {
          Swal.showValidationMessage('Por favor, completa todos los campos');
          return false;
        }
        if (userVal.length < 6) {
          Swal.showValidationMessage('El usuario debe tener al menos 6 caracteres');
          return false;
        }
        if (userVal !== repeatUser) {
          Swal.showValidationMessage('Los usuarios no coinciden');
          return false;
        }
        return { user: userVal };
      },
    });
    if (value) {
      Swal.fire('Éxito', 'Su usuario ha sido actualizado', 'success');
    }
  };

  // Ver perfil completo
  const handleVerPerfil = () => {
    Swal.fire({
      title: 'Perfil de Usuario',
      html: `
        <div class="flex flex-col items-center mb-3">
          <img src="../public/OIP.jpeg" alt="Perfil" class="w-24 h-24 rounded-full border-4 border-green-500 mb-3"/>
          <h3 class="text-lg font-semibold text-gray-700">${user?.nombre}</h3>
          <p class="text-sm text-gray-500">Rol: ${user?.rol || 'Rol'}</p>
        </div>
        <div class="border-t border-gray-300 pt-2 mb-2">
          <h4 class="font-semibold mb-1">Datos Personales</h4>
          <p><strong>Email:</strong> ${user?.email || 'correo@ejemplo.com'}</p>
          <p><strong>Teléfono:</strong> ${user?.telefono || 'N/A'}</p>
          <p><strong>Dirección:</strong> ${user?.direccion || 'N/A'}</p>
        </div>
        <div class="border-t border-gray-300 pt-2 mb-2">
          <h4 class="font-semibold mb-1">Emprendimiento</h4>
          <p>${user?.emprendimiento || 'No especificado'}</p>
        </div>
        <div class="border-t border-gray-300 pt-2 mb-2">
          <h4 class="font-semibold mb-1">Consejo Comunale</h4>
          <p>${user?.consejoComunale || 'No especificado'}</p>
        </div>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Cerrar',
    });
  };

  // Funciones para editar secciones específicas
  const handleEditarDatosPersonales = async () => {
    const { value } = await Swal.fire({
      title: 'Editar Datos Personales',
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre" value="${user?.nombre || ''}"/>
        <input id="email" type="email" class="swal2-input" placeholder="Correo" value="${user?.email || ''}"/>
        <input id="telefono" class="swal2-input" placeholder="Teléfono" value="${user?.telefono || ''}"/>
        <input id="direccion" class="swal2-input" placeholder="Dirección" value="${user?.direccion || ''}"/>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const direccion = document.getElementById('direccion').value.trim();

        if (!nombre || !email) {
          Swal.showValidationMessage('Nombre y correo son obligatorios');
          return false;
        }
        return { nombre, email, telefono, direccion };
      },
    });
    if (value) {
      setUser({ ...user, ...value });
      Swal.fire('Actualizado', 'Datos personales actualizados', 'success');
    }
  };

  const handleEditarEmprendimiento = async () => {
    const { value } = await Swal.fire({
      title: 'Editar Emprendimiento',
      html: `<input id="emprendimiento" class="swal2-input" placeholder="Emprendimiento" value="${user?.emprendimiento || ''}"/>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const emprendimiento = document.getElementById('emprendimiento').value.trim();
        if (!emprendimiento) {
          Swal.showValidationMessage('Este campo no puede estar vacío');
          return false;
        }
        return { emprendimiento };
      },
    });
    if (value) {
      setUser({ ...user, ...value });
      Swal.fire('Actualizado', 'Emprendimiento actualizado', 'success');
    }
  };

  const handleEditarConsejo = async () => {
    const { value } = await Swal.fire({
      title: 'Editar Consejo Comunale',
      html: `<input id="consejo" class="swal2-input" placeholder="Consejo" value="${user?.consejoComunale || ''}"/>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const consejo = document.getElementById('consejo').value.trim();
        if (!consejo) {
          Swal.showValidationMessage('Este campo no puede estar vacío');
          return false;
        }
        return { consejo };
      },
    });
    if (value) {
      setUser({ ...user, ...value });
      Swal.fire('Actualizado', 'Consejo Comunale actualizado', 'success');
    }
  };

  return (
    <header className="w-full fixed top-0 left-0 bg-gray-800 p-4 shadow-md z-50 flex items-center justify-between">
      {/* Logo y título */}
      <div className="flex items-center mx-4">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover mr-3" />
        <h1 className="text-xl font-bold text-white hidden sm:inline">IFEMI</h1>
      </div>

      {/* Botón de menú en móviles */}
      <button
        onClick={toggleMenu}
        className="text-white focus:outline-none md:hidden mr-4"
        aria-label="Toggle menu"
      >
        <i className={`bx ${menuOpen ? "bxs-x" : "bx-menu"}`} style={{ fontSize: "24px" }}></i>
      </button>

      {/* Navegación */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Ejemplo botones de navegación */}
        <button
          className="flex items-center text-white px-3 py-1 rounded hover:bg-gray-700 transition"
          onClick={() => alert("Ir a Caracterización")}
          title="Caracterización"
        >
          <i className="bx bx-user-circle mr-2"></i>
          <span className="hidden sm:inline">Caracterización</span>
        </button>
        <button
          className="flex items-center text-white px-3 py-1 rounded hover:bg-gray-700 transition"
          onClick={() => alert("Ir a Emprendimiento")}
          title="Emprendimiento"
        >
          <i className="bx bx-rocket mr-2"></i>
          <span className="hidden sm:inline">Emprendimiento</span>
        </button>
        <button
  className="flex items-center text-white px-3 py-1 rounded hover:bg-gray-700 transition"
  onClick={() => navigate('/Credito')} // aquí haces la navegación
  title="Crédito"
>
  <i className="bx bx-credit-card mr-2"></i>
  <span className="hidden sm:inline">Crédito</span>
</button>
      </div>

      {/* Perfil y notificaciones */}
      <div className="flex items-center space-x-4 ml-4 relative">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="text-white focus:outline-none"
            aria-label="Notificaciones"
          >
            <i className="bx bxs-bell" style={{ fontSize: "24px" }}></i>
            <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 animate-fadeInDown">
              {/* Contenido notificaciones */}
            </div>
          )}
        </div>

        {/* Perfil */}
        <div className="relative">
          <button
            onClick={handleToggleProfileMenu}
            className="text-white focus:outline-none flex items-center px-3 py-2 rounded hover:bg-gray-700 transition"
            aria-label="Perfil"
          >
            <i className="bx bxs-user" style={{ fontSize: "24px" }}></i>
            <span className="hidden sm:inline ml-2">{user?.usuario || "Usuario"}</span>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50 animate-fadeInDown">
              {/* Opciones del perfil */}
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex items-center"
                onClick={() => {
                  handleAbrirConfiguracion();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-cog mr-2"></i> Configuraciones
              </button>
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex items-center"
                onClick={() => {
                  handleVerPerfil();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-user-circle mr-2"></i> Ver Perfil
              </button>
              {/* Edición de secciones */}
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex items-center"
                onClick={() => {
                  handleEditarDatosPersonales();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-user mr-2"></i> Datos Personales
              </button>
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex items-center"
                onClick={() => {
                  handleEditarEmprendimiento();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-rocket mr-2"></i> Emprendimiento
              </button>
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex items-center"
                onClick={() => {
                  handleEditarConsejo();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-phone mr-2"></i> Consejo Comunale
              </button>
              {/* Cerrar sesión */}
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex items-center"
                onClick={handleCerrarSesion}
              >
                <i className="bx bx-log-out mr-2"></i> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Perfil en línea estilo WhatsApp (opcional) */}
      {profileOnline && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg z-50 p-4 animate-fadeInUp">
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={() => {
              // Función para editar perfil en línea (a definir)
            }}
          >
            Editar Perfil
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;