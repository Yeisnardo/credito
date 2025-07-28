import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const aprobacion = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);

  // Lista de personas registradas con detalles adicionales
  const personasRegistradas = [
    {
      id: 1,
      cedula: "12345678",
      nombre_completo: "Juan Pérez",
      direccion_actual: "Madrid",
      tipo_sector: "Industria",
      tipo_negocio: "Manufactura",
      motivo: "Solicitud de registro",
      detalles: "Juan Pérez, 30 años, residente en Madrid."
    },
    {
      id: 2,
      cedula: "87654321",
      nombre_completo: "María Gómez",
      direccion_actual: "Barcelona",
      tipo_sector: "Comercio",
      tipo_negocio: "Venta minorista",
      motivo: "Solicitud de permisos",
      detalles: "María Gómez, 25 años, residente en Barcelona."
    },
    {
      id: 3,
      cedula: "11223344",
      nombre_completo: "Luis Rodríguez",
      direccion_actual: "Valencia",
      tipo_sector: "Servicios",
      tipo_negocio: "Consultoría",
      motivo: "Amplificación de negocio",
      detalles: "Luis Rodríguez, 40 años, residente en Valencia."
    },
    {
      id: 4,
      cedula: "44332211",
      nombre_completo: "Ana Martínez",
      direccion_actual: "Sevilla",
      tipo_sector: "Agricultura",
      tipo_negocio: "Finca",
      motivo: "Solicitando permisos especiales",
      detalles: "Ana Martínez, 35 años, residente en Sevilla."
    },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Función para mostrar detalles en Swal
  const verDetalles = (persona) => {
    Swal.fire({
      title: `Detalles de ${persona.nombre_completo}`,
      html: `
        <p><strong>Cédula:</strong> ${persona.cedula}</p>
        <p><strong>Nombre completo:</strong> ${persona.nombre_completo}</p>
        <p><strong>Dirección actual:</strong> ${persona.direccion_actual}</p>
        <p><strong>Tipo de sector:</strong> ${persona.tipo_sector}</p>
        <p><strong>Tipo de negocio:</strong> ${persona.tipo_negocio}</p>
        <p><strong>Motivo:</strong> ${persona.motivo}</p>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      customClass: {
        popup: "rounded-lg shadow-lg",
        title: "text-xl font-semibold text-gray-700",
        content: "text-gray-600",
        confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mt-4"
      }
    });
  };

  // Función para aprobar una persona
  const aprobarPersona = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas aprobar a esta persona?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "rounded-lg shadow-lg",
        confirmButton: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Aprobado!",
          text: "La persona ha sido aprobada.",
          icon: "success",
          customClass: {
            popup: "rounded-lg shadow-lg",
            confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          }
        });
        // Aquí puedes actualizar el estado en backend si quieres
        // También podrías actualizar el estado local para reflejar el cambio
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="p-8 flex-1 overflow-y-auto">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 cursor-pointer">
                <i className="bx bx-check-circle text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Revision y aprobacion</h1>
            </div>
          </div>

          {/* Sección de registros */}
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Personas Registradas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personasRegistradas.map((persona) => (
              <div
                key={persona.id}
                className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{persona.nombre_completo}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Estado:{" "}
                    <span
                      className={`font-semibold ${
                        persona.estado === 'aprobada' ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {persona.estado}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-3 justify-end">
                  {/* Ver detalles */}
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                    onClick={() => verDetalles(persona)}
                  >
                    Ver detalles de solicitud
                  </button>
                  {/* Aprobar */}
                  {persona.estado !== 'aprobada' && (
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                      onClick={() => aprobarPersona(persona.id)}
                    >
                      Aprobar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Pie */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default aprobacion;