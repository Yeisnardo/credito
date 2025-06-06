import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/imagenes/logo_header.jpg";
import "../assets/css/style.css";

const Header = ({ toggleMenu, menuOpen, user, setUser  }) => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Funciones para manejar estados
  const handleToggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);
  const handleToggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  // Función para cerrar sesión
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

  // Función para abrir configuración
  const handleAbrirConfiguracion = async () => {
    const { value } = await Swal.fire({
      title: "¿Qué deseas cambiar?",
      input: "radio",
      inputOptions: {
        password: "Contraseña",
        user: "Usuario",
      },
      inputValidator: (value) => {
        if (!value) return "Por favor, selecciona una opción";
      },
      showCancelButton: true,
    });

    if (value === "password") {
      await handleCambiarContraseña();
    } else if (value === "user") {
      await handleCambiarUsuario();
    }
  };

  const handleCambiarContraseña = async () => {
    const { value } = await Swal.fire({
      title: "Cambiar Contraseña",
      html: `
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
      <input id="password" type="password" placeholder="Nueva Contraseña" class="swal2-input"/>
      <label for="repeatPassword" class="block text-sm font-medium text-gray-700 mb-1">Repetir Contraseña</label>
      <input id="repeatPassword" type="password" placeholder="Repetir Contraseña" class="swal2-input"/>
    `,
      focusConfirm: false,
      showCancelButton: true,
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
    if (value) {
      Swal.fire("Éxito", "Su contraseña ha sido actualizada", "success");
    }
  };

  const handleCambiarUsuario = async () => {
    const { value } = await Swal.fire({
      title: "Cambiar Usuario",
      html: `
      <label for="usuario" class="block text-sm font-medium text-gray-700 mb-1">Nuevo Usuario</label>
      <input id="usuario" type="text" placeholder="Nuevo Usuario" class="swal2-input"/>
      <label for="repeatUsuario" class="block text-sm font-medium text-gray-700 mb-1">Repetir Usuario</label>
      <input id="repeatUsuario" type="text" placeholder="Repetir Usuario" class="swal2-input"/>
    `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const userVal = document.getElementById("usuario").value.trim();
        const repeatUser  = document.getElementById("repeatUsuario").value.trim();

        if (!userVal || !repeatUser ) {
          Swal.showValidationMessage("Por favor, completa todos los campos");
          return false;
        }
        if (userVal.length < 6) {
          Swal.showValidationMessage("El usuario debe tener al menos 6 caracteres");
          return false;
        }
        if (userVal !== repeatUser ) {
          Swal.showValidationMessage("Los usuarios no coinciden");
          return false;
        }
        return { user: userVal };
      },
    });
    if (value) {
      Swal.fire("Éxito", "Su usuario ha sido actualizado", "success");
    }
  };

  const handleVerPerfil = () => {
    Swal.fire({
      title: "Perfil de Usuario",
      html: `
      <div class="flex flex-col items-center mb-4">
        <img src="../public/OIP.jpeg" alt="Perfil" class="w-24 h-24 rounded-full border-4 border-green-500 mb-3"/>
        <h3 class="text-lg font-semibold text-gray-700">${user?.nombre || "Nombre"}</h3>
        <p class="text-sm text-gray-500">Rol: ${user?.rol || "Rol"}</p>
      </div>
      <div class="border-t border-gray-300 pt-2 mb-2 px-4">
        <h4 class="font-semibold mb-1">Datos Personales</h4>
        <p><strong>Email:</strong> ${user?.email || "correo@ejemplo.com"}</p>
        <p><strong>Teléfono:</strong> ${user?.telefono || "N/A"}</p>
        <p><strong>Dirección:</strong> ${user?.direccion || "N/A"}</p>
        <p><strong>Tipo de Carnet:</strong> ${user?.tipoCarnet || "No especificado"}</p>
      </div>
      <div class="border-t border-gray-300 pt-2 mb-2 px-4">
        <h4 class="font-semibold mb-1">Emprendimiento</h4>
        <p>${user?.emprendimiento || "No especificado"}</p>
      </div>
      <div class="border-t border-gray-300 pt-2 mb-2 px-4">
        <h4 class="font-semibold mb-1">Consejo Comunale</h4>
        <p>${user?.consejoComunale || "No especificado"}</p>
      </div>
    `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: "Cerrar",
    });
  };

  const handleEditarDatosPersonales = async () => {
    const { value } = await Swal.fire({
      title: "Editar Datos Personales",
      html: `
      <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
      <input id="nombre" class="swal2-input" placeholder="Nombre Completo" value="${user?.nombre || ""}"/>
      <label for="edad" class="block text-sm font-medium text-gray-700 mb-1">Edad</label>
      <input id="edad" type="number" class="swal2-input" placeholder="Edad" value="${user?.edad || ""}"/>
      <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
      <input id="telefono" class="swal2-input" placeholder="Teléfono" value="${user?.telefono || ""}"/>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo</label>
      <input id="email" type="email" class="swal2-input" placeholder="Correo" value="${user?.email || ""}"/>
      <label for="direccion" class="block text-sm font-medium text-gray-700 mb-1">Dirección Actual</label>
      <input id="direccion" class="swal2-input" placeholder="Dirección" value="${user?.direccion_actual || ""}"/>
      <label for="estado" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
      <input id="estado" class="swal2-input" placeholder="Estado" value="${user?.estado || ""}"/>
      <label for="municipio" class="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
      <input id="municipio" class="swal2-input" placeholder="Municipio" value="${user?.municipio || ""}"/>
      <label for="tipo_persona" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Persona</label>
      <input id="tipo_persona" class="swal2-input" placeholder="Tipo de Persona" value="${user?.tipo_persona || ""}"/>
    `,
      focusConfirm: false,
      showCancelButton: true,
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
          Swal.showValidationMessage("Nombre, edad y correo son obligatorios");
          return false;
        }
        return { nombre, edad, telefono, email, direccion, estado, municipio, tipo_persona };
      },
    });
    if (value) {
      setUser ((prev) => ({ ...prev, ...value }));
      Swal.fire("Actualizado", "Datos personales actualizados", "success");
    }
  };

  const handleEditarEmprendimiento = async () => {
    const { value } = await Swal.fire({
      title: "Editar Emprendimiento",
      html: `
        <label for="emprendimiento" class="block text-sm font-medium text-gray-700 mb-1">Nombre del Emprendimiento</label>
        <input id="emprendimiento" class="swal2-input" placeholder="Emprendimiento" value="${user?.emprendimiento || ""}"/>
        <label for="tipo_sector" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Sector</label>
        <input id="tipo_sector" class="swal2-input" placeholder="Tipo de Sector" value="${user?.tipo_sector || ""}"/>
        <label for="tipo_negocio" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Negocio</label>
        <input id="tipo_negocio" class="swal2-input" placeholder="Tipo de Negocio" value="${user?.tipo_negocio || ""}"/>
        <label for="direccion_emprendimiento" class="block text-sm font-medium text-gray-700 mb-1">Dirección del Emprendimiento</label>
        <input id="direccion_emprendimiento" class="swal2-input" placeholder="Dirección" value="${user?.direccion_emprendimiento || ""}"/>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const emprendimiento = document.getElementById("emprendimiento").value.trim();
        const tipo_sector = document.getElementById("tipo_sector").value.trim();
        const tipo_negocio = document.getElementById("tipo_negocio").value.trim();
        const direccion_emprendimiento = document.getElementById("direccion_emprendimiento").value.trim();

        if (!emprendimiento || !tipo_sector || !tipo_negocio) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }
        return { emprendimiento, tipo_sector, tipo_negocio, direccion_emprendimiento };
      },
    });
    if (value) {
      setUser ((prev) => ({ ...prev, ...value }));
      Swal.fire("Actualizado", "Emprendimiento actualizado", "success");
    }
  };

  const handleEditarConsejo = async () => {
    const { value } = await Swal.fire({
      title: "Editar Consejo Comunale",
      html: `
        <label for="consejo" class="block text-sm font-medium text-gray-700 mb-1">Consejo</label>
        <input id="consejo" class="swal2-input" placeholder="Consejo" value="${user?.consejoComunale || ""}"/>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const consejo = document.getElementById("consejo").value.trim();
        if (!consejo) {
          Swal.showValidationMessage("Este campo no puede estar vacío");
          return false;
        }
        return { consejo };
      },
    });
    if (value) {
      setUser ((prev) => ({ ...prev, ...value }));
      Swal.fire("Actualizado", "Consejo Comunale actualizado", "success");
    }
  };

  return (
    <header className="w-full fixed top-0 left-0 bg-gray-900 shadow-lg z-50 px-4 py-3 flex items-center justify-between">
      {/* Logo y título */}
      <div className="flex items-center space-x-3">
        <img
          src={logo}
          alt="Logo"
          className="w-12 h-12 rounded-full object-cover"
        />
        <h1 className="text-xl font-bold text-white hidden sm:inline">IFEMI</h1>
      </div>

      {/* Botón de menú en móviles */}
      <button
        onClick={toggleMenu}
        className="text-white focus:outline-none md:hidden"
        aria-label="Toggle menu"
      >
        <i
          className={`bx ${menuOpen ? "bxs-x" : "bx-menu"}`}
          style={{ fontSize: "24px" }}
        ></i>
      </button>

      {/* Navegación en pantallas grandes */}
      <nav className="hidden md:flex space-x-4 items-center">
        <button
          className="flex items-center px-3 py-2 rounded text-white hover:bg-gray-700 transition"
          onClick={() => navigate("/Credito")}
          title="Crédito"
        >
          <i className="bx bx-credit-card mr-2"></i>
          <span className="hidden sm:inline">Solicitud de Credito</span>
        </button>
      </nav>

      {/* Notificaciones y perfil */}
      <div className="flex items-center space-x-4 relative ml-4">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="text-white focus:outline-none relative"
            aria-label="Notificaciones"
          >
            <i className="bx bxs-bell" style={{ fontSize: "24px" }}></i>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 p-2 animate-fadeInDown">
              {/* Contenido notificaciones */}
            </div>
          )}
        </div>

        {/* Perfil */}
        <div className="relative">
          <button
            onClick={handleToggleProfileMenu}
            className="flex items-center px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 transition text-white"
            aria-label="Perfil"
          >
            <i className="bx bxs-user" style={{ fontSize: "24px" }}></i>
            <span className="ml-2 hidden sm:inline">
              {user?.nombre || "Usuario"}
            </span>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg z-50 divide-y divide-gray-200">
              {/* Botón crédito en pantallas pequeñas dentro del menú perfil */}
              <div className="block md:hidden px-4 py-2 border-b border-gray-200">
                <button
                  className="flex items-center w-full px-2 py-2 rounded hover:bg-gray-100"
                  onClick={() => {
                    navigate("/Credito");
                    setProfileMenuOpen(false);
                  }}
                >
                  <i className="bx bx-credit-card mr-2"></i> Solicitud de Credito
                </button>
              </div>

              {/* Opciones del perfil en pantallas grandes y pequeñas */}
              <button
                className="w-full px-4 py-2 flex items-center hover:bg-gray-100"
                onClick={() => {
                  handleAbrirConfiguracion();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-cog mr-2"></i> Configuración
              </button>
              <button
                className="w-full px-4 py-2 flex items-center hover:bg-gray-100"
                onClick={() => {
                  handleVerPerfil();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-user-circle mr-2"></i> Ver Perfil
              </button>
              {/* Ediciones */}
              <button
                className="w-full px-4 py-2 flex items-center hover:bg-gray-100"
                onClick={() => {
                  handleEditarDatosPersonales();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-user mr-2"></i> Datos Personales
              </button>
              <button
                className="w-full px-4 py-2 flex items-center hover:bg-gray-100"
                onClick={() => {
                  handleEditarEmprendimiento();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-rocket mr-2"></i> Emprendimiento
              </button>
              <button
                className=" w-full px-4 py-2 flex items-center hover:bg-gray-100"
                onClick={() => {
                  handleEditarConsejo();
                  setProfileMenuOpen(false);
                }}
              >
                <i className="bx bx-phone mr-2"></i> Consejo Comunale
              </button>
              {/* Cerrar sesión */}
              <button
                className="w-full px-4 py-2 flex items-center hover:bg-gray-100"
                onClick={handleCerrarSesion}
              >
                <i className="bx bx-log-out mr-2"></i> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
