import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { getCreditos, crearCredito } from "../services/api_credito";

const Gestion = () => {
  const navigate = useNavigate();

  // Estados principales
  const [menuOpen, setMenuOpen] = useState(true);
  const [personasAprobadas, setPersonasAprobadas] = useState([]);
  const [mensajeExito, setMensajeExito] = useState("");

  const tasaEuroBCV = 104.51;
  const [fechaDesde, setFechaDesde] = useState(new Date()); // Fecha inicio
  const [fechaHasta, setFechaHasta] = useState(null); // Fecha fin (18 semanas después)

  const [creditoData, setCreditoData] = useState({
    aprobacion_id: null,
    cedula_credito: "",
    referencia: "",
    monto_euros: "",
    monto_bs: "",
    diez_euros: "",
    fecha_desde: "",
    fecha_hasta: "",
    contrato: "",
    estatus: "Pendiente",
    detalles: {
      emprendimiento: "",
      requerimientos: "",
    },
  });

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  // Cargar créditos al inicio
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCreditos = await getCreditos();
        setPersonasAprobadas(dataCreditos);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // Filtrar solicitudes únicas por cédula
  const solicitudesPorCedula = personasAprobadas.reduce((acc, solicitud) => {
    if (!acc[solicitud.cedula]) {
      acc[solicitud.cedula] = solicitud;
    }
    return acc;
  }, {});
  const solicitudesUnicas = Object.values(solicitudesPorCedula);

  // Función para mostrar detalles con Swal
  const handleVerDetalles = (s) => {
    Swal.fire({
      title: `${s.nombre_apellido}`,
      html: `
      <div class="font-serif text-sm text-gray-800 space-y-4">
        <div>
          <p class="mb-2"><strong>Número de contrato:</strong> ${s.contrato}</p>
          <p class="mb-2"><strong>Estado:</strong> ${s.estatus}</p>
        </div>
        <h3 class="font-semibold text-lg mb-3 border-b border-gray-300 pb-2">Historial de depósitos</h3>
        <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table class="min-w-full divide-y divide-gray-200 table-auto">
            <thead class="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
              <tr>
                <th class="px-4 py-2 border-b border-gray-200">Euros</th>
                <th class="px-4 py-2 border-b border-gray-200">Bs</th>
                <th class="px-4 py-2 border-b border-gray-200">Fecha</th>
                <th class="px-4 py-2 border-b border-gray-200">Referencia</th>
                <th class="px-4 py-2 border-b border-gray-200">Estatus</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 text-sm text-gray-800">
              ${personasAprobadas
                .filter((p) => p.cedula === s.cedula)
                .map(
                  (dep, index) => `
                <tr class="${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition">
                  <td class="px-4 py-2 border-b border-gray-200 text-center">${
                    dep.monto_euros
                  }</td>
                  <td class="px-4 py-2 border-b border-gray-200 text-center">${
                    dep.monto_bs
                  }</td>
                  <td class="px-4 py-2 border-b border-gray-200 text-center">${
                    dep.fecha_desde
                  } / ${dep.fecha_hasta}</td>
                  <td class="px-4 py-2 border-b border-gray-200 text-center">${
                    dep.referencia
                  }</td>
                  <td class="px-4 py-2 border-b border-gray-200 text-center">${
                    dep.estatus
                  }</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Cerrar",
      customClass: {
        popup: "max-w-4xl p-6 rounded-lg shadow-lg",
      },
    });
  };

  // Función para depositar con Swal y cálculos
  const handleDepositarSwal = async (s) => {
    setSolicitudSeleccionada(s);
    // Setear fechas
    setFechaDesde(new Date());
    const fechaH = new Date();
    fechaH.setDate(fechaH.getDate() + 18 * 7); // 18 semanas
    setFechaHasta(fechaH);

    // Input monto en euros
    const { value: montoStr } = await Swal.fire({
      title: "Ingresa monto en euros",
      input: "number",
      inputLabel: "Monto en euros",
      inputPlaceholder: "Ejemplo: 100",
      inputAttributes: {
        min: 0,
        step: 0.01,
      },
      showCancelButton: true,
    });
    if (montoStr === undefined) return; // Cancelado
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      Swal.fire(
        "Monto inválido",
        "Ingresa un monto válido mayor a cero.",
        "error"
      );
      return;
    }

    // Input referencia bancaria
    const { value: referencia } = await Swal.fire({
      title: "Referencia bancaria (últ 5 dígitos)",
      input: "text",
      inputPlaceholder: "Ejemplo: 12345",
      inputAttributes: {
        maxlength: 5,
      },
      showCancelButton: true,
      inputValidator: (value) => {
        if (!/^\d{5}$/.test(value)) {
          return "Debe tener exactamente 5 dígitos numéricos.";
        }
      },
    });
    if (referencia === undefined) return;

    // Cálculos
    const montoEuros = monto.toFixed(2);
const montoBs = (monto * tasaEuroBCV).toFixed(2);
const diezEuros = (monto * 0.1).toFixed(2);

// Convertir cadenas a números antes de sumar
const montoEurosNum = parseFloat(montoEuros);
const diezEurosNum = parseFloat(diezEuros);

// Sumar para obtener montoDevolverEuros
const montoDevolverEuros = (montoEurosNum + diezEurosNum).toFixed(2);

// Dividir montoDevolverEuros entre 18
const montoCancelarEuros = (parseFloat(montoDevolverEuros) / 18).toFixed(2);

    // Confirmar depósito
    const confirmResult = await Swal.fire({
      title: "Confirmar depósito",
      html: `
        <p>Montos a depositar:</p>
        <ul style="list-style:none;padding:0;">
          <li>Euros: € ${montoEuros}</li>
          <li>Bs: Bs ${montoBs}</li>
        </ul>
        <p><strong>Fecha Desde:</strong> ${fechaDesde.toLocaleDateString()}</p>
        <p><strong>Fecha Hasta (18 semanas):</strong> ${fechaHasta.toLocaleDateString()}</p>
        <p><strong>Referencia:</strong> ${referencia}</p>
        <p><strong>Calculos:</strong></p>
        <ul style="list-style:none;padding:0;">
          <li>Euros / 18: € ${montoCancelarEuros}</li>
          <li>10% del monto: € ${(monto * 0.1).toFixed(2)}</li>
          <li>Monto a devolver: € ${montoDevolverEuros}</li>
        </ul>
      `,
      showCancelButton: true,
      confirmButtonText: "Depositar",
    });
    if (confirmResult.isConfirmed) {
      // Enviar datos
      // Dentro de handleDepositarSwal, justo antes de llamar a enviarDeposito
      const depositoData = {
        cedula_credito: s.cedula,
        referencia,
        monto_euros: montoEuros,
        monto_bs: montoBs,
        diez_euros: diezEuros,
        fecha_desde: fechaDesde.toISOString().slice(0, 10),
        fecha_hasta: fechaHasta ? fechaHasta.toISOString().slice(0, 10) : null,
        estatus: creditoData.estatus,
        cuota: montoDevolverEuros,
      };

      await enviarDeposito(depositoData);
      setMensajeExito(`Has depositado ${montoEuros} € (Bs.${montoBs})`);
    }
  };

  // Función para enviar a la API
  const enviarDeposito = async (depositoData) => {
    try {
      await crearCredito(depositoData);
      Swal.fire({ icon: "success", title: "Depósito registrado" });
    } catch (err) {
      console.error("Error en crearCredito:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al registrar depósito",
      });
    }
  };

  // Función para abrir la operación de depósito
  const handleAbrirDeposito = async (s) => {
    await handleDepositarSwal(s);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

        <div className="pt-20 px-8">
          {/* Mensaje de éxito */}
          {mensajeExito && (
            <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
              {mensajeExito}
            </div>
          )}

          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-credit-card text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Asignacion de Contrato</h1>
            </div>
          </div>

          {/* Listado de solicitudes */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Solicitudes Aprobadas para Depositar
            </h2>
            {personasAprobadas.length === 0 ? (
              <p>No hay solicitudes aprobadas aún.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {solicitudesUnicas.map((s) => (
                  <div
                    key={s.cedula}
                    className="bg-white p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl relative"
                  >
                    {/* Icono */}
                    <div className="absolute top-4 right-4 text-gray-400 text-xl">
                      <i className="bx bx-user-circle"></i>
                    </div>
                    {/* Datos */}
                    <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
                      <i className="bx bx-user text-blue-500"></i>
                      <span>
                        {s.nombre_apellido || s.nombre_completo || s.cedula}
                      </span>
                    </h2>
                    <p className="mb-2">
                      <strong>Contrato:</strong> {s.contrato}
                    </p>
                    {/* Botones */}
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded flex items-center space-x-2 hover:bg-blue-600 transition"
                        onClick={() => handleVerDetalles(s)}
                      >
                        <i className="bx bx-show"></i>
                        <span>Ver detalles</span>
                      </button>
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded flex items-center space-x-2 hover:bg-green-600 transition"
                        onClick={() => handleAbrirDeposito(s)}
                      >
                        <i className="bx bx-dollar-circle"></i>
                        <span>Depositar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Gestion;
