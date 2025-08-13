import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from "../services/api_usuario";

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showFormCarousel, setShowFormCarousel] = useState(false);
  const [slideDirection, setSlideDirection] = useState("right"); // "right" para mostrar, "left" para esconder

  const [nuevoBanco, setNuevoBanco] = useState({
    cedula: "",
    nombreCompleto: "",
    banco: "",
    numeroCuenta: "",
  });

  // Lista de bancos disponibles
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
  const [mensaje, setMensaje] = useState(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleAgregarBanco = () => {
    setShowBankForm(true);
  };

  // Función para manejar cambios en la cédula y permitir solo números
  const handleCedulaChange = (e) => {
    const valorSoloNumeros = e.target.value.replace(/\D/g, "");
    setNuevoBanco({ ...nuevoBanco, cedula: valorSoloNumeros });
  };

  const handleGuardarBanco = () => {
    alert(
      `Nuevo Banco:\nCédula: ${nuevoBanco.cedula}\nNombre: ${nuevoBanco.nombreCompleto}\nBanco: ${nuevoBanco.banco}\nNúmero de Cuenta: ${nuevoBanco.numeroCuenta}`
    );
    setMensaje("Banco guardado exitosamente");
    setTimeout(() => setMensaje(null), 3000);
    setShowBankForm(false);
    setNuevoBanco({
      cedula: "",
      nombreCompleto: "",
      banco: "",
      numeroCuenta: "",
    });
    setFiltroBanco("");
    setBancoSeleccionado("");
    setSearchTerm("");
  };

  const handleCancelar = () => {
    setShowBankForm(false);
    setNuevoBanco({
      cedula: "",
      nombreCompleto: "",
      banco: "",
      numeroCuenta: "",
    });
    setFiltroBanco("");
    setBancoSeleccionado("");
    setSearchTerm("");
  };

  // Función para formatear número de cuenta con espacios cada 4 dígitos
  const formatearNumeroCuenta = (valor) => {
    const soloNumeros = valor.replace(/\D/g, "");
    const bloques = soloNumeros.match(/.{1,4}/g);
    return bloques ? bloques.join(" ") : "";
  };

  // Función para convertir en título cada palabra
  const capitalizarNombre = (nombre) => {
    return nombre
      .toLowerCase()
      .split(" ")
      .map((palabra) =>
        palabra.length > 0 ? palabra[0].toUpperCase() + palabra.slice(1) : ""
      )
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

  // Filtrar bancos según búsqueda
  const bancosFiltrados = bancosDisponibles.filter((banco) =>
    banco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar dropdown al hacer clic fuera
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

  // Simular fetch usuario
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

  // Validación para botón guardar
  const isFormValid =
    nuevoBanco.cedula.trim() !== "" &&
    nuevoBanco.nombreCompleto.trim() !== "" &&
    nuevoBanco.banco.trim() !== "" &&
    nuevoBanco.numeroCuenta.trim() !== "" &&
    bancoSeleccionado !== "";

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif transition-all duration-300">
      {mensaje && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
          {mensaje}
        </div>
      )}
      {/* Menu lateral */}
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-wallet text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Mi banco</h1>
            </div>
          </div>

          {/* Tarjetas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Tarjeta para agregar banco */}
            <div
              className="bg-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out border-t-4 border-gray-300 cursor-pointer flex items-center justify-center"
              onClick={handleAgregarBanco}
            >
              <div className="flex flex-col items-center p-6 text-gray-600">
                <i className="bx bx-plus-circle text-4xl mb-2"></i>
                <span className="font-semibold">Agregar Banco</span>
              </div>
            </div>
          </section>

          {/* Formulario para agregar banco */}
          {showBankForm && (
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mb-8 transition-all duration-300 opacity-100">
              <h2 className="text-xl font-semibold mb-4">
                Agregar Nuevo Banco
              </h2>
              {/* Buscador de bancos con select personalizado */}
              <div className="mb-4 relative" ref={dropdownRef}>
                <label className="block mb-1 font-semibold">Banco</label>
                <div
                  className="border border-gray-300 rounded px-3 py-2 cursor-pointer flex justify-between items-center transition-all duration-300"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span>{bancoSeleccionado || "Selecciona un banco"}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded max-h-60 overflow-y-auto shadow-lg transition-all duration-300 opacity-100">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none"
                    />
                    {bancosFiltrados.length > 0 ? (
                      bancosFiltrados.map((banco, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
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
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={nuevoBanco.cedula}
                  onChange={handleCedulaChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Solo números"
                />
              </div>
              {/* Nombre Completo */}
              <div className="mb-4">
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
                    const nombreFormateado = capitalizarNombre(e.target.value);
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
              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  name="numeroCuenta"
                  value={nuevoBanco.numeroCuenta}
                  onChange={handleNumeroCuentaChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Solo dígitos"
                />
              </div>
              {/* Botones */}
              <div className="flex justify-end space-x-2 mt-4 transition-all duration-300">
                <button
                  onClick={handleCancelar}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setNuevoBanco({ ...nuevoBanco, banco: bancoSeleccionado });
                    handleGuardarBanco();
                  }}
                  disabled={!isFormValid}
                  className={`px-4 py-2 rounded text-white ${
                    !isFormValid
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  }`}
                >
                  Guardar
                </button>
              </div>
            </div>
          )}
        </main>
        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600 transition-all duration-300">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
