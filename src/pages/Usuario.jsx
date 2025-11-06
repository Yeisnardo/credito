import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api_usuario';
import Header from "../components/Header";
import Menu from "../components/Menu";
import personaApi from '../services/api_persona';
import usuarioApi from '../services/api_usuario';

// Importación de Tabler Icons
import { 
  TbX,
  TbUser,
  TbPlus,
  TbSearch,
  TbEdit,
  TbTrash,
  TbCircleCheck,
  TbAlertCircle,
  TbLoader
} from 'react-icons/tb';

// Componente Modal reutilizable
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <TbX size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Usuario = () => {
  const navigate = useNavigate();

  // Estados de control
  const [modalOpen, setModalOpen] = useState({
    personal: false,
    usuario: false,
    edit: false,
    delete: false,
    toggle: false,
  });

  const [personaData, setPersonaData] = useState({
    cedula: "",
    nombre_completo: "",
    telefono: "",
    email: "",
  });

  const [usuarioData, setUsuarioData] = useState({
    cedula_usuario: "",
    usuario: "",
    clave: "",
    rol: "",
    estatus: "Activo",
  });

  const [userToEdit, setUserToEdit] = useState(null);
  const [editableUser, setEditableUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Función para permitir solo números
  const handleCedulaChange = (e) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 8);
    setPersonaData({ ...personaData, cedula: valor });
  };

  // Funciones para abrir/cerrar modales
  const openModal = (type) => setModalOpen((prev) => ({ ...prev, [type]: true }));
  const closeModal = (type) => setModalOpen((prev) => ({ ...prev, [type]: false }));

  // Cargar usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usuarios = await api.getUsuarios();
        setData(Array.isArray(usuarios) ? usuarios : []);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        alert("No se pudo cargar la lista de usuarios.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrado de datos
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(
      (u) =>
        u.usuario?.toLowerCase().includes(term) ||
        u.estatus?.toLowerCase().includes(term) ||
        u.rol?.toLowerCase().includes(term) ||
        u.nombre_completo?.toLowerCase().includes(term) ||
        u.cedula_usuario?.includes(term)
    );
  }, [data, searchTerm]);

  // Funciones para abrir componentes específicos
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  const handleNuevoPersonal = () => {
    setPersonaData({
      cedula: "",
      nombre_completo: "",
      telefono: "",
      email: "",
    });
    openModal("personal");
  };

  // Cuando el usuario guarda datos personales, abre modal del usuario
  const handleGuardarPersona = () => {
    if (!personaData.cedula.trim()) {
      alert("Ingresa la cédula");
      return;
    }
    if (!personaData.nombre_completo.trim()) {
      alert("Ingresa el nombre completo");
      return;
    }
    closeModal("personal");
    setUsuarioData({ 
      ...usuarioData, 
      cedula_usuario: personaData.cedula,
      estatus: "Activo"
    });
    openModal("usuario");
  };

  // Crear registro de persona y usuario
  const handleCrearRegistro = async () => {
    try {
      const { cedula, nombre_completo, telefono, email } = personaData;

      // Validaciones
      if (!usuarioData.usuario.trim()) {
        alert("Ingresa el nombre de usuario");
        return;
      }
      if (!usuarioData.clave.trim() || usuarioData.clave.length < 6 || usuarioData.clave.length > 20) {
        alert("La contraseña debe tener entre 6 y 20 caracteres");
        return;
      }
      if (!usuarioData.rol.trim()) {
        alert("Selecciona un rol");
        return;
      }

      // Construye directamente el objeto que enviarás
      const usuarioPayload = {
        cedula_usuario: cedula,
        usuario: usuarioData.usuario,
        clave: usuarioData.clave,
        rol: usuarioData.rol,
        estatus: usuarioData.estatus,
      };

      // Enviar datos a las APIs
      await personaApi.createPersonaBasica({ cedula, nombre_completo, telefono, email });
      await usuarioApi.createUsuario(usuarioPayload);

      // Refrescar la lista
      const nuevosUsuarios = await api.getUsuarios();
      setData(nuevosUsuarios);

      // Limpiar y cerrar modales
      closeModal("usuario");
      setPersonaData({
        cedula: "",
        nombre_completo: "",
        telefono: "",
        email: "",
      });
      setUsuarioData({
        cedula_usuario: "",
        usuario: "",
        clave: "",
        rol: "",
        estatus: "Activo",
      });

      alert("Usuario creado con éxito");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Hubo un error al crear el usuario. Verifica los datos y vuelve a intentarlo.");
    }
  };

  // Funciones para editar, eliminar y cambiar estatus
  const handleEditarUsuario = (user) => {
    setUserToEdit(user);
    setEditableUser({ ...user });
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

  const handleGuardarEdicion = async () => {
  try {
    // Preparar los datos para enviar
    const datosActualizacion = {
      usuario: editableUser.usuario,
      rol: editableUser.rol,
      estatus: editableUser.estatus // Asegurar que el estatus se envíe
    };

    // Solo incluir la contraseña si se cambió (no está vacía)
    if (editableUser.clave && editableUser.clave.trim() !== "") {
      if (editableUser.clave.length < 6 || editableUser.clave.length > 20) {
        alert("La contraseña debe tener entre 6 y 20 caracteres");
        return;
      }
      datosActualizacion.clave = editableUser.clave;
    }

    // Actualizar en la base de datos
    await api.updateUsuario(editableUser.cedula_usuario, datosActualizacion);
    
    // Actualizar el estado local
    setData((prev) =>
      prev.map((u) =>
        u.cedula_usuario === editableUser.cedula_usuario
          ? { ...u, ...editableUser }
          : u
      )
    );
    
    closeModal("edit");
    alert("Usuario actualizado con éxito");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    alert("Error al actualizar el usuario: " + (error.response?.data?.message || error.message));
  }
};

  const handleConfirmarEliminar = async () => {
    try {
      await api.deleteUsuario(userToDelete.cedula_usuario);
      setData((prev) =>
        prev.filter((u) => u.cedula_usuario !== userToDelete.cedula_usuario)
      );
      closeModal("delete");
      alert("Usuario eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Error al eliminar el usuario");
    }
  };

  const handleConfirmarToggle = async () => {
    try {
      const nuevoEstatus = userToToggle.estatus === "Activo" ? "Inactivo" : "Activo";
      await api.updateUsuarioEstatus(userToToggle.cedula_usuario, nuevoEstatus);
      
      setData((prev) =>
        prev.map((u) =>
          u.cedula_usuario === userToToggle.cedula_usuario
            ? { ...u, estatus: nuevoEstatus }
            : u
        )
      );
      closeModal("toggle");
      alert(`Usuario ${nuevoEstatus === "Activo" ? "activado" : "desactivado"} con éxito`);
    } catch (error) {
      console.error("Error al cambiar estatus:", error);
      alert("Error al cambiar el estatus del usuario");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {menuOpen && <Menu />}
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}>
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 mt-13">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md">
                <TbUser size={24} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
                <p className="text-gray-500 text-sm mt-1">Administra los usuarios del sistema</p>
              </div>
            </div>
            
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md flex items-center space-x-2 transition-colors"
              onClick={handleNuevoPersonal}
            >
              <TbPlus size={20} />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Buscar por nombre, usuario, cédula o rol..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TbSearch className="text-gray-400" size={20} />
              </div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { label: "C.I", key: "cedula" },
                      { label: "Nombres y Apellidos", key: "nombre" },
                      { label: "Usuario", key: "usuario" },
                      { label: "Rol", key: "rol" },
                      { label: "Estatus", key: "estatus" },
                      { label: "Acciones", key: "acciones" },
                    ].map(({ label, key }) => (
                      <th
                        key={key}
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex justify-center">
                          <TbLoader className="animate-spin text-indigo-600" size={24} />
                        </div>
                        <p className="text-gray-500 mt-2">Cargando usuarios...</p>
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.cedula_usuario} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.cedula_usuario}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.nombre_completo}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.usuario}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {item.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.estatus === "Activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.estatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                              onClick={() => handleEditarUsuario(item)}
                              title="Editar"
                            >
                              <TbEdit size={18} />
                            </button>
                            
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              onClick={() => handleEliminarUsuario(item)}
                              title="Eliminar"
                            >
                              <TbTrash size={18} />
                            </button>
                            
                            <button
                              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                item.estatus === "Activo"
                                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                                  : "bg-green-100 text-green-800 hover:bg-green-200"
                              }`}
                              onClick={() => handleCambiarEstatus(item)}
                            >
                              {item.estatus === "Activo" ? "Desactivar" : "Activar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <TbUser className="text-gray-300 mx-auto mb-2" size={48} />
                        <p className="text-gray-500">No se encontraron usuarios</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400 mt-1">
                            Intenta con otros términos de búsqueda
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Pie de página */}
        <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>

      {/* ========================= Modales ========================= */}

      {/* Modal Datos Personales */}
      <Modal
        isOpen={modalOpen.personal}
        onClose={() => closeModal("personal")}
        title="Datos Personales"
        size="md"
      >
        <div className="space-y-4">
          {[
            {
              label: "Cédula",
              type: "text",
              value: personaData.cedula,
              onChange: handleCedulaChange,
              maxLength: 8,
              placeholder: "Ej: 12345678"
            },
            {
              label: "Nombre Completo",
              type: "text",
              value: personaData.nombre_completo,
              onChange: (e) => {
                const valor = e.target.value
                  .split(" ")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ");
                setPersonaData({ ...personaData, nombre_completo: valor });
              },
              placeholder: "Nombre y apellido completo"
            },
            {
              label: "Teléfono",
              type: "tel",
              value: personaData.telefono,
              onChange: (e) => setPersonaData({ ...personaData, telefono: e.target.value }),
              placeholder: "Ej: 0412-1234567"
            },
            {
              label: "Email",
              type: "email",
              value: personaData.email,
              onChange: (e) => setPersonaData({ ...personaData, email: e.target.value }),
              placeholder: "ejemplo@correo.com"
            },
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={field.onChange}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          ))}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => closeModal("personal")}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              onClick={handleGuardarPersona}
            >
              Siguiente
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Registro de Usuario */}
      <Modal
        isOpen={modalOpen.usuario}
        onClose={() => closeModal("usuario")}
        title="Registro de Usuario"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
            <input
              type="text"
              value={personaData.cedula}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
            <input
              type="text"
              value={usuarioData.usuario}
              onChange={(e) => setUsuarioData({ ...usuarioData, usuario: e.target.value })}
              placeholder="Ingresa el nombre de usuario"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={usuarioData.clave}
              onChange={(e) => setUsuarioData({ ...usuarioData, clave: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">La contraseña debe tener entre 6 y 20 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={usuarioData.rol}
              onChange={(e) => setUsuarioData({ ...usuarioData, rol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecciona un rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Credito1">Admin. Credito y Cobranza</option>
              <option value="Credito2">Asist. Credito y Cobranza</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estatus</label>
            <select
              value={usuarioData.estatus}
              onChange={(e) => setUsuarioData({ ...usuarioData, estatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => closeModal("usuario")}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              onClick={handleCrearRegistro}
            >
              Crear Usuario
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={modalOpen.edit}
        onClose={() => closeModal("edit")}
        title="Editar Usuario"
        size="md"
      >
        {editableUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input
                type="text"
                value={editableUser.cedula_usuario}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres y Apellidos</label>
              <input
                type="text"
                value={editableUser.nombre_completo || editableUser.nombre || ""}
                disabled
                onChange={(e) => setEditableUser({ ...editableUser, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                value={editableUser.usuario}
                onChange={(e) => setEditableUser({ ...editableUser, usuario: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Contraseña (dejar en blanco para mantener la actual)
  </label>
  <input
    type="password"
    value={editableUser.clave || ""}
    onChange={(e) => setEditableUser({ ...editableUser, clave: e.target.value })}
    placeholder="Nueva contraseña (mínimo 6 caracteres)"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  />
  <p className="text-xs text-gray-500 mt-1">
    {editableUser.clave && `Longitud: ${editableUser.clave.length} caracteres`}
  </p>
</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={editableUser.rol}
                onChange={(e) => setEditableUser({ ...editableUser, rol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecciona un rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Credito1">Admin. Credito y Cobranza</option>
                <option value="Credito2">Asist. Credito y Cobranza</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => closeModal("edit")}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                onClick={handleGuardarEdicion}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={modalOpen.delete}
        onClose={() => closeModal("delete")}
        title="Eliminar Usuario"
        size="sm"
      >
        {userToDelete && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <TbTrash className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">¿Estás seguro?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Se eliminará permanentemente al usuario: <strong>{userToDelete.usuario}</strong>
            </p>
            
            <div className="flex justify-center space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => closeModal("delete")}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={handleConfirmarEliminar}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Cambiar Estatus */}
      <Modal
        isOpen={modalOpen.toggle}
        onClose={() => closeModal("toggle")}
        title="Cambiar Estatus"
        size="sm"
      >
        {userToToggle && (
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
              userToToggle.estatus === "Activo" ? "bg-yellow-100" : "bg-green-100"
            }`}>
              {userToToggle.estatus === "Activo" ? (
                <TbAlertCircle className="text-yellow-600" size={24} />
              ) : (
                <TbCircleCheck className="text-green-600" size={24} />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {userToToggle.estatus === "Activo" ? "Desactivar Usuario" : "Activar Usuario"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Estás seguro de {userToToggle.estatus === "Activo" ? "desactivar" : "activar"} al usuario{' '}
              <strong>{userToToggle.usuario}</strong>?
            </p>
            
            <div className="flex justify-center space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => closeModal("toggle")}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  userToToggle.estatus === "Activo" 
                    ? "bg-yellow-600 hover:bg-yellow-700" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={handleConfirmarToggle}
              >
                {userToToggle.estatus === "Activo" ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Usuario;