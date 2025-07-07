import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const ConfirmacionCuota = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);

  // Datos de ejemplo con pagos que incluyen fecha y referencia
  const [solicitudes, setSolicitudes] = useState([
    {
      id: 1,
      solicitante: "Juan Pérez",
      contrato: null,
      estado: "Pendiente",
      pagos: [
        {
          id: 1,
          monto: 100,
          pagado: false,
          recibido: false,
          fecha: "2024-10-01",
          referencia: "REF-001",
        },
      ],
      foto: "https://via.placeholder.com/150",
      detalles: {
        emprendimiento: "Tienda en línea",
        requerimientos: "Inversión en publicidad y desarrollo web",
        datosPersonales: {
          nombre: "Juan Pérez",
          email: "juan.perez@example.com",
          telefono: "123456789",
          direccion: "Calle Falsa 123",
        },
      },
    },
    {
      id: 2,
      solicitante: "María Gómez",
      contrato: "CONTR-1234",
      estado: "Aprobado",
      pagos: [
        {
          id: 1,
          monto: 200,
          pagado: false,
          recibido: false,
          fecha: "2024-10-02",
          referencia: "REF-002",
        },
        {
          id: 2,
          monto: 150,
          pagado: false,
          recibido: false,
          fecha: "2024-10-03",
          referencia: "REF-003",
        },
      ],
      foto: "https://via.placeholder.com/150",
      detalles: {
        emprendimiento: "App móvil",
        requerimientos: "Desarrollo de backend y diseño UI/UX",
        datosPersonales: {
          nombre: "María Gómez",
          email: "maria.gomez@example.com",
          telefono: "987654321",
          direccion: "Avenida Siempre Viva 742",
        },
      },
    },
  ]);

  const [busqueda, setBusqueda] = useState("");

  // Función para mostrar u ocultar el menú
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Función para confirmar pago
  const handleConfirmarPago = (solicitudId, pagoId) => {
    setSolicitudes((prev) =>
      prev.map((s) => {
        if (s.id === solicitudId) {
          const pagosActualizados = s.pagos.map((p) =>
            p.id === pagoId ? { ...p, pagado: true, recibido: true } : p
          );
          // Mostrar mensaje de cuota recibida por 3 segundos
          Swal.fire({
            icon: "success",
            title: "Cuota recibida",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
          return { ...s, pagos: pagosActualizados };
        }
        return s;
      })
    );
  };

  const handleVerDetalles = (s) => {
    // Generar tabla HTML con pagos incluyendo fecha y referencia
    const pagosHtml = s.pagos
      .map(
        (p) => `
        <tr>
          <td class="border px-2 py-1 text-center">$${p.monto}</td>
          <td class="border px-2 py-1 text-center">${p.fecha || '-'}</td>
          <td class="border px-2 py-1 text-center">${p.referencia || '-'}</td>
          <td class="border px-2 py-1 text-center">${p.pagado ? 'Sí' : 'No'}</td>
          <td class="border px-2 py-1 text-center">${p.recibido ? 'Sí' : 'No'}</td>
          <td class="border px-2 py-1 text-center">
            ${p.pagado ? '-' : `<button class="confirmarPago bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded" data-solicitud="${s.id}" data-pago="${p.id}">Confirmar Pago</button>`}
          </td>
        </tr>
      `
      )
      .join("");

    Swal.fire({
      title: `Detalles de ${s.solicitante}`,
      html: `
        <h3 style="margin-top:10px;">Datos Personales</h3>
        <p><strong>Nombre:</strong> ${s.detalles.datosPersonales.nombre}</p>
        <p><strong>Email:</strong> ${s.detalles.datosPersonales.email}</p>
        <p><strong>Teléfono:</strong> ${s.detalles.datosPersonales.telefono}</p>
        <p><strong>Dirección:</strong> ${s.detalles.datosPersonales.direccion}</p>
        <h3 style="margin-top:10px;">Emprendimiento</h3>
        <p><strong>Nombre:</strong> ${s.detalles.emprendimiento}</p>
        <p><strong>Requerimientos:</strong> ${s.detalles.requerimientos}</p>
        <h3 style="margin-top:10px;">Pagos</h3>
        <table class="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th class="border px-2 py-1">Monto</th>
              <th class="border px-2 py-1">Fecha</th>
              <th class="border px-2 py-1">Referencia</th>
              <th class="border px-2 py-1">Pagado</th>
              <th class="border px-2 py-1">Recibido</th>
              <th class="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${pagosHtml}
          </tbody>
        </table>
        <style>
          .confirmarPago:hover {
            background-color: #22c55e;
          }
        </style>
      `,
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      didOpen: () => {
        document.querySelectorAll('.confirmarPago').forEach((btn) => {
          btn.addEventListener('click', () => {
            const solicitudId = parseInt(btn.getAttribute('data-solicitud'));
            const pagoId = parseInt(btn.getAttribute('data-pago'));
            handleConfirmarPago(solicitudId, pagoId);
            Swal.close();
            // Reabrir detalles con datos actualizados
            handleVerDetalles(s);
          });
        });
      },
    });
  };

  // Filtrar solicitudes por búsqueda
  const solicitudesFiltradas = solicitudes.filter((s) =>
    s.solicitante.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-serif">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header toggleMenu={toggleMenu} />

        <div className="pt-20 px-8 max-w-7xl mx-auto">
          {/* Encabezado y buscador */}
          <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
            {/* Icono y título */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-4 rounded-full shadow-lg text-white hover:bg-blue-700 transition">
                <i className="bx bx-group text-3xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestor de Confirmación de Pago de Cuotas
              </h1>
            </div>
            {/* Buscador */}
            <div className="w-64">
              <input
                type="text"
                placeholder="Buscar emprendedor..."
                className="w-full p-3 pl-10 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </header>

          {/* Lista de solicitudes */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {solicitudesFiltradas.length > 0 ? (
              solicitudesFiltradas.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 p-6"
                >
                  {/* Imagen del solicitante */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={s.foto}
                      alt={`Foto de ${s.solicitante}`}
                      className="w-20 h-20 object-cover rounded-full border-4 border-blue-400 shadow-md mx-auto"
                    />
                  </div>
                  {/* Datos del solicitante */}
                  <h2 className="text-xl font-semibold text-center mb-2 text-gray-700">
                    {s.solicitante}
                  </h2>
                  <p className="text-gray-600 mb-1">
                    <strong>Contrato:</strong> {s.contrato ?? "Pendiente"}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Estado:</strong> {s.estado}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <strong>Pago:</strong>{" "}
                    {s.pagos.every((p) => p.pagado) ? (
                      <span className="text-green-500 font-semibold">Pagado</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Pendiente</span>
                    )}
                  </p>
                  {/* Botón para ver detalles */}
                  <div className="flex justify-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
                      onClick={() => handleVerDetalles(s)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500">
                No hay solicitudes que coincidan
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionCuota;