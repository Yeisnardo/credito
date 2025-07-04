import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api, { getUsuarioPorCedula } from '../services/api_usuario'; // ajusta la ruta
import logo from '../assets/imagenes/logo_header.jpg';

const Header = ({ toggleMenu, menuOpen }) => {
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Cargar usuario en localStorage o desde API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem('cedula_usuario');
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUser(usuario);
          }
        }
      } catch (error) {
        console.error('Error al obtener usuario por cédula:', error);
      }
    };
    fetchUserData();
  }, []);

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
        localStorage.removeItem('cedula_usuario'); // limpia localStorage
        navigate('/'); // redirige a Login
      }
    });
  };

  // Función para abrir configuración (cambiar password/usuario)
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
    if (value === "password") await handleCambiarContraseña();
    if (value === "user") await handleCambiarUsuario();
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
      await api.put(`/api/usuarios/${user?.cedula_usuario}`, { password: value.pass });
      Swal.fire("¡Éxito!", "Su contraseña ha sido actualizada", "success");
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
      await api.put(`/api/usuarios/${user?.cedula_usuario}`, { usuario: value.user });
      Swal.fire("¡Éxito!", "Su usuario ha sido actualizado", "success");
    }
  };

  const handleVerPerfil = () => {
  Swal.fire({
    title: "Perfil de Usuario",
    html: `
      <div class="flex justify-start items-center">
        <div class="w-auto bg-gray-50 rounded-lg p-4 font-sans text-gray-800 flex flex-col md:flex-row gap-3 max-w-3xl mx-4">
          <!-- Sección derecha -->
          <div class="md:w-2/3 flex flex-col space-y-4">
            <!-- Datos Personales -->
            <div class="bg-white rounded-lg p-4 justify-center items-center">
              <h4 class="text-lg font-semibold mb-2 text-gray-700">Datos Personales</h4>
              <div class="text-sm text-gray-700 space-y-1">
                <p><span class="font-semibold">Email:</span> ${user?.email || "correo@ejemplo.com"}</p>
                <p><span class="font-semibold">Teléfono:</span> ${user?.telefono || "N/A"}</p>
                <p><span class="font-semibold">Dirección:</span> ${user?.direccion_actual || "N/A"}</p>
                <p><span class="font-semibold">Estado:</span> ${user?.estado || "N/A"}</p>
                <p><span class="font-semibold">Municipio:</span> ${user?.municipio || "N/A"}</p>
              </div>
            </div>
            <!-- Emprendimiento -->
            <div class="bg-white rounded-lg p-4 justify-center items-center">
              <h4 class="text-lg font-semibold mb-2 text-gray-700">Emprendimiento</h4>
              <div class="text-sm text-gray-700 space-y-1">
                <p><span class="font-semibold">Nombre:</span> ${user?.nombre_emprendimiento || "No especificado"}</p>
                <p><span class="font-semibold">Consejo:</span> ${user?.consejo_nombre || "No especificado"}</p>
                <p><span class="font-semibold">Comuna:</span> ${user?.comuna || "No especificado"}</p>
                <p><span class="font-semibold">Dirección Emprendimiento:</span> ${user?.direccion_emprendimiento || "No especificado"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    showCloseButton: true,
    focusConfirm: false,
    confirmButtonText: "Cerrar",
    customClass: {
      popup: "rounded-lg p-4",
    },
  });
};

  // Funciones para editar datos
  const handleEditarDatosPersonales = async () => {
    const { value } = await Swal.fire({
      title: "Editar Datos Personales",
      html: `
      <form class="w-full max-w-3xl mx-auto p-4 space-y-4">
        <div class="flex flex-wrap gap-9">
          <div class="flex-1 min-w-[300px] w-0">
            <label for="nombre" class="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input id="nombre" type="text" class="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300" value="${user?.nombre || ""}">
          </div>
          <div class="flex-1 min-w-[150px] w-0">
            <label for="edad" class="block text-xs font-medium text-gray-700 mb-1">Edad</label>
            <input id="edad" type="number" class="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300" value="${user?.edad || ""}">
          </div>
          <div class="flex-1 min-w-[150px] w-0">
            <label for="telefono" class="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
            <input id="telefono" type="text" class="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300" value="${user?.telefono || ""}">
          </div>
        </div>
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[150px] w-0">
            <label for="email" class="block text-xs font-medium text-gray-700 mb-1">Correo</label>
            <input id="email" type="email" class="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300" value="${user?.email || ""}">
          </div>
          <div class="flex-1 min-w-[150px] w-0">
            <label for="direccion" class="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
            <input id="direccion" type="text" class="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300" value="${user?.direccion_actual || ""}">
          </div>
          <div class="flex-1 min-w-[150px] w-0">
            <label for="estado" class="block text-xs font-medium text-gray-700 mb-1">Estado</label>
            <input id="estado" type="text" class="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300" value="${user?.estado || ""}">
          </div>
        </div>
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[150px] w-0">
            <label for="municipio" class="block text-xs font-medium text-gray-700 mb-1">Municipio</label>
            <input id="municipio" type="text" class="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300" value="${user?.municipio || ""}">
          </div>
          <div class="flex-1 min-w-[150px] w-0">
            <label for="tipo_persona" class="block text-xs font-medium text-gray-700 mb-1">Tipo de Persona</label>
            <input id="tipo_persona" type="text" class="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300" value="${user?.tipo_persona || ""}">
          </div>
        </div>
      </form>
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
          Swal.showValidationMessage("Nombre, Edad y Email son obligatorios");
          return false;
        }
        return {
          nombre,
          edad,
          telefono,
          email,
          direccion,
          estado,
          municipio,
          tipo_persona,
        };
      },
    });

    if (value) {
      await updatePersona(value);
      // No actualizamos en el estado global, solo en la API
      Swal.fire("Actualizado", "Datos personales actualizados", "success");
    }
  };

  const updatePersona = async (data) => {
    try {
      await api.put(`/api/persona/${user?.cedula_usuario}`, data);
    } catch (error) {
      console.error("Error actualizando persona:", error);
    }
  };

  const handleEditarEmprendimiento = async () => {
    const { value } = await Swal.fire({
      title: "Editar Emprendimiento",
      html: `
      <label for="emprendimiento" class="block text-sm font-medium text-gray-700 mb-1">Nombre del Emprendimiento</label>
      <input id="emprendimiento" class="w-[300px] border rounded px-2 py-1" placeholder="Emprendimiento" value="${user?.nombre_emprendimiento || ""}"/>
      <label for="tipo_sector" class="block text-sm font-medium text-gray-700 mb-1 mt-2">Tipo de Sector</label>
      <input id="tipo_sector" class="w-[300px] border rounded px-2 py-1" placeholder="Tipo de Sector" value="${user?.tipo_sector || ""}"/>
      <label for="tipo_negocio" class="block text-sm font-medium text-gray-700 mb-1 mt-2">Tipo de Negocio</label>
      <input id="tipo_negocio" class="w-[300px] border rounded px-2 py-1" placeholder="Tipo de Negocio" value="${user?.tipo_negocio || ""}"/>
      <label for="direccion_emprendimiento" class="block text-sm font-medium text-gray-700 mb-1 mt-2">Dirección del Emprendimiento</label>
      <input id="direccion_emprendimiento" class="w-[300px] border rounded px-2 py-1" placeholder="Dirección" value="${user?.direccion_emprendimiento || ""}"/>
      <label for="direccion_emprendimiento" class="block text-sm font-medium text-gray-700 mb-1 mt-2">Consego Comunal</label>
      <input id="direccion_emprendimiento" class="w-[300px] border rounded px-2 py-1" placeholder="Dirección" value="${user?.consejo_nombre || ""}"/>
      <label for="direccion_emprendimiento" class="block text-sm font-medium text-gray-700 mb-1 mt-2">Comuna</label>
      <input id="direccion_emprendimiento" class="w-[300px] border rounded px-2 py-1" placeholder="Dirección" value="${user?.comuna || ""}"/>
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
        return {
          emprendimiento,
          tipo_sector,
          tipo_negocio,
          direccion_emprendimiento,
        };
      },
    });
    if (value) {
      await updateEmprendimiento(value);
      Swal.fire("Actualizado", "Emprendimiento actualizado", "success");
    }
  };

  const updateEmprendimiento = async (data) => {
    try {
      await api.put(`/api/emprendimientos/${user?.cedula_usuario}`, data);
    } catch (error) {
      console.error("Error actualizando emprendimiento:", error);
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
      await updateConsejo(value);
      Swal.fire("Actualizado", "Consejo Comunale actualizado", "success");
    }
  };

  const updateConsejo = async (data) => {
    try {
      await api.put(`/api/consejo/${user?.cedula_usuario}`, data);
    } catch (error) {
      console.error("Error actualizando consejo:", error);
    }
  };

  return (
    <header className="w-full mx-auto fixed top-0 left-0 bg-gray-900 shadow-lg z-50 px-4 py-3 flex items-center justify-between">
      {/* Logo y título */}
      <div className="flex items-center space-x-3">
        <img
          src={logo}
          alt="Logo"
          className="w-12 h-12 rounded-full object-cover shadow-md"
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

      {/* Notificaciones y perfil */}
      <div className="flex items-center space-x-4 relative ml-4">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="text-white focus:outline-none relative"
            aria-label="Notificaciones"
          >
            <div className="relative">
              <i className="bx bxs-bell" style={{ fontSize: "24px" }}></i>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50 p-4 animate-fadeInDown">
              <p className="text-gray-600 text-sm">No hay notificaciones</p>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-white"
            aria-label="Perfil"
          >
            <i className="bx bxs-user" style={{ fontSize: "24px" }}></i>
            <span className="ml-2 hidden sm:inline truncate">
              {user?.nombre || "Nombre"} - {user?.tipo_usuario || "Rol"}
            </span>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-50 divide-y divide-gray-200 overflow-hidden">
              <div className="flex flex-col">
                <button
                  className="px-4 py-2 flex items-center hover:bg-gray-100 transition"
                  onClick={() => {
                    handleAbrirConfiguracion();
                    setProfileMenuOpen(false);
                  }}
                >
                  <i className="bx bx-cog mr-2"></i> Configuración
                </button>
                <button
                  className="px-4 py-2 flex items-center hover:bg-gray-100 transition"
                  onClick={() => {
                    handleVerPerfil();
                    setProfileMenuOpen(false);
                  }}
                >
                  <i className="bx bx-user-circle mr-2"></i> Ver Perfil
                </button>
                <button
                  className="px-4 py-2 flex items-center hover:bg-gray-100 transition"
                  onClick={() => {
                    handleEditarDatosPersonales();
                    setProfileMenuOpen(false);
                  }}
                >
                  <i className="bx bx-user mr-2"></i> Datos Personales
                </button>
                <button
                  className="px-4 py-2 flex items-center hover:bg-gray-100 transition"
                  onClick={() => {
                    handleEditarEmprendimiento();
                    setProfileMenuOpen(false);
                  }}
                >
                  <i className="bx bx-rocket mr-2"></i> Emprendimiento
                </button>
                <button
                  className="px-4 py-2 flex items-center hover:bg-gray-100 transition"
                  onClick={() => {
                    handleEditarConsejo();
                    setProfileMenuOpen(false);
                  }}
                >
                  <i className="bx bx-phone mr-2"></i> Consejo Comunale
                </button>
                <button
                  className="px-4 py-2 flex items-center hover:bg-gray-100 transition text-red-600"
                  onClick={handleCerrarSesion}
                >
                  <i className="bx bx-log-out mr-2"></i> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;