import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from "../services/api_usuario";
import { crearBanco, getCuentaPorCedulaEmprendedor } from "../services/api_banco";

// Importar Tabler Icons
import {
  TbWallet,
  TbPlus,
  TbId,
  TbUser,
  TbBuildingBank,
  TbCreditCard,
  TbX,
  TbChevronDown,
  TbSearch,
  TbEdit,
  TbCheck
} from 'react-icons/tb';

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showFormAnimated, setShowFormAnimated] = useState(false);
  const [nuevoBanco, setNuevoBanco] = useState({
    cedula: "",
    nombreCompleto: "",
    banco: "",
    numeroCuenta: "",
  });
  const [bancoGuardado, setBancoGuardado] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBanco, setEditBanco] = useState(null);

  const bancosDisponibles = [
    "Banco de Venezuela (0102)",
    "Banesco (0134)",
    "BBVA Provincial (0108)",
    "Banco Mercantil (0105)",
    "Bancaribe (0114)",
    "Banco Nacional de Crédito - BNC (0191)",
    "Banco del Tesoro (0163)",
    "Banco Bicentenario (0175)",
    "Banco Exterior (0115)",
    "Banco Sofitasa (0137)",
    "Banco Plaza (0138)",
    "100% Banco (0156)",
    "Banco Fondo Común (0151)",
    "Banplus (0174)",
    "Bancamiga (0172)",
    "Banco Activo (0171)",
    "Banco Venezolano de Crédito (0104)",
    "DELSUR Banco Universal (0157)",
    "Banco Caroní (0128)",
    "Banco del Pueblo Soberano - Banfanb (0177)",
    "Banco Agrícola de Venezuela (0166)",
    "Banco de la Mujer - Banmujer (0168)",
    "Banco Internacional de Desarrollo (0173)",
    "Banco Digital de los Trabajadores (0175)",
  ];

  const [filtroBanco, setFiltroBanco] = useState("");
  const [bancoSeleccionado, setBancoSeleccionado] = useState("");
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleAgregarBanco = () => {
    setShowBankForm(true);
    setTimeout(() => {
      setShowFormAnimated(true);
    }, 10);
  };

  const handleCancelar = () => {
    setShowFormAnimated(false);
    setTimeout(() => {
      setShowBankForm(false);
      setNuevoBanco({
        cedula: "",
        nombreCompleto: "",
        banco: "",
        numeroCuenta: "",
      });
      setBancoSeleccionado("");
      setSearchTerm("");
    }, 300);
  };

  // Cargar banco desde API al montar
  useEffect(() => {
    const fetchBanco = async () => {
      const cedulaUsuario = localStorage.getItem("cedula_usuario");
      if (cedulaUsuario) {
        try {
          const bancoData = await getCuentaPorCedulaEmprendedor(cedulaUsuario);
          if (bancoData) {
            setBancoGuardado(bancoData);
          }
        } catch (error) {
          console.error("Error al obtener el banco:", error);
        }
      }
    };
    fetchBanco();
  }, []);

  // Guardar nuevo banco
  const handleGuardarBanco = () => {
    const cedulaUsuario = localStorage.getItem("cedula_usuario");
    const bancoData = {
      cedula_emprendedor: cedulaUsuario,
      cedula_titular: nuevoBanco.cedula,
      banco: bancoSeleccionado,
      nombre_completo: nuevoBanco.nombreCompleto,
      numero_cuenta: nuevoBanco.numeroCuenta,
    };

    console.log("Enviando datos a la API:", bancoData);

    crearBanco(bancoData)
      .then((response) => {
        alert("Cuenta guardada correctamente");
        setBancoGuardado(response);
        handleCancelar();
      })
      .catch((error) => {
        console.error("Error al guardar la cuenta:", error);
      });
  };

  const handleActualizarBanco = () => {
    const cedulaUsuario = localStorage.getItem("cedula_usuario");
    const bancoData = {
      cedula: cedulaUsuario,
      nombreCompleto: editBanco.nombreCompleto,
      banco: editBanco.banco,
      numeroCuenta: editBanco.numeroCuenta,
    };

    api
      .actualizarBanco(cedulaUsuario, bancoData)
      .then((response) => {
        alert("Información actualizada");
        setBancoGuardado(response);
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error al actualizar:", error);
      });
  };

  const formatearNumeroCuenta = (valor) => {
    const soloNumeros = valor.replace(/\D/g, "");
    const bloques = soloNumeros.match(/.{1,4}/g);
    if (bloques) {
      return bloques.join(" ");
    }
    return "";
  };

  const capitalizarNombre = (nombre) => {
    return nombre
      .toLowerCase()
      .split(" ")
      .map((palabra) => {
        if (palabra.length > 0) {
          return palabra[0].toUpperCase() + palabra.slice(1);
        } else {
          return "";
        }
      })
      .join(" ");
  };

  const handleNombreCompletoChange = (e) => {
    const valorTransformado = capitalizarNombre(e.target.value);
    setNuevoBanco({ ...nuevoBanco, nombreCompleto: valorTransformado });
  };

  const handleNumeroCuentaChange = (e) => {
    const valorFormateado = formatearNumeroCuenta(e.target.value);
    setNuevoBanco({ ...nuevoBanco, numeroCuenta: valorFormateado });
  };

  const handleChange = (e) => {
    setNuevoBanco({ ...nuevoBanco, [e.target.name]: e.target.value });
  };

  const bancosFiltrados = bancosDisponibles.filter((banco) =>
    banco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectBank = (banco) => {
    setBancoSeleccionado(banco);
    setNuevoBanco({ ...nuevoBanco, banco: banco });
    setShowDropdown(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario por cédula:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Función para abrir modal de edición
  const handleEditar = () => {
    setEditBanco({ ...bancoGuardado });
    setShowEditModal(true);
  };

  // Función para guardar cambios en modal
  const handleGuardarEdicion = () => {
    setBancoGuardado({ ...editBanco });
    setShowEditModal(false);
  };

  // Función para cancelar edición
  const handleCancelarEdicion = () => {
    setShowEditModal(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {/* Menu lateral */}
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <TbWallet size={28} className="text-gray-700" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Mi banco</h1>
            </div>
          </div>

          {/* Tarjetas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {!bancoGuardado && (
              <div
                className="bg-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out border-t-4 border-gray-300 cursor-pointer flex items-center justify-center"
                onClick={handleAgregarBanco}
              >
                <div className="flex flex-col items-center p-6 text-gray-600">
                  <TbPlus size={32} className="mb-2" />
                  <span className="font-semibold">Agregar Banco</span>
                </div>
              </div>
            )}
          </section>

          {/* Formulario para agregar banco */}
          {showBankForm && (
            <div className="bg-black/50 backdrop backdrop-opacity-60 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                className={`bg-white p-6 rounded-lg shadow-lg max-w-md w-full transform transition-transform duration-300 ${
                  showFormAnimated
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                }`}
              >
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Agregar Nuevo Banco</h2>
                  <button
                    onClick={handleCancelar}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Cerrar"
                  >
                    <TbX size={20} />
                  </button>
                </div>
                {/* Formulario */}
                <div className="space-y-4">
                  {/* Banco */}
                  <div className="mb-4 relative" ref={dropdownRef}>
                    <label className="block mb-1 font-semibold">Banco</label>
                    <div
                      className="border border-gray-300 rounded px-3 py-2 cursor-pointer flex justify-between items-center"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <span>{bancoSeleccionado || "Selecciona un banco"}</span>
                      <TbChevronDown 
                        size={16} 
                        className={`transform transition-transform duration-200 ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {showDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded max-h-60 overflow-y-auto shadow-lg">
                        <div className="flex items-center px-3 py-2 border-b border-gray-300">
                          <TbSearch size={16} className="text-gray-400 mr-2" />
                          <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full focus:outline-none"
                          />
                        </div>
                        {bancosFiltrados.length > 0 ? (
                          bancosFiltrados.map((banco, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelectBank(banco)}
                            >
                              {banco}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500">
                            No hay resultados
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Cédula */}
                  <div>
                    <label className="block mb-1 font-semibold">Cédula</label>
                    <input
                      type="text"
                      name="cedula"
                      value={nuevoBanco.cedula}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  {/* Nombre Completo */}
                  <div>
                    <label className="block mb-1 font-semibold">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="nombreCompleto"
                      name="nombreCompleto"
                      value={nuevoBanco.nombreCompleto}
                      onChange={(e) =>
                        setNuevoBanco({
                          ...nuevoBanco,
                          nombreCompleto: e.target.value,
                        })
                      }
                      onBlur={(e) => {
                        const nombreFormateado = capitalizarNombre(
                          e.target.value
                        );
                        setNuevoBanco({
                          ...nuevoBanco,
                          nombreCompleto: nombreFormateado,
                        });
                      }}
                      placeholder="Ingresa tu nombre completo"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  {/* Número de Cuenta */}
                  <div>
                    <label className="block mb-1 font-semibold">
                      Número de Cuenta
                    </label>
                    <input
                      type="text"
                      name="numeroCuenta"
                      value={nuevoBanco.numeroCuenta}
                      onChange={handleNumeroCuentaChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                {/* Botones */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleCancelar}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 flex items-center"
                  >
                    <TbX size={16} className="mr-1" />
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setNuevoBanco({
                        ...nuevoBanco,
                        banco: bancoSeleccionado,
                      });
                      handleGuardarBanco();
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    disabled={!bancoSeleccionado}
                  >
                    <TbCheck size={16} className="mr-1" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sección para mostrar info guardada y editar */}
          {bancoGuardado && (
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mx-auto">
              {/* Encabezado y botón */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 tracking-wide">
                  Información Guardada
                </h3>
                <button
                  onClick={handleEditar}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
                >
                  <TbEdit size={16} className="mr-1" />
                  Editar
                </button>
              </div>
              {/* Contenido de la tarjeta */}
              <div className="space-y-6">
                {/* Cédula */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shadow-md mr-4 transition hover:bg-purple-200">
                    <TbId size={20} />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      <span className="font-medium">Cédula de Identidad:</span>{" "}
                      {bancoGuardado.cedula_titular}
                    </p>
                  </div>
                </div>
                {/* Nombre */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shadow-md mr-4 transition hover:bg-pink-200">
                    <TbUser size={20} />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      <span className="font-medium">Nombre del Titular:</span>{" "}
                      {bancoGuardado.nombre_completo}
                    </p>
                  </div>
                </div>
                {/* Banco */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shadow-md mr-4 transition hover:bg-green-200">
                    <TbBuildingBank size={20} />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      <span className="font-medium">Banco:</span>{" "}
                      {bancoGuardado.banco}
                    </p>
                  </div>
                </div>
                {/* Número de Cuenta */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shadow-md mr-4 transition hover:bg-yellow-200">
                    <TbCreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      <span className="font-medium">Número de Cuenta:</span>{" "}
                      {bancoGuardado.numero_cuenta}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>

      {/* Modal para editar */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Información</h2>
              <button
                onClick={handleCancelarEdicion}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <TbX size={20} />
              </button>
            </div>
            {editBanco && (
              <div className="space-y-4">
                {/* Cédula */}
                <div>
                  <label className="block mb-1 font-semibold">Cédula</label>
                  <input
                    type="text"
                    value={editBanco.cedula_titular}
                    onChange={(e) =>
                      setEditBanco({ ...editBanco, cedula_titular: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                {/* Nombre */}
                <div>
                  <label className="block mb-1 font-semibold">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={editBanco.nombre_completo}
                    onChange={(e) =>
                      setEditBanco({
                        ...editBanco,
                        nombre_completo: e.target.value,
                      })
                    }
                    onBlur={(e) => {
                      const nombreFormateado = capitalizarNombre(
                        e.target.value
                      );
                      setEditBanco({
                        ...editBanco,
                        nombreCompleto: nombreFormateado,
                      });
                    }}
                    placeholder="Ingresa tu nombre completo"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                {/* Banco (dropdown) */}
                <div className="mb-4 relative" ref={dropdownRef}>
                  <label className="block mb-1 font-semibold">Banco</label>
                  <div
                    className="border border-gray-300 rounded px-3 py-2 cursor-pointer flex justify-between items-center"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span>{editBanco.banco || "Selecciona un banco"}</span>
                    <TbChevronDown 
                      size={16} 
                      className={`transform transition-transform duration-200 ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded max-h-60 overflow-y-auto shadow-lg">
                      <div className="flex items-center px-3 py-2 border-b border-gray-300">
                        <TbSearch size={16} className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full focus:outline-none"
                        />
                      </div>
                      {bancosFiltrados.length > 0 ? (
                        bancosFiltrados.map((banco, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectBank(banco)}
                          >
                            {banco}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          No hay resultados
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Número de Cuenta */}
                <div>
                  <label className="block mb-1 font-semibold">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    value={editBanco.numero_cuenta}
                    onChange={(e) =>
                      setEditBanco({
                        ...editBanco,
                        numero_cuenta: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            )}
            {/* Botones */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancelarEdicion}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 flex items-center"
              >
                <TbX size={16} className="mr-1" />
                Cancelar
              </button>
              <button
                onClick={handleGuardarEdicion}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <TbCheck size={16} className="mr-1" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;