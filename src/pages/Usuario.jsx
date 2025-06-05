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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarios = await api.getUsuario();
        if (Array.isArray(usuarios)) setData(usuarios);
        else setData([]);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar la lista de usuarios.", "error");
      }
    };
    fetchData();
  }, []);

  // Filtrado y ordenamiento
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(
      (u) =>
        u.usuario.toLowerCase().includes(term) ||
        u.estatus.toLowerCase().includes(term) ||
        u.tipo_usuario.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (sortConfig.key) {
      const sorted = [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
      return sorted;
    }
    return filteredData;
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Crear usuario
const handleCreateUser = async () => {
  const result = await Swal.fire({
    title: 'Agregar Nuevo Usuario',
    html: `
      <input id="cedula" class="swal2-input" placeholder="Cedula de Identidad" />
      <input id="nombre" class="swal2-input" placeholder="Nombre y Apellido" />
      <input id="usuario" class="swal2-input" placeholder="Nombre de Usuario" />
      <input id="contrasena" type="password" class="swal2-input" placeholder="Contraseña" />
      <select id="tipo_usuario" class="swal2-select">
        <option value="">Selecciona un tipo_usuario</option>
        <option value="Administrador">Administrador</option>
        <option value="Credito y Cobranza 1">Admin. Credito y Cobranza</option>
        <option value="Credito y Cobranza 2">Asist. Credito y Cobranza</option>
      </select>
    `,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const cedula = document.getElementById('cedula').value.trim();
      const nombre = document.getElementById('nombre').value.trim();
      const usuario = document.getElementById('usuario').value.trim();
      const contrasena = document.getElementById('contrasena').value.trim();
      const tipo_usuario = document.getElementById('tipo_usuario').value.trim();

      if (!cedula) { Swal.showValidationMessage('Por favor, ingrese la cédula de identidad.'); return false; }
      if (!nombre) { Swal.showValidationMessage('Por favor, ingrese el nombre completo.'); return false; }
      if (!usuario) { Swal.showValidationMessage('Por favor, ingrese el nombre de usuario.'); return false; }
      if (contrasena.length < 6) { Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres.'); return false; }
      if (!tipo_usuario) { Swal.showValidationMessage('Por favor, seleccione un tipo_usuario.'); return false; }

      return { cedula, nombre, usuario, contrasena, tipo_usuario };
    },
  });

  if (result.isConfirmed) {
    const nuevoUsuario = {
      cedula: result.value.cedula,
      nombre: result.value.nombre,
      email: `${result.value.usuario}@ejemplo.com`,
      usuario: result.value.usuario,
      contrasena: result.value.contrasena,
      tipo_usuario: result.value.tipo_usuario,
      estatus: "Activo",
    };
    try {
      const resultado = await api.createUsuario(nuevoUsuario);
      setData((prev) => [...prev, resultado]);
      Swal.fire("Éxito", "Usuario agregado correctamente.", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo agregar el usuario.", "error");
    }
  }
};

// Editar usuario
const handleEditUser = async (user) => {
  const result = await Swal.fire({
    title: 'Editar Usuario',
    html: `
      <input id="cedula" class="swal2-input" value="${user.cedula}" disabled />
      <input id="nombre" class="swal2-input" placeholder="Nombre y Apellido" value="${user.nombre}" />
      <input id="usuario" class="swal2-input" placeholder="Nombre de Usuario" value="${user.usuario}" />
      <input id="contrasena" type="password" class="swal2-input" placeholder="Dejar en blanco para mantener" />
      <select id="tipo_usuario" class="swal2-select">
        <option value="">Selecciona un tipo_usuario</option>
        <option value="Administrador" ${user.tipo_usuario==="Administrador" ? "selected" : ""}>Administrador</option>
        <option value="Credito y Cobranza 1" ${user.tipo_usuario==="Credito y Cobranza 1" ? "selected" : ""}>Admin. Credito y Cobranza</option>
        <option value="Credito y Cobranza 2" ${user.tipo_usuario==="Credito y Cobranza 2" ? "selected" : ""}>Asist. Credito y Cobranza</option>
        <option value="Formalizador" ${user.tipo_usuario==="Formalizador" ? "selected" : ""}>Formalizador</option>
      </select>
    `,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const nombre = document.getElementById('nombre').value;
      const usuario = document.getElementById('usuario').value;
      const contrasena = document.getElementById('contrasena').value;
      const tipo_usuario = document.getElementById('tipo_usuario').value;
      if (!nombre || !usuario || !tipo_usuario) {
        Swal.showValidationMessage('Por favor, complete todos los campos');
        return false;
      }
      return { nombre, usuario, contrasena, tipo_usuario };
    },
    
  });
  if (result.isConfirmed) {
    const usuarioActualizado = {
      usuario: result.value.usuario,
      password: result.value.contrasena, // puede dejarse vacío
      tipo_usuario: result.value.tipo_usuario,
      nombre: result.value.nombre,
    };
    try {
      await api.updateUsuario(user.cedula, usuarioActualizado);
      setData((prev) =>
        prev.map((u) =>
          u.cedula === user.cedula ? { ...u, ...usuarioActualizado } : u
        )
      );
      Swal.fire("Éxito", "Usuario actualizado.", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar.", "error");
    }
  }
};

// Eliminar usuario
const handleDeleteUser = (cedula) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: `¿Deseas eliminar al usuario ${cedula}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.deleteUsuario(cedula);
        setData((prev) => prev.filter((u) => u.cedula !== cedula));
        Swal.fire("Eliminado!", "El usuario fue eliminado.", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar.", "error");
      }
    }
  });
};

// Función para cambiar estatus
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
        await api.updateUsuarioEstatus(user.cedula, nuevoEstatus);
        setData((prev) =>
          prev.map((u) =>
            u.cedula === user.cedula ? { ...u, estatus: nuevoEstatus } : u
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
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/** Menú lateral */}
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Título y barra */}
        <div className="pt-20 pb-20 px-6 md:px-12">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-user text-2xl"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Gestión de Usuario
              </h1>
            </div>
          </div>

          {/* Barra búsqueda y botón */}
          <div className="mb-6 max-w-4xl mx-auto flex items-center space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* icono lupa */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
            {/* Botón nuevo usuario */}
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full shadow-lg transition"
              onClick={handleCreateUser}
            >
              + Nuevo Usuario
            </button>
          </div>

          {/* Tabla de usuarios */}
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white max-w-4xl mx-auto mb-20">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Encabezado */}
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: "C.I", key: "cedula" },
                    { label: "Nombre y Apellido", key: "nombre" },
                    { label: "Nombre de Usuario", key: "usuario" },
                    { label: "tipo_usuario", key: "tipo_usuario" },
                    { label: "Estatus", key: "estatus" },
                    { label: "Acciones", key: "acciones" },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      className="px-4 py-3 cursor-pointer select-none text-gray-700 font-medium hover:bg-gray-100 transition"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center justify-between">
                        {label}
                        {sortConfig.key === key ? (
                          <span className="text-sm">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              {/* Cuerpo */}
              <tbody className="divide-y divide-gray-200">
                {sortedData.length > 0 ? (
                  sortedData.map((item) => (
                    <tr
                      key={item.cedula}
                      className="transition hover:bg-gray-100"
                    >
                      <td className="px-4 py-3 text-center text-gray-600">{item.cedula}</td>
                      <td className="px-4 py-3 text-gray-700">{item.nombre}</td>
                      <td className="px-4 py-3 text-gray-700">{item.usuario}</td>
                      <td className="px-4 py-3 text-gray-700">{item.tipo_usuario}</td>
                      <td className="px-4 py-3 text-gray-700">{item.estatus}</td>
                      <td className="px-4 py-3 flex justify-center space-x-3">
                        {/* Botón editar */}
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEditUser(item)}
                          aria-label="Editar"
                        >
                          <i className="bx bx-edit-alt text-xl"></i>
                        </button>
                        {/* Botón eliminar */}
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteUser(item.cedula)}
                          aria-label="Eliminar"
                        >
                          <i className="bx bx-trash text-xl"></i>
                        </button>
                        {/* Botón activar/desactivar */}
                        <button
                          className={`px-2 py-1 rounded text-white ${
                            item.estatus === 'Activo'
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                          onClick={() => handleToggleEstatus(item)}
                        >
                          {item.estatus === 'Activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-4 text-gray-500 font-semibold"
                    >
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie de página */}
        <footer className="mt-auto p-6 bg-gray-100 border-t border-gray-300 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Usuario;