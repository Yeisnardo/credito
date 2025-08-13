import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Asegúrate de importar axios
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import {
  getContratos,
  registrarContratoPorCedula,
  asignarNumeroContratoPorCedula,
} from "../services/api_contrato";

const gestionnumero_contratos = ({ setUser }) => {
  const navigate = useNavigate();

  // Estados principales
  const [menuOpen, setMenuOpen] = useState(true);
  const [numero_contratos, setnumero_contratos] = useState([]);
  const [user, setUserState] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Estado para la tasa de cambio
  const [exchangeRate, setExchangeRate] = useState(null);

  // Estados para manejo de modales y datos
  const [nuevonumero_contrato, setNuevonumero_contrato] = useState({
    cedula_emprendedor: "",
    nombre_apellido: "",
    numero_contrato: "",
    estatus: "Pendiente",
    fecha_desde: "",
    fecha_hasta: "",
    monto_euros: "",
    monto_bs: "",
    monto_flat: "",
    monto_interes: "",
    monto_devolver: "",
    referencia: "",
    banco: "",
    numero_cuenta: "",
    titular: "",
  });
  const [numero_contratoSeleccionado, setnumero_contratoSeleccionado] =
    useState(null);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalDeposito, setMostrarModalDeposito] = useState(false);
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [montoDeposito, setMontoDeposito] = useState("");
  const [referenciaDeposito, setReferenciaDeposito] = useState("");
  const [fechaDeposito, setFechaDeposito] = useState("");
  const [monto_bs_calculado, setMonto_bs_calculado] = useState("");
  const [calculatedMonto5, setCalculatedMonto5] = useState(0);
  const [calculatedMonto10, setCalculatedMonto10] = useState(0);
  const [calculatedMontoDevolver, setCalculatedMontoDevolver] = useState(0);

  // Función para alternar menú
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // useEffect para actualizar monto en Bs. automáticamente
  useEffect(() => {
    if (nuevonumero_contrato.monto_euros && exchangeRate) {
      const euros = parseFloat(nuevonumero_contrato.monto_euros);
      if (!isNaN(euros)) {
        const bs = euros * exchangeRate;
        setMonto_bs_calculado(bs.toFixed(2));
      } else {
        setMonto_bs_calculado("");
      }
    } else {
      setMonto_bs_calculado("");
    }
  }, [nuevonumero_contrato.monto_euros, exchangeRate]);

  useEffect(() => {
    const euros = parseFloat(nuevonumero_contrato.monto_euros);
    if (!isNaN(euros)) {
      const monto5 = euros * 0.05;
      const monto10 = euros * 0.1;
      const montoDevolver = euros + monto10;
      setCalculatedMonto5(monto5.toFixed(2));
      setCalculatedMonto10(monto10.toFixed(2));
      setCalculatedMontoDevolver(montoDevolver.toFixed(2));
    } else {
      setCalculatedMonto5("0.00");
      setCalculatedMonto10("0.00");
      setCalculatedMontoDevolver("0.00");
    }
  }, [nuevonumero_contrato.monto_euros]);

  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/EUR"
      );
      setExchangeRate(response.data.rates.VES);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  // Cargar tasa de cambio y datos de contratos
  useEffect(() => {
    fetchExchangeRate();
    getContratos()
      .then((data) => {
        setnumero_contratos(data);
        localStorage.setItem("numero_contratos", JSON.stringify(data));
      })
      .catch((err) => {
        console.error("Error loading data from API:", err);
        const storedData =
          JSON.parse(localStorage.getItem("numero_contratos")) || [];
        setnumero_contratos(storedData);
      });
  }, []);

  useEffect(() => {
    if (nuevonumero_contrato.fecha_desde) {
      const fechaInicio = new Date(nuevonumero_contrato.fecha_desde);
      const diasASumar = 20 * 7; // 20 semanas * 7 días
      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaInicio.getDate() + diasASumar);
      const yyyy = fechaFin.getFullYear();
      const mm = String(fechaFin.getMonth() + 1).padStart(2, "0");
      const dd = String(fechaFin.getDate()).padStart(2, "0");
      const fechaFinFormateada = `${yyyy}-${mm}-${dd}`;
      setNuevonumero_contrato((prev) => ({
        ...prev,
        fecha_hasta: fechaFinFormateada,
      }));
    }
  }, [nuevonumero_contrato.fecha_desde]);

  // Filtro por búsqueda
  const contratosFiltrados = numero_contratos.filter((contrato) => {
    const nombreCompleto = contrato.nombre_completo || "";
    const cedula = contrato.cedula || "";
    const numeroContrato = contrato.numero_contrato || "";
    const busquedaLower = busqueda.toLowerCase();

    return (
      nombreCompleto.toLowerCase().includes(busquedaLower) ||
      cedula.toLowerCase().includes(busquedaLower) ||
      numeroContrato.toLowerCase().includes(busquedaLower)
    );
  });

  // Agrupar contratos por cédula
  const contratosPorCedula = Object.entries(
    contratosFiltrados.reduce((acc, contrato) => {
      const cedula = contrato.cedula || "sin_cedula";
      if (!acc[cedula]) {
        acc[cedula] = [];
      }
      acc[cedula].push(contrato);
      return acc;
    }, {})
  );

  // Funciones para manejar modales y acciones
  const handleVerListanumero_contratos = (contrato) => {
    setnumero_contratoSeleccionado(contrato);
    setMostrarModalDetalle(true);
  };

  const handleCerrarModal = () => {
    setMostrarModalDetalle(false);
    setnumero_contratoSeleccionado(null);
  };

  const handleAbrirModalDeposito = (contrato) => {
    setnumero_contratoSeleccionado(contrato);
    setMontoDeposito("");
    setReferenciaDeposito("");
    setFechaDeposito("");
    setMostrarModalDeposito(true);
  };

  const handleCerrarModalDeposito = () => {
    setMostrarModalDeposito(false);
  };

  const handleDepositar = () => {
    const monto = parseFloat(montoDeposito);
    if (!montoDeposito || isNaN(monto) || monto <= 0) {
      alert("Ingresa un monto válido");
      return;
    }
    alert(
      `Depósito de ${montoDeposito} realizado en la cuenta del número_contrato ${numero_contratoSeleccionado?.numero_contrato}`
    );
    setMontoDeposito("");
    setReferenciaDeposito("");
    setFechaDeposito("");
    setMostrarModalDeposito(false);
  };

  const handleAbrirModalRegistro = () => {
    const nuevoNumero = generarNumeroContrato();
    setNuevonumero_contrato({
      cedula_emprendedor: "",
      nombre_apellido: "",
      numero_contrato: nuevoNumero,
      estatus: "Pendiente",
      fecha_desde: "",
      fecha_hasta: "",
      monto_euros: "",
      monto_bs: "",
      monto_flat: "",
      monto_interes: "",
      monto_devolver: "",
      referencia: "",
      banco: "",
      numero_cuenta: "",
      titular: "",
    });
    setMostrarModalRegistro(true);
  };

  const handleCerrarModalRegistro = () => {
    setMostrarModalRegistro(false);
  };

  const handleRegistrarnumero_contrato = async () => {
    const {
      cedula_emprendedor,
      nombre_apellido,
      numero_contrato,
      estatus,
      fecha_desde,
      fecha_hasta,
      monto_euros,
    } = nuevonumero_contrato;

    if (
      !cedula_emprendedor ||
      !nombre_apellido ||
      !fecha_desde ||
      !fecha_hasta ||
      !monto_euros
    ) {
      alert("Por favor, complete todos los campos requeridos");
      return;
    }

    const contratoData = {
      id_contrato: numero_contrato,
      monto_aprob_euro: monto_euros,
      cincoflat: calculatedMonto5,
      diezinteres: calculatedMonto10,
      monto_devolver: calculatedMontoDevolver,
      fecha_desde: fecha_desde,
      fecha_hasta: fecha_hasta,
      estatus: estatus,
    };

    try {
      const response = await registrarContratoPorCedula(
        contratoData,
        cedula_emprendedor
      );
      alert(response.message || "Contrato registrado exitosamente");
      // Agregar el nuevo contrato a la lista
      setnumero_contratos((prev) => [...prev, response.contrato]);
      localStorage.setItem(
        "numero_contratos",
        JSON.stringify([...numero_contratos, response.contrato])
      );
      setMostrarModalRegistro(false);
    } catch (error) {
      console.error("Error al registrar contrato:", error);
      alert("Error al registrar contrato");
    }
  };

  const generarNumeroContrato = () => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const storageKey = "contador_contrato";

    let contador = parseInt(localStorage.getItem(storageKey), 10);
    if (isNaN(contador)) {
      contador = 1;
    } else {
      contador += 1;
    }
    localStorage.setItem(storageKey, contador.toString());
    const numeroSecuencial = String(contador).padStart(3, "0");
    const numeroContrato = `IFEMI/CRED-${numeroSecuencial}-${currentYear}`;
    return numeroContrato;
  };

  const handleAsignarNumero = async (contrato) => {
    const nuevoNumeroContrato = generarNumeroContrato();
    try {
      const response = await asignarNumeroContratoPorCedula(
        contrato.cedula,
        nuevoNumeroContrato
      );
      alert(
        `Número de contrato asignado correctamente: ${response.message || ""}`
      );
      // Actualizar contrato en la lista
      setnumero_contratos((prev) =>
        prev.map((c) =>
          c.cedula === contrato.cedula &&
          c.numero_contrato !== nuevoNumeroContrato
            ? { ...c, numero_contrato: nuevoNumeroContrato }
            : c
        )
      );
    } catch (error) {
      console.error("Error asignando número de contrato:", error);
      alert("Error al asignar el número de contrato.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
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
          {/* Título y icono */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-file text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Gestión de contratos
              </h1>
            </div>
            {exchangeRate && (
              <p className="text-gray-600">
                Precio del Euro en Bs.: {exchangeRate} Bs.
              </p>
            )}
          </div>

          {/* Buscador */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o número de contrato"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Lista agrupada por cédula con estilos viejos */}
          <section className="mb-8">
            {contratosPorCedula.length === 0 ? (
              <p>No hay contratos para mostrar.</p>
            ) : (
              contratosPorCedula.map(([cedula, contratos]) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    key={cedula}
                    className="bg-white p-4 mb-4 rounded-xl shadow-lg"
                  >
                    <h3 className="text-xl font-semibold mb-2">
                      Cédula: {cedula}
                    </h3>
                    {/* Mostrar info del primer contrato */}
                    <p>
                      <strong>Nombre:</strong>{" "}
                      {contratos[0]?.nombre_completo || "N/A"}
                    </p>
                    <p>
                      <strong>N° de contratos:</strong> {contratos.length}
                    </p>
                    {/* Lista de contratos */}
                    {contratos.map((contrato) => (
                      <div
                        key={contrato.numero_contrato}
                        className="border-t mt-2 pt-2"
                      >
                        <p>
                          <strong>Contrato:</strong> {contrato.numero_contrato}
                        </p>
                        {/* Botones para acciones */}
                        <div className="mt-2 flex space-x-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() =>
                              handleVerListanumero_contratos(contrato)
                            }
                          >
                            Ver detalles
                          </button>
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            onClick={() => handleAsignarNumero(contrato)}
                          >
                            Asignar Número
                          </button>
                          <button
                            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
                            onClick={() => {
                              setNuevonumero_contrato({
                                ...nuevonumero_contrato,
                                cedula_emprendedor: contrato.cedula,
                                nombre_apellido:
                                  contrato.nombre_completo ||
                                  "Nombre no disponible",
                              });
                              setMostrarModalRegistro(true);
                            }}
                          >
                            Registrar nuevo contrato
                          </button>
                          <button
                            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
                            onClick={() => handleAbrirModalDeposito(contrato)}
                          >
                            Realizar depósito
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>

      {/* Modal detalles */}
      {mostrarModalDetalle && (
        <div className="bg-black/50 backdrop backdrop-opacity-60 fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg max-w-9xl w-full relative shadow-lg overflow-y-auto max-h-full">
            {/* Botón cerrar */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={handleCerrarModal}
            >
              ✖
            </button>
            {/* Contenido detalles */}
            <h2 className="text-xl font-semibold mb-4">
              Detalles de {numero_contratoSeleccionado?.nombre_completo}
            </h2>
            {numero_contratoSeleccionado && (
              <div>
                {/* Información general */}
                <p>
                  <strong>Número:</strong>{" "}
                  {numero_contratoSeleccionado.numero_contrato}
                </p>
                <p>
                  <strong>Estatus:</strong>{" "}
                  {numero_contratoSeleccionado.estatus_contrato}
                </p>
                <p>
                  <strong>Fecha inicio:</strong>{" "}
                  {numero_contratoSeleccionado.fecha_desde}
                </p>
                <p>
                  <strong>Fecha fin:</strong>{" "}
                  {numero_contratoSeleccionado.fecha_hasta}
                </p>
                <p>
                  <strong>Monto aprobado en euros:</strong>{" "}
                  {numero_contratoSeleccionado.monto_aprob_euro}
                </p>
                <p>
                  <strong>Monto 5% FLAT:</strong>{" "}
                  {numero_contratoSeleccionado.cincoflat}
                </p>
                <p>
                  <strong>Monto 10% Interes:</strong>{" "}
                  {numero_contratoSeleccionado.diezinteres}
                </p>
                <p>
                  <strong>Monto a devolver:</strong>{" "}
                  {numero_contratoSeleccionado.monto_devolver}
                </p>
                <p>
                  <strong>Referencia:</strong>{" "}
                  {numero_contratoSeleccionado.referencia}
                </p>
                {/* Datos de cuenta bancaria */}
                <h4 className="font-semibold mt-4 mb-2">
                  Datos de la cuenta bancaria
                </h4>
                <table className="min-w-full divide-y divide-gray-200 table-auto mb-4">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-2 border-b border-gray-200">
                        Banco
                      </th>
                      <th className="px-4 py-2 border-b border-gray-200">
                        Número de cuenta
                      </th>
                      <th className="px-4 py-2 border-b border-gray-200">
                        Titular
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-800">
                    <tr>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {numero_contratoSeleccionado.cuenta_bancaria?.banco ||
                          ""}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {numero_contratoSeleccionado.cuenta_bancaria
                          ?.numero_cuenta || ""}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {numero_contratoSeleccionado.cuenta_bancaria?.titular ||
                          ""}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Detalles del depósito */}
                <h4 className="font-semibold mb-2">Detalles del depósito</h4>
                <table className="min-w-full divide-y divide-gray-200 table-auto mb-4">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-2 border-b border-gray-200">
                        Referencia
                      </th>
                      <th className="px-4 py-2 border-b border-gray-200">
                        Fecha
                      </th>
                      <th className="px-4 py-2 border-b border-gray-200">
                        Medio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-800">
                    <tr>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {numero_contratoSeleccionado.detalle_deposito
                          ?.referencia || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {numero_contratoSeleccionado.detalle_deposito?.fecha ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {numero_contratoSeleccionado.detalle_deposito?.medio ||
                          "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal registrar nuevo contrato */}
      {mostrarModalRegistro && (
        <div className="bg-black/50 backdrop backdrop-opacity-60 fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full relative shadow-lg overflow-y-auto max-h-full">
            {/* Botón cerrar */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={handleCerrarModalRegistro}
              aria-label="Cerrar"
            >
              ✖
            </button>
            {/* Título */}
            <h2 className="text-xl font-semibold mb-4">
              Registrar Nuevo Número Contrato
            </h2>
            {/* Formulario */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegistrarnumero_contrato();
              }}
            >
              {/* Campos del formulario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Cédula */}
                <div>
                  <label
                    className="block mb-1 font-medium"
                    htmlFor="cedula_emprendedor"
                  >
                    Cédula
                  </label>
                  <input
                    id="cedula_emprendedor"
                    type="text"
                    placeholder="Cédula"
                    value={nuevonumero_contrato.cedula_emprendedor}
                    onChange={(e) =>
                      setNuevonumero_contrato({
                        ...nuevonumero_contrato,
                        cedula_emprendedor: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Nombre y Apellido */}
                <div>
                  <label
                    className="block mb-1 font-medium"
                    htmlFor="nombre_apellido"
                  >
                    Nombre y Apellido
                  </label>
                  <input
                    id="nombre_apellido"
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={nuevonumero_contrato.nombre_apellido}
                    onChange={(e) =>
                      setNuevonumero_contrato({
                        ...nuevonumero_contrato,
                        nombre_apellido: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Fecha Inicio */}
                <div>
                  <label
                    className="block mb-1 font-medium"
                    htmlFor="fecha_desde"
                  >
                    Fecha Inicio
                  </label>
                  <input
                    id="fecha_desde"
                    type="date"
                    value={nuevonumero_contrato.fecha_desde}
                    onChange={(e) =>
                      setNuevonumero_contrato({
                        ...nuevonumero_contrato,
                        fecha_desde: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Fecha Fin */}
                <div>
                  <label
                    className="block mb-1 font-medium"
                    htmlFor="fecha_hasta"
                  >
                    Fecha Fin (calculada)
                  </label>
                  <input
                    id="fecha_hasta"
                    type="date"
                    value={nuevonumero_contrato.fecha_hasta}
                    readOnly
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed"
                  />
                </div>
                {/* Monto en Euros */}
                <div>
                  <label
                    className="block mb-1 font-medium"
                    htmlFor="monto_euros"
                  >
                    Monto en Euros
                  </label>
                  <input
                    id="monto_euros"
                    type="text"
                    placeholder="Monto en Euros"
                    value={nuevonumero_contrato.monto_euros}
                    onChange={(e) =>
                      setNuevonumero_contrato({
                        ...nuevonumero_contrato,
                        monto_euros: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Monto en Bs.S */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="monto_bs">
                    Monto en Bs.S
                  </label>
                  <input
                    id="monto_bs"
                    type="text"
                    placeholder="Monto en Bs.S"
                    value={monto_bs_calculado}
                    readOnly
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed"
                  />
                </div>
                {/* Monto 5% FLAT */}
                <div>
                  <label
                    className="block mb-1 font-medium"
                    htmlFor="monto_flat"
                  >
                    Monto 5% FLAT
                  </label>
                  <input
                    id="monto_flat"
                    type="text"
                    value={calculatedMonto5}
                    readOnly
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Monto 10% de Interés */}
                <div>
                  <label
                    className="block mb-1 font-medium"
                    htmlFor="monto_interes"
                  >
                    Monto 10% de Interés
                  </label>
                  <input
                    id="monto_interes"
                    type="text"
                    value={calculatedMonto10}
                    readOnly
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Monto a devolver */}
                <div>
                  <label
                    className="block mb-1 font-medium"
                    htmlFor="monto_devolver"
                  >
                    Monto a devolver
                  </label>
                  <input
                    id="monto_devolver"
                    type="text"
                    value={calculatedMontoDevolver}
                    readOnly
                    className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Registrar
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  onClick={handleCerrarModalRegistro}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal realizar depósito */}
      {mostrarModalDeposito && (
        <div className="bg-black/50 backdrop backdrop-opacity-60 fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full relative shadow-lg overflow-y-auto max-h-full">
            {/* Botón cerrar */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={handleCerrarModalDeposito}
            >
              ✖
            </button>
            {/* Título */}
            <h2 className="text-xl font-semibold mb-4">Realizar Depósito</h2>
            {/* Formulario */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const monto = parseFloat(montoDeposito);
                if (!montoDeposito || isNaN(monto) || monto <= 0) {
                  alert("Ingresa un monto válido");
                  return;
                }
                alert(
                  `Depósito de ${monto} realizado en la cuenta del número_contrato ${numero_contratoSeleccionado?.numero_contrato}`
                );
                setReferenciaDeposito("");
                setFechaDeposito("");
                setMostrarModalDeposito(false);
              }}
              className="flex flex-col gap-4"
            >
              {/* Referencia */}
              <input
                type="text"
                placeholder="Referencia"
                value={referenciaDeposito}
                onChange={(e) => setReferenciaDeposito(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                required
              />
              {/* Fecha */}
              <input
                type="date"
                placeholder="Fecha"
                value={fechaDeposito}
                onChange={(e) => setFechaDeposito(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                required
              />
              {/* Botón */}
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Depositar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default gestionnumero_contratos;
