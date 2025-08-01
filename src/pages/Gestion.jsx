import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const gestionContratos = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [contratos, setContratos] = useState([]);
  const [user, setUserState] = useState(null);

  // Estado para depósito
  const [montoDeposito, setMontoDeposito] = useState("");
  const [referenciaDeposito, setReferenciaDeposito] = useState('');
  const [fechaDeposito, setFechaDeposito] = useState('');
  const [mostrarModalDeposito, setMostrarModalDeposito] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);

  // Estado para registrar nuevo contrato
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [nuevoContrato, setNuevoContrato] = useState({
    cedula: "",
    nombre_apellido: "",
    contrato: "",
    estatus: "Pendiente",
    fecha_inicio: "",
    fecha_final: "",
    monto_total: "",
    referencia: "",
    cuenta_bancaria: {
      banco: "",
      numero_cuenta: "",
      titular: "",
    },
  });

  // Para listado y gestión de contratos por cédula
  const [listaContratos, setListaContratos] = useState([]);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);

  // Toggle menú
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Datos simulados y carga en localStorage
  const datosSimuladosContratos = [
    {
      cedula: "12345678",
      nombre_apellido: "Juan Pérez",
      contrato: "ifemi-001-25",
      estatus: "Aceptado",
      fecha_inicio: "2024-01-01",
      fecha_final: "2024-12-31",
      monto_total: "1000",
      referencia: "REF12345",
      cuenta_bancaria: {
        banco: "Banco XYZ",
        numero_cuenta: "0123456789",
        titular: "Juan Pérez",
      },
    },
    {
      cedula: "12345678",
      nombre_apellido: "Juan Pérez",
      contrato: "C-003",
      estatus: "Pendiente",
      fecha_inicio: "2024-03-01",
      fecha_final: "2024-08-30",
      monto_total: "500",
      referencia: "REF67890",
      cuenta_bancaria: {
        banco: "Banco XYZ",
        numero_cuenta: "0123456789",
        titular: "Juan Pérez",
      },
    },
    {
      cedula: "87654321",
      nombre_apellido: "María López",
      contrato: "C-002",
      estatus: "Pendiente",
      fecha_inicio: "2024-02-01",
      fecha_final: "2024-11-30",
      monto_total: "2000",
      referencia: "REF54321",
      cuenta_bancaria: {
        banco: "Banco ABC",
        numero_cuenta: "9876543210",
        titular: "María López",
      },
    },
  ];

  useEffect(() => {
    const storedContratos = JSON.parse(localStorage.getItem("contratos")) || [];
    if (storedContratos.length === 0) {
      localStorage.setItem(
        "contratos",
        JSON.stringify(datosSimuladosContratos)
      );
      setContratos(datosSimuladosContratos);
    } else {
      setContratos(storedContratos);
    }
  }, []);

  const contratosAgrupados = Object.values(
    contratos.reduce((acc, c) => {
      if (!acc[c.cedula]) {
        acc[c.cedula] = [];
      }
      acc[c.cedula].push(c);
      return acc;
    }, {})
  );

  // Funciones para gestionar contratos
  const handleVerListaContratos = (cedula) => {
    const contratosDeCedula = contratos.filter((c) => c.cedula === cedula);
    setListaContratos(contratosDeCedula);
    setContratoSeleccionado(contratosDeCedula[0]);
    setMostrarModalDetalle(true);
  };

  const handleCerrarModal = () => {
    setMostrarModalDetalle(false);
    setContratoSeleccionado(null);
    setListaContratos([]);
  };

  const handleGestionarContrato = (contrato) => {
    setContratoSeleccionado(contrato);
  };

  const handleAbrirModalDeposito = (contrato) => {
    setContratoSeleccionado(contrato);
    setMontoDeposito("");
    setReferenciaDeposito("");
    setFechaDeposito("");
    setMostrarModalDeposito(true);
  };

  const handleCerrarModalDeposito = () => {
    setMostrarModalDeposito(false);
  };

  const handleDepositar = () => {
    if (!montoDeposito || isNaN(parseFloat(montoDeposito)) || parseFloat(montoDeposito) <= 0) {
      alert("Ingresa un monto válido");
      return;
    }
    alert(
      `Depósito de ${montoDeposito} realizado en la cuenta del contrato ${contratoSeleccionado?.contrato}`
    );
    setMontoDeposito("");
    setReferenciaDeposito("");
    setFechaDeposito("");
    setMostrarModalDeposito(false);
  };

  // Modal registro contrato
  const handleAbrirModalRegistro = () => {
    setNuevoContrato({
      cedula: "",
      nombre_apellido: "",
      contrato: "",
      estatus: "Pendiente",
      fecha_inicio: "",
      fecha_final: "",
      monto_total: "",
      referencia: "",
      cuenta_bancaria: {
        banco: "",
        numero_cuenta: "",
        titular: "",
      },
    });
    setMostrarModalRegistro(true);
  };

  const handleCerrarModalRegistro = () => {
    setMostrarModalRegistro(false);
  };

  const handleRegistrarContrato = () => {
    if (
      !nuevoContrato.cedula ||
      !nuevoContrato.nombre_apellido ||
      !nuevoContrato.contrato ||
      !nuevoContrato.fecha_inicio ||
      !nuevoContrato.fecha_final ||
      !nuevoContrato.monto_total
    ) {
      alert("Por favor, complete todos los campos requeridos");
      return;
    }

    const contratosExistentes = JSON.parse(localStorage.getItem("contratos")) || [];
    const nuevosContratos = [...contratosExistentes, nuevoContrato];
    localStorage.setItem("contratos", JSON.stringify(nuevosContratos));
    setContratos(nuevosContratos);
    alert("Nuevo contrato registrado");
    setMostrarModalRegistro(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {menuOpen && <Menu />}
      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}>
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-file text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Gestión de Contratos</h1>
            </div>
          </div>

          {/* Listado de contratos gestionados */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contratos gestionados</h2>
            {contratos.length === 0 ? (
              <p>No hay contratos gestionados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contratosAgrupados.map((grupo) => (
                  <div key={grupo[0].cedula} className="bg-white p-4 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">{grupo[0].nombre_apellido}</h3>
                      <p>
                        <strong>Cédula:</strong> {grupo[0].cedula}
                      </p>
                      <p>
                        <strong>N° contratos:</strong> {grupo.length}
                      </p>
                    </div>
                    {/* Botones */}
                    <button
                      className="mt-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                      onClick={() => handleVerListaContratos(grupo[0].cedula)}
                    >
                      Ver contratos
                    </button>
                    <button
                      className="mt-2 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                      onClick={() => {
                        setNuevoContrato({ ...nuevoContrato, cedula: grupo[0].cedula, nombre_apellido: grupo[0].nombre_apellido });
                        setMostrarModalRegistro(true);
                      }}
                    >
                      Registrar nuevo contrato
                    </button>
                    <button
                      className="mt-2 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                      onClick={() => handleAbrirModalDeposito(grupo[0])}
                    >
                      Realizar Deposito
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>

      {/* Modal detalles y lista de contratos */}
      {mostrarModalDetalle && (
        <div className="bg-black/50 backdrop backdrop-opacity-60 fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg max-w-9xl w-full relative shadow-lg overflow-y-auto max-h-full">
            {/* Cerrar */}
            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onClick={handleCerrarModal}>✖</button>
            {/* Contenido */}
            <h2 className="text-xl font-semibold mb-4">Contratos de {listaContratos[0]?.nombre_apellido}</h2>
            {listaContratos.length > 1 && (
              <div className="mb-4 border-b border-gray-300 pb-2">
                <h3 className="font-semibold mb-2">Selecciona un contrato para ver detalles:</h3>
                {listaContratos.map((contrato) => (
                  <button
                    key={contrato.contrato}
                    className={`block w-full text-left px-3 py-2 mb-2 rounded ${contratoSeleccionado?.contrato === contrato.contrato ? "bg-blue-100" : "hover:bg-gray-100"}`}
                    onClick={() => handleGestionarContrato(contrato)}
                  >
                    {contrato.contrato} - {contrato.estatus}
                  </button>
                ))}
              </div>
            )}
            {contratoSeleccionado && (
              <div>
                <h3 className="font-semibold mb-2">Detalles de {contratoSeleccionado.contrato}</h3>
                <p><strong>Número de contrato:</strong> {contratoSeleccionado.contrato}</p>
                <p><strong>Estatus:</strong> {contratoSeleccionado.estatus}</p>
                <p><strong>Fecha Inicio:</strong> {contratoSeleccionado.fecha_inicio}</p>
                <p><strong>Fecha Final:</strong> {contratoSeleccionado.fecha_final}</p>
                <p><strong>Monto Total:</strong> {contratoSeleccionado.monto_total}</p>
                <p><strong>Referencia:</strong> {contratoSeleccionado.referencia}</p>

                {/* Datos cuenta bancaria */}
                <h4 className="font-semibold mt-4 mb-2">Datos de la Cuenta Bancaria</h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-4">
                  <table className="min-w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-2 border-b border-gray-200">Banco</th>
                        <th className="px-4 py-2 border-b border-gray-200">Número de Cuenta</th>
                        <th className="px-4 py-2 border-b border-gray-200">Titular</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-800">
                      <tr>
                        <td className="px-4 py-2 border-b border-gray-200">{contratoSeleccionado.cuenta_bancaria?.banco || ""}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{contratoSeleccionado.cuenta_bancaria?.numero_cuenta || ""}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{contratoSeleccionado.cuenta_bancaria?.titular || ""}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Detalles depósito */}
                <h4 className="font-semibold mb-2">Detalles del Depósito</h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-4">
                  <table className="min-w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-2 border-b border-gray-200">Referencia</th>
                        <th className="px-4 py-2 border-b border-gray-200">Fecha</th>
                        <th className="px-4 py-2 border-b border-gray-200">Estatus</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-800">
                      <tr>
                        <td className="px-4 py-2 border-b border-gray-200">{contratoSeleccionado.detalle_deposito?.referencia || "N/A"}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{contratoSeleccionado.detalle_deposito?.fecha || "N/A"}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{contratoSeleccionado.detalle_deposito?.medio || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para registrar nuevo contrato */}
      {mostrarModalRegistro && (
        <div className="bg-black/50 backdrop backdrop-opacity-60 fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full relative shadow-lg overflow-y-auto max-h-full">
            {/* Cerrar */}
            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onClick={handleCerrarModalRegistro}>✖</button>
            {/* Formulario */}
            <h2 className="text-xl font-semibold mb-4">Registrar Nuevo Contrato</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleRegistrarContrato(); }}>
              {/* Campos del formulario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Cedula */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="cedula">Cédula</label>
                  <input
                    id="cedula"
                    type="text"
                    placeholder="Cédula"
                    value={nuevoContrato.cedula}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, cedula: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Nombre y Apellido */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="nombre_apellido">Nombre y Apellido</label>
                  <input
                    id="nombre_apellido"
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={nuevoContrato.nombre_apellido}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, nombre_apellido: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* N° Contrato (oculto) */}
                <div style={{ display: "none" }}>
                  <label className="block mb-1 font-medium" htmlFor="contrato">N° Contrato</label>
                  <input
                    id="contrato"
                    type="text"
                    placeholder="N° Contrato"
                    value={nuevoContrato.contrato}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, contrato: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Monto en Euros */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="monto_euros">Monto en Euros</label>
                  <input
                    id="monto_euros"
                    type="text"
                    placeholder="Monto en Euros"
                    value={nuevoContrato.contrato}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, contrato: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Monto en Bs.S */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="monto_bss">Monto en Bs.S</label>
                  <input
                    id="monto_bss"
                    type="text"
                    placeholder="Monto en Bs.S"
                    value={nuevoContrato.contrato}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, contrato: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Monto 5% FLAT */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="monto_total">Monto 5% FLAT</label>
                  <input
                    id="monto_total"
                    type="number"
                    placeholder="Monto Total"
                    value={nuevoContrato.monto_total}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, monto_total: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Monto 10% de Interes */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="referencia">Monto 10% de Interes</label>
                  <input
                    id="referencia"
                    type="text"
                    placeholder="Referencia"
                    value={nuevoContrato.referencia}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, referencia: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
                {/* Monto a devolver */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="monto_devolver">Monto a devolver</label>
                  <input
                    id="monto_devolver"
                    type="text"
                    placeholder="Monto a devolver"
                    value={nuevoContrato.referencia}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, referencia: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
                {/* Fecha Inicio */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="fecha_inicio">Fecha Inicio</label>
                  <input
                    id="fecha_inicio"
                    type="date"
                    placeholder="Fecha Inicio"
                    value={nuevoContrato.fecha_inicio}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, fecha_inicio: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                {/* Fecha Final */}
                <div>
                  <label className="block mb-1 font-medium" htmlFor="fecha_final">Fecha Final</label>
                  <input
                    id="fecha_final"
                    type="date"
                    placeholder="Fecha Final"
                    value={nuevoContrato.fecha_final}
                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, fecha_final: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    required
                  />
                </div>
              </div>
              {/* Botones */}
              <div className="flex justify-end space-x-2 mt-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Registrar</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={handleCerrarModalRegistro}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para depósito */}
      {mostrarModalDeposito && (
        <div className="bg-black/50 backdrop backdrop-opacity-60 fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full relative shadow-lg overflow-y-auto max-h-full">
            {/* Cerrar */}
            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onClick={handleCerrarModalDeposito} aria-label="Cerrar">✖</button>
            {/* Título */}
            <h2 className="text-xl font-semibold mb-4">Realizar Depósito</h2>
            {/* Formulario */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const monto = parseFloat(montoDeposito);
              if (!montoDeposito || isNaN(monto) || monto <= 0) {
                alert("Ingresa un monto válido");
                return;
              }
              alert(`Depósito de ${monto} realizado en la cuenta del contrato ${contratoSeleccionado?.contrato}`);
              setReferenciaDeposito("");
              setFechaDeposito("");
              setMostrarModalDeposito(false);
            }} className="flex flex-col gap-4">
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
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Depositar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default gestionContratos;