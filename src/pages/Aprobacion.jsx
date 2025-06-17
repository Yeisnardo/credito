import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_aprobacion"; // Ruta correcta

const Aprobacion = () => {
  const navigate = useNavigate();

  // Estado y referencias
  const [menuOpen, setMenuOpen] = useState(true);
  const [perfiles, setPerfiles] = useState([]);
  const [mensajeExito, setMensajeExito] = useState("");
  const [contadorSecuencial, setContadorSecuencial] = useState(1);
  const secuencialRef = useRef(contadorSecuencial); // referencia para mantener el valor en tiempo real
  const [busqueda, setBusqueda] = useState("");
  const [motivoFiltro, setMotivoFiltro] = useState("");
  const [activarFiltroMotivo, setActivarFiltroMotivo] = useState(false);

  // Estado para el formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cedulaFormulario, setCedulaFormulario] = useState("");
  const [contratoFormulario, setContratoFormulario] = useState("");
  const [fechaFormulario, setFechaFormulario] = useState("");

  const añoActual = new Date().getFullYear().toString().slice(-2);

  // Sincronizar la ref con el estado del contador
  useEffect(() => {
    secuencialRef.current = contadorSecuencial;
  }, [contadorSecuencial]);

  // Cargar perfiles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarios = await api.getAprobaciones();
        console.log("Usuarios cargados:", usuarios);
        const perfilesConestatus_solicitud = Array.isArray(usuarios)
          ? usuarios.map((p) => ({ ...p, estatus_solicitud: p.estatus_solicitud || "Pendiente" }))
          : [];
        setPerfiles(perfilesConestatus_solicitud);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar la lista de usuarios.",
          icon: "error",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    };
    fetchData();
  }, []);

  // Limpieza del mensaje de éxito
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Funciones para abrir/cerrar formulario
  const handleAbrirFormulario = () => {
    setCedulaFormulario("");
    setContratoFormulario("");
    setFechaFormulario("");
    setMostrarFormulario(true);
  };
  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
  };

  // Enviar datos del formulario
  const handleEnviarFormulario = async () => {
    if (!cedulaFormulario || !contratoFormulario || !fechaFormulario) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos",
        text: "Por favor completa todos los campos.",
      });
      return;
    }
    try {
      await api.enviarAprobacion({
        cedula_aprobacion: cedulaFormulario,
        contrato: contratoFormulario,
        fecha_aprobacion: fechaFormulario,
        estatus_solicitud: "Pendiente",
      });
      // Actualizar lista local
      setPerfiles((prev) =>
        prev.map((p) =>
          p.cedula === cedulaFormulario
            ? {
                ...p,
                estatus_solicitud: "Pendiente",
                contrato: contratoFormulario,
                fecha_aprobacion: fechaFormulario,
              }
            : p
        )
      );
      setMensajeExito(`Aprobación registrada para cédula ${cedulaFormulario}`);
      handleCerrarFormulario();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la aprobación.",
      });
    }
  };

  // Función para mostrar detalles
  const handleVerDetalles = (s) => {
    Swal.fire({
      title: `Detalles de ${s.nombre_completo}`,
      html: `
        <h3>Información Personal</h3>
        <p><strong>Nombre:</strong> ${s.nombre_completo}</p>
        <p><strong>Cédula:</strong> ${s.cedula}</p>
        <p><strong>Edad:</strong> ${s.edad}</p>
        <p><strong>Teléfono:</strong> ${s.telefono}</p>
        <p><strong>Email:</strong> ${s.email}</p>
        <p><strong>Estado:</strong> ${s.estado}</p>
        <p><strong>Municipio:</strong> ${s.municipio}</p>
        <p><strong>Dirección:</strong> ${s.direccion_actual}</p>
        <hr/>
        <h3>Solicitud</h3>
        <p><strong>Motivo:</strong> ${s.motivo}</p>
        <p><strong>estatus_solicitud:</strong> ${s.estatus_solicitud}</p>
        <hr/>
        <h3>Emprendimiento</h3>
        <p><strong>Nombre:</strong> ${s.nombre_emprendimiento}</p>
        <p><strong>Sector:</strong> ${s.tipo_sector}</p>
        <p><strong>Tipo Negocio:</strong> ${s.tipo_negocio}</p>
        <p><strong>Consejo:</strong> ${s.consejo_nombre}</p>
        <p><strong>Comuna:</strong> ${s.comuna}</p>
        <p><strong>Dirección:</strong> ${s.direccion_emprendimiento}</p>
        <hr/>
        <h3>Requerimientos</h3>
        <p><strong>Fecha:</strong> ${s.fecha_aprobacion}</p>
        <p><strong>Número de contrato:</strong> ${s.contrato_aprobacion}</p>
        <p><strong>estatus_solicitud:</strong> ${
          s.estatus_solicitud === "hola"
            ? '<span style="color:rgb(223, 0, 0);">Pendiente</span>'
            : '<span style="color:rgb(0, 153, 56);">Aprobado</span>'
        }</p>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: "Cerrar",
    });
  };

  // Función para aprobar desde lista
  const handleAprobarDesdeLista = (s) => {
    Swal.fire({
      title: `¿Aprobar solicitud de ${s.nombre_completo}?`,
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

  // Función para aprobar solicitud
  const aprobarSolicitud = async (s) => {
    // Incrementar en la ref y actualizar estado
    secuencialRef.current += 1;
    setContadorSecuencial(secuencialRef.current);

    const numeroSecuencial = String(secuencialRef.current).padStart(3, "0");
    const contratoNumero = `IFEMI/CRED-${numeroSecuencial}/${añoActual}`;
    const fechaActual = new Date().toISOString().slice(0, 10);

    // Actualizar en lista local
    setPerfiles((prev) =>
      prev.map((p) =>
        p.cedula === s.cedula
          ? {
              ...p,
              estatus_solicitud: "Aprobado",
              contrato: contratoNumero,
              fecha_aprobacion: fechaActual,
            }
          : p
      )
    );

    setMensajeExito(`Número de contrato: ${contratoNumero}`);

    // Enviar a API
    try {
      await api.enviarAprobacion({
        cedula_aprobacion: s.cedula,
        contrato: contratoNumero,
        fecha_aprobacion: fechaActual,
        estatus_solicitud: "Aprobado",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar la aprobación a la API.",
      });
    }
  };

  // Filtrar perfiles
  const perfilesFiltrados = perfiles.filter((s) => {
    if (s.estatus_solicitud === "Aprobado") return false;
    const coincideBusqueda = s.nombre_completo
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideMotivo = activarFiltroMotivo
      ? s.motivo === motivoFiltro
      : true;
    return coincideBusqueda && coincideMotivo;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleMenu={toggleMenu} />

        {/* Botón para abrir formulario */}
        <div className="px-8 mb-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleAbrirFormulario}
          >
            Registrar Aprobación
          </button>
        </div>

        {/* Formulario modal */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
              <h2 className="text-xl font-semibold mb-4">Registrar Aprobación</h2>
              <div>
                <label className="block mb-1 font-medium">Cédula</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={cedulaFormulario}
                  onChange={(e) => setCedulaFormulario(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Contrato</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={contratoFormulario}
                  onChange={(e) => setContratoFormulario(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Fecha de Aprobación
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={fechaFormulario}
                  onChange={(e) => setFechaFormulario(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={handleCerrarFormulario}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleEnviarFormulario}
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="pt-20 px-8">
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
              htmlFor="buscarnombre_completo"
              className="text-gray-700 font-semibold"
            >
              Buscar nombre completo
            </label>
            <div className="w-full flex items-center space-x-4">
              <input
                id="buscarnombre_completo"
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
                    <span>{s.nombre_completo}</span>
                  </h2>
                  <p className="mb-2">
                    <strong>Contrato:</strong> {s.contrato_aprobacion ?? "Pendiente"}
                  </p>
                  <p
                    className={`mb-2 font-semibold ${
                      s.estatus === "Pendiente"
                        ? "text-red-600"
                        : "text-green-600"
                    } flex items-center space-x-2`}
                  >
                    <i
                      className={`bx ${
                        s.estatus_solicitud === "Pendiente"
                          ? "bx-time"
                          : "bx-check-circle"
                      }`}
                    ></i>
                    <span>{s.estatus_solicitud}</span>
                  </p>
                  {/* Botón detalles */}
                  <button
                    onClick={() => handleVerDetalles(s)}
                    className="mt-auto bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Ver detalles
                  </button>
                  {/* Botón aprobar si pendiente */}
                  {s.estatus === "Pendiente" && (
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