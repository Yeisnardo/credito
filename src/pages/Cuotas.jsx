import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Cuotas = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Estado de cuotas con campo 'cayo'
  const [cuotas, setCuotas] = useState([
    { id: 1, monto: 100, descripcion: "Cuota 1", pagada: false, cayo: false },
    { id: 2, monto: 200, descripcion: "Cuota 2", pagada: false, cayo: false },
  ]);

  // Estado de semanas
  const [semanas, setSemanas] = useState([
    { semana: 1, oportunidad: 1, pagada: false, cuotaId: 1 },
    { semana: 2, oportunidad: 1, pagada: false, cuotaId: 2 },
    { semana: 3, oportunidad: 2, pagada: false, cuotaId: null },
    { semana: 4, oportunidad: 2, pagada: false, cuotaId: null },
  ]);

  // Estado para gestionar pago
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [referencia, setReferencia] = useState("");
  const [fechaPago, setFechaPago] = useState("");

  // Cargar datos del usuario (simulación)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.getUsers();
        if (response.length > 0) {
          setUser(response[0]);
        }
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };
    fetchUserData();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Función para abrir el proceso de pago (se dispara desde botón)
  const abrirModalPagarCuota = (cuota) => {
    setCuotaSeleccionada(cuota);
    setReferencia("");
    setFechaPago("");
    // Aquí en lugar de abrir modal, llamamos Swal
    Swal.fire({
      title: 'Pagar Cuota',
      html: `
        <p>Cuota: <strong>${cuota.descripcion}</strong></p>
        <p>Monto: <strong>$${cuota.monto}</strong></p>
        <div style="margin-top:10px;">
          <label style="display:block; margin-bottom:5px;">Referencia</label>
          <input id="ref-input" class="swal2-input" placeholder="Referencia" />
        </div>
        <div style="margin-top:10px;">
          <label style="display:block; margin-bottom:5px;">Fecha de Pago</label>
          <input id="date-input" type="date" class="swal2-input"/>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Pagar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const ref = Swal.getPopup().querySelector('#ref-input').value;
        const date = Swal.getPopup().querySelector('#date-input').value;
        if (!ref || !date) {
          Swal.showValidationMessage('Por favor ingresa referencia y fecha de pago');
        }
        return { referencia: ref, fechaPago: date };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Procesar pago
        setReferencia(result.value.referencia);
        setFechaPago(result.value.fechaPago);
        procesarPago();
      }
    });
  };

  const procesarPago = () => {
    if (referencia && fechaPago && cuotaSeleccionada) {
      Swal.fire({
        title: '¿Confirma la acción?',
        text: `¿Desea marcar la cuota "${cuotaSeleccionada.descripcion}" como pagada?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#166534',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, pagar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          // Actualizar cuotas
          setCuotas((prev) =>
            prev.map((c) =>
              c.id === cuotaSeleccionada.id ? { ...c, pagada: true } : c
            )
          );
          // Actualizar semanas relacionadas
          setSemanas((prev) =>
            prev.map((s) =>
              s.cuotaId === cuotaSeleccionada.id ? { ...s, pagada: true } : s
            )
          );
          Swal.fire({
            icon: 'success',
            title: '¡Pagado!',
            text: 'La cuota ha sido marcada como pagada.',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    }
  };

  // Confirmar "Cayo"
  const confirmarCayo = (id) => {
    setCuotas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, cayo: true } : c))
    );
  };

  const semanasNoPagadas = semanas.filter((s) => !s.pagada);
  const saldoRestante = cuotas
    .filter((c) => !c.pagada)
    .reduce((acc, c) => acc + c.monto, 0);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-serif overflow-hidden">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <div className="p-8 pt-24 w-full mx-auto">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 ">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-folder-open text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Reporte de Cuota</h1>
            </div>
          </div>

          {/* Tarjeta de cuotas */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 text-[#374151]">
              Listado de Cuotas
            </h2>
            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-md">
                <thead className="bg-[#F9FAFB] rounded-t-lg">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#374151] uppercase tracking-wider border-b border-gray-200 rounded-tl-lg">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#374151] uppercase tracking-wider border-b border-gray-200">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#374151] uppercase tracking-wider border-b border-gray-200">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#374151] uppercase tracking-wider border-b border-gray-200">
                      Pagada
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#374151] uppercase tracking-wider border-b border-gray-200 rounded-tr-lg">
                      Confirmación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cuotas.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 border-b border-gray-200">{c.id}</td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        ${c.monto}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        {c.descripcion}
                      </td>
                      {/* Estado Pagada */}
                      <td className="px-4 py-3 border-b border-gray-200">
                        {!c.pagada ? (
                          <button
                            className="bg-[#111827] hover:bg-[#111827]/90 text-white px-3 py-1 rounded-full shadow-md text-sm transition-transform hover:scale-105"
                            onClick={() => abrirModalPagarCuota(c)}
                          >
                            Pagar
                          </button>
                        ) : (
                          <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full shadow-sm transition hover:bg-green-200 cursor-default">
                            Pagada
                          </span>
                        )}
                      </td>
                      {/* Estado "Cayó" */}
                      <td className="px-4 py-3 border-b border-gray-200 text-center cursor-pointer">
                        {c.cayo ? (
                          <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full shadow-sm transition cursor-default">
                            Confirmado
                          </span>
                        ) : (
                          <span
                            className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 border border-red-200 rounded-full shadow-sm transition cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmarCayo(c.id);
                            }}
                          >
                            En espera
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Secciones adicionales */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Semanas no pagadas */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-[#374151]">
                Semanas no pagadas
              </h3>
              {semanasNoPagadas.length === 0 ? (
                <p className="text-green-600 font-semibold">
                  ¡Todas las semanas están pagadas!
                </p>
              ) : (
                <ul className="list-disc list-inside text-[#374151]">
                  {semanasNoPagadas.map((s, index) => (
                    <li key={index}>
                      Semana {s.semana} - Oportunidad {s.oportunidad}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Resumen y saldo */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-[#374151]">
                Resumen de Cuotas
              </h3>
              <ul className="mb-4">
                {cuotas.map((c) => (
                  <li key={c.id} className="mb-2">
                    <span className="font-semibold">{c.descripcion}:</span>{" "}
                    Monto ${c.monto} - Estado: {c.pagada ? "Pagada" : "Pendiente"}
                  </li>
                ))}
              </ul>
              <p className="text-lg font-semibold text-[#1F2937]">
                Saldo restante:{" "}
                <span className="text-red-600">${saldoRestante}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-[#F9FAFB] border-t border-gray-300 text-center text-[#4B5563] text-sm">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Cuotas;