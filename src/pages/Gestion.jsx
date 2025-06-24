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
      title: `Detalles de ${s.cedula}`,
      html: `
        <p><strong>Emprendimiento:</strong> ${s.detalles?.emprendimiento || '-'}</p>
        <p><strong>Requerimientos:</strong> ${s.detalles?.requerimientos || '-'}</p>
        <p><strong>Número de contrato:</strong> ${s.contrato}</p>
        <p><strong>Estado:</strong> ${s.estatus}</p>
        <p><strong>Montos:</strong> € ${s.monto_euros} | Bs ${s.monto_bs}</p>
        <h3>Historial de depósitos</h3>
        <table style="width:100%;border-collapse:collapse;border:1px solid #ccc;font-size:0.8em;">
          <thead>
            <tr>
              <th style="border:1px solid #ccc;padding:4px;">Euros</th>
              <th style="border:1px solid #ccc;padding:4px;">Bs</th>
              <th style="border:1px solid #ccc;padding:4px;">Fecha</th>
              <th style="border:1px solid #ccc;padding:4px;">Referencia</th>
              <th style="border:1px solid #ccc;padding:4px;">Estatus</th>
            </tr>
          </thead>
          <tbody>
            ${personasAprobadas.filter(p => p.cedula === s.cedula).map((dep, index) => `
              <tr key=${index}>
                <td style="border:1px solid #ccc;padding:4px;">${dep.monto_euros}</td>
                <td style="border:1px solid #ccc;padding:4px;">${dep.monto_bs}</td>
                <td style="border:1px solid #ccc;padding:4px;">${dep.fecha_desde} / ${dep.fecha_hasta}</td>
                <td style="border:1px solid #ccc;padding:4px;">${dep.referencia}</td>
                <td style="border:1px solid #ccc;padding:4px;">${dep.estatus}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      `,
      showCancelButton: true,
      confirmButtonText: 'Cerrar',
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
      title: 'Ingresa monto en euros',
      input: 'number',
      inputLabel: 'Monto en euros',
      inputPlaceholder: 'Ejemplo: 100',
      inputAttributes: {
        min: 0,
        step: 0.01,
      },
      showCancelButton: true,
    });
    if (montoStr === undefined) return; // Cancelado
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      Swal.fire('Monto inválido', 'Ingresa un monto válido mayor a cero.', 'error');
      return;
    }

    // Input referencia bancaria
    const { value: referencia } = await Swal.fire({
      title: 'Referencia bancaria (últ 5 dígitos)',
      input: 'text',
      inputPlaceholder: 'Ejemplo: 12345',
      inputAttributes: {
        maxlength: 5,
      },
      showCancelButton: true,
      inputValidator: (value) => {
        if (!/^\d{5}$/.test(value)) {
          return 'Debe tener exactamente 5 dígitos numéricos.';
        }
      },
    });
    if (referencia === undefined) return;

    // Cálculos
    const montoEuros = monto.toFixed(2);
    const montoBs = (monto * tasaEuroBCV).toFixed(2);
    const diezEuros = (monto * 0.1).toFixed(2);
    const montoCancelarEuros = (monto / 18).toFixed(2);
    const montoDevolverEuros = (
      monto -
      montoCancelarEuros -
      (monto * 0.1)
    ).toFixed(2);

    // Confirmar depósito
    const confirmResult = await Swal.fire({
      title: 'Confirmar depósito',
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
      confirmButtonText: 'Depositar',
    });
    if (confirmResult.isConfirmed) {
      // Enviar datos
      const depositoData = {
        cedula_credito: s.cedula,
        referencia,
        monto_euros: montoEuros,
        monto_bs: montoBs,
        diez_euros: diezEuros,
        fecha_desde: fechaDesde.toISOString().slice(0, 10),
        fecha_hasta: fechaHasta ? fechaHasta.toISOString().slice(0, 10) : null,
        estatus: creditoData.estatus,
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
      Swal.fire({ icon: "error", title: "Error", text: "Error al registrar depósito" });
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
            <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">{mensajeExito}</div>
          )}

          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-credit-card text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Gestor de Créditos</h1>
            </div>
          </header>

          {/* Listado de solicitudes */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Solicitudes Aprobadas para Depositar</h2>
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
                      <span>{s.nombre_apellido || s.nombre_completo || s.cedula}</span>
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