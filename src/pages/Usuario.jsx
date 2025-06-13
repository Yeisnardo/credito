import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_usuario";

const Usuario = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarios = await api.getUsuarios();
        setData(Array.isArray(usuarios) ? usuarios : []);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar la lista de usuarios.",
          icon: "error",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
          backdrop: false,
        });
      }
    };
    fetchData();
  }, []);

  // Filtrado
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(
      (u) =>
        u.usuario.toLowerCase().includes(term) ||
        u.estatus.toLowerCase().includes(term) ||
        u.rol.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Funciones CRUD con Swal

  const handleCreateUser = async () => {
    const result = await Swal.fire({
      title: 'Agregar Nuevo Usuario',
      html: `
        <input id="cedula_usuario" class="swal2-input" placeholder="Cédula de Identidad" />
        <input id="nombre_completo" class="swal2-input" placeholder="Nombres y Apellidos" />
        <input id="usuario" class="swal2-input" placeholder="Nombre de Usuario" />
        <input id="clave" type="password" class="swal2-input" placeholder="Contraseña" />
        <select id="rol" class="swal2-input">
          <option value="">Selecciona un tipo de usuario</option>
          <option value="Administrador">Administrador</option>
          <option value="Credito y Cobranza 1">Admin. Credito y Cobranza</option>
          <option value="Credito y Cobranza 2">Asist. Credito y Cobranza</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const cedula_usuario = document.getElementById('cedula_usuario').value.trim();
        const nombre_completo = document.getElementById('nombre_completo').value.trim();
        const usuario = document.getElementById('usuario').value.trim();
        const clave = document.getElementById('clave').value.trim();
        const rol = document.getElementById('rol').value.trim();

        // Validación de cédula: solo números, entre 6 y 8 caracteres
        const cedulaRegex = /^\d{6,8}$/;
        if (!cedula_usuario) {
          Swal.showValidationMessage('Por favor, ingrese la cédula de identidad.');
          return false;
        }
        if (!cedulaRegex.test(cedula_usuario)) {
          Swal.showValidationMessage('La cédula debe tener solo números y entre 6 y 8 dígitos.');
          return false;
        }
        if (!nombre_completo) {
          Swal.showValidationMessage('Por favor, ingrese el nombre completo.');
          return false;
        }
        if (!usuario) {
          Swal.showValidationMessage('Por favor, ingrese el nombre de usuario.');
          return false;
        }
        if (clave.length < 6 || clave.length > 20) {
          Swal.showValidationMessage('La contraseña debe tener entre 6 y 20 caracteres.');
          return false;
        }
        if (!rol) {
          Swal.showValidationMessage('Por favor, seleccione un tipo de usuario.');
          return false;
        }
        return { cedula_usuario, nombre_completo, usuario, clave, rol };
      },
    });

    if (result.isConfirmed) {
      const nuevoUsuario = {
        cedula_usuario: result.value.cedula_usuario,
        nombre: result.value.nombre_completo,
        usuario: result.value.usuario,
        password: result.value.clave,
        rol: result.value.rol,
        estatus: "Activo",
      };
      try {
        const resultado = await api.createUsuario(nuevoUsuario);
        setData((prev) => [...prev, resultado]);
        Swal.fire({
          title: "¡Éxito!",
          text: "Usuario agregado correctamente.",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire("Error", "No se pudo agregar el usuario.", "error");
      }
    }
  };

  const handleEditUser = async (user) => {
    const result = await Swal.fire({
      title: 'Editar Usuario',
      html: `
        <input id="cedula_usuario" class="swal2-input" value="${user.cedula_usuario}" disabled />
        <input id="nombre_completo" class="swal2-input" placeholder="Nombres y Apellidos" value="${user.nombre}" />
        <input id="usuario" class="swal2-input" placeholder="Nombre de Usuario" value="${user.usuario}" />
        <input id="clave" type="password" class="swal2-input" placeholder="Dejar en blanco para mantener" />
        <select id="rol" class="swal2-input">
          <option value="">Selecciona un tipo de usuario</option>
          <option value="Administrador" ${user.rol === "Administrador" ? "selected" : ""}>Administrador</option>
          <option value="Credito y Cobranza 1" ${user.rol === "Credito y Cobranza 1" ? "selected" : ""}>Admin. Credito y Cobranza</option>
          <option value="Credito y Cobranza 2" ${user.rol === "Credito y Cobranza 2" ? "selected" : ""}>Asist. Credito y Cobranza</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const nombre_completo = document.getElementById('nombre_completo').value;
        const usuario = document.getElementById('usuario').value;
        const clave = document.getElementById('clave').value;
        const rol = document.getElementById('rol').value;
        if (!nombre_completo || !usuario || !rol) {
          Swal.showValidationMessage('Por favor, complete todos los campos');
          return false;
        }
        return { nombre_completo, usuario, clave, rol };
      },
    });
    if (result.isConfirmed) {
      const usuarioActualizado = {
        usuario: result.value.usuario,
        password: result.value.clave,
        rol: result.value.rol,
        nombre: result.value.nombre_completo,
      };
      try {
        await api.updateUsuario(user.cedula_usuario, usuarioActualizado);
        setData((prev) =>
          prev.map((u) =>
            u.cedula_usuario === user.cedula_usuario ? { ...u, ...usuarioActualizado } : u
          )
        );
        Swal.fire("¡Éxito!", "Usuario actualizado.", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo actualizar.", "error");
      }
    }
  };

  const handleDeleteUser = (cedula_usuario) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar al usuario ${cedula_usuario}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.deleteUsuario(cedula_usuario);
          setData((prev) => prev.filter((u) => u.cedula_usuario !== cedula_usuario));
          Swal.fire("Eliminado!", "El usuario fue eliminado.", "success");
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar.", "error");
        }
      }
    });
  };

  const handleToggleEstatus = async (user) => {
    const nuevoEstatus = user.estatus === 'Activo' ? 'Inactivo' : 'Activo';

    Swal.fire({
      title: `¿Deseas ${user.estatus === 'Activo' ? 'desactivar' : 'activar'} a este usuario?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: user.estatus === 'Activo' ? 'Desactivar' : 'Activar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.updateUsuarioEstatus(user.cedula_usuario, nuevoEstatus);
          setData((prev) =>
            prev.map((u) =>
              u.cedula_usuario === user.cedula_usuario ? { ...u, estatus: nuevoEstatus } : u
            )
          );
          Swal.fire('¡Actualizado!', `El usuario ahora está ${nuevoEstatus}.`, 'success');
        } catch (error) {
          Swal.fire('Error', 'No se pudo actualizar el estatus.', 'error');
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 transition-all duration-300 ease-in-out">
        <Header toggleMenu={toggleMenu} />

        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          {/* Encabezado y botón */}
          <div className="flex items-center justify-between mb-8 mt-10">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-tr from-indigo-500 to-blue-500 p-4 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <i className="bx bx-user text-3xl text-white"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-700">Gestión de Usuarios</h1>
            </div>
            <button
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 px-6 py-3 rounded-full shadow-lg text-white font-semibold flex items-center space-x-2 transition-transform hover:scale-105"
              onClick={handleCreateUser}
            >
              <i className="bx bx-plus text-xl"></i>
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Buscador */}
          <div className="mb-6 flex justify-center max-w-4xl mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full p-4 pl-12 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Tabla moderna */}
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white max-w-7xl mx-auto mb-12 transition-shadow duration-300 hover:shadow-xl">
            <table className="min-w-full divide-y divide-gray-200 rounded-xl">
              <thead className="bg-gray-100 rounded-t-xl">
                <tr>
                  {[
                    { label: "C.I", key: "cedula_usuario" },
                    { label: "Nombres y Apellidos", key: "nombre" },
                    { label: "Nombre de Usuario", key: "usuario" },
                    { label: "Tipo de Usuario", key: "rol" },
                    { label: "Estatus", key: "estatus" },
                    { label: "Acciones", key: "acciones" },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      className="px-4 py-3 cursor-pointer select-none text-gray-700 font-medium hover:bg-gray-200 transition"
                      // La lógica de ordenamiento la eliminamos
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{label}</span>
                        {/* Se elimina la indicación de orden */}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.cedula_usuario} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-gray-600">{item.cedula_usuario}</td>
                      <td className="px-4 py-3 text-gray-700">{item.nombre}</td>
                      <td className="px-4 py-3 text-gray-700">{item.usuario}</td>
                      <td className="px-4 py-3 text-gray-700">{item.tipo_usuario}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.estatus === "Activo"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.estatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex justify-center space-x-3">
                        <button
                          className="text-blue-500 hover:text-blue-700 transition-transform transform hover:scale-105"
                          onClick={() => handleEditUser(item)}
                          aria-label="Editar"
                        >
                          <i className="bx bx-edit-alt text-xl"></i>
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-105"
                          onClick={() => handleDeleteUser(item.cedula_usuario)}
                          aria-label="Eliminar"
                        >
                          <i className="bx bx-trash text-xl"></i>
                        </button>
                        <button
                          className={`px-4 py-2 rounded-full font-semibold transition transform hover:scale-105 ${
                            item.estatus === "Activo"
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                          onClick={() => handleToggleEstatus(item)}
                        >
                          {item.estatus === "Activo" ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-400 font-semibold">
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie de página */}
        <footer className="mt-auto p-6 bg-gray-100 border-t border-gray-300 text-center text-gray-600 text-sm rounded-tr-xl rounded-tl-xl transition-shadow duration-300 hover:shadow-inner">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Usuario;