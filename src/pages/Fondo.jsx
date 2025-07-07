import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import fondoService from "../services/api_fondo"; // ajusta la ruta
import Swal from "sweetalert2";

const InputDerechaIzquierda = ({ valor, setValor, placeholder }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const nuevoValor = e.target.value.replace(/\D/g, ""); // Solo dígitos
    setValor(nuevoValor);
  };

  const valorFormateado = () => {
    if (!valor) return "";
    const num = parseInt(valor, 10);
    if (isNaN(num)) return "";
    return num.toLocaleString("es-VE");
  };

  const handleFocus = () => {
    if (inputRef.current) {
      const length = valorFormateado().length;
      inputRef.current.setSelectionRange(length, length);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={valorFormateado()}
      placeholder={placeholder}
      onChange={handleChange}
      onFocus={handleFocus}
      style={{
        textAlign: "right",
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        width: "100%",
        fontSize: "1rem",
        outline: "none",
      }}
    />
  );
};

const Fondo = () => {
  // Estados
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [fondoCapital, setFondoCapital] = useState(0);
  const [nextId, setNextId] = useState(1);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Cargar fondos desde API al montar
  useEffect(() => {
    const fetchFondos = async () => {
      try {
        const fondos = await fondoService.getFondos();
        if (fondos.length > 0) {
          const registrosDesdeAPI = fondos.map((fondo, index) => ({
            id: fondo.id || index + 1,
            fecha: fondo.fecha || new Date().toLocaleString(),
            tipo_movimiento: fondo.tipo_movimiento || "Ingreso",
            monto: parseFloat(fondo.monto),
            saldo: parseFloat(fondo.saldo),
          }));
          setRegistros(registrosDesdeAPI);
          const saldoTotal = fondos.reduce(
            (acc, f) => acc + parseFloat(f.monto),
            0
          );
          setFondoCapital(saldoTotal);
          setNextId(fondos.length + 1);
        }
      } catch (error) {
        console.error("Error al cargar fondos:", error);
      }
    };
    fetchFondos();
  }, []);

  // Formatear moneda
  const formatearMoneda = (value) => {
    if (value == null || value === "") return "";
    const num = parseFloat(value.toString().replace(/[^0-9.-]+/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Agregar fondo con Swal
  const handleAgregarFondoSwal = async () => {
    const { value: montoStr } = await Swal.fire({
      title: "Agregar Fondo",
      input: "text",
      inputPlaceholder: "Monto a agregar",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || isNaN(parseFloat(value.replace(/\D/g, "")))) {
          return "Por favor ingresa un monto válido";
        }
        return null;
      },
    });

    if (montoStr) {
      const montoNum = parseFloat(montoStr.replace(/\D/g, ""));
      if (isNaN(montoNum) || montoNum <= 0) {
        Swal.fire("Error", "Monto inválido", "error");
        return;
      }

      try {
        // Crear fondo con monto y saldo actualizado
        const data = await fondoService.createFondo({ monto: montoNum });

        // Actualizar la lista local
        const nuevoRegistro = {
          id: data.id,
          fecha: data.fecha,
          tipo_movimiento: data.tipo_movimiento,
          monto: montoNum,
          saldo: parseFloat(data.saldo),
        };

        setRegistros([nuevoRegistro, ...registros]);
        setFondoCapital((prev) => prev + montoNum);
        Swal.fire("Éxito", "Fondo agregado correctamente", "success");
      } catch (error) {
        console.error("Error al agregar fondo:", error);
        Swal.fire("Error", "No se pudo agregar el fondo", "error");
      }
    }
  };

  // Inspeccionar y asignar monto
  const handleInspeccionarSwal = async (registro) => {
    setRegistroSeleccionado(registro);
    const { value: montoStr } = await Swal.fire({
      title: "Detalle del Registro",
      html: `
        <p><strong>ID:</strong> ${registro.id}</p>
        <p><strong>Fecha:</strong> ${registro.fecha}</p>
        <p><strong>Tipo:</strong> ${registro.tipo_movimiento}</p>
        <p><strong>Monto:</strong> ${formatearMoneda(registro.monto)} Bs</p>
        <p><strong>Saldo:</strong> ${formatearMoneda(registro.saldo)} Bs</p>
        <hr/>
        <label>Monto a Asignar:</label>
        <input id="montoAsignar" class="swal2-input" type="number" placeholder="Monto" min="0"/>
      `,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const montoInput = Swal.getPopup().querySelector("#montoAsignar");
        const montoValue = montoInput.value;
        if (
          !montoValue ||
          isNaN(parseFloat(montoValue)) ||
          parseFloat(montoValue) <= 0
        ) {
          Swal.showValidationMessage("Ingresa un monto válido");
          return false;
        }
        return montoValue;
      },
    });

    if (montoStr !== undefined) {
      const monto = parseFloat(montoStr);
      if (fondoCapital < monto) {
        Swal.fire("Error", "Fondo insuficiente", "error");
        return;
      }
      // Actualizar fondos y registros
      setFondoCapital(fondoCapital - monto);
      const nuevosRegistros = registros.map((reg) =>
        reg.id === registroSeleccionado.id
          ? {
              ...reg,
              monto: reg.monto + monto,
              saldo: reg.saldo - monto,
            }
          : reg
      );
      setRegistros(nuevosRegistros);
      Swal.fire("Éxito", "Monto asignado correctamente", "success");
    }
  };

  // Filtrar registros por búsqueda
  const registrosFiltrados = registros.filter((reg) =>
    reg.tipo_movimiento.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {isMenuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col ${
          isMenuOpen ? "ml-0 md:ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

        <main className="pt-20 px-8 flex-1 flex-col">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-money-withdraw text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Fondo de Creditos</h1>
            </div>
          </div>

          {/* Fondo General */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out hover:shadow-xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-3 text-[#07142A]">
                  Fondo General en Bolívares
                </h2>
                <p className="text-gray-700 mb-2">
                  Saldo Disponible: {fondoCapital.toFixed(2)} Bs
                </p>
                <button
                  onClick={handleAgregarFondoSwal}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Agregar Fondo
                </button>
              </div>
            </div>
          </section>

          {/* Buscador */}
          <div className="mb-6 max-w-4xl mx-auto flex items-center space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
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
          </div>

          {/* Tabla de registros */}
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white max-w-4xl mx-auto mb-20">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: "ID", key: "id" },
                    { label: "Fecha", key: "fecha" },
                    { label: "Tipo de Movimiento", key: "tipo_movimiento" },
                    { label: "Monto", key: "monto" },
                    { label: "Saldo", key: "saldo" },
                    { label: "Acciones", key: "acciones" },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      className="px-4 py-3 cursor-pointer select-none text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrosFiltrados.length > 0 ? (
                  registrosFiltrados.map((item) => (
                    <tr key={item.id} className="transition hover:bg-gray-100">
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.id}
                      </td>
                      <td className="px-4 py-3">{item.fecha}</td>
                      <td className="px-4 py-3">{item.tipo_movimiento}</td>
                      <td className="px-4 py-3">
                        {formatearMoneda(item.monto)} Bs
                      </td>
                      <td className="px-4 py-3">
                        {formatearMoneda(item.saldo)} Bs
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleInspeccionarSwal(item)}
                          className="bg-yellow-500 text-white py-1 px-3 rounded"
                        >
                          Inspeccionar
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
        </main>

        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Fondo;
