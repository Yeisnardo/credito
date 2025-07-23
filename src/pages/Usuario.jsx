import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api_usuario";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Usuario = () => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState({
    personal: false,
    usuario: false,
    confirm: false,
    edit: false,
    delete: false,
    toggle: false,
  });

  const [personaData, setPersonaData] = useState({
    cedula: "",
    nombre_completo: "",
    edad: "",
    telefono: "",
    email: "",
  });

  const [usuarioData, setUsuarioData] = useState({
    usuario: "",
    clave: "",
    rol: "",
  });

  const [userToEdit, setUserToEdit] = useState(null);
  const [editableUser, setEditableUser] = useState(null); // Nuevo estado para editar
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(true);

  const openModal = (type) =>
    setModalOpen((prev) => ({ ...prev, [type]: true }));
  const closeModal = (type) =>
    setModalOpen((prev) => ({ ...prev, [type]: false }));

  // Componente Modal
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90 p-4 transition-opacity duration-300 ease-in-out">
        <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative transform transition-transform duration-300 ease-in-out hover:scale-105">
          <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>
          <div className="mb-4">{children}</div>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✖
          </button>
        </div>
      </div>
    );
  };

  // Carga usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarios = await api.getUsuarios();
        setData(Array.isArray(usuarios) ? usuarios : []);
      } catch (error) {
        alert("No se pudo cargar la lista de usuarios.");
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

  // Funciones para abrir modales
  const handleNuevoPersonal = () => {
    setPersonaData({
      cedula: "",
      nombre_completo: "",
      edad: "",
      telefono: "",
      email: "",
    });
    openModal("personal");
  };

  const handleNuevoUsuario = () => {
    setUsuarioData({ usuario: "", clave: "", rol: "" });
    openModal("usuario");
  };

  const handleConfirmarRegistro = (persona, usuario) => {
    setPersonaData(persona);
    setUsuarioData(usuario);
    openModal("confirm");
  };

  const handleEditarUsuario = (user) => {
    setUserToEdit(user);
    setEditableUser({ ...user }); // Copia en modo edición
    openModal("edit");
  };

  const handleEliminarUsuario = (user) => {
    setUserToDelete(user);
    openModal("delete");
  };

  const handleCambiarEstatus = (user) => {
    setUserToToggle(user);
    openModal("toggle");
  };

  // Guardar y confirmar acciones
  const handleGuardarPersona = () => {
    if (!personaData.cedula.trim()) {
      alert("Ingresa la cédula");
      return;
    }
    closeModal("personal");
  };

  const handleGuardarUsuario = () => {
    if (!usuarioData.usuario.trim()) {
      alert("Ingresa el nombre de usuario");
      return;
    }
    if (
      !usuarioData.clave.trim() ||
      usuarioData.clave.length < 6 ||
      usuarioData.clave.length > 20
    ) {
      alert("Contraseña entre 6 y 20 caracteres");
      return;
    }
    if (!usuarioData.rol.trim()) {
      alert("Selecciona un rol");
      return;
    }
    closeModal("usuario");
  };

  const handleCrearRegistro = () => {
    api
      .createPersona(personaData)
      .then(() => {
        return api.createUsuario({
          cedula_usuario: personaData.cedula,
          usuario: usuarioData.usuario,
          clave: usuarioData.clave,
          rol: usuarioData.rol,
          estatus: "Activo",
        });
      })
      .then((resultadoUsuario) => {
        setData((prev) => [...prev, resultadoUsuario]);
        closeModal("confirm");
      })
      .catch(() => alert("Error al crear usuario."));
  };

  const handleGuardarEdicion = () => {
    api
      .updateUsuario(userToEdit.cedula_usuario, {
        usuario: editableUser.usuario,
        password: editableUser.clave,
        rol: editableUser.rol,
        nombre: editableUser.nombre,
      })
      .then(() => {
        setData((prev) =>
          prev.map((u) =>
            u.cedula_usuario === editableUser.cedula_usuario
              ? { ...u, ...editableUser }
              : u
          )
        );
        closeModal("edit");
      });
  };

  const handleConfirmarEliminar = () => {
    api.deleteUsuario(userToDelete.cedula_usuario).then(() => {
      setData((prev) =>
        prev.filter((u) => u.cedula_usuario !== userToDelete.cedula_usuario)
      );
      closeModal("delete");
    });
  };

  const handleConfirmarToggle = () => {
    const nuevoEstatus =
      userToToggle.estatus === "Activo" ? "Inactivo" : "Activo";
    api
      .updateUsuarioEstatus(userToToggle.cedula_usuario, nuevoEstatus)
      .then(() => {
        setData((prev) =>
          prev.map((u) =>
            u.cedula_usuario === userToToggle.cedula_usuario
              ? { ...u, estatus: nuevoEstatus }
              : u
          )
        );
        closeModal("toggle");
      });
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "#F9FAFB", fontFamily: "Arial, sans-serif" }}
    >
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        {/* Encabezado y botón */}
        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8 mt-10">
            {/* Título y icono */}
            <div className="flex items-center space-x-4">
              <div className="bg-[#D1D5DB] p-4 rounded-full shadow-md hover:scale-105 transform transition duration-300">
                <i className="bx bx-user text-3xl text-[#374151]"></i>
              </div>
              <h1 className="text-3xl font-semibold text-[#374151]">
                Gestión de usuario
              </h1>
            </div>
            {/* Botón para nuevo usuario */}
            <button
              className="bg-[#374151] hover:bg-[#111827] text-white px-6 py-3 rounded-full shadow-md flex items-center space-x-2 transform hover:scale-105 transition duration-300"
              onClick={handleNuevoPersonal}
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
                className="w-full p-4 pl-12 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F2937] transition duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Icono de búsqueda */}
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

          {/* Tabla */}
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white max-w-7xl mx-auto mb-12 transition-shadow duration-300 hover:shadow-xl">
            <table className="min-w-full divide-y divide-gray-200 rounded-xl">
              <thead className="bg-[#F9FAFB] rounded-t-xl">
                <tr>
                  {[
                    { label: "C.I", key: "cedula_usuario" },
                    { label: "Nombres y Apellidos", key: "nombre" },
                    { label: "Nombre de Usuario", key: "usuario" },
                    { label: "rol", key: "rol" },
                    { label: "Estatus", key: "estatus" },
                    { label: "Acciones", key: "acciones" },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      className="px-4 py-3 cursor-pointer select-none text-gray-700 font-medium hover:bg-gray-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr
                      key={item.cedula_usuario}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.cedula_usuario}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.nombre_completo}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.usuario}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.rol}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.estatus === "Activo"
                              ? "bg-green-100 text-[#166534]"
                              : "bg-red-100 text-[#991B1B]"
                          }`}
                        >
                          {item.estatus}
                        </span>
                      </td>
                      {/* Acciones */}
                      <td className="px-4 py-3 flex justify-center space-x-3">
                        {/* Editar */}
                        <button
                          className="text-blue-500 hover:text-[#1F2937] transition-transform transform hover:scale-105"
                          onClick={() => handleEditarUsuario(item)}
                          aria-label="Editar"
                        >
                          <i className="bx bx-edit-alt text-xl"></i>
                        </button>
                        {/* Eliminar */}
                        <button
                          className="text-red-500 hover:text-[#991B1B] transition-transform transform hover:scale-105"
                          onClick={() => handleEliminarUsuario(item)}
                          aria-label="Eliminar"
                        >
                          <i className="bx bx-trash text-xl"></i>
                        </button>
                        {/* Activar / Desactivar */}
                        <button
                          className={`px-4 py-2 rounded-full font-semibold transition transform hover:scale-105 ${
                            item.estatus === "Activo"
                              ? "bg-[#EF4444] hover:bg-[#DC2626] text-white"
                              : "bg-[#22C55E] hover:bg-[#16A34A] text-white"
                          }`}
                          onClick={() => handleCambiarEstatus(item)}
                        >
                          {item.estatus === "Activo" ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 text-center text-gray-400 font-semibold"
                    >
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie */}
        <footer
          className="mt-auto p-4"
          style={{
            backgroundColor: "#F9FAFB",
            borderTop: "1px solid #D1D5DB",
            color: "#4B5563",
            fontSize: "0.875rem",
            borderRadius: "0px 0px 8px 8px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
          }}
        >
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>

      {/* ========================= Modales ========================= */}

      {/* Datos Personales */}
      <Modal
        isOpen={modalOpen.personal}
        onClose={() => closeModal("personal")}
        title="Datos Personales"
      >
        <div className="flex flex-col space-y-2">
          <label>Cédula</label>
          <input
            className="border p-2 rounded"
            value={personaData.cedula}
            onChange={(e) =>
              setPersonaData({ ...personaData, cedula: e.target.value })
            }
          />

          <label>Nombre Completo</label>
          <input
            className="border p-2 rounded"
            value={personaData.nombre_completo}
            onChange={(e) =>
              setPersonaData({
                ...personaData,
                nombre_completo: e.target.value,
              })
            }
          />
          <label>Edad</label>
          <input
            className="border p-2 rounded"
            type="number"
            value={personaData.edad}
            onChange={(e) =>
              setPersonaData({ ...personaData, edad: e.target.value })
            }
          />
          <label>Teléfono</label>
          <input
            className="border p-2 rounded"
            value={personaData.telefono}
            onChange={(e) =>
              setPersonaData({ ...personaData, telefono: e.target.value })
            }
          />
          <label>Email</label>
          <input
            className="border p-2 rounded"
            value={personaData.email}
            onChange={(e) =>
              setPersonaData({ ...personaData, email: e.target.value })
            }
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => closeModal("personal")}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleGuardarPersona}
          >
            Guardar
          </button>
        </div>
      </Modal>

      {/* Registro de Usuario */}
      <Modal
        isOpen={modalOpen.usuario}
        onClose={() => closeModal("usuario")}
        title="Registro de Usuario"
      >
        <div className="flex flex-col space-y-2">
          <label>Nombre de Usuario</label>
          <input
            className="border p-2 rounded"
            value={usuarioData.usuario}
            onChange={(e) =>
              setUsuarioData({ ...usuarioData, usuario: e.target.value })
            }
          />
          <label>Contraseña</label>
          <input
            type="password"
            className="border p-2 rounded"
            value={usuarioData.clave}
            onChange={(e) =>
              setUsuarioData({ ...usuarioData, clave: e.target.value })
            }
          />
          <label>Rol</label>
          <select
            className="border p-2 rounded"
            value={usuarioData.rol}
            onChange={(e) =>
              setUsuarioData({ ...usuarioData, rol: e.target.value })
            }
          >
            <option value="">Selecciona Rol</option>
            <option value="Administrador">Administrador</option>
            <option value="Credito y Cobranza 1">
              Admin. Credito y Cobranza
            </option>
            <option value="Credito y Cobranza 2">
              Asist. Credito y Cobranza
            </option>
          </select>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => closeModal("usuario")}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleGuardarUsuario}
          >
            Guardar
          </button>
        </div>
      </Modal>

      {/* Confirmar creación */}
      <Modal
        isOpen={modalOpen.confirm}
        onClose={() => closeModal("confirm")}
        title="¿Confirmar registro?"
      >
        {/* Muestra los datos a confirmar */}
        <div>
          <h4>Persona</h4>
          <p>
            <strong>Cédula:</strong> {personaData.cedula}
          </p>
          <p>
            <strong>Nombre:</strong> {personaData.nombre_completo}
          </p>
          <p>
            <strong>Edad:</strong> {personaData.edad}
          </p>
          <p>
            <strong>Teléfono:</strong> {personaData.telefono}
          </p>
          <p>
            <strong>Email:</strong> {personaData.email}
          </p>
          <hr />
          <h4>Usuario</h4>
          <p>
            <strong>Usuario:</strong> {usuarioData.usuario}
          </p>
          <p>
            <strong>Rol:</strong> {usuarioData.rol}
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => closeModal("confirm")}
          >
            Cancelar
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleCrearRegistro}
          >
            Crear
          </button>
        </div>
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={modalOpen.edit}
        onClose={() => closeModal("edit")}
        title="Editar Usuario"
      >
        {userToEdit && (
          <div className="flex flex-col space-y-2">
            {/* Cédula (solo lectura) */}
            <label>Cédula</label>
            <input
              className="border p-2 rounded"
              value={editableUser.cedula_usuario}
              disabled
            />

            {/* Nombres y Apellidos */}
            <label>Nombres y Apellidos</label>
            <input
              className="border p-2 rounded"
              value={editableUser.nombre}
              onChange={(e) =>
                setEditableUser({ ...editableUser, nombre: e.target.value })
              }
            />

            {/* Usuario */}
            <label>Nombre de Usuario</label>
            <input
              className="border p-2 rounded"
              value={editableUser.usuario}
              onChange={(e) =>
                setEditableUser({ ...editableUser, usuario: e.target.value })
              }
            />

            {/* Contraseña */}
            <label>Contraseña</label>
            <input
              type="password"
              className="border p-2 rounded"
              placeholder="Dejar en blanco para mantener"
              value={editableUser.clave}
              onChange={(e) =>
                setEditableUser({ ...editableUser, clave: e.target.value })
              }
            />

            {/* Rol */}
            <label>Rol</label>
            <select
              className="border p-2 rounded"
              value={editableUser.rol}
              onChange={(e) =>
                setEditableUser({ ...editableUser, rol: e.target.value })
              }
            >
              <option value="">Selecciona un tipo de usuario</option>
              <option value="Administrador">Administrador</option>
              <option value="Credito y Cobranza 1">
                Admin. Credito y Cobranza
              </option>
              <option value="Credito y Cobranza 2">
                Asist. Credito y Cobranza
              </option>
            </select>
          </div>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => closeModal("edit")}
          >
            Cancelar
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleGuardarEdicion}
          >
            Guardar
          </button>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={modalOpen.delete}
        onClose={() => closeModal("delete")}
        title="Eliminar usuario"
      >
        {userToDelete && (
          <p>
            ¿Estás seguro de eliminar al usuario {userToDelete.cedula_usuario}?
          </p>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => closeModal("delete")}
          >
            Cancelar
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={handleConfirmarEliminar}
          >
            Eliminar
          </button>
        </div>
      </Modal>

      {/* Modal Activar/Desactivar */}
      <Modal
        isOpen={modalOpen.toggle}
        onClose={() => closeModal("toggle")}
        title="Cambiar Estatus"
      >
        {userToToggle && (
          <p>
            ¿Deseas{" "}
            {userToToggle.estatus === "Activo" ? "desactivar" : "activar"} a
            este usuario?
          </p>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => closeModal("toggle")}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleConfirmarToggle}
          >
            {userToToggle?.estatus === "Activo" ? "Desactivar" : "Activar"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Usuario;
