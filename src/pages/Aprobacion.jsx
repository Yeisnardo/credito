import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from 'axios';

const Aprobacion = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [perfiles, setPerfiles] = useState([]);
  const [mensajeExito, setMensajeExito] = useState("");
  const [contadorSecuencial, setContadorSecuencial] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const añoActual = new Date().getFullYear().toString().slice(-2);

  // Cargar perfiles desde API y asegurar que todos tengan 'estado'
  useEffect(() => {
    const fetchPerfiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/perfiles');
        const perfilesConEstado = response.data.map(perfil => ({
          ...perfil,
          estado: perfil.estado ?? "Pendiente", // valor por defecto
        }));
        setPerfiles(perfilesConEstado);
      } catch (error) {
        console.error('Error al cargar perfiles:', error);
      }
    };
    fetchPerfiles();
  }, []);

  // Ocultar mensaje de éxito después de 2 segundos
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleVerDetalles = (s) => {
    Swal.fire({
      title: `Detalles de ${s.solicitante}`,
      html: `
        <p><strong>Emprendimiento:</strong> ${s.detalles.emprendimiento}</p>
        <p><strong>Requerimientos:</strong> ${s.detalles.requerimientos}</p>
        <p><strong>Número de contrato:</strong> ${s.contrato ?? "Pendiente"}</p>
        <p><strong>Estado:</strong> ${
          s.estatus === "Pendiente"
            ? '<span style="color:rgb(223, 0, 0);">Pendiente</span>'
            : '<span style="color:rgb(0, 153, 56);">Aprobado</span>'
        }</p>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: "Cerrar",
    });
  };

  const handleAprobarDesdeLista = (s) => {
    Swal.fire({
      title: `¿Aprobar solicitud de ${s.solicitante}?`,
      text: "¿Deseas aprobar esta solicitud y asignar un contrato?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        aprobarSolicitud(s);
      }
    });
  };

  const aprobarSolicitud = (solicitud) => {
    const numeroSecuencial = String(contadorSecuencial).padStart(3, "0");
    const contratoNumero = `IFEMI/CRED-${numeroSecuencial}/${añoActual}`;

    // Actualiza en la interfaz
    setPerfiles((prev) =>
      prev.map((s) =>
        s.id === solicitud.id
          ? { ...s, estado: "Aprobado", contrato: contratoNumero }
          : s
      )
    );

    // Incrementa contador
    setContadorSecuencial(prev => prev + 1);

    // Mostrar mensaje de éxito
    setMensajeExito(`Número de contrato: ${contratoNumero}`);
  };

  // Filtrar perfiles por búsqueda
  const perfilesFiltrados = perfiles.filter((s) =>
    s.solicitante.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        <div className="pt-20 px-8">
          {/* Mensaje de éxito */}
          {mensajeExito && (
            <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
              {mensajeExito}
            </div>
          )}

          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-check-circle text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Aprobación de Solicitud de Crédito
              </h1>
            </div>
          </header>

          {/* Buscador */}
          <div className="mb-6 max-w-4xl mx-auto flex flex-col items-start space-y-2">
            <label
              htmlFor="buscarSolicitante"
              className="text-gray-700 font-semibold"
            >
              Buscar Solicitante
            </label>
            <div className="w-full flex items-center space-x-4">
              <input
                id="buscarSolicitante"
                type="text"
                placeholder="Buscar..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de perfiles */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {perfilesFiltrados.length > 0 ? (
              perfilesFiltrados.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl relative"
                >
                  {/* Icono */}
                  <div className="absolute top-4 right-4 text-gray-400 text-xl">
                    <i className="bx bx-user-circle"></i>
                  </div>
                  {/* Datos */}
                  <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
                    <i className="bx bx-user text-blue-500"></i>
                    <span>{s.solicitante}</span>
                  </h2>
                  <p className="mb-2">
                    <strong>Contrato:</strong> {s.contrato ?? "Pendiente"}
                  </p>
                  <p
                    className={`mb-2 font-semibold ${
                      s.estado === "Pendiente" ? "text-red-600" : "text-green-600"
                    } flex items-center space-x-2`}
                  >
                    <i
                      className={`bx ${
                        s.estado === "Pendiente" ? "bx-time" : "bx-check-circle"
                      }`}
                    ></i>
                    <span>{s.estado}</span>
                  </p>
                  {/* Botón ver detalles */}
                  <button
                    onClick={() => handleVerDetalles(s)}
                    className="mt-auto bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Ver detalles
                  </button>
                  {/* Botón aprobar si pendiente */}
                  {s.estado === "Pendiente" && (
                    <button
                      onClick={() => handleAprobarDesdeLista(s)}
                      className="mt-2 bg-green-500 text-white px-3 py-1 rounded flex items-center space-x-2 hover:bg-green-600 transition"
                    >
                      <i className="bx bx-check"></i>
                      <span>Aprobar</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500 text-lg mt-12 select-none">
                No hay perfiles que coincidan
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Aprobacion;